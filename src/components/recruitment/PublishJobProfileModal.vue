<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'
import { useSyndicationApi } from '@/composables/api/useSyndicationApi'
import type { JobBoard, SocialTemplate, SyndicationProvider } from '@/types/syndication'

interface Props {
  visible: boolean
  vacancyId: string
  vacancyTitle: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  published: []
}>()

const api = useSyndicationApi()
const toast = useToast()
const boards = ref<JobBoard[]>([])
const templates = ref<SocialTemplate[]>([])
const selectedProviders = ref<SyndicationProvider[]>([])
const selectedTemplate = ref<string | undefined>(undefined)
const scheduledAt = ref<Date | undefined>(undefined)
const publishing = ref(false)
const loadingBoards = ref(false)

async function loadOptions() {
  loadingBoards.value = true
  try {
    const [b, t] = await Promise.all([api.getJobBoards(), api.getTemplates()])
    boards.value = b.filter(board => board.isConnected)
    templates.value = t
  } finally { loadingBoards.value = false }
}

async function publish() {
  if (selectedProviders.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Selecciona al menos un portal', life: 3000 })
    return
  }
  publishing.value = true
  try {
    await api.publishVacancy({
      vacancyId: props.vacancyId,
      providers: selectedProviders.value,
      templateId: selectedTemplate.value,
      scheduledAt: scheduledAt.value?.toISOString(),
    })
    toast.add({ severity: 'success', summary: 'Publicación enviada', life: 3000 })
    emit('update:visible', false)
    emit('published')
  } catch {
    toast.add({ severity: 'error', summary: 'Error al publicar', life: 5000 })
  } finally { publishing.value = false }
}

function close() {
  emit('update:visible', false)
}

onMounted(() => { void loadOptions() })
</script>

<template>
  <Dialog :visible="visible" header="Publicar Vacante" modal :style="{ width: '30rem' }" @update:visible="close">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-muted-color">Publicar <strong>{{ vacancyTitle }}</strong> en portales de empleo</p>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-color">Portales disponibles</label>
        <div v-if="loadingBoards" class="text-sm text-muted-color">
          <i class="pi pi-spin pi-spinner mr-1" /> Cargando portales...
        </div>
        <div v-else-if="boards.length === 0" class="text-sm text-muted-color">
          No hay portales conectados. Configúralos primero.
        </div>
        <div v-else class="flex flex-col gap-2">
          <div v-for="board in boards" :key="board.id" class="flex items-center gap-2">
            <Checkbox v-model="selectedProviders" :input-id="board.id" :value="board.provider" />
            <label :for="board.id" class="text-sm text-color">{{ board.name }}</label>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Template social (opcional)</label>
        <Select
          v-model="selectedTemplate"
          :options="templates"
          option-label="name"
          option-value="id"
          placeholder="Sin template"
          show-clear
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Programar publicación (opcional)</label>
        <DatePicker v-model="scheduledAt" show-time hour-format="24" placeholder="Publicar inmediatamente" />
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" severity="secondary" text @click="close" />
      <Button
        label="Publicar"
        icon="pi pi-send"
        :loading="publishing"
        :disabled="selectedProviders.length === 0"
        @click="publish"
      />
    </template>
  </Dialog>
</template>
