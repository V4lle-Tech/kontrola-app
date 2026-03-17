<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { JobProfile } from '@/types/recruitment'
import type { ApiError } from '@/types/api'

interface Props {
  candidateId: string
}
const props = defineProps<Props>()

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  saved: []
}>()

const api = useRecruitmentApi()
const toast = useToast()
const jobProfiles = ref<JobProfile[]>([])
const selectedIds = ref<string[]>([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)

const filteredProfiles = computed(() => {
  if (!search.value) return jobProfiles.value
  const term = search.value.toLowerCase()
  return jobProfiles.value.filter((jp) => jp.title.toLowerCase().includes(term))
})

watch(visible, async (show) => {
  if (show) {
    selectedIds.value = []
    search.value = ''
    loading.value = true
    try {
      const result = await api.getJobProfiles({ pageSize: 100 })
      jobProfiles.value = result.items
    } catch {
      jobProfiles.value = []
    } finally {
      loading.value = false
    }
  }
})

async function submit() {
  if (selectedIds.value.length === 0) return
  saving.value = true
  try {
    await api.associateCandidateToJobProfiles(props.candidateId, selectedIds.value)
    toast.add({ severity: 'success', summary: 'Perfiles de puesto asociados', life: 3000 })
    visible.value = false
    emit('saved')
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({ severity: 'error', summary: apiError.title ?? 'Error al asociar perfiles', life: 5000 })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Asociar a Perfiles de Puesto" class="w-full max-w-lg">
    <div class="flex flex-col gap-4">
      <span class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" />
        <InputText v-model="search" placeholder="Buscar perfiles..." class="w-full pl-9" />
      </span>

      <div v-if="loading" class="flex justify-center py-6">
        <i class="pi pi-spin pi-spinner text-xl text-muted-color" />
      </div>

      <div v-else-if="filteredProfiles.length === 0" class="py-6 text-center text-sm text-muted-color">
        No se encontraron perfiles de puesto
      </div>

      <div v-else class="flex max-h-64 flex-col gap-2 overflow-y-auto">
        <label
          v-for="jp in filteredProfiles"
          :key="jp.id"
          class="flex cursor-pointer items-center gap-3 rounded-lg border border-surface px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800"
        >
          <Checkbox v-model="selectedIds" :input-id="jp.id" :value="jp.id" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-color">{{ jp.title }}</p>
            <p v-if="jp.description" class="truncate text-xs text-muted-color">{{ jp.description }}</p>
          </div>
        </label>
      </div>

      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="visible = false" />
        <Button
          label="Asociar"
          icon="pi pi-link"
          :loading="saving"
          :disabled="selectedIds.length === 0"
          @click="submit"
        />
      </div>
    </div>
  </Dialog>
</template>
