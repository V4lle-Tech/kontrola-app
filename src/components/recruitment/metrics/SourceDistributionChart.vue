<script setup lang="ts">
import type { SourceDistribution } from '@/types/metrics'

interface Props {
  data: SourceDistribution[]
}
defineProps<Props>()
</script>

<template>
  <div class="rounded-xl border border-surface bg-surface-0 p-4 dark:bg-surface-900">
    <h3 class="mb-3 text-sm font-semibold text-color">Distribución por Fuente</h3>
    <div v-if="!data.length" class="flex items-center justify-center py-8">
      <p class="text-sm text-muted-color">Sin datos disponibles</p>
    </div>
    <div v-else class="text-sm text-muted-color">Placeholder — se implementa en F6-04</div>
  </div>
</template>
