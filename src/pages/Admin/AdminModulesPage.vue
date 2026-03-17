<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { apiClient } from '@/api/client'

interface SystemModule {
  id: string
  name: string
  description: string
  isCore: boolean
  price: number
}

const toast = useToast()
const modules = ref<SystemModule[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editModule = ref<SystemModule | null>(null)

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<SystemModule[]>('/admin/modules')
    modules.value = data
  } finally { loading.value = false }
}

function openEdit(mod: SystemModule) {
  editModule.value = { ...mod }
  dialogVisible.value = true
}

async function save() {
  if (!editModule.value) return
  try {
    await apiClient.put(`/admin/modules/${editModule.value.id}`, editModule.value)
    dialogVisible.value = false
    toast.add({ severity: 'success', summary: 'Modulo actualizado', life: 3000 })
    void load()
  } catch {
    toast.add({ severity: 'error', summary: 'Error al guardar', life: 5000 })
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

onMounted(() => { void load() })
</script>

<template>
  <AdminLayout>
    <h1 class="mb-6 text-2xl font-bold text-color">Modulos del Sistema</h1>
    <DataTable :value="modules" :loading="loading">
      <Column field="name" header="Nombre" />
      <Column field="description" header="Descripcion" />
      <Column header="Tipo" style="width: 120px">
        <template #body="{ data }">
          <Tag :value="data.isCore ? 'Core' : 'Addon'" :severity="data.isCore ? 'info' : 'secondary'" />
        </template>
      </Column>
      <Column header="Precio" style="width: 140px">
        <template #body="{ data }">
          <span class="font-medium">{{ data.isCore ? 'Incluido' : formatCurrency(data.price) + '/mes' }}</span>
        </template>
      </Column>
      <Column header="Acciones" style="width: 80px">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" severity="secondary" text size="small" @click="openEdit(data)" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialogVisible" header="Editar Modulo" modal :style="{ width: '28rem' }">
      <div v-if="editModule" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Nombre</label>
          <InputText v-model="editModule.name" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Descripcion</label>
          <Textarea v-model="editModule.description" rows="3" auto-resize class="w-full" />
        </div>
        <div class="flex items-center gap-3">
          <ToggleSwitch v-model="editModule.isCore" />
          <label class="text-sm font-medium text-color">Modulo core</label>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Precio mensual</label>
          <InputNumber v-model="editModule.price" mode="currency" currency="MXN" locale="es-MX" :disabled="editModule.isCore" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
        <Button label="Guardar" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </AdminLayout>
</template>
