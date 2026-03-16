<script setup lang="ts">
import Button from 'primevue/button'
import { usePreferencesStore } from '@/stores/usePreferencesStore'
import type { ThemeMode } from '@/stores/usePreferencesStore'

const preferences = usePreferencesStore()

const modes: { value: ThemeMode; icon: string; label: string }[] = [
  { value: 'light', icon: 'pi pi-sun', label: 'Claro' },
  { value: 'dark', icon: 'pi pi-moon', label: 'Oscuro' },
  { value: 'system', icon: 'pi pi-desktop', label: 'Sistema' },
]

function cycle() {
  const currentIndex = modes.findIndex((m) => m.value === preferences.themeMode)
  const nextIndex = (currentIndex + 1) % modes.length
  const next = modes[nextIndex] as (typeof modes)[number]
  preferences.setTheme(next.value)
}

function currentIcon(): string {
  return modes.find((m) => m.value === preferences.themeMode)?.icon ?? 'pi pi-sun'
}

function currentLabel(): string {
  return modes.find((m) => m.value === preferences.themeMode)?.label ?? 'Claro'
}
</script>

<template>
  <Button
    :icon="currentIcon()"
    text
    rounded
    severity="secondary"
    :title="currentLabel()"
    @click="cycle"
  />
</template>
