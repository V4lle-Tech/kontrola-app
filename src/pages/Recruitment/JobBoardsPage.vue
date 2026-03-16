<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { useSyndicationApi } from '@/composables/api/useSyndicationApi'
import type { JobBoard } from '@/types/syndication'

const api = useSyndicationApi()
const toast = useToast()
const boards = ref<JobBoard[]>([])
const loading = ref(false)

const editVisible = ref(false)
const editBoard = ref<JobBoard | null>(null)
const editCredentials = ref<Record<string, string>>({})
const saving = ref(false)

async function loadBoards() {
  loading.value = true
  try {
    boards.value = await api.getJobBoards()
  } finally { loading.value = false }
}

function openEdit(board: JobBoard) {
  editBoard.value = board
  editCredentials.value = { ...board.credentials }
  editVisible.value = true
}

async function saveCredentials() {
  if (!editBoard.value) return
  saving.value = true
  try {
    const updated = await api.updateJobBoard(editBoard.value.id, { credentials: editCredentials.value })
    const idx = boards.value.findIndex(b => b.id === updated.id)
    if (idx !== -1) boards.value[idx] = updated
    editVisible.value = false
    toast.add({ severity: 'success', summary: 'Credenciales actualizadas', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error al guardar credenciales', life: 5000 })
  } finally { saving.value = false }
}

function providerIcon(provider: string): string {
  const map: Record<string, string> = { indeed: 'pi pi-briefcase', jooble: 'pi pi-search', meta: 'pi pi-facebook', linkedin: 'pi pi-linkedin' }
  return map[provider] ?? 'pi pi-globe'
}

onMounted(() => { void loadBoards() })
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-surface px-6 py-4">
        <div>
          <h1 class="text-xl font-semibold text-color">Portales de Empleo</h1>
          <p class="text-sm text-muted-color">Configura las conexiones con portales de publicación</p>
        </div>
        <Button icon="pi pi-refresh" severity="secondary" text size="small" :loading="loading" @click="loadBoards" />
      </div>

      <div class="flex-1 overflow-auto px-6 py-4">
        <DataTable :value="boards" :loading="loading">
          <Column header="Portal" style="width: 200px">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <i :class="providerIcon(data.provider)" />
                <span class="font-medium">{{ data.name }}</span>
              </div>
            </template>
          </Column>
          <Column header="Estado" style="width: 140px">
            <template #body="{ data }">
              <Tag :value="data.isConnected ? 'Conectado' : 'Desconectado'" :severity="data.isConnected ? 'success' : 'warn'" />
            </template>
          </Column>
          <Column header="Credenciales">
            <template #body="{ data }">
              <span class="text-sm text-muted-color">
                {{ Object.keys(data.credentials).length }} campo(s) configurado(s)
              </span>
            </template>
          </Column>
          <Column header="Acciones" style="width: 100px">
            <template #body="{ data }">
              <Button v-tooltip.top="'Configurar'" icon="pi pi-cog" severity="secondary" text size="small" @click="openEdit(data)" />
            </template>
          </Column>
          <template #empty>
            <div class="py-8 text-center">
              <i class="pi pi-globe mb-2 text-3xl text-muted-color" />
              <p class="text-muted-color">No hay portales configurados</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <Dialog v-model:visible="editVisible" :header="`Configurar ${editBoard?.name ?? 'Portal'}`" modal :style="{ width: '28rem' }">
      <div class="flex flex-col gap-4">
        <div v-for="key in Object.keys(editCredentials)" :key="key" class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">{{ key }}</label>
          <InputText v-model="editCredentials[key]" type="password" />
        </div>
        <p v-if="Object.keys(editCredentials).length === 0" class="text-sm text-muted-color">
          Este portal no requiere credenciales adicionales.
        </p>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="editVisible = false" />
        <Button label="Guardar" icon="pi pi-check" :loading="saving" @click="saveCredentials" />
      </template>
    </Dialog>
  </AppLayout>
</template>
