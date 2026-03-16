<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import GuestLayout from '@/layouts/GuestLayout.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import type { ApiError } from '@/types/api'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  givenName: '',
  paternalName: '',
  maternalName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
})
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')

async function submit() {
  fieldErrors.value = {}
  generalError.value = ''

  try {
    await auth.register({
      givenName: form.value.givenName,
      paternalName: form.value.paternalName,
      maternalName: form.value.maternalName || undefined,
      email: form.value.email,
      password: form.value.password,
      passwordConfirmation: form.value.passwordConfirmation,
    })
    router.push({ name: 'dashboard' })
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al registrar'
    }
  }
}
</script>

<template>
  <GuestLayout>
    <h2 class="mb-6 text-xl font-semibold text-color">Crear Cuenta</h2>

    <Message v-if="generalError" severity="error" :closable="false" class="mb-4">
      {{ generalError }}
    </Message>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
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

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label for="paternalName" class="text-sm font-medium text-color">Apellido Paterno</label>
          <InputText
            id="paternalName"
            v-model="form.paternalName"
            :invalid="!!fieldErrors.paternalName"
            autocomplete="family-name"
          />
          <small v-if="fieldErrors.paternalName" class="text-red-500">{{ fieldErrors.paternalName[0] }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="maternalName" class="text-sm font-medium text-color">Apellido Materno</label>
          <InputText
            id="maternalName"
            v-model="form.maternalName"
            autocomplete="additional-name"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="email" class="text-sm font-medium text-color">Correo electrónico</label>
        <InputText
          id="email"
          v-model="form.email"
          type="email"
          placeholder="tu@empresa.com"
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
        <label for="passwordConfirmation" class="text-sm font-medium text-color">Confirmar Contraseña</label>
        <Password
          id="passwordConfirmation"
          v-model="form.passwordConfirmation"
          :feedback="false"
          toggle-mask
          :invalid="!!fieldErrors.passwordConfirmation"
          input-class="w-full"
          autocomplete="new-password"
        />
        <small v-if="fieldErrors.passwordConfirmation" class="text-red-500">{{ fieldErrors.passwordConfirmation[0] }}</small>
      </div>

      <Button
        type="submit"
        label="Crear Cuenta"
        :loading="auth.isLoading"
        class="w-full"
      />

      <p class="text-center text-sm text-muted-color">
        ¿Ya tienes cuenta?
        <router-link :to="{ name: 'login' }" class="text-primary hover:underline">
          Inicia Sesión
        </router-link>
      </p>
    </form>
  </GuestLayout>
</template>
