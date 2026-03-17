<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import OnboardingChecklist from '@/components/shared/OnboardingChecklist.vue'
import KontrolaStatCard from '@/components/kontrola/KontrolaStatCard.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'

const auth = useAuthStore()

const stats = [
  {
    title: 'Candidatos',
    value: '—',
    change: 'Próximamente',
    changeType: 'neutral' as const,
    icon: 'pi pi-users',
  },
  {
    title: 'Vacantes activas',
    value: '—',
    change: 'Próximamente',
    changeType: 'neutral' as const,
    icon: 'pi pi-briefcase',
  },
  {
    title: 'Documentos',
    value: '—',
    change: 'Próximamente',
    changeType: 'neutral' as const,
    icon: 'pi pi-file',
  },
  {
    title: 'Clientes',
    value: '—',
    change: 'Próximamente',
    changeType: 'neutral' as const,
    icon: 'pi pi-building',
  },
]
</script>

<template>
  <AppLayout>
    <div class="h-full overflow-y-auto">
      <div class="space-y-6 p-6">
        <!-- Header -->
        <div>
          <h1 class="text-2xl font-bold text-color">Dashboard</h1>
          <p class="mt-1 text-muted-color">Resumen de tu negocio</p>
        </div>

        <!-- Welcome Card -->
        <Card class="bg-primary text-primary-contrast">
          <template #content>
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <i class="pi pi-th-large text-2xl" />
              </div>
              <div>
                <h2 class="text-xl font-semibold">
                  Bienvenido, {{ auth.user?.givenName ?? 'Usuario' }}
                </h2>
                <p class="mt-1 opacity-90">Tu panel de control está listo. Pronto podrás gestionar todo tu negocio desde aquí.</p>
              </div>
            </div>
          </template>
        </Card>

        <!-- Stats Grid -->
        <section class="space-y-4">
          <h3 class="flex items-center gap-2 text-lg font-semibold text-color">
            <i class="pi pi-th-large text-muted-color" />
            Resumen
          </h3>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <KontrolaStatCard
              v-for="stat in stats"
              :key="stat.title"
              :title="stat.title"
              :value="stat.value"
              :change="stat.change"
              :change-type="stat.changeType"
              :icon="stat.icon"
            />
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="space-y-4">
          <h3 class="flex items-center gap-2 text-lg font-semibold text-color">
            <i class="pi pi-bolt text-muted-color" />
            Acciones Rápidas
          </h3>
          <Card>
            <template #content>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Button disabled class="flex h-auto items-center justify-start gap-3 p-4" text>
                  <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-800">
                    <i class="pi pi-users text-lg" />
                  </div>
                  <div class="text-left">
                    <p class="font-medium">Nuevo Candidato</p>
                    <p class="text-sm text-muted-color">Próximamente</p>
                  </div>
                </Button>
                <Button disabled class="flex h-auto items-center justify-start gap-3 p-4" text>
                  <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-800">
                    <i class="pi pi-briefcase text-lg" />
                  </div>
                  <div class="text-left">
                    <p class="font-medium">Nueva Vacante</p>
                    <p class="text-sm text-muted-color">Próximamente</p>
                  </div>
                </Button>
                <Button disabled class="flex h-auto items-center justify-start gap-3 p-4" text>
                  <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-800">
                    <i class="pi pi-file text-lg" />
                  </div>
                  <div class="text-left">
                    <p class="font-medium">Nuevo Documento</p>
                    <p class="text-sm text-muted-color">Próximamente</p>
                  </div>
                </Button>
              </div>
            </template>
          </Card>

          <Message severity="info">
            <strong>Cuenta creada exitosamente.</strong>
            Este es un dashboard inicial. Las funcionalidades completas estarán disponibles próximamente.
          </Message>
        </section>

        <!-- Onboarding -->
        <OnboardingChecklist />
      </div>
    </div>
  </AppLayout>
</template>
