<script setup lang="ts">
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { UserInvitation } from '@/types/access'
import type { ApiError } from '@/types/api'

const api = useAccessApi()
const toast = useToast()

const invitations = ref<UserInvitation[]>([])
const loading = ref(false)

const statusSeverity: Record<string, 'warn' | 'success' | 'danger'> = {
  pending: 'warn',
  accepted: 'success',
  expired: 'danger',
}

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  expired: 'Expirada',
}

async function loadInvitations() {
  loading.value = true
  try {
    const result = await api.getInvitations({ pageSize: 100 })
    invitations.value = result.items
  } finally {
    loading.value = false
  }
}

async function resend(invitation: UserInvitation) {
  try {
    await api.resendInvitation(invitation.id)
    toast.add({ severity: 'success', summary: 'Invitación reenviada', life: 3000 })
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({
      severity: 'error',
      summary: apiError.title ?? 'Error al reenviar invitación',
      life: 5000,
    })
  }
}

async function revoke(invitation: UserInvitation) {
  try {
    await api.revokeInvitation(invitation.id)
    invitations.value = invitations.value.filter((i) => i.id !== invitation.id)
    toast.add({ severity: 'success', summary: 'Invitación revocada', life: 3000 })
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({
      severity: 'error',
      summary: apiError.title ?? 'Error al revocar invitación',
      life: 5000,
    })
  }
}

void loadInvitations()
</script>

<template>
  <div class="flex flex-col gap-4">
    <h3 class="text-lg font-semibold text-color">Invitaciones</h3>

    <DataTable
      :value="invitations"
      :loading="loading"
      data-key="id"
      striped-rows
      class="text-sm"
    >
      <template #empty>
        <div class="py-6 text-center text-muted-color">
          <i class="pi pi-envelope mb-2 text-3xl" />
          <p>No hay invitaciones</p>
        </div>
      </template>

      <Column field="email" header="Correo electrónico" class="min-w-48" />

      <Column field="status" header="Estado" class="w-32">
        <template #body="{ data: invitation }">
          <Tag
            :value="statusLabel[invitation.status] ?? invitation.status"
            :severity="statusSeverity[invitation.status] ?? 'secondary'"
          />
        </template>
      </Column>

      <Column field="expiresAt" header="Expira" class="w-40" />

      <Column header="Acciones" class="w-28">
        <template #body="{ data: invitation }">
          <div class="flex gap-1">
            <Button
              v-if="invitation.status === 'pending'"
              v-tooltip.top="'Reenviar'"
              icon="pi pi-refresh"
              text
              rounded
              severity="secondary"
              size="small"
              @click="resend(invitation)"
            />
            <Button
              v-if="invitation.status === 'pending'"
              v-tooltip.top="'Revocar'"
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              size="small"
              @click="revoke(invitation)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
