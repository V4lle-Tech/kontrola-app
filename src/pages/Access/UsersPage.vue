<script setup lang="ts">
import { ref, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import Button from 'primevue/button'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { UserSummary } from '@/types/access'
import type { PaginatedResponse } from '@/types/pagination'

const api = useAccessApi()

const users = ref<PaginatedResponse<UserSummary> | null>(null)
const selectedUser = ref<UserSummary | null>(null)
const loading = ref(false)

const showDetail = computed(() => selectedUser.value !== null)

async function loadUsers(page = 1, search = '') {
  loading.value = true
  try {
    users.value = await api.getUsers({ page, pageSize: 25, search })
  } finally {
    loading.value = false
  }
}

function selectUser(user: UserSummary) {
  selectedUser.value = user
}

function clearSelection() {
  selectedUser.value = null
}

void loadUsers()
</script>

<template>
  <AppLayout>
    <div class="flex h-full">
      <!-- Panel izquierdo: Lista fija 380px -->
      <div
        class="w-full shrink-0 border-r border-surface lg:w-[380px]"
        :class="showDetail ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'"
      >
        <!-- Header de lista -->
        <div class="flex items-center justify-between border-b border-surface px-4 py-3">
          <h2 class="text-lg font-semibold text-color">Usuarios</h2>
          <Button icon="pi pi-plus" label="Nuevo" size="small" />
        </div>

        <!-- Lista de usuarios -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
          </div>
          <div v-else-if="!users?.items.length" class="py-8 text-center text-muted-color">
            <i class="pi pi-users mb-2 text-3xl" />
            <p>No hay usuarios</p>
          </div>
          <ul v-else>
            <li
              v-for="user in users.items"
              :key="user.id"
              class="cursor-pointer border-b border-surface px-4 py-3 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
              :class="selectedUser?.id === user.id ? 'bg-primary/10' : ''"
              @click="selectUser(user)"
            >
              <p class="font-medium text-color">{{ user.fullName }}</p>
              <p class="text-sm text-muted-color">{{ user.email }}</p>
              <div class="mt-1 flex gap-1">
                <span
                  v-for="role in user.roles"
                  :key="role.id"
                  class="rounded-full bg-surface-100 dark:bg-surface-800 px-2 py-0.5 text-xs text-muted-color"
                >
                  {{ role.name }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Panel derecho: Detalle -->
      <div v-if="showDetail" class="flex flex-1 flex-col overflow-hidden">
        <!-- Detail header with back button (mobile) -->
        <div class="flex items-center gap-2 border-b border-surface px-4 py-3">
          <Button
            icon="pi pi-arrow-left"
            text
            rounded
            severity="secondary"
            class="lg:hidden"
            @click="clearSelection"
          />
          <h2 class="text-lg font-semibold text-color">{{ selectedUser?.fullName }}</h2>
        </div>

        <!-- Detail content placeholder (F3-04 will replace) -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6">
            <div class="mb-4 flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <i class="pi pi-user text-xl text-primary" />
              </div>
              <div>
                <p class="font-semibold text-color">{{ selectedUser?.fullName }}</p>
                <p class="text-sm text-muted-color">{{ selectedUser?.email }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-muted-color">Estado</p>
                <p class="text-color">
                  {{ selectedUser?.isActive ? 'Activo' : 'Inactivo' }}
                </p>
              </div>
              <div>
                <p class="text-muted-color">Roles</p>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="role in selectedUser?.roles"
                    :key="role.id"
                    class="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                  >
                    {{ role.name }}
                  </span>
                </div>
              </div>
              <div>
                <p class="text-muted-color">Creado</p>
                <p class="text-color">{{ selectedUser?.createdAt }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío desktop -->
      <div v-else class="hidden flex-1 items-center justify-center lg:flex">
        <div class="text-center">
          <i class="pi pi-users mb-3 text-4xl text-muted-color" />
          <p class="text-muted-color">Selecciona un usuario para ver su detalle</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
