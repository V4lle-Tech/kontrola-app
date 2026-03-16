<script setup lang="ts">
import { ref, watch } from 'vue'
import Drawer from 'primevue/drawer'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import { sourceLabel, sourceSeverity } from '@/utils/candidateLabels'
import type { PipelineApplication, Candidate, ApplicationNote } from '@/types/recruitment'

interface Props {
  application: PipelineApplication | null
}
const props = defineProps<Props>()

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  viewHistory: [applicationId: string]
  addNote: [applicationId: string]
  finalDecision: [application: PipelineApplication]
  skipStage: [application: PipelineApplication]
}>()

const api = useRecruitmentApi()
const candidate = ref<Candidate | null>(null)
const notes = ref<ApplicationNote[]>([])
const loadingCandidate = ref(false)
const loadingNotes = ref(false)

watch(visible, async (show) => {
  if (show && props.application) {
    loadingCandidate.value = true
    loadingNotes.value = true
    try {
      candidate.value = await api.getCandidate(props.application.candidateId)
    } catch { candidate.value = null }
    finally { loadingCandidate.value = false }
    try {
      notes.value = await api.getApplicationNotes(props.application.id)
    } catch { notes.value = [] }
    finally { loadingNotes.value = false }
  }
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full sm:w-[420px]" header="Perfil de Candidato">
    <div v-if="loadingCandidate" class="flex items-center justify-center py-12">
      <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
    </div>

    <div v-else-if="candidate && application" class="flex flex-col gap-4">
      <!-- Profile header -->
      <div class="flex items-center gap-3">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <i class="pi pi-user text-xl text-primary" />
        </div>
        <div class="min-w-0">
          <p class="text-lg font-semibold text-color">{{ candidate.fullName }}</p>
          <p class="text-sm text-muted-color">{{ candidate.email }}</p>
          <div class="mt-1 flex flex-wrap gap-1">
            <Tag :value="sourceLabel(candidate.source)" :severity="sourceSeverity(candidate.source)" />
          </div>
        </div>
      </div>

      <!-- Pipeline info -->
      <div class="rounded-lg border border-surface bg-surface-50 p-3 dark:bg-surface-800">
        <p class="mb-2 text-xs font-semibold text-muted-color">Estado en pipeline</p>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p class="text-muted-color">Días en etapa</p>
            <p class="font-medium text-color">{{ application.daysInStage }}</p>
          </div>
          <div>
            <p class="text-muted-color">Días total</p>
            <p class="font-medium text-color">{{ application.totalDays }}</p>
          </div>
          <div v-if="application.score !== null">
            <p class="text-muted-color">Puntaje</p>
            <p class="font-medium text-color">{{ application.score }}</p>
          </div>
          <div>
            <p class="text-muted-color">Desde</p>
            <p class="font-medium text-color">{{ formatDate(application.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Contact info -->
      <div class="rounded-lg border border-surface bg-surface-0 p-3 dark:bg-surface-900">
        <p class="mb-2 text-xs font-semibold text-muted-color">Contacto</p>
        <div class="flex flex-col gap-1 text-sm">
          <div class="flex items-center gap-2">
            <i class="pi pi-envelope text-xs text-muted-color" />
            <span class="text-color">{{ candidate.email }}</span>
          </div>
          <div v-if="candidate.phone" class="flex items-center gap-2">
            <i class="pi pi-phone text-xs text-muted-color" />
            <span class="text-color">{{ candidate.phone }}</span>
          </div>
          <div v-if="candidate.educationLevel" class="flex items-center gap-2">
            <i class="pi pi-graduation-cap text-xs text-muted-color" />
            <span class="text-color">{{ candidate.educationLevel }}</span>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="application.tags.length" class="rounded-lg border border-surface bg-surface-0 p-3 dark:bg-surface-900">
        <p class="mb-2 text-xs font-semibold text-muted-color">Etiquetas</p>
        <div class="flex flex-wrap gap-1">
          <Tag
            v-for="tag in application.tags"
            :key="tag.id"
            :value="tag.name"
            :style="{ backgroundColor: tag.color + '20', color: tag.color }"
          />
        </div>
      </div>

      <!-- Notes -->
      <div v-if="candidate.notes" class="rounded-lg border border-surface bg-surface-0 p-3 dark:bg-surface-900">
        <p class="mb-2 text-xs font-semibold text-muted-color">Notas del candidato</p>
        <p class="whitespace-pre-line text-sm text-color">{{ candidate.notes }}</p>
      </div>

      <!-- Application notes -->
      <div class="rounded-lg border border-surface bg-surface-0 p-3 dark:bg-surface-900">
        <div class="mb-2 flex items-center justify-between">
          <p class="text-xs font-semibold text-muted-color">Notas de la postulación</p>
          <Button icon="pi pi-plus" text size="small" @click="emit('addNote', application.id)" />
        </div>
        <div v-if="loadingNotes" class="py-2 text-center">
          <i class="pi pi-spin pi-spinner text-muted-color" />
        </div>
        <div v-else-if="!notes.length" class="py-2 text-center text-xs text-muted-color">
          Sin notas
        </div>
        <div v-else class="flex flex-col gap-2">
          <div v-for="note in notes" :key="note.id" class="rounded bg-surface-50 p-2 dark:bg-surface-800">
            <p class="text-sm text-color">{{ note.content }}</p>
            <p class="mt-1 text-[11px] text-muted-color">{{ note.authorName }} · {{ formatDate(note.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap gap-2">
        <Button icon="pi pi-history" label="Historial" severity="secondary" size="small" class="flex-1" @click="emit('viewHistory', application.id)" />
        <Button v-if="application.status === 'in_progress'" icon="pi pi-forward" label="Saltar" severity="warn" size="small" class="flex-1" @click="emit('skipStage', application)" />
        <Button v-if="application.status === 'in_progress'" icon="pi pi-check-square" label="Decisión" severity="primary" size="small" class="flex-1" @click="emit('finalDecision', application)" />
      </div>
    </div>
  </Drawer>
</template>
