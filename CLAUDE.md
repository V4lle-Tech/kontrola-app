# Kontrola App (Frontend)

> SPA Vue 3 para Kontrola ERP — consume API REST de kontrola-net.

## Stack

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **UI**: PrimeVue 4 (Aura preset, zero custom styles)
- **CSS**: Tailwind CSS v4 + `tailwindcss-primeui`
- **Router**: Vue Router 4
- **State**: Pinia
- **HTTP**: Axios (API client auto-generated from OpenAPI)
- **Build**: Vite
- **Language**: TypeScript
- **Icons**: PrimeIcons (NO lucide-vue-next)

## Estructura

```
src/
├── api/
│   ├── client.ts               # Axios instance + interceptors (JWT)
│   └── generated/              # Auto-generated from OpenAPI spec
├── pages/
│   ├── Auth/                   # Login, Register, ForgotPassword
│   ├── Recruitment/            # Candidates, Vacancies, Pipeline, Kanban
│   ├── Documents/              # DocumentTypes, Documents, Compliance
│   ├── CRM/                    # Clients
│   ├── Access/                 # Roles, Permissions
│   ├── Settings/               # Profile, Business
│   └── Admin/                  # Panel superadmin
├── components/shared/          # Reusable components (NO PrimeVue wrappers)
├── layouts/
│   ├── AppLayout.vue           # Tenant
│   ├── AdminLayout.vue         # Admin
│   └── GuestLayout.vue         # Auth pages
├── stores/                     # Pinia stores
├── composables/                # Reusable composables
├── router/                     # Vue Router config
└── types/                      # TypeScript interfaces
```

## Relacion con kontrola-net

- Este SPA consume la API REST de `kontrola-net`
- El contrato es el OpenAPI spec generado por .NET
- Autenticacion via JWT Bearer token
- El portal publico (SEO) lo sirve Razor Pages en kontrola-net, NO este SPA

## Comandos

```bash
# Desarrollo
bun dev

# Build
bun run build

# Lint
bun run lint

# Type check
bun run type-check

# Format
bun run format

# Generar API client desde OpenAPI spec
bun run api:generate
```

## Reglas Criticas

### 1. PrimeVue directo, sin wrappers

```vue
<script setup lang="ts">
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
</script>
```

### 2. Semantic Tokens (NO colores Tailwind directos)

| Incorrecto | Correcto |
|---|---|
| `text-gray-900 dark:text-white` | `text-color` |
| `bg-white dark:bg-gray-900` | `bg-surface-0 dark:bg-surface-900` |
| `border-gray-300` | `border-surface` |
| `bg-blue-600` | `bg-primary` |

### 3. Dark Mode: bg-surface-N requiere dark: counterpart

```vue
<!-- Correcto -->
<div class="bg-surface-0 dark:bg-surface-900">Card</div>

<!-- Incorrecto -->
<div class="bg-surface-0">Blanco en dark mode</div>
```

### 4. Routing: Vue Router

```typescript
import { useRouter } from 'vue-router';
const router = useRouter();
router.push({ name: 'candidates.show', params: { id } });
```

### 5. API calls: Generated client + Client-generated IDs

```typescript
import { CandidateApi } from '@/api/generated';
import { generateId } from '@/utils/uuid';

// Read
const api = new CandidateApi();
const { data } = await api.getCandidates();

// Create (PUT with client-generated UUIDv7)
const id = generateId();
await api.upsertCandidate(id, candidateData); // PUT /candidates/{id}
```

**Resource creation uses PUT** (not POST). Frontend generates UUIDv7 IDs optimized for SQL Server.
See `docs/guides/api-client.md` § 3.1 for the `generateId()` implementation.

### 6. Auth: JWT en Pinia store (token en memoria, NUNCA localStorage)

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref<string | null>(null); // Solo en memoria
    const user = ref<User | null>(null);
    const isAuthenticated = computed(() => !!accessToken.value);

    async function login(credentials: LoginRequest) {
        const { data } = await AuthApi.login(credentials);
        accessToken.value = data.accessToken;
        user.value = data.user;
        scheduleRefresh(data.expiresIn);
    }

    async function refreshSession() {
        // Refresh token viaja en HttpOnly cookie (seguro contra XSS)
        const { data } = await AuthApi.refresh();
        accessToken.value = data.accessToken;
        scheduleRefresh(data.expiresIn);
    }

    function logout() {
        accessToken.value = null;
        user.value = null;
        AuthApi.logout(); // Invalida refresh cookie en servidor
    }

    return { accessToken, user, isAuthenticated, login, refreshSession, logout };
});
```

## Documentación

| Guía                                   | Contenido                                |
| -------------------------------------- | ---------------------------------------- |
| `docs/guides/vue3-best-practices.md`   | Anti-patrones, TypeScript, rendimiento   |
| `docs/guides/component-patterns.md`    | Taxonomía, composición, formularios      |
| `docs/guides/pinia-stores.md`          | Arquitectura stores, auth, testing       |
| `docs/guides/api-client.md`            | HTTP layer, OpenAPI, errores RFC 9457    |
| `docs/guides/testing-strategy.md`      | Vitest, Vue Test Utils, MSW              |
| `.claude/rules/architecture-constraints.md` | 15 restricciones binarias           |

## Fase del Proyecto

**Estado actual: SETUP**

El frontend se construira progresivamente conforme el backend (kontrola-net) implemente cada modulo segun el ROADMAP.
