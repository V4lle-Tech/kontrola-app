import { http, HttpResponse } from 'msw'
import type { AuthResponse } from '@/types/auth'

const BASE_URL = 'http://localhost:5000/api/v1'

const mockAuthResponse: AuthResponse = {
  accessToken: 'mock-jwt-token',
  expiresInSeconds: 3600,
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test@kontrola.com.mx',
    givenName: 'Test',
    paternalName: 'User',
    fullName: 'Test User',
    permissions: ['candidates.view', 'candidates.create'],
    roles: ['recruiter'],
    tenantId: 'tenant-1',
    tenantSlug: 'demo',
  },
}

export const authHandlers = [
  http.post(`${BASE_URL}/auth/login`, () => {
    return HttpResponse.json(mockAuthResponse)
  }),

  http.post(`${BASE_URL}/auth/register`, () => {
    return HttpResponse.json(mockAuthResponse)
  }),

  http.post(`${BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      ...mockAuthResponse,
      accessToken: 'refreshed-jwt-token',
    })
  }),

  http.post(`${BASE_URL}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${BASE_URL}/auth/forgot-password`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${BASE_URL}/auth/reset-password`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
