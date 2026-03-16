<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import { apiClient } from '@/api/client'

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function requestMagicLink() {
  if (!email.value) return
  loading.value = true
  error.value = ''
  try {
    await apiClient.post('/candidate/auth/magic-link', { email: email.value })
    sent.value = true
  } catch {
    error.value = 'No pudimos enviar el enlace. Verifica tu correo e intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <CandidateLayout :show-nav="false">
    <div class="mx-auto max-w-md pt-12">
      <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6 shadow-sm">
        <h1 class="mb-2 text-2xl font-bold text-color">Portal de Candidatos</h1>
        <p class="mb-6 text-muted-color">Ingresa tu correo y te enviaremos un enlace de acceso.</p>

        <template v-if="!sent">
          <form class="flex flex-col gap-4" @submit.prevent="requestMagicLink">
            <div class="flex flex-col gap-1">
              <label for="email" class="text-sm font-medium text-color">Correo electrónico</label>
              <InputText id="email" v-model="email" type="email" placeholder="tu@correo.com" required />
            </div>
            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
            <Button type="submit" label="Enviar enlace" icon="pi pi-envelope" :loading="loading" />
          </form>
        </template>

        <template v-else>
          <div class="flex flex-col items-center gap-4 py-4 text-center">
            <i class="pi pi-check-circle text-5xl text-primary" />
            <p class="text-color">
              Hemos enviado un enlace de acceso a <strong>{{ email }}</strong>.
            </p>
            <p class="text-sm text-muted-color">
              Revisa tu bandeja de entrada y haz clic en el enlace para continuar.
            </p>
            <Button label="Enviar de nuevo" text size="small" @click="sent = false" />
          </div>
        </template>
      </div>
    </div>
  </CandidateLayout>
</template>
