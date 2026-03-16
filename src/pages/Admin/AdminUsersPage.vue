<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { apiClient } from '@/api/client'

interface AdminUser {
  id: string
  email: string
  fullName: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

const toast = useToast()
const users = ref<AdminUser[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<AdminUser[]>('/admin/users')
    users.value = data
  } finally { loading.value = false }
}

async function toggleActive(user: AdminUser) {
  try {
    await apiClient.put(`/admin/users/${user.id}`, { isActive: !user.isActive })
    user.isActive = !user.isActive
    toast.add({ severity: 'success', summary: `Usuario ${user.isActive ? 'activado' : 'desactivado'}`, life: 3000 })
  } catch { toast.add({ severity: 'error', summary: 'Error', life: 5000 }) }
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Nunca'
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => { void load() })
</script>

<template>
  <AdminLayout>
    <h1 class="mb-6 text-2xl font-bold text-color">Administradores</h1>
    <DataTable :value="users" :loading="loading">
      <Column field="fullName" header="Nombre" />
      <Column field="email" header="Email" />
      <Column header="Estado" style="width: 100px">
        <template #body="{ data }"><Tag :value="data.isActive ? 'Activo' : 'Inactivo'" :severity="data.isActive ? 'success' : 'secondary'" /></template>
      </Column>
      <Column header="Último login" style="width: 140px">
        <template #body="{ data }"><span class="text-sm text-muted-color">{{ formatDate(data.lastLoginAt) }}</span></template>
      </Column>
      <Column header="Acciones" style="width: 80px">
        <template #body="{ data }">
          <Button :icon="data.isActive ? 'pi pi-lock' : 'pi pi-lock-open'" :severity="data.isActive ? 'danger' : 'success'" text size="small" @click="toggleActive(data)" />
        </template>
      </Column>
    </DataTable>
  </AdminLayout>
</template>
