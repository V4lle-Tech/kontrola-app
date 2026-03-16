<script setup lang="ts">
import type { PipelineBoard } from '@/types/recruitment'

interface Props {
  board: PipelineBoard
  search?: string
  filterTagIds?: string[]
}
const props = withDefaults(defineProps<Props>(), {
  search: '',
  filterTagIds: () => [],
})

import { computed } from 'vue'

const filteredStages = computed(() => {
  return props.board.stages.map((ps) => {
    let apps = ps.applications
    if (props.search) {
      const term = props.search.toLowerCase()
      apps = apps.filter((a) => a.candidateName.toLowerCase().includes(term) || a.candidateEmail.toLowerCase().includes(term))
    }
    if (props.filterTagIds.length > 0) {
      apps = apps.filter((a) => a.tags.some((t) => props.filterTagIds.includes(t.id)))
    }
    return { ...ps, applications: apps, count: apps.length }
  })
})
</script>

<template>
  <div class="flex h-full gap-4 p-4">
    <div
      v-for="pipelineStage in filteredStages"
      :key="pipelineStage.stage.id"
      class="flex w-72 shrink-0 flex-col rounded-xl border border-surface bg-surface-50 dark:bg-surface-800"
    >
      <!-- Stage header -->
      <div class="flex items-center gap-2 border-b border-surface px-3 py-2">
        <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: pipelineStage.stage.color }" />
        <span class="flex-1 truncate text-sm font-semibold text-color">{{ pipelineStage.stage.name }}</span>
        <span class="rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-muted-color dark:bg-surface-700">
          {{ pipelineStage.count }}
        </span>
      </div>
      <!-- Cards area -->
      <div class="flex-1 overflow-y-auto p-2">
        <div
          v-for="app in pipelineStage.applications"
          :key="app.id"
          class="mb-2 cursor-pointer rounded-lg border border-surface bg-surface-0 p-3 transition-shadow hover:shadow-md dark:bg-surface-900"
        >
          <p class="text-sm font-medium text-color">{{ app.candidateName }}</p>
          <div class="mt-0.5 flex items-center gap-2 text-xs text-muted-color">
            <span>{{ app.daysInStage }}d en etapa</span>
            <span v-if="app.score !== null">· {{ app.score }}pts</span>
          </div>
          <div v-if="app.tags.length" class="mt-1.5 flex flex-wrap gap-1">
            <span
              v-for="tag in app.tags"
              :key="tag.id"
              class="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              :style="{ backgroundColor: tag.color + '20', color: tag.color }"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>
        <div v-if="!pipelineStage.applications.length" class="py-4 text-center text-xs text-muted-color">
          Sin candidatos
        </div>
      </div>
    </div>
  </div>
</template>
