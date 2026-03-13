# Guia de Cliente HTTP y Capa de API

> Arquitectura, patrones y convenciones para consumir la API REST de `kontrola-net` desde la SPA Vue 3.

---

## 1. Arquitectura HTTP

Toda comunicacion con la API sigue un flujo de capas estricto. Ningun componente accede directamente a Axios ni al cliente generado.

```
Componente Vue
    ↓  usa composable
useRecruitmentApi (composable)
    ↓  llama funciones generadas
src/api/generated/ (cliente OpenAPI)
    ↓  usa instancia configurada
src/api/client.ts (instancia Axios)
    ↓  interceptors
JWT Auth + Error Handler + Retry
    ↓
API REST (.NET — kontrola-net)
```

### Regla de oro

Los componentes **nunca** importan `axios` ni `fetch` directamente. Siempre consumen un composable que delega al cliente generado.

```typescript
// ❌ Prohibido en cualquier componente
import axios from 'axios'
const { data } = await axios.get('/api/candidates')

// ✅ Correcto
const { getCandidates, loading } = useRecruitmentApi()
const candidates = await getCandidates(filters)
```

---

## 2. Instancia Axios (`src/api/client.ts`)

La instancia central se configura una sola vez. Todos los servicios generados la utilizan.

```typescript
// src/api/client.ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import * as Sentry from '@sentry/vue'
import { useAuthStore } from '@/stores/auth'
import { parseApiError } from './errors'

// Cola para serializar refresco de token concurrente
let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null): void {
  refreshQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  refreshQueue = []
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Interceptor de request: adjunta Bearer token desde el store de auth
apiClient.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

// Interceptor de response: manejo centralizado de errores y refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    // 401 — intentar refresh de token una sola vez
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Encolar requests concurrentes mientras se refresca
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              originalRequest.headers!['Authorization'] = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const auth = useAuthStore()
        // El refresh token viaja como HttpOnly cookie — no se pasa en el body
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        )
        auth.setAccessToken(data.accessToken)
        processQueue(null, data.accessToken)
        originalRequest.headers!['Authorization'] = `Bearer ${data.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        const auth = useAuthStore()
        auth.logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 400 — Bad Request: parsear como ProblemDetails
    if (status === 400) {
      return Promise.reject(parseApiError(error.response?.data))
    }

    // 422 — Validation: mapear errores a campos del formulario
    if (status === 422) {
      const problem = parseApiError(error.response?.data)
      return Promise.reject(problem)
    }

    // 500+ — Error de servidor: capturar en Sentry
    if (status && status >= 500) {
      Sentry.captureException(error, {
        extra: {
          url: originalRequest.url,
          status,
          traceId: error.response?.data?.traceId,
        },
      })
      return Promise.reject(parseApiError(error.response?.data))
    }

    return Promise.reject(error)
  },
)
```

### Variable de entorno requerida

```bash
# .env
VITE_API_BASE_URL=https://api.kontrola.com.mx/api/v1
```

---

## 3. Cliente Generado (OpenAPI)

El contrato entre frontend y backend es el spec OpenAPI publicado por `kontrola-net`. No se escribe codigo de integracion a mano.

### Flujo de generacion

```bash
# 1. El backend publica el spec en:
#    GET /swagger/v1/swagger.json

# 2. Generar el cliente (se ejecuta en CI o manualmente)
bun run api:generate

# Internamente ejecuta algo como:
# bunx openapi-typescript-codegen \
#   --input https://api.kontrola.com.mx/swagger/v1/swagger.json \
#   --output src/api/generated \
#   --client axios \
#   --useOptions \
#   --useUnionTypes
```

### Estructura generada

```
src/api/generated/               ← gitignored, nunca editar manualmente
├── index.ts                     ← re-exporta todo
├── core/
│   ├── ApiError.ts
│   ├── OpenAPI.ts               ← configura baseURL e interceptors
│   └── request.ts               ← usa src/api/client.ts como transporte
├── models/
│   ├── CandidateDto.ts
│   ├── CreateCandidateCommand.ts
│   ├── UpdateCandidateCommand.ts
│   ├── PaginatedResult.ts
│   ├── ProblemDetails.ts
│   ├── JobProfileDto.ts
│   └── ApplicationDto.ts
└── services/
    ├── CandidatesService.ts
    ├── JobProfilesService.ts
    ├── ApplicationsService.ts
    ├── DocumentsService.ts
    └── AuthService.ts
```

El archivo `src/api/generated/` esta en `.gitignore`. Siempre se regenera desde el spec, nunca se edita a mano.

### Configurar la instancia generada

```typescript
// src/api/setup.ts — ejecutar una vez en main.ts
import { OpenAPI } from '@/api/generated'
import { apiClient } from './client'

// Inyectar la instancia Axios configurada con interceptors
OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL
OpenAPI.WITH_CREDENTIALS = true
// El request.ts generado debe usar apiClient como transporte
```

---

## 3.1. Client-Generated IDs (UUIDv7)

Todas las creaciones de recursos usan **PUT** con un ID generado por el frontend. Esto garantiza idempotencia natural (reintentar el mismo PUT es seguro) y habilita optimistic UI.

### Generador UUIDv7 (SQL Server optimized)

```typescript
// src/utils/uuid.ts

/**
 * Genera un UUIDv7 con byte-order optimizado para SQL Server.
 *
 * SQL Server ordena `uniqueidentifier` por bytes [10-15, 8-9, 6-7, 4-5, 0-3].
 * Colocamos el timestamp en bytes 10-15 para que el clustered index sea secuencial.
 */
export function generateId(): string {
  const now = Date.now()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // Timestamp en bytes 10-15 (donde SQL Server ordena primero)
  bytes[10] = (now / 2 ** 40) & 0xff
  bytes[11] = (now / 2 ** 32) & 0xff
  bytes[12] = (now / 2 ** 24) & 0xff
  bytes[13] = (now / 2 ** 16) & 0xff
  bytes[14] = (now / 2 ** 8) & 0xff
  bytes[15] = now & 0xff

  // UUIDv7 version (bits 48-51) y variant 2 (bits 64-65)
  bytes[6] = (bytes[6] & 0x0f) | 0x70
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
```

### Uso en composables

```typescript
import { generateId } from '@/utils/uuid'

// Crear recurso con PUT (idempotente)
async function createCandidate(data: CandidateForm): Promise<CandidateDto> {
  const id = generateId()
  loading.value = true
  try {
    // PUT /api/v1/recruitment/candidates/{id}
    const response = await CandidatesService.upsert({ id, requestBody: data })
    return response
  } finally {
    loading.value = false
  }
}
```

### Uso en componentes (optimistic UI)

```vue
<script setup lang="ts">
import { generateId } from '@/utils/uuid'

async function submit() {
  const id = generateId()

  // Optimistic: agregar a la lista antes de confirmación del server
  candidates.value.push({ id, ...form.value, _pending: true })

  try {
    await createCandidate(id, form.value)
    // Actualizar con datos del server (timestamps, etc.)
  } catch {
    // Rollback optimistic update
    candidates.value = candidates.value.filter((c) => c.id !== id)
  }
}
</script>
```

### Reglas

| Regla | Descripción |
|---|---|
| Siempre usar `generateId()` | Nunca `crypto.randomUUID()` (v4 fragmenta SQL Server) |
| ID en URL, no en body | `PUT /candidates/{id}` — body contiene solo campos |
| Retry seguro | Si el request falla, reenviar con el MISMO ID es seguro |
| 201 vs 200 | Server retorna 201 si creó, 200 si actualizó |

---

## 4. Composables de API

Cada dominio tiene su composable que envuelve los servicios generados. El composable expone estado reactivo (`loading`, `error`) y funciones tipadas.

```typescript
// src/composables/api/useRecruitmentApi.ts
import { ref } from 'vue'
import { CandidatesService, ApplicationsService } from '@/api/generated'
import type {
  CandidateDto,
  CreateCandidateCommand,
  PaginatedResult,
} from '@/api/generated/models'
import type { ApiError } from '@/api/errors'

export interface CandidateFilters {
  search?: string
  stage?: string
  page?: number
  perPage?: number
}

export function useRecruitmentApi() {
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function getCandidates(
    params: CandidateFilters,
  ): Promise<PaginatedResult<CandidateDto>> {
    loading.value = true
    error.value = null
    try {
      return await CandidatesService.getAll(params)
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  async function getCandidate(uuid: string): Promise<CandidateDto> {
    loading.value = true
    error.value = null
    try {
      return await CandidatesService.getByUuid({ uuid })
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createCandidate(
    command: CreateCandidateCommand,
  ): Promise<CandidateDto> {
    loading.value = true
    error.value = null
    try {
      return await CandidatesService.create({ requestBody: command })
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    getCandidates,
    getCandidate,
    createCandidate,
    loading,
    error,
  }
}
```

### Uso en un Feature component

```typescript
// src/pages/Recruitment/_components/CandidateList.vue
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import { useNotify } from '@/composables/useNotify'

const { getCandidates, loading } = useRecruitmentApi()
const notify = useNotify()

async function fetchCandidates() {
  try {
    const result = await getCandidates(filters.value)
    candidates.value = result.items
    total.value = result.totalCount
  } catch {
    notify.error('Error al cargar candidatos')
  }
}
```

---

## 5. Tipado de Errores (RFC 9457 Problem Details)

La API devuelve errores en formato [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457). El interceptor los parsea antes de llegar al composable.

### Interfaz base

```typescript
// src/api/errors.ts

export interface ProblemDetails {
  type: string           // URI que identifica el tipo de error
  title: string          // Descripcion breve legible para humanos
  status: number         // Codigo HTTP
  detail?: string        // Explicacion especifica de esta ocurrencia
  instance?: string      // URI de la instancia que genero el error
  errors?: Record<string, string[]>  // Errores de validacion por campo
  traceId?: string       // ID de correlacion para soporte
}

export interface ApiError extends ProblemDetails {
  fieldErrors: Record<string, string>  // Mapeado para uso directo en formularios
}

export function parseApiError(data: unknown): ApiError {
  const problem = (data ?? {}) as Partial<ProblemDetails>

  // Aplanar arrays de mensajes a un solo string por campo
  const fieldErrors: Record<string, string> = {}
  if (problem.errors) {
    for (const [field, messages] of Object.entries(problem.errors)) {
      // Convertir PascalCase del servidor a camelCase del frontend
      const camelField = field.charAt(0).toLowerCase() + field.slice(1)
      fieldErrors[camelField] = messages[0] ?? ''
    }
  }

  return {
    type: problem.type ?? 'about:blank',
    title: problem.title ?? 'Error desconocido',
    status: problem.status ?? 0,
    detail: problem.detail,
    instance: problem.instance,
    errors: problem.errors,
    traceId: problem.traceId,
    fieldErrors,
  }
}
```

### Mapear errores a campos de formulario

```typescript
// En un Feature component con formulario
const errors = ref<Record<string, string>>({})

async function submit() {
  try {
    await createCandidate(form.value)
    notify.success('Candidato creado')
    emit('update:visible', false)
  } catch (e) {
    const apiError = e as ApiError

    if (apiError.status === 422 || apiError.status === 400) {
      // Los fieldErrors ya estan en camelCase — asignar directo al formulario
      errors.value = apiError.fieldErrors
    } else {
      notify.error(apiError.title, apiError.detail)
    }
  }
}
```

### Manejo de codigos de error especificos

El campo `type` de ProblemDetails identifica la clase de error. Usar para mensajes contextualizados:

```typescript
// src/api/errors.ts
export const ErrorTypes = {
  AUTH_INVALID_CREDENTIALS: 'https://kontrola.com.mx/errors/auth/invalid-credentials',
  AUTH_ACCOUNT_LOCKED: 'https://kontrola.com.mx/errors/auth/account-locked',
  USER_DUPLICATE_EMAIL: 'https://kontrola.com.mx/errors/user/duplicate-email',
  CANDIDATE_DUPLICATE_EMAIL: 'https://kontrola.com.mx/errors/candidate/duplicate-email',
  RESOURCE_NOT_FOUND: 'https://kontrola.com.mx/errors/resource/not-found',
  FORBIDDEN: 'https://kontrola.com.mx/errors/authorization/forbidden',
} as const

export function getErrorMessage(error: ApiError): string {
  const messages: Record<string, string> = {
    [ErrorTypes.AUTH_INVALID_CREDENTIALS]: 'Correo o contraseña incorrectos.',
    [ErrorTypes.AUTH_ACCOUNT_LOCKED]: 'Tu cuenta ha sido bloqueada temporalmente.',
    [ErrorTypes.USER_DUPLICATE_EMAIL]: 'Ya existe un usuario con ese correo electronico.',
    [ErrorTypes.CANDIDATE_DUPLICATE_EMAIL]: 'Ya existe un candidato con ese correo.',
    [ErrorTypes.RESOURCE_NOT_FOUND]: 'El recurso no fue encontrado.',
    [ErrorTypes.FORBIDDEN]: 'No tienes permisos para realizar esta accion.',
  }
  return messages[error.type] ?? error.detail ?? error.title
}
```

---

## 6. Anti-patrones HTTP

| ❌ Anti-patron | ✅ Correcto |
|----------------|-------------|
| `fetch('/api/candidates')` en componente | `const { getCandidates } = useRecruitmentApi()` |
| `import axios from 'axios'` en componente | Usar servicio generado a traves de composable |
| Token en `localStorage` | Token en memoria — Pinia store (`useAuthStore`) |
| `catch (e) {}` silencioso | Propagar error + mostrar toast al usuario |
| Retry infinito en 401 | Maximo 1 retry para 401, 0 retries para otros errores |
| Gestionar CSRF tokens manualmente | JWT en `Authorization: Bearer` header |
| Rutas hardcodeadas `/api/v1/candidates` | Generadas desde OpenAPI spec — nunca literales |
| `response.data as any` | Tipos generados desde el spec |
| `error.response.data.errors.Email[0]` | `apiError.fieldErrors.email` (normalizado) |
| Llamar `AuthService.refresh()` en cada composable | Cola de refresh centralizada en `client.ts` |

---

## 7. File Upload

Las subidas de archivos requieren `multipart/form-data` y seguimiento de progreso. Se usa `apiClient` directamente (no el cliente generado) para poder acceder a `onUploadProgress`.

```typescript
// src/composables/api/useFileUpload.ts
import { ref } from 'vue'
import { apiClient } from '@/api/client'
import type { DocumentDto } from '@/api/generated/models'

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export function useFileUpload() {
  const progress = ref(0)
  const uploading = ref(false)
  const error = ref<string | null>(null)
  let abortController: AbortController | null = null

  function validateFile(file: File): string | null {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `El archivo no puede superar ${MAX_FILE_SIZE_MB} MB.`
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowed.includes(file.type)) {
      return 'Solo se permiten archivos PDF, JPG o PNG.'
    }
    return null
  }

  async function uploadDocument(
    candidateUuid: string,
    documentTypeUuid: string,
    file: File,
  ): Promise<DocumentDto> {
    const validationError = validateFile(file)
    if (validationError) {
      throw new Error(validationError)
    }

    abortController = new AbortController()
    uploading.value = true
    progress.value = 0
    error.value = null

    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentTypeUuid', documentTypeUuid)

    try {
      const { data } = await apiClient.post<DocumentDto>(
        `/candidates/${candidateUuid}/documents`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal: abortController.signal,
          onUploadProgress: (event) => {
            if (event.total) {
              progress.value = Math.round((event.loaded * 100) / event.total)
            }
          },
        },
      )
      return data
    } catch (e: unknown) {
      if ((e as Error).name === 'CanceledError') {
        throw new Error('Subida cancelada.')
      }
      throw e
    } finally {
      uploading.value = false
      abortController = null
    }
  }

  function cancelUpload(): void {
    abortController?.abort()
  }

  return { uploadDocument, cancelUpload, progress, uploading, error }
}
```

### Integracion con ProgressBar de PrimeVue

```vue
<script setup lang="ts">
import ProgressBar from 'primevue/progressbar'
import { useFileUpload } from '@/composables/api/useFileUpload'

const { uploadDocument, cancelUpload, progress, uploading } = useFileUpload()

async function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  await uploadDocument(props.candidateUuid, props.documentTypeUuid, file)
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <input type="file" accept=".pdf,.jpg,.png" @change="onFileSelected" :disabled="uploading" />
        <div v-if="uploading" class="flex flex-col gap-1">
            <ProgressBar :value="progress" />
            <div class="flex justify-between items-center">
                <span class="text-xs text-muted-color">{{ progress }}%</span>
                <Button label="Cancelar" severity="secondary" size="small" text @click="cancelUpload" />
            </div>
        </div>
    </div>
</template>
```

---

## 8. Cache y Deduplicacion

### Que cachear

| Dato | Estrategia | TTL |
|------|------------|-----|
| Feature flags / permisos del usuario | Pinia store, cargar una vez al login | Hasta logout |
| Perfil del usuario autenticado | Pinia store, invalidar al mutar | Hasta logout |
| Tipos de documento, pipelines, listas de lookup | Pinia store, cargar una vez | Hasta logout |
| Candidatos, aplicaciones, vacantes | Sin cache — siempre fetch fresco | N/A |
| Vistas de detalle | Sin cache — fetch al navegar | N/A |

### Que NO cachear

Las listas de entidades del dominio (candidatos, aplicaciones, documentos) **no** se cachean. Siempre se piden al servidor para garantizar consistencia. El usuario puede estar en multiples tabs o compartir el negocio con otros usuarios.

### Patron stale-while-revalidate para lookup data

```typescript
// src/stores/lookup.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DocumentTypesService, PipelinesService } from '@/api/generated'
import type { DocumentTypeDto, PipelineDto } from '@/api/generated/models'

export const useLookupStore = defineStore('lookup', () => {
  const documentTypes = ref<DocumentTypeDto[]>([])
  const pipelines = ref<PipelineDto[]>([])
  const loadedAt = ref<Record<string, number>>({})
  const STALE_MS = 5 * 60 * 1000  // 5 minutos

  function isStale(key: string): boolean {
    const ts = loadedAt.value[key]
    return !ts || Date.now() - ts > STALE_MS
  }

  async function ensureDocumentTypes(): Promise<void> {
    if (!isStale('documentTypes')) return
    documentTypes.value = await DocumentTypesService.getAll()
    loadedAt.value['documentTypes'] = Date.now()
  }

  async function ensurePipelines(): Promise<void> {
    if (!isStale('pipelines')) return
    pipelines.value = await PipelinesService.getAll()
    loadedAt.value['pipelines'] = Date.now()
  }

  function invalidate(key: string): void {
    delete loadedAt.value[key]
  }

  return {
    documentTypes,
    pipelines,
    ensureDocumentTypes,
    ensurePipelines,
    invalidate,
  }
})
```

### Uso del store de lookup

```typescript
// En un Feature component que necesita tipos de documento
const lookup = useLookupStore()

onMounted(async () => {
  await lookup.ensureDocumentTypes()
})

// Al crear un nuevo tipo — invalidar para refrescar en la proxima visita
async function createDocumentType(command: CreateDocumentTypeCommand) {
  await DocumentTypesService.create({ requestBody: command })
  lookup.invalidate('documentTypes')  // Proximo ensureDocumentTypes() hara fetch
}
```

### Deduplicacion de requests concurrentes

El patron de cola en `client.ts` (seccion 2) ya maneja la deduplicacion del refresh token. Para datos de lookup, la verificacion `isStale` en el store evita multiples requests al mismo recurso desde distintos componentes que se montan simultaneamente.

---

## Referencias

- `src/api/client.ts` — Instancia Axios e interceptors
- `src/api/generated/` — Codigo generado desde OpenAPI (gitignored)
- `src/api/errors.ts` — Tipos y parser de ProblemDetails
- `src/composables/api/` — Composables por dominio
- `src/stores/` — Pinia stores (auth, lookup)
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- `docs/guides/component-patterns.md` — Patrones de componentes (como consumir composables)
