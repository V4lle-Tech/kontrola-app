<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import { apiClient } from '@/api/client'

interface CandidateApplication {
  id: string
  vacancyTitle: string
  companyName: string | null
  currentStageName: string
  status: 'in_progress' | 'hired' | 'rejected' | 'withdrawn'
  appliedAt: string
  pendingDocuments: number
}

const router = useRouter()
const applications = ref<CandidateApplication[]>([])
const loading = ref(false)

const statusLabels: Record<string, string> = {
  in_progress: 'En proceso',
  hired: 'Contratado',
  rejected: 'Rechazado',
  withdrawn: 'Retirado',
}

const statusSeverity: Record<string, string> = {
  in_progress: 'info',
  hired: 'success',
  rejected: 'danger',
  withdrawn: 'secondary',
}

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<CandidateApplication[]>('/candidate/applications')
    applications.value = data
  } finally {
    loading.value = false
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

function viewApplication(app: CandidateApplication) {
  router.push({ name: 'candidate.application', params: { id: app.id } })
}

function onRowClick(e: { data: CandidateApplication }) {
  viewApplication(e.data)
}

onMounted(() => { void load() })
</script>

<template>
  <CandidateLayout>
    <h1 class="mb-6 text-2xl font-bold text-color">Mis Aplicaciones</h1>

    <DataTable :value="applications" :loading="loading" row-hover @row-click="onRowClick">
      <Column field="vacancyTitle" header="Vacante" />
      <Column field="companyName" header="Empresa" />
      <Column field="currentStageName" header="Etapa" />
      <Column header="Estado" style="width: 140px">
        <template #body="{ data }">
          <Tag :value="statusLabels[data.status]" :severity="statusSeverity[data.status]" />
        </template>
      </Column>
      <Column header="Documentos" style="width: 130px">
        <template #body="{ data }">
          <Tag v-if="data.pendingDocuments > 0" :value="`${data.pendingDocuments} pendientes`" severity="warn" />
          <span v-else class="text-sm text-muted-color">Completo</span>
        </template>
      </Column>
      <Column header="Aplicado" style="width: 140px">
        <template #body="{ data }">
          <span class="text-sm text-muted-color">{{ formatDate(data.appliedAt) }}</span>
        </template>
      </Column>
      <Column style="width: 60px">
        <template #body="{ data }">
          <Button icon="pi pi-eye" text size="small" @click.stop="viewApplication(data)" />
        </template>
      </Column>
      <template #empty>
        <div class="py-12 text-center">
          <i class="pi pi-inbox mb-4 text-5xl text-muted-color" />
          <p class="text-muted-color">No tienes aplicaciones aún.</p>
          <router-link :to="{ name: 'candidate.jobs' }">
            <Button label="Ver vacantes" severity="secondary" class="mt-4" />
          </router-link>
        </div>
      </template>
    </DataTable>
  </CandidateLayout>
</template>
