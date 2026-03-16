<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useChartTheme } from '@/composables/useChartTheme'
import type { FunnelData } from '@/types/metrics'
import type { ChartData, ChartOptions } from 'chart.js'

interface Props {
  data: FunnelData[]
}
const props = defineProps<Props>()

const { gridColor, textColor } = useChartTheme()

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: props.data.map((d) => d.stageName),
  datasets: [
    {
      label: 'Candidatos',
      data: props.data.map((d) => d.count),
      backgroundColor: props.data.map((d) => d.color + '80'),
      borderColor: props.data.map((d) => d.color),
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const item = props.data[ctx.dataIndex]
          return item ? `${ctx.formattedValue} (${item.percentage.toFixed(1)}%)` : ctx.formattedValue
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: gridColor.value },
      ticks: { color: textColor.value },
    },
    y: {
      grid: { display: false },
      ticks: { color: textColor.value },
    },
  },
}))
</script>

<template>
  <div class="rounded-xl border border-surface bg-surface-0 p-4 dark:bg-surface-900">
    <h3 class="mb-3 text-sm font-semibold text-color">Funnel de Aplicaciones</h3>
    <div v-if="!data.length" class="flex items-center justify-center py-8">
      <i class="pi pi-chart-bar mb-2 text-2xl text-muted-color" />
      <p class="text-sm text-muted-color">Sin datos disponibles</p>
    </div>
    <div v-else class="h-64">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
