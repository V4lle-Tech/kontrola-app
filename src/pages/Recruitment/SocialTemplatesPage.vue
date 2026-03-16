<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { useSyndicationApi } from '@/composables/api/useSyndicationApi'
import type { SocialTemplate } from '@/types/syndication'

const api = useSyndicationApi()
const toast = useToast()
const templates = ref<SocialTemplate[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('Nuevo Template')
const editingId = ref<string | null>(null)
const form = ref({ name: '', platform: '' as SocialTemplate['platform'], content: '', isDefault: false })
const saving = ref(false)

const platformOptions = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'LinkedIn', value: 'linkedin' },
]

async function loadTemplates() {
  loading.value = true
  try {
    templates.value = await api.getTemplates()
  } finally { loading.value = false }
}

function openCreate() {
  editingId.value = null
  dialogTitle.value = 'Nuevo Template'
  form.value = { name: '', platform: 'facebook', content: '', isDefault: false }
  dialogVisible.value = true
}

function openEdit(template: SocialTemplate) {
  editingId.value = template.id
  dialogTitle.value = 'Editar Template'
  form.value = { name: template.name, platform: template.platform, content: template.content, isDefault: template.isDefault }
  dialogVisible.value = true
}

async function save() {
  saving.value = true
  try {
    if (editingId.value) {
      await api.updateTemplate(editingId.value, form.value)
    } else {
      await api.createTemplate(form.value)
    }
    dialogVisible.value = false
    toast.add({ severity: 'success', summary: 'Template guardado', life: 3000 })
    void loadTemplates()
  } catch {
    toast.add({ severity: 'error', summary: 'Error al guardar template', life: 5000 })
  } finally { saving.value = false }
}

async function remove(id: string) {
  try {
    await api.deleteTemplate(id)
    templates.value = templates.value.filter(t => t.id !== id)
    toast.add({ severity: 'success', summary: 'Template eliminado', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error al eliminar', life: 5000 })
  }
}

function platformLabel(platform: string): string {
  const map: Record<string, string> = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn' }
  return map[platform] ?? platform
}

function platformSeverity(platform: string): string {
  const map: Record<string, string> = { facebook: 'info', instagram: 'warn', linkedin: 'secondary' }
  return map[platform] ?? 'secondary'
}

onMounted(() => { void loadTemplates() })
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-surface px-6 py-4">
        <div>
          <h1 class="text-xl font-semibold text-color">Templates Sociales</h1>
          <p class="text-sm text-muted-color">Plantillas para publicaciones en redes sociales</p>
        </div>
        <Button icon="pi pi-plus" label="Nuevo" size="small" @click="openCreate" />
      </div>

      <div class="flex-1 overflow-auto px-6 py-4">
        <DataTable :value="templates" :loading="loading">
          <Column field="name" header="Nombre" />
          <Column field="platform" header="Plataforma" style="width: 160px">
            <template #body="{ data }">
              <Tag :value="platformLabel(data.platform)" :severity="platformSeverity(data.platform)" />
            </template>
          </Column>
          <Column header="Predeterminado" style="width: 140px">
            <template #body="{ data }">
              <i v-if="data.isDefault" class="pi pi-check-circle text-green-500" />
            </template>
          </Column>
          <Column header="Acciones" style="width: 120px">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button v-tooltip.top="'Editar'" icon="pi pi-pencil" severity="secondary" text size="small" @click="openEdit(data)" />
                <Button v-tooltip.top="'Eliminar'" icon="pi pi-trash" severity="danger" text size="small" @click="remove(data.id)" />
              </div>
            </template>
          </Column>
          <template #empty>
            <div class="py-8 text-center">
              <i class="pi pi-file-edit mb-2 text-3xl text-muted-color" />
              <p class="text-muted-color">No hay templates aún</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <Dialog v-model:visible="dialogVisible" :header="dialogTitle" modal :style="{ width: '32rem' }">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Nombre</label>
          <InputText v-model="form.name" placeholder="Ej: Vacante estándar" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Plataforma</label>
          <Select v-model="form.platform" :options="platformOptions" option-label="label" option-value="value" placeholder="Seleccionar" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Contenido</label>
          <Textarea v-model="form.content" rows="5" placeholder="Usa {{vacancyTitle}}, {{company}}, {{location}}..." />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
        <Button label="Guardar" icon="pi pi-check" :loading="saving" @click="save" />
      </template>
    </Dialog>
  </AppLayout>
</template>
