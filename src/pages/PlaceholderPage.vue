<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const route = useRoute()
</script>

<template>
  <AppLayout>
    <div class="flex items-center justify-center py-16">
      <div class="text-center">
        <i class="pi pi-box mb-4 text-4xl text-muted-color" />
        <h1 class="mb-2 text-2xl font-bold text-color">{{ route.name }}</h1>
        <p class="text-muted-color">Pendiente de implementación</p>
      </div>
    </div>
  </AppLayout>
</template>
