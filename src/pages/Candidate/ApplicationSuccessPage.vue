<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import CandidateLayout from '@/layouts/CandidateLayout.vue'

const router = useRouter()
</script>

<template>
  <CandidateLayout>
    <div class="mx-auto max-w-md pt-12">
      <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6 shadow-sm text-center">
        <i class="pi pi-check-circle mb-4 text-5xl text-primary" />
        <h1 class="mb-2 text-2xl font-bold text-color">Aplicacion enviada!</h1>
        <p class="mb-6 text-muted-color">Tu aplicacion ha sido recibida correctamente.</p>

        <div class="mb-6 rounded-lg border border-surface bg-surface-50 dark:bg-surface-800 p-4 text-left">
          <p class="mb-2 text-sm font-semibold text-color">Proximos pasos:</p>
          <ul class="flex flex-col gap-2 text-sm text-muted-color">
            <li class="flex items-start gap-2">
              <i class="pi pi-envelope mt-0.5 text-xs" />
              <span>Revisa tu correo para actualizaciones sobre tu aplicacion.</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="pi pi-user mt-0.5 text-xs" />
              <span>Puedes dar seguimiento desde tu panel de candidato.</span>
            </li>
          </ul>
        </div>

        <div class="flex flex-col gap-3">
          <Button label="Ver mis aplicaciones" icon="pi pi-list" @click="router.push({ name: 'candidate.dashboard' })" />
          <Button label="Explorar mas vacantes" icon="pi pi-search" outlined @click="router.push({ name: 'candidate.jobs' })" />
        </div>
      </div>
    </div>
  </CandidateLayout>
</template>
