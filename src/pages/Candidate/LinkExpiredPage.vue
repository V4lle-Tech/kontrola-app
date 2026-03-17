<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import CandidateLayout from '@/layouts/CandidateLayout.vue'

const router = useRouter()
</script>

<template>
  <CandidateLayout :show-nav="false">
    <div class="mx-auto max-w-md pt-12">
      <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6 shadow-sm text-center">
        <i class="pi pi-clock mb-4 text-5xl text-muted-color" />
        <h1 class="mb-2 text-2xl font-bold text-color">Enlace expirado</h1>
        <p class="mb-6 text-muted-color">
          Este enlace de acceso ha expirado o ya fue utilizado. Solicita uno nuevo para continuar.
        </p>
        <Button label="Solicitar nuevo enlace" icon="pi pi-envelope" @click="router.push({ name: 'candidate.login' })" />
      </div>
    </div>
  </CandidateLayout>
</template>
