<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'

interface Props {
  applicationId: string | null
}
const props = defineProps<Props>()

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  saved: []
}>()

const api = useRecruitmentApi()
const toast = useToast()
const content = ref('')
const submitting = ref(false)

watch(visible, (show) => {
  if (show) content.value = ''
})

async function submit() {
  if (!props.applicationId || !content.value.trim()) return
  submitting.value = true
  try {
    await api.createApplicationNote(props.applicationId, { content: content.value.trim() })
    toast.add({ severity: 'success', summary: 'Nota agregada', life: 3000 })
    visible.value = false
    emit('saved')
  } catch {
    toast.add({ severity: 'error', summary: 'Error al guardar nota', life: 5000 })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Agregar Nota" class="w-full max-w-md">
    <div class="flex flex-col gap-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-color">Contenido</label>
        <Textarea v-model="content" rows="4" class="w-full" placeholder="Escribe una nota sobre esta postulación..." auto-resize />
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="visible = false" />
        <Button label="Guardar" icon="pi pi-check" :loading="submitting" :disabled="!content.trim()" @click="submit" />
      </div>
    </div>
  </Dialog>
</template>
