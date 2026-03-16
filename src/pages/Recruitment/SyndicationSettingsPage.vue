<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { useSyndicationApi } from '@/composables/api/useSyndicationApi'
import type { JobBoard } from '@/types/syndication'

const api = useSyndicationApi()
const toast = useToast()
const boards = ref<JobBoard[]>([])
const loading = ref(false)
const savingId = ref<string | null>(null)
const editForms = ref<Record<string, Record<string, string>>>({})

async function loadBoards() {
  loading.value = true
  try {
    boards.value = await api.getJobBoards()
    boards.value.forEach(b => { editForms.value[b.id] = { ...b.credentials } })
  } finally { loading.value = false }
}

async function saveBoard(board: JobBoard) {
  savingId.value = board.id
  try {
    const creds = editForms.value[board.id]
    if (!creds) return
    const updated = await api.updateJobBoard(board.id, { credentials: creds })
    const idx = boards.value.findIndex(b => b.id === updated.id)
    if (idx !== -1) boards.value[idx] = updated
    toast.add({ severity: 'success', summary: `${board.name} actualizado`, life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error al guardar', life: 5000 })
  } finally { savingId.value = null }
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
          <h1 class="text-xl font-semibold text-color">Configuración de Portales</h1>
          <p class="text-sm text-muted-color">Administra las credenciales y conexiones de cada portal</p>
        </div>
      </div>

      <div class="flex-1 overflow-auto px-6 py-4">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
        </div>

        <div v-else-if="boards.length === 0" class="py-12 text-center">
          <i class="pi pi-globe mb-2 text-3xl text-muted-color" />
          <p class="text-muted-color">No hay portales disponibles</p>
        </div>

        <div v-else class="flex flex-col gap-4">
          <div
            v-for="board in boards"
            :key="board.id"
            class="rounded-lg border border-surface bg-surface-0 p-5 dark:bg-surface-900"
          >
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <i :class="providerIcon(board.provider)" class="text-xl" />
                <div>
                  <h3 class="font-semibold text-color">{{ board.name }}</h3>
                  <span class="text-sm text-muted-color">{{ board.provider }}</span>
                </div>
              </div>
              <Tag :value="board.isConnected ? 'Conectado' : 'Desconectado'" :severity="board.isConnected ? 'success' : 'warn'" />
            </div>

            <div v-if="editForms[board.id]" class="flex flex-col gap-3">
              <div v-for="key in Object.keys(editForms[board.id] ?? {})" :key="key" class="flex flex-col gap-1">
                <label class="text-sm font-medium text-color">{{ key }}</label>
                <InputText v-model="editForms[board.id]![key]" type="password" class="w-full" />
              </div>
              <p v-if="Object.keys(editForms[board.id] ?? {}).length === 0" class="text-sm text-muted-color">
                Este portal no requiere credenciales manuales.
              </p>
            </div>

            <div class="mt-4 flex justify-end">
              <Button
                label="Guardar"
                icon="pi pi-check"
                size="small"
                :loading="savingId === board.id"
                @click="saveBoard(board)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
