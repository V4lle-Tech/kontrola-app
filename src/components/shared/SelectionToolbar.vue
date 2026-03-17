<script setup lang="ts">
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { computed, ref } from 'vue'

export type ExportFormat = 'csv' | 'excel' | 'pdf'

interface Props {
  selectedCount: number
  entityName: string
  canDelete?: boolean
  canExport?: boolean
  canTag?: boolean
  canCompare?: boolean
  isDeleting?: boolean
  isExporting?: boolean
  isComparing?: boolean
  minCompare?: number
  maxCompare?: number
}

const props = withDefaults(defineProps<Props>(), {
  canDelete: true,
  canExport: true,
  canTag: false,
  canCompare: false,
  isDeleting: false,
  isExporting: false,
  isComparing: false,
  minCompare: 2,
  maxCompare: 4,
})

const emit = defineEmits<{
  delete: []
  export: [format: ExportFormat]
  tag: []
  compare: []
  clear: []
}>()

const exportMenu = ref()
const exportMenuItems = ref([
  { label: 'CSV', icon: 'pi pi-file', command: () => emit('export', 'csv') },
  { label: 'Excel', icon: 'pi pi-file-excel', command: () => emit('export', 'excel') },
  { label: 'PDF', icon: 'pi pi-file-pdf', command: () => emit('export', 'pdf') },
])

function toggleExportMenu(event: Event) {
  exportMenu.value.toggle(event)
}

const canCompareSelection = computed(() => {
  return props.selectedCount >= props.minCompare && props.selectedCount <= props.maxCompare
})

const compareTooltip = computed(() => {
  if (props.selectedCount < props.minCompare) {
    return `Selecciona al menos ${props.minCompare} para comparar`
  }
  if (props.selectedCount > props.maxCompare) {
    return `Máximo ${props.maxCompare} para comparar`
  }
  return 'Comparar seleccionados'
})
</script>

<template>
  <div class="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-surface-100 p-3 dark:bg-surface-800">
    <div class="flex shrink-0 items-center gap-3">
      <span class="text-sm font-medium text-primary">
        {{ selectedCount }} {{ entityName }}{{ selectedCount !== 1 ? 's' : '' }} seleccionado{{ selectedCount !== 1 ? 's' : '' }}
      </span>
      <Button type="button" label="Limpiar" icon="pi pi-times" text size="small" class="!text-sm" @click="emit('clear')" />
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <template v-if="canExport">
        <Button
          type="button"
          :label="isExporting ? 'Exportando...' : 'Exportar'"
          icon="pi pi-download"
          severity="secondary"
          outlined
          size="small"
          :disabled="isExporting"
          @click="toggleExportMenu"
        />
        <Menu ref="exportMenu" :model="exportMenuItems" popup />
      </template>

      <Button v-if="canTag" type="button" label="Etiquetar" icon="pi pi-tag" severity="secondary" outlined size="small" @click="emit('tag')" />

      <Button
        v-if="canCompare"
        type="button"
        :label="isComparing ? 'Comparando...' : 'Comparar'"
        icon="pi pi-arrow-right-arrow-left"
        severity="secondary"
        outlined
        size="small"
        :disabled="!canCompareSelection || isComparing"
        :title="compareTooltip"
        @click="emit('compare')"
      />

      <Button
        v-if="canDelete"
        type="button"
        :label="isDeleting ? 'Eliminando...' : 'Eliminar'"
        icon="pi pi-trash"
        severity="danger"
        size="small"
        :disabled="isDeleting"
        @click="emit('delete')"
      />
    </div>
  </div>
</template>
