<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import { apiClient } from '@/api/client'

interface VacancyInfo {
  id: string
  title: string
  companyName: string | null
  questions: { id: string; questionText: string; type: 'yes_no' | 'text'; isRequired: boolean }[]
  requiredDocuments: { id: string; name: string }[]
}

const route = useRoute()
const router = useRouter()
const toast = useToast()

const vacancy = ref<VacancyInfo | null>(null)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const fieldErrors = ref<Record<string, string[]>>({})

const form = ref({
  givenName: '',
  paternalName: '',
  maternalName: '',
  email: '',
  phone: '',
  answers: {} as Record<string, string>,
})
const resumeFile = ref<File | null>(null)
const documentFiles = ref<Record<string, File>>({})

async function loadVacancy() {
  loading.value = true
  try {
    const { data } = await apiClient.get<VacancyInfo>(`/public/vacancies/${route.params.slug}/apply`)
    vacancy.value = data
    // Initialize answers
    for (const q of data.questions) {
      form.value.answers[q.id] = ''
    }
  } catch {
    router.push({ name: 'candidate.jobs' })
  } finally {
    loading.value = false
  }
}

function onResumeSelect(event: { files: File[] }) {
  resumeFile.value = event.files[0] ?? null
}

function onDocumentSelect(docId: string, event: { files: File[] }) {
  const file = event.files[0]
  if (file) documentFiles.value[docId] = file
}

async function submit() {
  if (!vacancy.value) return
  submitting.value = true
  error.value = ''
  fieldErrors.value = {}

  try {
    const formData = new FormData()
    formData.append('givenName', form.value.givenName)
    formData.append('paternalName', form.value.paternalName)
    formData.append('maternalName', form.value.maternalName)
    formData.append('email', form.value.email)
    formData.append('phone', form.value.phone)
    formData.append('answers', JSON.stringify(form.value.answers))

    if (resumeFile.value) {
      formData.append('resume', resumeFile.value)
    }

    for (const [docId, file] of Object.entries(documentFiles.value)) {
      formData.append(`documents[${docId}]`, file)
    }

    await apiClient.post(`/public/vacancies/${vacancy.value.id}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    toast.add({ severity: 'success', summary: 'Aplicación enviada correctamente', life: 5000 })
    router.push({ name: 'candidate.jobs' })
  } catch (e: unknown) {
    const apiError = e as { response?: { status?: number; data?: { errors?: Record<string, string[]>; title?: string } } }
    if (apiError.response?.status === 422 && apiError.response.data?.errors) {
      fieldErrors.value = apiError.response.data.errors
    } else {
      error.value = apiError.response?.data?.title ?? 'Error al enviar la aplicación'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => { void loadVacancy() })
</script>

<template>
  <CandidateLayout>
    <div v-if="loading" class="py-16 text-center">
      <i class="pi pi-spin pi-spinner text-3xl text-muted-color" />
    </div>

    <template v-else-if="vacancy">
      <div class="mb-4">
        <Button icon="pi pi-arrow-left" label="Ver vacante" text size="small" @click="router.push({ name: 'candidate.job-detail', params: { slug: route.params.slug } })" />
      </div>

      <div class="mx-auto max-w-2xl rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6 shadow-sm">
        <h1 class="mb-1 text-2xl font-bold text-color">Aplicar a: {{ vacancy.title }}</h1>
        <p v-if="vacancy.companyName" class="mb-6 text-muted-color">{{ vacancy.companyName }}</p>

        <form class="flex flex-col gap-5" @submit.prevent="submit">
          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

          <div class="grid gap-4 sm:grid-cols-3">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">Nombre *</label>
              <InputText v-model="form.givenName" required :invalid="!!fieldErrors['givenName']" />
              <small v-if="fieldErrors['givenName']" class="text-red-500">{{ fieldErrors['givenName'][0] }}</small>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">Apellido paterno *</label>
              <InputText v-model="form.paternalName" required :invalid="!!fieldErrors['paternalName']" />
              <small v-if="fieldErrors['paternalName']" class="text-red-500">{{ fieldErrors['paternalName'][0] }}</small>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">Apellido materno</label>
              <InputText v-model="form.maternalName" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">Correo electrónico *</label>
              <InputText v-model="form.email" type="email" required :invalid="!!fieldErrors['email']" />
              <small v-if="fieldErrors['email']" class="text-red-500">{{ fieldErrors['email'][0] }}</small>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">Teléfono</label>
              <InputText v-model="form.phone" type="tel" />
            </div>
          </div>

          <!-- CV -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-color">Currículum (PDF)</label>
            <FileUpload mode="basic" accept=".pdf,.doc,.docx" :max-file-size="10000000" choose-label="Seleccionar CV" :auto="false" @select="onResumeSelect" />
          </div>

          <!-- Dynamic questions -->
          <template v-if="vacancy.questions.length">
            <h3 class="text-lg font-semibold text-color">Preguntas</h3>
            <div v-for="q in vacancy.questions" :key="q.id" class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">
                {{ q.questionText }}
                <span v-if="q.isRequired" class="text-red-500">*</span>
              </label>
              <InputText v-if="q.type === 'yes_no'" v-model="form.answers[q.id]" placeholder="Sí / No" :required="q.isRequired" />
              <Textarea v-else v-model="form.answers[q.id]" rows="3" :required="q.isRequired" />
            </div>
          </template>

          <!-- Required documents -->
          <template v-if="vacancy.requiredDocuments.length">
            <h3 class="text-lg font-semibold text-color">Documentos Requeridos</h3>
            <div v-for="doc in vacancy.requiredDocuments" :key="doc.id" class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">{{ doc.name }}</label>
              <FileUpload mode="basic" accept=".pdf,.jpg,.jpeg,.png" :max-file-size="10000000" :choose-label="`Seleccionar ${doc.name}`" :auto="false" @select="(e) => onDocumentSelect(doc.id, e)" />
            </div>
          </template>

          <Button type="submit" label="Enviar aplicación" icon="pi pi-send" :loading="submitting" class="mt-2" />
        </form>
      </div>
    </template>
  </CandidateLayout>
</template>
