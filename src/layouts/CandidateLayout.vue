<script setup lang="ts">
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { useCandidateAuthStore } from '@/stores/useCandidateAuthStore'

interface Props {
  showNav?: boolean
}

withDefaults(defineProps<Props>(), { showNav: true })
const router = useRouter()
const candidateAuth = useCandidateAuthStore()

function logout() {
  candidateAuth.clearToken()
  router.push({ name: 'candidate.login' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950">
    <header v-if="showNav" class="border-b border-surface bg-surface-0 dark:bg-surface-900" role="banner">
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <router-link :to="{ name: 'candidate.jobs' }" class="text-xl font-bold text-color no-underline" aria-label="Inicio - Kontrola">
          Kontrola
        </router-link>
        <nav class="flex items-center gap-2" aria-label="Navegación del portal">
          <router-link :to="{ name: 'candidate.jobs' }">
            <Button label="Vacantes" text size="small" />
          </router-link>
          <template v-if="candidateAuth.isAuthenticated">
            <router-link :to="{ name: 'candidate.dashboard' }">
              <Button label="Mis Aplicaciones" text size="small" />
            </router-link>
            <Button label="Salir" icon="pi pi-sign-out" text size="small" severity="secondary" aria-label="Cerrar sesión" @click="logout" />
          </template>
          <template v-else>
            <router-link :to="{ name: 'candidate.login' }">
              <Button label="Iniciar sesión" text size="small" />
            </router-link>
          </template>
        </nav>
      </div>
    </header>
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6" role="main">
      <slot />
    </main>
    <footer class="border-t border-surface py-4 text-center text-sm text-muted-color" role="contentinfo">
      &copy; {{ new Date().getFullYear() }} Kontrola — Portal de Candidatos
    </footer>
  </div>
</template>
