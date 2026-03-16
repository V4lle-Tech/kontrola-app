<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import FileUpload from 'primevue/fileupload'
import ProgressBar from 'primevue/progressbar'
import { useToast } from 'primevue/usetoast'
import { useDocumentsApi } from '@/composables/api/useDocumentsApi'
import type { DocumentType } from '@/types/document'

interface Props {
  visible: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  uploaded: []
}>()

const api = useDocumentsApi()
const toast = useToast()
const documentTypes = ref<DocumentType[]>([])
const selectedType = ref<string>('')
const candidateId = ref('')
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const progress = ref(0)

async function loadTypes() {
  documentTypes.value = await api.getDocumentTypes()
}

function onFileSelect(event: { files: File[] }) {
  selectedFile.value = event.files[0] ?? null
}

async function upload() {
  if (!selectedFile.value || !selectedType.value || !candidateId.value) {
    toast.add({ severity: 'warn', summary: 'Completa todos los campos', life: 3000 })
    return
  }
  uploading.value = true
  progress.value = 0
  try {
    await api.uploadDocument(selectedFile.value, selectedType.value, candidateId.value, (p) => { progress.value = p })
    toast.add({ severity: 'success', summary: 'Documento subido', life: 3000 })
    emit('update:visible', false)
    emit('uploaded')
  } catch {
    toast.add({ severity: 'error', summary: 'Error al subir documento', life: 5000 })
  } finally { uploading.value = false }
}

function cancel() {
  selectedFile.value = null
  progress.value = 0
  emit('update:visible', false)
}

onMounted(() => { void loadTypes() })
</script>

<template>
  <Dialog :visible="visible" header="Subir Documento" modal :style="{ width: '30rem' }" @update:visible="cancel">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">ID del Candidato</label>
        <input v-model="candidateId" class="rounded border border-surface bg-surface-0 px-3 py-2 text-sm text-color dark:bg-surface-900" placeholder="UUID del candidato" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Tipo de Documento</label>
        <Select v-model="selectedType" :options="documentTypes" option-label="name" option-value="id" placeholder="Seleccionar tipo" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Archivo</label>
        <FileUpload mode="basic" :auto="false" choose-label="Seleccionar archivo" @select="onFileSelect" />
      </div>
      <ProgressBar v-if="uploading" :value="progress" :show-value="true" />
    </div>
    <template #footer>
      <Button label="Cancelar" severity="secondary" text @click="cancel" />
      <Button label="Subir" icon="pi pi-upload" :loading="uploading" :disabled="!selectedFile" @click="upload" />
    </template>
  </Dialog>
</template>
