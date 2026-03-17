<script setup lang="ts">
import { PER_PAGE_OPTIONS, type PerPageOption } from '@/types/pagination'
import Select from 'primevue/select'

interface Props {
  modelValue: PerPageOption
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: PerPageOption]
}>()

const options = PER_PAGE_OPTIONS.map((opt) => ({ label: String(opt), value: opt }))

function handleChange(value: PerPageOption) {
  if (value) {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-muted-color">Mostrar</span>
    <Select
      :model-value="modelValue"
      :options="options"
      option-label="label"
      option-value="value"
      class="w-22"
      @update:model-value="handleChange"
    />
  </div>
</template>
