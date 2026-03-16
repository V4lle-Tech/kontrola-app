import { ref } from 'vue'

export interface SavedSearch {
  id: string
  name: string
  filters: Record<string, unknown>
  createdAt: string
}

const STORAGE_KEY = 'kontrola:saved-searches'

function loadFromStorage(module: string): SavedSearch[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${module}`)
    if (!raw) return []
    return JSON.parse(raw) as SavedSearch[]
  } catch {
    return []
  }
}

function saveToStorage(module: string, searches: SavedSearch[]) {
  localStorage.setItem(`${STORAGE_KEY}:${module}`, JSON.stringify(searches))
}

export function useSavedSearches(module: string) {
  const searches = ref<SavedSearch[]>(loadFromStorage(module))

  function save(name: string, filters: Record<string, unknown>): SavedSearch {
    const search: SavedSearch = {
      id: crypto.randomUUID(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    }
    searches.value = [...searches.value, search]
    saveToStorage(module, searches.value)
    return search
  }

  function remove(id: string) {
    searches.value = searches.value.filter((s) => s.id !== id)
    saveToStorage(module, searches.value)
  }

  function reload() {
    searches.value = loadFromStorage(module)
  }

  return { searches, save, remove, reload }
}
