import type { MenuItem } from 'primevue/menuitem'

export interface SidebarMenuItem extends MenuItem {
  to?: string
  locked?: boolean
  module?: string
  items?: SidebarMenuItem[]
}
