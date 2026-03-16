<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { RoleSummary, UserSummary } from '@/types/access'
import type { ApiError } from '@/types/api'

const emit = defineEmits<{
  created: [user: UserSummary]
  cancel: []
}>()

const api = useAccessApi()
const toast = useToast()

const form = ref({
  givenName: '',
  paternalName: '',
  maternalName: '',
  email: '',
  password: '',
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
    const user = await api.createUser({
      givenName: form.value.givenName,
      paternalName: form.value.paternalName,
      maternalName: form.value.maternalName || undefined,
      email: form.value.email,
      password: form.value.password,
      roleIds: form.value.roleIds,
    })
    toast.add({ severity: 'success', summary: 'Usuario creado', life: 3000 })
    emit('created', user)
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al crear usuario'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h3 class="text-lg font-semibold text-color">Crear Usuario</h3>

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
          <small v-if="fieldErrors.givenName" class="text-red-500">{{ fieldErrors.givenName[0] }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="paternalName" class="text-sm font-medium text-color">Apellido paterno</label>
          <InputText
            id="paternalName"
            v-model="form.paternalName"
            :invalid="!!fieldErrors.paternalName"
            autocomplete="family-name"
          />
          <small v-if="fieldErrors.paternalName" class="text-red-500">{{ fieldErrors.paternalName[0] }}</small>
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
          <small v-if="fieldErrors.email" class="text-red-500">{{ fieldErrors.email[0] }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium text-color">Contraseña</label>
          <Password
            id="password"
            v-model="form.password"
            toggle-mask
            :invalid="!!fieldErrors.password"
            input-class="w-full"
            autocomplete="new-password"
          />
          <small v-if="fieldErrors.password" class="text-red-500">{{ fieldErrors.password[0] }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="roles" class="text-sm font-medium text-color">Roles</label>
          <MultiSelect
            id="roles"
            v-model="form.roleIds"
            :options="roles"
            option-label="name"
            option-value="id"
            placeholder="Seleccionar roles"
            :invalid="!!fieldErrors.roleIds"
            class="w-full"
          />
          <small v-if="fieldErrors.roleIds" class="text-red-500">{{ fieldErrors.roleIds[0] }}</small>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="emit('cancel')" />
        <Button type="submit" label="Crear Usuario" :loading="loading" />
      </div>
    </form>
  </div>
</template>
