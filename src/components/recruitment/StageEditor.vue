<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ColorPicker from 'primevue/colorpicker'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import type { SelectionStage, StageType } from '@/types/recruitment'

type StageItem = Omit<SelectionStage, 'id'> & { id?: string }

const model = defineModel<StageItem[]>({ required: true })

const stageTypeOptions = [
  { label: 'Aplicación', value: 'application' },
  { label: 'Intermedia', value: 'intermediate' },
  { label: 'Contratado', value: 'hired' },
  { label: 'Rechazado', value: 'rejected' },
]

function addStage() {
  const nextOrder = model.value.length + 1
  model.value.push({
    name: '',
    order: nextOrder,
    color: '#6B7280',
    isFinal: false,
    type: 'intermediate' as StageType,
    requiresComments: false,
    requiresApproval: false,
  })
}

function removeStage(index: number) {
  model.value.splice(index, 1)
  // Reorder
  model.value.forEach((stage, idx) => {
    stage.order = idx + 1
  })
}

function moveUp(index: number) {
  if (index <= 0) return
  const item = model.value.splice(index, 1)[0] as StageItem
  model.value.splice(index - 1, 0, item)
  model.value.forEach((stage, idx) => {
    stage.order = idx + 1
  })
}

function moveDown(index: number) {
  if (index >= model.value.length - 1) return
  const item = model.value.splice(index, 1)[0] as StageItem
  model.value.splice(index + 1, 0, item)
  model.value.forEach((stage, idx) => {
    stage.order = idx + 1
  })
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="(stage, idx) in model"
      :key="idx"
      class="flex flex-col gap-2 rounded-lg border border-surface bg-surface-50 p-3 dark:bg-surface-800"
    >
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
            :disabled="idx === 0"
            @click="moveUp(idx)"
          />
          <Button
            icon="pi pi-arrow-down"
            text
            severity="secondary"
            size="small"
            :disabled="idx === model.length - 1"
            @click="moveDown(idx)"
          />
          <Button
            icon="pi pi-times"
            text
            severity="danger"
            size="small"
            :disabled="model.length <= 1"
            @click="removeStage(idx)"
          />
        </div>
      </div>
    </div>

    <button
      type="button"
      class="flex items-center justify-center gap-2 rounded-lg border border-dashed border-surface py-2 text-sm text-primary hover:bg-surface-50 dark:hover:bg-surface-800"
      @click="addStage"
    >
      <i class="pi pi-plus text-xs" />
      Agregar etapa
    </button>
  </div>
</template>
