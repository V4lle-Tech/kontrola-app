import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCandidateAuthStore = defineStore('candidateAuth', () => {
  const accessToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setToken(token: string) {
    accessToken.value = token
  }

  function clearToken() {
    accessToken.value = null
  }

  return { accessToken, isAuthenticated, setToken, clearToken }
})
