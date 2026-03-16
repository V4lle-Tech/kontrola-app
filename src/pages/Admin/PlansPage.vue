<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { useToast } from 'primevue/usetoast'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { apiClient } from '@/api/client'

interface Plan {
  id: string
  name: string
  price: number
  maxUsers: number
  modules: string[]
  isActive: boolean
}

const toast = useToast()
const plans = ref<Plan[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editPlan = ref<Plan | null>(null)

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<Plan[]>('/admin/plans')
    plans.value = data
  } finally { loading.value = false }
}

function openEdit(plan: Plan) {
  editPlan.value = { ...plan }
  dialogVisible.value = true
}

async function save() {
  if (!editPlan.value) return
  try {
    await apiClient.put(`/admin/plans/${editPlan.value.id}`, editPlan.value)
    dialogVisible.value = false
    toast.add({ severity: 'success', summary: 'Plan actualizado', life: 3000 })
    void load()
  } catch { toast.add({ severity: 'error', summary: 'Error', life: 5000 }) }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

onMounted(() => { void load() })
</script>

<template>
  <AdminLayout>
    <h1 class="mb-6 text-2xl font-bold text-color">Planes</h1>
    <DataTable :value="plans" :loading="loading">
      <Column field="name" header="Nombre" />
      <Column header="Precio" style="width: 140px">
        <template #body="{ data }"><span class="font-medium">{{ formatCurrency(data.price) }}/mes</span></template>
      </Column>
      <Column field="maxUsers" header="Máx Usuarios" style="width: 120px" />
      <Column header="Estado" style="width: 100px">
        <template #body="{ data }"><Tag :value="data.isActive ? 'Activo' : 'Inactivo'" :severity="data.isActive ? 'success' : 'secondary'" /></template>
      </Column>
      <Column header="Acciones" style="width: 80px">
        <template #body="{ data }"><Button icon="pi pi-pencil" severity="secondary" text size="small" @click="openEdit(data)" /></template>
      </Column>
    </DataTable>
    <Dialog v-model:visible="dialogVisible" header="Editar Plan" modal :style="{ width: '28rem' }">
      <div v-if="editPlan" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Nombre</label>
          <InputText v-model="editPlan.name" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Precio mensual</label>
          <InputNumber v-model="editPlan.price" mode="currency" currency="MXN" locale="es-MX" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Máximo de usuarios</label>
          <InputNumber v-model="editPlan.maxUsers" :min="1" show-buttons />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
        <Button label="Guardar" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </AdminLayout>
</template>
