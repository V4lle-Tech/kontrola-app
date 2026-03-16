<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { useDocumentsApi } from '@/composables/api/useDocumentsApi'
import type { Document } from '@/types/document'

interface Props {
  document: Document | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ verified: []; close: [] }>()

const api = useDocumentsApi()
const toast = useToast()
const visible = computed(() => !!props.document)
const decision = ref<'verified' | 'rejected'>('verified')
const notes = ref('')
const saving = ref(false)

const options = [
  { label: 'Verificar', value: 'verified' },
  { label: 'Rechazar', value: 'rejected' },
]

async function submit() {
  if (!props.document) return
  saving.value = true
  try {
    await api.verifyDocument(props.document.id, { status: decision.value, notes: notes.value || undefined })
    toast.add({ severity: 'success', summary: decision.value === 'verified' ? 'Documento verificado' : 'Documento rechazado', life: 3000 })
    notes.value = ''
    decision.value = 'verified'
    emit('verified')
  } catch {
    toast.add({ severity: 'error', summary: 'Error al verificar', life: 5000 })
  } finally { saving.value = false }
}

function close() {
  notes.value = ''
  decision.value = 'verified'
  emit('close')
}
</script>

<template>
  <Dialog :visible="visible" header="Verificar Documento" modal :style="{ width: '28rem' }" @update:visible="close">
    <div v-if="document" class="flex flex-col gap-4">
      <p class="text-sm text-muted-color">Documento: <strong class="text-color">{{ document.fileName }}</strong></p>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Decisión</label>
        <SelectButton v-model="decision" :options="options" option-label="label" option-value="value" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Notas (opcional)</label>
        <Textarea v-model="notes" rows="3" :placeholder="decision === 'rejected' ? 'Razón del rechazo...' : 'Notas adicionales...'" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancelar" severity="secondary" text @click="close" />
      <Button :label="decision === 'verified' ? 'Verificar' : 'Rechazar'" :icon="decision === 'verified' ? 'pi pi-check' : 'pi pi-times'" :severity="decision === 'verified' ? 'success' : 'danger'" :loading="saving" @click="submit" />
    </template>
  </Dialog>
</template>
