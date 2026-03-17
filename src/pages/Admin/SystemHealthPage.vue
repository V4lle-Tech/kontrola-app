<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { apiClient } from '@/api/client'

interface FailedJob {
  id: string
  queue: string
  payload: string
  failedAt: string
  exception: string
}

const toast = useToast()
const jobs = ref<FailedJob[]>([])
const loading = ref(false)

const jobCount = computed(() => jobs.value.length)

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<FailedJob[]>('/admin/system-health/failed-jobs')
    jobs.value = data
  } finally { loading.value = false }
}

function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + '...' : text
}

async function retryJob(id: string) {
  try {
    await apiClient.post(`/admin/system-health/failed-jobs/${id}/retry`)
    toast.add({ severity: 'success', summary: 'Reintento programado', life: 3000 })
    void load()
  } catch {
    toast.add({ severity: 'error', summary: 'Error al reintentar', life: 5000 })
  }
}

async function deleteJob(id: string) {
  try {
    await apiClient.delete(`/admin/system-health/failed-jobs/${id}`)
    toast.add({ severity: 'info', summary: 'Job eliminado', life: 3000 })
    void load()
  } catch {
    toast.add({ severity: 'error', summary: 'Error al eliminar', life: 5000 })
  }
}

onMounted(() => { void load() })
</script>

<template>
  <AdminLayout>
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold text-color">Estado del Sistema</h1>
        <Tag v-if="jobCount > 0" :value="`${jobCount} fallidos`" severity="danger" />
      </div>
      <Button icon="pi pi-refresh" label="Actualizar" severity="secondary" outlined :loading="loading" @click="load" />
    </div>

    <DataTable :value="jobs" :loading="loading" empty-message="Sin jobs fallidos">
      <Column field="id" header="ID" style="width: 100px">
        <template #body="{ data }"><span class="font-mono text-xs">{{ data.id.slice(0, 8) }}</span></template>
      </Column>
      <Column field="queue" header="Cola" style="width: 120px" />
      <Column header="Payload">
        <template #body="{ data }"><span class="text-sm text-muted-color">{{ truncate(data.payload) }}</span></template>
      </Column>
      <Column header="Fecha" style="width: 160px">
        <template #body="{ data }"><span class="text-sm">{{ new Date(data.failedAt).toLocaleString('es-MX') }}</span></template>
      </Column>
      <Column header="Error">
        <template #body="{ data }"><span class="text-sm text-muted-color">{{ truncate(data.exception, 60) }}</span></template>
      </Column>
      <Column header="Acciones" style="width: 120px">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button icon="pi pi-replay" severity="secondary" text size="small" @click="retryJob(data.id)" />
            <Button icon="pi pi-trash" severity="danger" text size="small" @click="deleteJob(data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>
  </AdminLayout>
</template>
