<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ColorPicker from 'primevue/colorpicker'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { Tag } from '@/types/recruitment'
import type { ApiError } from '@/types/api'

const api = useRecruitmentApi()
const toast = useToast()

const tags = ref<Tag[]>([])
const loading = ref(false)
const typeFilter = ref<'candidate' | 'job_profile' | null>(null)
const search = ref('')

// Form
const showFormDialog = ref(false)
const isEdit = ref(false)
const editingTag = ref<Tag | null>(null)
const formName = ref('')
const formColor = ref('#3B82F6')
const formType = ref<'candidate' | 'job_profile'>('candidate')
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const saving = ref(false)

const typeOptions = [
  { label: 'Todas', value: null },
  { label: 'Candidato', value: 'candidate' },
  { label: 'Perfil de puesto', value: 'job_profile' },
]

const typeFormOptions = [
  { label: 'Candidato', value: 'candidate' },
  { label: 'Perfil de puesto', value: 'job_profile' },
]

const filteredTags = computed(() => {
  let result = tags.value
  if (typeFilter.value) {
    result = result.filter((t) => t.type === typeFilter.value)
  }
  if (search.value) {
    const term = search.value.toLowerCase()
    result = result.filter((t) => t.name.toLowerCase().includes(term))
  }
  return result
})

const candidateTags = computed(() => filteredTags.value.filter((t) => t.type === 'candidate'))
const jobProfileTags = computed(() => filteredTags.value.filter((t) => t.type === 'job_profile'))

async function loadTags() {
  loading.value = true
  try {
    tags.value = await api.getTags()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  isEdit.value = false
  editingTag.value = null
  formName.value = ''
  formColor.value = '#3B82F6'
  formType.value = 'candidate'
  fieldErrors.value = {}
  generalError.value = ''
  showFormDialog.value = true
}

function openEdit(tag: Tag) {
  isEdit.value = true
  editingTag.value = tag
  formName.value = tag.name
  formColor.value = tag.color
  formType.value = tag.type
  fieldErrors.value = {}
  generalError.value = ''
  showFormDialog.value = true
}

async function submitForm() {
  fieldErrors.value = {}
  generalError.value = ''
  saving.value = true

  try {
    if (isEdit.value && editingTag.value) {
      await api.updateTag(editingTag.value.id, {
        name: formName.value,
        color: formColor.value,
      })
      toast.add({ severity: 'success', summary: 'Etiqueta actualizada', life: 3000 })
    } else {
      await api.createTag({
        name: formName.value,
        color: formColor.value,
        type: formType.value,
      })
      toast.add({ severity: 'success', summary: 'Etiqueta creada', life: 3000 })
    }
    showFormDialog.value = false
    void loadTags()
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al guardar etiqueta'
    }
  } finally {
    saving.value = false
  }
}

async function deleteTag(tag: Tag) {
  try {
    await api.deleteTag(tag.id)
    toast.add({ severity: 'success', summary: 'Etiqueta eliminada', life: 3000 })
    void loadTags()
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({
      severity: 'error',
      summary: apiError.title ?? 'Error al eliminar etiqueta',
      life: 5000,
    })
  }
}

function typeLabel(type: 'candidate' | 'job_profile'): string {
  return type === 'candidate' ? 'Candidato' : 'Perfil de puesto'
}

onMounted(() => {
  void loadTags()
})
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <!-- Header -->
      <div class="flex flex-col gap-2 border-b border-surface px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-color">Etiquetas</h1>
            <p class="text-sm text-muted-color">Organiza candidatos y perfiles de puesto con etiquetas</p>
          </div>
          <Button icon="pi pi-plus" label="Nueva etiqueta" @click="openCreate" />
        </div>
        <div class="flex gap-2">
          <span class="relative flex-1">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" />
            <InputText
              v-model="search"
              placeholder="Buscar etiquetas..."
              class="w-full pl-9"
            />
          </span>
          <Select
            v-model="typeFilter"
            :options="typeOptions"
            option-label="label"
            option-value="value"
            placeholder="Tipo"
            class="w-48"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
        </div>

        <div v-else-if="!filteredTags.length" class="flex flex-col items-center justify-center py-12">
          <i class="pi pi-tags mb-3 text-4xl text-muted-color" />
          <p class="mb-4 text-muted-color">
            {{ search || typeFilter ? 'No se encontraron etiquetas' : 'No hay etiquetas configuradas' }}
          </p>
          <Button v-if="!search && !typeFilter" icon="pi pi-plus" label="Crear primera etiqueta" @click="openCreate" />
        </div>

        <div v-else class="flex flex-col gap-6">
          <!-- Candidate tags -->
          <div v-if="!typeFilter || typeFilter === 'candidate'">
            <h2 v-if="candidateTags.length" class="mb-3 text-sm font-semibold text-muted-color">
              Etiquetas de candidato ({{ candidateTags.length }})
            </h2>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="tag in candidateTags"
                :key="tag.id"
                class="group flex items-center gap-2 rounded-lg border border-surface bg-surface-0 px-3 py-2 dark:bg-surface-900"
              >
                <span
                  class="h-3 w-3 shrink-0 rounded-full"
                  :style="{ backgroundColor: tag.color }"
                />
                <span class="text-sm font-medium text-color">{{ tag.name }}</span>
                <span class="text-xs text-muted-color">{{ typeLabel(tag.type) }}</span>
                <div class="ml-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    class="rounded p-0.5 text-muted-color hover:text-primary"
                    @click="openEdit(tag)"
                  >
                    <i class="pi pi-pencil text-xs" />
                  </button>
                  <button
                    type="button"
                    class="rounded p-0.5 text-muted-color hover:text-color"
                    @click="deleteTag(tag)"
                  >
                    <i class="pi pi-times text-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Job profile tags -->
          <div v-if="!typeFilter || typeFilter === 'job_profile'">
            <h2 v-if="jobProfileTags.length" class="mb-3 text-sm font-semibold text-muted-color">
              Etiquetas de perfil de puesto ({{ jobProfileTags.length }})
            </h2>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="tag in jobProfileTags"
                :key="tag.id"
                class="group flex items-center gap-2 rounded-lg border border-surface bg-surface-0 px-3 py-2 dark:bg-surface-900"
              >
                <span
                  class="h-3 w-3 shrink-0 rounded-full"
                  :style="{ backgroundColor: tag.color }"
                />
                <span class="text-sm font-medium text-color">{{ tag.name }}</span>
                <span class="text-xs text-muted-color">{{ typeLabel(tag.type) }}</span>
                <div class="ml-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    class="rounded p-0.5 text-muted-color hover:text-primary"
                    @click="openEdit(tag)"
                  >
                    <i class="pi pi-pencil text-xs" />
                  </button>
                  <button
                    type="button"
                    class="rounded p-0.5 text-muted-color hover:text-color"
                    @click="deleteTag(tag)"
                  >
                    <i class="pi pi-times text-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form dialog -->
    <Dialog
      v-model:visible="showFormDialog"
      modal
      :header="isEdit ? 'Editar Etiqueta' : 'Nueva Etiqueta'"
      class="w-full max-w-md"
    >
      <div class="flex flex-col gap-4">
        <Message v-if="generalError" severity="error" :closable="false">
          {{ generalError }}
        </Message>

        <div class="flex flex-col gap-1">
          <label for="tagName" class="text-sm font-medium text-color">Nombre</label>
          <InputText
            id="tagName"
            v-model="formName"
            :invalid="!!fieldErrors.name"
            placeholder="Ej: Senior, Urgente, Remoto"
          />
          <small v-if="fieldErrors.name" class="p-error">{{ fieldErrors.name[0] }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Color</label>
          <div class="flex items-center gap-3">
            <ColorPicker v-model="formColor" />
            <span
              class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
              :style="{ backgroundColor: formColor + '20', color: formColor }"
            >
              {{ formName || 'Vista previa' }}
            </span>
          </div>
        </div>

        <div v-if="!isEdit" class="flex flex-col gap-1">
          <label for="tagType" class="text-sm font-medium text-color">Tipo</label>
          <Select
            id="tagType"
            v-model="formType"
            :options="typeFormOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
          <small v-if="fieldErrors.type" class="p-error">{{ fieldErrors.type[0] }}</small>
        </div>

        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" text @click="showFormDialog = false" />
          <Button
            :label="isEdit ? 'Guardar' : 'Crear etiqueta'"
            :loading="saving"
            @click="submitForm"
          />
        </div>
      </div>
    </Dialog>
  </AppLayout>
</template>
