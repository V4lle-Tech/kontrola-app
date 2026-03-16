<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import AppLayout from '@/layouts/AppLayout.vue'
import KanbanBoard from '@/components/recruitment/KanbanBoard.vue'
import CandidateProfileDrawer from '@/components/recruitment/CandidateProfileDrawer.vue'
import CandidateHistoryDrawer from '@/components/recruitment/CandidateHistoryDrawer.vue'
import FinalStageModal from '@/components/recruitment/FinalStageModal.vue'
import AddNoteModal from '@/components/recruitment/AddNoteModal.vue'
import SkipConfirmModal from '@/components/recruitment/SkipConfirmModal.vue'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { Vacancy, Tag, PipelineBoard, PipelineApplication, SelectionStage } from '@/types/recruitment'

const api = useRecruitmentApi()
const vacancies = ref<Vacancy[]>([])
const selectedVacancyId = ref<string | null>(null)
const board = ref<PipelineBoard | null>(null)
const loading = ref(false)
const loadingBoard = ref(false)
const availableTags = ref<Tag[]>([])
const filterTags = ref<string[]>([])
const filterSearch = ref('')
const showFilters = ref(false)
const selectedApp = ref<PipelineApplication | null>(null)
const showDrawer = ref(false)
const showHistory = ref(false)
const historyAppId = ref<string | null>(null)
const showFinalModal = ref(false)
const finalApp = ref<PipelineApplication | null>(null)
const showNoteModal = ref(false)
const noteAppId = ref<string | null>(null)
const showSkipModal = ref(false)
const skipApp = ref<PipelineApplication | null>(null)

function onSelectApp(app: PipelineApplication) { selectedApp.value = app; showDrawer.value = true }
function onViewHistory(applicationId: string) { historyAppId.value = applicationId; showHistory.value = true }
function onFinalDecision(app: PipelineApplication) { finalApp.value = app; showFinalModal.value = true }
function onAddNote(applicationId: string) { noteAppId.value = applicationId; showNoteModal.value = true }
function onSkipStage(app: PipelineApplication) { skipApp.value = app; showSkipModal.value = true }

const boardStages = computed<SelectionStage[]>(() => board.value?.stages?.map((s) => s.stage) ?? [])

const selectedVacancy = computed(() => vacancies.value.find((v) => v.id === selectedVacancyId.value) ?? null)
const vacancyOptions = computed(() => vacancies.value.map((v) => ({ label: v.jobProfile?.title ?? v.slug, value: v.id, subtitle: v.slug })))
const hasActiveFilters = computed(() => filterTags.value.length > 0 || filterSearch.value.length > 0)
const totalCandidates = computed(() => board.value?.stages?.reduce((sum, s) => sum + s.count, 0) ?? 0)

async function loadVacancies() {
  loading.value = true
  try {
    vacancies.value = await api.getActiveVacancies()
    if (vacancies.value.length > 0 && !selectedVacancyId.value) {
      selectedVacancyId.value = vacancies.value[0]?.id ?? null
      if (selectedVacancyId.value) void loadBoard()
    }
  } finally { loading.value = false }
}

async function loadBoard() {
  if (!selectedVacancyId.value) return
  loadingBoard.value = true
  try { board.value = await api.getPipelineBoard(selectedVacancyId.value) }
  finally { loadingBoard.value = false }
}

function onVacancyChange() { board.value = null; void loadBoard() }
function clearFilters() { filterTags.value = []; filterSearch.value = '' }

onMounted(() => { void loadVacancies(); void api.getTags('candidate').then((t) => { availableTags.value = t }).catch(() => {}) })
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <!-- Header -->
      <div class="flex flex-col gap-2 border-b border-surface px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-color">Pipeline</h1>
            <p class="text-sm text-muted-color">Gestiona el flujo de candidatos por etapas</p>
          </div>
          <div class="flex gap-1">
            <Button v-tooltip.top="'Filtros'" icon="pi pi-filter" :severity="hasActiveFilters ? 'primary' : 'secondary'" text size="small" @click="showFilters = !showFilters" />
            <Button v-tooltip.top="'Recargar'" icon="pi pi-refresh" severity="secondary" text size="small" :loading="loadingBoard" @click="loadBoard" />
          </div>
        </div>
        <div class="flex items-center gap-3">
          <Select v-model="selectedVacancyId" :options="vacancyOptions" option-label="label" option-value="value" placeholder="Seleccionar vacante" class="w-full max-w-md" :loading="loading" @change="onVacancyChange">
            <template #option="{ option }">
              <div>
                <p class="font-medium">{{ option.label }}</p>
                <p class="text-xs text-muted-color">{{ option.subtitle }}</p>
              </div>
            </template>
          </Select>
          <span v-if="selectedVacancy" class="text-sm text-muted-color">{{ totalCandidates }} candidatos</span>
        </div>
        <div v-if="showFilters" class="flex flex-wrap items-center gap-2 rounded-lg bg-surface-50 px-3 py-2 dark:bg-surface-800">
          <span class="relative flex-1">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" />
            <input v-model="filterSearch" type="text" placeholder="Buscar candidato..." class="w-full rounded-md border border-surface bg-surface-0 py-1.5 pl-9 pr-3 text-sm text-color placeholder:text-muted-color focus:border-primary focus:outline-none dark:bg-surface-900" />
          </span>
          <MultiSelect v-model="filterTags" :options="availableTags" option-label="name" option-value="id" placeholder="Etiquetas" :max-selected-labels="2" class="w-56" />
          <Button v-if="hasActiveFilters" icon="pi pi-times" label="Limpiar" severity="secondary" text size="small" @click="clearFilters" />
        </div>
      </div>

      <!-- Board content -->
      <div class="flex-1 overflow-x-auto overflow-y-hidden">
        <div v-if="loading" class="flex h-full items-center justify-center">
          <i class="pi pi-spin pi-spinner text-3xl text-muted-color" />
        </div>
        <div v-else-if="!vacancies.length" class="flex h-full flex-col items-center justify-center">
          <i class="pi pi-megaphone mb-3 text-4xl text-muted-color" />
          <p class="text-muted-color">No hay vacantes publicadas</p>
        </div>
        <div v-else-if="!selectedVacancyId" class="flex h-full flex-col items-center justify-center">
          <i class="pi pi-arrow-right-arrow-left mb-3 text-4xl text-muted-color" />
          <p class="text-muted-color">Selecciona una vacante para ver el pipeline</p>
        </div>
        <div v-else-if="loadingBoard" class="flex h-full items-center justify-center">
          <i class="pi pi-spin pi-spinner text-3xl text-muted-color" />
        </div>
        <KanbanBoard v-else-if="board" :board="board" :search="filterSearch" :filter-tag-ids="filterTags" @moved="loadBoard" @select="onSelectApp" />
      </div>
    </div>
    <CandidateProfileDrawer v-model:visible="showDrawer" :application="selectedApp" @view-history="onViewHistory" @final-decision="onFinalDecision" @add-note="onAddNote" @skip-stage="onSkipStage" />
    <CandidateHistoryDrawer v-model:visible="showHistory" :application-id="historyAppId" />
    <FinalStageModal v-model:visible="showFinalModal" :application="finalApp" :stages="boardStages" @completed="loadBoard" />
    <AddNoteModal v-model:visible="showNoteModal" :application-id="noteAppId" @saved="loadBoard" />
    <SkipConfirmModal v-model:visible="showSkipModal" :application="skipApp" :stages="boardStages" @submitted="loadBoard" />
  </AppLayout>
</template>
