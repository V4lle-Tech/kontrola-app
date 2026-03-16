<script setup lang="ts">
import { ref, watch } from 'vue'
import DataTable, { type DataTablePageEvent, type DataTableSortEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { UserSummary } from '@/types/access'
import type { PaginatedResponse } from '@/types/pagination'

const emit = defineEmits<{
  select: [user: UserSummary]
  create: []
}>()

interface Props {
  selectedId?: string | null
}
withDefaults(defineProps<Props>(), {
  selectedId: null,
})

const api = useAccessApi()

const data = ref<PaginatedResponse<UserSummary> | null>(null)
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = ref(25)
const sortField = ref('fullName')
const sortOrder = ref<'asc' | 'desc'>('asc')
const statusFilter = ref<boolean | null>(null)

const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Activos', value: true },
  { label: 'Inactivos', value: false },
]

let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function loadData() {
  loading.value = true
  try {
    data.value = await api.getUsers({
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

function onRowSelect(user: UserSummary) {
  emit('select', user)
}

watch(statusFilter, () => {
  page.value = 1
  void loadData()
})

void loadData()
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Toolbar -->
    <div class="flex flex-col gap-2 border-b border-surface px-4 py-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-color">Usuarios</h2>
        <Button icon="pi pi-plus" label="Nuevo" size="small" @click="emit('create')" />
      </div>
      <div class="flex gap-2">
        <span class="relative flex-1">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" />
          <InputText
            v-model="search"
            placeholder="Buscar usuarios..."
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
          class="w-36"
        />
      </div>
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
        @row-select="(e) => onRowSelect(e.data as UserSummary)"
      >
        <template #empty>
          <div class="py-6 text-center text-muted-color">
            <i class="pi pi-users mb-2 text-3xl" />
            <p>No se encontraron usuarios</p>
          </div>
        </template>

        <Column field="fullName" header="Nombre" sortable class="min-w-48">
          <template #body="{ data: user }">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <i class="pi pi-user text-xs text-primary" />
              </div>
              <div class="min-w-0">
                <p
                  class="truncate font-medium text-color"
                  :class="selectedId === user.id ? 'text-primary' : ''"
                >
                  {{ user.fullName }}
                </p>
                <p class="truncate text-xs text-muted-color">{{ user.email }}</p>
              </div>
            </div>
          </template>
        </Column>

        <Column field="roles" header="Roles" class="min-w-32">
          <template #body="{ data: user }">
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="role in user.roles"
                :key="role.id"
                :value="role.name"
                severity="secondary"
              />
            </div>
          </template>
        </Column>

        <Column field="isActive" header="Estado" sortable class="w-24">
          <template #body="{ data: user }">
            <Tag
              :value="user.isActive ? 'Activo' : 'Inactivo'"
              :severity="user.isActive ? 'success' : 'danger'"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
