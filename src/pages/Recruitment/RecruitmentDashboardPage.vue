<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import AppLayout from '@/layouts/AppLayout.vue'
import KpiCards from '@/components/recruitment/metrics/KpiCards.vue'
import FunnelChart from '@/components/recruitment/metrics/FunnelChart.vue'
import SourceDistributionChart from '@/components/recruitment/metrics/SourceDistributionChart.vue'
import TimeToFillChart from '@/components/recruitment/metrics/TimeToFillChart.vue'
import { useMetricsApi } from '@/composables/api/useMetricsApi'
import type { RecruitmentKPIs, FunnelData, SourceDistribution, TimeToFill, MetricsFilters } from '@/types/metrics'

const api = useMetricsApi()
const loading = ref(false)
const kpis = ref<RecruitmentKPIs | null>(null)
const funnel = ref<FunnelData[]>([])
const sources = ref<SourceDistribution[]>([])
const timeToFill = ref<TimeToFill[]>([])
const dateRange = ref<Date[] | null>(null)

function buildFilters(): MetricsFilters {
  const filters: MetricsFilters = {}
  if (dateRange.value?.[0]) filters.dateFrom = dateRange.value[0].toISOString().split('T')[0]
  if (dateRange.value?.[1]) filters.dateTo = dateRange.value[1].toISOString().split('T')[0]
  return filters
}

async function loadAll() {
  loading.value = true
  const filters = buildFilters()
  try {
    const [k, f, s, t] = await Promise.all([
      api.getKPIs(filters),
      api.getFunnel(filters),
      api.getSourceDistribution(filters),
      api.getTimeToFill(filters),
    ])
    kpis.value = k
    funnel.value = f
    sources.value = s
    timeToFill.value = t
  } finally { loading.value = false }
}

function clearFilters() { dateRange.value = null; void loadAll() }

onMounted(() => { void loadAll() })
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col overflow-y-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 border-b border-surface px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-color">Métricas de Reclutamiento</h1>
            <p class="text-sm text-muted-color">Indicadores y tendencias del proceso de selección</p>
          </div>
          <Button icon="pi pi-refresh" severity="secondary" text size="small" :loading="loading" @click="loadAll" />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <DatePicker v-model="dateRange" selection-mode="range" placeholder="Rango de fechas" date-format="dd/mm/yy" show-icon class="w-64" />
          <Button label="Aplicar" icon="pi pi-filter" size="small" @click="loadAll" />
          <Button v-if="dateRange" label="Limpiar" icon="pi pi-times" severity="secondary" text size="small" @click="clearFilters" />
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 px-6 py-4">
        <div v-if="loading && !kpis" class="flex items-center justify-center py-12">
          <i class="pi pi-spin pi-spinner text-3xl text-muted-color" />
        </div>
        <div v-else class="flex flex-col gap-6">
          <KpiCards :kpis="kpis" />
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FunnelChart :data="funnel" />
            <SourceDistributionChart :data="sources" />
          </div>
          <TimeToFillChart :data="timeToFill" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>
