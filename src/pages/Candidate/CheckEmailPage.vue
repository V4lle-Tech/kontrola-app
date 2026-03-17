<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import { apiClient } from '@/api/client'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const resending = ref(false)

const email = computed(() => (route.query.email as string) || '')

async function resendLink() {
  if (!email.value) return
  resending.value = true
  try {
    await apiClient.post('/candidate/auth/magic-link', { email: email.value })
    toast.add({ severity: 'success', summary: 'Enlace reenviado', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error al reenviar', life: 5000 })
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <CandidateLayout :show-nav="false">
    <div class="mx-auto max-w-md pt-12">
      <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6 shadow-sm text-center">
        <i class="pi pi-envelope mb-4 text-5xl text-primary" />
        <h1 class="mb-2 text-2xl font-bold text-color">Revisa tu correo</h1>
        <p class="mb-2 text-muted-color">
          Hemos enviado un enlace de acceso a
          <strong v-if="email" class="text-color">{{ email }}</strong>.
        </p>
        <p class="mb-6 text-sm text-muted-color">
          Haz clic en el enlace del correo para acceder al portal. El enlace expira en 15 minutos.
        </p>
        <div class="flex flex-col gap-3">
          <Button label="Reenviar enlace" icon="pi pi-refresh" outlined :loading="resending" :disabled="!email" @click="resendLink" />
          <Button label="Volver al inicio" text severity="secondary" @click="router.push({ name: 'candidate.login' })" />
        </div>
      </div>
    </div>
  </CandidateLayout>
</template>
