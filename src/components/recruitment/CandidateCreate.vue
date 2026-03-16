<script setup lang="ts">
import type { CandidateListItem } from '@/types/recruitment'

defineEmits<{
  created: [candidate: CandidateListItem]
  cancel: []
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-color">Formulario de candidato (pendiente F4-05)</p>
  </div>
</template>
