<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import PermissionSelector from './PermissionSelector.vue'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { Role } from '@/types/access'
import type { Permission } from '@/types/auth'
import type { ApiError } from '@/types/api'

interface Props {
  role?: Role | null
}
const props = withDefaults(defineProps<Props>(), {
  role: null,
})

const emit = defineEmits<{
  saved: [role: Role]
  cancel: []
}>()

const api = useAccessApi()
const toast = useToast()

const isEdit = !!props.role
const form = ref({
  name: props.role?.name ?? '',
  permissions: [...(props.role?.permissions ?? [])] as Permission[],
})
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const loading = ref(false)

async function submit() {
  fieldErrors.value = {}
  generalError.value = ''
  loading.value = true

  try {
    let role: Role
    if (isEdit && props.role) {
      role = await api.updateRole(props.role.id, {
        name: form.value.name,
        permissions: form.value.permissions,
      })
      toast.add({ severity: 'success', summary: 'Rol actualizado', life: 3000 })
    } else {
      role = await api.createRole({
        name: form.value.name,
        permissions: form.value.permissions,
      })
      toast.add({ severity: 'success', summary: 'Rol creado', life: 3000 })
    }
    emit('saved', role)
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al guardar rol'
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
      <div class="flex flex-col gap-1">
        <label for="roleName" class="text-sm font-medium text-color">Nombre del rol</label>
        <InputText
          id="roleName"
          v-model="form.name"
          :invalid="!!fieldErrors.name"
          placeholder="Ej: Reclutador"
        />
        <small v-if="fieldErrors.name" class="p-error">{{ fieldErrors.name[0] }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Permisos</label>
        <small v-if="fieldErrors.permissions" class="p-error">{{ fieldErrors.permissions[0] }}</small>
        <PermissionSelector
          v-model="form.permissions"
          :invalid="!!fieldErrors.permissions"
        />
      </div>

      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="emit('cancel')" />
        <Button
          type="submit"
          :label="isEdit ? 'Guardar Cambios' : 'Crear Rol'"
          :loading="loading"
        />
      </div>
    </form>
  </div>
</template>
