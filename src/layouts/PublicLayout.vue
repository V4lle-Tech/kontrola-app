<script setup lang="ts">
import ThemeToggle from '@/components/shared/ThemeToggle.vue'

interface Props {
  businessName?: string
  businessLogoUrl?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  businessName: 'Kontrola',
  businessLogoUrl: null,
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-0 dark:bg-surface-900">
    <!-- Header -->
    <header class="sticky top-0 z-40 border-b border-surface bg-surface-0 dark:bg-surface-900">
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Business Logo/Name -->
          <div class="flex items-center gap-4">
            <router-link :to="{ name: 'public.jobs' }" class="flex items-center gap-3">
              <div v-if="props.businessLogoUrl" class="h-10 w-10 overflow-hidden rounded-lg">
                <img :src="props.businessLogoUrl" :alt="props.businessName" class="h-full w-full object-cover" />
              </div>
              <div v-else class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span class="text-lg font-bold text-primary-contrast">
                  {{ props.businessName.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="flex flex-col">
                <span class="font-semibold text-color">{{ props.businessName }}</span>
                <span class="text-xs text-muted-color">Perfiles de Puesto disponibles</span>
              </div>
            </router-link>
            <ThemeToggle />
          </div>

          <span class="text-sm text-muted-color">Desarrollado con Kontrola</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="mt-auto border-t border-surface bg-surface-0 py-6 dark:bg-surface-900">
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p class="text-sm text-muted-color">&copy; {{ new Date().getFullYear() }} {{ props.businessName }}. Todos los derechos reservados.</p>
          <div class="flex items-center gap-4 text-sm text-muted-color">
            <span>Kontrola</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
