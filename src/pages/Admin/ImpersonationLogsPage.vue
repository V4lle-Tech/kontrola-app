<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { apiClient } from '@/api/client'

interface ImpersonationLog {
  id: string
  adminName: string
  tenantName: string
  startedAt: string
  endedAt: string | null
  duration: string | null
}

const logs = ref<ImpersonationLog[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<ImpersonationLog[]>('/admin/impersonation-logs')
    logs.value = data
  } finally { loading.value = false }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => { void load() })
</script>

<template>
  <AdminLayout>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-color">Impersonación</h1>
      <Button icon="pi pi-refresh" severity="secondary" text :loading="loading" @click="load" />
    </div>
    <DataTable :value="logs" :loading="loading">
      <Column field="adminName" header="Admin" />
      <Column field="tenantName" header="Tenant" />
      <Column header="Inicio" style="width: 180px">
        <template #body="{ data }"><span class="text-sm text-muted-color">{{ formatDate(data.startedAt) }}</span></template>
      </Column>
      <Column header="Fin" style="width: 180px">
        <template #body="{ data }"><span class="text-sm text-muted-color">{{ data.endedAt ? formatDate(data.endedAt) : 'En curso' }}</span></template>
      </Column>
      <Column field="duration" header="Duración" style="width: 120px" />
      <template #empty>
        <div class="py-8 text-center"><p class="text-muted-color">Sin registros de impersonación</p></div>
      </template>
    </DataTable>
  </AdminLayout>
</template>
