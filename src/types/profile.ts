export interface UserProfile {
  id: string
  givenName: string
  paternalName: string
  maternalName?: string
  email: string
  avatarUrl?: string
  phone?: string
}

export interface ProfileUpdateRequest {
  givenName: string
  paternalName: string
  maternalName?: string
  phone?: string
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  newPasswordConfirmation: string
}
