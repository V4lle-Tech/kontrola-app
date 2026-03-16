<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { RoleSummary } from '@/types/access'
import type { ApiError } from '@/types/api'

const emit = defineEmits<{
  invited: []
  cancel: []
}>()

const api = useAccessApi()
const toast = useToast()

const form = ref({
  email: '',
  roleIds: [] as string[],
})
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const loading = ref(false)
const roles = ref<RoleSummary[]>([])

onMounted(async () => {
  try {
    const result = await api.getRoles({ pageSize: 100 })
    roles.value = result.items.map((r) => ({ id: r.id, name: r.name, slug: r.slug }))
  } catch {
    // Roles will be empty if fetch fails
  }
})

async function submit() {
  fieldErrors.value = {}
  generalError.value = ''
  loading.value = true

  try {
    await api.inviteUser({
      email: form.value.email,
      roleIds: form.value.roleIds,
    })
    toast.add({ severity: 'success', summary: 'Invitación enviada', life: 3000 })
    emit('invited')
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al enviar invitación'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h3 class="text-lg font-semibold text-color">Invitar Usuario</h3>
    <p class="text-sm text-muted-color">
      Se enviará un correo de invitación para que el usuario cree su cuenta.
    </p>

    <Message v-if="generalError" severity="error" :closable="false">
      {{ generalError }}
    </Message>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <div class="flex flex-col gap-1">
        <label for="inviteEmail" class="text-sm font-medium text-color">Correo electrónico</label>
        <InputText
          id="inviteEmail"
          v-model="form.email"
          type="email"
          placeholder="usuario@empresa.com"
          :invalid="!!fieldErrors.email"
          autocomplete="email"
        />
        <small v-if="fieldErrors.email" class="p-error">{{ fieldErrors.email[0] }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <label for="inviteRoles" class="text-sm font-medium text-color">Roles</label>
        <MultiSelect
          id="inviteRoles"
          v-model="form.roleIds"
          :options="roles"
          option-label="name"
          option-value="id"
          placeholder="Seleccionar roles"
          :invalid="!!fieldErrors.roleIds"
          class="w-full"
        />
        <small v-if="fieldErrors.roleIds" class="p-error">{{ fieldErrors.roleIds[0] }}</small>
      </div>

      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="emit('cancel')" />
        <Button type="submit" label="Enviar Invitación" icon="pi pi-envelope" :loading="loading" />
      </div>
    </form>
  </div>
</template>
