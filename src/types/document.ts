export interface DocumentType {
  id: string
  name: string
  description: string
  isRequired: boolean
  expirationDays: number | null
  allowedExtensions: string[]
}

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired'

export interface Document {
  id: string
  candidateId: string
  candidateName: string
  documentTypeId: string
  documentTypeName: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  status: DocumentStatus
  verifiedAt: string | null
  verifiedBy: string | null
  expiresAt: string | null
  version: number
  uploadedAt: string
}

export interface DocumentVersion {
  id: string
  documentId: string
  version: number
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
}

export interface ComplianceRecord {
  candidateId: string
  candidateName: string
  totalRequired: number
  totalUploaded: number
  totalVerified: number
  totalExpired: number
  completionPercent: number
  documents: ComplianceDocumentStatus[]
}

export interface ComplianceDocumentStatus {
  documentTypeId: string
  documentTypeName: string
  status: 'missing' | 'pending' | 'verified' | 'expired'
  expiresAt: string | null
}

export interface VerifyDocumentRequest {
  status: 'verified' | 'rejected'
  notes?: string
}
