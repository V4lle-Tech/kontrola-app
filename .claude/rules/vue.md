# Reglas Vue

## Stack

| Elemento     | Version | Uso                                                |
| ------------ | ------- | -------------------------------------------------- |
| PrimeVue     | 4       | Unica libreria UI                                  |
| Tailwind CSS | 4       | Utilities + semantic tokens via tailwindcss-primeui |
| Vue Router   | 4       | Client-side routing                                |
| Pinia        | 2       | State management                                   |
| Axios        | 1       | HTTP client (con interceptors JWT)                 |
| Vue          | 3       | Framework                                          |

**NO usar**: shadcn-vue, reka-ui, radix-vue, lucide-vue-next, vue-sonner, class-variance-authority, clsx, tailwind-merge.

## Guias Detalladas

| Guía | Contenido |
|------|-----------|
| `docs/guides/vue3-best-practices.md` | Anti-patrones PHP→SPA, TypeScript estricto, rendimiento |
| `docs/guides/component-patterns.md` | Taxonomía, composición, DataTable, formularios |
| `docs/guides/pinia-stores.md` | Setup stores, auth JWT, testing, anti-patrones |
| `docs/guides/api-client.md` | HTTP layer, OpenAPI client, errores RFC 9457 |
| `docs/guides/testing-strategy.md` | Vitest, Vue Test Utils, MSW, factories |
| `.claude/rules/architecture-constraints.md` | 15 restricciones binarias |

---

## Reglas Criticas

### 1. Imports de PrimeVue

Siempre importar directamente desde `primevue/*`. Nunca crear wrappers.

```vue
<script setup lang="ts">
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
</script>
```

### 2. Routing: Vue Router

```typescript
// Correcto
import { useRouter } from 'vue-router';
const router = useRouter();
router.push({ name: 'candidates.show', params: { id } });

// Incorrecto
route('candidates.show'); // No existe route() helper
```

### 3. API Calls

```typescript
// Correcto - usar API client generado
import { CandidateApi } from '@/api/generated';

// Correcto - usar axios directamente para custom calls
import { api } from '@/api/client';
const { data } = await api.get('/candidates');

// Incorrecto - URLs hardcoded
fetch('http://localhost:5000/api/candidates');
```

### 4. Semantic Tokens (CRITICO)

Siempre usar semantic tokens de PrimeVue. Nunca usar colores Tailwind directos.

| Incorrecto                      | Correcto                           |
| ------------------------------- | ---------------------------------- |
| `text-gray-900 dark:text-white` | `text-color`                       |
| `text-gray-600`                 | `text-muted-color`                 |
| `bg-white dark:bg-gray-900`     | `bg-surface-0 dark:bg-surface-900` |
| `border-gray-300`               | `border-surface`                   |
| `bg-blue-600`                   | `bg-primary`                       |

### 5. Dark Mode

Tokens que auto-adaptan (NO necesitan `dark:`):
- `text-color`, `text-muted-color`, `border-surface`, `bg-emphasis`, `bg-highlight`, `bg-primary`

Tokens que REQUIEREN `dark:` counterpart:
- `bg-surface-0` → `dark:bg-surface-900`
- `bg-surface-50` → `dark:bg-surface-800`
- `bg-surface-100` → `dark:bg-surface-800`
- `hover:bg-surface-50` → `dark:hover:bg-surface-800`

### 6. Estructura de Componente

```vue
<script setup lang="ts">
// 1. Imports
// 2. Props con interface + withDefaults
// 3. Emits tipados
// 4. State (ref, reactive)
// 5. Computed
// 6. Methods
// 7. Lifecycle (onMounted, etc.)
</script>

<template>
    <!-- Contenido -->
</template>
```

### 7. Props y Emits Tipados

```typescript
interface Props {
    items: Item[];
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    loading: false,
});

const emit = defineEmits<{
    select: [item: Item];
    'update:modelValue': [value: string];
}>();
```

### 8. Forms

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi';
import { useToast } from 'primevue/usetoast';
import type { ApiError } from '@/types/api';

const toast = useToast();
const { createCandidate, loading, error } = useRecruitmentApi();

const form = ref({
    givenName: '',
    paternalName: '',
    email: '',
});
const fieldErrors = ref<Record<string, string[]>>({});

async function submit() {
    fieldErrors.value = {};
    try {
        await createCandidate(form.value);
        toast.add({ severity: 'success', summary: 'Guardado', life: 3000 });
    } catch (e: unknown) {
        const apiError = e as ApiError;
        if (apiError.status === 422 && apiError.errors) {
            fieldErrors.value = apiError.errors;
        } else {
            toast.add({ severity: 'error', summary: apiError.title ?? 'Error', life: 5000 });
        }
    }
}
</script>

<template>
    <form @submit.prevent="submit">
        <InputText v-model="form.givenName" :invalid="!!fieldErrors.givenName" />
        <small v-if="fieldErrors.givenName" class="p-error">{{ fieldErrors.givenName[0] }}</small>
        <Button type="submit" :loading="loading" label="Guardar" />
    </form>
</template>
```

> Ver `docs/guides/api-client.md` para tipado completo de errores RFC 9457.

### 9. Iconos

Usar `primeicons`. NO usar lucide-vue-next.

```vue
<Button icon="pi pi-plus" label="Nuevo" />
<i class="pi pi-search" />
```

---

## Panel View Pattern

Patron canonico para modulos con lista + detalle.

```vue
<template>
    <AppLayout>
        <div class="flex h-full">
            <!-- Panel izquierdo: Lista fija 380px -->
            <div class="w-full shrink-0 border-r border-surface lg:w-[380px]"
                 :class="showDetail ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'">
                <ResourceList />
            </div>

            <!-- Panel derecho: Detalle -->
            <div v-if="showDetail" class="flex flex-1 flex-col overflow-hidden">
                <ResourceDetail />
            </div>

            <!-- Estado vacio desktop -->
            <div v-else class="hidden flex-1 items-center justify-center lg:flex">
                <EmptyState icon="pi pi-box" title="Selecciona un elemento" />
            </div>
        </div>
    </AppLayout>
</template>
```

---

## Estructura de Proyecto

```
src/
├── pages/
│   ├── Auth/
│   ├── Recruitment/
│   ├── Documents/
│   ├── CRM/
│   ├── Access/
│   ├── Settings/
│   └── Admin/
├── layouts/
│   ├── AppLayout.vue
│   ├── AdminLayout.vue
│   └── GuestLayout.vue
├── components/shared/
├── stores/
├── composables/
├── router/
├── api/
│   ├── client.ts
│   └── generated/
└── types/
```
