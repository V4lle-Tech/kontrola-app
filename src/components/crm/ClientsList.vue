<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useCrmApi } from '@/composables/api/useCrmApi'
import type { Client } from '@/types/crm'

const emit = defineEmits<{
  select: [client: Client]
  create: []
}>()

const api = useCrmApi()
const clients = ref<Client[]>([])
const loading = ref(false)
const totalRecords = ref(0)
const page = ref(0)
const rows = ref(20)
const search = ref('')

async function load() {
  loading.value = true
  try {
    const res = await api.getClients({ page: page.value + 1, pageSize: rows.value, search: search.value || undefined })
    clients.value = res.items
    totalRecords.value = res.totalCount
  } finally { loading.value = false }
}

function onPage(event: { page: number; rows: number }) {
  page.value = event.page
  rows.value = event.rows
  void load()
}

function onSearch() {
  page.value = 0
  void load()
}

function onRowSelect(event: { data: Client }) {
  emit('select', event.data)
}

onMounted(() => { void load() })

defineExpose({ reload: load })
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex items-center gap-2 border-b border-surface px-4 py-3">
      <span class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" />
        <InputText v-model="search" placeholder="Buscar clientes..." class="w-full pl-10" size="small" @keyup.enter="onSearch" />
      </span>
      <Button icon="pi pi-plus" size="small" @click="emit('create')" />
    </div>
    <div class="flex-1 overflow-auto">
      <DataTable :value="clients" :loading="loading" lazy paginator :rows="rows" :total-records="totalRecords" selection-mode="single" @page="onPage" @row-select="onRowSelect">
        <Column field="name" header="Nombre" />
        <Column header="Estado" style="width: 100px">
          <template #body="{ data }">
            <Tag :value="data.isActive ? 'Activo' : 'Inactivo'" :severity="data.isActive ? 'success' : 'secondary'" />
          </template>
        </Column>
        <Column header="Info" style="width: 120px">
          <template #body="{ data }">
            <div class="flex gap-2 text-xs text-muted-color">
              <span><i class="pi pi-building mr-1" />{{ data.branchCount }}</span>
              <span><i class="pi pi-users mr-1" />{{ data.contactCount }}</span>
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="py-8 text-center">
            <i class="pi pi-building mb-2 text-3xl text-muted-color" />
            <p class="text-muted-color">No hay clientes</p>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
