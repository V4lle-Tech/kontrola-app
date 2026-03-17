<script setup lang="ts">
import type { PerPageOption } from '@/types/pagination'
import Button from 'primevue/button'
import PerPageSelect from './PerPageSelect.vue'
import ViewToggle from './ViewToggle.vue'

interface Props {
  total: number
  from?: number | null
  to?: number | null
  entityName: string
  viewMode: 'cards' | 'table'
  perPage: PerPageOption
  showPagination?: boolean
  currentPage?: number
  lastPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  from: null,
  to: null,
  showPagination: false,
  currentPage: 1,
  lastPage: 1,
})

const emit = defineEmits<{
  'update:viewMode': [mode: 'cards' | 'table']
  'update:perPage': [count: PerPageOption]
  goToPage: [page: number]
}>()

function handlePrevPage() {
  if (props.currentPage > 1) {
    emit('goToPage', props.currentPage - 1)
  }
}

function handleNextPage() {
  if (props.currentPage < props.lastPage) {
    emit('goToPage', props.currentPage + 1)
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-color">
    <div class="flex items-center gap-2">
      <span>{{ total }} {{ entityName }}</span>
      <span v-if="from && to">({{ from }}-{{ to }})</span>
    </div>
    <div class="flex items-center gap-2">
      <ViewToggle :model-value="viewMode" @update:model-value="emit('update:viewMode', $event)" />
      <PerPageSelect :model-value="perPage" @update:model-value="emit('update:perPage', $event)" />
      <div v-if="showPagination" class="flex items-center gap-2">
        <Button
          type="button"
          icon="pi pi-chevron-left"
          text
          rounded
          size="small"
          :disabled="currentPage === 1"
          class="!h-9 !min-w-9 !p-0"
          @click="handlePrevPage"
        />
        <span class="min-w-[4rem] text-center text-sm">{{ currentPage }} / {{ lastPage }}</span>
        <Button
          type="button"
          icon="pi pi-chevron-right"
          text
          rounded
          size="small"
          :disabled="currentPage === lastPage"
          class="!h-9 !min-w-9 !p-0"
          @click="handleNextPage"
        />
      </div>
    </div>
  </div>
</template>
