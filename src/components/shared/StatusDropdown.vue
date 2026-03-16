<script setup lang="ts">
import Select from 'primevue/select'
import Tag from 'primevue/tag'

interface StatusOption {
  label: string
  value: string
  severity?: string
}

interface Props {
  modelValue: string
  options: StatusOption[]
  loading?: boolean
}
withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <Select
    :model-value="modelValue"
    :options="options"
    option-label="label"
    option-value="value"
    :loading="loading"
    placeholder="Seleccionar estado"
    class="w-full"
    @update:model-value="onUpdate"
  >
    <template #value="slotProps">
      <Tag
        v-if="slotProps.value"
        :value="options.find((o) => o.value === slotProps.value)?.label ?? slotProps.value"
        :severity="(options.find((o) => o.value === slotProps.value)?.severity as 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast') ?? 'secondary'"
      />
    </template>
    <template #option="slotProps">
      <Tag :value="slotProps.option.label" :severity="(slotProps.option.severity as 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast') ?? 'secondary'" />
    </template>
  </Select>
</template>
