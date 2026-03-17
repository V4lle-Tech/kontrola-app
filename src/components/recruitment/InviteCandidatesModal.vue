<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { ApiError } from '@/types/api'

interface Props {
  jobProfileId: string
}
const props = defineProps<Props>()

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  saved: []
}>()

const api = useRecruitmentApi()
const toast = useToast()
const emailsText = ref('')
const message = ref('')
const submitting = ref(false)

watch(visible, (show) => {
  if (show) {
    emailsText.value = ''
    message.value = ''
  }
})

function parseEmails(): string[] {
  return emailsText.value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

async function submit() {
  const emails = parseEmails()
  if (emails.length === 0) return

  submitting.value = true
  try {
    await api.inviteCandidates(props.jobProfileId, emails, message.value || undefined)
    toast.add({
      severity: 'success',
      summary: `Invitación enviada a ${emails.length} correo(s)`,
      life: 3000,
    })
    visible.value = false
    emit('saved')
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({ severity: 'error', summary: apiError.title ?? 'Error al enviar invitaciones', life: 5000 })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Invitar Candidatos" class="w-full max-w-md">
    <div class="flex flex-col gap-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-color">Correos electrónicos</label>
        <Textarea
          v-model="emailsText"
          rows="5"
          class="w-full"
          placeholder="Un correo por línea&#10;ejemplo@correo.com&#10;otro@correo.com"
          auto-resize
        />
        <small class="text-muted-color">Ingresa un correo electrónico por línea</small>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-color">Mensaje (opcional)</label>
        <Textarea
          v-model="message"
          rows="3"
          class="w-full"
          placeholder="Mensaje personalizado para la invitación..."
          auto-resize
        />
      </div>

      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="visible = false" />
        <Button
          label="Enviar invitaciones"
          icon="pi pi-envelope"
          :loading="submitting"
          :disabled="parseEmails().length === 0"
          @click="submit"
        />
      </div>
    </div>
  </Dialog>
</template>
