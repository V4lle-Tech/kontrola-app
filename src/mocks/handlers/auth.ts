import { http, HttpResponse } from 'msw'
import { mockAuthResponse } from '../data/user'

const BASE = import.meta.env.VITE_API_BASE_URL

export const authHandlers = [
  http.post(`${BASE}/auth/login`, () => {
    return HttpResponse.json(mockAuthResponse)
  }),

  http.post(`${BASE}/auth/register`, () => {
    return HttpResponse.json(mockAuthResponse)
  }),

  http.post(`${BASE}/auth/refresh`, () => {
    return HttpResponse.json({
      ...mockAuthResponse,
      accessToken: `refreshed-${Date.now()}`,
    })
  }),

  http.post(`${BASE}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${BASE}/auth/forgot-password`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${BASE}/auth/reset-password`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
