import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'
import { parseApiError } from './errors'

// Queue for serializing concurrent token refresh attempts
let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null): void {
  refreshQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token as string)))
  refreshQueue = []
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach Bearer token from auth store
apiClient.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

// Response interceptor: centralized error handling + token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    // 401 — attempt token refresh once
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const auth = useAuthStore()
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        )
        auth.setAccessToken(data.accessToken)
        processQueue(null, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        const auth = useAuthStore()
        auth.clearSession()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 400/422 — parse as ProblemDetails
    if (status === 400 || status === 422) {
      return Promise.reject(parseApiError(error.response?.data))
    }

    // 500+ — capture error (Sentry will be added in Phase 13)
    if (status && status >= 500) {
      return Promise.reject(parseApiError(error.response?.data))
    }

    return Promise.reject(error)
  },
)
