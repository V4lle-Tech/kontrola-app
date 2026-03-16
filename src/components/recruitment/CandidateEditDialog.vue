<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { Candidate, CandidateListItem, CandidateSource, Tag } from '@/types/recruitment'
import type { ApiError } from '@/types/api'

interface Props {
  candidate: Candidate
  listItem: CandidateListItem
}
const props = defineProps<Props>()

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  updated: [candidate: CandidateListItem]
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
  source: 'manual' as CandidateSource,
  educationLevel: '',
  tagIds: [] as string[],
})
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const saving = ref(false)
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

watch(visible, (show) => {
  if (show) {
    form.value = {
      givenName: props.candidate.givenName,
      paternalName: props.candidate.paternalName,
      maternalName: props.candidate.maternalName,
      email: props.candidate.email,
      phone: props.candidate.phone ?? '',
      notes: props.candidate.notes ?? '',
      source: props.candidate.source,
      educationLevel: props.candidate.educationLevel ?? '',
      tagIds: props.candidate.tags?.map((t) => t.id) ?? [],
    }
    fieldErrors.value = {}
    generalError.value = ''
    void loadTags()
  }
})

async function loadTags() {
  try {
    availableTags.value = await api.getTags('candidate')
  } catch {
    // Tags unavailable
  }
}

async function submit() {
  fieldErrors.value = {}
  generalError.value = ''
  saving.value = true
  try {
    const updated = await api.updateCandidate(props.candidate.id, {
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
    visible.value = false
    toast.add({ severity: 'success', summary: 'Candidato actualizado', life: 3000 })
    const listItem: CandidateListItem = {
      ...updated,
      jobProfilesCount: props.listItem.jobProfilesCount,
      applicationsCount: props.listItem.applicationsCount,
      documentsCount: props.listItem.documentsCount,
    }
    emit('updated', listItem)
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al actualizar candidato'
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Editar Candidato" class="w-full max-w-2xl">
    <div class="flex flex-col gap-4">
      <Message v-if="generalError" severity="error" :closable="false">{{ generalError }}</Message>
      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-color">Nombre(s)</label>
            <InputText v-model="form.givenName" :invalid="!!fieldErrors.givenName" />
            <small v-if="fieldErrors.givenName" class="p-error">{{ fieldErrors.givenName[0] }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-color">Apellido paterno</label>
            <InputText v-model="form.paternalName" :invalid="!!fieldErrors.paternalName" />
            <small v-if="fieldErrors.paternalName" class="p-error">{{ fieldErrors.paternalName[0] }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-color">Apellido materno</label>
            <InputText v-model="form.maternalName" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-color">Correo electrónico</label>
            <InputText v-model="form.email" type="email" :invalid="!!fieldErrors.email" />
            <small v-if="fieldErrors.email" class="p-error">{{ fieldErrors.email[0] }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-color">Teléfono</label>
            <InputText v-model="form.phone" type="tel" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-color">Fuente</label>
            <Select v-model="form.source" :options="sourceOptions" option-label="label" option-value="value" class="w-full" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-color">Nivel educativo</label>
            <Select v-model="form.educationLevel" :options="educationOptions" option-label="label" option-value="value" placeholder="Seleccionar" show-clear class="w-full" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-color">Etiquetas</label>
            <MultiSelect v-model="form.tagIds" :options="availableTags" option-label="name" option-value="id" placeholder="Seleccionar" :max-selected-labels="3" class="w-full" />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Notas</label>
          <Textarea v-model="form.notes" rows="3" auto-resize />
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" text @click="visible = false" />
          <Button type="submit" label="Guardar cambios" :loading="saving" />
        </div>
      </form>
    </div>
  </Dialog>
</template>
