<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { apiClient } from '@/api/client'
import { useChartTheme } from '@/composables/useChartTheme'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend)

interface GrowthPoint {
  month: string
  count: number
}

interface RevenuePoint {
  month: string
  mrr: number
}

const { gridColor, textColor } = useChartTheme()
const growthData = ref<GrowthPoint[]>([])
const revenueData = ref<RevenuePoint[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const [growth, revenue] = await Promise.all([
      apiClient.get<GrowthPoint[]>('/admin/reports/tenant-growth'),
      apiClient.get<RevenuePoint[]>('/admin/reports/revenue'),
    ])
    growthData.value = growth.data
    revenueData.value = revenue.data
  } finally { loading.value = false }
}

const growthChartData = computed<ChartData<'line'>>(() => ({
  labels: growthData.value.map((d) => d.month),
  datasets: [
    {
      label: 'Nuevos Tenants',
      data: growthData.value.map((d) => d.count),
      borderColor: '#6366f1',
      backgroundColor: '#6366f133',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
    },
  ],
}))

const growthOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: textColor.value, usePointStyle: true, pointStyleWidth: 8 } },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: textColor.value } },
    y: { grid: { color: gridColor.value }, ticks: { color: textColor.value }, beginAtZero: true },
  },
}))

const revenueChartData = computed<ChartData<'bar'>>(() => ({
  labels: revenueData.value.map((d) => d.month),
  datasets: [
    {
      label: 'MRR (MXN)',
      data: revenueData.value.map((d) => d.mrr),
      backgroundColor: '#10b981cc',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}))

const revenueOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: textColor.value, usePointStyle: true, pointStyleWidth: 8 } },
    tooltip: {
      callbacks: {
        label: (ctx) => `MRR: $${Number(ctx.raw).toLocaleString('es-MX')} MXN`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: textColor.value } },
    y: {
      grid: { color: gridColor.value },
      ticks: {
        color: textColor.value,
        callback: (v) => `$${Number(v).toLocaleString('es-MX')}`,
      },
    },
  },
}))

onMounted(() => { void load() })
</script>

<template>
  <AdminLayout>
    <h1 class="mb-6 text-2xl font-bold text-color">Reportes</h1>
    <div class="flex flex-col gap-6">
      <!-- Tenant Growth -->
      <div class="rounded-xl border border-surface bg-surface-0 p-4 dark:bg-surface-900">
        <h3 class="mb-3 text-sm font-semibold text-color">Crecimiento de Tenants</h3>
        <div v-if="loading" class="flex items-center justify-center py-12">
          <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
        </div>
        <div v-else class="h-72">
          <Line :data="growthChartData" :options="growthOptions" />
        </div>
      </div>

      <!-- Revenue -->
      <div class="rounded-xl border border-surface bg-surface-0 p-4 dark:bg-surface-900">
        <h3 class="mb-3 text-sm font-semibold text-color">Ingreso Recurrente Mensual (MRR)</h3>
        <div v-if="loading" class="flex items-center justify-center py-12">
          <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
        </div>
        <div v-else class="h-72">
          <Bar :data="revenueChartData" :options="revenueOptions" />
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
