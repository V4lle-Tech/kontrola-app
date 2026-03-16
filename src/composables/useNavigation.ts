import { computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import type { MenuSection } from '@/types/navigation'

const menuSections: MenuSection[] = [
  {
    label: 'General',
    items: [
      { label: 'Dashboard', icon: 'pi pi-home', to: '/' },
    ],
  },
  {
    label: 'Reclutamiento',
    items: [
      { label: 'Candidatos', icon: 'pi pi-users', to: '/recruitment/candidates', permission: 'candidates.view' },
      { label: 'Perfiles de Puesto', icon: 'pi pi-briefcase', to: '/recruitment/job-profiles', permission: 'job-profiles.view' },
      { label: 'Vacantes', icon: 'pi pi-megaphone', to: '/recruitment/vacancies', permission: 'vacancies.view' },
      { label: 'Pipeline', icon: 'pi pi-arrow-right-arrow-left', to: '/recruitment/pipeline', permission: 'pipeline.view' },
    ],
  },
  {
    label: 'Documentos',
    items: [
      { label: 'Documentos', icon: 'pi pi-file', to: '/documents', permission: 'documents.view' },
      { label: 'Tipos de Documento', icon: 'pi pi-folder', to: '/documents/types', permission: 'document-types.view' },
    ],
  },
  {
    label: 'CRM',
    items: [
      { label: 'Clientes', icon: 'pi pi-building', to: '/crm/clients', permission: 'clients.view' },
    ],
  },
  {
    label: 'Acceso',
    items: [
      { label: 'Usuarios', icon: 'pi pi-user', to: '/access/users', permission: 'users.view' },
      { label: 'Roles', icon: 'pi pi-shield', to: '/access/roles', permission: 'roles.view' },
    ],
  },
  {
    label: 'Configuraci\u00f3n',
    items: [
      { label: 'Perfil', icon: 'pi pi-cog', to: '/settings/profile' },
      { label: 'Empresa', icon: 'pi pi-building-columns', to: '/settings/business', permission: 'settings.view' },
    ],
  },
]

export function useNavigation() {
  const auth = useAuthStore()

  const filteredSections = computed(() => {
    return menuSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!item.permission) return true
          return auth.checkPermission(item.permission)
        }),
      }))
      .filter((section) => section.items.length > 0)
  })

  return { sections: filteredSections }
}
