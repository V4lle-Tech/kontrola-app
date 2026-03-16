<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { useDocumentsApi } from '@/composables/api/useDocumentsApi'
import DocumentUploadModal from '@/components/documents/DocumentUploadModal.vue'
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal.vue'
import DocumentVerifyModal from '@/components/documents/DocumentVerifyModal.vue'
import DocumentVersionHistory from '@/components/documents/DocumentVersionHistory.vue'
import type { Document } from '@/types/document'

const api = useDocumentsApi()
const toast = useToast()
const documents = ref<Document[]>([])
const loading = ref(false)
const totalRecords = ref(0)
const page = ref(0)
const rows = ref(20)

const uploadVisible = ref(false)
const previewDoc = ref<Document | null>(null)
const verifyDoc = ref<Document | null>(null)
const historyDoc = ref<Document | null>(null)

async function load() {
  loading.value = true
  try {
    const res = await api.getDocuments({ page: page.value + 1, pageSize: rows.value })
    documents.value = res.items
    totalRecords.value = res.totalCount
  } finally { loading.value = false }
}

function onPage(event: { page: number; rows: number }) {
  page.value = event.page
  rows.value = event.rows
  void load()
}

async function remove(id: string) {
  try {
    await api.deleteDocument(id)
    documents.value = documents.value.filter(d => d.id !== id)
    toast.add({ severity: 'success', summary: 'Documento eliminado', life: 3000 })
  } catch { toast.add({ severity: 'error', summary: 'Error al eliminar', life: 5000 }) }
}

function statusSeverity(status: string): string {
  const map: Record<string, string> = { pending: 'warn', verified: 'success', rejected: 'danger', expired: 'secondary' }
  return map[status] ?? 'secondary'
}

function statusLabel(status: string): string {
  const map: Record<string, string> = { pending: 'Pendiente', verified: 'Verificado', rejected: 'Rechazado', expired: 'Expirado' }
  return map[status] ?? status
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => { void load() })
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-surface px-6 py-4">
        <div>
          <h1 class="text-xl font-semibold text-color">Documentos</h1>
          <p class="text-sm text-muted-color">Gestión de documentos de candidatos</p>
        </div>
        <div class="flex gap-2">
          <Button icon="pi pi-refresh" severity="secondary" text size="small" :loading="loading" @click="load" />
          <Button icon="pi pi-upload" label="Subir" size="small" @click="uploadVisible = true" />
        </div>
      </div>
      <div class="flex-1 overflow-auto px-6 py-4">
        <DataTable :value="documents" :loading="loading" lazy paginator :rows="rows" :total-records="totalRecords" :rows-per-page-options="[10, 20, 50]" @page="onPage">
          <Column field="fileName" header="Archivo">
            <template #body="{ data }">
              <button class="cursor-pointer text-sm font-medium text-primary hover:underline" @click="previewDoc = data">{{ data.fileName }}</button>
            </template>
          </Column>
          <Column field="candidateName" header="Candidato" />
          <Column field="documentTypeName" header="Tipo" />
          <Column header="Tamaño" style="width: 100px">
            <template #body="{ data }"><span class="text-sm text-muted-color">{{ formatSize(data.fileSize) }}</span></template>
          </Column>
          <Column header="Estado" style="width: 120px">
            <template #body="{ data }"><Tag :value="statusLabel(data.status)" :severity="statusSeverity(data.status)" /></template>
          </Column>
          <Column header="Expira" style="width: 120px">
            <template #body="{ data }"><span class="text-sm text-muted-color">{{ formatDate(data.expiresAt) }}</span></template>
          </Column>
          <Column header="Versión" style="width: 80px">
            <template #body="{ data }">
              <button class="text-sm text-primary hover:underline" @click="historyDoc = data">v{{ data.version }}</button>
            </template>
          </Column>
          <Column header="Acciones" style="width: 140px">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button v-if="data.status === 'pending'" v-tooltip.top="'Verificar'" icon="pi pi-check-circle" severity="success" text size="small" @click="verifyDoc = data" />
                <Button v-tooltip.top="'Eliminar'" icon="pi pi-trash" severity="danger" text size="small" @click="remove(data.id)" />
              </div>
            </template>
          </Column>
          <template #empty>
            <div class="py-8 text-center">
              <i class="pi pi-file mb-2 text-3xl text-muted-color" />
              <p class="text-muted-color">No hay documentos</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
    <DocumentUploadModal v-model:visible="uploadVisible" @uploaded="load" />
    <DocumentPreviewModal :document="previewDoc" @close="previewDoc = null" />
    <DocumentVerifyModal :document="verifyDoc" @verified="load(); verifyDoc = null" @close="verifyDoc = null" />
    <DocumentVersionHistory :document="historyDoc" @close="historyDoc = null" />
  </AppLayout>
</template>
