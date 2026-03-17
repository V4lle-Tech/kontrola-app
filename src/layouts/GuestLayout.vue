<script setup lang="ts">
import ThemeToggle from '@/components/shared/ThemeToggle.vue'
</script>

<template>
  <div class="relative flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
    <!-- Theme Toggle -->
    <div class="absolute top-4 right-4">
      <ThemeToggle />
    </div>

    <!-- Logo -->
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <router-link to="/" class="flex justify-center">
        <img src="/images/logo/logo.svg" alt="Kontrola" class="h-10 w-auto dark:hidden" />
        <img src="/images/logo/logo-dark.svg" alt="Kontrola" class="hidden h-10 w-auto dark:block" />
      </router-link>
    </div>

    <!-- Content -->
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="rounded-lg border border-surface px-4 py-8 shadow-sm sm:px-10">
        <slot />
      </div>
    </div>

    <!-- Footer link -->
    <div class="mt-8 text-center">
      <router-link to="/" class="text-sm text-muted-color transition-colors hover:text-primary">
        &larr; Volver al inicio
      </router-link>
    </div>
  </div>
</template>
