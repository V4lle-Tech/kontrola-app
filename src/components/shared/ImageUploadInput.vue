<script setup lang="ts">
import Button from 'primevue/button'
import { computed, ref, watch } from 'vue'

interface Props {
  modelValue: string | null
  accept?: string
  maxSize?: number
  aspectHint?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  accept: 'image/jpeg,image/png,image/webp',
  maxSize: 2,
  aspectHint: 'Recomendado: 16:9 o cuadrada',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  fileSelected: [file: File | null]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const error = ref<string | null>(null)

const displayUrl = computed(() => {
  if (previewUrl.value) return previewUrl.value
  if (props.modelValue) return props.modelValue
  return null
})

const hasImage = computed(() => !!displayUrl.value)

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal && !selectedFile.value) {
      clearPreview()
    }
  },
)

function clearPreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  selectedFile.value = null
  error.value = null
}

function handleClick() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) processFile(file)
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function processFile(file: File) {
  error.value = null

  const validTypes = props.accept.split(',').map((t) => t.trim())
  if (!validTypes.some((type) => file.type === type || file.type.match(type.replace('*', '.*')))) {
    error.value = 'Tipo de archivo no permitido. Use JPG, PNG o WebP.'
    return
  }

  const maxBytes = props.maxSize * 1024 * 1024
  if (file.size > maxBytes) {
    error.value = `El archivo excede el tamaño máximo de ${props.maxSize}MB.`
    return
  }

  clearPreview()
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  emit('fileSelected', file)
}

function removeImage() {
  clearPreview()
  if (fileInput.value) fileInput.value.value = ''
  emit('update:modelValue', null)
  emit('fileSelected', null)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<template>
  <div class="space-y-2">
    <div
      class="relative overflow-hidden rounded-lg border-2 border-surface transition-colors"
      :class="{
        'border-dashed': !hasImage,
        '!border-primary bg-surface-50 dark:bg-surface-800': isDragging,
        'hover:border-surface': !isDragging && !hasImage,
        'border-solid': hasImage,
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <div v-if="!hasImage" class="cursor-pointer p-8 text-center" @click="handleClick">
        <i class="pi pi-upload mx-auto text-4xl text-muted-color" />
        <div class="mt-3">
          <span class="text-sm font-medium text-primary hover:underline">Selecciona una imagen</span>
          <span class="text-sm text-muted-color"> o arrastra aquí</span>
        </div>
        <p class="mt-1 text-xs text-muted-color">JPG, PNG o WebP. Max {{ maxSize }}MB</p>
        <p v-if="aspectHint" class="text-xs text-muted-color">{{ aspectHint }}</p>
      </div>

      <div v-else class="group relative">
        <img :src="displayUrl ?? ''" alt="Preview" class="aspect-video w-full object-cover" />
        <div class="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Button type="button" label="Cambiar" icon="pi pi-image" severity="secondary" size="small" @click="handleClick" />
          <Button type="button" label="Quitar" icon="pi pi-trash" severity="danger" size="small" @click="removeImage" />
        </div>
        <Button
          type="button"
          icon="pi pi-times"
          rounded
          severity="danger"
          size="small"
          class="!absolute !top-2 !right-2 bg-black/50 text-white hover:bg-black/70"
          @click="removeImage"
        />
        <div v-if="selectedFile" class="absolute right-0 bottom-0 left-0 bg-black/60 px-3 py-2 text-white">
          <p class="truncate text-sm">{{ selectedFile.name }}</p>
          <p class="text-xs opacity-75">{{ formatFileSize(selectedFile.size) }}</p>
        </div>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <input ref="fileInput" type="file" class="sr-only" :accept="accept" @change="handleFileSelect" />
  </div>
</template>
