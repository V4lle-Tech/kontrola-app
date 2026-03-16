<script setup lang="ts">
import Button from 'primevue/button'

interface ActionDef {
  label: string
  icon: string
  severity?: string
  event: string
}

interface Props {
  count: number
  actions?: ActionDef[]
}
withDefaults(defineProps<Props>(), {
  actions: () => [],
})

const emit = defineEmits<{
  clear: []
  action: [event: string]
}>()
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="count > 0"
      class="absolute right-0 bottom-4 left-0 z-10 mx-auto flex w-fit items-center gap-3 rounded-xl border border-surface bg-surface-0 px-4 py-2 shadow-lg dark:bg-surface-900"
    >
      <span class="text-sm font-medium text-color">
        {{ count }} seleccionado{{ count !== 1 ? 's' : '' }}
      </span>
      <div class="flex items-center gap-1">
        <Button
          v-for="action in actions"
          :key="action.event"
          :label="action.label"
          :icon="action.icon"
          :severity="(action.severity as 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast') ?? 'secondary'"
          size="small"
          text
          @click="emit('action', action.event)"
        />
        <Button
          icon="pi pi-times"
          severity="secondary"
          size="small"
          text
          rounded
          title="Limpiar selección"
          @click="emit('clear')"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}
</style>
