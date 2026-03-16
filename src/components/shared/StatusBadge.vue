<script setup lang="ts">
import Tag from 'primevue/tag'
import { computed } from 'vue'

interface Props {
  status: string
  labels?: Record<string, string>
  severities?: Record<string, string>
}
const props = withDefaults(defineProps<Props>(), {
  labels: undefined,
  severities: undefined,
})

const defaultLabels: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  draft: 'Borrador',
  published: 'Publicado',
  paused: 'Pausado',
  closed: 'Cerrado',
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  filled: 'Cubierto',
  archived: 'Archivado',
  in_progress: 'En progreso',
  hired: 'Contratado',
  withdrawn: 'Retirado',
}

const defaultSeverities: Record<string, string> = {
  active: 'success',
  inactive: 'secondary',
  draft: 'warn',
  published: 'success',
  paused: 'warn',
  closed: 'secondary',
  pending: 'warn',
  approved: 'success',
  rejected: 'danger',
  filled: 'info',
  archived: 'secondary',
  in_progress: 'info',
  hired: 'success',
  withdrawn: 'secondary',
}

const label = computed(() => {
  return props.labels?.[props.status] ?? defaultLabels[props.status] ?? props.status
})

const severity = computed(() => {
  const value = props.severities?.[props.status] ?? defaultSeverities[props.status] ?? 'secondary'
  return value as 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'
})
</script>

<template>
  <Tag :value="label" :severity="severity" />
</template>
