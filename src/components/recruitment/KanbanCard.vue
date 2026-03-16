<script setup lang="ts">
import Tag from 'primevue/tag'
import type { PipelineApplication } from '@/types/recruitment'

interface Props {
  application: PipelineApplication
}
defineProps<Props>()

defineEmits<{
  click: []
}>()

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
}
</script>

<template>
  <div
    class="mb-2 cursor-grab rounded-lg border border-surface bg-surface-0 p-3 transition-shadow hover:shadow-md active:cursor-grabbing dark:bg-surface-900"
    @click="$emit('click')"
  >
    <!-- Header: avatar + name -->
    <div class="flex items-center gap-2">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
        {{ initials(application.candidateName) }}
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-color">{{ application.candidateName }}</p>
        <p class="truncate text-[11px] text-muted-color">{{ application.candidateEmail }}</p>
      </div>
    </div>

    <!-- Metrics row -->
    <div class="mt-1.5 flex items-center gap-2 text-xs text-muted-color">
      <span class="flex items-center gap-0.5">
        <i class="pi pi-clock text-[10px]" />
        {{ application.daysInStage }}d
      </span>
      <span v-if="application.score !== null" class="flex items-center gap-0.5">
        <i class="pi pi-star text-[10px] text-primary" />
        {{ application.score }}
      </span>
      <span v-if="application.totalDays > 0" class="ml-auto text-[11px]">
        {{ application.totalDays }}d total
      </span>
    </div>

    <!-- Tags -->
    <div v-if="application.tags.length" class="mt-1.5 flex flex-wrap gap-1">
      <span
        v-for="tag in application.tags"
        :key="tag.id"
        class="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
        :style="{ backgroundColor: tag.color + '20', color: tag.color }"
      >{{ tag.name }}</span>
    </div>

    <!-- Status indicator for non-active applications -->
    <div v-if="application.status !== 'in_progress'" class="mt-1.5">
      <Tag
        :value="application.status === 'hired' ? 'Contratado' : application.status === 'rejected' ? 'Rechazado' : 'Retirado'"
        :severity="application.status === 'hired' ? 'success' : application.status === 'rejected' ? 'danger' : 'warn'"
      />
    </div>
  </div>
</template>
