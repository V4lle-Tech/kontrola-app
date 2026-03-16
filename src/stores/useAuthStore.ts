import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  // Access token en memoria (NUNCA en localStorage — riesgo XSS)
  const accessToken = ref<string | null>(null)
  const user = ref<Record<string, unknown> | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => accessToken.value !== null && user.value !== null)

  function setAccessToken(token: string): void {
    accessToken.value = token
  }

  function clearSession(): void {
    accessToken.value = null
    user.value = null
  }

  // TODO(F1-01): Implement full auth flow (login, logout, refresh, scheduleRefresh)

  return {
    accessToken: computed(() => accessToken.value),
    user: computed(() => user.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    setAccessToken,
    clearSession,
  }
})
