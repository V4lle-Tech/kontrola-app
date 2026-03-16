<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { PipelineApplication, SelectionStage } from '@/types/recruitment'

interface Props {
  application: PipelineApplication | null
  stages: SelectionStage[]
}
const props = defineProps<Props>()

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  submitted: []
}>()

const api = useRecruitmentApi()
const toast = useToast()
const targetStageId = ref<string | null>(null)
const reason = ref('')
const submitting = ref(false)

const stageOptions = ref<{ label: string; value: string }[]>([])

watch(visible, (show) => {
  if (show && props.application) {
    targetStageId.value = null
    reason.value = ''
    const currentIdx = props.stages.findIndex((s) => s.id === props.application?.currentStageId)
    stageOptions.value = props.stages
      .filter((_, i) => i > currentIdx + 1)
      .filter((s) => s.type !== 'rejected' && s.type !== 'hired')
      .map((s) => ({ label: s.name, value: s.id }))
  }
})

async function submit() {
  if (!props.application || !targetStageId.value || !reason.value.trim()) return
  submitting.value = true
  try {
    await api.createSkipRequest({
      applicationId: props.application.id,
      targetStageId: targetStageId.value,
      reason: reason.value.trim(),
    })
    toast.add({ severity: 'success', summary: 'Solicitud enviada', detail: 'Se requiere autorización para completar el salto', life: 4000 })
    visible.value = false
    emit('submitted')
  } catch {
    toast.add({ severity: 'error', summary: 'Error al enviar solicitud', life: 5000 })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Solicitar Salto de Etapa" class="w-full max-w-md">
    <div v-if="application" class="flex flex-col gap-4">
      <!-- Current stage info -->
      <div class="rounded-lg border border-surface bg-surface-50 p-3 dark:bg-surface-800">
        <p class="text-xs font-semibold text-muted-color">Candidato</p>
        <p class="font-medium text-color">{{ application.candidateName }}</p>
      </div>

      <!-- Target stage -->
      <div>
        <label class="mb-1 block text-sm font-medium text-color">Saltar a etapa</label>
        <Select v-model="targetStageId" :options="stageOptions" option-label="label" option-value="value" placeholder="Seleccionar etapa destino" class="w-full" />
        <small v-if="!stageOptions.length" class="text-muted-color">No hay etapas disponibles para saltar</small>
      </div>

      <!-- Reason (required) -->
      <div>
        <label class="mb-1 block text-sm font-medium text-color">Justificación <span class="text-red-500">*</span></label>
        <Textarea v-model="reason" rows="3" class="w-full" placeholder="Explica el motivo del salto de etapa..." auto-resize />
      </div>

      <!-- Info banner -->
      <div class="rounded-lg border border-surface bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
        <i class="pi pi-info-circle mr-1" />
        Esta solicitud requiere autorización de un supervisor antes de hacerse efectiva.
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="visible = false" />
        <Button label="Enviar Solicitud" icon="pi pi-send" :loading="submitting" :disabled="!targetStageId || !reason.trim()" @click="submit" />
      </div>
    </div>
  </Dialog>
</template>
