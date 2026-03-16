import { apiClient } from '@/api/client'
import type { PaginationParams, PaginatedResponse } from '@/types/pagination'
import type {
  DocumentType,
  Document,
  DocumentVersion,
  ComplianceRecord,
  VerifyDocumentRequest,
} from '@/types/document'

export function useDocumentsApi() {
  // Document Types
  async function getDocumentTypes(): Promise<DocumentType[]> {
    const { data } = await apiClient.get<DocumentType[]>('/document-types')
    return data
  }

  async function createDocumentType(id: string, payload: Omit<DocumentType, 'id'>): Promise<DocumentType> {
    const { data } = await apiClient.put<DocumentType>(`/document-types/${id}`, payload)
    return data
  }

  async function updateDocumentType(id: string, payload: Partial<DocumentType>): Promise<DocumentType> {
    const { data } = await apiClient.put<DocumentType>(`/document-types/${id}`, payload)
    return data
  }

  async function deleteDocumentType(id: string): Promise<void> {
    await apiClient.delete(`/document-types/${id}`)
  }

  // Documents
  async function getDocuments(params?: PaginationParams): Promise<PaginatedResponse<Document>> {
    const { data } = await apiClient.get<PaginatedResponse<Document>>('/documents', { params })
    return data
  }

  async function getDocument(id: string): Promise<Document> {
    const { data } = await apiClient.get<Document>(`/documents/${id}`)
    return data
  }

  async function uploadDocument(file: File, documentTypeId: string, candidateId: string, onProgress?: (percent: number) => void): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentTypeId', documentTypeId)
    formData.append('candidateId', candidateId)
    const { data } = await apiClient.post<Document>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })
    return data
  }

  async function deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`)
  }

  async function verifyDocument(id: string, request: VerifyDocumentRequest): Promise<Document> {
    const { data } = await apiClient.post<Document>(`/documents/${id}/verify`, request)
    return data
  }

  // Versions
  async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data } = await apiClient.get<DocumentVersion[]>(`/documents/${documentId}/versions`)
    return data
  }

  async function uploadNewVersion(documentId: string, file: File, onProgress?: (percent: number) => void): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post<Document>(`/documents/${documentId}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })
    return data
  }

  // Compliance
  async function getCompliance(params?: PaginationParams): Promise<PaginatedResponse<ComplianceRecord>> {
    const { data } = await apiClient.get<PaginatedResponse<ComplianceRecord>>('/documents/compliance', { params })
    return data
  }

  return {
    getDocumentTypes,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
    getDocuments,
    getDocument,
    uploadDocument,
    deleteDocument,
    verifyDocument,
    getDocumentVersions,
    uploadNewVersion,
    getCompliance,
  }
}
