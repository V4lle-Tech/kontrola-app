<script setup lang="ts">
import draggable from 'vuedraggable'
import type { PipelineApplication } from '@/types/recruitment'

interface Props {
  stageId: string
  stageName: string
  stageColor: string
  count: number
  dragEnabled?: boolean
}
withDefaults(defineProps<Props>(), { dragEnabled: true })

const applications = defineModel<PipelineApplication[]>('applications', { required: true })

interface DragEvent {
  from: HTMLElement
  to: HTMLElement
  oldIndex: number
  newIndex: number
}

const emit = defineEmits<{
  select: [application: PipelineApplication]
  dragEnd: [evt: DragEvent]
}>()

function onDragEnd(evt: unknown) {
  emit('dragEnd', evt as DragEvent)
}
</script>

<template>
  <div class="flex w-72 shrink-0 flex-col rounded-xl border border-surface bg-surface-50 dark:bg-surface-800">
    <!-- Column header -->
    <div class="flex items-center gap-2 border-b border-surface px-3 py-2">
      <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: stageColor }" />
      <span class="flex-1 truncate text-sm font-semibold text-color">{{ stageName }}</span>
      <span class="rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-muted-color dark:bg-surface-700">
        {{ count }}
      </span>
    </div>

    <!-- Draggable cards area -->
    <draggable
      v-model="applications"
      :group="dragEnabled ? 'pipeline' : undefined"
      item-key="id"
      :data-stage-id="stageId"
      class="flex-1 overflow-y-auto p-2"
      ghost-class="opacity-30"
      drag-class="rotate-2"
      :animation="200"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <div
          class="mb-2 cursor-grab rounded-lg border border-surface bg-surface-0 p-3 transition-shadow hover:shadow-md active:cursor-grabbing dark:bg-surface-900"
          @click="emit('select', element)"
        >
          <p class="text-sm font-medium text-color">{{ element.candidateName }}</p>
          <div class="mt-0.5 flex items-center gap-2 text-xs text-muted-color">
            <span><i class="pi pi-clock mr-0.5 text-[10px]" />{{ element.daysInStage }}d</span>
            <span v-if="element.score !== null"><i class="pi pi-star mr-0.5 text-[10px]" />{{ element.score }}</span>
            <span v-if="element.totalDays > 0" class="ml-auto">{{ element.totalDays }}d total</span>
          </div>
          <div v-if="element.tags.length" class="mt-1.5 flex flex-wrap gap-1">
            <span
              v-for="tag in element.tags"
              :key="tag.id"
              class="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              :style="{ backgroundColor: tag.color + '20', color: tag.color }"
            >{{ tag.name }}</span>
          </div>
        </div>
      </template>
    </draggable>

    <!-- Empty state -->
    <div v-if="!applications.length" class="px-2 pb-3 pt-1 text-center text-xs text-muted-color">
      Sin candidatos
    </div>
  </div>
</template>
