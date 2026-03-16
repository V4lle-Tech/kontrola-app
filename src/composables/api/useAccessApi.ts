import { apiClient } from '@/api/client'
import { generateId } from '@/utils/uuid'
import type { PaginatedResponse, PaginationParams } from '@/types/pagination'
import type { Permission } from '@/types/auth'
import type {
  UserSummary,
  Role,
  UserInvitation,
  CreateUserRequest,
  UpdateUserRequest,
  InviteUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  PermissionGroup,
} from '@/types/access'

export function useAccessApi() {
  // ── Users ──────────────────────────────────────────────────────────

  async function getUsers(params?: PaginationParams): Promise<PaginatedResponse<UserSummary>> {
    const { data } = await apiClient.get<PaginatedResponse<UserSummary>>('/users', { params })
    return data
  }

  async function getUser(id: string): Promise<UserSummary> {
    const { data } = await apiClient.get<UserSummary>(`/users/${id}`)
    return data
  }

  async function createUser(request: CreateUserRequest): Promise<UserSummary> {
    const id = generateId()
    const { data } = await apiClient.put<UserSummary>(`/users/${id}`, request)
    return data
  }

  async function updateUser(id: string, request: UpdateUserRequest): Promise<UserSummary> {
    const { data } = await apiClient.put<UserSummary>(`/users/${id}`, request)
    return data
  }

  async function deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  }

  // ── Invitations ────────────────────────────────────────────────────

  async function getInvitations(params?: PaginationParams): Promise<PaginatedResponse<UserInvitation>> {
    const { data } = await apiClient.get<PaginatedResponse<UserInvitation>>('/invitations', { params })
    return data
  }

  async function inviteUser(request: InviteUserRequest): Promise<UserInvitation> {
    const id = generateId()
    const { data } = await apiClient.put<UserInvitation>(`/invitations/${id}`, request)
    return data
  }

  async function revokeInvitation(id: string): Promise<void> {
    await apiClient.delete(`/invitations/${id}`)
  }

  async function resendInvitation(id: string): Promise<void> {
    await apiClient.post(`/invitations/${id}/resend`)
  }

  // ── Roles ──────────────────────────────────────────────────────────

  async function getRoles(params?: PaginationParams): Promise<PaginatedResponse<Role>> {
    const { data } = await apiClient.get<PaginatedResponse<Role>>('/roles', { params })
    return data
  }

  async function getRole(id: string): Promise<Role> {
    const { data } = await apiClient.get<Role>(`/roles/${id}`)
    return data
  }

  async function createRole(request: CreateRoleRequest): Promise<Role> {
    const id = generateId()
    const { data } = await apiClient.put<Role>(`/roles/${id}`, request)
    return data
  }

  async function updateRole(id: string, request: UpdateRoleRequest): Promise<Role> {
    const { data } = await apiClient.put<Role>(`/roles/${id}`, request)
    return data
  }

  async function deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`)
  }

  // ── Permissions ────────────────────────────────────────────────────

  async function getPermissions(): Promise<PermissionGroup[]> {
    const { data } = await apiClient.get<PermissionGroup[]>('/permissions')
    return data
  }

  async function getAvailablePermissions(): Promise<Permission[]> {
    const groups = await getPermissions()
    return groups.flatMap((g) => g.permissions)
  }

  return {
    // Users
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    // Invitations
    getInvitations,
    inviteUser,
    revokeInvitation,
    resendInvitation,
    // Roles
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    // Permissions
    getPermissions,
    getAvailablePermissions,
  }
}
