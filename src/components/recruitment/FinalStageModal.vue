<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import SelectButton from 'primevue/selectbutton'
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
  completed: []
}>()

const api = useRecruitmentApi()
const toast = useToast()
const outcome = ref<'hired' | 'rejected'>('hired')
const reason = ref('')
const submitting = ref(false)

const outcomeOptions = [
  { label: 'Contratar', value: 'hired', icon: 'pi pi-check-circle' },
  { label: 'Rechazar', value: 'rejected', icon: 'pi pi-times-circle' },
]

const targetStage = computed(() =>
  props.stages.find((s) => s.type === outcome.value) ?? null,
)

watch(visible, (show) => {
  if (show) {
    outcome.value = 'hired'
    reason.value = ''
  }
})

async function submit() {
  if (!props.application || !targetStage.value) return
  submitting.value = true
  try {
    await api.moveApplication(props.application.id, {
      targetStageId: targetStage.value.id,
      reason: reason.value || undefined,
    })
    toast.add({
      severity: outcome.value === 'hired' ? 'success' : 'info',
      summary: outcome.value === 'hired' ? 'Candidato contratado' : 'Candidato rechazado',
      life: 3000,
    })
    visible.value = false
    emit('completed')
  } catch {
    toast.add({ severity: 'error', summary: 'Error al procesar', life: 5000 })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Decisión Final" class="w-full max-w-md">
    <div v-if="application" class="flex flex-col gap-4">
      <!-- Candidate info -->
      <div class="flex items-center gap-3 rounded-lg border border-surface bg-surface-50 p-3 dark:bg-surface-800">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <i class="pi pi-user text-primary" />
        </div>
        <div class="min-w-0">
          <p class="font-medium text-color">{{ application.candidateName }}</p>
          <p class="text-sm text-muted-color">{{ application.candidateEmail }}</p>
        </div>
      </div>

      <!-- Outcome selector -->
      <div>
        <label class="mb-1 block text-sm font-medium text-color">Resultado</label>
        <SelectButton v-model="outcome" :options="outcomeOptions" option-label="label" option-value="value" class="w-full" />
      </div>

      <!-- Reason -->
      <div>
        <label class="mb-1 block text-sm font-medium text-color">Motivo</label>
        <Textarea v-model="reason" rows="3" class="w-full" :placeholder="outcome === 'hired' ? 'Motivo de contratación...' : 'Motivo de rechazo...'" />
      </div>

      <!-- No final stage warning -->
      <div v-if="!targetStage" class="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
        <i class="pi pi-exclamation-triangle mr-1" />
        No hay una etapa de tipo "{{ outcome === 'hired' ? 'contratado' : 'rechazado' }}" configurada en este proceso.
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="visible = false" />
        <Button
          :label="outcome === 'hired' ? 'Contratar' : 'Rechazar'"
          :icon="outcome === 'hired' ? 'pi pi-check-circle' : 'pi pi-times-circle'"
          :severity="outcome === 'hired' ? 'success' : 'danger'"
          :loading="submitting"
          :disabled="!targetStage"
          @click="submit"
        />
      </div>
    </div>
  </Dialog>
</template>
