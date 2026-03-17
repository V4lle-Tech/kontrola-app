<script setup lang="ts">
import { computed } from 'vue'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import type { ValidationConfig } from '@/types/document'

const modelValue = defineModel<ValidationConfig>({ required: true })

const sizeInMb = computed({
  get: () => Math.round(modelValue.value.maxSizeBytes / (1024 * 1024)),
  set: (mb: number) => {
    modelValue.value = { ...modelValue.value, maxSizeBytes: mb * 1024 * 1024 }
  },
})

const extensionsText = computed({
  get: () => modelValue.value.allowedExtensions.join(', '),
  set: (text: string) => {
    const extensions = text
      .split(',')
      .map((ext) => ext.trim().toLowerCase())
      .filter((ext) => ext.length > 0)
    modelValue.value = { ...modelValue.value, allowedExtensions: extensions }
  },
})

function updateField<K extends keyof ValidationConfig>(field: K, value: ValidationConfig[K]) {
  modelValue.value = { ...modelValue.value, [field]: value }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-color">Tamaño máximo (MB)</label>
      <InputNumber v-model="sizeInMb" :min="1" :max="100" suffix=" MB" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-color">Extensiones permitidas</label>
      <InputText
        v-model="extensionsText"
        placeholder="pdf, jpg, png, docx"
        class="w-full"
      />
      <small class="text-muted-color">Separadas por coma</small>
    </div>

    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-color">Requiere fecha de expiración</label>
      <ToggleSwitch
        :model-value="modelValue.requiresExpiration"
        @update:model-value="updateField('requiresExpiration', $event as boolean)"
      />
    </div>

    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-color">Requiere verificación</label>
      <ToggleSwitch
        :model-value="modelValue.requiresVerification"
        @update:model-value="updateField('requiresVerification', $event as boolean)"
      />
    </div>
  </div>
</template>
