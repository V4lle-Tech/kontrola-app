import { ref, computed, onMounted, type Ref } from 'vue'
import type { PaginatedResponse } from '@/types/pagination'
import type { DataTablePageEvent, DataTableSortEvent } from 'primevue/datatable'

export interface ListParams {
  page: number; pageSize: number; search: string
  sortField: string; sortOrder: 'asc' | 'desc'
}

export interface UseListPageOptions {
  fetchFn: (params: ListParams) => Promise<PaginatedResponse<Record<string, unknown>>>
  defaultSortField?: string; defaultSortOrder?: 'asc' | 'desc'
  defaultPageSize?: number; searchDebounce?: number
}

export function useListPage(options: UseListPageOptions) {
  const {
    fetchFn,
    defaultSortField = 'createdAt',
    defaultSortOrder = 'desc',
    defaultPageSize = 20,
    searchDebounce = 300,
  } = options

  const data: Ref<PaginatedResponse<Record<string, unknown>> | null> = ref(null)
  const loading = ref(false)
  const search = ref('')
  const page = ref(1)
  const pageSize = ref(defaultPageSize)
  const sortField = ref(defaultSortField)
  const sortOrder = ref<'asc' | 'desc'>(defaultSortOrder)

  const items = computed(() => data.value?.items ?? [])
  const totalRecords = computed(() => data.value?.totalCount ?? 0)
  let searchTimer: ReturnType<typeof setTimeout> | undefined

  async function loadData() {
    loading.value = true
    try {
      data.value = await fetchFn({
        page: page.value,
        pageSize: pageSize.value,
        search: search.value,
        sortField: sortField.value,
        sortOrder: sortOrder.value,
      })
    } finally {
      loading.value = false
    }
  }

  function onPage(event: DataTablePageEvent) {
    page.value = (event.page ?? 0) + 1
    pageSize.value = event.rows
    void loadData()
  }

  function onSort(event: DataTableSortEvent) {
    sortField.value = (event.sortField as string) ?? defaultSortField
    sortOrder.value = event.sortOrder === 1 ? 'asc' : 'desc'
    page.value = 1
    void loadData()
  }

  function onSearchInput() {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      page.value = 1
      void loadData()
    }, searchDebounce)
  }

  onMounted(() => void loadData())

  return {
    data, loading, search, page, pageSize, sortField, sortOrder,
    items, totalRecords,
    loadData, onPage, onSort, onSearchInput, refresh: loadData,
  }
}
