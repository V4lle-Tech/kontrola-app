<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import GuestLayout from '@/layouts/GuestLayout.vue'
import { authApi } from '@/api/auth'
import type { ApiError } from '@/types/api'

const route = useRoute()
const router = useRouter()

const form = ref({
  email: (route.query.email as string) ?? '',
  password: '',
  passwordConfirmation: '',
})
const token = (route.query.token as string) ?? ''
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const success = ref(false)
const loading = ref(false)

async function submit() {
  fieldErrors.value = {}
  generalError.value = ''
  loading.value = true

  try {
    await authApi.resetPassword({
      token,
      email: form.value.email,
      password: form.value.password,
      passwordConfirmation: form.value.passwordConfirmation,
    })
    success.value = true
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al restablecer contraseña'
    }
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <GuestLayout>
    <h2 class="mb-6 text-xl font-semibold text-color">Restablecer Contraseña</h2>

    <Message v-if="success" severity="success" :closable="false" class="mb-4">
      Tu contraseña se restableció correctamente.
    </Message>

    <Message v-if="generalError" severity="error" :closable="false" class="mb-4">
      {{ generalError }}
    </Message>

    <div v-if="success" class="flex flex-col gap-4">
      <Button label="Ir al Inicio de Sesión" class="w-full" @click="goToLogin" />
    </div>

    <form v-else class="flex flex-col gap-4" @submit.prevent="submit">
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
        <label for="password" class="text-sm font-medium text-color">Nueva Contraseña</label>
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
        label="Restablecer Contraseña"
        :loading="loading"
        class="w-full"
      />
    </form>
  </GuestLayout>
</template>
