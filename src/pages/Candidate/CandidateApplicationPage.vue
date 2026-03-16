<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Timeline from 'primevue/timeline'
import FileUpload from 'primevue/fileupload'
import ProgressBar from 'primevue/progressbar'
import { useToast } from 'primevue/usetoast'
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import { apiClient } from '@/api/client'

interface ApplicationDetail {
  id: string
  vacancyTitle: string
  companyName: string | null
  currentStageName: string
  status: 'in_progress' | 'hired' | 'rejected' | 'withdrawn'
  appliedAt: string
  history: { stageName: string; date: string; reason: string | null }[]
  pendingDocuments: { id: string; name: string }[]
  uploadedDocuments: { id: string; name: string; uploadedAt: string }[]
}

const route = useRoute()
const router = useRouter()
const toast = useToast()

const application = ref<ApplicationDetail | null>(null)
const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)

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
    const { data } = await apiClient.get<ApplicationDetail>(`/candidate/applications/${route.params.id}`)
    application.value = data
  } catch {
    router.push({ name: 'candidate.dashboard' })
  } finally {
    loading.value = false
  }
}

async function uploadDocument(docId: string, event: { files: File[] }) {
  const file = event.files[0]
  if (!file || !application.value) return

  uploading.value = true
  uploadProgress.value = 0
  const formData = new FormData()
  formData.append('file', file)

  try {
    await apiClient.post(
      `/candidate/applications/${application.value.id}/documents/${docId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) uploadProgress.value = Math.round((e.loaded / e.total) * 100)
        },
      },
    )
    toast.add({ severity: 'success', summary: 'Documento subido', life: 3000 })
    void load()
  } catch {
    toast.add({ severity: 'error', summary: 'Error al subir documento', life: 5000 })
  } finally {
    uploading.value = false
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => { void load() })
</script>

<template>
  <CandidateLayout>
    <div v-if="loading" class="py-16 text-center">
      <i class="pi pi-spin pi-spinner text-3xl text-muted-color" />
    </div>

    <template v-else-if="application">
      <div class="mb-4">
        <Button icon="pi pi-arrow-left" label="Mis Aplicaciones" text size="small" @click="router.push({ name: 'candidate.dashboard' })" />
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Main info -->
        <div class="lg:col-span-2">
          <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6 shadow-sm">
            <div class="mb-4 flex items-start justify-between">
              <div>
                <h1 class="text-2xl font-bold text-color">{{ application.vacancyTitle }}</h1>
                <p v-if="application.companyName" class="text-muted-color">{{ application.companyName }}</p>
              </div>
              <Tag :value="statusLabels[application.status]" :severity="statusSeverity[application.status]" />
            </div>

            <div class="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-surface-50 dark:bg-surface-800 p-4">
              <div>
                <p class="text-xs text-muted-color">Etapa actual</p>
                <p class="font-medium text-color">{{ application.currentStageName }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-color">Fecha de aplicación</p>
                <p class="font-medium text-color">{{ formatDate(application.appliedAt) }}</p>
              </div>
            </div>

            <!-- Timeline -->
            <h3 class="mb-4 text-lg font-semibold text-color">Historial</h3>
            <Timeline :value="application.history" align="left">
              <template #content="{ item }">
                <div class="mb-2">
                  <p class="font-medium text-color">{{ item.stageName }}</p>
                  <p v-if="item.reason" class="text-sm text-muted-color">{{ item.reason }}</p>
                  <p class="text-xs text-muted-color">{{ formatDate(item.date) }}</p>
                </div>
              </template>
            </Timeline>
          </div>
        </div>

        <!-- Documents sidebar -->
        <div>
          <!-- Pending documents -->
          <div v-if="application.pendingDocuments.length" class="mb-4 rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-4 shadow-sm">
            <h3 class="mb-3 text-lg font-semibold text-color">Documentos Pendientes</h3>
            <div class="flex flex-col gap-3">
              <div v-for="doc in application.pendingDocuments" :key="doc.id" class="rounded-lg border border-surface p-3">
                <p class="mb-2 text-sm font-medium text-color">{{ doc.name }}</p>
                <FileUpload
                  mode="basic"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :max-file-size="10000000"
                  choose-label="Subir"
                  :auto="false"
                  @select="(e) => uploadDocument(doc.id, e)"
                />
              </div>
            </div>
            <ProgressBar v-if="uploading" :value="uploadProgress" class="mt-3" />
          </div>

          <!-- Uploaded documents -->
          <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-4 shadow-sm">
            <h3 class="mb-3 text-lg font-semibold text-color">Documentos Subidos</h3>
            <div v-if="application.uploadedDocuments.length" class="flex flex-col gap-2">
              <div v-for="doc in application.uploadedDocuments" :key="doc.id" class="flex items-center gap-2 rounded-lg bg-surface-50 dark:bg-surface-800 p-2">
                <i class="pi pi-file text-muted-color" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-color">{{ doc.name }}</p>
                  <p class="text-xs text-muted-color">{{ formatDate(doc.uploadedAt) }}</p>
                </div>
                <i class="pi pi-check-circle text-green-500" />
              </div>
            </div>
            <p v-else class="text-sm text-muted-color">Sin documentos subidos</p>
          </div>
        </div>
      </div>
    </template>
  </CandidateLayout>
</template>
