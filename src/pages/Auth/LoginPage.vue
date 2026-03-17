<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
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
const showPassword = ref(false)
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
    <div class="rounded-lg border border-surface bg-surface-0 dark:bg-surface-900">
      <div class="border-b border-surface p-6 text-center">
        <h2 class="text-2xl font-semibold text-color">Panel de Control</h2>
        <p class="mt-2 text-muted-color">Accede a la gestión de tu cuenta</p>
      </div>
      <div class="p-6">
        <Message v-if="generalError" severity="error" :closable="false" class="mb-4">
          {{ generalError }}
        </Message>

        <form class="space-y-4" @submit.prevent="submit">
          <div class="flex flex-col gap-2">
            <label for="email" class="text-sm font-medium text-color">Correo electrónico</label>
            <InputText
              id="email"
              v-model="form.email"
              type="email"
              placeholder="tu@empresa.com"
              :invalid="!!fieldErrors.email"
              autocomplete="email"
            />
            <small v-if="fieldErrors.email" class="p-error">{{ fieldErrors.email[0] }}</small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="text-sm font-medium text-color">Contraseña</label>
            <div class="relative">
              <InputText
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Tu contraseña"
                :invalid="!!fieldErrors.password"
                class="w-full pr-10"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-muted-color hover:text-color"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" />
              </button>
            </div>
            <small v-if="fieldErrors.password" class="p-error">{{ fieldErrors.password[0] }}</small>
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
            :label="auth.isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'"
            :loading="auth.isLoading"
            class="w-full"
          />
        </form>

        <div class="mt-6 text-center text-sm text-muted-color">
          <p>
            ¿No tienes una cuenta?
            <router-link :to="{ name: 'register' }" class="font-medium text-primary hover:underline">
              Regístrate
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </GuestLayout>
</template>
