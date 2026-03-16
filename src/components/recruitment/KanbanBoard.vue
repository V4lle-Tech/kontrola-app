<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { PipelineBoard, PipelineApplication } from '@/types/recruitment'
import type { ApiError } from '@/types/api'

interface Props {
  board: PipelineBoard
  search?: string
  filterTagIds?: string[]
}
const props = withDefaults(defineProps<Props>(), { search: '', filterTagIds: () => [] })

const emit = defineEmits<{
  select: [application: PipelineApplication]
  moved: []
}>()

const api = useRecruitmentApi()
const toast = useToast()

interface StageColumn {
  stageId: string
  stageName: string
  stageColor: string
  stageType: string
  requiresApproval: boolean
  applications: PipelineApplication[]
  count: number
}

const columns = ref<StageColumn[]>([])

function buildColumns(board: PipelineBoard): StageColumn[] {
  return board.stages.map((ps) => ({
    stageId: ps.stage.id,
    stageName: ps.stage.name,
    stageColor: ps.stage.color,
    stageType: ps.stage.type,
    requiresApproval: ps.stage.requiresApproval,
    applications: [...ps.applications],
    count: ps.count,
  }))
}

watch(() => props.board, (b) => { columns.value = buildColumns(b) }, { immediate: true })

const filteredColumns = computed(() => {
  if (!props.search && props.filterTagIds.length === 0) return columns.value
  return columns.value.map((col) => {
    let apps = col.applications
    if (props.search) {
      const term = props.search.toLowerCase()
      apps = apps.filter((a) => a.candidateName.toLowerCase().includes(term) || a.candidateEmail.toLowerCase().includes(term))
    }
    if (props.filterTagIds.length > 0) {
      apps = apps.filter((a) => a.tags.some((t) => props.filterTagIds.includes(t.id)))
    }
    return { ...col, applications: apps, count: apps.length }
  })
})

const hasFilters = computed(() => props.search.length > 0 || props.filterTagIds.length > 0)

async function onEnd(evt: { from: HTMLElement; to: HTMLElement; oldIndex: number; newIndex: number; item: HTMLElement }) {
  const fromStageId = evt.from.dataset['stageId']
  const toStageId = evt.to.dataset['stageId']
  if (!fromStageId || !toStageId || fromStageId === toStageId) return

  const toCol = columns.value.find((c) => c.stageId === toStageId)
  if (!toCol) return
  const app = toCol.applications[evt.newIndex]
  if (!app) return

  try {
    await api.moveApplication(app.id, { targetStageId: toStageId })
    toast.add({ severity: 'success', summary: `Candidato movido a ${toCol.stageName}`, life: 2000 })
    emit('moved')
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({ severity: 'error', summary: apiError.title ?? 'Error al mover candidato', life: 5000 })
    columns.value = buildColumns(props.board)
  }
}
</script>

<template>
  <div class="flex h-full gap-4 p-4">
    <div
      v-for="col in (hasFilters ? filteredColumns : columns)"
      :key="col.stageId"
      class="flex w-72 shrink-0 flex-col rounded-xl border border-surface bg-surface-50 dark:bg-surface-800"
    >
      <!-- Column header -->
      <div class="flex items-center gap-2 border-b border-surface px-3 py-2">
        <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: col.stageColor }" />
        <span class="flex-1 truncate text-sm font-semibold text-color">{{ col.stageName }}</span>
        <span class="rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-muted-color dark:bg-surface-700">
          {{ col.count }}
        </span>
      </div>

      <!-- Draggable cards -->
      <draggable
        v-model="col.applications"
        :group="hasFilters ? undefined : 'pipeline'"
        item-key="id"
        :data-stage-id="col.stageId"
        class="flex-1 overflow-y-auto p-2"
        ghost-class="opacity-30"
        drag-class="rotate-2"
        :animation="200"
        @end="onEnd"
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
      <div v-if="!col.applications.length" class="px-2 pb-3 pt-1 text-center text-xs text-muted-color">
        Sin candidatos
      </div>
    </div>
  </div>
</template>
