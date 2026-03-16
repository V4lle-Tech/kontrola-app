<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import GuestLayout from '@/layouts/GuestLayout.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import type { ApiError } from '@/types/api'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  email: '',
  password: '',
  rememberMe: false,
})
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')

async function submit() {
  fieldErrors.value = {}
  generalError.value = ''

  try {
    await auth.login({
      email: form.value.email,
      password: form.value.password,
      rememberMe: form.value.rememberMe,
    })
    router.push({ name: 'dashboard' })
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al iniciar sesión'
    }
  }
}
</script>

<template>
  <GuestLayout>
    <h2 class="mb-6 text-xl font-semibold text-color">Iniciar Sesión</h2>

    <Message v-if="generalError" severity="error" :closable="false" class="mb-4">
      {{ generalError }}
    </Message>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
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
          :feedback="false"
          toggle-mask
          :invalid="!!fieldErrors.password"
          input-class="w-full"
          autocomplete="current-password"
        />
        <small v-if="fieldErrors.password" class="text-red-500">{{ fieldErrors.password[0] }}</small>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Checkbox v-model="form.rememberMe" :binary="true" input-id="rememberMe" />
          <label for="rememberMe" class="text-sm text-color">Recordarme</label>
        </div>
        <router-link :to="{ name: 'forgot-password' }" class="text-sm text-primary hover:underline">
          ¿Olvidaste tu contraseña?
        </router-link>
      </div>

      <Button
        type="submit"
        label="Iniciar Sesión"
        :loading="auth.isLoading"
        class="w-full"
      />

      <p class="text-center text-sm text-muted-color">
        ¿No tienes cuenta?
        <router-link :to="{ name: 'register' }" class="text-primary hover:underline">
          Regístrate
        </router-link>
      </p>
    </form>
  </GuestLayout>
</template>
