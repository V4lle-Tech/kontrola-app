<script setup lang="ts">
import { computed } from 'vue'
import MultiSelect from 'primevue/multiselect'
import type { Tag } from '@/types/recruitment'

interface Props {
  modelValue: string[]
  availableTags: Tag[]
  allowCreate?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  allowCreate: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  create: [name: string]
}>()

const options = computed(() => {
  const tags = props.availableTags.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
  }))
  return tags
})

function onUpdate(value: string[]) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <MultiSelect
      :model-value="modelValue"
      :options="options"
      option-label="name"
      option-value="id"
      placeholder="Seleccionar etiquetas"
      :max-selected-labels="5"
      class="w-full"
      filter
      @update:model-value="onUpdate"
    >
      <template #option="slotProps">
        <div class="flex items-center gap-2">
          <span
            class="inline-block h-3 w-3 rounded-full"
            :style="{ backgroundColor: slotProps.option.color }"
          />
          <span>{{ slotProps.option.name }}</span>
        </div>
      </template>
      <template v-if="allowCreate" #footer>
        <div class="border-t border-surface px-3 py-2">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-primary hover:bg-surface-50 dark:hover:bg-surface-800"
            @click="emit('create', '')"
          >
            <i class="pi pi-plus text-xs" />
            Crear etiqueta
          </button>
        </div>
      </template>
    </MultiSelect>
  </div>
</template>
