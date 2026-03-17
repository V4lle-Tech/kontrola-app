<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { UserSummary } from '@/types/access'
import type { ApiError } from '@/types/api'

interface Props {
  user: UserSummary | null
}
const props = defineProps<Props>()

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  saved: [user: UserSummary]
}>()

const api = useAccessApi()
const toast = useToast()

const form = ref({
  givenName: '',
  paternalName: '',
  maternalName: '',
  email: '',
  isActive: true,
})
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const saving = ref(false)

watch(visible, (show) => {
  if (show && props.user) {
    form.value = {
      givenName: props.user.givenName,
      paternalName: props.user.paternalName,
      maternalName: props.user.maternalName ?? '',
      email: props.user.email,
      isActive: props.user.isActive,
    }
    fieldErrors.value = {}
    generalError.value = ''
  }
})

async function submit() {
  if (!props.user) return

  fieldErrors.value = {}
  generalError.value = ''
  saving.value = true

  try {
    const updated = await api.updateUser(props.user.id, {
      givenName: form.value.givenName,
      paternalName: form.value.paternalName,
      maternalName: form.value.maternalName || undefined,
      email: form.value.email,
      roleIds: props.user.roles.map((r) => r.id),
      isActive: form.value.isActive,
    })
    visible.value = false
    toast.add({ severity: 'success', summary: 'Usuario actualizado', life: 3000 })
    emit('saved', updated)
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al actualizar usuario'
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Editar Usuario" class="w-full max-w-lg">
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
        </div>

        <div class="flex items-center gap-3">
          <ToggleSwitch v-model="form.isActive" />
          <label class="text-sm font-medium text-color">Usuario activo</label>
        </div>

        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" text @click="visible = false" />
          <Button type="submit" label="Guardar cambios" :loading="saving" />
        </div>
      </form>
    </div>
  </Dialog>
</template>
