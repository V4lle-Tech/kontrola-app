<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { apiClient } from '@/api/client'

interface AdminKPIs {
  totalTenants: number
  activeTenants: number
  totalUsers: number
  mrr: number
  newTenantsThisMonth: number
  churnRate: number
}

const kpis = ref<AdminKPIs | null>(null)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<AdminKPIs>('/admin/kpis')
    kpis.value = data
  } finally { loading.value = false }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

onMounted(() => { void load() })
</script>

<template>
  <AdminLayout>
    <h1 class="mb-6 text-2xl font-bold text-color">Dashboard</h1>
    <div v-if="loading" class="flex justify-center py-12">
      <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
    </div>
    <div v-else-if="kpis" class="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <div class="rounded-lg border border-surface bg-surface-0 p-5 dark:bg-surface-900">
        <p class="text-sm text-muted-color">Tenants Activos</p>
        <p class="text-2xl font-bold text-color">{{ kpis.activeTenants }}</p>
        <p class="text-xs text-muted-color">de {{ kpis.totalTenants }} totales</p>
      </div>
      <div class="rounded-lg border border-surface bg-surface-0 p-5 dark:bg-surface-900">
        <p class="text-sm text-muted-color">Usuarios Totales</p>
        <p class="text-2xl font-bold text-color">{{ kpis.totalUsers }}</p>
      </div>
      <div class="rounded-lg border border-surface bg-surface-0 p-5 dark:bg-surface-900">
        <p class="text-sm text-muted-color">MRR</p>
        <p class="text-2xl font-bold text-color">{{ formatCurrency(kpis.mrr) }}</p>
      </div>
      <div class="rounded-lg border border-surface bg-surface-0 p-5 dark:bg-surface-900">
        <p class="text-sm text-muted-color">Nuevos este mes</p>
        <p class="text-2xl font-bold text-color">{{ kpis.newTenantsThisMonth }}</p>
      </div>
      <div class="rounded-lg border border-surface bg-surface-0 p-5 dark:bg-surface-900">
        <p class="text-sm text-muted-color">Churn Rate</p>
        <p class="text-2xl font-bold text-color">{{ kpis.churnRate }}%</p>
      </div>
    </div>
  </AdminLayout>
</template>
