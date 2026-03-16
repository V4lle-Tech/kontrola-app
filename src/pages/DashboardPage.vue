<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const auth = useAuthStore()
</script>

<template>
  <AppLayout>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-color">
        Bienvenido, {{ auth.user?.givenName ?? 'Usuario' }}
      </h1>
      <p class="mt-1 text-muted-color">Panel principal de Kontrola</p>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="card in [
          { icon: 'pi pi-users', label: 'Candidatos', value: '—' },
          { icon: 'pi pi-briefcase', label: 'Vacantes activas', value: '—' },
          { icon: 'pi pi-file', label: 'Documentos', value: '—' },
          { icon: 'pi pi-building', label: 'Clientes', value: '—' },
        ]"
        :key="card.label"
        class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-5"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <i :class="card.icon" class="text-lg text-primary" />
          </div>
          <div>
            <p class="text-sm text-muted-color">{{ card.label }}</p>
            <p class="text-xl font-semibold text-color">{{ card.value }}</p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
