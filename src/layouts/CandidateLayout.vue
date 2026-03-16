<script setup lang="ts">
import Button from 'primevue/button'
import { useRouter } from 'vue-router'

interface Props {
  showNav?: boolean
}

withDefaults(defineProps<Props>(), { showNav: true })
const router = useRouter()

const isAuthenticated = !!sessionStorage.getItem('candidate_token')

function logout() {
  sessionStorage.removeItem('candidate_token')
  router.push({ name: 'candidate.login' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950">
    <header v-if="showNav" class="border-b border-surface bg-surface-0 dark:bg-surface-900">
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <router-link :to="{ name: 'candidate.jobs' }" class="text-xl font-bold text-color no-underline">
          Kontrola
        </router-link>
        <nav class="flex items-center gap-2">
          <router-link :to="{ name: 'candidate.jobs' }">
            <Button label="Vacantes" text size="small" />
          </router-link>
          <template v-if="isAuthenticated">
            <router-link :to="{ name: 'candidate.dashboard' }">
              <Button label="Mis Aplicaciones" text size="small" />
            </router-link>
            <Button label="Salir" icon="pi pi-sign-out" text size="small" severity="secondary" @click="logout" />
          </template>
          <template v-else>
            <router-link :to="{ name: 'candidate.login' }">
              <Button label="Iniciar sesión" text size="small" />
            </router-link>
          </template>
        </nav>
      </div>
    </header>
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <slot />
    </main>
    <footer class="border-t border-surface py-4 text-center text-sm text-muted-color">
      &copy; {{ new Date().getFullYear() }} Kontrola — Portal de Candidatos
    </footer>
  </div>
</template>
