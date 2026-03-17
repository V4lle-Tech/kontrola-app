import { ref } from 'vue'
import { apiClient } from '@/api/client'

interface ImportResult {
  totalRows: number
  successCount: number
  errorCount: number
  errors: { row: number; message: string }[]
}

export function useImportProgress() {
  const progress = ref(0)
  const status = ref<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle')
  const results = ref<ImportResult | null>(null)

  async function startImport(file: File, endpoint: string): Promise<void> {
    progress.value = 0
    status.value = 'uploading'
    results.value = null

    const formData = new FormData()
    formData.append('file', file)

    try {
      status.value = 'uploading'
      const { data } = await apiClient.post<ImportResult>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress(event) {
          if (event.total) {
            progress.value = Math.round((event.loaded * 100) / event.total)
          }
        },
      })
      status.value = 'complete'
      results.value = data
    } catch {
      status.value = 'error'
      throw new Error('Error al importar archivo')
    }
  }

  function reset() {
    progress.value = 0
    status.value = 'idle'
    results.value = null
  }

  return { progress, status, results, startImport, reset }
}
