# Guia de Arquitectura y Patrones de Componentes

> Patrones canonicos para construir componentes en la SPA Vue 3 de Kontrola.
> Seguir esta guia garantiza consistencia, testabilidad y ausencia de code smells.

---

## 1. Taxonomia de Componentes

Cada componente pertenece a exactamente uno de estos cuatro tipos. El tipo determina donde vive, cuanto puede crecer y que responsabilidades puede tener.

| Tipo | Ubicacion | Max. lineas | Props | State | API calls |
|------|-----------|-------------|-------|-------|-----------|
| **Page** | `src/pages/{Module}/` | 150 | Solo params de ruta | Minimo, delega a hijos | Nunca directamente |
| **Feature** | `src/pages/{Module}/_components/` | 300 | Interface tipada | Posee estado de dominio | Via composables |
| **Shared** | `src/components/shared/` | 200 | Genericos, reutilizables | Solo estado de UI | Nunca |
| **Layout** | `src/layouts/` | 100 | Basado en slots | Estado de navegacion | Nunca |

### Reglas de decision

- Si el componente usa la API directamente, es un **Feature** (envuelto en un composable).
- Si el componente no sabe nada del dominio (candidatos, vacantes), es **Shared**.
- Si el componente es el punto de entrada de una ruta, es **Page**.
- Si el componente solo provee estructura visual (sidebar, topbar, contenedor), es **Layout**.

---

## 2. Estructura de un Page Component

Un Page component orquesta. No hace fetch, no contiene logica de negocio: recibe params de ruta, instancia composables y conecta Feature components entre si.

### Patron Panel View (lista + detalle)

```vue
<!-- src/pages/Recruitment/CandidatesPage.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import CandidateList from './_components/CandidateList.vue'
import CandidateDetail from './_components/CandidateDetail.vue'
import EmptyState from '@/components/shared/EmptyState.vue'

// 1. Props — solo lo que viene de la ruta
const route = useRoute()

// 2. Computed — derivado de la ruta, no de llamadas API
const selectedId = computed(() => route.params.id as string | undefined)
const showDetail = computed(() => !!selectedId.value)
</script>

<template>
    <AppLayout>
        <div class="flex h-full overflow-hidden">
            <!-- Panel izquierdo: lista fija 380px -->
            <div
                class="w-full shrink-0 border-r border-surface lg:w-[380px]"
                :class="showDetail ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'"
            >
                <CandidateList :selected-id="selectedId" />
            </div>

            <!-- Panel derecho: detalle -->
            <div v-if="showDetail" class="flex flex-1 flex-col overflow-hidden">
                <CandidateDetail :candidate-id="selectedId!" />
            </div>

            <!-- Estado vacio en desktop -->
            <div v-else class="hidden flex-1 items-center justify-center lg:flex">
                <EmptyState
                    icon="pi pi-users"
                    title="Selecciona un candidato"
                    description="Elige un candidato de la lista para ver su perfil completo."
                    variant="compact"
                />
            </div>
        </div>
    </AppLayout>
</template>
```

### Orden canonico en `<script setup>`

```
1. Imports (Vue core → librerías → layouts → features → shared → composables → tipos)
2. Props — solo route params o configuracion minima
3. Composables — useRoute, useRouter, stores
4. State derivado — computed a partir de ruta o props
5. Handlers de navegacion — funciones que llaman router.push
```

El Page NO tiene: `ref()` para datos de dominio, llamadas a la API, `onMounted` con fetches.

---

## 3. Estructura de un Feature Component

Los Feature components poseen estado de dominio y llaman la API a traves de composables.

### CandidateList — DataTable con paginacion y filtros

```vue
<!-- src/pages/Recruitment/_components/CandidateList.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import { useCandidates } from '@/composables/useCandidates'
import type { Candidate } from '@/types/recruitment'

// Props
interface Props {
    selectedId?: string
}
const props = defineProps<Props>()

// Composable: toda la comunicacion con la API vive aqui
const { candidates, loading, total, filters, page, fetchCandidates } = useCandidates()

const router = useRouter()

// Handlers
function selectCandidate(candidate: Candidate) {
    router.push({ name: 'candidates.show', params: { id: candidate.uuid } })
}

function onSearch(value: string) {
    filters.value.search = value
    page.value = 1
}

// Severidad del estado del candidato
function stageSeverity(stage: string): string {
    const map: Record<string, string> = {
        applied: 'info',
        interview: 'warning',
        hired: 'success',
        rejected: 'danger',
    }
    return map[stage] ?? 'secondary'
}
</script>

<template>
    <div class="flex flex-col h-full">
        <!-- Cabecera con busqueda -->
        <div class="p-3 border-b border-surface flex gap-2">
            <InputText
                class="w-full"
                placeholder="Buscar candidato..."
                @update:model-value="onSearch"
            />
            <Button icon="pi pi-plus" @click="$emit('create')" v-tooltip="'Nuevo candidato'" />
        </div>

        <!-- Lista -->
        <div class="flex-1 overflow-auto">
            <DataTable
                :value="candidates"
                :loading="loading"
                selectionMode="single"
                :metaKeySelection="false"
                scrollable
                scrollHeight="flex"
                @row-click="(e) => selectCandidate(e.data)"
            >
                <!-- Skeleton mientras carga -->
                <template v-if="loading" #body>
                    <tr v-for="i in 8" :key="i">
                        <td><Skeleton height="2rem" /></td>
                        <td><Skeleton height="2rem" /></td>
                    </tr>
                </template>

                <Column field="fullName" header="Candidato">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
                                <i class="pi pi-user text-muted-color text-sm" />
                            </div>
                            <div>
                                <p class="text-sm font-medium text-color">{{ data.fullName }}</p>
                                <p class="text-xs text-muted-color">{{ data.email }}</p>
                            </div>
                        </div>
                    </template>
                </Column>

                <Column field="stage" header="Etapa">
                    <template #body="{ data }">
                        <Tag :value="data.stage" :severity="stageSeverity(data.stage)" />
                    </template>
                </Column>

                <!-- Estado vacio -->
                <template #empty>
                    <div class="py-8 text-center text-muted-color text-sm">
                        No se encontraron candidatos.
                    </div>
                </template>
            </DataTable>
        </div>

        <!-- Paginador -->
        <div class="border-t border-surface p-2">
            <Paginator
                :rows="filters.perPage"
                :total-records="total"
                :first="(page - 1) * filters.perPage"
                template="PrevPageLink PageLinks NextPageLink"
                @page="(e) => (page = e.page + 1)"
            />
        </div>
    </div>
</template>
```

### CandidateForm — Drawer con validacion

```vue
<!-- src/pages/Recruitment/_components/CandidateForm.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import Drawer from 'primevue/drawer'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { CandidateApi } from '@/api/generated'
import type { CreateCandidateRequest } from '@/types/recruitment'

interface Props {
    visible: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
    'update:visible': [value: boolean]
    created: [candidateId: string]
}>()

const toast = useToast()
const loading = ref(false)
const errors = ref<Partial<Record<keyof CreateCandidateRequest, string>>>({})

const form = ref<CreateCandidateRequest>({
    givenName: '',
    paternalName: '',
    maternalName: '',
    email: '',
})

// Limpiar errores al cerrar
watch(() => props.visible, (val) => {
    if (!val) {
        errors.value = {}
        form.value = { givenName: '', paternalName: '', maternalName: '', email: '' }
    }
})

async function submit() {
    loading.value = true
    errors.value = {}
    try {
        const { data } = await CandidateApi.store(form.value)
        toast.add({ severity: 'success', summary: 'Candidato creado', life: 3000 })
        emit('created', data.uuid)
        emit('update:visible', false)
    } catch (e: any) {
        if (e.response?.status === 422) {
            errors.value = e.response.data.errors
        } else {
            toast.add({ severity: 'error', summary: 'Error al guardar', life: 4000 })
        }
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <Drawer
        :visible="visible"
        position="right"
        class="!w-full md:!w-[480px]"
        :dismissable="false"
        @update:visible="$emit('update:visible', $event)"
    >
        <template #header>
            <h2 class="text-base font-semibold text-color">Nuevo candidato</h2>
        </template>

        <form class="flex flex-col gap-4 p-4" @submit.prevent="submit">
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-color">Nombre(s) *</label>
                <InputText v-model="form.givenName" :invalid="!!errors.givenName" />
                <small v-if="errors.givenName" class="text-red-500">{{ errors.givenName }}</small>
            </div>

            <div class="flex gap-3">
                <div class="flex flex-col gap-1 flex-1">
                    <label class="text-sm font-medium text-color">Apellido paterno *</label>
                    <InputText v-model="form.paternalName" :invalid="!!errors.paternalName" />
                    <small v-if="errors.paternalName" class="text-red-500">{{ errors.paternalName }}</small>
                </div>
                <div class="flex flex-col gap-1 flex-1">
                    <label class="text-sm font-medium text-color">Apellido materno</label>
                    <InputText v-model="form.maternalName" />
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-color">Correo electronico *</label>
                <InputText v-model="form.email" type="email" :invalid="!!errors.email" />
                <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
            </div>
        </form>

        <template #footer>
            <div class="flex justify-end gap-2 p-4 border-t border-surface">
                <Button label="Cancelar" severity="secondary" @click="$emit('update:visible', false)" />
                <Button label="Guardar" :loading="loading" @click="submit" />
            </div>
        </template>
    </Drawer>
</template>
```

### CandidateDetail — Header fijo + contenido scrolleable

```vue
<!-- src/pages/Recruitment/_components/CandidateDetail.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import { useCandidateDetail } from '@/composables/useCandidateDetail'

interface Props {
    candidateId: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
    edit: [id: string]
}>()

const { candidate, loading, fetch } = useCandidateDetail()

watch(() => props.candidateId, fetch, { immediate: true })
</script>

<template>
    <div class="flex flex-col h-full overflow-hidden">
        <!-- Header fijo -->
        <div class="shrink-0 flex items-center justify-between px-4 py-3 border-b border-surface bg-surface-0 dark:bg-surface-900">
            <div v-if="loading" class="flex items-center gap-3">
                <Skeleton shape="circle" size="2.5rem" />
                <Skeleton width="12rem" height="1.25rem" />
            </div>
            <div v-else class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                    <i class="pi pi-user text-muted-color" />
                </div>
                <div>
                    <h1 class="text-sm font-semibold text-color">{{ candidate?.fullName }}</h1>
                    <p class="text-xs text-muted-color">{{ candidate?.email }}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <Tag v-if="candidate" :value="candidate.stage" severity="info" />
                <Button icon="pi pi-pencil" text rounded @click="emit('edit', props.candidateId)" />
            </div>
        </div>

        <!-- Cuerpo scrolleable -->
        <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <!-- Contenido del detalle... -->
        </div>
    </div>
</template>
```

---

## 4. Composicion sobre Herencia

Vue 3 no tiene herencia de componentes. La composicion se expresa via slots, composables y provide/inject.

### Slots para layouts flexibles

```vue
<!-- src/components/shared/ResourcePanel.vue -->
<template>
    <div class="flex flex-col h-full">
        <div class="shrink-0 px-4 py-3 border-b border-surface">
            <slot name="header" />
        </div>
        <div class="flex-1 overflow-auto">
            <slot />
        </div>
        <div v-if="$slots.footer" class="shrink-0 border-t border-surface">
            <slot name="footer" />
        </div>
    </div>
</template>
```

### Composable para logica reutilizable

```typescript
// src/composables/useCandidates.ts
export function useCandidates() {
    const candidates = ref<Candidate[]>([])
    const loading = ref(false)
    const total = ref(0)
    const page = ref(1)
    const filters = ref({ search: '', perPage: 20 })

    async function fetchCandidates() {
        loading.value = true
        try {
            const { data } = await CandidateApi.index({
                page: page.value,
                search: filters.value.search,
                perPage: filters.value.perPage,
            })
            candidates.value = data.items
            total.value = data.total
        } finally {
            loading.value = false
        }
    }

    watch([page, filters], fetchCandidates, { deep: true, immediate: true })

    return { candidates, loading, total, page, filters, fetchCandidates }
}
```

### Provide/Inject para datos compartidos profundamente

Usar cuando los datos son necesarios en multiples niveles y pasarlos como props crearia prop drilling de mas de 2 niveles.

```typescript
// src/pages/Recruitment/CandidatesPage.vue — proveedor
import { provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { PipelineConfig } from '@/types/recruitment'

export const PipelineKey: InjectionKey<PipelineConfig> = Symbol('pipeline')

// En el Page component:
provide(PipelineKey, pipelineConfig)
```

```typescript
// src/pages/Recruitment/_components/ApplicationCard.vue — consumidor
import { inject } from 'vue'
import { PipelineKey } from '../CandidatesPage.vue'

const pipeline = inject(PipelineKey) // Tipado automaticamente
```

### Cuando usar provide/inject vs Pinia

| Escenario | Usar |
|-----------|------|
| Estado dentro de un modulo/pagina | provide/inject |
| Estado de autenticacion | Pinia (`useAuthStore`) |
| Notificaciones globales | Pinia (`useNotificationStore`) |
| Configuracion de tema/tenant | provide/inject en AppLayout |
| Datos de formulario multi-paso | provide/inject en el componente padre |
| Cache de API compartida entre rutas | Pinia |

---

## 5. Patrones de Comunicacion

| Direccion | Mecanismo | Ejemplo |
|-----------|-----------|---------|
| Parent → Child | Props | `<CandidateList :candidates="data" :loading="loading" />` |
| Child → Parent | Emits tipados | `emit('select', candidate)` |
| Hermano → Hermano | Estado en parent | Page mantiene `selectedId`, pasa a ambos hijos |
| Nesting profundo | provide/inject | Permisos de pipeline, config de tenant |
| Global | Pinia store | `useAuthStore`, notificaciones |
| v-model | props + emit | `v-model:visible` en Drawer |

### Emits siempre tipados

```typescript
// Feature component — emits explicitos
const emit = defineEmits<{
    select: [candidate: Candidate]
    create: []
    'update:visible': [value: boolean]
}>()
```

---

## 6. Formularios

### Composable de formulario reutilizable

```typescript
// src/composables/useForm.ts
export function useForm<T extends object>(initialValues: T) {
    const form = ref<T>({ ...initialValues })
    const errors = ref<Partial<Record<keyof T, string>>>({})
    const loading = ref(false)
    const isDirty = computed(() => JSON.stringify(form.value) !== JSON.stringify(initialValues))

    function reset() {
        form.value = { ...initialValues }
        errors.value = {}
    }

    function setErrors(serverErrors: Record<string, string>) {
        errors.value = serverErrors as Partial<Record<keyof T, string>>
    }

    return { form, errors, loading, isDirty, reset, setErrors }
}
```

### Validacion: eager on blur, silenciosa on mount

```vue
<script setup lang="ts">
const touched = ref<Set<string>>(new Set())

function onBlur(field: string) {
    touched.value.add(field)
}

// Solo mostrar error si el campo fue tocado
const emailError = computed(() =>
    touched.value.has('email') ? errors.value.email : undefined
)
</script>

<template>
    <InputText
        v-model="form.email"
        :invalid="!!emailError"
        @blur="onBlur('email')"
    />
    <small v-if="emailError" class="text-red-500">{{ emailError }}</small>
</template>
```

### Dirty check antes de cerrar Drawer

```vue
<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm'

const confirm = useConfirm()

function requestClose() {
    if (isDirty.value) {
        confirm.require({
            message: 'Tienes cambios sin guardar. ¿Deseas descartarlos?',
            header: 'Descartar cambios',
            acceptLabel: 'Descartar',
            rejectLabel: 'Continuar editando',
            acceptClass: 'p-button-danger',
            accept: () => emit('update:visible', false),
        })
    } else {
        emit('update:visible', false)
    }
}
</script>
```

---

## 7. DataTable Patterns

### Server-side con paginacion, ordenamiento y filtros

```vue
<DataTable
    :value="applications"
    :loading="loading"
    lazy
    paginator
    :rows="filters.perPage"
    :total-records="total"
    v-model:sort-field="filters.sortField"
    v-model:sort-order="filters.sortOrder"
    @page="(e) => (filters.page = e.page + 1)"
    @sort="onSort"
    striped-rows
    removable-sort
>
    <Column field="candidate.fullName" header="Candidato" sortable>
        <template #body="{ data }">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
                    <i class="pi pi-user text-muted-color text-xs" />
                </div>
                <span class="text-sm text-color">{{ data.candidate.fullName }}</span>
            </div>
        </template>
    </Column>

    <Column field="vacancy.title" header="Vacante" sortable />

    <Column field="stage" header="Etapa">
        <template #body="{ data }">
            <Tag :value="data.stage" :severity="stageSeverity(data.stage)" />
        </template>
    </Column>

    <Column header="Acciones" style="width: 6rem">
        <template #body="{ data }">
            <div class="flex gap-1">
                <Button icon="pi pi-eye" text rounded size="small" @click="viewApplication(data)" />
                <Button icon="pi pi-ellipsis-v" text rounded size="small" @click="(e) => menu.toggle(e)" />
            </div>
        </template>
    </Column>

    <template #empty>
        <EmptyState icon="pi pi-inbox" title="Sin aplicaciones" description="No hay aplicaciones que coincidan con los filtros." variant="compact" />
    </template>
</DataTable>
```

### Exportar desde la cabecera de la tabla

```vue
<template #header>
    <div class="flex justify-between items-center">
        <span class="text-sm font-semibold text-color">{{ total }} aplicaciones</span>
        <SplitButton
            label="Exportar"
            icon="pi pi-download"
            :model="exportOptions"
            size="small"
            severity="secondary"
        />
    </div>
</template>
```

---

## 8. Patrones de Estado de UI

### Mapa de severidades para Toast

```typescript
// src/composables/useNotify.ts
export function useNotify() {
    const toast = useToast()

    return {
        success: (summary: string, detail?: string) =>
            toast.add({ severity: 'success', summary, detail, life: 3000 }),
        error: (summary: string, detail?: string) =>
            toast.add({ severity: 'error', summary, detail, life: 5000 }),
        warn: (summary: string, detail?: string) =>
            toast.add({ severity: 'warn', summary, detail, life: 4000 }),
        info: (summary: string, detail?: string) =>
            toast.add({ severity: 'info', summary, detail, life: 3000 }),
    }
}
```

### Actualizacion optimista

```typescript
async function moveApplicationToStage(appId: string, newStage: string) {
    // 1. Actualizar UI inmediatamente
    const prev = applications.value.find(a => a.uuid === appId)!
    const prevStage = prev.stage
    prev.stage = newStage

    try {
        await ApplicationApi.move(appId, { stage: newStage })
    } catch {
        // 2. Revertir si falla
        prev.stage = prevStage
        notify.error('No se pudo mover la aplicacion')
    }
}
```

### Empty states diferenciados

```typescript
type EmptyReason = 'first-use' | 'no-results' | 'error' | 'no-permission'

// first-use: tabla vacia, sin busqueda activa → mostrar CTA primario
// no-results: busqueda sin resultados → limpiar filtros
// error: fallo de red → reintentar
// no-permission: sin acceso al modulo → contactar admin
```

---

## 9. Anti-patrones de Componentes

| Anti-patron | Correcto | Por que |
|-------------|----------|---------|
| `defineExpose({ form })` | `emit('submit', data)` | Rompe encapsulacion, acopla al padre |
| `v-html` con datos de usuario sin sanitizar | Texto plano o sanitize primero | Riesgo XSS |
| Logica de negocio en template | Computed o metodo nombrado | Ilegible, no testeable |
| `watch` profundo en objetos grandes | `watchEffect` o `watch` en campo especifico | Performance |
| Handlers inline complejos en template | Metodos nombrados en `<script>` | Legibilidad y debugging |
| `setTimeout` para esperar renders | `nextTick()` o `watch` reactivo | Race conditions |
| Multiples `v-if` en cascada | Componente dinamico (`<component :is>`) o computed | Mantenibilidad |
| Llamar API directamente en el componente | Composable que encapsula el fetch | Reutilizacion y testabilidad |
| Props de mas de 2 niveles de profundidad | provide/inject o Pinia store | Prop drilling |
| `ref` para derivar valor de otro `ref` | `computed` | Se desincroniza, causa bugs |
| Importar un Model/tipo desde otro modulo directamente | Definir tipo en `src/types/` compartido | Acoplamiento de dominios |

### Ejemplo: logica fuera del template

```vue
<!-- Incorrecto -->
<template>
    <Tag :severity="candidate.stage === 'hired' ? 'success' : candidate.stage === 'rejected' ? 'danger' : 'info'" />
</template>

<!-- Correcto -->
<script setup lang="ts">
function stageSeverity(stage: string): string {
    const map: Record<string, string> = {
        hired: 'success',
        rejected: 'danger',
        interview: 'warning',
    }
    return map[stage] ?? 'info'
}
</script>
<template>
    <Tag :severity="stageSeverity(candidate.stage)" />
</template>
```

### Ejemplo: watch especifico vs profundo

```typescript
// Incorrecto — re-ejecuta ante cualquier cambio en el objeto
watch(filters, fetchCandidates, { deep: true })

// Correcto — solo cuando cambia lo que importa
watch([() => filters.value.search, () => filters.value.page], fetchCandidates)
```

---

## Referencias

- `CLAUDE.md` — Reglas criticas del proyecto
- `.claude/rules/vue.md` — Convenciones PrimeVue y semantic tokens
- `src/composables/` — Composables disponibles
- `src/types/` — Interfaces de dominio compartidas
- [PrimeVue 4 Docs](https://primevue.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
