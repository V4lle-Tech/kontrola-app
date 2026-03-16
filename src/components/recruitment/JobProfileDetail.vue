<script setup lang="ts">
import { ref, watch } from 'vue'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { JobProfile, JobProfileStatus } from '@/types/recruitment'
import type { ApiError } from '@/types/api'

interface Props {
  profile: JobProfile
}
const props = defineProps<Props>()

const emit = defineEmits<{
  back: []
  updated: [profile: JobProfile]
  deleted: []
}>()

const api = useRecruitmentApi()
const toast = useToast()
const detail = ref<JobProfile>(props.profile)
const loading = ref(false)

watch(
  () => props.profile,
  (newProfile) => {
    detail.value = newProfile
    void loadDetail()
  },
)

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await api.getJobProfile(props.profile.id)
  } catch {
    // Keep summary data if detail fails
  } finally {
    loading.value = false
  }
}

async function deleteProfile() {
  try {
    await api.deleteJobProfile(detail.value.id)
    emit('deleted')
    toast.add({ severity: 'success', summary: 'Perfil eliminado', life: 3000 })
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({
      severity: 'error',
      summary: apiError.title ?? 'Error al eliminar perfil',
      life: 5000,
    })
  }
}

function statusLabel(status: JobProfileStatus): string {
  const labels: Record<JobProfileStatus, string> = {
    draft: 'Borrador',
    active: 'Activo',
    archived: 'Archivado',
  }
  return labels[status]
}

function statusSeverity(status: JobProfileStatus): string {
  const map: Record<JobProfileStatus, string> = {
    draft: 'warn',
    active: 'success',
    archived: 'secondary',
  }
  return map[status]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function employmentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    full_time: 'Tiempo completo',
    part_time: 'Medio tiempo',
    contract: 'Contrato',
    temporary: 'Temporal',
    internship: 'Prácticas',
  }
  return labels[type] ?? type
}

void loadDetail()
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center gap-2 border-b border-surface px-4 py-3">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        severity="secondary"
        class="lg:hidden"
        @click="emit('back')"
      />
      <h2 class="flex-1 truncate text-lg font-semibold text-color">{{ detail.title }}</h2>
      <Button
        icon="pi pi-trash"
        severity="danger"
        text
        size="small"
        @click="deleteProfile"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="loading" class="flex items-center justify-center py-8">
        <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
      </div>

      <div v-else class="flex flex-col gap-4">
        <!-- Info card -->
        <div class="rounded-xl border border-surface bg-surface-0 p-6 dark:bg-surface-900">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <i class="pi pi-briefcase text-xl text-primary" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xl font-semibold text-color">{{ detail.title }}</p>
              <div class="mt-1 flex flex-wrap gap-2">
                <Tag :value="statusLabel(detail.status)" :severity="statusSeverity(detail.status)" />
                <Tag :value="employmentTypeLabel(detail.employmentType)" severity="info" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div v-if="detail.salaryMin || detail.salaryMax">
              <p class="mb-1 text-muted-color">Rango salarial</p>
              <p class="text-color">
                {{ detail.salaryMin ? `$${detail.salaryMin.toLocaleString('es-MX')}` : '—' }}
                –
                {{ detail.salaryMax ? `$${detail.salaryMax.toLocaleString('es-MX')}` : '—' }}
              </p>
            </div>
            <div>
              <p class="mb-1 text-muted-color">Fecha de creación</p>
              <p class="text-color">{{ formatDate(detail.createdAt) }}</p>
            </div>
            <div>
              <p class="mb-1 text-muted-color">Vacantes</p>
              <p class="text-color">{{ detail.vacancies?.length ?? 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="detail.description" class="rounded-xl border border-surface bg-surface-0 p-6 dark:bg-surface-900">
          <h3 class="mb-3 text-base font-semibold text-color">Descripción</h3>
          <p class="whitespace-pre-line text-sm text-color">{{ detail.description }}</p>
        </div>

        <!-- Requirements -->
        <div v-if="detail.requirements?.length" class="rounded-xl border border-surface bg-surface-0 p-6 dark:bg-surface-900">
          <h3 class="mb-3 text-base font-semibold text-color">Requisitos</h3>
          <ul class="flex flex-col gap-1">
            <li v-for="(req, idx) in detail.requirements" :key="idx" class="flex items-start gap-2 text-sm text-color">
              <i class="pi pi-check-circle mt-0.5 text-xs text-primary" />
              {{ req }}
            </li>
          </ul>
        </div>

        <!-- Functions -->
        <div v-if="detail.functions?.length" class="rounded-xl border border-surface bg-surface-0 p-6 dark:bg-surface-900">
          <h3 class="mb-3 text-base font-semibold text-color">Funciones</h3>
          <ul class="flex flex-col gap-1">
            <li v-for="(fn, idx) in detail.functions" :key="idx" class="flex items-start gap-2 text-sm text-color">
              <i class="pi pi-arrow-right mt-0.5 text-xs text-muted-color" />
              {{ fn }}
            </li>
          </ul>
        </div>

        <!-- Benefits -->
        <div v-if="detail.benefits?.length" class="rounded-xl border border-surface bg-surface-0 p-6 dark:bg-surface-900">
          <h3 class="mb-3 text-base font-semibold text-color">Beneficios</h3>
          <ul class="flex flex-col gap-1">
            <li v-for="(benefit, idx) in detail.benefits" :key="idx" class="flex items-start gap-2 text-sm text-color">
              <i class="pi pi-star mt-0.5 text-xs text-primary" />
              {{ benefit }}
            </li>
          </ul>
        </div>

        <!-- Tags -->
        <div v-if="detail.tags?.length" class="rounded-xl border border-surface bg-surface-0 p-6 dark:bg-surface-900">
          <h3 class="mb-3 text-base font-semibold text-color">Etiquetas</h3>
          <div class="flex flex-wrap gap-1">
            <Tag
              v-for="tag in detail.tags"
              :key="tag.id"
              :value="tag.name"
              :style="{ backgroundColor: tag.color + '20', color: tag.color }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
