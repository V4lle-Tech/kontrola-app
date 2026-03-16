<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import AppLayout from '@/layouts/AppLayout.vue'
import { useDocumentsApi } from '@/composables/api/useDocumentsApi'
import type { ComplianceRecord } from '@/types/document'

const api = useDocumentsApi()
const records = ref<ComplianceRecord[]>([])
const loading = ref(false)
const totalRecords = ref(0)
const page = ref(0)
const rows = ref(20)

async function load() {
  loading.value = true
  try {
    const res = await api.getCompliance({ page: page.value + 1, pageSize: rows.value })
    records.value = res.items
    totalRecords.value = res.totalCount
  } finally { loading.value = false }
}

function onPage(event: { page: number; rows: number }) {
  page.value = event.page
  rows.value = event.rows
  void load()
}

function complianceSeverity(percent: number): string {
  if (percent >= 100) return 'success'
  if (percent >= 50) return 'warn'
  return 'danger'
}

function docStatusSeverity(status: string): string {
  const map: Record<string, string> = { missing: 'danger', pending: 'warn', verified: 'success', expired: 'secondary' }
  return map[status] ?? 'secondary'
}

function docStatusLabel(status: string): string {
  const map: Record<string, string> = { missing: 'Faltante', pending: 'Pendiente', verified: 'Verificado', expired: 'Expirado' }
  return map[status] ?? status
}

onMounted(() => { void load() })
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-surface px-6 py-4">
        <div>
          <h1 class="text-xl font-semibold text-color">Cumplimiento Documental</h1>
          <p class="text-sm text-muted-color">Estado de documentación requerida por candidato</p>
        </div>
        <Button icon="pi pi-refresh" severity="secondary" text size="small" :loading="loading" @click="load" />
      </div>
      <div class="flex-1 overflow-auto px-6 py-4">
        <DataTable :value="records" :loading="loading" lazy paginator :rows="rows" :total-records="totalRecords" :rows-per-page-options="[10, 20, 50]" :expandable-row-groups="false" @page="onPage">
          <Column field="candidateName" header="Candidato" />
          <Column header="Progreso" style="width: 200px">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <ProgressBar :value="data.completionPercent" :show-value="false" class="h-2 flex-1" />
                <span class="text-xs font-medium text-color">{{ data.completionPercent }}%</span>
              </div>
            </template>
          </Column>
          <Column header="Documentos" style="width: 180px">
            <template #body="{ data }">
              <div class="flex gap-2 text-xs text-muted-color">
                <span>{{ data.totalVerified }}/{{ data.totalRequired }} verificados</span>
              </div>
            </template>
          </Column>
          <Column header="Expirados" style="width: 100px">
            <template #body="{ data }">
              <Tag v-if="data.totalExpired > 0" :value="`${data.totalExpired}`" severity="danger" />
              <span v-else class="text-xs text-muted-color">0</span>
            </template>
          </Column>
          <Column header="Estado" style="width: 120px">
            <template #body="{ data }">
              <Tag :value="data.completionPercent >= 100 ? 'Completo' : 'Incompleto'" :severity="complianceSeverity(data.completionPercent)" />
            </template>
          </Column>
          <Column :expander="true" style="width: 40px" />
          <template #expansion="{ data }">
            <div class="p-4">
              <div class="flex flex-wrap gap-2">
                <Tag v-for="doc in data.documents" :key="doc.documentTypeId" :value="`${doc.documentTypeName}: ${docStatusLabel(doc.status)}`" :severity="docStatusSeverity(doc.status)" />
              </div>
            </div>
          </template>
          <template #empty>
            <div class="py-8 text-center">
              <i class="pi pi-verified mb-2 text-3xl text-muted-color" />
              <p class="text-muted-color">No hay registros de cumplimiento</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </AppLayout>
</template>
