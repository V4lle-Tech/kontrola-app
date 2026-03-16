<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import Timeline from 'primevue/timeline'
import { useDocumentsApi } from '@/composables/api/useDocumentsApi'
import type { Document, DocumentVersion } from '@/types/document'

interface Props {
  document: Document | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const api = useDocumentsApi()
const versions = ref<DocumentVersion[]>([])
const loading = ref(false)
const visible = computed(() => !!props.document)

watch(() => props.document, async (doc) => {
  if (!doc) { versions.value = []; return }
  loading.value = true
  try { versions.value = await api.getDocumentVersions(doc.id) }
  finally { loading.value = false }
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function download(url: string) { window.open(url, '_blank') }
</script>

<template>
  <Drawer :visible="visible" header="Historial de Versiones" position="right" :style="{ width: '24rem' }" @update:visible="emit('close')">
    <div v-if="loading" class="flex items-center justify-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
    </div>
    <div v-else-if="versions.length === 0" class="py-8 text-center">
      <i class="pi pi-history mb-2 text-3xl text-muted-color" />
      <p class="text-muted-color">Sin versiones anteriores</p>
    </div>
    <Timeline v-else :value="versions" class="px-2">
      <template #content="{ item }">
        <div class="mb-4 rounded border border-surface bg-surface-0 p-3 dark:bg-surface-900">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-color">v{{ item.version }}</span>
            <Button icon="pi pi-download" severity="secondary" text size="small" @click="download(item.fileUrl)" />
          </div>
          <p class="text-sm text-color">{{ item.fileName }}</p>
          <div class="mt-1 flex gap-3 text-xs text-muted-color">
            <span>{{ formatSize(item.fileSize) }}</span>
            <span>{{ formatDate(item.uploadedAt) }}</span>
          </div>
          <p class="mt-1 text-xs text-muted-color">Por: {{ item.uploadedBy }}</p>
        </div>
      </template>
    </Timeline>
  </Drawer>
</template>
