<script setup lang="ts">
import type { RecruitmentKPIs } from '@/types/metrics'

interface Props {
  kpis: RecruitmentKPIs | null
}
defineProps<Props>()

const cards = [
  { key: 'totalCandidates', label: 'Candidatos', icon: 'pi pi-users', color: 'text-primary' },
  { key: 'totalApplications', label: 'Postulaciones', icon: 'pi pi-file', color: 'text-muted-color' },
  { key: 'totalHired', label: 'Contratados', icon: 'pi pi-check-circle', color: 'text-primary' },
  { key: 'openVacancies', label: 'Vacantes Abiertas', icon: 'pi pi-megaphone', color: 'text-primary' },
  { key: 'averageTimeToFill', label: 'Días Promedio', icon: 'pi pi-clock', color: 'text-muted-color' },
  { key: 'conversionRate', label: 'Tasa Conversión', icon: 'pi pi-percentage', color: 'text-primary' },
] as const

function formatValue(key: string, value: number): string {
  if (key === 'conversionRate') return `${value.toFixed(1)}%`
  if (key === 'averageTimeToFill') return `${value.toFixed(0)}d`
  return value.toLocaleString('es-MX')
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
    <div
      v-for="card in cards"
      :key="card.key"
      class="rounded-xl border border-surface bg-surface-0 p-4 dark:bg-surface-900"
    >
      <div class="flex items-center gap-2">
        <i :class="[card.icon, card.color, 'text-lg']" />
        <span class="text-xs font-medium text-muted-color">{{ card.label }}</span>
      </div>
      <p class="mt-2 text-2xl font-bold text-color">
        {{ kpis ? formatValue(card.key, kpis[card.key]) : '—' }}
      </p>
    </div>
  </div>
</template>
