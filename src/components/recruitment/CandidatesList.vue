<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DataTable, { type DataTablePageEvent, type DataTableSortEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import AdvancedFilterPanel from './AdvancedFilterPanel.vue'
import BulkTagDialog from './BulkTagDialog.vue'
import SavedSearchPanel from './SavedSearchPanel.vue'
import type { CandidateFilterValues } from './AdvancedFilterPanel.vue'
import { useRecruitmentApi, type CandidateFilters } from '@/composables/api/useRecruitmentApi'
import type { CandidateListItem } from '@/types/recruitment'
import type { PaginatedResponse } from '@/types/pagination'
import { sourceLabel, sourceSeverity } from '@/utils/candidateLabels'

const emit = defineEmits<{
  select: [candidate: CandidateListItem]
  create: []
}>()

interface Props {
  selectedId?: string | null
}
withDefaults(defineProps<Props>(), {
  selectedId: null,
})

const api = useRecruitmentApi()
const data = ref<PaginatedResponse<CandidateListItem> | null>(null)
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = ref(25)
const sortField = ref('fullName')
const sortOrder = ref<'asc' | 'desc'>('asc')
const showFilters = ref(false)
const filterPanel = ref<InstanceType<typeof AdvancedFilterPanel> | null>(null)
const activeFilters = ref<CandidateFilterValues>({ source: null, tagIds: [], educationLevel: null, dateFrom: null, dateTo: null })

const selectedIds = ref<Set<string>>(new Set())
const bulkMode = ref(false)
const showBulkTagDialog = ref(false)
const bulkAction = ref<'assign' | 'remove'>('assign')
const selectedCount = computed(() => selectedIds.value.size)
const bulkCandidateIds = computed(() => Array.from(selectedIds.value))

function toggleBulkMode() {
  bulkMode.value = !bulkMode.value
  if (!bulkMode.value) selectedIds.value = new Set()
}

function toggleCandidate(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function toggleAll() {
  if (!data.value) return
  if (selectedIds.value.size === data.value.items.length) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(data.value.items.map((c) => c.id))
  }
}

function openBulkTag(action: 'assign' | 'remove') {
  bulkAction.value = action
  showBulkTagDialog.value = true
}

function onBulkDone() { selectedIds.value = new Set(); bulkMode.value = false; void loadData() }

const showSavedSearches = ref(false)
const savedSearchPanel = ref<InstanceType<typeof SavedSearchPanel> | null>(null)
const currentFilters = computed<Record<string, unknown>>(() => ({ search: search.value, ...activeFilters.value }))

function applySavedSearch(filters: Record<string, unknown>) {
  search.value = (filters['search'] as string) ?? ''
  activeFilters.value = {
    source: (filters['source'] as CandidateFilterValues['source']) ?? null,
    tagIds: (filters['tagIds'] as string[]) ?? [],
    educationLevel: (filters['educationLevel'] as CandidateFilterValues['educationLevel']) ?? null,
    dateFrom: (filters['dateFrom'] as string) ?? null,
    dateTo: (filters['dateTo'] as string) ?? null,
  }
  showSavedSearches.value = false
  page.value = 1
  void loadData()
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function loadData() {
  loading.value = true
  try {
    const f = activeFilters.value
    const params: CandidateFilters = {
      page: page.value, pageSize: pageSize.value, search: search.value,
      sortField: sortField.value, sortOrder: sortOrder.value,
      ...(f.source && { source: f.source }),
      ...(f.tagIds.length > 0 && { tagIds: f.tagIds }),
      ...(f.educationLevel && { educationLevel: f.educationLevel }),
      ...(f.dateFrom && { dateFrom: f.dateFrom }),
      ...(f.dateTo && { dateTo: f.dateTo }),
    }
    data.value = await api.getCandidates(params)
  } finally {
    loading.value = false
  }
}

function onPage(event: DataTablePageEvent) { page.value = (event.page ?? 0) + 1; pageSize.value = event.rows; void loadData() }
function onSort(event: DataTableSortEvent) {
  if (typeof event.sortField === 'string') sortField.value = event.sortField
  sortOrder.value = event.sortOrder === 1 ? 'asc' : 'desc'; page.value = 1; void loadData()
}
function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { page.value = 1; void loadData() }, 300)
}
function onFiltersChange(filters: CandidateFilterValues) { activeFilters.value = filters; page.value = 1; void loadData() }

onMounted(() => void loadData())
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Toolbar -->
    <div class="flex flex-col gap-2 border-b border-surface px-4 py-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-color">Candidatos</h2>
        <div class="flex gap-1">
          <Button
            v-tooltip.top="'Selección masiva'"
            icon="pi pi-check-square"
            :severity="bulkMode ? 'primary' : 'secondary'"
            text
            size="small"
            @click="toggleBulkMode"
          />
          <Button
            v-tooltip.top="'Búsquedas guardadas'"
            icon="pi pi-bookmark"
            :severity="showSavedSearches ? 'primary' : 'secondary'"
            text
            size="small"
            @click="showSavedSearches = !showSavedSearches"
          />
          <Button
            v-tooltip.top="'Guardar búsqueda'"
            icon="pi pi-save"
            severity="secondary"
            text
            size="small"
            @click="savedSearchPanel?.openSave()"
          />
          <Button
            icon="pi pi-filter"
            :severity="filterPanel?.hasActiveFilters ? 'primary' : 'secondary'"
            text
            size="small"
            :badge="filterPanel?.hasActiveFilters ? '!' : undefined"
            @click="showFilters = !showFilters"
          />
          <Button icon="pi pi-plus" label="Nuevo" size="small" @click="emit('create')" />
        </div>
      </div>
      <span class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" />
        <InputText
          v-model="search"
          placeholder="Buscar candidatos..."
          class="w-full pl-9"
          @input="onSearchInput"
        />
      </span>
      <AdvancedFilterPanel v-if="showFilters" ref="filterPanel" @change="onFiltersChange" />
    </div>

    <!-- Saved searches -->
    <SavedSearchPanel
      v-if="showSavedSearches"
      ref="savedSearchPanel"
      module="candidates"
      :current-filters="currentFilters"
      @apply="applySavedSearch"
    />

    <!-- Bulk action bar -->
    <div v-if="bulkMode && selectedCount > 0" class="flex items-center gap-2 border-b border-surface bg-primary/5 px-4 py-2">
      <span class="text-sm font-medium text-color">{{ selectedCount }} seleccionados</span>
      <Button icon="pi pi-tag" label="Asignar tags" severity="info" size="small" @click="openBulkTag('assign')" />
      <Button icon="pi pi-times" label="Remover tags" severity="warn" size="small" @click="openBulkTag('remove')" />
    </div>

    <!-- DataTable -->
    <div class="flex-1 overflow-auto">
      <DataTable
        :value="data?.items ?? []"
        :loading="loading"
        :lazy="true"
        :paginator="true"
        :rows="pageSize"
        :total-records="data?.totalCount ?? 0"
        :rows-per-page-options="[10, 25, 50]"
        :sort-field="sortField"
        :sort-order="sortOrder === 'asc' ? 1 : -1"
        data-key="id"
        selection-mode="single"
        :meta-key-selection="false"
        striped-rows
        scrollable
        scroll-height="flex"
        class="text-sm"
        @page="onPage"
        @sort="onSort"
        @row-select="(e) => emit('select', e.data as CandidateListItem)"
      >
        <template #empty>
          <div class="py-6 text-center text-muted-color">
            <i class="pi pi-users mb-2 text-3xl" />
            <p>No se encontraron candidatos</p>
          </div>
        </template>

        <Column v-if="bulkMode" header="" class="w-12">
          <template #header>
            <Checkbox :model-value="data ? selectedIds.size === data.items.length && data.items.length > 0 : false" :binary="true" @update:model-value="toggleAll" />
          </template>
          <template #body="{ data: candidate }">
            <Checkbox :model-value="selectedIds.has(candidate.id)" :binary="true" @update:model-value="toggleCandidate(candidate.id)" />
          </template>
        </Column>

        <Column field="fullName" header="Nombre" sortable class="min-w-48">
          <template #body="{ data: candidate }">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <i class="pi pi-user text-xs text-primary" />
              </div>
              <div class="min-w-0">
                <p class="truncate font-medium text-color" :class="selectedId === candidate.id ? 'text-primary' : ''">
                  {{ candidate.fullName }}
                </p>
                <p class="truncate text-xs text-muted-color">{{ candidate.email }}</p>
              </div>
            </div>
          </template>
        </Column>

        <Column field="source" header="Fuente" sortable class="w-28">
          <template #body="{ data: candidate }">
            <Tag :value="sourceLabel(candidate.source)" :severity="sourceSeverity(candidate.source)" />
          </template>
        </Column>

        <Column field="tags" header="Etiquetas" class="min-w-32">
          <template #body="{ data: candidate }">
            <div v-if="candidate.tags?.length" class="flex flex-wrap gap-1">
              <Tag
                v-for="tag in candidate.tags"
                :key="tag.id"
                :value="tag.name"
                :style="{ backgroundColor: tag.color + '20', color: tag.color }"
              />
            </div>
            <span v-else class="text-xs text-muted-color">—</span>
          </template>
        </Column>

        <Column field="applicationsCount" header="Postulaciones" class="w-28">
          <template #body="{ data: candidate }">
            <span class="text-muted-color">{{ candidate.applicationsCount }}</span>
          </template>
        </Column>
      </DataTable>
    </div>

    <BulkTagDialog
      v-model:visible="showBulkTagDialog"
      :candidate-ids="bulkCandidateIds"
      :action="bulkAction"
      @done="onBulkDone"
    />
  </div>
</template>
