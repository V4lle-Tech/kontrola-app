import { computed, ref, type ComputedRef, type WritableComputedRef } from 'vue'

interface UseSelectionOptions<T> {
  getItemId: (item: T) => string
}

interface UseSelectionReturn<T> {
  selectedIds: ReturnType<typeof ref<Set<string>>>
  selectedCount: ComputedRef<number>
  hasSelection: ComputedRef<boolean>
  isSelected: (id: string) => boolean
  toggleSelection: (id: string) => void
  selectAll: (items: T[]) => void
  clearSelection: () => void
  isAllSelected: (items: T[]) => boolean
  isSomeSelected: (items: T[]) => boolean
  getSelectedIds: () => string[]
  createTableAdapter: (items: () => T[]) => WritableComputedRef<T[]>
}

/**
 * Composable para selección de items usando Set<string>.
 * Compatible con PrimeVue DataTable via createTableAdapter.
 *
 * @example
 * const { selectedIds, toggleSelection, createTableAdapter } = useSelection({
 *   getItemId: (item) => item.id,
 * })
 * const tableSelection = createTableAdapter(() => items.value)
 */
export function useSelection<T>(options: UseSelectionOptions<T>): UseSelectionReturn<T> {
  const selectedIds = ref<Set<string>>(new Set())

  const selectedCount = computed(() => selectedIds.value.size)
  const hasSelection = computed(() => selectedIds.value.size > 0)

  function isSelected(id: string): boolean {
    return selectedIds.value.has(id)
  }

  function toggleSelection(id: string): void {
    const newSet = new Set(selectedIds.value)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    selectedIds.value = newSet
  }

  function selectAll(items: T[]): void {
    const allIds = items.map(options.getItemId)
    const allSelected = allIds.every((id) => selectedIds.value.has(id))

    if (allSelected) {
      selectedIds.value = new Set()
    } else {
      selectedIds.value = new Set(allIds)
    }
  }

  function clearSelection(): void {
    selectedIds.value = new Set()
  }

  function isAllSelected(items: T[]): boolean {
    if (items.length === 0) return false
    return items.every((item) => selectedIds.value.has(options.getItemId(item)))
  }

  function isSomeSelected(items: T[]): boolean {
    if (items.length === 0) return false
    const selected = items.filter((item) => selectedIds.value.has(options.getItemId(item)))
    return selected.length > 0 && selected.length < items.length
  }

  function getSelectedIds(): string[] {
    return Array.from(selectedIds.value)
  }

  function createTableAdapter(items: () => T[]): WritableComputedRef<T[]> {
    return computed({
      get: () => items().filter((item) => selectedIds.value.has(options.getItemId(item))),
      set: (value: T[]) => {
        selectedIds.value = new Set(value.map((item) => options.getItemId(item)))
      },
    })
  }

  return {
    selectedIds,
    selectedCount,
    hasSelection,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected,
    getSelectedIds,
    createTableAdapter,
  }
}
