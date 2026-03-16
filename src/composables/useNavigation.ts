import { computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import type { MenuItem, MenuSection } from '@/types/navigation'

export interface ResolvedMenuItem extends MenuItem {
  locked: boolean
}

export interface ResolvedMenuSection {
  label: string
  items: ResolvedMenuItem[]
}

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
      { label: 'Etiquetas', icon: 'pi pi-tags', to: '/recruitment/tags', permission: 'tags.view' },
      { label: 'Procesos', icon: 'pi pi-sitemap', to: '/recruitment/selection-processes', permission: 'selection-processes.view' },
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

  const sections = computed<ResolvedMenuSection[]>(() => {
    return menuSections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        locked: item.permission ? !auth.checkPermission(item.permission) : false,
      })),
    }))
  })

  return { sections }
}
