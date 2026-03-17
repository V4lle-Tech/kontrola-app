import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import type { SidebarMenuItem } from '@/types/navigation'

const EXPANDED_KEYS_STORAGE = 'kontrola-expanded-modules'

export function useNavigation() {
  const auth = useAuthStore()
  const route = useRoute()
  const router = useRouter()
  const expandedKeys = ref<Record<string, boolean>>({})

  onMounted(() => {
    const stored = localStorage.getItem(EXPANDED_KEYS_STORAGE)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          expandedKeys.value = parsed
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  })

  watch(
    expandedKeys,
    (value) => {
      localStorage.setItem(EXPANDED_KEYS_STORAGE, JSON.stringify(value))
    },
    { deep: true },
  )

  function can(permission: string): boolean {
    return auth.checkPermission(permission)
  }

  const menuItems = computed<SidebarMenuItem[]>(() => {
    const items: SidebarMenuItem[] = []

    items.push({
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'pi pi-objects-column',
      to: '/',
    })

    // Reclutamiento
    const recItems: SidebarMenuItem[] = []

    const recOperacion: SidebarMenuItem[] = [
      { key: 'rec-op-metricas', label: 'Métricas', icon: 'pi pi-chart-bar', to: '/recruitment/metrics' },
      { key: 'rec-op-pipeline', label: 'Pipeline', icon: 'pi pi-arrow-right-arrow-left', to: '/recruitment/pipeline' },
    ]
    if (can('pipeline.manage')) {
      recOperacion.push({ key: 'rec-op-skip', label: 'Saltos de Etapa', icon: 'pi pi-forward', to: '/recruitment/skip-requests' })
    }

    const recGestion: SidebarMenuItem[] = [
      { key: 'rec-ge-vacantes', label: 'Vacantes', icon: 'pi pi-megaphone', to: '/recruitment/vacancies' },
      { key: 'rec-ge-puestos', label: 'Perfiles de Puesto', icon: 'pi pi-briefcase', to: '/recruitment/job-profiles' },
      { key: 'rec-ge-candidatos', label: 'Candidatos', icon: 'pi pi-users', to: '/recruitment/candidates' },
    ]

    const recOrganizacion: SidebarMenuItem[] = []
    if (can('selection-processes.view')) {
      recOrganizacion.push({ key: 'rec-or-procesos', label: 'Procesos', icon: 'pi pi-sitemap', to: '/recruitment/selection-processes' })
    }
    recOrganizacion.push({ key: 'rec-or-tags', label: 'Etiquetas', icon: 'pi pi-tags', to: '/recruitment/tags' })

    const recPublicacion: SidebarMenuItem[] = []
    if (can('syndication.view') || can('syndication.manage')) {
      recPublicacion.push(
        { key: 'rec-pu-publicaciones', label: 'Publicaciones', icon: 'pi pi-send', to: '/recruitment/syndication' },
        { key: 'rec-pu-portales', label: 'Portales', icon: 'pi pi-globe', to: '/recruitment/job-boards' },
        { key: 'rec-pu-templates', label: 'Templates', icon: 'pi pi-file-edit', to: '/recruitment/social-templates' },
        { key: 'rec-pu-config', label: 'Configuración', icon: 'pi pi-wrench', to: '/recruitment/syndication-settings' },
      )
    }

    if (recOperacion.length > 0) recItems.push({ key: 'rec-operacion', label: 'Operación', icon: 'pi pi-folder', items: recOperacion })
    if (recGestion.length > 0) recItems.push({ key: 'rec-gestion', label: 'Gestión', icon: 'pi pi-users', items: recGestion })
    if (recOrganizacion.length > 0) recItems.push({ key: 'rec-organizacion', label: 'Organización', icon: 'pi pi-tags', items: recOrganizacion })
    if (recPublicacion.length > 0) recItems.push({ key: 'rec-publicacion', label: 'Publicación', icon: 'pi pi-megaphone', items: recPublicacion })

    items.push({ key: 'reclutamiento', label: 'Reclutamiento', icon: 'pi pi-briefcase', items: recItems })

    // Documentos
    const docItems: SidebarMenuItem[] = [
      { key: 'doc-archivos', label: 'Documentos', icon: 'pi pi-file', to: '/documents' },
      { key: 'doc-tipos', label: 'Tipos', icon: 'pi pi-folder', to: '/documents/types' },
      { key: 'doc-cumplimiento', label: 'Cumplimiento', icon: 'pi pi-verified', to: '/documents/compliance' },
    ]
    items.push({ key: 'documentos', label: 'Documentos', icon: 'pi pi-file', items: docItems })

    // CRM
    items.push({
      key: 'crm',
      label: 'CRM',
      icon: 'pi pi-building',
      items: [{ key: 'crm-clientes', label: 'Clientes', icon: 'pi pi-building', to: '/crm/clients' }],
    })

    // Acceso
    const accessItems: SidebarMenuItem[] = []
    if (can('users.view')) {
      accessItems.push({ key: 'acc-usuarios', label: 'Usuarios', icon: 'pi pi-user', to: '/access/users' })
    }
    if (can('roles.view')) {
      accessItems.push({ key: 'acc-roles', label: 'Roles', icon: 'pi pi-shield', to: '/access/roles' })
    }
    if (accessItems.length > 0) {
      items.push({ key: 'acceso', label: 'Acceso', icon: 'pi pi-shield', items: accessItems })
    }

    // Configuración
    const configItems: SidebarMenuItem[] = [
      { key: 'cfg-perfil', label: 'Perfil', icon: 'pi pi-cog', to: '/settings/profile' },
    ]
    if (can('settings.view')) {
      configItems.push({ key: 'cfg-empresa', label: 'Empresa', icon: 'pi pi-building-columns', to: '/settings/business' })
    }
    if (can('settings.manage')) {
      configItems.push(
        { key: 'cfg-apikeys', label: 'API Keys', icon: 'pi pi-key', to: '/settings/api-keys' },
        { key: 'cfg-modulos', label: 'Módulos', icon: 'pi pi-th-large', to: '/settings/modules' },
      )
    }
    if (can('candidates.manage')) {
      configItems.push({ key: 'cfg-importar', label: 'Importar', icon: 'pi pi-upload', to: '/settings/import' })
    }
    items.push({ key: 'configuracion', label: 'Configuración', icon: 'pi pi-cog', items: configItems })

    return items
  })

  // Active state helpers
  function isActive(to: string | undefined): boolean {
    if (!to) return false
    const currentPath = route.path
    if (to === '/') return currentPath === '/'
    return currentPath.startsWith(to)
  }

  function hasActiveChild(item: SidebarMenuItem): boolean {
    if (item.to && isActive(item.to)) return true
    if (!item.items) return false
    return item.items.some((child) => hasActiveChild(child))
  }

  // Auto-expand items that have an active child when route changes
  watch(
    () => route.path,
    () => {
      const newKeys = { ...expandedKeys.value }
      for (const item of menuItems.value) {
        if (item.items && hasActiveChild(item)) {
          newKeys[item.key as string] = true
          for (const child of item.items) {
            if (child.items && hasActiveChild(child)) {
              newKeys[child.key as string] = true
            }
          }
        }
      }
      expandedKeys.value = newKeys
    },
    { immediate: true },
  )

  function navigateTo(to: string) {
    router.push(to)
  }

  return {
    menuItems,
    expandedKeys,
    isActive,
    hasActiveChild,
    navigateTo,
  }
}
