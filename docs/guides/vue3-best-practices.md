# Guía de Buenas Prácticas: Vue 3 + TypeScript

> Aplicable a la SPA standalone de Kontrola. Esta guía documenta los anti-patrones
> identificados en el codebase Laravel/Inertia y establece los patrones correctos
> para la nueva arquitectura de SPA desacoplada.

---

## Tabla de Contenidos

1. [Anti-patrones del Codebase Actual](#1-anti-patrones-del-codebase-actual)
2. [Composables: Patrones Correctos](#2-composables-patrones-correctos)
3. [Gestión de Estado con Pinia](#3-gestión-de-estado-con-pinia)
4. [Cliente API Generado (OpenAPI)](#4-cliente-api-generado-openapi)
5. [Manejo de Errores Global](#5-manejo-de-errores-global)
6. [TypeScript Estricto](#6-typescript-estricto)
7. [Rendimiento y Memory Leaks](#7-rendimiento-y-memory-leaks)
8. [Testing con Vitest](#8-testing-con-vitest)
9. [Reglas de Linting y Formato](#9-reglas-de-linting-y-formato)

---

## 1. Anti-patrones del Codebase Actual

Estos patrones existen en el codebase Laravel/Inertia y **no deben trasladarse** a la SPA.

### A. Manipulación directa del DOM

El código actual crea elementos `<form>`, los agrega al `<body>`, los envía y los elimina para simular descargas de archivos.

```typescript
// ❌ Anti-patrón: manipulación directa del DOM para descargas
function downloadReport(candidateId: string) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = `/api/candidates/${candidateId}/export`

  const tokenInput = document.createElement('input')
  tokenInput.name = '_token'
  tokenInput.value = document.querySelector('meta[name="csrf-token"]')!.getAttribute('content')!
  form.appendChild(tokenInput)

  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}
```

```typescript
// ✅ Correcto: composable que maneja la descarga con el cliente HTTP
// composables/useFileDownload.ts
export function useFileDownload() {
  const isDownloading = ref(false)
  const error = ref<Error | null>(null)

  async function download(url: string, filename: string) {
    isDownloading.value = true
    error.value = null

    try {
      const response = await apiClient.get(url, { responseType: 'blob' })
      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      })
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Error al descargar')
      throw error.value
    } finally {
      isDownloading.value = false
    }
  }

  return { download, isDownloading, error }
}

// Uso en componente
const { download, isDownloading } = useFileDownload()
await download(`/candidates/${id}/export`, 'candidatos.pdf')
```

---

### B. Mezcla de librerías HTTP

El código actual usa `fetch()`, `axios` y el router de Inertia de forma indistinta en el mismo componente.

```typescript
// ❌ Anti-patrón: tres formas distintas de hacer peticiones HTTP
async function loadCandidate(id: string) {
  // fetch nativo
  const res = await fetch(`/api/candidates/${id}`)
  return res.json()
}

async function saveCandidate(data: unknown) {
  // axios directo sin instancia configurada
  await axios.post('/api/candidates', data)
}

function navigateToList() {
  // router de Inertia
  router.visit('/candidates')
}
```

```typescript
// ✅ Correcto: SOLO el cliente API generado + instancia axios configurada
import { CandidatesApi } from '@/api/generated'
import { apiClient } from '@/api/client'

const candidatesApi = new CandidatesApi(undefined, '', apiClient)

async function loadCandidate(id: string) {
  const { data } = await candidatesApi.getCandidate(id)
  return data
}

async function saveCandidate(payload: CreateCandidateRequest) {
  const { data } = await candidatesApi.createCandidate(payload)
  return data
}
```

---

### C. CSRF manual

El código actual extrae el token CSRF de etiquetas `<meta>` y lo adjunta manualmente a las peticiones. La SPA usa JWT — no existe CSRF en este contexto.

```typescript
// ❌ Anti-patrón: extracción manual de CSRF token
function getHeaders() {
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content')

  return {
    'X-CSRF-TOKEN': csrfToken ?? '',
    'Content-Type': 'application/json',
  }
}

await fetch('/api/applications', {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify(payload),
})
```

```typescript
// ✅ Correcto: el interceptor de axios inyecta el JWT automáticamente
// api/client.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }
  return config
})
```

---

### D. URLs hardcodeadas

El código actual tiene rutas API escritas directamente en llamadas `fetch()` y `axios`.

```typescript
// ❌ Anti-patrón: URLs hardcodeadas dispersas en componentes
await fetch('/api/v1/recruitment/job-postings/123/applications?status=pending')
await axios.get('/api/v1/recruitment/candidates')
await axios.post('/api/v1/recruitment/applications/456/move-stage')
```

```typescript
// ✅ Correcto: cliente generado por OpenAPI — las URLs viven en el spec
import { ApplicationsApi, JobPostingsApi } from '@/api/generated'

const applicationsApi = new ApplicationsApi(undefined, '', apiClient)
const jobPostingsApi = new JobPostingsApi(undefined, '', apiClient)

// Las funciones tienen tipos completos inferidos del spec
const { data: applications } = await applicationsApi.listApplications({
  jobPostingId: '123',
  status: 'pending',
})

const { data: candidates } = await candidatesApi.listCandidates()

await applicationsApi.moveApplicationStage('456', { stageId: 'hired' })
```

---

### E. Componentes monolíticos (>300 líneas)

El código actual tiene componentes de 800+ líneas que mezclan listado, formulario, validación, lógica de negocio y presentación.

```vue
<!-- ❌ Anti-patrón: componente de 850 líneas que hace todo -->
<!-- CandidateView.vue -->
<script setup lang="ts">
// 200 líneas de lógica de listado
// 200 líneas de lógica de formulario
// 150 líneas de validación
// 200 líneas de renderizado condicional
// 100 líneas de utilidades inline
</script>
```

```
✅ Correcto: separar en componentes y composables enfocados

pages/Recruitment/Candidates/
├── Index.vue                    # ~80 líneas — solo layout y navegación
├── CandidateList.vue            # ~120 líneas — listado con filtros
├── CandidateDetail.vue          # ~150 líneas — vista de detalle
├── CandidateForm.vue            # ~180 líneas — formulario create/edit
└── composables/
    ├── useCandidateList.ts      # filtros, paginación, búsqueda
    ├── useCandidateForm.ts      # estado del form, validación, submit
    └── useCandidateActions.ts   # delete, archive, move stage
```

Regla: **máximo 300 líneas por componente**. Si se supera, extraer a composable o subcomponente.

---

### F. `defineExpose()` para formularios

El código actual expone el estado interno del formulario con `defineExpose()` para que el padre lo controle directamente.

```vue
<!-- ❌ Anti-patrón: exponer estado interno para control externo -->
<script setup lang="ts">
const form = reactive({
  givenName: '',
  paternalName: '',
  email: '',
})

const isSubmitting = ref(false)

// El padre llama a form.reset() o lee form.email directamente
defineExpose({ form, isSubmitting, reset: () => Object.assign(form, {}) })
</script>
```

```vue
<!-- ✅ Correcto: comunicación mediante eventos tipados -->
<script setup lang="ts">
interface Props {
  initialValues?: Partial<CreateCandidateRequest>
}

const emit = defineEmits<{
  submit: [data: CreateCandidateRequest]
  cancel: []
}>()

const props = defineProps<Props>()

const form = reactive<CreateCandidateRequest>({
  givenName: props.initialValues?.givenName ?? '',
  paternalName: props.initialValues?.paternalName ?? '',
  email: props.initialValues?.email ?? '',
})

function handleSubmit() {
  // validar...
  emit('submit', { ...form })
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- campos -->
    <Button type="submit" label="Guardar" />
    <Button type="button" label="Cancelar" @click="emit('cancel')" />
  </form>
</template>
```

---

### G. Tipos `any` y `.d.ts` innecesarios

El código actual usa `any` para evitar errores de TypeScript y crea archivos `.d.ts` con declaraciones ambiguas.

```typescript
// ❌ Anti-patrón: any en props, respuestas y callbacks
interface Props {
  candidate: any          // ¿qué forma tiene?
  onUpdate: (data: any) => void
}

async function loadData(): Promise<any> {
  const res = await fetch('/api/candidates')
  return res.json()  // any implícito
}

// ❌ Anti-patrón: .d.ts innecesario para módulos propios
// types/recruitment.d.ts
declare module '@/stores/recruitment' {
  export const useRecruitmentStore: any
}
```

```typescript
// ✅ Correcto: tipos explícitos de los modelos generados
import type { Candidate, UpdateCandidateRequest } from '@/api/generated'

interface Props {
  candidate: Candidate
  onUpdate: (data: UpdateCandidateRequest) => void
}

async function loadCandidate(id: string): Promise<Candidate> {
  const { data } = await candidatesApi.getCandidate(id)
  return data
}

// ✅ Si se necesita tipo genérico, usar unknown + type guard
function processApiResponse(response: unknown): Candidate {
  if (!isCandidate(response)) {
    throw new Error('Respuesta inesperada de la API')
  }
  return response
}

function isCandidate(value: unknown): value is Candidate {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'givenName' in value
  )
}
```

---

### H. Manejo de errores inconsistente

El código actual tiene tres patrones distintos de manejo de errores en el mismo módulo.

```typescript
// ❌ Anti-patrón: tres estilos de manejo de errores mezclados
// Estilo 1: swallow silencioso
try {
  await saveCandidate(data)
} catch (e) {
  console.error(e)  // nadie sabe que falló
}

// Estilo 2: alerta nativa del navegador
try {
  await deleteApplication(id)
} catch (e) {
  alert('Error al eliminar')  // UX terrible
}

// Estilo 3: estado local inconsistente
const error = ref('')
try {
  await moveStage(applicationId, stageId)
} catch (e: any) {
  error.value = e.message  // any + no notificación al usuario
}
```

```typescript
// ✅ Correcto: composable centralizado con toast + Sentry
// composables/useErrorHandler.ts
import { useToast } from 'primevue/usetoast'
import * as Sentry from '@sentry/vue'
import type { ApiError } from '@/api/types'

export function useErrorHandler() {
  const toast = useToast()

  function handleError(error: unknown, context?: string): void {
    const message = extractUserMessage(error)
    const isClientError = isApiError(error) && error.status < 500

    toast.add({
      severity: isClientError ? 'warn' : 'error',
      summary: isClientError ? 'Aviso' : 'Error inesperado',
      detail: message,
      life: 5000,
    })

    if (!isClientError) {
      Sentry.captureException(error, { extra: { context } })
    }
  }

  return { handleError }
}

function extractUserMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.detail ?? error.title ?? 'Error en la operación'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Ocurrió un error inesperado'
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'status' in value
  )
}
```

---

## 2. Composables: Patrones Correctos

Los composables encapsulan lógica reutilizable. Deben tener responsabilidad única y limpiar efectos secundarios.

### Reglas fundamentales

| Regla | Descripción |
|---|---|
| Responsabilidad única | Un composable = una preocupación |
| Limpieza en `onUnmounted` | Event listeners, intervals, suscripciones |
| Retorno tipado | Siempre declarar el tipo de retorno |
| Sin efectos en construcción | No ejecutar peticiones HTTP al importar |
| Prefijo `use` obligatorio | `useFileDownload`, no `fileDownload` |

### Ejemplos

```typescript
// composables/useDateFormatter.ts
import { computed } from 'vue'

export function useDateFormatter(locale = 'es-MX') {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })

  function formatDate(date: string | Date): string {
    return dateFormatter.format(new Date(date))
  }

  function formatDateTime(date: string | Date): string {
    const d = new Date(date)
    return `${dateFormatter.format(d)} ${timeFormatter.format(d)}`
  }

  function formatRelative(date: string | Date): string {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    const diffMs = new Date(date).getTime() - Date.now()
    const diffDays = Math.round(diffMs / 86_400_000)

    if (Math.abs(diffDays) < 1) return 'hoy'
    if (Math.abs(diffDays) < 7) return rtf.format(diffDays, 'day')
    return formatDate(date)
  }

  return { formatDate, formatDateTime, formatRelative }
}
```

```typescript
// composables/useFormSubmit.ts
import { ref } from 'vue'
import { useErrorHandler } from './useErrorHandler'

interface SubmitOptions<T> {
  onSuccess?: (result: T) => void
  successMessage?: string
}

export function useFormSubmit<T>() {
  const isSubmitting = ref(false)
  const { handleError } = useErrorHandler()
  const toast = useToast()

  async function submit(
    action: () => Promise<T>,
    options: SubmitOptions<T> = {},
  ): Promise<T | null> {
    if (isSubmitting.value) return null

    isSubmitting.value = true
    try {
      const result = await action()
      if (options.successMessage) {
        toast.add({
          severity: 'success',
          summary: options.successMessage,
          life: 3000,
        })
      }
      options.onSuccess?.(result)
      return result
    } catch (error) {
      handleError(error, 'form-submit')
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  return { submit, isSubmitting }
}
```

```typescript
// composables/useIntersectionObserver.ts — ejemplo de cleanup correcto
import { ref, onUnmounted } from 'vue'

export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
) {
  const targetRef = ref<Element | null>(null)
  let observer: IntersectionObserver | null = null

  function observe(element: Element) {
    observer = new IntersectionObserver(callback, options)
    observer.observe(element)
  }

  // ✅ Limpieza obligatoria en onUnmounted
  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { targetRef, observe }
}
```

---

## 3. Gestión de Estado con Pinia

### Organización de stores

Un store por dominio. Nunca un store global "catch-all".

```
stores/
├── auth.ts              # sesión, usuario actual, tokens
├── recruitment/
│   ├── candidates.ts    # lista, filtros, candidato seleccionado
│   ├── jobPostings.ts   # vacantes, estado de publicación
│   └── pipeline.ts      # etapas, aplicaciones en kanban
└── ui.ts                # tema, idioma, preferencias locales
```

### Setup stores (preferido para TypeScript)

```typescript
// stores/recruitment/candidates.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Candidate, CandidateFilters } from '@/api/generated'
import { useCandidatesApi } from '@/api/recruitment'

export const useCandidatesStore = defineStore('recruitment/candidates', () => {
  // Estado
  const candidates = ref<Candidate[]>([])
  const selectedCandidateId = ref<string | null>(null)
  const filters = ref<CandidateFilters>({ status: 'active', page: 1 })
  const isLoading = ref(false)
  const total = ref(0)

  // Getters (computed)
  const selectedCandidate = computed(() =>
    candidates.value.find((c) => c.id === selectedCandidateId.value) ?? null,
  )

  const hasActiveFilters = computed(
    () => filters.value.status !== 'active' || !!filters.value.search,
  )

  // ❌ Anti-patrón: estado derivado almacenado
  // const candidateNames = ref<string[]>([]) // derivado de candidates

  // ✅ Correcto: siempre computed para estado derivado
  const candidateNames = computed(() =>
    candidates.value.map((c) => `${c.givenName} ${c.paternalName}`),
  )

  // Actions
  const api = useCandidatesApi()

  async function fetchCandidates() {
    isLoading.value = true
    try {
      const { data } = await api.listCandidates(filters.value)
      candidates.value = data.items
      total.value = data.total
    } finally {
      isLoading.value = false
    }
  }

  function selectCandidate(id: string | null) {
    selectedCandidateId.value = id
  }

  function updateFilters(newFilters: Partial<CandidateFilters>) {
    filters.value = { ...filters.value, ...newFilters, page: 1 }
  }

  return {
    // estado (readonly desde fuera)
    candidates: readonly(candidates),
    isLoading: readonly(isLoading),
    total: readonly(total),
    filters: readonly(filters),
    // getters
    selectedCandidate,
    hasActiveFilters,
    candidateNames,
    // actions
    fetchCandidates,
    selectCandidate,
    updateFilters,
  }
})
```

### Composición de stores

```typescript
// stores/recruitment/pipeline.ts
import { defineStore } from 'pinia'
import { useCandidatesStore } from './candidates'
import { useJobPostingsStore } from './jobPostings'

export const usePipelineStore = defineStore('recruitment/pipeline', () => {
  const candidatesStore = useCandidatesStore()
  const jobPostingsStore = useJobPostingsStore()

  // ✅ Puede leer otros stores directamente
  const activeJobPostingCandidates = computed(() => {
    const activeJobId = jobPostingsStore.activeJobPosting?.id
    if (!activeJobId) return []
    return candidatesStore.candidates.filter(
      (c) => c.currentJobPostingId === activeJobId,
    )
  })

  return { activeJobPostingCandidates }
})
```

### Anti-patrón: sobre-almacenamiento

```typescript
// ❌ Anti-patrón: almacenar datos temporales que la API ya provee
const store = defineStore('candidates', {
  state: () => ({
    candidates: [] as Candidate[],
    // Estos NO deben estar en el store si solo se usan en una pantalla:
    tempSearchResults: [] as Candidate[],
    formDraft: {} as Partial<CreateCandidateRequest>,
    validationErrors: {} as Record<string, string>,
  }),
})

// ✅ Correcto: datos de pantalla viven en el componente/composable
// Solo el estado compartido entre rutas va al store
const searchResults = ref<Candidate[]>([])  // local al componente
const formDraft = reactive<Partial<CreateCandidateRequest>>({}) // local al form
```

---

## 4. Cliente API Generado (OpenAPI)

### Principio fundamental

**Nunca escribir llamadas `fetch` o `axios` manuales para endpoints de la API.** El spec OpenAPI genera el cliente con tipos completos.

### Instancia axios configurada

```typescript
// api/client.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { ApiError } from './types'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor de request: inyectar JWT
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }
  return config
})

// Interceptor de response: refresh token + normalizar errores
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const authStore = useAuthStore()
      const refreshed = await authStore.refreshToken()
      if (refreshed) {
        return apiClient(originalRequest)
      }
      authStore.logout()
    }

    return Promise.reject(normalizeApiError(error))
  },
)

function normalizeApiError(error: AxiosError<ApiError>): ApiError {
  // RFC 9457 Problem Details
  if (error.response?.data?.type) {
    return error.response.data
  }
  return {
    type: 'about:blank',
    title: 'Error de red',
    status: error.response?.status ?? 0,
    detail: error.message,
  }
}
```

### Tipado de errores (RFC 9457 Problem Details)

```typescript
// api/types.ts
export interface ApiError {
  type: string          // URI que identifica el tipo de problema
  title: string         // Descripción corta legible
  status: number        // Código HTTP
  detail?: string       // Explicación detallada para el usuario
  instance?: string     // URI de la instancia específica
  errors?: Record<string, string[]>  // Errores de validación por campo
}

// Uso con type guard
import type { ApiError } from '@/api/types'

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'status' in value &&
    typeof (value as ApiError).status === 'number'
  )
}
```

### Wrapper de composable para endpoints

```typescript
// api/recruitment.ts — wrapper sobre el cliente generado
import { CandidatesApi, type CreateCandidateRequest } from './generated'
import { apiClient } from './client'

// Instancia singleton configurada
const candidatesApi = new CandidatesApi(undefined, '', apiClient)

export function useCandidatesApi() {
  return {
    listCandidates: (filters?: CandidateFilters) =>
      candidatesApi.listCandidates(
        filters?.page,
        filters?.perPage,
        filters?.search,
        filters?.status,
      ),
    getCandidate: (id: string) => candidatesApi.getCandidate(id),
    createCandidate: (data: CreateCandidateRequest) =>
      candidatesApi.createCandidate(data),
    updateCandidate: (id: string, data: UpdateCandidateRequest) =>
      candidatesApi.updateCandidate(id, data),
    deleteCandidate: (id: string) => candidatesApi.deleteCandidate(id),
  }
}
```

---

## 5. Manejo de Errores Global

### Estrategia por capas

| Capa | Mecanismo | Responsabilidad |
|---|---|---|
| Global Vue | `app.config.errorHandler` | Errores no capturados en componentes |
| HTTP | Interceptor axios | Normalizar, refresh token, errores 5xx |
| Componente | `useErrorHandler()` | Feedback al usuario + logging |
| Sentry | `captureException` | Registro de errores inesperados |

### Configuración global

```typescript
// main.ts
import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'
import App from './App.vue'

const app = createApp(App)

// ✅ Error handler global — captura errores no manejados
app.config.errorHandler = (error, instance, info) => {
  console.error('[Vue Error]', error)
  Sentry.captureException(error, {
    extra: { componentInfo: info },
    tags: { source: 'vue-error-handler' },
  })

  // Notificar al usuario solo si hay un toast disponible
  // (no en errores durante el render inicial)
  try {
    const toast = useToast()
    toast.add({
      severity: 'error',
      summary: 'Error inesperado',
      detail: 'Por favor recarga la página. Si el problema persiste, contacta soporte.',
      life: 8000,
    })
  } catch {
    // toast no disponible aún
  }
}
```

### Composable `useErrorHandler`

Ver implementación en [sección 1.H](#h-manejo-de-errores-inconsistente).

### Nunca silenciar errores

```typescript
// ❌ Anti-patrón: catch silencioso
try {
  await applicationsApi.moveStage(id, stageId)
} catch {
  // nada — el usuario no sabe que falló
}

// ❌ Anti-patrón: solo console.error
try {
  await applicationsApi.moveStage(id, stageId)
} catch (error) {
  console.error(error)  // solo en DevTools, no en producción
}

// ✅ Correcto: siempre notificar + registrar
const { handleError } = useErrorHandler()
try {
  await applicationsApi.moveStage(id, stageId)
} catch (error) {
  handleError(error, 'move-stage')
  // handleError: toast al usuario + Sentry si es 5xx
}
```

---

## 6. TypeScript Estricto

### Configuración `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Reglas de tipos

```typescript
// ❌ any — prohibido
function processCandidate(data: any) { }

// ✅ unknown + type guard
function processCandidate(data: unknown): Candidate {
  if (!isCandidate(data)) throw new TypeError('Datos inválidos')
  return data
}

// ❌ type assertion sin guard
const candidate = response as Candidate

// ✅ type assertion solo después de validar
if (isCandidate(response)) {
  const candidate = response  // inferido correctamente
}
```

### Interface vs type

```typescript
// Interface para formas de objetos (Props, DTOs, modelos)
interface CandidateCardProps {
  candidate: Candidate
  isSelected?: boolean
}

// Type para uniones, intersecciones y aliases
type ApplicationStatus = 'pending' | 'reviewing' | 'hired' | 'rejected'
type CandidateOrNull = Candidate | null
type WithTimestamps<T> = T & { createdAt: string; updatedAt: string }
```

### Const enums para valores de dominio

```typescript
// ✅ Enum de string para valores que cruzan la red
enum ApplicationStatus {
  Pending = 'pending',
  Reviewing = 'reviewing',
  Hired = 'hired',
  Rejected = 'rejected',
}

// ✅ Discriminated union para máquinas de estado
type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError }

// Uso en componente
const candidateState = ref<LoadState<Candidate>>({ status: 'idle' })

// TypeScript sabe qué campos están disponibles según status
if (candidateState.value.status === 'success') {
  console.log(candidateState.value.data.givenName) // ✅ tipado
}
```

### Tipos utilitarios

```typescript
// Partial para formularios de edición (todos los campos opcionales)
type EditCandidateForm = Partial<CreateCandidateRequest>

// Pick para props que solo necesitan algunos campos
type CandidateSummary = Pick<Candidate, 'id' | 'givenName' | 'paternalName' | 'email'>

// Omit para crear variantes sin ciertos campos
type CandidateWithoutDates = Omit<Candidate, 'createdAt' | 'updatedAt'>

// Required para garantizar campos completos
type CompleteCandidateForm = Required<CreateCandidateRequest>
```

### Composables genéricos

```typescript
// composables/useAsyncData.ts
export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const state = ref<LoadState<T>>({ status: 'idle' })

  async function execute() {
    state.value = { status: 'loading' }
    try {
      const data = await fetcher()
      state.value = { status: 'success', data }
    } catch (error) {
      state.value = {
        status: 'error',
        error: isApiError(error) ? error : { type: 'about:blank', title: 'Error', status: 0 },
      }
    }
  }

  return { state: readonly(state), execute }
}

// Uso tipado
const { state, execute } = useAsyncData(() => candidatesApi.getCandidate(id))
// state es Ref<LoadState<Candidate>> — completamente tipado
```

---

## 7. Rendimiento y Memory Leaks

### Cleanup obligatorio

```typescript
// ❌ Anti-patrón: listeners y timers sin cleanup
onMounted(() => {
  window.addEventListener('resize', handleResize)
  const interval = setInterval(syncPipeline, 30_000)
})
// El componente se desmonta — listener y timer siguen activos

// ✅ Correcto: cleanup en onUnmounted
onMounted(() => {
  window.addEventListener('resize', handleResize)
  const interval = setInterval(syncPipeline, 30_000)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    clearInterval(interval)
  })
})

// ✅ Alternativa: useEventListener del ecosistema
// Muchos composables de @vueuse/core manejan cleanup automáticamente
```

### `shallowRef` para objetos grandes

```typescript
// ❌ Para listas de 1000+ candidatos, ref() crea watchers en cada propiedad
const candidates = ref<Candidate[]>([])

// ✅ shallowRef solo observa la referencia del array, no sus elementos
const candidates = shallowRef<Candidate[]>([])

// Al mutar, siempre reasignar (no .push)
candidates.value = [...candidates.value, newCandidate]
```

### Lazy loading de rutas

```typescript
// router/index.ts
const routes = [
  {
    path: '/recruitment',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      {
        path: 'candidates',
        // ✅ Lazy loading — el bundle del módulo se carga al navegar
        component: () => import('@/pages/Recruitment/Candidates/Index.vue'),
      },
      {
        path: 'job-postings',
        component: () => import('@/pages/Recruitment/JobPostings/Index.vue'),
      },
    ],
  },
]
```

### Virtual scrolling para listas largas

```vue
<!-- ✅ VirtualScroller de PrimeVue para listas de 500+ items -->
<script setup lang="ts">
import VirtualScroller from 'primevue/virtualscroller'
import type { Candidate } from '@/api/generated'

defineProps<{ candidates: Candidate[] }>()
</script>

<template>
  <VirtualScroller
    :items="candidates"
    :item-size="72"
    class="h-[600px]"
  >
    <template #item="{ item }">
      <CandidateListItem :candidate="item" />
    </template>
  </VirtualScroller>
</template>
```

### `v-memo` para listas con re-renders costosos

```vue
<!-- ✅ v-memo evita re-render si las dependencias no cambiaron -->
<template>
  <ul>
    <li
      v-for="candidate in candidates"
      :key="candidate.id"
      v-memo="[candidate.id, candidate.status, isSelected(candidate.id)]"
    >
      <CandidateRow :candidate="candidate" />
    </li>
  </ul>
</template>
```

---

## 8. Testing con Vitest

### Estructura de tests

```
tests/
├── unit/
│   ├── composables/
│   │   ├── useFileDownload.test.ts
│   │   └── useDateFormatter.test.ts
│   └── utils/
│       └── apiErrors.test.ts
├── component/
│   ├── Recruitment/
│   │   ├── CandidateForm.test.ts
│   │   └── CandidateList.test.ts
│   └── shared/
│       └── ErrorMessage.test.ts
└── stores/
    ├── auth.test.ts
    └── recruitment/
        └── candidates.test.ts
```

### Testing de composables

```typescript
// tests/unit/composables/useDateFormatter.test.ts
import { describe, it, expect } from 'vitest'
import { useDateFormatter } from '@/composables/useDateFormatter'

describe('useDateFormatter', () => {
  const { formatDate, formatRelative } = useDateFormatter('es-MX')

  it('formatea fecha en español mexicano', () => {
    const result = formatDate('2024-03-15')
    expect(result).toBe('15 de marzo de 2024')
  })

  it('muestra "hoy" para fechas del día actual', () => {
    const today = new Date().toISOString()
    expect(formatRelative(today)).toBe('hoy')
  })
})
```

### Testing de componentes

```typescript
// tests/component/Recruitment/CandidateForm.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import CandidateForm from '@/pages/Recruitment/Candidates/CandidateForm.vue'

describe('CandidateForm', () => {
  function createWrapper(props = {}) {
    return mount(CandidateForm, {
      global: { plugins: [createPinia()] },
      props,
    })
  }

  it('emite submit con datos del formulario al enviar', async () => {
    const wrapper = createWrapper()

    await wrapper.find('[data-testid="given-name"]').setValue('Juan')
    await wrapper.find('[data-testid="paternal-name"]').setValue('García')
    await wrapper.find('[data-testid="email"]').setValue('juan@example.com')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')![0][0]).toMatchObject({
      givenName: 'Juan',
      paternalName: 'García',
      email: 'juan@example.com',
    })
  })

  it('emite cancel al hacer clic en cancelar', async () => {
    const wrapper = createWrapper()
    await wrapper.find('[data-testid="cancel-btn"]').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
```

### Testing de stores con MSW

```typescript
// tests/stores/recruitment/candidates.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useCandidatesStore } from '@/stores/recruitment/candidates'
import type { Candidate } from '@/api/generated'

const mockCandidates: Candidate[] = [
  { id: '1', givenName: 'Ana', paternalName: 'López', email: 'ana@test.com' },
]

describe('useCandidatesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('carga candidatos desde la API', async () => {
    server.use(
      http.get('/api/v1/candidates', () =>
        HttpResponse.json({ items: mockCandidates, total: 1 }),
      ),
    )

    const store = useCandidatesStore()
    await store.fetchCandidates()

    expect(store.candidates).toHaveLength(1)
    expect(store.candidates[0].givenName).toBe('Ana')
  })

  it('selecciona candidato correctamente', () => {
    const store = useCandidatesStore()
    store.selectCandidate('1')
    expect(store.selectedCandidateId).toBe('1') // via $patch o action
  })
})
```

### Reglas de testing

| Regla | Descripción |
|---|---|
| Probar comportamiento | Lo que el usuario ve y hace, no implementación interna |
| No mockear Vue | Nunca mockear `ref`, `computed`, `watch` |
| MSW para API | Mock a nivel de red, no de módulos |
| `data-testid` para selectores | Más estable que clases o texto |
| No snapshot tests | Frágiles y no prueban comportamiento |

---

## 9. Reglas de Linting y Formato

### ESLint flat config

```javascript
// eslint.config.js
import js from '@eslint/js'
import ts from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default ts.config(
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...vue.configs['flat/recommended'],
  prettier,
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // Vue
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/no-unused-vars': 'error',
      'vue/no-v-html': 'error',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
    },
  },
)
```

### Prettier

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "vueIndentScriptAndStyle": false
}
```

### Regla: nunca deshabilitar sin justificación

```typescript
// ❌ Anti-patrón: deshabilitar sin explicar por qué
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function legacy(data: any) { }

// ✅ Correcto: comentario obligatorio explicando el motivo
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- API externa sin tipos disponibles
function callExternalSdk(data: any) { }

// ✅ Mejor: resolver la raíz del problema
function callExternalSdk(data: unknown) {
  // type guard o cast documentado
}
```

### Scripts de calidad en `package.json`

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write src/",
    "format:check": "prettier --check src/",
    "type-check": "vue-tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Referencia Rápida

| Patrón | Prohibido | Correcto |
|---|---|---|
| HTTP | `fetch()`, `axios` directo | Cliente OpenAPI generado |
| Tokens | CSRF desde `<meta>` | JWT via interceptor |
| URLs | Hardcoded en componentes | Funciones del cliente generado |
| Errores | `catch` silencioso, `alert()` | `useErrorHandler()` + toast |
| Tipos | `any`, `.d.ts` ambiguos | Tipos generados + type guards |
| Estado derivado | `ref` con valor calculado | `computed()` |
| Limpieza | Sin cleanup en unmount | `onUnmounted()` siempre |
| Componentes | >300 líneas | Extraer composables + componentes |
| Props | `defineExpose()` para control | Emits tipados |
| Tests | Mockear Vue internals | MSW + `@vue/test-utils` |
