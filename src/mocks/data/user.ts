import type { AuthResponse, User } from '@/types/auth'

/**
 * Mock user with ALL permissions — allows exploring every page in the UI.
 */
export const mockUser: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'demo@kontrola.com.mx',
  givenName: 'Demo',
  paternalName: 'Usuario',
  maternalName: 'Kontrola',
  fullName: 'Demo Usuario Kontrola',
  avatarUrl: undefined,
  permissions: [
    // Recruitment
    'candidates.view',
    'candidates.create',
    'candidates.manage',
    'job-profiles.view',
    'job-profiles.manage',
    'vacancies.view',
    'vacancies.manage',
    'tags.view',
    'tags.manage',
    'selection-processes.view',
    'selection-processes.manage',
    'pipeline.view',
    'pipeline.manage',
    'metrics.view',
    'syndication.view',
    'syndication.manage',
    // Documents
    'documents.view',
    'documents.manage',
    'document-types.view',
    'document-types.manage',
    // CRM
    'clients.view',
    'clients.manage',
    // Access
    'users.view',
    'users.manage',
    'roles.view',
    'roles.manage',
    // Settings
    'settings.view',
    'settings.manage',
  ],
  roles: ['admin'],
  tenantId: 'tenant-demo-001',
  tenantSlug: 'demo',
}

export const mockAuthResponse: AuthResponse = {
  accessToken: 'mock-jwt-token-for-ui-exploration',
  expiresInSeconds: 86400, // 24h — no need to refresh often in mock mode
  user: mockUser,
}
