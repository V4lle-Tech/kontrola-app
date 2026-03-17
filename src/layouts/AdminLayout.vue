<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import Badge from 'primevue/badge'
import Breadcrumb from 'primevue/breadcrumb'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Toast from 'primevue/toast'
import ThemeToggle from '@/components/shared/ThemeToggle.vue'
import { useAuthStore } from '@/stores/useAuthStore'

interface NavItem {
  label: string
  icon: string
  to: string
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)
const userMenu = ref()

const navSections = computed<NavSection[]>(() => [
  {
    title: 'General',
    items: [{ label: 'Dashboard', icon: 'pi pi-objects-column', to: '/admin' }],
  },
  {
    title: 'Negocio',
    items: [
      { label: 'Planes', icon: 'pi pi-file', to: '/admin/plans' },
      { label: 'Tenants', icon: 'pi pi-building', to: '/admin/tenants' },
      { label: 'Billing', icon: 'pi pi-credit-card', to: '/admin/billing' },
    ],
  },
  {
    title: 'Auditoría',
    items: [
      { label: 'Actividad', icon: 'pi pi-history', to: '/admin/activity' },
      { label: 'Impersonación', icon: 'pi pi-eye', to: '/admin/impersonation' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Usuarios', icon: 'pi pi-users', to: '/admin/users' },
      { label: 'Reportes', icon: 'pi pi-chart-bar', to: '/admin/reports' },
      { label: 'System Health', icon: 'pi pi-server', to: '/admin/system-health' },
    ],
  },
])

const userMenuItems = [
  {
    label: 'Cerrar Sesión',
    icon: 'pi pi-sign-out',
    command: () => logout(),
  },
]

function isActive(to: string): boolean {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}

const sectionLabels: Record<string, string> = {
  tenants: 'Tenants',
  users: 'Usuarios',
  billing: 'Facturación',
  plans: 'Planes',
  reports: 'Reportes',
  activity: 'Actividad',
  impersonation: 'Impersonación',
  'system-health': 'System Health',
}

const breadcrumbHome = computed(() => ({
  icon: 'pi pi-home',
  url: '/admin',
}))

const breadcrumbItems = computed(() => {
  const path = route.path.replace(/^\/admin\/?/, '')
  if (!path) return []
  const segments = path.split('/').filter(Boolean)
  return segments.map((seg, i) => ({
    label: sectionLabels[seg] ?? seg,
    ...(i < segments.length - 1 ? { url: '/admin/' + segments.slice(0, i + 1).join('/') } : {}),
  }))
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function toggleUserMenu(event: Event) {
  userMenu.value.toggle(event)
}

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex h-screen overflow-hidden text-color">
    <!-- Mobile Overlay -->
    <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-black/50 lg:hidden" @click="mobileOpen = false" />

    <!-- Sidebar -->
    <aside
      :class="[
        'z-50 flex flex-col border-r border-surface transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64',
        mobileOpen ? 'fixed inset-y-0 left-0' : 'hidden lg:flex',
      ]"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center justify-between border-b border-surface px-4">
        <div v-if="!sidebarCollapsed" class="flex items-center gap-3">
          <img src="/images/logo/logo.svg" alt="Kontrola" class="h-8 w-auto dark:hidden" />
          <img src="/images/logo/logo-dark.svg" alt="Kontrola" class="hidden h-8 w-auto dark:block" />
          <span class="text-sm font-medium text-muted-color">Admin</span>
        </div>
        <Button type="button" text rounded class="!p-2" @click="toggleSidebar">
          <i :class="['pi', sidebarCollapsed ? 'pi-bars' : 'pi-chevron-left']" />
        </Button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4">
        <div v-for="section in navSections" :key="section.title" class="mb-4">
          <p v-if="!sidebarCollapsed" class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-color">
            {{ section.title }}
          </p>
          <div v-else class="mb-2 border-b border-surface" />

          <div class="space-y-1">
            <router-link
              v-for="item in section.items"
              :key="item.to"
              :to="item.to"
              :class="[
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.to) ? 'bg-primary/10 text-primary' : 'text-muted-color hover:bg-emphasis',
              ]"
              @click="mobileOpen = false"
            >
              <i :class="[item.icon, 'text-lg']" />
              <span v-if="!sidebarCollapsed" class="flex-1">{{ item.label }}</span>
              <Badge v-if="!sidebarCollapsed && item.badge && item.badge > 0" :value="item.badge" severity="danger" />
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Footer -->
      <div class="border-t border-surface p-4">
        <ThemeToggle />
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Header -->
      <header class="flex h-16 items-center justify-between border-b border-surface px-6">
        <div class="flex items-center gap-4">
          <Button type="button" text rounded class="!p-2 lg:hidden" @click="mobileOpen = !mobileOpen">
            <i class="pi pi-bars" />
          </Button>
          <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems">
            <template #item="{ item }">
              <router-link v-if="item.url" :to="item.url" class="text-sm">
                <span v-if="item.icon" :class="item.icon" />
                <span v-if="item.label">{{ item.label }}</span>
              </router-link>
              <span v-else class="text-sm font-medium text-color">{{ item.label }}</span>
            </template>
          </Breadcrumb>
        </div>

        <div class="flex items-center gap-1">
          <Button type="button" text rounded class="flex items-center gap-2" @click="toggleUserMenu">
            <i class="pi pi-user" />
            <span class="hidden text-sm sm:inline">{{ auth.user?.fullName ?? 'Admin' }}</span>
            <i class="pi pi-chevron-down hidden text-xs sm:inline" />
          </Button>
          <Menu ref="userMenu" :model="userMenuItems" popup>
            <template #start>
              <div class="border-b border-surface px-4 py-3">
                <p class="text-sm font-medium text-color">{{ auth.user?.fullName ?? 'Admin' }}</p>
                <p class="text-xs text-muted-color">{{ auth.user?.email ?? '' }}</p>
              </div>
            </template>
          </Menu>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="border-t border-surface px-6 py-4">
        <p class="text-sm text-muted-color">&copy; 2026 Kontrola. Todos los derechos reservados.</p>
      </footer>
    </div>

    <Toast />
  </div>
</template>
