import type { ListPreferences, PerPageOption } from '@/types/pagination'
import { computed, ref, watch, type Ref } from 'vue'

const STORAGE_PREFIX = 'kontrola-list-'
const DEFAULT_PER_PAGE: PerPageOption = 25

// Cache de preferencias por lista (singleton pattern)
const preferencesCache: Record<string, Ref<ListPreferences>> = {}

function getStoredPreferences(storageKey: string): ListPreferences {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored) as ListPreferences
      return {
        viewMode: parsed.viewMode || 'cards',
        perPage: parsed.perPage || DEFAULT_PER_PAGE,
      }
    }
  } catch {
    // Ignore parsing errors
  }
  return { viewMode: 'cards', perPage: DEFAULT_PER_PAGE }
}

/**
 * Composable para manejar preferencias de listas (vista y paginación).
 * - Persiste estado en localStorage por listKey
 * - Estado compartido globalmente por listKey (singleton)
 *
 * @param listKey - Identificador único de la lista (ej: 'candidates', 'job-postings')
 */
export function useListPreferences(listKey: string) {
  const STORAGE_KEY = `${STORAGE_PREFIX}${listKey}`

  const storedPrefs = getStoredPreferences(STORAGE_KEY)

  if (!preferencesCache[listKey]) {
    preferencesCache[listKey] = ref<ListPreferences>(storedPrefs)
  }

  const preferences = preferencesCache[listKey] as Ref<ListPreferences>

  // Persistir cambios en localStorage
  watch(
    preferences,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    },
    { deep: true },
  )

  const viewMode = computed(() => preferences.value.viewMode)
  const perPage = computed(() => preferences.value.perPage)
  const isTableView = computed(() => preferences.value.viewMode === 'table')
  const isCardsView = computed(() => preferences.value.viewMode === 'cards')

  function setViewMode(mode: 'cards' | 'table') {
    preferences.value.viewMode = mode
  }

  function setPerPage(count: PerPageOption) {
    preferences.value.perPage = count
  }

  function toggleViewMode() {
    preferences.value.viewMode = preferences.value.viewMode === 'cards' ? 'table' : 'cards'
  }

  return {
    preferences,
    viewMode,
    perPage,
    isTableView,
    isCardsView,
    setViewMode,
    setPerPage,
    toggleViewMode,
  }
}
