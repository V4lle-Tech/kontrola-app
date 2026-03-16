import { ref } from 'vue'
import { useDocumentsApi } from '@/composables/api/useDocumentsApi'
import type { Document } from '@/types/document'

export function useFileUpload() {
  const api = useDocumentsApi()
  const uploading = ref(false)
  const progress = ref(0)
  const abortController = ref<AbortController | null>(null)

  async function upload(file: File, documentTypeId: string, candidateId: string): Promise<Document> {
    uploading.value = true
    progress.value = 0
    abortController.value = new AbortController()
    try {
      const result = await api.uploadDocument(file, documentTypeId, candidateId, (p) => {
        progress.value = p
      })
      return result
    } finally {
      uploading.value = false
      abortController.value = null
    }
  }

  async function uploadNewVersion(documentId: string, file: File): Promise<Document> {
    uploading.value = true
    progress.value = 0
    try {
      const result = await api.uploadNewVersion(documentId, file, (p) => {
        progress.value = p
      })
      return result
    } finally {
      uploading.value = false
    }
  }

  function cancel() {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
      uploading.value = false
      progress.value = 0
    }
  }

  function reset() {
    uploading.value = false
    progress.value = 0
    abortController.value = null
  }

  return { uploading, progress, upload, uploadNewVersion, cancel, reset }
}
