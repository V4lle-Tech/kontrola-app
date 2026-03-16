<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import KanbanColumn from './KanbanColumn.vue'
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
  approvalRequired: [application: PipelineApplication, targetStageId: string]
}>()

const api = useRecruitmentApi()
const toast = useToast()

export interface StageColumn {
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
const displayColumns = computed(() => hasFilters.value ? filteredColumns.value : columns.value)

async function onDragEnd(evt: { from: HTMLElement; to: HTMLElement; oldIndex: number; newIndex: number }) {
  const fromStageId = evt.from.dataset['stageId']
  const toStageId = evt.to.dataset['stageId']
  if (!fromStageId || !toStageId || fromStageId === toStageId) return

  const toCol = columns.value.find((c) => c.stageId === toStageId)
  if (!toCol) return
  const app = toCol.applications[evt.newIndex]
  if (!app) return

  if (toCol.requiresApproval) {
    columns.value = buildColumns(props.board)
    emit('approvalRequired', app, toStageId)
    return
  }

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
    <KanbanColumn
      v-for="col in displayColumns"
      :key="col.stageId"
      v-model:applications="col.applications"
      :stage-id="col.stageId"
      :stage-name="col.stageName"
      :stage-color="col.stageColor"
      :count="col.count"
      :drag-enabled="!hasFilters"
      @select="(app) => emit('select', app)"
      @drag-end="onDragEnd"
    />
  </div>
</template>
