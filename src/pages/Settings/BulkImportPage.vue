<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import FileUpload from 'primevue/fileupload'
import ProgressBar from 'primevue/progressbar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { apiClient } from '@/api/client'

interface ImportResult {
  row: number
  name: string
  status: 'success' | 'error'
  message: string
}

const toast = useToast()
const file = ref<File | null>(null)
const uploading = ref(false)
const progress = ref(0)
const results = ref<ImportResult[]>([])
const hasResults = ref(false)

function onFileSelect(event: { files: File[] }) {
  file.value = event.files[0] ?? null
  results.value = []
  hasResults.value = false
}

async function upload() {
  if (!file.value) return
  uploading.value = true
  progress.value = 0
  try {
    const formData = new FormData()
    formData.append('file', file.value)
    const { data } = await apiClient.post<ImportResult[]>('/candidates/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total) progress.value = Math.round((e.loaded * 100) / e.total)
      },
    })
    results.value = data
    hasResults.value = true
    const successCount = data.filter(r => r.status === 'success').length
    toast.add({ severity: 'success', summary: `${successCount} de ${data.length} candidatos importados`, life: 5000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error al importar', life: 5000 })
  } finally { uploading.value = false }
}

function downloadTemplate() {
  window.open(`${import.meta.env.VITE_API_BASE_URL}/candidates/import/template`, '_blank')
}
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="border-b border-surface px-6 py-4">
        <h1 class="text-xl font-semibold text-color">Importación Masiva</h1>
        <p class="text-sm text-muted-color">Importa candidatos desde un archivo CSV</p>
      </div>
      <div class="flex-1 overflow-auto px-6 py-6">
        <div class="mx-auto max-w-2xl">
          <div class="mb-6 rounded-lg border border-surface bg-surface-0 p-6 dark:bg-surface-900">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="font-medium text-color">Subir archivo CSV</h2>
              <Button label="Descargar plantilla" icon="pi pi-download" severity="secondary" size="small" @click="downloadTemplate" />
            </div>
            <FileUpload mode="basic" :auto="false" accept=".csv" choose-label="Seleccionar CSV" @select="onFileSelect" />
            <ProgressBar v-if="uploading" :value="progress" :show-value="true" class="mt-3" />
            <div class="mt-4 flex justify-end">
              <Button label="Importar" icon="pi pi-upload" :loading="uploading" :disabled="!file" @click="upload" />
            </div>
          </div>

          <div v-if="hasResults">
            <h2 class="mb-3 font-medium text-color">Resultados</h2>
            <DataTable :value="results">
              <Column field="row" header="Fila" style="width: 60px" />
              <Column field="name" header="Nombre" />
              <Column header="Estado" style="width: 100px">
                <template #body="{ data }">
                  <Tag :value="data.status === 'success' ? 'OK' : 'Error'" :severity="data.status === 'success' ? 'success' : 'danger'" />
                </template>
              </Column>
              <Column field="message" header="Detalle" />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
