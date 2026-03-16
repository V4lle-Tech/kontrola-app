import { apiClient } from './client'
import axios from 'axios'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', request)
    return data
  },

  async refresh(): Promise<AuthResponse> {
    // Uses a raw axios instance to avoid the interceptor loop
    const { data } = await axios.post<AuthResponse>(
      `${BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    )
    return data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {}, { withCredentials: true })
  },

  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/auth/forgot-password', request)
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/auth/reset-password', request)
  },
}
