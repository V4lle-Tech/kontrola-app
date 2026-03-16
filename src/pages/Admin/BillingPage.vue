<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { apiClient } from '@/api/client'

interface Subscription {
  id: string
  tenantName: string
  plan: string
  status: 'active' | 'past_due' | 'cancelled'
  amount: number
  nextBillingDate: string | null
  createdAt: string
}

const subscriptions = ref<Subscription[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<Subscription[]>('/admin/billing/subscriptions')
    subscriptions.value = data
  } finally { loading.value = false }
}

function statusSeverity(status: string): string {
  const map: Record<string, string> = { active: 'success', past_due: 'warn', cancelled: 'danger' }
  return map[status] ?? 'secondary'
}

function statusLabel(status: string): string {
  const map: Record<string, string> = { active: 'Activa', past_due: 'Vencida', cancelled: 'Cancelada' }
  return map[status] ?? status
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => { void load() })
</script>

<template>
  <AdminLayout>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-color">Billing</h1>
      <Button icon="pi pi-refresh" severity="secondary" text :loading="loading" @click="load" />
    </div>
    <DataTable :value="subscriptions" :loading="loading">
      <Column field="tenantName" header="Tenant" />
      <Column field="plan" header="Plan" />
      <Column header="Monto" style="width: 140px">
        <template #body="{ data }"><span class="font-medium text-color">{{ formatCurrency(data.amount) }}</span></template>
      </Column>
      <Column header="Estado" style="width: 120px">
        <template #body="{ data }"><Tag :value="statusLabel(data.status)" :severity="statusSeverity(data.status)" /></template>
      </Column>
      <Column header="Próximo cobro" style="width: 140px">
        <template #body="{ data }"><span class="text-sm text-muted-color">{{ formatDate(data.nextBillingDate) }}</span></template>
      </Column>
      <template #empty>
        <div class="py-8 text-center"><p class="text-muted-color">No hay suscripciones</p></div>
      </template>
    </DataTable>
  </AdminLayout>
</template>
