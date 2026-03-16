<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { SkipStageRequest } from '@/types/recruitment'

const api = useRecruitmentApi()
const toast = useToast()
const requests = ref<SkipStageRequest[]>([])
const loading = ref(false)
const totalRecords = ref(0)
const page = ref(0)
const rows = ref(20)

async function loadRequests() {
  loading.value = true
  try {
    const res = await api.getSkipRequests({ page: page.value + 1, pageSize: rows.value })
    requests.value = res.items
    totalRecords.value = res.totalCount
  } finally { loading.value = false }
}

function onPage(event: { page: number; rows: number }) {
  page.value = event.page
  rows.value = event.rows
  void loadRequests()
}

async function approve(id: string) {
  try {
    await api.approveSkipRequest(id)
    toast.add({ severity: 'success', summary: 'Solicitud aprobada', life: 3000 })
    void loadRequests()
  } catch { toast.add({ severity: 'error', summary: 'Error al aprobar', life: 5000 }) }
}

async function reject(id: string) {
  try {
    await api.rejectSkipRequest(id)
    toast.add({ severity: 'info', summary: 'Solicitud rechazada', life: 3000 })
    void loadRequests()
  } catch { toast.add({ severity: 'error', summary: 'Error al rechazar', life: 5000 }) }
}

function statusSeverity(status: string): string {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  return 'warn'
}

function statusLabel(status: string): string {
  if (status === 'approved') return 'Aprobada'
  if (status === 'rejected') return 'Rechazada'
  return 'Pendiente'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => { void loadRequests() })
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-surface px-6 py-4">
        <div>
          <h1 class="text-xl font-semibold text-color">Solicitudes de Salto de Etapa</h1>
          <p class="text-sm text-muted-color">Aprueba o rechaza solicitudes de salto en el pipeline</p>
        </div>
        <Button icon="pi pi-refresh" severity="secondary" text size="small" :loading="loading" @click="loadRequests" />
      </div>

      <div class="flex-1 overflow-auto px-6 py-4">
        <DataTable
          :value="requests"
          :loading="loading"
          lazy
          paginator
          :rows="rows"
          :total-records="totalRecords"
          :rows-per-page-options="[10, 20, 50]"
          @page="onPage"
        >
          <Column field="requestedBy" header="Solicitante" />
          <Column field="fromStageName" header="Desde" />
          <Column field="toStageName" header="Hasta" />
          <Column field="reason" header="Justificación" style="max-width: 300px">
            <template #body="{ data }">
              <p class="truncate">{{ data.reason }}</p>
            </template>
          </Column>
          <Column field="createdAt" header="Fecha">
            <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
          </Column>
          <Column field="status" header="Estado">
            <template #body="{ data }">
              <Tag :value="statusLabel(data.status)" :severity="statusSeverity(data.status)" />
            </template>
          </Column>
          <Column header="Acciones" style="width: 150px">
            <template #body="{ data }">
              <div v-if="data.status === 'pending'" class="flex gap-1">
                <Button v-tooltip.top="'Aprobar'" icon="pi pi-check" severity="success" text size="small" @click="approve(data.id)" />
                <Button v-tooltip.top="'Rechazar'" icon="pi pi-times" severity="danger" text size="small" @click="reject(data.id)" />
              </div>
              <span v-else class="text-xs text-muted-color">—</span>
            </template>
          </Column>
          <template #empty>
            <div class="py-8 text-center">
              <i class="pi pi-check-circle mb-2 text-3xl text-muted-color" />
              <p class="text-muted-color">No hay solicitudes pendientes</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </AppLayout>
</template>
