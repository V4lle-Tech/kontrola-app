<script setup lang="ts">
import { ref } from 'vue'
import DataTable, { type DataTablePageEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { Role } from '@/types/access'
import type { PaginatedResponse } from '@/types/pagination'

const emit = defineEmits<{
  select: [role: Role]
  create: []
}>()

interface Props {
  selectedId?: string | null
}
withDefaults(defineProps<Props>(), {
  selectedId: null,
})

const api = useAccessApi()

const data = ref<PaginatedResponse<Role> | null>(null)
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = ref(25)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function loadData() {
  loading.value = true
  try {
    data.value = await api.getRoles({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value,
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

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    void loadData()
  }, 300)
}

function onRowSelect(role: Role) {
  emit('select', role)
}

void loadData()
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Toolbar -->
    <div class="flex flex-col gap-2 border-b border-surface px-4 py-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-color">Roles</h2>
        <Button icon="pi pi-plus" label="Nuevo" size="small" @click="emit('create')" />
      </div>
      <span class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" />
        <InputText
          v-model="search"
          placeholder="Buscar roles..."
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
        data-key="id"
        selection-mode="single"
        :meta-key-selection="false"
        striped-rows
        scrollable
        scroll-height="flex"
        class="text-sm"
        @page="onPage"
        @row-select="(e) => onRowSelect(e.data as Role)"
      >
        <template #empty>
          <div class="py-6 text-center text-muted-color">
            <i class="pi pi-shield mb-2 text-3xl" />
            <p>No se encontraron roles</p>
          </div>
        </template>

        <Column field="name" header="Nombre" class="min-w-40">
          <template #body="{ data: role }">
            <div class="flex items-center gap-2">
              <i class="pi pi-shield text-primary" />
              <div>
                <p
                  class="font-medium text-color"
                  :class="selectedId === (role as Role).id ? 'text-primary' : ''"
                >
                  {{ (role as Role).name }}
                </p>
                <p class="text-xs text-muted-color">{{ (role as Role).slug }}</p>
              </div>
            </div>
          </template>
        </Column>

        <Column field="usersCount" header="Usuarios" class="w-24">
          <template #body="{ data: role }">
            <span class="text-color">{{ (role as Role).usersCount }}</span>
          </template>
        </Column>

        <Column field="isSystem" header="Tipo" class="w-24">
          <template #body="{ data: role }">
            <Tag
              :value="(role as Role).isSystem ? 'Sistema' : 'Custom'"
              :severity="(role as Role).isSystem ? 'info' : 'secondary'"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
