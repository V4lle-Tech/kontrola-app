# Guía de Arquitectura: Pinia Stores

> Para la SPA **kontrola-app** — ERP de Reclutamiento/RH consumiendo API REST .NET con JWT.

---

## 1. Arquitectura de Stores

Los stores se organizan por **dominio**, no por página. Cada store es un singleton global con una responsabilidad única.

```
src/stores/
├── useAuthStore.ts            # Tokens JWT, sesión de usuario, permisos
├── useNotificationStore.ts    # Cola de toasts, contador de no leídos
├── usePreferencesStore.ts     # Preferencias de UI (tema, idioma, sidebar)
├── recruitment/
│   ├── usePipelineStore.ts    # Etapas del pipeline, estado de arrastre
│   └── useKanbanStore.ts      # Estado del tablero Kanban
├── documents/
│   └── useComplianceStore.ts  # Caché de estado de cumplimiento
└── admin/
    └── useTenantStore.ts      # Contexto del tenant actual
```

### Reglas de Organización

| Regla | Descripción |
|-------|-------------|
| **Un store por dominio** | No crear un store por página o por componente |
| **Singletons globales** | No almacenar estado específico de una página |
| **Stores de features son opcionales** | Solo crear si el estado se comparte entre páginas |
| **Nomenclatura `use*Store`** | Consistente con la convención de composables de Vue 3 |

---

## 2. Setup Stores (Patrón Preferido)

Se prefiere el patrón **Setup Store** sobre el patrón Options Store por tres razones concretas:

- **Inferencia de tipos**: TypeScript infiere los tipos sin anotaciones adicionales
- **Integración con composables**: Se pueden usar `ref`, `computed` y composables de Vue directamente
- **Claridad**: Es explícito qué es estado reactivo, qué es computed y qué es una función

### Ejemplo Completo: `useAuthStore`

```typescript
// src/stores/useAuthStore.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import type { User, LoginCredentials, Permission } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // ── Estado ──────────────────────────────────────────────────────────
  // Access token en memoria (NO en localStorage — riesgo XSS)
  const accessToken = ref<string | null>(null)
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // El refresh token viaja en una cookie HttpOnly — la API lo maneja.
  // Desde el cliente nunca se lee ni se escribe directamente.

  let refreshTimer: ReturnType<typeof setTimeout> | null = null

  // ── Computed ─────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => accessToken.value !== null && user.value !== null)

  const permissions = computed<Permission[]>(() => user.value?.permissions ?? [])

  // ── Acciones ─────────────────────────────────────────────────────────
  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    try {
      const response = await authApi.login(credentials)
      _setSession(response.accessToken, response.user, response.expiresInSeconds)
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    _clearRefreshTimer()
    try {
      // Notifica a la API para revocar el refresh token de la cookie
      await authApi.logout()
    } finally {
      _clearSession()
    }
  }

  async function refreshAccessToken(): Promise<boolean> {
    try {
      // La API lee el refresh token de la cookie HttpOnly automáticamente
      const response = await authApi.refresh()
      _setSession(response.accessToken, response.user, response.expiresInSeconds)
      return true
    } catch {
      _clearSession()
      return false
    }
  }

  function checkPermission(permission: Permission): boolean {
    return permissions.value.includes(permission)
  }

  // ── Manejo de 401 ────────────────────────────────────────────────────
  // El interceptor de Axios/fetch llama a este método cuando recibe 401.
  // Si el refresh falla, redirige al login.
  async function handleUnauthorized(): Promise<boolean> {
    const refreshed = await refreshAccessToken()
    if (!refreshed) {
      await logout()
      // Redirigir desde el interceptor, no desde el store
    }
    return refreshed
  }

  // ── Privado ──────────────────────────────────────────────────────────
  function _setSession(token: string, userData: User, expiresInSeconds: number): void {
    accessToken.value = token
    user.value = userData
    _scheduleRefresh(expiresInSeconds)
  }

  function _clearSession(): void {
    accessToken.value = null
    user.value = null
    _clearRefreshTimer()
  }

  function _scheduleRefresh(expiresInSeconds: number): void {
    _clearRefreshTimer()
    // Refrescar 60 segundos antes de la expiración
    const delay = Math.max((expiresInSeconds - 60) * 1000, 0)
    refreshTimer = setTimeout(() => refreshAccessToken(), delay)
  }

  function _clearRefreshTimer(): void {
    if (refreshTimer !== null) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  return {
    // Estado expuesto (readonly desde fuera)
    user: computed(() => user.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    permissions,
    // Token expuesto solo para el interceptor HTTP
    accessToken: computed(() => accessToken.value),
    // Acciones
    login,
    logout,
    refreshAccessToken,
    checkPermission,
    handleUnauthorized,
  }
})
```

### Por Qué los Tokens de Acceso van en Memoria

| Almacenamiento | Riesgo XSS | Persiste recarga | Uso recomendado |
|----------------|-----------|-----------------|-----------------|
| `localStorage` | Alto — cualquier script puede leerlo | Si | Nunca para tokens |
| `sessionStorage` | Alto — mismo origen puede leerlo | No | Nunca para tokens |
| Cookie `HttpOnly` | Sin acceso JS | Si | Refresh token (API lo gestiona) |
| Variable en memoria | Sin acceso externo | No (requiere re-login) | Access token |

El costo de perder el access token al recargar es aceptable: el store intenta `refreshAccessToken()` al inicializar la app usando la cookie HttpOnly que sí persiste.

---

## 3. Anti-patrones

| ❌ Anti-patrón | ✅ Correcto | Razón |
|----------------|-------------|-------|
| Store como caché de API | Fetch en composable, store solo para estado compartido | Los datos se vuelven stale y consumen memoria innecesaria |
| Toda la lógica de negocio en el store | Lógica en composables, store solo estado | El store se convierte en un God Object difícil de mantener |
| Estado mutable directamente desde componentes | Solo mutaciones mediante actions | Pierde trazabilidad en DevTools y dificulta debugging |
| Un store por cada página | Un store por dominio compartido | Proliferación de stores duplicados con estado redundante |
| `localStorage` para access tokens | Solo en memoria + refresh via cookie HttpOnly | Vulnerable a ataques XSS |
| Watchers reactivos dentro del store | Getters computados + actions explícitas | Comportamiento impredecible y efectos secundarios ocultos |
| Store para estado de formulario | `useForm` composable local al componente | Los formularios son efímeros y locales por naturaleza |
| `$patch` masivo desde componentes | Actions específicas con nombres descriptivos | Dificulta rastrear qué originó el cambio de estado |

---

## 4. Composición de Stores

Los stores pueden depender de otros stores. La regla clave es importar los stores dependientes **dentro de las acciones**, no en el nivel superior del `defineStore`.

```typescript
// src/stores/recruitment/useKanbanStore.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { KanbanCard, StageId } from '@/types/recruitment'

export const useKanbanStore = defineStore('kanban', () => {
  const cards = ref<KanbanCard[]>([])
  const isDragging = ref(false)

  async function moveCard(cardId: string, targetStageId: StageId): Promise<void> {
    // ✅ Importar el store dependiente dentro de la acción, no arriba
    const { useAuthStore } = await import('@/stores/useAuthStore')
    const auth = useAuthStore()

    if (!auth.checkPermission('recruitment.pipeline.move')) {
      throw new Error('Sin permiso para mover candidatos')
    }

    // Lógica de movimiento...
    const card = cards.value.find(c => c.id === cardId)
    if (card) {
      card.stageId = targetStageId
    }
  }

  return { cards, isDragging, moveCard }
})
```

### Reglas de Composición

```
┌─────────────────────────────────────────────────────────┐
│  ✅ useKanbanStore  →  usa  →  useAuthStore              │
│  ✅ usePipelineStore  →  usa  →  useAuthStore            │
│  ❌ useAuthStore  →  usa  →  useKanbanStore  (circular)  │
└─────────────────────────────────────────────────────────┘
```

- Solo importar otros stores **dentro de actions o getters**, nunca en el cuerpo del `defineStore`
- Evitar dependencias circulares — si dos stores se necesitan mutuamente, extraer la lógica común a un composable
- Para efectos secundarios entre stores sin acoplamiento directo, usar un event emitter o `mitt`

```typescript
// Para comunicación desacoplada entre stores
// src/events/storeEvents.ts
import mitt from 'mitt'
import type { User } from '@/types/auth'

type StoreEvents = {
  'auth:logout': void
  'auth:user-changed': User
}

export const storeEmitter = mitt<StoreEvents>()

// En useAuthStore:
storeEmitter.emit('auth:logout')

// En useNotificationStore (listener registrado en su setup):
storeEmitter.on('auth:logout', () => clearAllNotifications())
```

---

## 5. Testing de Stores

### Configuración Base

```typescript
// tests/setup.ts
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach } from 'vitest'

beforeEach(() => {
  setActivePinia(createPinia())
})
```

### Testing de Acciones con Mock de API

```typescript
// tests/stores/useAuthStore.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/useAuthStore'
import { authApi } from '@/api/auth'

vi.mock('@/api/auth')

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('establece sesión correctamente al hacer login', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'token-abc',
      user: { id: '1', name: 'Ana López', permissions: ['recruitment.view'] },
      expiresInSeconds: 900,
    })

    const store = useAuthStore()
    await store.login({ email: 'ana@empresa.mx', password: 'secret' })

    expect(store.isAuthenticated).toBe(true)
    expect(store.user?.name).toBe('Ana López')
  })

  it('limpia sesión al hacer logout', async () => {
    vi.mocked(authApi.logout).mockResolvedValue(undefined)

    const store = useAuthStore()
    // Simular sesión activa
    await store.login({ email: 'ana@empresa.mx', password: 'secret' })
    await store.logout()

    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
  })

  it('checkPermission retorna false si el permiso no existe', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'token-abc',
      user: { id: '1', name: 'Ana López', permissions: ['recruitment.view'] },
      expiresInSeconds: 900,
    })

    const store = useAuthStore()
    await store.login({ email: 'ana@empresa.mx', password: 'secret' })

    expect(store.checkPermission('admin.tenants.delete')).toBe(false)
    expect(store.checkPermission('recruitment.view')).toBe(true)
  })
})
```

### Testing con `createTestingPinia` (para tests de componentes)

```typescript
// tests/components/PipelineBoard.test.ts
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'
import PipelineBoard from '@/components/PipelineBoard.vue'
import { usePipelineStore } from '@/stores/recruitment/usePipelineStore'

it('muestra las etapas del pipeline', () => {
  const wrapper = mount(PipelineBoard, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            pipeline: {
              stages: [
                { id: '1', name: 'Aplicado', order: 1 },
                { id: '2', name: 'Entrevista', order: 2 },
              ],
            },
          },
        }),
      ],
    },
  })

  const store = usePipelineStore()
  expect(wrapper.text()).toContain('Aplicado')
  expect(wrapper.text()).toContain('Entrevista')
})
```

### Testing con MSW (Mock Service Worker)

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      accessToken: 'mocked-token',
      user: { id: '1', name: 'Test User', permissions: [] },
      expiresInSeconds: 900,
    })
  }),
  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({ accessToken: 'refreshed-token', expiresInSeconds: 900 })
  }),
]
```

---

## 6. Qué NO Almacenar en Stores

La pregunta más frecuente: ¿va en el store o en el componente?

### Nunca en el Store

| Estado | Dónde va | Por qué |
|--------|----------|---------|
| Estado de formulario (`form.email`, `form.errors`) | `useForm` composable local al componente | Efímero, privado del componente |
| Paginación y ordenamiento de tabla | `ref` local en el componente | Específico de esa vista |
| Drawer/modal abierto o cerrado | `ref` local en el componente | Control de UI local |
| Respuesta de API usada solo en una página | Composable `useFetch` con `ref` local | No necesita ser global |
| Parámetros de ruta | `useRoute()` de Vue Router | Ya existe un sistema para esto |
| Estado de carga de una petición puntual | `ref` local o el composable que hace el fetch | No es estado compartido |

### Siempre en el Store

| Estado | Store | Por qué |
|--------|-------|---------|
| Sesión de usuario y tokens JWT | `useAuthStore` | Se necesita en toda la app |
| Preferencias de UI (tema, idioma, sidebar) | `usePreferencesStore` | Persisten entre navegaciones |
| Cola de notificaciones/toasts | `useNotificationStore` | Cualquier parte de la app puede emitir una notificación |
| Feature flags y permisos | `useAuthStore` | Se cargan una vez y se consultan en toda la app |
| Estado de arrastre del Kanban | `useKanbanStore` | Compartido entre el tablero y la barra lateral |
| Tenant activo (para multi-tenant) | `useTenantStore` | Contexto global de la sesión |

### Regla Práctica

> Si el estado muere cuando se desmonta el componente, es local.
> Si el estado necesita sobrevivir a la navegación o ser leído por un componente no relacionado, va al store.

```typescript
// ❌ No hacer esto — estado de página en el store
export const useJobPostingsStore = defineStore('jobPostings', () => {
  const currentPage = ref(1)          // Paginación local
  const searchQuery = ref('')          // Filtro local
  const selectedJobPosting = ref(null) // Selección local
  const jobPostings = ref([])          // Caché innecesaria si no se comparte
})

// ✅ Hacer esto — composable local para datos de página
// src/composables/useJobPostingsList.ts
export function useJobPostingsList() {
  const currentPage = ref(1)
  const searchQuery = ref('')
  const { data: jobPostings, isLoading } = useFetch('/api/job-postings', {
    params: computed(() => ({ page: currentPage.value, q: searchQuery.value })),
  })
  return { currentPage, searchQuery, jobPostings, isLoading }
}
```
