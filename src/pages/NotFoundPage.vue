<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import AppLayout from '@/layouts/AppLayout.vue'

const router = useRouter()
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col items-center justify-center gap-4 p-6">
      <i class="pi pi-exclamation-circle text-6xl text-muted-color" />
      <h1 class="text-2xl font-bold text-color">Página no encontrada</h1>
      <p class="text-muted-color">La página que buscas no existe o fue movida.</p>
      <Button
        label="Ir al inicio"
        icon="pi pi-home"
        @click="router.push({ name: 'dashboard' })"
      />
    </div>
  </AppLayout>
</template>
