<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useChartTheme } from '@/composables/useChartTheme'
import type { TimeToFill } from '@/types/metrics'
import type { ChartData, ChartOptions } from 'chart.js'

interface Props {
  data: TimeToFill[]
}
const props = defineProps<Props>()

const { gridColor, textColor } = useChartTheme()

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: props.data.map((d) => d.jobProfileTitle),
  datasets: [
    {
      label: 'Promedio',
      data: props.data.map((d) => d.averageDays),
      backgroundColor: '#f97316cc',
      borderColor: '#f97316',
      borderWidth: 1,
      borderRadius: 4,
    },
    {
      label: 'Mínimo',
      data: props.data.map((d) => d.minDays),
      backgroundColor: '#10b981cc',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 4,
    },
    {
      label: 'Máximo',
      data: props.data.map((d) => d.maxDays),
      backgroundColor: '#ef4444cc',
      borderColor: '#ef4444',
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: textColor.value, usePointStyle: true, pointStyleWidth: 8 },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue} días`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: textColor.value },
    },
    y: {
      grid: { color: gridColor.value },
      ticks: { color: textColor.value },
      title: { display: true, text: 'Días', color: textColor.value },
    },
  },
}))
</script>

<template>
  <div class="rounded-xl border border-surface bg-surface-0 p-4 dark:bg-surface-900">
    <h3 class="mb-3 text-sm font-semibold text-color">Tiempo Promedio de Llenado</h3>
    <div v-if="!data.length" class="flex items-center justify-center py-8">
      <i class="pi pi-clock mb-2 text-2xl text-muted-color" />
      <p class="text-sm text-muted-color">Sin datos disponibles</p>
    </div>
    <div v-else class="h-72">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
