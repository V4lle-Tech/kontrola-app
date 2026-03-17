export interface AdminKPI {
  totalTenants: number
  activeTenants: number
  totalUsers: number
  mrr: number
  newTenantsThisMonth: number
  churnRate: number
}

export interface AdminModule {
  id: string
  name: string
  description: string
  isCore: boolean
  price: number
  tenantsCount: number
}

export interface SystemHealthItem {
  id: string
  queue: string
  payload: string
  exception: string
  failedAt: string
}

export interface TenantGrowthPoint {
  month: string
  count: number
}

export interface RevenuePoint {
  month: string
  amount: number
}
