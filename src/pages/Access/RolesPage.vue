<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import AppLayout from '@/layouts/AppLayout.vue'
import RolesList from '@/components/access/RolesList.vue'
import RoleDetail from '@/components/access/RoleDetail.vue'
import RoleForm from '@/components/access/RoleForm.vue'
import type { Role } from '@/types/access'

const selectedRole = ref<Role | null>(null)
const listKey = ref(0)
const showFormDialog = ref(false)
const editingRole = ref<Role | null>(null)

const showDetail = computed(() => selectedRole.value !== null)

function selectRole(role: Role) {
  selectedRole.value = role
}

function clearSelection() {
  selectedRole.value = null
}

function openCreate() {
  editingRole.value = null
  showFormDialog.value = true
}

function openEdit(role: Role) {
  editingRole.value = role
  showFormDialog.value = true
}

function onRoleSaved(role: Role) {
  showFormDialog.value = false
  listKey.value++
  selectedRole.value = role
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
          @create="openCreate"
        />
      </div>

      <!-- Panel derecho: Detalle -->
      <div v-if="showDetail && selectedRole" class="flex flex-1 flex-col overflow-hidden">
        <RoleDetail
          :role="selectedRole"
          @back="clearSelection"
          @edit="openEdit"
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

    <!-- Create/Edit role dialog -->
    <Dialog
      v-model:visible="showFormDialog"
      modal
      :header="editingRole ? 'Editar Rol' : 'Nuevo Rol'"
      class="w-full max-w-2xl"
    >
      <RoleForm
        :key="editingRole?.id ?? 'new'"
        :role="editingRole"
        @saved="onRoleSaved"
        @cancel="showFormDialog = false"
      />
    </Dialog>
  </AppLayout>
</template>
