export interface Client {
  id: string
  name: string
  rfc: string | null
  industry: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: string | null
  isActive: boolean
  contactCount: number
  branchCount: number
  jobProfileCount: number
  createdAt: string
}

export interface Branch {
  id: string
  clientId: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  phone: string | null
}

export interface Contact {
  id: string
  clientId: string
  name: string
  email: string | null
  phone: string | null
  position: string | null
  isPrimary: boolean
}

export interface CreateClientRequest {
  name: string
  rfc?: string
  industry?: string
  website?: string
  email?: string
  phone?: string
  address?: string
}

export interface CreateBranchRequest {
  name: string
  address?: string
  city?: string
  state?: string
  phone?: string
}

export interface CreateContactRequest {
  name: string
  email?: string
  phone?: string
  position?: string
  isPrimary?: boolean
}
