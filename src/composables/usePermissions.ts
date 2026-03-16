import { computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Permission } from '@/types/auth'

export function usePermissions() {
  const auth = useAuthStore()

  const permissions = computed(() => auth.permissions)
  const roles = computed(() => auth.user?.roles ?? [])

  function can(permission: Permission): boolean {
    return auth.checkPermission(permission)
  }

  function canAny(perms: Permission[]): boolean {
    return auth.checkAnyPermission(perms)
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  function isOwner(resourceUserId: string): boolean {
    return auth.user?.id === resourceUserId
  }

  return {
    permissions,
    roles,
    can,
    canAny,
    hasRole,
    isOwner,
  }
}
