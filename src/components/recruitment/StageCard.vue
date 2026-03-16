<script setup lang="ts">
import type { SelectionStage, StageType } from '@/types/recruitment'

interface Props {
  stage: Omit<SelectionStage, 'id'> & { id?: string }
}
defineProps<Props>()

const stageTypeLabels: Record<StageType, string> = {
  application: 'Aplicación',
  intermediate: 'Intermedia',
  hired: 'Contratado',
  rejected: 'Rechazado',
}
</script>

<template>
  <div class="flex items-center gap-3 rounded-lg border border-surface bg-surface-50 px-3 py-2 dark:bg-surface-800">
    <span
      class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      :style="{ backgroundColor: stage.color + '30', color: stage.color }"
    >
      {{ stage.order }}
    </span>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-color">{{ stage.name || 'Sin nombre' }}</p>
      <div class="flex gap-2 text-xs text-muted-color">
        <span>{{ stageTypeLabels[stage.type] }}</span>
        <span v-if="stage.isFinal" class="flex items-center gap-0.5">
          <i class="pi pi-check-circle text-[10px]" /> Final
        </span>
        <span v-if="stage.requiresComments" class="flex items-center gap-0.5">
          <i class="pi pi-comment text-[10px]" /> Comentarios
        </span>
        <span v-if="stage.requiresApproval" class="flex items-center gap-0.5">
          <i class="pi pi-verified text-[10px]" /> Aprobación
        </span>
      </div>
    </div>
    <div
      class="h-4 w-4 shrink-0 rounded-full border border-surface"
      :style="{ backgroundColor: stage.color }"
    />
  </div>
</template>
