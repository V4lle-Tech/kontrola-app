<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import GuestLayout from '@/layouts/GuestLayout.vue'
import { useToast } from 'primevue/usetoast'
import { apiClient } from '@/api/client'
import type { ApiError } from '@/types/api'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const token = route.query.token as string ?? ''
const email = route.query.email as string ?? ''

const form = ref({
  givenName: '',
  paternalName: '',
  maternalName: '',
  password: '',
  passwordConfirmation: '',
})
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const loading = ref(false)

async function submit() {
  fieldErrors.value = {}
  generalError.value = ''
  loading.value = true

  try {
    await apiClient.post('/invitations/accept', {
      token,
      email,
      givenName: form.value.givenName,
      paternalName: form.value.paternalName,
      maternalName: form.value.maternalName || undefined,
      password: form.value.password,
      passwordConfirmation: form.value.passwordConfirmation,
    })
    toast.add({ severity: 'success', summary: 'Cuenta creada exitosamente', life: 3000 })
    router.push({ name: 'login' })
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al aceptar invitación'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GuestLayout>
    <h2 class="mb-6 text-xl font-semibold text-color">Aceptar Invitación</h2>
    <p class="mb-4 text-sm text-muted-color">
      Completa tus datos para crear tu cuenta. La invitación fue enviada a <strong>{{ email }}</strong>.
    </p>

    <Message v-if="generalError" severity="error" :closable="false" class="mb-4">
      {{ generalError }}
    </Message>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-1">
          <label for="givenName" class="text-sm font-medium text-color">Nombre(s)</label>
          <InputText id="givenName" v-model="form.givenName" :invalid="!!fieldErrors.givenName" />
          <small v-if="fieldErrors.givenName" class="p-error">{{ fieldErrors.givenName[0] }}</small>
        </div>
        <div class="flex flex-col gap-1">
          <label for="paternalName" class="text-sm font-medium text-color">Apellido paterno</label>
          <InputText id="paternalName" v-model="form.paternalName" :invalid="!!fieldErrors.paternalName" />
          <small v-if="fieldErrors.paternalName" class="p-error">{{ fieldErrors.paternalName[0] }}</small>
        </div>
        <div class="flex flex-col gap-1 sm:col-span-2">
          <label for="maternalName" class="text-sm font-medium text-color">Apellido materno (opcional)</label>
          <InputText id="maternalName" v-model="form.maternalName" />
        </div>
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
        <small v-if="fieldErrors.password" class="p-error">{{ fieldErrors.password[0] }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <label for="passwordConfirmation" class="text-sm font-medium text-color">Confirmar contraseña</label>
        <Password
          id="passwordConfirmation"
          v-model="form.passwordConfirmation"
          :feedback="false"
          toggle-mask
          :invalid="!!fieldErrors.passwordConfirmation"
          input-class="w-full"
          autocomplete="new-password"
        />
        <small v-if="fieldErrors.passwordConfirmation" class="p-error">{{ fieldErrors.passwordConfirmation[0] }}</small>
      </div>

      <Button type="submit" label="Crear Cuenta" :loading="loading" class="w-full" />

      <p class="text-center text-sm text-muted-color">
        ¿Ya tienes cuenta?
        <router-link :to="{ name: 'login' }" class="text-primary hover:underline">Iniciar sesión</router-link>
      </p>
    </form>
  </GuestLayout>
</template>
