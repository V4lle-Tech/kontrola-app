<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { CandidateListItem } from '@/types/recruitment'
import type { ApiError } from '@/types/api'

interface Props {
  jobProfileId: string
}
const props = defineProps<Props>()

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  saved: []
}>()

const api = useRecruitmentApi()
const toast = useToast()
const candidates = ref<CandidateListItem[]>([])
const selectedIds = ref<string[]>([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(visible, (show) => {
  if (show) {
    selectedIds.value = []
    search.value = ''
    void searchCandidates()
  }
})

async function searchCandidates() {
  loading.value = true
  try {
    const result = await api.getCandidates({ search: search.value, pageSize: 50 })
    candidates.value = result.items
  } catch {
    candidates.value = []
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    void searchCandidates()
  }, 300)
}

async function submit() {
  if (selectedIds.value.length === 0) return
  saving.value = true
  try {
    await api.addCandidatesToJobProfile(props.jobProfileId, selectedIds.value)
    toast.add({ severity: 'success', summary: 'Candidatos agregados al perfil', life: 3000 })
    visible.value = false
    emit('saved')
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({ severity: 'error', summary: apiError.title ?? 'Error al agregar candidatos', life: 5000 })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Agregar Candidatos" class="w-full max-w-lg">
    <div class="flex flex-col gap-4">
      <span class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" />
        <InputText
          v-model="search"
          placeholder="Buscar candidatos..."
          class="w-full pl-9"
          @input="onSearchInput"
        />
      </span>

      <div v-if="loading" class="flex justify-center py-6">
        <i class="pi pi-spin pi-spinner text-xl text-muted-color" />
      </div>

      <div v-else-if="candidates.length === 0" class="py-6 text-center text-sm text-muted-color">
        No se encontraron candidatos
      </div>

      <div v-else class="flex max-h-64 flex-col gap-2 overflow-y-auto">
        <label
          v-for="candidate in candidates"
          :key="candidate.id"
          class="flex cursor-pointer items-center gap-3 rounded-lg border border-surface px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800"
        >
          <Checkbox v-model="selectedIds" :input-id="candidate.id" :value="candidate.id" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-color">{{ candidate.fullName }}</p>
            <p class="truncate text-xs text-muted-color">{{ candidate.email }}</p>
          </div>
        </label>
      </div>

      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="visible = false" />
        <Button
          label="Agregar"
          icon="pi pi-user-plus"
          :loading="saving"
          :disabled="selectedIds.length === 0"
          @click="submit"
        />
      </div>
    </div>
  </Dialog>
</template>
