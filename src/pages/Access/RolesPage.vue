<script setup lang="ts">
import { ref, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import RolesList from '@/components/access/RolesList.vue'
import RoleDetail from '@/components/access/RoleDetail.vue'
import type { Role } from '@/types/access'

const selectedRole = ref<Role | null>(null)
const listKey = ref(0)

const showDetail = computed(() => selectedRole.value !== null)

function selectRole(role: Role) {
  selectedRole.value = role
}

function clearSelection() {
  selectedRole.value = null
}

function onRoleDeleted() {
  selectedRole.value = null
  listKey.value++
}
</script>

<template>
  <AppLayout>
    <div class="flex h-full">
      <!-- Panel izquierdo: Lista fija 380px -->
      <div
        class="w-full shrink-0 border-r border-surface lg:w-[380px]"
        :class="showDetail ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'"
      >
        <RolesList
          :key="listKey"
          :selected-id="selectedRole?.id ?? null"
          @select="selectRole"
        />
      </div>

      <!-- Panel derecho: Detalle -->
      <div v-if="showDetail && selectedRole" class="flex flex-1 flex-col overflow-hidden">
        <RoleDetail
          :role="selectedRole"
          @back="clearSelection"
          @deleted="onRoleDeleted"
        />
      </div>

      <!-- Estado vacío desktop -->
      <div v-else class="hidden flex-1 items-center justify-center lg:flex">
        <div class="text-center">
          <i class="pi pi-shield mb-3 text-4xl text-muted-color" />
          <p class="text-muted-color">Selecciona un rol para ver su detalle</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
