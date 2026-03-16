<script setup lang="ts">
import type { CandidateListItem } from '@/types/recruitment'

interface Props {
  selectedId: string | null
}
defineProps<Props>()

defineEmits<{
  select: [candidate: CandidateListItem]
  create: []
}>()
</script>

<template>
  <div class="flex flex-1 flex-col p-4">
    <p class="text-muted-color">Lista de candidatos (pendiente F4-03)</p>
  </div>
</template>
