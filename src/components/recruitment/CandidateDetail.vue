<script setup lang="ts">
import { ref, watch } from 'vue'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import { useToast } from 'primevue/usetoast'
import CandidateEditDialog from './CandidateEditDialog.vue'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { Candidate, CandidateListItem, Application } from '@/types/recruitment'
import type { ApiError } from '@/types/api'
import { sourceLabel, sourceSeverity } from '@/utils/candidateLabels'
import { usePermissions } from '@/composables/usePermissions'

interface Props {
  candidate: CandidateListItem
}
const props = defineProps<Props>()

const emit = defineEmits<{
  back: []
  updated: [candidate: CandidateListItem]
  deleted: []
}>()

const api = useRecruitmentApi()
const toast = useToast()
const { can } = usePermissions()
const detail = ref<Candidate | null>(null)
const applications = ref<Application[]>([])
const loading = ref(false)
const loadingApplications = ref(false)
const activeTab = ref('0')
const showEditDialog = ref(false)

watch(
  () => props.candidate,
  () => {
    activeTab.value = '0'
    void loadDetail()
  },
)

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await api.getCandidate(props.candidate.id)
  } catch {
    // Keep summary data if detail fails
  } finally {
    loading.value = false
  }
}

async function loadApplications() {
  if (applications.value.length > 0) return
  loadingApplications.value = true
  try {
    applications.value = await api.getCandidateApplications(props.candidate.id)
  } catch {
    // Applications unavailable
  } finally {
    loadingApplications.value = false
  }
}

async function deleteCandidate() {
  try {
    await api.deleteCandidate(props.candidate.id)
    emit('deleted')
    toast.add({ severity: 'success', summary: 'Candidato eliminado', life: 3000 })
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({ severity: 'error', summary: apiError.title ?? 'Error al eliminar candidato', life: 5000 })
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

function onTabChange(value: string | number) {
  if (String(value) === '1') void loadApplications()
}

function onUpdated(candidate: CandidateListItem) {
  detail.value = candidate
  emit('updated', candidate)
}

void loadDetail()
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center gap-2 border-b border-surface px-4 py-3">
      <Button icon="pi pi-arrow-left" text rounded severity="secondary" class="lg:hidden" @click="emit('back')" />
      <h2 class="flex-1 truncate text-lg font-semibold text-color">
        {{ detail?.fullName ?? candidate.fullName }}
      </h2>
      <Button v-if="can('candidates.update')" icon="pi pi-pencil" severity="secondary" text size="small" @click="showEditDialog = true" />
      <Button v-if="can('candidates.delete')" icon="pi pi-trash" severity="danger" text size="small" @click="deleteCandidate" />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="loading" class="flex items-center justify-center py-8">
        <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
      </div>

      <div v-else-if="detail" class="flex flex-col gap-4">
        <!-- Profile card -->
        <div class="rounded-xl border border-surface bg-surface-0 p-6 dark:bg-surface-900">
          <div class="mb-6 flex items-center gap-4">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <i class="pi pi-user text-2xl text-primary" />
            </div>
            <div class="min-w-0">
              <p class="text-xl font-semibold text-color">{{ detail.fullName }}</p>
              <p class="text-muted-color">{{ detail.email }}</p>
              <div class="mt-1 flex flex-wrap gap-1">
                <Tag :value="sourceLabel(detail.source)" :severity="sourceSeverity(detail.source)" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p class="mb-1 text-muted-color">Nombre(s)</p>
              <p class="text-color">{{ detail.givenName }}</p>
            </div>
            <div>
              <p class="mb-1 text-muted-color">Apellido paterno</p>
              <p class="text-color">{{ detail.paternalName }}</p>
            </div>
            <div>
              <p class="mb-1 text-muted-color">Apellido materno</p>
              <p class="text-color">{{ detail.maternalName ?? '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-muted-color">Correo electrónico</p>
              <p class="text-color">{{ detail.email }}</p>
            </div>
            <div>
              <p class="mb-1 text-muted-color">Teléfono</p>
              <p class="text-color">{{ detail.phone ?? '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-muted-color">Nivel educativo</p>
              <p class="text-color">{{ detail.educationLevel ?? '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-muted-color">Fecha de registro</p>
              <p class="text-color">{{ formatDate(detail.createdAt) }}</p>
            </div>
          </div>

          <div v-if="detail.tags?.length" class="mt-4">
            <p class="mb-2 text-sm text-muted-color">Etiquetas</p>
            <div class="flex flex-wrap gap-1">
              <Tag v-for="tag in detail.tags" :key="tag.id" :value="tag.name" :style="{ backgroundColor: tag.color + '20', color: tag.color }" />
            </div>
          </div>

          <div v-if="detail.notes" class="mt-4">
            <p class="mb-2 text-sm text-muted-color">Notas</p>
            <p class="whitespace-pre-line text-sm text-color">{{ detail.notes }}</p>
          </div>
        </div>

        <!-- Tabs -->
        <Tabs :value="activeTab" @update:value="onTabChange">
          <TabList>
            <Tab value="0">
              <i class="pi pi-briefcase mr-2" />
              Postulaciones
              <span class="ml-1 text-xs text-muted-color">({{ candidate.applicationsCount }})</span>
            </Tab>
            <Tab value="1">
              <i class="pi pi-file mr-2" />
              Documentos
              <span class="ml-1 text-xs text-muted-color">({{ candidate.documentsCount }})</span>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel value="0">
              <div v-if="loadingApplications" class="flex items-center justify-center py-6">
                <i class="pi pi-spin pi-spinner text-muted-color" />
              </div>
              <div v-else-if="!applications.length" class="py-6 text-center text-sm text-muted-color">
                <i class="pi pi-briefcase mb-2 text-2xl" />
                <p>No hay postulaciones registradas</p>
              </div>
              <div v-else class="flex flex-col gap-2">
                <div
                  v-for="app in applications"
                  :key="app.id"
                  class="flex items-center gap-3 rounded-lg bg-surface-50 px-4 py-3 dark:bg-surface-800"
                >
                  <i class="pi pi-briefcase text-primary" />
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-color">{{ app.vacancy?.jobProfile?.title ?? 'Vacante' }}</p>
                    <p class="text-xs text-muted-color">{{ app.currentStage?.name ?? 'Sin etapa' }} · {{ app.daysInStage }} días</p>
                  </div>
                  <Tag
                    :value="app.status === 'in_progress' ? 'En proceso' : app.status === 'hired' ? 'Contratado' : app.status === 'rejected' ? 'Rechazado' : 'Retirado'"
                    :severity="app.status === 'hired' ? 'success' : app.status === 'rejected' ? 'danger' : app.status === 'withdrawn' ? 'warn' : 'info'"
                  />
                </div>
              </div>
            </TabPanel>

            <TabPanel value="1">
              <div class="py-6 text-center text-sm text-muted-color">
                <i class="pi pi-file mb-2 text-2xl" />
                <p>Documentos disponibles en Fase 5</p>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>

    <CandidateEditDialog
      v-if="detail"
      v-model:visible="showEditDialog"
      :candidate="detail"
      :list-item="candidate"
      @updated="onUpdated"
    />
  </div>
</template>
