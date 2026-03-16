import { apiClient } from '@/api/client'
import type { PaginationParams, PaginatedResponse } from '@/types/pagination'
import type {
  Client,
  Branch,
  Contact,
  CreateClientRequest,
  CreateBranchRequest,
  CreateContactRequest,
} from '@/types/crm'

export function useCrmApi() {
  // Clients
  async function getClients(params?: PaginationParams): Promise<PaginatedResponse<Client>> {
    const { data } = await apiClient.get<PaginatedResponse<Client>>('/clients', { params })
    return data
  }

  async function getClient(id: string): Promise<Client> {
    const { data } = await apiClient.get<Client>(`/clients/${id}`)
    return data
  }

  async function createClient(id: string, payload: CreateClientRequest): Promise<Client> {
    const { data } = await apiClient.put<Client>(`/clients/${id}`, payload)
    return data
  }

  async function updateClient(id: string, payload: Partial<CreateClientRequest>): Promise<Client> {
    const { data } = await apiClient.put<Client>(`/clients/${id}`, payload)
    return data
  }

  async function deleteClient(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`)
  }

  // Branches
  async function getBranches(clientId: string): Promise<Branch[]> {
    const { data } = await apiClient.get<Branch[]>(`/clients/${clientId}/branches`)
    return data
  }

  async function createBranch(clientId: string, branchId: string, payload: CreateBranchRequest): Promise<Branch> {
    const { data } = await apiClient.put<Branch>(`/clients/${clientId}/branches/${branchId}`, payload)
    return data
  }

  async function updateBranch(clientId: string, branchId: string, payload: Partial<CreateBranchRequest>): Promise<Branch> {
    const { data } = await apiClient.put<Branch>(`/clients/${clientId}/branches/${branchId}`, payload)
    return data
  }

  async function deleteBranch(clientId: string, branchId: string): Promise<void> {
    await apiClient.delete(`/clients/${clientId}/branches/${branchId}`)
  }

  // Contacts
  async function getContacts(clientId: string): Promise<Contact[]> {
    const { data } = await apiClient.get<Contact[]>(`/clients/${clientId}/contacts`)
    return data
  }

  async function createContact(clientId: string, contactId: string, payload: CreateContactRequest): Promise<Contact> {
    const { data } = await apiClient.put<Contact>(`/clients/${clientId}/contacts/${contactId}`, payload)
    return data
  }

  async function updateContact(clientId: string, contactId: string, payload: Partial<CreateContactRequest>): Promise<Contact> {
    const { data } = await apiClient.put<Contact>(`/clients/${clientId}/contacts/${contactId}`, payload)
    return data
  }

  async function deleteContact(clientId: string, contactId: string): Promise<void> {
    await apiClient.delete(`/clients/${clientId}/contacts/${contactId}`)
  }

  return {
    getClients, getClient, createClient, updateClient, deleteClient,
    getBranches, createBranch, updateBranch, deleteBranch,
    getContacts, createContact, updateContact, deleteContact,
  }
}
