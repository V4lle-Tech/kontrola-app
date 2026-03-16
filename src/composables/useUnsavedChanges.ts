import { onBeforeUnmount, type Ref, type ComputedRef } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

export function useUnsavedChanges(isDirty: Ref<boolean> | ComputedRef<boolean>) {
  function handleBeforeUnload(e: BeforeUnloadEvent) {
    if (isDirty.value) {
      e.preventDefault()
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  onBeforeUnmount(() => window.removeEventListener('beforeunload', handleBeforeUnload))

  onBeforeRouteLeave(() => {
    if (isDirty.value) {
      return window.confirm('Tienes cambios sin guardar. ¿Deseas salir?')
    }
    return true
  })

  function markClean(): void {
    if ('value' in isDirty && typeof isDirty === 'object') {
      ;(isDirty as Ref<boolean>).value = false
    }
  }

  return { isDirty, markClean }
}
