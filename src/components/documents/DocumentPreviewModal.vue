<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import type { Document } from '@/types/document'

interface Props {
  document: Document | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const visible = computed(() => !!props.document)
const isImage = computed(() => props.document?.mimeType.startsWith('image/') ?? false)
const isPdf = computed(() => props.document?.mimeType === 'application/pdf')

function close() { emit('close') }

function download() {
  if (!props.document) return
  window.open(props.document.fileUrl, '_blank')
}
</script>

<template>
  <Dialog :visible="visible" :header="document?.fileName ?? 'Vista previa'" modal :style="{ width: '50rem' }" @update:visible="close">
    <div v-if="document" class="flex flex-col items-center gap-4">
      <img v-if="isImage" :src="document.fileUrl" :alt="document.fileName" class="max-h-[500px] max-w-full rounded object-contain" />
      <iframe v-else-if="isPdf" :src="document.fileUrl" class="h-[500px] w-full rounded border border-surface" />
      <div v-else class="flex flex-col items-center gap-2 py-12">
        <i class="pi pi-file text-5xl text-muted-color" />
        <p class="text-muted-color">Vista previa no disponible para este tipo de archivo</p>
        <Button label="Descargar" icon="pi pi-download" severity="secondary" @click="download" />
      </div>
    </div>
    <template #footer>
      <Button label="Descargar" icon="pi pi-download" severity="secondary" text @click="download" />
      <Button label="Cerrar" @click="close" />
    </template>
  </Dialog>
</template>
