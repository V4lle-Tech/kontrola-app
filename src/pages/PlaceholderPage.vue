<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface-0 dark:bg-surface-900">
    <div class="text-center">
      <i class="pi pi-box mb-4 text-4xl text-muted-color" />
      <h1 class="mb-2 text-2xl font-bold text-color">{{ route.name }}</h1>
      <p class="text-muted-color">Pendiente de implementación</p>
    </div>
  </div>
</template>
