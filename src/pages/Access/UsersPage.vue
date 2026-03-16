<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import AppLayout from '@/layouts/AppLayout.vue'
import UsersList from '@/components/access/UsersList.vue'
import UserDetail from '@/components/access/UserDetail.vue'
import UserCreate from '@/components/access/UserCreate.vue'
import UserInvite from '@/components/access/UserInvite.vue'
import type { UserSummary } from '@/types/access'

const selectedUser = ref<UserSummary | null>(null)
const showCreateDialog = ref(false)
const showInviteDialog = ref(false)
const listKey = ref(0)

const showDetail = computed(() => selectedUser.value !== null)

function selectUser(user: UserSummary) {
  selectedUser.value = user
}

function clearSelection() {
  selectedUser.value = null
}

function onUserUpdated(user: UserSummary) {
  selectedUser.value = user
  listKey.value++
}

function onUserDeleted() {
  selectedUser.value = null
  listKey.value++
}

function onUserCreated(user: UserSummary) {
  showCreateDialog.value = false
  listKey.value++
  selectedUser.value = user
}

function onUserInvited() {
  showInviteDialog.value = false
  listKey.value++
}

function openCreate() {
  showCreateDialog.value = true
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
        <UsersList
          :key="listKey"
          :selected-id="selectedUser?.id ?? null"
          @select="selectUser"
          @create="openCreate"
        />
      </div>

      <!-- Panel derecho: Detalle -->
      <div v-if="showDetail && selectedUser" class="flex flex-1 flex-col overflow-hidden">
        <UserDetail
          :user="selectedUser"
          @back="clearSelection"
          @updated="onUserUpdated"
          @deleted="onUserDeleted"
        />
      </div>

      <!-- Estado vacío desktop -->
      <div v-else class="hidden flex-1 items-center justify-center lg:flex">
        <div class="text-center">
          <i class="pi pi-users mb-3 text-4xl text-muted-color" />
          <p class="text-muted-color">Selecciona un usuario para ver su detalle</p>
        </div>
      </div>
    </div>

    <!-- Create user dialog -->
    <Dialog
      v-model:visible="showCreateDialog"
      modal
      header="Nuevo Usuario"
      class="w-full max-w-2xl"
    >
      <UserCreate
        @created="onUserCreated"
        @cancel="showCreateDialog = false"
      />
    </Dialog>

    <!-- Invite user dialog -->
    <Dialog
      v-model:visible="showInviteDialog"
      modal
      header="Invitar Usuario"
      class="w-full max-w-md"
    >
      <UserInvite
        @invited="onUserInvited"
        @cancel="showInviteDialog = false"
      />
    </Dialog>
  </AppLayout>
</template>
