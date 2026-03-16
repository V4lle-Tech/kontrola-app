<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import StageEditor from '@/components/recruitment/StageEditor.vue'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { SelectionProcess, SelectionStage } from '@/types/recruitment'
import type { ApiError } from '@/types/api'

const api = useRecruitmentApi()
const toast = useToast()

const processes = ref<SelectionProcess[]>([])
const loading = ref(false)
const showFormDialog = ref(false)
const editingProcess = ref<SelectionProcess | null>(null)

// Form
const formName = ref('')
const formStages = ref<(Omit<SelectionStage, 'id'> & { id?: string })[]>([])
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const saving = ref(false)

const isEdit = ref(false)

async function loadProcesses() {
  loading.value = true
  try {
    const result = await api.getSelectionProcesses({ pageSize: 100 })
    processes.value = result.items
  } finally {
    loading.value = false
  }
}

function openCreate() {
  isEdit.value = false
  editingProcess.value = null
  formName.value = ''
  formStages.value = [
    { name: 'Aplicación', order: 1, color: '#3B82F6', isFinal: false, type: 'application', requiresComments: false, requiresApproval: false },
    { name: 'Contratado', order: 2, color: '#22C55E', isFinal: true, type: 'hired', requiresComments: false, requiresApproval: false },
    { name: 'Rechazado', order: 3, color: '#EF4444', isFinal: true, type: 'rejected', requiresComments: true, requiresApproval: false },
  ]
  fieldErrors.value = {}
  generalError.value = ''
  showFormDialog.value = true
}

function openEdit(process: SelectionProcess) {
  isEdit.value = true
  editingProcess.value = process
  formName.value = process.name
  formStages.value = process.stages.map((s) => ({ ...s }))
  fieldErrors.value = {}
  generalError.value = ''
  showFormDialog.value = true
}

async function submitForm() {
  fieldErrors.value = {}
  generalError.value = ''
  saving.value = true

  try {
    if (isEdit.value && editingProcess.value) {
      await api.updateSelectionProcess(editingProcess.value.id, {
        name: formName.value,
        stages: formStages.value,
      })
      toast.add({ severity: 'success', summary: 'Proceso actualizado', life: 3000 })
    } else {
      await api.createSelectionProcess({
        name: formName.value,
        stages: formStages.value.map(({ id: _id, ...rest }) => rest),
      })
      toast.add({ severity: 'success', summary: 'Proceso creado', life: 3000 })
    }
    showFormDialog.value = false
    void loadProcesses()
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al guardar proceso'
    }
  } finally {
    saving.value = false
  }
}

async function deleteProcess(process: SelectionProcess) {
  try {
    await api.deleteSelectionProcess(process.id)
    toast.add({ severity: 'success', summary: 'Proceso eliminado', life: 3000 })
    void loadProcesses()
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({
      severity: 'error',
      summary: apiError.title ?? 'Error al eliminar proceso',
      life: 5000,
    })
  }
}

onMounted(() => {
  void loadProcesses()
})
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-surface px-6 py-4">
        <div>
          <h1 class="text-xl font-semibold text-color">Procesos de Selección</h1>
          <p class="text-sm text-muted-color">Configura las etapas por las que pasan los candidatos</p>
        </div>
        <Button icon="pi pi-plus" label="Nuevo proceso" @click="openCreate" />
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
        </div>

        <div v-else-if="!processes.length" class="flex flex-col items-center justify-center py-12">
          <i class="pi pi-sitemap mb-3 text-4xl text-muted-color" />
          <p class="mb-4 text-muted-color">No hay procesos de selección configurados</p>
          <Button icon="pi pi-plus" label="Crear primer proceso" @click="openCreate" />
        </div>

        <div v-else class="flex flex-col gap-4">
          <div
            v-for="process in processes"
            :key="process.id"
            class="rounded-xl border border-surface bg-surface-0 p-5 dark:bg-surface-900"
          >
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <h3 class="text-base font-semibold text-color">{{ process.name }}</h3>
                <Tag v-if="process.isDefault" value="Predeterminado" severity="info" />
              </div>
              <div class="flex gap-1">
                <Button
                  icon="pi pi-pencil"
                  text
                  severity="secondary"
                  size="small"
                  @click="openEdit(process)"
                />
                <Button
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  size="small"
                  :disabled="process.isDefault"
                  @click="deleteProcess(process)"
                />
              </div>
            </div>

            <!-- Stages pipeline -->
            <div class="flex flex-wrap items-center gap-2">
              <div
                v-for="(stage, idx) in process.stages"
                :key="stage.id"
                class="flex items-center gap-2"
              >
                <span
                  class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                  :style="{ backgroundColor: stage.color + '20', color: stage.color }"
                >
                  {{ stage.name }}
                  <i v-if="stage.isFinal" class="pi pi-check text-[10px]" />
                </span>
                <i
                  v-if="idx < process.stages.length - 1"
                  class="pi pi-arrow-right text-xs text-muted-color"
                />
              </div>
            </div>

            <p class="mt-2 text-xs text-muted-color">
              {{ process.stages.length }} etapa{{ process.stages.length !== 1 ? 's' : '' }}
              · Creado {{ new Date(process.createdAt).toLocaleDateString('es-MX') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Form dialog -->
    <Dialog
      v-model:visible="showFormDialog"
      modal
      :header="isEdit ? 'Editar Proceso' : 'Nuevo Proceso de Selección'"
      class="w-full max-w-2xl"
      :dismissable-mask="false"
    >
      <div class="flex flex-col gap-4">
        <Message v-if="generalError" severity="error" :closable="false">
          {{ generalError }}
        </Message>

        <div class="flex flex-col gap-1">
          <label for="processName" class="text-sm font-medium text-color">Nombre del proceso</label>
          <InputText
            id="processName"
            v-model="formName"
            :invalid="!!fieldErrors.name"
            placeholder="Ej: Proceso estándar"
          />
          <small v-if="fieldErrors.name" class="text-red-500">{{ fieldErrors.name[0] }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Etapas</label>
          <small v-if="fieldErrors.stages" class="text-red-500">{{ fieldErrors.stages[0] }}</small>
          <StageEditor v-model="formStages" />
        </div>

        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" text @click="showFormDialog = false" />
          <Button
            :label="isEdit ? 'Guardar cambios' : 'Crear proceso'"
            :loading="saving"
            @click="submitForm"
          />
        </div>
      </div>
    </Dialog>
  </AppLayout>
</template>
