<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { apiClient } from '@/api/client'
import type { PaginatedResponse } from '@/types/pagination'

interface ActivityLog {
  id: string
  userId: string
  userName: string
  tenantName: string
  action: string
  resource: string
  resourceId: string | null
  ipAddress: string
  createdAt: string
}

const logs = ref<ActivityLog[]>([])
const loading = ref(false)
const totalRecords = ref(0)
const page = ref(0)
const rows = ref(20)
const search = ref('')
const actionFilter = ref<string | undefined>(undefined)

const actionOptions = [
  { label: 'Todas', value: undefined },
  { label: 'Crear', value: 'create' },
  { label: 'Actualizar', value: 'update' },
  { label: 'Eliminar', value: 'delete' },
  { label: 'Login', value: 'login' },
  { label: 'Impersonar', value: 'impersonate' },
]

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<PaginatedResponse<ActivityLog>>('/admin/activity-logs', {
      params: { page: page.value + 1, pageSize: rows.value, search: search.value || undefined, action: actionFilter.value },
    })
    logs.value = data.items
    totalRecords.value = data.totalCount
  } finally { loading.value = false }
}

function onPage(event: { page: number; rows: number }) {
  page.value = event.page
  rows.value = event.rows
  void load()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => { void load() })
</script>

<template>
  <AdminLayout>
    <h1 class="mb-6 text-2xl font-bold text-color">Activity Logs</h1>
    <div class="mb-4 flex gap-3">
      <InputText v-model="search" placeholder="Buscar..." size="small" @keyup.enter="load" />
      <Select v-model="actionFilter" :options="actionOptions" option-label="label" option-value="value" placeholder="Acción" size="small" @change="load" />
      <Button icon="pi pi-search" size="small" @click="load" />
    </div>
    <DataTable :value="logs" :loading="loading" lazy paginator :rows="rows" :total-records="totalRecords" :rows-per-page-options="[20, 50, 100]" @page="onPage">
      <Column field="userName" header="Usuario" />
      <Column field="tenantName" header="Tenant" />
      <Column field="action" header="Acción" style="width: 120px" />
      <Column field="resource" header="Recurso" />
      <Column field="ipAddress" header="IP" style="width: 120px" />
      <Column header="Fecha" style="width: 180px">
        <template #body="{ data }"><span class="text-sm text-muted-color">{{ formatDate(data.createdAt) }}</span></template>
      </Column>
      <template #empty>
        <div class="py-8 text-center"><p class="text-muted-color">Sin registros</p></div>
      </template>
    </DataTable>
  </AdminLayout>
</template>
