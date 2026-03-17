<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable, { type DataTablePageEvent, type DataTableSortEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { Vacancy, VacancyStatus } from '@/types/recruitment'
import type { PaginatedResponse } from '@/types/pagination'
import type { ApiError } from '@/types/api'
import { usePermissions } from '@/composables/usePermissions'

const api = useRecruitmentApi()
const toast = useToast()
const { can } = usePermissions()

const data = ref<PaginatedResponse<Vacancy> | null>(null)
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = ref(25)
const sortField = ref('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')
const statusFilter = ref<VacancyStatus | null>(null)

const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Borrador', value: 'draft' },
  { label: 'Publicada', value: 'published' },
  { label: 'Pausada', value: 'paused' },
  { label: 'Cerrada', value: 'closed' },
  { label: 'Cubierta', value: 'filled' },
]

let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function loadData() {
  loading.value = true
  try {
    data.value = await api.getVacancies({
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

function statusLabel(status: VacancyStatus): string {
  const labels: Record<VacancyStatus, string> = {
    draft: 'Borrador',
    published: 'Publicada',
    paused: 'Pausada',
    closed: 'Cerrada',
    filled: 'Cubierta',
  }
  return labels[status]
}

function statusSeverity(status: VacancyStatus): string {
  const map: Record<VacancyStatus, string> = {
    draft: 'secondary',
    published: 'success',
    paused: 'warn',
    closed: 'danger',
    filled: 'info',
  }
  return map[status]
}

async function updateStatus(vacancy: Vacancy, newStatus: VacancyStatus) {
  try {
    await api.updateVacancy(vacancy.id, { status: newStatus })
    toast.add({ severity: 'success', summary: `Vacante ${statusLabel(newStatus).toLowerCase()}`, life: 3000 })
    void loadData()
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({
      severity: 'error',
      summary: apiError.title ?? 'Error al actualizar vacante',
      life: 5000,
    })
  }
}

async function deleteVacancy(vacancy: Vacancy) {
  try {
    await api.deleteVacancy(vacancy.id)
    toast.add({ severity: 'success', summary: 'Vacante eliminada', life: 3000 })
    void loadData()
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({
      severity: 'error',
      summary: apiError.title ?? 'Error al eliminar vacante',
      life: 5000,
    })
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <!-- Header -->
      <div class="flex flex-col gap-2 border-b border-surface px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-color">Vacantes</h1>
            <p class="text-sm text-muted-color">Gestiona las vacantes publicadas desde perfiles de puesto</p>
          </div>
        </div>
        <div class="flex gap-2">
          <span class="relative flex-1">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" />
            <InputText
              v-model="search"
              placeholder="Buscar vacantes..."
              class="w-full pl-9"
              @input="onSearchInput"
            />
          </span>
          <Select
            v-model="statusFilter"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="Estado"
            class="w-40"
          />
        </div>
      </div>

      <!-- DataTable -->
      <div class="flex-1 overflow-auto p-6">
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
          striped-rows
          class="text-sm"
          @page="onPage"
          @sort="onSort"
        >
          <template #empty>
            <div class="py-6 text-center text-muted-color">
              <i class="pi pi-megaphone mb-2 text-3xl" />
              <p>No se encontraron vacantes</p>
            </div>
          </template>

          <Column field="jobProfile.title" header="Perfil de Puesto" sortable class="min-w-48">
            <template #body="{ data: vacancy }">
              <div class="min-w-0">
                <p class="truncate font-medium text-color">
                  {{ vacancy.jobProfile?.title ?? 'Sin perfil' }}
                </p>
                <p class="truncate text-xs text-muted-color">{{ vacancy.slug }}</p>
              </div>
            </template>
          </Column>

          <Column field="status" header="Estado" sortable class="w-32">
            <template #body="{ data: vacancy }">
              <Tag
                :value="statusLabel(vacancy.status)"
                :severity="statusSeverity(vacancy.status)"
              />
            </template>
          </Column>

          <Column field="publishedAt" header="Publicada" sortable class="w-36">
            <template #body="{ data: vacancy }">
              <span class="text-sm text-muted-color">{{ formatDate(vacancy.publishedAt) }}</span>
            </template>
          </Column>

          <Column field="createdAt" header="Creada" sortable class="w-36">
            <template #body="{ data: vacancy }">
              <span class="text-sm text-muted-color">{{ formatDate(vacancy.createdAt) }}</span>
            </template>
          </Column>

          <Column header="Acciones" class="w-40">
            <template #body="{ data: vacancy }">
              <div class="flex gap-1">
                <Button
                  v-if="vacancy.status === 'draft' && can('vacancies.update')"
                  v-tooltip.top="'Publicar'"
                  icon="pi pi-play"
                  text
                  severity="success"
                  size="small"
                  @click="updateStatus(vacancy, 'published')"
                />
                <Button
                  v-if="vacancy.status === 'published' && can('vacancies.update')"
                  v-tooltip.top="'Pausar'"
                  icon="pi pi-pause"
                  text
                  severity="warn"
                  size="small"
                  @click="updateStatus(vacancy, 'paused')"
                />
                <Button
                  v-if="vacancy.status === 'paused' && can('vacancies.update')"
                  v-tooltip.top="'Reanudar'"
                  icon="pi pi-play"
                  text
                  severity="success"
                  size="small"
                  @click="updateStatus(vacancy, 'published')"
                />
                <Button
                  v-if="(vacancy.status === 'published' || vacancy.status === 'paused') && can('vacancies.update')"
                  v-tooltip.top="'Cerrar'"
                  icon="pi pi-times-circle"
                  text
                  severity="danger"
                  size="small"
                  @click="updateStatus(vacancy, 'closed')"
                />
                <Button
                  v-if="can('vacancies.delete')"
                  v-tooltip.top="'Eliminar'"
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  size="small"
                  @click="deleteVacancy(vacancy)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </AppLayout>
</template>
