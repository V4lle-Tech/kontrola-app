export type SyndicationProvider = 'indeed' | 'jooble' | 'meta' | 'linkedin'
export type SyndicationStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'expired'

export interface SyndicationPost {
  id: string
  vacancyId: string
  vacancyTitle: string
  provider: SyndicationProvider
  status: SyndicationStatus
  externalId: string | null
  publishedAt: string | null
  expiresAt: string | null
  metrics?: SyndicationMetrics
}

export interface SyndicationMetrics {
  views: number
  clicks: number
  applications: number
}

export interface SocialTemplate {
  id: string
  name: string
  platform: 'facebook' | 'instagram' | 'linkedin'
  content: string
  isDefault: boolean
}

export interface JobBoard {
  id: string
  provider: SyndicationProvider
  name: string
  isConnected: boolean
  credentials: Record<string, string>
}

export interface PublishRequest {
  vacancyId: string
  providers: SyndicationProvider[]
  templateId?: string
  scheduledAt?: string
}
