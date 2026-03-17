import { useToast } from 'primevue/usetoast'

/**
 * Composable para notificaciones estandarizadas via PrimeVue Toast.
 *
 * @example
 * const { notifySuccess, notifyError, messages } = useNotifications()
 * notifySuccess('Guardado correctamente')
 * messages.saved()
 */
export function useNotifications() {
  const toast = useToast()

  function notifySuccess(title: string, description?: string) {
    toast.add({ severity: 'success', summary: title, detail: description, life: 3000 })
  }

  function notifyError(title: string, description?: string) {
    toast.add({ severity: 'error', summary: title, detail: description, life: 5000 })
  }

  function notifyInfo(title: string, description?: string) {
    toast.add({ severity: 'info', summary: title, detail: description, life: 3000 })
  }

  function notifyWarning(title: string, description?: string) {
    toast.add({ severity: 'warn', summary: title, detail: description, life: 4000 })
  }

  const messages = {
    saved: () => notifySuccess('Guardado correctamente'),
    created: (entity: string) => notifySuccess(`${entity} creado`),
    updated: (entity: string) => notifySuccess(`${entity} actualizado`),
    deleted: (entity: string) => notifySuccess(`${entity} eliminado`),
    uploaded: () => notifySuccess('Archivo subido correctamente'),

    saveFailed: () => notifyError('Error al guardar', 'Por favor intenta de nuevo'),
    loadFailed: () => notifyError('Error al cargar', 'No se pudo obtener la información'),
    deleteFailed: () => notifyError('Error al eliminar', 'No se pudo completar la operación'),
    unauthorized: () => notifyError('No autorizado', 'No tienes permisos para esta acción'),
    networkError: () => notifyError('Error de conexión', 'Verifica tu conexión a internet'),

    processing: () => notifyInfo('Procesando...'),
    syncing: () => notifyInfo('Sincronizando...'),

    unsavedChanges: () => notifyWarning('Cambios sin guardar', 'Tienes cambios pendientes'),
  }

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    messages,
    toast,
  }
}
