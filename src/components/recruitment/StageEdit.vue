<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ColorPicker from 'primevue/colorpicker'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import type { SelectionStage } from '@/types/recruitment'

type StageItem = Omit<SelectionStage, 'id'> & { id?: string }

const stage = defineModel<StageItem>('stage', { required: true })

interface Props {
  index: number
  total: number
}
defineProps<Props>()

const emit = defineEmits<{
  moveUp: [index: number]
  moveDown: [index: number]
  remove: [index: number]
}>()

const stageTypeOptions = [
  { label: 'Aplicación', value: 'application' },
  { label: 'Intermedia', value: 'intermediate' },
  { label: 'Contratado', value: 'hired' },
  { label: 'Rechazado', value: 'rejected' },
]
</script>

<template>
  <div class="flex flex-col gap-2 rounded-lg border border-surface bg-surface-50 p-3 dark:bg-surface-800">
    <div class="flex items-center gap-2">
      <span
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        :style="{ backgroundColor: stage.color + '30', color: stage.color }"
      >
        {{ stage.order }}
      </span>
      <InputText
        v-model="stage.name"
        placeholder="Nombre de etapa"
        class="flex-1"
      />
      <ColorPicker v-model="stage.color" />
      <Select
        v-model="stage.type"
        :options="stageTypeOptions"
        option-label="label"
        option-value="value"
        class="w-36"
      />
    </div>

    <div class="flex items-center justify-between">
      <div class="flex gap-4">
        <label class="flex cursor-pointer items-center gap-2 text-xs text-color">
          <Checkbox v-model="stage.isFinal" :binary="true" />
          Final
        </label>
        <label class="flex cursor-pointer items-center gap-2 text-xs text-color">
          <Checkbox v-model="stage.requiresComments" :binary="true" />
          Requiere comentarios
        </label>
        <label class="flex cursor-pointer items-center gap-2 text-xs text-color">
          <Checkbox v-model="stage.requiresApproval" :binary="true" />
          Requiere aprobación
        </label>
      </div>

      <div class="flex gap-1">
        <Button
          icon="pi pi-arrow-up"
          text
          severity="secondary"
          size="small"
          :disabled="index === 0"
          @click="emit('moveUp', index)"
        />
        <Button
          icon="pi pi-arrow-down"
          text
          severity="secondary"
          size="small"
          :disabled="index === total - 1"
          @click="emit('moveDown', index)"
        />
        <Button
          icon="pi pi-times"
          text
          severity="danger"
          size="small"
          :disabled="total <= 1"
          @click="emit('remove', index)"
        />
      </div>
    </div>
  </div>
</template>
