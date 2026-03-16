export interface User {
  id: string
  email: string
  givenName: string
  paternalName: string
  maternalName?: string
  fullName: string
  avatarUrl?: string
  permissions: Permission[]
  roles: string[]
  tenantId: string
  tenantSlug: string
}

export type Permission = string

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  givenName: string
  paternalName: string
  maternalName?: string
  email: string
  password: string
  passwordConfirmation: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  email: string
  password: string
  passwordConfirmation: string
}

export interface AuthResponse {
  accessToken: string
  expiresInSeconds: number
  user: User
}
