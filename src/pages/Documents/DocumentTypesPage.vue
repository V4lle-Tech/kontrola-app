<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { useDocumentsApi } from '@/composables/api/useDocumentsApi'
import { generateId } from '@/utils/uuid'
import type { DocumentType } from '@/types/document'

const api = useDocumentsApi()
const toast = useToast()
const types = ref<DocumentType[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('Nuevo Tipo')
const editingId = ref<string | null>(null)
const form = ref({ name: '', description: '', isRequired: false, expirationDays: null as number | null, allowedExtensions: '' })
const saving = ref(false)

async function load() {
  loading.value = true
  try { types.value = await api.getDocumentTypes() }
  finally { loading.value = false }
}

function openCreate() {
  editingId.value = null
  dialogTitle.value = 'Nuevo Tipo de Documento'
  form.value = { name: '', description: '', isRequired: false, expirationDays: null, allowedExtensions: '' }
  dialogVisible.value = true
}

function openEdit(dt: DocumentType) {
  editingId.value = dt.id
  dialogTitle.value = 'Editar Tipo de Documento'
  form.value = {
    name: dt.name, description: dt.description, isRequired: dt.isRequired,
    expirationDays: dt.expirationDays, allowedExtensions: dt.allowedExtensions.join(', '),
  }
  dialogVisible.value = true
}

async function save() {
  saving.value = true
  try {
    const extensions = form.value.allowedExtensions.split(',').map(e => e.trim()).filter(Boolean)
    const payload = { name: form.value.name, description: form.value.description, isRequired: form.value.isRequired, expirationDays: form.value.expirationDays, allowedExtensions: extensions }
    if (editingId.value) {
      await api.updateDocumentType(editingId.value, payload)
    } else {
      await api.createDocumentType(generateId(), payload)
    }
    dialogVisible.value = false
    toast.add({ severity: 'success', summary: 'Tipo guardado', life: 3000 })
    void load()
  } catch { toast.add({ severity: 'error', summary: 'Error al guardar', life: 5000 }) }
  finally { saving.value = false }
}

async function remove(id: string) {
  try {
    await api.deleteDocumentType(id)
    types.value = types.value.filter(t => t.id !== id)
    toast.add({ severity: 'success', summary: 'Tipo eliminado', life: 3000 })
  } catch { toast.add({ severity: 'error', summary: 'Error al eliminar', life: 5000 }) }
}

onMounted(() => { void load() })
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-surface px-6 py-4">
        <div>
          <h1 class="text-xl font-semibold text-color">Tipos de Documento</h1>
          <p class="text-sm text-muted-color">Define los documentos requeridos por candidato</p>
        </div>
        <Button icon="pi pi-plus" label="Nuevo" size="small" @click="openCreate" />
      </div>
      <div class="flex-1 overflow-auto px-6 py-4">
        <DataTable :value="types" :loading="loading">
          <Column field="name" header="Nombre" />
          <Column header="Requerido" style="width: 120px">
            <template #body="{ data }">
              <Tag :value="data.isRequired ? 'Sí' : 'No'" :severity="data.isRequired ? 'danger' : 'secondary'" />
            </template>
          </Column>
          <Column header="Expiración" style="width: 140px">
            <template #body="{ data }">
              <span class="text-sm text-muted-color">{{ data.expirationDays ? `${data.expirationDays} días` : 'Sin expiración' }}</span>
            </template>
          </Column>
          <Column header="Extensiones" style="width: 200px">
            <template #body="{ data }">
              <span class="text-sm text-muted-color">{{ data.allowedExtensions.join(', ') || 'Todas' }}</span>
            </template>
          </Column>
          <Column header="Acciones" style="width: 120px">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button icon="pi pi-pencil" severity="secondary" text size="small" @click="openEdit(data)" />
                <Button icon="pi pi-trash" severity="danger" text size="small" @click="remove(data.id)" />
              </div>
            </template>
          </Column>
          <template #empty>
            <div class="py-8 text-center">
              <i class="pi pi-folder mb-2 text-3xl text-muted-color" />
              <p class="text-muted-color">No hay tipos de documento</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
    <Dialog v-model:visible="dialogVisible" :header="dialogTitle" modal :style="{ width: '30rem' }">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Nombre</label>
          <InputText v-model="form.name" placeholder="Ej: INE" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Descripción</label>
          <Textarea v-model="form.description" rows="3" />
        </div>
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="form.isRequired" />
          <label class="text-sm text-color">Documento requerido</label>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Días para expiración</label>
          <InputNumber v-model="form.expirationDays" placeholder="Sin expiración" :min="1" show-buttons />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Extensiones permitidas</label>
          <InputText v-model="form.allowedExtensions" placeholder="pdf, jpg, png (vacío = todas)" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
        <Button label="Guardar" icon="pi pi-check" :loading="saving" @click="save" />
      </template>
    </Dialog>
  </AppLayout>
</template>
