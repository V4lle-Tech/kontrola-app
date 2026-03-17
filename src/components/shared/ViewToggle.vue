<script setup lang="ts">
import SelectButton from 'primevue/selectbutton'

interface Props {
  modelValue: 'cards' | 'table'
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: 'cards' | 'table']
}>()

const viewOptions = [
  { label: 'Tarjetas', value: 'cards', icon: 'pi pi-th-large' },
  { label: 'Tabla', value: 'table', icon: 'pi pi-list' },
]
</script>

<template>
  <SelectButton
    :model-value="modelValue"
    :options="viewOptions"
    option-label="label"
    option-value="value"
    aria-label="Cambiar vista"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #option="{ option }">
      <i :class="option.icon" />
    </template>
  </SelectButton>
</template>
