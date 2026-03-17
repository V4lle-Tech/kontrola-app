<script setup lang="ts">
interface Props {
  tenantLogo?: string | null
}
withDefaults(defineProps<Props>(), { tenantLogo: null })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <img v-if="tenantLogo" :src="tenantLogo" alt="Logo" class="mx-auto mb-2 h-12" />
        <h1 v-else class="text-3xl font-bold text-color">Kontrola</h1>
        <p class="mt-1 text-muted-color">Portal de Candidatos</p>
      </div>
      <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6 shadow-sm">
        <slot />
      </div>
    </div>
  </div>
</template>
