<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import SidebarMenu from '@/components/shared/SidebarMenu.vue'
import ThemeToggle from '@/components/shared/ThemeToggle.vue'
import { useSidebar } from '@/composables/useSidebar'
import { useNavigation } from '@/composables/useNavigation'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const auth = useAuthStore()
const { collapsed, isMobile, mobileOpen, toggle, closeMobile } = useSidebar()
const { sections } = useNavigation()

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
    <!-- Mobile overlay -->
    <div
      v-if="isMobile && mobileOpen"
      class="fixed inset-0 z-40 bg-black/50"
      @click="closeMobile"
    />

    <!-- Sidebar -->
    <aside
      class="z-50 flex shrink-0 flex-col border-r border-surface bg-surface-0 dark:bg-surface-900 transition-all duration-300"
      :class="[
        isMobile
          ? ['fixed inset-y-0 left-0 w-64', mobileOpen ? 'translate-x-0' : '-translate-x-full']
          : [collapsed ? 'w-16' : 'w-64'],
      ]"
    >
      <!-- Sidebar header -->
      <div class="flex h-16 items-center border-b border-surface px-4">
        <span v-if="!collapsed || isMobile" class="text-lg font-bold text-color">
          Kontrola
        </span>
        <span v-else class="mx-auto text-lg font-bold text-color">K</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-2">
        <SidebarMenu
          :sections="sections"
          :collapsed="collapsed && !isMobile"
          @navigate="closeMobile"
        />
      </nav>

      <!-- Sidebar footer -->
      <div class="border-t border-surface p-2">
        <div class="flex items-center gap-2 rounded-lg px-3 py-2">
          <i class="pi pi-user text-muted-color" />
          <span v-if="!collapsed || isMobile" class="truncate text-sm text-color">
            {{ auth.user?.fullName ?? 'Usuario' }}
          </span>
        </div>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Topbar -->
      <header class="flex h-16 items-center gap-4 border-b border-surface bg-surface-0 dark:bg-surface-900 px-4">
        <Button
          :icon="isMobile ? 'pi pi-bars' : (collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left')"
          text
          rounded
          severity="secondary"
          @click="toggle"
        />

        <div class="flex-1" />

        <slot name="topbar" />

        <ThemeToggle />

        <Button
          icon="pi pi-sign-out"
          text
          rounded
          severity="secondary"
          @click="logout"
        />
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-auto p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
