<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import DatePicker from 'primevue/datepicker'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { Tag, CandidateSource } from '@/types/recruitment'

export interface CandidateFilterValues {
  source: CandidateSource | null
  tagIds: string[]
  educationLevel: string | null
  dateFrom: string | null
  dateTo: string | null
}

const emit = defineEmits<{
  change: [filters: CandidateFilterValues]
}>()

const api = useRecruitmentApi()

const source = ref<CandidateSource | null>(null)
const tagIds = ref<string[]>([])
const educationLevel = ref<string | null>(null)
const dateRange = ref<Date[] | null>(null)
const availableTags = ref<Tag[]>([])

const sourceOptions = [
  { label: 'Todas', value: null },
  { label: 'Manual', value: 'manual' },
  { label: 'Portal', value: 'portal' },
  { label: 'Referido', value: 'referral' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Indeed', value: 'indeed' },
  { label: 'Otro', value: 'other' },
]

const educationOptions = [
  { label: 'Todos', value: null },
  { label: 'Secundaria', value: 'secundaria' },
  { label: 'Preparatoria', value: 'preparatoria' },
  { label: 'Licenciatura', value: 'licenciatura' },
  { label: 'Maestría', value: 'maestria' },
  { label: 'Doctorado', value: 'doctorado' },
  { label: 'Otro', value: 'otro' },
]

const hasActiveFilters = computed(
  () =>
    source.value !== null ||
    tagIds.value.length > 0 ||
    educationLevel.value !== null ||
    (dateRange.value !== null && dateRange.value.length === 2),
)

function emitFilters() {
  let dateFrom: string | null = null
  let dateTo: string | null = null
  if (dateRange.value && dateRange.value.length === 2) {
    const from = dateRange.value[0]
    const to = dateRange.value[1]
    if (from) dateFrom = from.toISOString().split('T')[0] as string
    if (to) dateTo = to.toISOString().split('T')[0] as string
  }
  emit('change', {
    source: source.value,
    tagIds: tagIds.value,
    educationLevel: educationLevel.value,
    dateFrom,
    dateTo,
  })
}

function clearAll() {
  source.value = null
  tagIds.value = []
  educationLevel.value = null
  dateRange.value = null
}

watch([source, tagIds, educationLevel, dateRange], emitFilters)

onMounted(async () => {
  try {
    availableTags.value = await api.getTags('candidate')
  } catch {
    // Tags unavailable
  }
})

defineExpose({ hasActiveFilters })
</script>

<template>
  <div class="flex flex-col gap-2 rounded-lg border border-surface p-3">
    <div class="flex items-center justify-between">
      <span class="text-xs font-medium text-muted-color">Filtros avanzados</span>
      <button type="button" class="text-xs text-primary hover:underline" @click="clearAll">
        Limpiar
      </button>
    </div>
    <Select
      v-model="source"
      :options="sourceOptions"
      option-label="label"
      option-value="value"
      placeholder="Fuente"
      class="w-full"
    />
    <MultiSelect
      v-model="tagIds"
      :options="availableTags"
      option-label="name"
      option-value="id"
      placeholder="Etiquetas"
      :max-selected-labels="2"
      class="w-full"
    />
    <Select
      v-model="educationLevel"
      :options="educationOptions"
      option-label="label"
      option-value="value"
      placeholder="Nivel educativo"
      class="w-full"
    />
    <DatePicker
      v-model="dateRange"
      selection-mode="range"
      placeholder="Rango de fechas"
      date-format="dd/mm/yy"
      show-icon
      class="w-full"
    />
  </div>
</template>
