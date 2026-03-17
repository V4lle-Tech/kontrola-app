import { computed } from 'vue'
import { usePreferencesStore } from '@/stores/usePreferencesStore'
import type { ThemeMode } from '@/stores/usePreferencesStore'

export type ColorMode = ThemeMode

/**
 * Composable para gestión de color mode (light/dark/system).
 * Delega al store de preferencias para mantener estado singleton.
 */
export function useColorMode() {
  const preferences = usePreferencesStore()

  const colorMode = computed(() => preferences.themeMode)

  const isDark = computed(() => {
    if (preferences.themeMode === 'dark') return true
    if (preferences.themeMode === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  function setColorMode(mode: ColorMode) {
    preferences.setTheme(mode)
  }

  function toggleColorMode() {
    const modes: ColorMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(preferences.themeMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setColorMode(modes[nextIndex] as ColorMode)
  }

  function toggleDark() {
    setColorMode(isDark.value ? 'light' : 'dark')
  }

  return {
    colorMode,
    isDark,
    setColorMode,
    toggleColorMode,
    toggleDark,
  }
}
