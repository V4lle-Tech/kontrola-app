import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePreferencesStore } from '@/stores/usePreferencesStore'

const MOBILE_BREAKPOINT = 1024
const mobileOpen = ref(false)

export function useSidebar() {
  const preferences = usePreferencesStore()
  const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT)

  function onResize() {
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
    if (!isMobile.value) {
      mobileOpen.value = false
    }
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  const collapsed = computed(() => preferences.sidebarCollapsed)

  function toggle() {
    if (isMobile.value) {
      mobileOpen.value = !mobileOpen.value
    } else {
      preferences.toggleSidebar()
    }
  }

  function closeMobile() {
    mobileOpen.value = false
  }

  return {
    collapsed,
    isMobile,
    mobileOpen,
    toggle,
    closeMobile,
  }
}
