<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import { useSavedSearches, type SavedSearch } from '@/composables/useSavedSearches'

interface Props {
  module: string
  currentFilters: Record<string, unknown>
}
const props = defineProps<Props>()

const emit = defineEmits<{
  apply: [filters: Record<string, unknown>]
}>()

const toast = useToast()
const { searches, save, remove } = useSavedSearches(props.module)

const showSaveDialog = ref(false)
const searchName = ref('')

function openSave() {
  searchName.value = ''
  showSaveDialog.value = true
}

function confirmSave() {
  if (!searchName.value.trim()) return
  save(searchName.value.trim(), props.currentFilters)
  showSaveDialog.value = false
  toast.add({ severity: 'success', summary: 'Búsqueda guardada', life: 3000 })
}

function applySaved(ss: SavedSearch) {
  emit('apply', ss.filters)
}

defineExpose({ openSave, searchCount: searches })
</script>

<template>
  <div v-if="searches.length > 0" class="flex flex-col gap-1 border-b border-surface px-4 py-2">
    <p class="text-xs font-semibold text-muted-color">Búsquedas guardadas</p>
    <div
      v-for="ss in searches"
      :key="ss.id"
      class="flex items-center gap-2 rounded px-2 py-1 hover:bg-surface-50 dark:hover:bg-surface-800"
    >
      <button
        type="button"
        class="flex-1 text-left text-sm text-color"
        @click="applySaved(ss)"
      >
        {{ ss.name }}
      </button>
      <button
        type="button"
        class="shrink-0 text-muted-color hover:text-color"
        @click="remove(ss.id)"
      >
        <i class="pi pi-times text-xs" />
      </button>
    </div>
  </div>
  <div v-else class="border-b border-surface px-4 py-3 text-center text-sm text-muted-color">
    No hay búsquedas guardadas
  </div>

  <Dialog
    v-model:visible="showSaveDialog"
    modal
    header="Guardar búsqueda"
    class="w-full max-w-sm"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Nombre de la búsqueda</label>
        <InputText v-model="searchName" placeholder="Ej: Seniors con LinkedIn" @keyup.enter="confirmSave" />
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="showSaveDialog = false" />
        <Button label="Guardar" :disabled="!searchName.trim()" @click="confirmSave" />
      </div>
    </div>
  </Dialog>
</template>
