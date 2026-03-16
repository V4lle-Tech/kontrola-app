<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable, { type DataTablePageEvent, type DataTableSortEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { JobProfile, JobProfileStatus } from '@/types/recruitment'
import type { PaginatedResponse } from '@/types/pagination'

const emit = defineEmits<{
  select: [profile: JobProfile]
  create: []
}>()

interface Props {
  selectedId?: string | null
}
withDefaults(defineProps<Props>(), {
  selectedId: null,
})

const api = useRecruitmentApi()

const data = ref<PaginatedResponse<JobProfile> | null>(null)
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = ref(25)
const sortField = ref('title')
const sortOrder = ref<'asc' | 'desc'>('asc')

let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function loadData() {
  loading.value = true
  try {
    data.value = await api.getJobProfiles({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
    })
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

function onRowSelect(profile: JobProfile) {
  emit('select', profile)
}

function statusLabel(status: JobProfileStatus): string {
  const labels: Record<JobProfileStatus, string> = {
    draft: 'Borrador',
    active: 'Activo',
    archived: 'Archivado',
  }
  return labels[status]
}

function statusSeverity(status: JobProfileStatus): string {
  const map: Record<JobProfileStatus, string> = {
    draft: 'warn',
    active: 'success',
    archived: 'secondary',
  }
  return map[status]
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
        <h2 class="text-lg font-semibold text-color">Perfiles de Puesto</h2>
        <Button icon="pi pi-plus" label="Nuevo" size="small" @click="emit('create')" />
      </div>
      <span class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" />
        <InputText
          v-model="search"
          placeholder="Buscar perfiles..."
          class="w-full pl-9"
          @input="onSearchInput"
        />
      </span>
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
        @row-select="(e) => onRowSelect(e.data as JobProfile)"
      >
        <template #empty>
          <div class="py-6 text-center text-muted-color">
            <i class="pi pi-briefcase mb-2 text-3xl" />
            <p>No se encontraron perfiles de puesto</p>
          </div>
        </template>

        <Column field="title" header="Título" sortable class="min-w-48">
          <template #body="{ data: profile }">
            <div class="min-w-0">
              <p
                class="truncate font-medium text-color"
                :class="selectedId === profile.id ? 'text-primary' : ''"
              >
                {{ profile.title }}
              </p>
              <p class="truncate text-xs text-muted-color">{{ profile.employmentType }}</p>
            </div>
          </template>
        </Column>

        <Column field="status" header="Estado" sortable class="w-28">
          <template #body="{ data: profile }">
            <Tag
              :value="statusLabel(profile.status)"
              :severity="statusSeverity(profile.status)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
