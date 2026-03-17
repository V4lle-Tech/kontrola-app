import { computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

const allModules = [
  'recruitment',
  'documents',
  'crm',
  'access',
  'settings',
  'admin',
] as const

export type ModuleName = (typeof allModules)[number]

export function useModules() {
  const auth = useAuthStore()

  const enabledModules = computed<string[]>(() => {
    // Tenant modules could come from auth.user in the future
    // For now, all modules are enabled by default
    return auth.user ? [...allModules] : []
  })

  function isModuleEnabled(module: string): boolean {
    return enabledModules.value.includes(module)
  }

  return { enabledModules, isModuleEnabled }
}
