<script setup lang="ts">
import type { CandidateSource } from '@/types/recruitment'
import Tag from 'primevue/tag'
import { computed } from 'vue'

interface Props {
  source: CandidateSource | null
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true,
})

interface SourceConfig {
  label: string
  shortLabel: string
  icon: string
  severity: 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'
}

const sourceConfigs: Record<CandidateSource, SourceConfig> = {
  portal: {
    label: 'Portal de Empleo',
    shortLabel: 'Portal',
    icon: 'pi pi-globe',
    severity: 'info',
  },
  referral: {
    label: 'Referido',
    shortLabel: 'Referido',
    icon: 'pi pi-users',
    severity: 'contrast',
  },
  linkedin: {
    label: 'LinkedIn',
    shortLabel: 'LinkedIn',
    icon: 'pi pi-linkedin',
    severity: 'info',
  },
  indeed: {
    label: 'Indeed',
    shortLabel: 'Indeed',
    icon: 'pi pi-globe',
    severity: 'success',
  },
  manual: {
    label: 'Manual',
    shortLabel: 'Manual',
    icon: 'pi pi-user',
    severity: 'secondary',
  },
  other: {
    label: 'Otro',
    shortLabel: 'Otro',
    icon: 'pi pi-question-circle',
    severity: 'secondary',
  },
}

const config = computed(() => {
  if (!props.source) return null
  return sourceConfigs[props.source] || null
})
</script>

<template>
  <Tag
    v-if="config"
    v-tooltip="config.label"
    :value="showLabel ? config.shortLabel : ''"
    :severity="config.severity"
    :icon="config.icon"
    rounded
  />
</template>
