import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark' | 'system'

export const usePreferencesStore = defineStore('preferences', () => {
  const themeMode = ref<ThemeMode>(
    (localStorage.getItem('kontrola-theme') as ThemeMode | null) ?? 'system',
  )
  const sidebarCollapsed = ref(false)

  function applyTheme(mode: ThemeMode): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = mode === 'dark' || (mode === 'system' && prefersDark)

    document.documentElement.classList.toggle('dark', isDark)
  }

  function setTheme(mode: ThemeMode): void {
    themeMode.value = mode
    localStorage.setItem('kontrola-theme', mode)
    applyTheme(mode)
  }

  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // React to system preference changes
  function initThemeListener(): void {
    applyTheme(themeMode.value)

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (themeMode.value === 'system') {
        applyTheme('system')
      }
    })
  }

  watch(themeMode, (mode) => applyTheme(mode))

  return {
    themeMode,
    sidebarCollapsed,
    setTheme,
    toggleSidebar,
    initThemeListener,
  }
})
