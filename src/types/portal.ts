export interface CandidateProfile {
  id: string
  givenName: string
  paternalName: string
  maternalName?: string
  fullName: string
  email: string
  phone?: string
}

export interface PortalApplication {
  id: string
  vacancyId: string
  jobTitle: string
  companyName: string
  status: 'in_progress' | 'hired' | 'rejected' | 'withdrawn'
  currentStageName: string
  appliedAt: string
  lastUpdatedAt: string
}

export interface MagicLinkRequest {
  email: string
}

export interface MagicLinkVerifyRequest {
  token: string
}

export interface PortalDocument {
  id: string
  name: string
  type: string
  status: 'pending' | 'uploaded' | 'verified' | 'rejected'
  uploadedAt?: string
  expiresAt?: string
}
