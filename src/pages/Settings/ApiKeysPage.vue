<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { apiClient } from '@/api/client'

interface ApiKey {
  id: string
  name: string
  prefix: string
  createdAt: string
  lastUsedAt: string | null
}

const toast = useToast()
const keys = ref<ApiKey[]>([])
const loading = ref(false)
const createDialog = ref(false)
const newKeyName = ref('')
const createdKey = ref<string | null>(null)
const creating = ref(false)

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<ApiKey[]>('/settings/api-keys')
    keys.value = data
  } finally { loading.value = false }
}

async function create() {
  if (!newKeyName.value.trim()) return
  creating.value = true
  try {
    const { data } = await apiClient.post<{ key: string; apiKey: ApiKey }>('/settings/api-keys', { name: newKeyName.value })
    createdKey.value = data.key
    keys.value.push(data.apiKey)
    newKeyName.value = ''
  } catch {
    toast.add({ severity: 'error', summary: 'Error al crear API key', life: 5000 })
  } finally { creating.value = false }
}

async function revoke(id: string) {
  try {
    await apiClient.delete(`/settings/api-keys/${id}`)
    keys.value = keys.value.filter(k => k.id !== id)
    toast.add({ severity: 'success', summary: 'API key revocada', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error al revocar', life: 5000 })
  }
}

function closeCreateDialog() {
  createDialog.value = false
  createdKey.value = null
  newKeyName.value = ''
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Nunca'
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => { void load() })
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-surface px-6 py-4">
        <div>
          <h1 class="text-xl font-semibold text-color">API Keys</h1>
          <p class="text-sm text-muted-color">Gestiona las claves de acceso a la API</p>
        </div>
        <Button icon="pi pi-plus" label="Nueva" size="small" @click="createDialog = true" />
      </div>
      <div class="flex-1 overflow-auto px-6 py-4">
        <DataTable :value="keys" :loading="loading">
          <Column field="name" header="Nombre" />
          <Column field="prefix" header="Clave">
            <template #body="{ data }"><code class="text-sm text-muted-color">{{ data.prefix }}...</code></template>
          </Column>
          <Column header="Creada" style="width: 140px">
            <template #body="{ data }"><span class="text-sm text-muted-color">{{ formatDate(data.createdAt) }}</span></template>
          </Column>
          <Column header="Último uso" style="width: 140px">
            <template #body="{ data }"><span class="text-sm text-muted-color">{{ formatDate(data.lastUsedAt) }}</span></template>
          </Column>
          <Column header="Acciones" style="width: 80px">
            <template #body="{ data }">
              <Button v-tooltip.top="'Revocar'" icon="pi pi-trash" severity="danger" text size="small" @click="revoke(data.id)" />
            </template>
          </Column>
          <template #empty>
            <div class="py-8 text-center">
              <i class="pi pi-key mb-2 text-3xl text-muted-color" />
              <p class="text-muted-color">No hay API keys</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
    <Dialog v-model:visible="createDialog" header="Nueva API Key" modal :style="{ width: '28rem' }" @hide="closeCreateDialog">
      <div class="flex flex-col gap-4">
        <div v-if="!createdKey" class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Nombre</label>
          <InputText v-model="newKeyName" placeholder="Ej: Integración ERP" />
        </div>
        <div v-else class="rounded border border-surface bg-surface-50 p-4 dark:bg-surface-800">
          <p class="mb-2 text-sm font-medium text-color">Tu nueva API key (cópiala ahora, no se mostrará de nuevo):</p>
          <code class="block break-all text-sm text-primary">{{ createdKey }}</code>
        </div>
      </div>
      <template #footer>
        <Button v-if="!createdKey" label="Cancelar" severity="secondary" text @click="closeCreateDialog" />
        <Button v-if="!createdKey" label="Crear" icon="pi pi-key" :loading="creating" @click="create" />
        <Button v-else label="Cerrar" @click="closeCreateDialog" />
      </template>
    </Dialog>
  </AppLayout>
</template>
