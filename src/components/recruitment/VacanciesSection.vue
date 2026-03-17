<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { Vacancy, VacancyStatus } from '@/types/recruitment'
import type { ApiError } from '@/types/api'

interface Props {
  jobProfileId: string
  vacancies: Vacancy[]
}
const props = defineProps<Props>()

const emit = defineEmits<{
  updated: []
}>()

const api = useRecruitmentApi()
const toast = useToast()
const creating = ref(false)

function statusLabel(status: VacancyStatus): string {
  const labels: Record<VacancyStatus, string> = {
    draft: 'Borrador',
    published: 'Publicada',
    paused: 'Pausada',
    closed: 'Cerrada',
    filled: 'Cubierta',
  }
  return labels[status]
}

function statusSeverity(status: VacancyStatus): string {
  const map: Record<VacancyStatus, string> = {
    draft: 'secondary',
    published: 'success',
    paused: 'warn',
    closed: 'danger',
    filled: 'info',
  }
  return map[status]
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function createVacancy() {
  creating.value = true
  try {
    await api.createVacancy({ jobProfileId: props.jobProfileId })
    toast.add({ severity: 'success', summary: 'Vacante creada', life: 3000 })
    emit('updated')
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({ severity: 'error', summary: apiError.title ?? 'Error al crear vacante', life: 5000 })
  } finally {
    creating.value = false
  }
}

async function updateStatus(vacancy: Vacancy, newStatus: VacancyStatus) {
  try {
    await api.updateVacancy(vacancy.id, { status: newStatus })
    toast.add({ severity: 'success', summary: `Vacante ${statusLabel(newStatus).toLowerCase()}`, life: 3000 })
    emit('updated')
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({ severity: 'error', summary: apiError.title ?? 'Error al actualizar vacante', life: 5000 })
  }
}

async function deleteVacancy(vacancy: Vacancy) {
  try {
    await api.deleteVacancy(vacancy.id)
    toast.add({ severity: 'success', summary: 'Vacante eliminada', life: 3000 })
    emit('updated')
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({ severity: 'error', summary: apiError.title ?? 'Error al eliminar vacante', life: 5000 })
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-color">Vacantes ({{ vacancies.length }})</h3>
      <Button
        icon="pi pi-plus"
        label="Nueva vacante"
        size="small"
        :loading="creating"
        @click="createVacancy"
      />
    </div>

    <div v-if="vacancies.length === 0" class="rounded-lg border border-surface bg-surface-0 p-6 text-center dark:bg-surface-900">
      <i class="pi pi-megaphone mb-2 text-2xl text-muted-color" />
      <p class="text-sm text-muted-color">No hay vacantes para este perfil</p>
    </div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="vacancy in vacancies"
        :key="vacancy.id"
        class="flex items-center gap-3 rounded-lg border border-surface bg-surface-0 px-4 py-3 dark:bg-surface-900"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm text-muted-color">{{ vacancy.slug }}</p>
          <p class="text-xs text-muted-color">Publicada: {{ formatDate(vacancy.publishedAt) }}</p>
        </div>

        <Tag :value="statusLabel(vacancy.status)" :severity="statusSeverity(vacancy.status)" />

        <div class="flex gap-1">
          <Button
            v-if="vacancy.status === 'draft'"
            v-tooltip.top="'Publicar'"
            icon="pi pi-play"
            text
            severity="success"
            size="small"
            @click="updateStatus(vacancy, 'published')"
          />
          <Button
            v-if="vacancy.status === 'published'"
            v-tooltip.top="'Pausar'"
            icon="pi pi-pause"
            text
            severity="warn"
            size="small"
            @click="updateStatus(vacancy, 'paused')"
          />
          <Button
            v-if="vacancy.status === 'paused'"
            v-tooltip.top="'Reanudar'"
            icon="pi pi-play"
            text
            severity="success"
            size="small"
            @click="updateStatus(vacancy, 'published')"
          />
          <Button
            v-if="vacancy.status === 'published' || vacancy.status === 'paused'"
            v-tooltip.top="'Cerrar'"
            icon="pi pi-times-circle"
            text
            severity="danger"
            size="small"
            @click="updateStatus(vacancy, 'closed')"
          />
          <Button
            v-tooltip.top="'Eliminar'"
            icon="pi pi-trash"
            text
            severity="danger"
            size="small"
            @click="deleteVacancy(vacancy)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
