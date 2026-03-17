export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export const PER_PAGE_OPTIONS = [10, 25, 50, 100] as const
export type PerPageOption = (typeof PER_PAGE_OPTIONS)[number]

export interface ListPreferences {
  viewMode: 'cards' | 'table'
  perPage: PerPageOption
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}
