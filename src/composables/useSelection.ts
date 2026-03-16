import { ref, computed, type Ref } from 'vue'

interface Identifiable {
  id: string
}

export function useSelection<T extends Identifiable>() {
  const selected: Ref<T[]> = ref([]) as Ref<T[]>

  const selectedIds = computed(() => selected.value.map((item: T) => item.id))
  const count = computed(() => selected.value.length)
  const hasSelection = computed(() => selected.value.length > 0)

  function isSelected(item: T): boolean {
    return selected.value.some((s: T) => s.id === item.id)
  }

  function toggle(item: T): void {
    const index = selected.value.findIndex((s: T) => s.id === item.id)
    if (index >= 0) {
      selected.value.splice(index, 1)
    } else {
      selected.value.push(item)
    }
  }

  function selectAll(items: T[]): void {
    selected.value = [...items]
  }

  function clear(): void {
    selected.value = []
  }

  return { selected, selectedIds, count, hasSelection, isSelected, toggle, selectAll, clear }
}
