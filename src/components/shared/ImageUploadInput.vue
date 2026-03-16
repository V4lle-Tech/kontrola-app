<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'

interface Props {
  modelValue: string | null
  accept?: string
}
const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  upload: [file: File]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)

const displayUrl = computed(() => previewUrl.value ?? props.modelValue)

function openFilePicker() {
  fileInput.value?.click()
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  previewUrl.value = URL.createObjectURL(file)
  emit('upload', file)

  // Reset input so same file can be re-selected
  target.value = ''
}

function remove() {
  previewUrl.value = null
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="flex flex-col items-start gap-2">
    <div
      class="flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-surface bg-surface-50 dark:bg-surface-800"
      @click="openFilePicker"
    >
      <img
        v-if="displayUrl"
        :src="displayUrl"
        alt="Vista previa"
        class="h-full w-full object-cover"
      />
      <i v-else class="pi pi-image text-4xl text-muted-color" />
    </div>
    <div class="flex gap-1">
      <Button
        icon="pi pi-upload"
        label="Subir"
        size="small"
        text
        severity="secondary"
        @click="openFilePicker"
      />
      <Button
        v-if="displayUrl"
        icon="pi pi-trash"
        size="small"
        text
        severity="danger"
        @click="remove"
      />
    </div>
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      @change="onFileSelected"
    />
  </div>
</template>
