export interface MenuItem {
  label: string
  icon: string
  to?: string
  permission?: string
  children?: MenuItem[]
}

export interface MenuSection {
  label: string
  items: MenuItem[]
}
