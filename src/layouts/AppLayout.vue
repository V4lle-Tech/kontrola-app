<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import PanelMenu from 'primevue/panelmenu'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import ThemeToggle from '@/components/shared/ThemeToggle.vue'
import KontrolaLogoIcon from '@/components/kontrola/KontrolaLogoIcon.vue'
import { useSidebar } from '@/composables/useSidebar'
import { useNavigation } from '@/composables/useNavigation'
import { useAuthStore } from '@/stores/useAuthStore'
import type { SidebarMenuItem } from '@/types/navigation'

const router = useRouter()
const auth = useAuthStore()
const { collapsed, toggle } = useSidebar()
const { menuItems, expandedKeys, isActive, hasActiveChild, navigateTo } = useNavigation()

const sidebarOpen = ref(false)
const userMenu = ref()

const userMenuItems = [
  {
    label: 'Mi Perfil',
    icon: 'pi pi-user',
    command: () => router.push({ name: 'settings.profile' }),
  },
  { separator: true },
  {
    label: 'Cerrar Sesión',
    icon: 'pi pi-sign-out',
    class: 'text-red-500',
    command: () => logout(),
  },
]

function toggleUserMenu(event: Event) {
  userMenu.value.toggle(event)
}

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}

function handleNavigation(to: string) {
  navigateTo(to)
  sidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen">
    <Toast />
    <ConfirmDialog />

    <!-- Mobile sidebar backdrop -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 cursor-pointer lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      role="navigation"
      aria-label="Menú principal"
      :class="[
        'fixed inset-y-0 left-0 z-50 border-r border-surface',
        'transform transition-all duration-200 ease-in-out lg:translate-x-0',
        collapsed ? 'w-20' : 'w-64',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex h-full flex-col">
        <!-- Logo -->
        <div
          class="flex h-16 items-center border-b border-surface transition-all duration-200"
          :class="collapsed ? 'justify-center px-2' : 'px-4'"
        >
          <template v-if="!collapsed">
            <img src="/images/logo/logo.svg" alt="Kontrola" class="h-8 w-auto dark:hidden" />
            <img src="/images/logo/logo-dark.svg" alt="Kontrola" class="hidden h-8 w-auto dark:block" />
          </template>
          <KontrolaLogoIcon v-else size="md" />
        </div>

        <!-- Navigation: Collapsed mode (icon-only with tooltips) -->
        <nav v-if="collapsed" class="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          <template v-for="item in menuItems" :key="item.key">
            <div
              v-if="item.to"
              v-tooltip.right="item.label"
              :class="[
                'flex cursor-pointer justify-center rounded-lg p-3',
                isActive(item.to) ? 'bg-surface-50 text-primary dark:bg-surface-800' : 'text-color hover:bg-surface-50 dark:hover:bg-surface-800',
              ]"
              @click="handleNavigation(item.to)"
            >
              <i :class="[item.icon, 'text-lg']" />
            </div>
            <div
              v-else
              v-tooltip.right="item.label"
              :class="[
                'flex justify-center rounded-lg p-3',
                hasActiveChild(item) ? 'bg-surface-50 text-primary dark:bg-surface-800' : 'text-color hover:bg-surface-50 dark:hover:bg-surface-800',
              ]"
            >
              <i :class="[item.icon, 'text-lg']" />
            </div>
          </template>
        </nav>

        <!-- Navigation: Expanded mode (PanelMenu) -->
        <nav v-else class="flex-1 overflow-y-auto px-1 py-2">
          <PanelMenu v-model:expanded-keys="expandedKeys" :model="menuItems" multiple class="w-full">
            <template #item="{ item }">
              <!-- Leaf item → router navigation -->
              <a
                v-if="(item as SidebarMenuItem).to"
                v-ripple
                class="group flex cursor-pointer items-center px-4 py-2"
                @click="handleNavigation((item as SidebarMenuItem).to!)"
              >
                <span
                  :class="[
                    item.icon,
                    isActive((item as SidebarMenuItem).to) ? 'text-primary' : 'text-primary group-hover:text-inherit',
                  ]"
                />
                <span :class="['ml-2', isActive((item as SidebarMenuItem).to) ? 'text-primary' : '']">
                  {{ item.label }}
                </span>
              </a>
              <!-- Parent header → PanelMenu handles expand/collapse -->
              <a v-else v-ripple class="group flex cursor-pointer items-center px-4 py-2">
                <span
                  :class="[
                    item.icon,
                    hasActiveChild(item as SidebarMenuItem) ? 'text-primary' : 'text-primary group-hover:text-inherit',
                  ]"
                />
                <span :class="['ml-2', { 'font-medium': item.items }]">{{ item.label }}</span>
                <span v-if="item.items" class="pi pi-angle-down ml-auto text-primary" />
              </a>
            </template>
          </PanelMenu>
        </nav>

        <!-- Collapse Toggle & Theme Toggle (desktop only) -->
        <div class="hidden items-center justify-center gap-1 border-t border-surface p-2 lg:flex">
          <ThemeToggle />
          <Button
            type="button"
            text
            rounded
            class="!p-2"
            :aria-label="collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'"
            @click="toggle"
          >
            <i :class="['pi', collapsed ? 'pi-chevron-right' : 'pi-chevron-left']" />
          </Button>
        </div>

        <!-- User section -->
        <div
          class="border-t border-surface transition-all duration-200"
          :class="collapsed ? 'p-2' : 'p-4'"
        >
          <Button
            type="button"
            text
            :class="[
              'flex w-full cursor-pointer items-center rounded-lg transition-colors',
              collapsed ? 'justify-center !p-2' : 'gap-3 !p-2',
            ]"
            :title="collapsed ? (auth.user?.fullName ?? 'Usuario') : undefined"
            @click="toggleUserMenu"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-200 dark:bg-surface-700">
              <span class="text-sm text-muted-color">
                {{ auth.user?.fullName?.charAt(0).toUpperCase() ?? 'U' }}
              </span>
            </div>
            <div v-if="!collapsed" class="min-w-0 flex-1 text-left">
              <p class="truncate text-sm text-color">{{ auth.user?.fullName ?? 'Usuario' }}</p>
              <p class="truncate text-xs text-muted-color">{{ auth.user?.email ?? '' }}</p>
            </div>
            <i v-if="!collapsed" class="pi pi-chevron-up text-xs text-surface-400" />
          </Button>
          <Menu ref="userMenu" :model="userMenuItems" popup :pt="{ root: { class: 'w-56' } }">
            <template #start>
              <div class="border-b border-surface px-4 py-2">
                <p class="text-sm text-color">{{ auth.user?.fullName ?? 'Usuario' }}</p>
                <p class="text-xs text-muted-color">{{ auth.user?.email ?? '' }}</p>
              </div>
            </template>
          </Menu>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div :class="['flex h-screen flex-col transition-all duration-200', collapsed ? 'lg:pl-20' : 'lg:pl-64']">
      <!-- Mobile header -->
      <header class="sticky top-0 z-30 shrink-0 border-b border-surface lg:hidden">
        <div class="flex h-16 items-center justify-between px-4">
          <Button type="button" text rounded class="!p-2" @click="sidebarOpen = true">
            <i class="pi pi-bars text-lg" />
          </Button>
          <img src="/images/logo/logo.svg" alt="Kontrola" class="h-8 w-auto dark:hidden" />
          <img src="/images/logo/logo-dark.svg" alt="Kontrola" class="hidden h-8 w-auto dark:block" />
          <ThemeToggle />
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
