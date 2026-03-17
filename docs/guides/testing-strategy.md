# Estrategia de Testing — Kontrola App

> Vue 3 + TypeScript + PrimeVue 4 SPA para ERP de Reclutamiento/RRHH

---

## 1. Pirámide de Tests

| Nivel       | Herramienta               | Qué testa                                   | Velocidad | Cantidad |
| ----------- | ------------------------- | ------------------------------------------- | --------- | -------- |
| Unit        | Vitest                    | Composables, utils, stores, funciones puras | < 50ms    | 70%      |
| Component   | Vitest + @vue/test-utils  | Componentes aislados con props/events       | < 200ms   | 20%      |
| Integration | Vitest + MSW              | Flujos completos con API mock               | < 500ms   | 10%      |

> **E2E frontend** con Playwright — captura screenshots para análisis AI de UX/UI. Los tests E2E de integración completa viven en `kontrola-net` (Pest Browser Tests contra backend real).

### E2E (Playwright)

| Nivel | Herramienta | Qué testa | Velocidad | Cantidad |
| ----- | ----------- | --------- | --------- | -------- |
| E2E   | Playwright  | Navegación, formularios, visual audit con screenshots | < 5s | Por flujo |

```
e2e/
├── fixtures/
│   └── base.ts              # Custom fixtures: screenshot helpers
├── helpers/
│   └── auth.ts              # Login helpers + API mocks
├── auth/
│   └── login.spec.ts        # Login page E2E tests
├── visual/
│   └── screenshot-audit.spec.ts  # Visual audit para AI analysis
├── screenshots/              # (gitignored) Output de capturas
├── results/                  # (gitignored) Test artifacts
└── report/                   # (gitignored) HTML report
```

**Comandos E2E:**

```bash
bun run e2e                # Ejecutar todos los E2E
bun run e2e:ui             # UI interactiva de Playwright
bun run e2e:screenshots    # Solo visual audit (screenshots)
bun run e2e:report         # Abrir reporte HTML
```

**AI-driven UX workflow:**

1. `bun run e2e:screenshots` captura todas las páginas en light/dark + responsive
2. Playwright MCP (vision mode) analiza screenshots en tiempo real
3. Claude lee los screenshots de `e2e/screenshots/` para sugerir mejoras UX/UI

---

## 2. Estructura de Tests

```
tests/
├── unit/
│   ├── composables/
│   │   ├── useFileDownload.spec.ts
│   │   └── useDateFormatter.spec.ts
│   ├── stores/
│   │   ├── useAuthStore.spec.ts
│   │   └── usePreferencesStore.spec.ts
│   └── utils/
│       ├── formatCurrency.spec.ts
│       └── validators.spec.ts
├── components/
│   ├── shared/
│   │   ├── EmptyState.spec.ts
│   │   └── StatusBadge.spec.ts
│   └── recruitment/
│       ├── CandidateList.spec.ts
│       └── CandidateForm.spec.ts
├── integration/
│   ├── auth/
│   │   └── login-flow.spec.ts
│   └── recruitment/
│       └── candidate-crud.spec.ts
├── mocks/
│   ├── handlers/
│   │   ├── auth.ts
│   │   └── recruitment.ts
│   └── server.ts
└── setup.ts
```

---

## 3. Configuración

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/main.ts',
        'src/**/*.d.ts',
        'src/types/**',
        'src/wayfinder/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

### `tests/setup.ts`

```typescript
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { server } from './mocks/server'

// MSW — iniciar servidor de mocks antes de todos los tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Stubs globales de PrimeVue para evitar errores en componentes
// que usan Toast/ConfirmDialog sin proveedor en el árbol
config.global.stubs = {
  Toast: true,
  ConfirmDialog: true,
  Teleport: true,
}

// Suprimir warnings de Vue sobre componentes no registrados de PrimeVue
config.global.config.warnHandler = (msg) => {
  if (msg.includes('Failed to resolve component')) return
  console.warn(msg)
}

// Mock del router de Inertia/Vue Router
vi.mock('@inertiajs/vue3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@inertiajs/vue3')>()
  return {
    ...actual,
    router: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      visit: vi.fn(),
    },
    useForm: actual.useForm,
    usePage: vi.fn(() => ({
      props: { auth: { user: null } },
    })),
  }
})
```

---

## 4. Testing de Composables

Los composables deben probarse montados dentro de un componente real para que la reactividad funcione correctamente.

### Helper `withSetup`

```typescript
// tests/helpers/withSetup.ts
import { createApp, defineComponent, App } from 'vue'

export function withSetup<T>(composable: () => T): [T, App] {
  let result: T
  const app = createApp(
    defineComponent({
      setup() {
        result = composable()
        return () => null
      },
    }),
  )
  app.mount(document.createElement('div'))
  return [result!, app]
}
```

### Ejemplo: `useDateFormatter`

```typescript
// tests/unit/composables/useDateFormatter.spec.ts
import { describe, it, expect } from 'vitest'
import { withSetup } from '../helpers/withSetup'
import { useDateFormatter } from '@/composables/useDateFormatter'

describe('useDateFormatter', () => {
  it('formatea fecha en locale mexicano', () => {
    const [result, app] = withSetup(() => useDateFormatter())

    expect(result.format('2024-01-15')).toBe('15 de enero de 2024')

    app.unmount()
  })

  it('retorna cadena vacía para fechas nulas', () => {
    const [result, app] = withSetup(() => useDateFormatter())

    expect(result.format(null)).toBe('')

    app.unmount()
  })

  it('limpia listeners al desmontar', () => {
    const [, app] = withSetup(() => useDateFormatter())
    // Verificar que unmount no lanza errores
    expect(() => app.unmount()).not.toThrow()
  })
})
```

### Ejemplo: `useFileDownload`

```typescript
// tests/unit/composables/useFileDownload.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withSetup } from '../helpers/withSetup'
import { useFileDownload } from '@/composables/useFileDownload'

describe('useFileDownload', () => {
  beforeEach(() => {
    // Mock del DOM para descarga de archivos
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('inicia en estado idle', () => {
    const [{ isDownloading }, app] = withSetup(() => useFileDownload())

    expect(isDownloading.value).toBe(false)

    app.unmount()
  })

  it('cambia estado durante la descarga', async () => {
    const [{ isDownloading, download }, app] = withSetup(() => useFileDownload())

    const promise = download('/api/export/candidates.csv', 'candidatos.csv')
    expect(isDownloading.value).toBe(true)

    await promise
    expect(isDownloading.value).toBe(false)

    app.unmount()
  })
})
```

---

## 5. Testing de Componentes

Preferir `mount` sobre `shallowMount` para probar integración real entre componente padre e hijos. Usar `shallowMount` solo cuando el árbol de hijos sea excesivamente profundo o irrelevante para el test.

### Patrones con `@vue/test-utils`

```typescript
// tests/components/recruitment/CandidateForm.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import CandidateForm from '@/pages/Recruitment/_components/CandidateForm.vue'
import { createMockCandidate } from '../../factories/candidate'

describe('CandidateForm', () => {
  it('emite submit con datos del candidato', async () => {
    const wrapper = mount(CandidateForm, {
      global: {
        plugins: [createTestingPinia()],
      },
    })

    await wrapper.find('[data-testid="given-name"]').setValue('María')
    await wrapper.find('[data-testid="paternal-name"]').setValue('García')
    await wrapper.find('[data-testid="paternal-name"]').setValue('López')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual([
      {
        givenName: 'María',
        paternalName: 'García',
      },
    ])
  })

  it('muestra errores de validación', async () => {
    const wrapper = mount(CandidateForm, {
      global: { plugins: [createTestingPinia()] },
    })

    // Enviar sin datos
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[data-testid="given-name-error"]').exists()).toBe(true)
  })

  it('pre-llena campos cuando recibe candidato existente', () => {
    const candidate = createMockCandidate({ givenName: 'Ana' })

    const wrapper = mount(CandidateForm, {
      props: { candidate },
      global: { plugins: [createTestingPinia()] },
    })

    const input = wrapper.find<HTMLInputElement>('[data-testid="given-name"]')
    expect(input.element.value).toBe('Ana')
  })

  it('emite cancel al hacer clic en el botón cancelar', async () => {
    const wrapper = mount(CandidateForm, {
      global: { plugins: [createTestingPinia()] },
    })

    await wrapper.find('[data-testid="cancel-btn"]').trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })
})
```

### Testing de slots

```typescript
it('renderiza slot de acciones personalizado', () => {
  const wrapper = mount(EmptyState, {
    slots: {
      actions: '<button data-testid="custom-action">Crear nuevo</button>',
    },
  })

  expect(wrapper.find('[data-testid="custom-action"]').exists()).toBe(true)
})
```

### Snapshots (uso limitado)

Usar snapshots únicamente para estructura HTML estable que no cambia frecuentemente. Evitar en componentes con datos dinámicos o fechas.

```typescript
it('renderiza estructura base correctamente', () => {
  const wrapper = mount(StatusBadge, {
    props: { status: 'active', label: 'Activo' },
  })

  expect(wrapper.html()).toMatchSnapshot()
})
```

---

## 6. Testing de Stores (Pinia)

```typescript
// tests/unit/stores/useAuthStore.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/useAuthStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('inicia con usuario nulo', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('getter isAuthenticated retorna true cuando hay usuario', () => {
    const store = useAuthStore(
      createTestingPinia({
        initialState: {
          auth: { user: { id: '1', email: 'test@example.com' } },
        },
      }),
    )

    expect(store.isAuthenticated).toBe(true)
  })

  it('acción logout limpia el estado', async () => {
    const store = useAuthStore(
      createTestingPinia({
        initialState: {
          auth: { user: { id: '1' } },
        },
        createSpy: vi.fn,
      }),
    )

    await store.logout()

    expect(store.logout).toHaveBeenCalledOnce()
  })
})
```

---

## 7. MSW (Mock Service Worker)

MSW intercepta peticiones HTTP reales a nivel de red, lo que permite probar código que usa `fetch` o `axios` sin modificarlo.

### Configuración del servidor

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node'
import { authHandlers } from './handlers/auth'
import { recruitmentHandlers } from './handlers/recruitment'

export const server = setupServer(...authHandlers, ...recruitmentHandlers)
```

### Handlers de reclutamiento

```typescript
// tests/mocks/handlers/recruitment.ts
import { http, HttpResponse, delay } from 'msw'
import { createMockCandidate } from '../factories/candidate'

export const recruitmentHandlers = [
  http.get('/api/v1/candidates', () => {
    return HttpResponse.json({
      items: [createMockCandidate()],
      totalCount: 1,
      page: 1,
      pageSize: 20,
    })
  }),

  http.post('/api/v1/candidates', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(createMockCandidate(body as object), { status: 201 })
  }),

  // Simular respuesta lenta
  http.get('/api/v1/candidates/export', async () => {
    await delay(300)
    return new HttpResponse(new Blob(['csv,data']), {
      headers: { 'Content-Type': 'text/csv' },
    })
  }),
]
```

### Handlers de autenticación

```typescript
// tests/mocks/handlers/auth.ts
import { http, HttpResponse } from 'msw'

export const authHandlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    const { email } = (await request.json()) as { email: string }

    if (email === 'invalid@test.com') {
      return HttpResponse.json(
        { message: 'Credenciales incorrectas' },
        { status: 401 },
      )
    }

    return HttpResponse.json({ token: 'mock-jwt-token' })
  }),

  // Simular error de validación 422
  http.post('/api/v1/candidates', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>

    if (!body.givenName) {
      return HttpResponse.json(
        { errors: { givenName: ['El nombre es requerido'] } },
        { status: 422 },
      )
    }

    return HttpResponse.json({}, { status: 201 })
  }),
]
```

### Override por test

```typescript
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'

it('maneja error 500 del servidor', async () => {
  server.use(
    http.get('/api/v1/candidates', () => {
      return HttpResponse.json(
        { message: 'Error interno' },
        { status: 500 },
      )
    }),
  )

  // El handler temporal se limpia automáticamente en afterEach
  const wrapper = mount(CandidateList, { /* ... */ })
  await wrapper.vm.$nextTick()

  expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(true)
})
```

---

## 8. Anti-patrones de Testing

| Anti-patrón                               | Correcto                                    | Razón                               |
| ----------------------------------------- | ------------------------------------------- | ----------------------------------- |
| Testear detalles de implementación        | Testear comportamiento visible al usuario   | Frágil ante refactors internos      |
| Mockear Vue internals (`ref`, `computed`) | Dejar que la reactividad funcione           | Los tests no reflejan la realidad   |
| Snapshot de todo el componente            | Snapshot solo de estructura estable         | Genera falsos negativos constantes  |
| Testear internals de PrimeVue             | Testear el resultado visible en el DOM      | No es código propio                 |
| Tests sin assertions                      | Siempre assertar al menos un resultado      | Genera falsos positivos silenciosos |
| Tests que dependen de orden de ejecución  | Cada test es completamente independiente    | Fallos intermitentes difíciles      |
| Selectores por clase CSS o estructura DOM | Atributos `data-testid` explícitos          | Desacopla tests de estilos          |
| Datos hardcodeados en cada test           | Factories (`createMockCandidate()`)         | Centraliza y facilita mantenimiento |

---

## 9. Convenciones

### Nombrado de archivos

- Tests junto al componente: `CandidateForm.vue` → `CandidateForm.spec.ts`
- Tests en carpeta separada: `tests/components/recruitment/CandidateForm.spec.ts`
- Describe: nombre del componente, composable o store
- It: describe comportamiento desde la perspectiva del usuario

```typescript
// ✅ Correcto — comportamiento
it('muestra mensaje de error cuando el email ya existe')
it('deshabilita el botón mientras procesa la solicitud')

// ❌ Incorrecto — implementación
it('llama a setError con el campo email')
it('asigna isLoading = true')
```

### Factories de datos

```typescript
// tests/factories/candidate.ts
import type { Candidate } from '@/types/recruitment'

export function createMockCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: 'mock-uuid-1234',
    givenName: 'Ana',
    paternalName: 'Martínez',
    maternalName: 'Rojas',
    email: 'ana.martinez@example.com',
    phone: '+52 55 1234 5678',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    ...overrides,
  }
}
```

### Selectores `data-testid`

Agregar `data-testid` en los elementos clave del componente:

```vue
<InputText
  v-model="form.givenName"
  data-testid="given-name"
  :invalid="!!errors.givenName"
/>
<small v-if="errors.givenName" data-testid="given-name-error">
  {{ errors.givenName }}
</small>
<Button
  type="submit"
  data-testid="submit-btn"
  :loading="isSubmitting"
  label="Guardar"
/>
```

---

## 10. Comandos

```bash
# Ejecutar todos los tests
bun run test

# Solo tests unitarios
bun run test:unit

# Solo tests de componentes
bun run test:components

# Con reporte de cobertura
bun run test:coverage

# Modo watch (desarrollo)
bun run test:watch

# Filtrar por nombre
bun run test -- --reporter=verbose CandidateForm

# Un archivo específico
bun run test tests/components/recruitment/CandidateForm.spec.ts
```

### Scripts en `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:components": "vitest run tests/components",
    "test:integration": "vitest run tests/integration",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest"
  }
}
```
