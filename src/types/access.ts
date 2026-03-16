import type { Permission } from './auth'

export interface UserSummary {
  id: string
  givenName: string
  paternalName: string
  maternalName?: string
  fullName: string
  email: string
  isActive: boolean
  roles: RoleSummary[]
  createdAt: string
}

export interface RoleSummary {
  id: string
  name: string
  slug: string
}

export interface Role {
  id: string
  name: string
  slug: string
  level: number
  isSystem: boolean
  permissions: Permission[]
  usersCount: number
}

export interface UserInvitation {
  id: string
  email: string
  status: 'pending' | 'accepted' | 'expired'
  expiresAt: string
  createdAt: string
}

export interface CreateUserRequest {
  givenName: string
  paternalName: string
  maternalName?: string
  email: string
  password: string
  roleIds: string[]
}

export interface UpdateUserRequest {
  givenName: string
  paternalName: string
  maternalName?: string
  email: string
  roleIds: string[]
  isActive: boolean
}

export interface InviteUserRequest {
  email: string
  roleIds: string[]
}

export interface CreateRoleRequest {
  name: string
  permissions: Permission[]
}

export interface UpdateRoleRequest {
  name: string
  permissions: Permission[]
}

export interface PermissionGroup {
  module: string
  permissions: Permission[]
}
