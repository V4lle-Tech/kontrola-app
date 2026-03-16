<script setup lang="ts">
import Button from 'primevue/button'

interface Props {
  showRefresh?: boolean
  showExport?: boolean
}
withDefaults(defineProps<Props>(), {
  showRefresh: true,
  showExport: false,
})

const emit = defineEmits<{
  refresh: []
  export: []
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <Button
      v-if="showRefresh"
      icon="pi pi-refresh"
      text
      rounded
      severity="secondary"
      title="Actualizar"
      @click="emit('refresh')"
    />
    <Button
      v-if="showExport"
      icon="pi pi-download"
      text
      rounded
      severity="secondary"
      title="Exportar"
      @click="emit('export')"
    />
  </div>
</template>
