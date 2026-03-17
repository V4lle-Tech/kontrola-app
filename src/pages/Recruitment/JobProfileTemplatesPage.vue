<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable, { type DataTablePageEvent, type DataTableSortEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { JobProfileTemplate, EmploymentType } from '@/types/recruitment'
import type { PaginatedResponse } from '@/types/pagination'
import type { ApiError } from '@/types/api'

const api = useRecruitmentApi()
const toast = useToast()

const data = ref<PaginatedResponse<JobProfileTemplate> | null>(null)
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = ref(25)
const sortField = ref('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Form
const showFormDialog = ref(false)
const isEdit = ref(false)
const editingId = ref<string | null>(null)
const formName = ref('')
const formDescription = ref('')
const formEmploymentType = ref<EmploymentType>('full_time')
const formRequirements = ref('')
const formFunctions = ref('')
const formBenefits = ref('')
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const saving = ref(false)

// Delete
const showDeleteDialog = ref(false)
const deletingTemplate = ref<JobProfileTemplate | null>(null)
const deleting = ref(false)

const employmentTypeOptions = [
  { label: 'Tiempo completo', value: 'full_time' },
  { label: 'Medio tiempo', value: 'part_time' },
  { label: 'Contrato', value: 'contract' },
  { label: 'Temporal', value: 'temporary' },
  { label: 'Prácticas', value: 'internship' },
]

let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function loadData() {
  loading.value = true
  try {
    data.value = await api.getJobProfileTemplates({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
    })
  } finally {
    loading.value = false
  }
}

function onPage(event: DataTablePageEvent) {
  page.value = (event.page ?? 0) + 1
  pageSize.value = event.rows
  void loadData()
}

function onSort(event: DataTableSortEvent) {
  if (typeof event.sortField === 'string') {
    sortField.value = event.sortField
  }
  sortOrder.value = event.sortOrder === 1 ? 'asc' : 'desc'
  page.value = 1
  void loadData()
}

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    void loadData()
  }, 300)
}

function linesToArray(text: string): string[] {
  return text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
}

function arrayToLines(arr: string[] | null): string {
  return (arr ?? []).join('\n')
}

function employmentLabel(type: EmploymentType): string {
  const found = employmentTypeOptions.find((o) => o.value === type)
  return found?.label ?? type
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function openCreate() {
  isEdit.value = false
  editingId.value = null
  formName.value = ''
  formDescription.value = ''
  formEmploymentType.value = 'full_time'
  formRequirements.value = ''
  formFunctions.value = ''
  formBenefits.value = ''
  fieldErrors.value = {}
  generalError.value = ''
  showFormDialog.value = true
}

function openEdit(template: JobProfileTemplate) {
  isEdit.value = true
  editingId.value = template.id
  formName.value = template.name
  formDescription.value = template.description ?? ''
  formEmploymentType.value = template.employmentType
  formRequirements.value = arrayToLines(template.requirements)
  formFunctions.value = arrayToLines(template.functions)
  formBenefits.value = arrayToLines(template.benefits)
  fieldErrors.value = {}
  generalError.value = ''
  showFormDialog.value = true
}

async function submitForm() {
  fieldErrors.value = {}
  generalError.value = ''
  saving.value = true

  const payload = {
    name: formName.value,
    description: formDescription.value || undefined,
    employmentType: formEmploymentType.value,
    requirements: linesToArray(formRequirements.value),
    functions: linesToArray(formFunctions.value),
    benefits: linesToArray(formBenefits.value),
  }

  try {
    if (isEdit.value && editingId.value) {
      await api.updateJobProfileTemplate(editingId.value, payload)
      toast.add({ severity: 'success', summary: 'Plantilla actualizada', life: 3000 })
    } else {
      await api.createJobProfileTemplate(payload)
      toast.add({ severity: 'success', summary: 'Plantilla creada', life: 3000 })
    }
    showFormDialog.value = false
    void loadData()
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al guardar plantilla'
    }
  } finally {
    saving.value = false
  }
}

function confirmDelete(template: JobProfileTemplate) {
  deletingTemplate.value = template
  showDeleteDialog.value = true
}

async function executeDelete() {
  if (!deletingTemplate.value) return
  deleting.value = true
  try {
    await api.deleteJobProfileTemplate(deletingTemplate.value.id)
    toast.add({ severity: 'success', summary: 'Plantilla eliminada', life: 3000 })
    showDeleteDialog.value = false
    void loadData()
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({ severity: 'error', summary: apiError.title ?? 'Error al eliminar plantilla', life: 5000 })
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <!-- Header -->
      <div class="flex flex-col gap-2 border-b border-surface px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-color">Plantillas de Perfil</h1>
            <p class="text-sm text-muted-color">Plantillas reutilizables para crear perfiles de puesto</p>
          </div>
          <Button icon="pi pi-plus" label="Nueva plantilla" @click="openCreate" />
        </div>
        <span class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" />
          <InputText
            v-model="search"
            placeholder="Buscar plantillas..."
            class="w-full pl-9"
            @input="onSearchInput"
          />
        </span>
      </div>

      <!-- DataTable -->
      <div class="flex-1 overflow-auto p-6">
        <DataTable
          :value="data?.items ?? []"
          :loading="loading"
          :lazy="true"
          :paginator="true"
          :rows="pageSize"
          :total-records="data?.totalCount ?? 0"
          :rows-per-page-options="[10, 25, 50]"
          :sort-field="sortField"
          :sort-order="sortOrder === 'asc' ? 1 : -1"
          data-key="id"
          striped-rows
          class="text-sm"
          @page="onPage"
          @sort="onSort"
        >
          <template #empty>
            <div class="py-6 text-center text-muted-color">
              <i class="pi pi-file mb-2 text-3xl" />
              <p>No se encontraron plantillas</p>
            </div>
          </template>

          <Column field="name" header="Nombre" sortable class="min-w-48">
            <template #body="{ data: tpl }">
              <span class="font-medium text-color">{{ tpl.name }}</span>
            </template>
          </Column>

          <Column field="description" header="Descripción" class="min-w-48">
            <template #body="{ data: tpl }">
              <span class="text-sm text-muted-color">{{ tpl.description ?? '—' }}</span>
            </template>
          </Column>

          <Column field="employmentType" header="Tipo" sortable class="w-40">
            <template #body="{ data: tpl }">
              <span class="text-sm text-color">{{ employmentLabel(tpl.employmentType) }}</span>
            </template>
          </Column>

          <Column field="createdAt" header="Creada" sortable class="w-36">
            <template #body="{ data: tpl }">
              <span class="text-sm text-muted-color">{{ formatDate(tpl.createdAt) }}</span>
            </template>
          </Column>

          <Column header="Acciones" class="w-28">
            <template #body="{ data: tpl }">
              <div class="flex gap-1">
                <Button
                  v-tooltip.top="'Editar'"
                  icon="pi pi-pencil"
                  text
                  size="small"
                  @click="openEdit(tpl)"
                />
                <Button
                  v-tooltip.top="'Eliminar'"
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  size="small"
                  @click="confirmDelete(tpl)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Form dialog -->
    <Dialog
      v-model:visible="showFormDialog"
      modal
      :header="isEdit ? 'Editar Plantilla' : 'Nueva Plantilla'"
      class="w-full max-w-lg"
    >
      <div class="flex flex-col gap-4">
        <Message v-if="generalError" severity="error" :closable="false">
          {{ generalError }}
        </Message>

        <div class="flex flex-col gap-1">
          <label for="tplName" class="text-sm font-medium text-color">Nombre</label>
          <InputText id="tplName" v-model="formName" :invalid="!!fieldErrors.name" />
          <small v-if="fieldErrors.name" class="p-error">{{ fieldErrors.name[0] }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="tplDesc" class="text-sm font-medium text-color">Descripción</label>
          <Textarea id="tplDesc" v-model="formDescription" rows="2" auto-resize class="w-full" />
        </div>

        <div class="flex flex-col gap-1">
          <label for="tplType" class="text-sm font-medium text-color">Tipo de empleo</label>
          <Select
            id="tplType"
            v-model="formEmploymentType"
            :options="employmentTypeOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="tplReqs" class="text-sm font-medium text-color">Requisitos</label>
          <Textarea id="tplReqs" v-model="formRequirements" rows="3" auto-resize class="w-full" placeholder="Un requisito por línea" />
        </div>

        <div class="flex flex-col gap-1">
          <label for="tplFuncs" class="text-sm font-medium text-color">Funciones</label>
          <Textarea id="tplFuncs" v-model="formFunctions" rows="3" auto-resize class="w-full" placeholder="Una función por línea" />
        </div>

        <div class="flex flex-col gap-1">
          <label for="tplBenefits" class="text-sm font-medium text-color">Beneficios</label>
          <Textarea id="tplBenefits" v-model="formBenefits" rows="3" auto-resize class="w-full" placeholder="Un beneficio por línea" />
        </div>

        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" text @click="showFormDialog = false" />
          <Button
            :label="isEdit ? 'Guardar' : 'Crear plantilla'"
            :loading="saving"
            @click="submitForm"
          />
        </div>
      </div>
    </Dialog>

    <!-- Delete confirmation -->
    <Dialog v-model:visible="showDeleteDialog" modal header="Eliminar Plantilla" class="w-full max-w-sm">
      <p class="text-sm text-color">
        ¿Estás seguro de eliminar la plantilla <strong>{{ deletingTemplate?.name }}</strong>? Esta acción no se puede deshacer.
      </p>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="showDeleteDialog = false" />
        <Button label="Eliminar" severity="danger" :loading="deleting" @click="executeDelete" />
      </template>
    </Dialog>
  </AppLayout>
</template>
