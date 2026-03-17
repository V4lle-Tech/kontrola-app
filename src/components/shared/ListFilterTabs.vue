<script setup lang="ts">
import SelectButton from 'primevue/selectbutton'
import { computed } from 'vue'

export interface FilterTab {
  key: string
  label: string
}

interface Props {
  tabs: FilterTab[]
  modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const options = computed(() =>
  props.tabs.map((tab) => ({
    label: tab.label,
    value: tab.key,
  })),
)
</script>

<template>
  <SelectButton
    :model-value="modelValue"
    :options="options"
    option-label="label"
    option-value="value"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
