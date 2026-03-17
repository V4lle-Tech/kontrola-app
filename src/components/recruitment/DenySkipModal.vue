<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'

interface Props {
  requestId: string | null
}
const props = defineProps<Props>()
const visible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits<{ denied: [] }>()

const api = useRecruitmentApi()
const toast = useToast()
const reason = ref('')
const submitting = ref(false)

watch(visible, (show) => {
  if (show) {
    reason.value = ''
  }
})

async function submit() {
  if (!props.requestId || !reason.value.trim()) return
  submitting.value = true
  try {
    await api.rejectSkipRequest(props.requestId, reason.value.trim())
    toast.add({ severity: 'success', summary: 'Solicitud rechazada', life: 3000 })
    visible.value = false
    emit('denied')
  } catch {
    toast.add({ severity: 'error', summary: 'Error al rechazar', life: 5000 })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Rechazar Solicitud de Salto" class="w-full max-w-md">
    <div class="flex flex-col gap-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-color">
          Motivo del rechazo <span class="p-error">*</span>
        </label>
        <Textarea
          v-model="reason"
          rows="3"
          class="w-full"
          placeholder="Explica el motivo del rechazo..."
          auto-resize
        />
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="visible = false" />
        <Button
          label="Rechazar"
          icon="pi pi-times"
          severity="danger"
          :loading="submitting"
          :disabled="!reason.trim()"
          @click="submit"
        />
      </div>
    </div>
  </Dialog>
</template>
