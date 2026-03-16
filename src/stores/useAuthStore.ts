import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import type { User, LoginCredentials, RegisterRequest, Permission } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────────────
  // Access token in memory (NEVER in localStorage — XSS risk)
  const accessToken = ref<string | null>(null)
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // Refresh token travels in HttpOnly cookie — the API handles it.
  // The client never reads or writes it directly.

  let refreshTimer: ReturnType<typeof setTimeout> | null = null

  // ── Computed ─────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => accessToken.value !== null && user.value !== null)
  const permissions = computed<Permission[]>(() => user.value?.permissions ?? [])

  // ── Actions ─────────────────────────────────────────────────────────
  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    try {
      const response = await authApi.login(credentials)
      _setSession(response.accessToken, response.user, response.expiresInSeconds)
    } finally {
      isLoading.value = false
    }
  }

  async function register(request: RegisterRequest): Promise<void> {
    isLoading.value = true
    try {
      const response = await authApi.register(request)
      _setSession(response.accessToken, response.user, response.expiresInSeconds)
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    _clearRefreshTimer()
    try {
      await authApi.logout()
    } finally {
      _clearSession()
    }
  }

  async function refreshAccessToken(): Promise<boolean> {
    try {
      const response = await authApi.refresh()
      _setSession(response.accessToken, response.user, response.expiresInSeconds)
      return true
    } catch {
      _clearSession()
      return false
    }
  }

  function setAccessToken(token: string): void {
    accessToken.value = token
  }

  function clearSession(): void {
    _clearSession()
  }

  function checkPermission(permission: Permission): boolean {
    return permissions.value.includes(permission)
  }

  function checkAnyPermission(perms: Permission[]): boolean {
    return perms.some((p) => permissions.value.includes(p))
  }

  // ── Private ──────────────────────────────────────────────────────────
  function _setSession(token: string, userData: User, expiresInSeconds: number): void {
    accessToken.value = token
    user.value = userData
    _scheduleRefresh(expiresInSeconds)
  }

  function _clearSession(): void {
    accessToken.value = null
    user.value = null
    _clearRefreshTimer()
  }

  function _scheduleRefresh(expiresInSeconds: number): void {
    _clearRefreshTimer()
    // Refresh 60 seconds before expiration
    const delay = Math.max((expiresInSeconds - 60) * 1000, 0)
    refreshTimer = setTimeout(() => {
      void refreshAccessToken()
    }, delay)
  }

  function _clearRefreshTimer(): void {
    if (refreshTimer !== null) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  return {
    // State (readonly from outside)
    user: computed(() => user.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    permissions,
    // Token exposed only for HTTP interceptor
    accessToken: computed(() => accessToken.value),
    // Actions
    login,
    register,
    logout,
    refreshAccessToken,
    setAccessToken,
    clearSession,
    checkPermission,
    checkAnyPermission,
  }
})
