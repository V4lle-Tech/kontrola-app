<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { CandidateListItem, Tag } from '@/types/recruitment'
import type { ApiError } from '@/types/api'

const emit = defineEmits<{
  created: [candidate: CandidateListItem]
  cancel: []
}>()

const api = useRecruitmentApi()
const toast = useToast()

const form = ref({
  givenName: '',
  paternalName: '',
  maternalName: '',
  email: '',
  phone: '',
  notes: '',
  source: 'manual' as const,
  educationLevel: '',
  tagIds: [] as string[],
})
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const loading = ref(false)
const availableTags = ref<Tag[]>([])

const sourceOptions = [
  { label: 'Manual', value: 'manual' },
  { label: 'Portal', value: 'portal' },
  { label: 'Referido', value: 'referral' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Indeed', value: 'indeed' },
  { label: 'Otro', value: 'other' },
]

const educationOptions = [
  { label: 'Secundaria', value: 'secundaria' },
  { label: 'Preparatoria', value: 'preparatoria' },
  { label: 'Licenciatura', value: 'licenciatura' },
  { label: 'Maestría', value: 'maestria' },
  { label: 'Doctorado', value: 'doctorado' },
  { label: 'Otro', value: 'otro' },
]

onMounted(async () => {
  try {
    availableTags.value = await api.getTags('candidate')
  } catch {
    // Tags will be empty if fetch fails
  }
})

async function submit() {
  fieldErrors.value = {}
  generalError.value = ''
  loading.value = true

  try {
    const candidate = await api.createCandidate({
      givenName: form.value.givenName,
      paternalName: form.value.paternalName,
      maternalName: form.value.maternalName || undefined,
      email: form.value.email,
      phone: form.value.phone || undefined,
      notes: form.value.notes || undefined,
      source: form.value.source,
      educationLevel: form.value.educationLevel || undefined,
      tagIds: form.value.tagIds.length > 0 ? form.value.tagIds : undefined,
    })
    toast.add({ severity: 'success', summary: 'Candidato creado', life: 3000 })
    // Map Candidate to CandidateListItem shape for parent
    const listItem: CandidateListItem = {
      ...candidate,
      jobProfilesCount: 0,
      applicationsCount: 0,
      documentsCount: 0,
    }
    emit('created', listItem)
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al crear candidato'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <Message v-if="generalError" severity="error" :closable="false">
      {{ generalError }}
    </Message>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-1">
          <label for="givenName" class="text-sm font-medium text-color">Nombre(s)</label>
          <InputText
            id="givenName"
            v-model="form.givenName"
            :invalid="!!fieldErrors.givenName"
            autocomplete="given-name"
          />
          <small v-if="fieldErrors.givenName" class="p-error">{{ fieldErrors.givenName[0] }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="paternalName" class="text-sm font-medium text-color">Apellido paterno</label>
          <InputText
            id="paternalName"
            v-model="form.paternalName"
            :invalid="!!fieldErrors.paternalName"
            autocomplete="family-name"
          />
          <small v-if="fieldErrors.paternalName" class="p-error">{{ fieldErrors.paternalName[0] }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="maternalName" class="text-sm font-medium text-color">Apellido materno</label>
          <InputText
            id="maternalName"
            v-model="form.maternalName"
            autocomplete="additional-name"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium text-color">Correo electrónico</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            :invalid="!!fieldErrors.email"
            autocomplete="email"
          />
          <small v-if="fieldErrors.email" class="p-error">{{ fieldErrors.email[0] }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="phone" class="text-sm font-medium text-color">Teléfono</label>
          <InputText
            id="phone"
            v-model="form.phone"
            type="tel"
            autocomplete="tel"
          />
          <small v-if="fieldErrors.phone" class="p-error">{{ fieldErrors.phone[0] }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="source" class="text-sm font-medium text-color">Fuente</label>
          <Select
            id="source"
            v-model="form.source"
            :options="sourceOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="educationLevel" class="text-sm font-medium text-color">Nivel educativo</label>
          <Select
            id="educationLevel"
            v-model="form.educationLevel"
            :options="educationOptions"
            option-label="label"
            option-value="value"
            placeholder="Seleccionar"
            show-clear
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="tags" class="text-sm font-medium text-color">Etiquetas</label>
          <MultiSelect
            id="tags"
            v-model="form.tagIds"
            :options="availableTags"
            option-label="name"
            option-value="id"
            placeholder="Seleccionar etiquetas"
            :max-selected-labels="3"
            class="w-full"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="notes" class="text-sm font-medium text-color">Notas</label>
        <Textarea
          id="notes"
          v-model="form.notes"
          rows="3"
          auto-resize
        />
      </div>

      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="emit('cancel')" />
        <Button type="submit" label="Crear Candidato" :loading="loading" />
      </div>
    </form>
  </div>
</template>
