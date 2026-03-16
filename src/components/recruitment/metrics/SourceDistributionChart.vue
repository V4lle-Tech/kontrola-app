<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { sourceLabel } from '@/utils/candidateLabels'
import { useChartTheme } from '@/composables/useChartTheme'
import type { SourceDistribution } from '@/types/metrics'
import type { ChartData, ChartOptions } from 'chart.js'

interface Props {
  data: SourceDistribution[]
}
const props = defineProps<Props>()

const { textColor } = useChartTheme()

const sourceColors: Record<string, string> = {
  manual: '#3b82f6',
  portal: '#8b5cf6',
  referral: '#10b981',
  linkedin: '#0077b5',
  indeed: '#2557a7',
  other: '#6b7280',
}

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: props.data.map((d) => sourceLabel(d.source)),
  datasets: [
    {
      data: props.data.map((d) => d.count),
      backgroundColor: props.data.map((d) => sourceColors[d.source] ?? '#6b7280'),
      borderWidth: 0,
      hoverOffset: 8,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      position: 'right',
      labels: { color: textColor.value, padding: 12, usePointStyle: true, pointStyleWidth: 8 },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const item = props.data[ctx.dataIndex]
          return item ? `${ctx.formattedValue} (${item.percentage.toFixed(1)}%)` : ctx.formattedValue
        },
      },
    },
  },
}))
</script>

<template>
  <div class="rounded-xl border border-surface bg-surface-0 p-4 dark:bg-surface-900">
    <h3 class="mb-3 text-sm font-semibold text-color">Distribución por Fuente</h3>
    <div v-if="!data.length" class="flex items-center justify-center py-8">
      <i class="pi pi-chart-pie mb-2 text-2xl text-muted-color" />
      <p class="text-sm text-muted-color">Sin datos disponibles</p>
    </div>
    <div v-else class="h-64">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
