import { computed } from 'vue'

export function useChartTheme() {
  const isDark = computed(() => document.documentElement.classList.contains('dark'))

  const gridColor = computed(() => isDark.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
  const textColor = computed(() => isDark.value ? '#a1a1aa' : '#71717a')

  return { isDark, gridColor, textColor }
}
