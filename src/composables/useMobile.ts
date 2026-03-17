import { computed, onMounted, onUnmounted, ref } from 'vue'

/**
 * Composable para detección reactiva de breakpoints responsive.
 * Usa los breakpoints de Tailwind v4: md = 768px, lg = 1024px.
 * Implementación nativa sin dependencia de @vueuse/core.
 */
export function useMobile() {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

  let resizeHandler: (() => void) | null = null

  onMounted(() => {
    resizeHandler = () => {
      windowWidth.value = window.innerWidth
    }
    window.addEventListener('resize', resizeHandler)
  })

  onUnmounted(() => {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }
  })

  const isMobile = computed(() => windowWidth.value < 768)
  const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)
  const isDesktop = computed(() => windowWidth.value >= 1024)

  return {
    isMobile,
    isTablet,
    isDesktop,
  }
}
