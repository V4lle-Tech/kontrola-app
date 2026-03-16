<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-color">Kontrola</h1>
        <p class="mt-1 text-muted-color">ERP de Reclutamiento</p>
      </div>
      <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6 shadow-sm">
        <slot />
      </div>
    </div>
  </div>
</template>
