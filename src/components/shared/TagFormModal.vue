<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ColorPicker from 'primevue/colorpicker'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { Tag } from '@/types/recruitment'
import type { ApiError } from '@/types/api'

interface Props {
  tag?: Tag | null
}
const props = withDefaults(defineProps<Props>(), {
  tag: null,
})

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  saved: [tag: Tag]
}>()

const api = useRecruitmentApi()
const toast = useToast()
const submitting = ref(false)

const form = ref({
  name: '',
  color: '3B82F6',
  type: 'candidate' as 'candidate' | 'job_profile',
})

const typeOptions = [
  { label: 'Candidato', value: 'candidate' },
  { label: 'Perfil de puesto', value: 'job_profile' },
]

const isEditing = ref(false)

watch(visible, (show) => {
  if (show) {
    if (props.tag) {
      isEditing.value = true
      form.value = {
        name: props.tag.name,
        color: props.tag.color.replace('#', ''),
        type: props.tag.type,
      }
    } else {
      isEditing.value = false
      form.value = { name: '', color: '3B82F6', type: 'candidate' }
    }
  }
})

async function submit() {
  if (!form.value.name.trim()) return
  submitting.value = true
  const color = `#${form.value.color}`
  try {
    let saved: Tag
    if (isEditing.value && props.tag) {
      saved = await api.updateTag(props.tag.id, { name: form.value.name.trim(), color })
    } else {
      saved = await api.createTag({ name: form.value.name.trim(), color, type: form.value.type })
    }
    toast.add({ severity: 'success', summary: isEditing.value ? 'Etiqueta actualizada' : 'Etiqueta creada', life: 3000 })
    visible.value = false
    emit('saved', saved)
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({ severity: 'error', summary: apiError.title ?? 'Error al guardar etiqueta', life: 5000 })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="isEditing ? 'Editar etiqueta' : 'Crear etiqueta'"
    class="w-full max-w-sm"
  >
    <div class="flex flex-col gap-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-color">Nombre</label>
        <InputText v-model="form.name" class="w-full" placeholder="Nombre de la etiqueta" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-color">Color</label>
        <div class="flex items-center gap-2">
          <ColorPicker v-model="form.color" />
          <span
            class="inline-block h-6 w-6 rounded-full border border-surface"
            :style="{ backgroundColor: `#${form.color}` }"
          />
        </div>
      </div>
      <div v-if="!isEditing">
        <label class="mb-1 block text-sm font-medium text-color">Tipo</label>
        <Select
          v-model="form.type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="visible = false" />
        <Button
          :label="isEditing ? 'Guardar' : 'Crear'"
          icon="pi pi-check"
          :loading="submitting"
          :disabled="!form.name.trim()"
          @click="submit"
        />
      </div>
    </div>
  </Dialog>
</template>
