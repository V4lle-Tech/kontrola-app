<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Stepper from 'primevue/stepper'
import StepList from 'primevue/steplist'
import StepItem from 'primevue/stepitem'
import Step from 'primevue/step'
import StepPanels from 'primevue/steppanels'
import StepPanel from 'primevue/steppanel'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type {
  JobProfile,
  EmploymentType,
  ConfidentialityLevel,
  SelectionProcess,
  Tag as TagType,
} from '@/types/recruitment'
import type { ApiError } from '@/types/api'

const emit = defineEmits<{
  created: [profile: JobProfile]
  cancel: []
}>()

const api = useRecruitmentApi()
const toast = useToast()

// Form state
const form = ref({
  // Step 1: Basic Info
  title: '',
  description: '',
  employmentType: 'full_time' as EmploymentType,
  confidentialityLevel: 'public' as ConfidentialityLevel,
  salaryMin: null as number | null,
  salaryMax: null as number | null,
  clientId: '',
  // Step 2: Requirements & Functions
  requirements: [''] as string[],
  functions: [''] as string[],
  benefits: [''] as string[],
  // Step 3: Selection Process
  selectionProcessId: '',
  // Step 4: Tags
  tagIds: [] as string[],
})

const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const loading = ref(false)

// Options data
const selectionProcesses = ref<SelectionProcess[]>([])
const availableTags = ref<TagType[]>([])

const employmentTypeOptions = [
  { label: 'Tiempo completo', value: 'full_time' },
  { label: 'Medio tiempo', value: 'part_time' },
  { label: 'Contrato', value: 'contract' },
  { label: 'Temporal', value: 'temporary' },
  { label: 'Prácticas', value: 'internship' },
]

const confidentialityOptions = [
  { label: 'Público', value: 'public' },
  { label: 'Ocultar logo', value: 'hide_logo' },
  { label: 'Ocultar ubicación', value: 'hide_location' },
  { label: 'Confidencial', value: 'confidential' },
]

// Dynamic list management
function addItem(list: string[]) {
  list.push('')
}

function removeItem(list: string[], index: number) {
  list.splice(index, 1)
}

function cleanList(list: string[]): string[] {
  return list.filter((item) => item.trim() !== '')
}

// Submit
async function submit() {
  fieldErrors.value = {}
  generalError.value = ''
  loading.value = true

  try {
    const profile = await api.createJobProfile({
      title: form.value.title,
      description: form.value.description || undefined,
      employmentType: form.value.employmentType,
      confidentialityLevel: form.value.confidentialityLevel,
      salaryMin: form.value.salaryMin ?? undefined,
      salaryMax: form.value.salaryMax ?? undefined,
      clientId: form.value.clientId || undefined,
      requirements: cleanList(form.value.requirements),
      functions: cleanList(form.value.functions),
      benefits: cleanList(form.value.benefits),
      selectionProcessId: form.value.selectionProcessId || undefined,
      tagIds: form.value.tagIds.length > 0 ? form.value.tagIds : undefined,
    })
    toast.add({ severity: 'success', summary: 'Perfil de puesto creado', life: 3000 })
    emit('created', profile)
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al crear perfil de puesto'
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const [processesResult, tags] = await Promise.all([
      api.getSelectionProcesses({ pageSize: 100 }),
      api.getTags('job_profile'),
    ])
    selectionProcesses.value = processesResult.items
    availableTags.value = tags
  } catch {
    // Options unavailable
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <Message v-if="generalError" severity="error" :closable="false">
      {{ generalError }}
    </Message>

    <Stepper value="1" linear>
      <StepList>
        <StepItem value="1">
          <Step>Información básica</Step>
        </StepItem>
        <StepItem value="2">
          <Step>Requisitos y funciones</Step>
        </StepItem>
        <StepItem value="3">
          <Step>Proceso de selección</Step>
        </StepItem>
        <StepItem value="4">
          <Step>Etiquetas</Step>
        </StepItem>
        <StepItem value="5">
          <Step>Revisión</Step>
        </StepItem>
      </StepList>

      <StepPanels>
        <!-- Step 1: Basic Info -->
        <StepPanel v-slot="{ activateCallback }" value="1">
          <div class="flex flex-col gap-4 p-2">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="flex flex-col gap-1 sm:col-span-2">
                <label for="wp-title" class="text-sm font-medium text-color">Título del puesto</label>
                <InputText
                  id="wp-title"
                  v-model="form.title"
                  :invalid="!!fieldErrors.title"
                  placeholder="Ej: Desarrollador Full Stack"
                />
                <small v-if="fieldErrors.title" class="text-red-500">{{ fieldErrors.title[0] }}</small>
              </div>

              <div class="flex flex-col gap-1 sm:col-span-2">
                <label for="wp-description" class="text-sm font-medium text-color">Descripción</label>
                <Textarea
                  id="wp-description"
                  v-model="form.description"
                  rows="4"
                  auto-resize
                />
              </div>

              <div class="flex flex-col gap-1">
                <label for="wp-employment" class="text-sm font-medium text-color">Tipo de empleo</label>
                <Select
                  id="wp-employment"
                  v-model="form.employmentType"
                  :options="employmentTypeOptions"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label for="wp-confidentiality" class="text-sm font-medium text-color">Confidencialidad</label>
                <Select
                  id="wp-confidentiality"
                  v-model="form.confidentialityLevel"
                  :options="confidentialityOptions"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label for="wp-salary-min" class="text-sm font-medium text-color">Salario mínimo</label>
                <InputNumber
                  id="wp-salary-min"
                  v-model="form.salaryMin"
                  mode="currency"
                  currency="MXN"
                  locale="es-MX"
                  class="w-full"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label for="wp-salary-max" class="text-sm font-medium text-color">Salario máximo</label>
                <InputNumber
                  id="wp-salary-max"
                  v-model="form.salaryMax"
                  mode="currency"
                  currency="MXN"
                  locale="es-MX"
                  class="w-full"
                />
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <Button label="Cancelar" severity="secondary" text @click="emit('cancel')" />
              <Button label="Siguiente" icon="pi pi-arrow-right" icon-pos="right" @click="activateCallback('2')" />
            </div>
          </div>
        </StepPanel>

        <!-- Step 2: Requirements & Functions -->
        <StepPanel v-slot="{ activateCallback }" value="2">
          <div class="flex flex-col gap-4 p-2">
            <!-- Requirements -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-color">Requisitos</label>
                <button type="button" class="text-xs text-primary hover:underline" @click="addItem(form.requirements)">
                  + Agregar
                </button>
              </div>
              <div v-for="(_, idx) in form.requirements" :key="idx" class="flex gap-2">
                <InputText
                  v-model="form.requirements[idx]"
                  placeholder="Ej: 3 años de experiencia"
                  class="flex-1"
                />
                <Button
                  v-if="form.requirements.length > 1"
                  icon="pi pi-times"
                  severity="danger"
                  text
                  size="small"
                  @click="removeItem(form.requirements, idx)"
                />
              </div>
            </div>

            <!-- Functions -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-color">Funciones</label>
                <button type="button" class="text-xs text-primary hover:underline" @click="addItem(form.functions)">
                  + Agregar
                </button>
              </div>
              <div v-for="(_, idx) in form.functions" :key="idx" class="flex gap-2">
                <InputText
                  v-model="form.functions[idx]"
                  placeholder="Ej: Desarrollar APIs REST"
                  class="flex-1"
                />
                <Button
                  v-if="form.functions.length > 1"
                  icon="pi pi-times"
                  severity="danger"
                  text
                  size="small"
                  @click="removeItem(form.functions, idx)"
                />
              </div>
            </div>

            <!-- Benefits -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-color">Beneficios</label>
                <button type="button" class="text-xs text-primary hover:underline" @click="addItem(form.benefits)">
                  + Agregar
                </button>
              </div>
              <div v-for="(_, idx) in form.benefits" :key="idx" class="flex gap-2">
                <InputText
                  v-model="form.benefits[idx]"
                  placeholder="Ej: Seguro de gastos médicos"
                  class="flex-1"
                />
                <Button
                  v-if="form.benefits.length > 1"
                  icon="pi pi-times"
                  severity="danger"
                  text
                  size="small"
                  @click="removeItem(form.benefits, idx)"
                />
              </div>
            </div>

            <div class="flex justify-between gap-2 pt-2">
              <Button label="Anterior" icon="pi pi-arrow-left" severity="secondary" text @click="activateCallback('1')" />
              <Button label="Siguiente" icon="pi pi-arrow-right" icon-pos="right" @click="activateCallback('3')" />
            </div>
          </div>
        </StepPanel>

        <!-- Step 3: Selection Process -->
        <StepPanel v-slot="{ activateCallback }" value="3">
          <div class="flex flex-col gap-4 p-2">
            <div class="flex flex-col gap-1">
              <label for="wp-process" class="text-sm font-medium text-color">Proceso de selección</label>
              <Select
                id="wp-process"
                v-model="form.selectionProcessId"
                :options="selectionProcesses"
                option-label="name"
                option-value="id"
                placeholder="Seleccionar proceso"
                show-clear
                class="w-full"
              />
              <small class="text-muted-color">Opcional. Se puede asignar después.</small>
            </div>

            <div v-if="form.selectionProcessId" class="rounded-lg border border-surface p-3">
              <p class="mb-2 text-sm font-medium text-color">Etapas del proceso:</p>
              <div class="flex flex-wrap gap-2">
                <Tag
                  v-for="process in selectionProcesses.filter(p => p.id === form.selectionProcessId)"
                  :key="process.id"
                >
                  <template v-for="stage in process.stages" :key="stage.id">
                    <span
                      class="mr-2 inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs"
                      :style="{ backgroundColor: stage.color + '20', color: stage.color }"
                    >
                      {{ stage.name }}
                    </span>
                  </template>
                </Tag>
              </div>
            </div>

            <div class="flex justify-between gap-2 pt-2">
              <Button label="Anterior" icon="pi pi-arrow-left" severity="secondary" text @click="activateCallback('2')" />
              <Button label="Siguiente" icon="pi pi-arrow-right" icon-pos="right" @click="activateCallback('4')" />
            </div>
          </div>
        </StepPanel>

        <!-- Step 4: Tags -->
        <StepPanel v-slot="{ activateCallback }" value="4">
          <div class="flex flex-col gap-4 p-2">
            <div class="flex flex-col gap-1">
              <label for="wp-tags" class="text-sm font-medium text-color">Etiquetas</label>
              <MultiSelect
                id="wp-tags"
                v-model="form.tagIds"
                :options="availableTags"
                option-label="name"
                option-value="id"
                placeholder="Seleccionar etiquetas"
                :max-selected-labels="5"
                class="w-full"
              />
            </div>

            <div v-if="form.tagIds.length > 0" class="flex flex-wrap gap-1">
              <Tag
                v-for="tagId in form.tagIds"
                :key="tagId"
                :value="availableTags.find(t => t.id === tagId)?.name ?? tagId"
                :style="{
                  backgroundColor: (availableTags.find(t => t.id === tagId)?.color ?? '#999') + '20',
                  color: availableTags.find(t => t.id === tagId)?.color ?? '#999',
                }"
              />
            </div>

            <div class="flex justify-between gap-2 pt-2">
              <Button label="Anterior" icon="pi pi-arrow-left" severity="secondary" text @click="activateCallback('3')" />
              <Button label="Revisar" icon="pi pi-eye" icon-pos="right" @click="activateCallback('5')" />
            </div>
          </div>
        </StepPanel>

        <!-- Step 5: Review -->
        <StepPanel v-slot="{ activateCallback }" value="5">
          <div class="flex flex-col gap-4 p-2">
            <div class="rounded-xl border border-surface bg-surface-0 p-4 dark:bg-surface-900">
              <h3 class="mb-3 text-base font-semibold text-color">Resumen del perfil</h3>
              <div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p class="text-muted-color">Título</p>
                  <p class="font-medium text-color">{{ form.title || '—' }}</p>
                </div>
                <div>
                  <p class="text-muted-color">Tipo de empleo</p>
                  <p class="text-color">{{ employmentTypeOptions.find(o => o.value === form.employmentType)?.label }}</p>
                </div>
                <div>
                  <p class="text-muted-color">Confidencialidad</p>
                  <p class="text-color">{{ confidentialityOptions.find(o => o.value === form.confidentialityLevel)?.label }}</p>
                </div>
                <div v-if="form.salaryMin || form.salaryMax">
                  <p class="text-muted-color">Rango salarial</p>
                  <p class="text-color">
                    {{ form.salaryMin ? `$${form.salaryMin.toLocaleString('es-MX')}` : '—' }}
                    –
                    {{ form.salaryMax ? `$${form.salaryMax.toLocaleString('es-MX')}` : '—' }}
                  </p>
                </div>
                <div v-if="cleanList(form.requirements).length" class="sm:col-span-2">
                  <p class="text-muted-color">Requisitos</p>
                  <ul class="mt-1">
                    <li v-for="(req, idx) in cleanList(form.requirements)" :key="idx" class="text-color">• {{ req }}</li>
                  </ul>
                </div>
                <div v-if="cleanList(form.functions).length" class="sm:col-span-2">
                  <p class="text-muted-color">Funciones</p>
                  <ul class="mt-1">
                    <li v-for="(fn, idx) in cleanList(form.functions)" :key="idx" class="text-color">• {{ fn }}</li>
                  </ul>
                </div>
                <div v-if="cleanList(form.benefits).length" class="sm:col-span-2">
                  <p class="text-muted-color">Beneficios</p>
                  <ul class="mt-1">
                    <li v-for="(b, idx) in cleanList(form.benefits)" :key="idx" class="text-color">• {{ b }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="flex justify-between gap-2 pt-2">
              <Button label="Anterior" icon="pi pi-arrow-left" severity="secondary" text @click="activateCallback('4')" />
              <Button label="Crear perfil" icon="pi pi-check" :loading="loading" @click="submit" />
            </div>
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </div>
</template>
