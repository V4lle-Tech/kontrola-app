<script setup lang="ts">
import type { CandidateListItem } from '@/types/recruitment'

interface Props {
  candidate: CandidateListItem
}
defineProps<Props>()

defineEmits<{
  back: []
  updated: [candidate: CandidateListItem]
  deleted: []
}>()
</script>

<template>
  <div class="flex flex-1 flex-col p-4">
    <p class="text-muted-color">Detalle del candidato (pendiente F4-04)</p>
  </div>
</template>
