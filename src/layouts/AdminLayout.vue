<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import ThemeToggle from '@/components/shared/ThemeToggle.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const navItems = [
  { label: 'Dashboard', icon: 'pi pi-home', to: '/admin' },
  { label: 'Tenants', icon: 'pi pi-building', to: '/admin/tenants' },
  { label: 'Usuarios', icon: 'pi pi-users', to: '/admin/users' },
  { label: 'Billing', icon: 'pi pi-credit-card', to: '/admin/billing' },
  { label: 'Planes', icon: 'pi pi-box', to: '/admin/plans' },
  { label: 'Activity', icon: 'pi pi-history', to: '/admin/activity' },
  { label: 'Impersonación', icon: 'pi pi-eye', to: '/admin/impersonation' },
]

function isActive(to: string): boolean {
  return route.path === to
}

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
    <aside class="flex w-64 shrink-0 flex-col border-r border-surface bg-surface-0 dark:bg-surface-900">
      <div class="flex h-16 items-center border-b border-surface px-4">
        <span class="text-lg font-bold text-color">Kontrola Admin</span>
      </div>
      <nav class="flex-1 overflow-y-auto p-2">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
          :class="isActive(item.to) ? 'bg-primary text-primary-contrast' : 'text-color hover:bg-emphasis'"
        >
          <i :class="item.icon" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="border-t border-surface p-2">
        <div class="flex items-center gap-2 rounded-lg px-3 py-2">
          <i class="pi pi-shield text-muted-color" />
          <span class="truncate text-sm text-color">{{ auth.user?.fullName ?? 'Admin' }}</span>
        </div>
      </div>
    </aside>
    <div class="flex flex-1 flex-col overflow-hidden">
      <header class="flex h-16 items-center gap-4 border-b border-surface bg-surface-0 px-4 dark:bg-surface-900">
        <div class="flex-1" />
        <ThemeToggle />
        <Button icon="pi pi-sign-out" text rounded severity="secondary" @click="logout" />
      </header>
      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
