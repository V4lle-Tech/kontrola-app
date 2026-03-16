<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import GuestLayout from '@/layouts/GuestLayout.vue'
import { authApi } from '@/api/auth'
import type { ApiError } from '@/types/api'

const email = ref('')
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const success = ref(false)
const loading = ref(false)

async function submit() {
  fieldErrors.value = {}
  generalError.value = ''
  loading.value = true

  try {
    await authApi.forgotPassword({ email: email.value })
    success.value = true
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al enviar solicitud'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GuestLayout>
    <h2 class="mb-2 text-xl font-semibold text-color">Recuperar Contraseña</h2>
    <p class="mb-6 text-sm text-muted-color">
      Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
    </p>

    <Message v-if="success" severity="success" :closable="false" class="mb-4">
      Se envió un enlace de recuperación a tu correo electrónico.
    </Message>

    <Message v-if="generalError" severity="error" :closable="false" class="mb-4">
      {{ generalError }}
    </Message>

    <form v-if="!success" class="flex flex-col gap-4" @submit.prevent="submit">
      <div class="flex flex-col gap-1">
        <label for="email" class="text-sm font-medium text-color">Correo electrónico</label>
        <InputText
          id="email"
          v-model="email"
          type="email"
          placeholder="tu@empresa.com"
          :invalid="!!fieldErrors.email"
          autocomplete="email"
        />
        <small v-if="fieldErrors.email" class="p-error">{{ fieldErrors.email[0] }}</small>
      </div>

      <Button
        type="submit"
        label="Enviar Enlace"
        :loading="loading"
        class="w-full"
      />

      <p class="text-center text-sm text-muted-color">
        <router-link :to="{ name: 'login' }" class="text-primary hover:underline">
          Volver al inicio de sesión
        </router-link>
      </p>
    </form>
  </GuestLayout>
</template>
