<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import GuestLayout from '@/layouts/GuestLayout.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const email = ref('')
const password = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    router.push({ name: 'admin.dashboard' })
  } catch {
    toast.add({ severity: 'error', summary: 'Credenciales inválidas', life: 5000 })
  } finally { loading.value = false }
}
</script>

<template>
  <GuestLayout>
    <div class="mx-auto w-full max-w-sm">
      <h1 class="mb-6 text-center text-2xl font-bold text-color">Admin Login</h1>
      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Email</label>
          <InputText v-model="email" type="email" placeholder="admin@kontrola.com.mx" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">Contraseña</label>
          <Password v-model="password" :feedback="false" toggle-mask />
        </div>
        <Button type="submit" label="Ingresar" :loading="loading" />
      </form>
    </div>
  </GuestLayout>
</template>
