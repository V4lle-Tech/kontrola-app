<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable, { type DataTablePageEvent, type DataTableSortEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import AdvancedFilterPanel from './AdvancedFilterPanel.vue'
import type { CandidateFilterValues } from './AdvancedFilterPanel.vue'
import { useRecruitmentApi, type CandidateFilters } from '@/composables/api/useRecruitmentApi'
import type { CandidateListItem, CandidateSource } from '@/types/recruitment'
import type { PaginatedResponse } from '@/types/pagination'

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
const activeFilters = ref<CandidateFilterValues>({
  source: null,
  tagIds: [],
  educationLevel: null,
  dateFrom: null,
  dateTo: null,
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function loadData() {
  loading.value = true
  try {
    const params: CandidateFilters = {
      page: page.value,
      pageSize: pageSize.value,
      search: search.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
    }
    if (activeFilters.value.source) params.source = activeFilters.value.source
    if (activeFilters.value.tagIds.length > 0) params.tagIds = activeFilters.value.tagIds
    if (activeFilters.value.educationLevel) params.educationLevel = activeFilters.value.educationLevel
    if (activeFilters.value.dateFrom) params.dateFrom = activeFilters.value.dateFrom
    if (activeFilters.value.dateTo) params.dateTo = activeFilters.value.dateTo
    data.value = await api.getCandidates(params)
  } finally {
    loading.value = false
  }
}

function onPage(event: DataTablePageEvent) {
  page.value = (event.page ?? 0) + 1
  pageSize.value = event.rows
  void loadData()
}

function onSort(event: DataTableSortEvent) {
  if (typeof event.sortField === 'string') {
    sortField.value = event.sortField
  }
  sortOrder.value = event.sortOrder === 1 ? 'asc' : 'desc'
  page.value = 1
  void loadData()
}

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    void loadData()
  }, 300)
}

function onFiltersChange(filters: CandidateFilterValues) {
  activeFilters.value = filters
  page.value = 1
  void loadData()
}

function onRowSelect(candidate: CandidateListItem) {
  emit('select', candidate)
}

function sourceLabel(source: CandidateSource): string {
  const labels: Record<CandidateSource, string> = {
    manual: 'Manual',
    portal: 'Portal',
    referral: 'Referido',
    linkedin: 'LinkedIn',
    indeed: 'Indeed',
    other: 'Otro',
  }
  return labels[source]
}

function sourceSeverity(source: CandidateSource): string {
  const map: Record<CandidateSource, string> = {
    manual: 'secondary',
    portal: 'info',
    referral: 'success',
    linkedin: 'info',
    indeed: 'warn',
    other: 'secondary',
  }
  return map[source]
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Toolbar -->
    <div class="flex flex-col gap-2 border-b border-surface px-4 py-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-color">Candidatos</h2>
        <div class="flex gap-1">
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

      <!-- Advanced filters -->
      <AdvancedFilterPanel
        v-if="showFilters"
        ref="filterPanel"
        @change="onFiltersChange"
      />
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
        @row-select="(e) => onRowSelect(e.data as CandidateListItem)"
      >
        <template #empty>
          <div class="py-6 text-center text-muted-color">
            <i class="pi pi-users mb-2 text-3xl" />
            <p>No se encontraron candidatos</p>
          </div>
        </template>

        <Column field="fullName" header="Nombre" sortable class="min-w-48">
          <template #body="{ data: candidate }">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <i class="pi pi-user text-xs text-primary" />
              </div>
              <div class="min-w-0">
                <p
                  class="truncate font-medium text-color"
                  :class="selectedId === candidate.id ? 'text-primary' : ''"
                >
                  {{ candidate.fullName }}
                </p>
                <p class="truncate text-xs text-muted-color">{{ candidate.email }}</p>
              </div>
            </div>
          </template>
        </Column>

        <Column field="source" header="Fuente" sortable class="w-28">
          <template #body="{ data: candidate }">
            <Tag
              :value="sourceLabel(candidate.source)"
              :severity="sourceSeverity(candidate.source)"
            />
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
  </div>
</template>
