<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { apiClient } from '@/api/client'

interface Tenant {
  id: string
  name: string
  slug: string
  isActive: boolean
  userCount: number
  plan: string
  createdAt: string
  modules: string[]
}

const toast = useToast()
const tenants = ref<Tenant[]>([])
const loading = ref(false)
const editTenant = ref<Tenant | null>(null)
const dialogVisible = ref(false)

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<Tenant[]>('/admin/tenants')
    tenants.value = data
  } finally { loading.value = false }
}

function openEdit(tenant: Tenant) {
  editTenant.value = { ...tenant, modules: [...tenant.modules] }
  dialogVisible.value = true
}

async function save() {
  if (!editTenant.value) return
  try {
    await apiClient.put(`/admin/tenants/${editTenant.value.id}`, editTenant.value)
    dialogVisible.value = false
    toast.add({ severity: 'success', summary: 'Tenant actualizado', life: 3000 })
    void load()
  } catch { toast.add({ severity: 'error', summary: 'Error al actualizar', life: 5000 }) }
}

async function impersonate(tenantId: string) {
  try {
    await apiClient.post(`/admin/tenants/${tenantId}/impersonate`)
    toast.add({ severity: 'info', summary: 'Impersonación iniciada', life: 3000 })
    window.location.href = '/'
  } catch { toast.add({ severity: 'error', summary: 'Error al impersonar', life: 5000 }) }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => { void load() })
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-color">Tenants</h1>
      <Button icon="pi pi-refresh" severity="secondary" text :loading="loading" @click="load" />
    </div>
    <DataTable :value="tenants" :loading="loading">
      <Column field="name" header="Nombre" />
      <Column field="slug" header="Slug" />
      <Column header="Estado" style="width: 100px">
        <template #body="{ data }"><Tag :value="data.isActive ? 'Activo' : 'Inactivo'" :severity="data.isActive ? 'success' : 'secondary'" /></template>
      </Column>
      <Column field="plan" header="Plan" />
      <Column field="userCount" header="Usuarios" style="width: 100px" />
      <Column header="Creado" style="width: 140px">
        <template #body="{ data }"><span class="text-sm text-muted-color">{{ formatDate(data.createdAt) }}</span></template>
      </Column>
      <Column header="Acciones" style="width: 120px">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button icon="pi pi-pencil" severity="secondary" text size="small" @click="openEdit(data)" />
            <Button v-tooltip.top="'Impersonar'" icon="pi pi-eye" severity="info" text size="small" @click="impersonate(data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>
    <Dialog v-model:visible="dialogVisible" header="Editar Tenant" modal :style="{ width: '30rem' }">
      <div v-if="editTenant" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Nombre</label>
          <InputText v-model="editTenant.name" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Plan</label>
          <InputText v-model="editTenant.plan" />
        </div>
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="editTenant.isActive" />
          <label class="text-sm text-color">Activo</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
        <Button label="Guardar" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </AdminLayout>
</template>
