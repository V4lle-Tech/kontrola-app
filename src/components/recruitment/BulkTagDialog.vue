<script setup lang="ts">
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { Tag } from '@/types/recruitment'
import type { ApiError } from '@/types/api'

interface Props {
  candidateIds: string[]
  action: 'assign' | 'remove'
}
const props = defineProps<Props>()

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  done: []
}>()

const api = useRecruitmentApi()
const toast = useToast()
const tagIds = ref<string[]>([])
const availableTags = ref<Tag[]>([])
const saving = ref(false)

async function loadTags() {
  try {
    availableTags.value = await api.getTags('candidate')
  } catch {
    // Tags unavailable
  }
}

async function submit() {
  if (tagIds.value.length === 0 || props.candidateIds.length === 0) return
  saving.value = true
  try {
    if (props.action === 'assign') {
      await api.bulkAssignTags(props.candidateIds, tagIds.value)
      toast.add({ severity: 'success', summary: `Etiquetas asignadas a ${props.candidateIds.length} candidatos`, life: 3000 })
    } else {
      await api.bulkRemoveTags(props.candidateIds, tagIds.value)
      toast.add({ severity: 'success', summary: `Etiquetas removidas de ${props.candidateIds.length} candidatos`, life: 3000 })
    }
    visible.value = false
    emit('done')
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({ severity: 'error', summary: apiError.title ?? 'Error en operación masiva', life: 5000 })
  } finally {
    saving.value = false
  }
}

void loadTags()
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="action === 'assign' ? 'Asignar etiquetas' : 'Remover etiquetas'"
    class="w-full max-w-md"
  >
    <div class="flex flex-col gap-4">
      <p class="text-sm text-muted-color">
        {{ action === 'assign' ? 'Selecciona las etiquetas a asignar a' : 'Selecciona las etiquetas a remover de' }}
        {{ candidateIds.length }} candidatos
      </p>
      <MultiSelect
        v-model="tagIds"
        :options="availableTags"
        option-label="name"
        option-value="id"
        placeholder="Seleccionar etiquetas"
        :max-selected-labels="5"
        class="w-full"
      />
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="visible = false" />
        <Button
          :label="action === 'assign' ? 'Asignar' : 'Remover'"
          :loading="saving"
          :disabled="tagIds.length === 0"
          @click="submit"
        />
      </div>
    </div>
  </Dialog>
</template>
