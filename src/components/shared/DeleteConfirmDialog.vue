<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

interface Props {
  title?: string
  message?: string
  loading?: boolean
}
withDefaults(defineProps<Props>(), {
  title: 'Confirmar eliminación',
  message: '¿Estás seguro? Esta acción no se puede deshacer.',
  loading: false,
})

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleCancel() {
  visible.value = false
  emit('cancel')
}
</script>

<template>
  <Dialog v-model:visible="visible" modal :header="title" class="w-full max-w-sm">
    <div class="flex flex-col gap-4">
      <div class="flex items-start gap-3">
        <i class="pi pi-exclamation-triangle text-2xl" style="color: var(--p-red-500)" />
        <p class="text-sm text-color">{{ message }}</p>
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="handleCancel" />
        <Button
          label="Eliminar"
          icon="pi pi-trash"
          severity="danger"
          :loading="loading"
          @click="emit('confirm')"
        />
      </div>
    </div>
  </Dialog>
</template>
