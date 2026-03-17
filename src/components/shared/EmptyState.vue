<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon?: string
  title: string
  description?: string
  variant?: 'default' | 'compact' | 'inline'
  type?: 'empty' | 'no-results'
  searchTerm?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  description: undefined,
  variant: 'default',
  type: 'empty',
  searchTerm: undefined,
})

const containerClasses = computed(
  () =>
    ({
      default: 'flex flex-col items-center justify-center py-12 text-center',
      compact: 'flex flex-col items-center justify-center py-8 text-center',
      inline: 'flex items-center gap-3 py-4 px-3 text-left',
    })[props.variant],
)

const iconContainerClasses = computed(
  () =>
    ({
      default: 'w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4',
      compact: 'w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3',
      inline: 'w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0',
    })[props.variant],
)

const iconClasses = computed(
  () =>
    ({
      default: 'text-xl text-muted-color',
      compact: 'text-lg text-muted-color',
      inline: 'text-base text-muted-color',
    })[props.variant],
)

const titleClasses = computed(
  () =>
    ({
      default: 'text-sm font-medium text-color mb-1',
      compact: 'text-sm font-medium text-color mb-1',
      inline: 'text-sm font-medium text-color',
    })[props.variant],
)

const descriptionClasses = computed(
  () =>
    ({
      default: 'text-sm text-muted-color max-w-sm',
      compact: 'text-sm text-muted-color max-w-xs',
      inline: 'text-xs text-muted-color',
    })[props.variant],
)

const resolvedIcon = computed(() => {
  if (props.icon) return props.icon
  return props.type === 'no-results' ? 'pi pi-search' : 'pi pi-inbox'
})
</script>

<template>
  <div :class="containerClasses" role="status" aria-live="polite">
    <div :class="iconContainerClasses">
      <i :class="[resolvedIcon, iconClasses]" aria-hidden="true" />
    </div>
    <div :class="variant === 'inline' ? 'min-w-0 flex-1' : ''">
      <h3 :class="titleClasses">{{ title }}</h3>
      <p v-if="description" :class="descriptionClasses">{{ description }}</p>
      <p v-else-if="type === 'no-results' && searchTerm" :class="descriptionClasses">
        Intenta con otro término o revisa los filtros
      </p>
    </div>
    <div v-if="$slots.action" :class="variant === 'inline' ? '' : 'mt-4'">
      <slot name="action" />
    </div>
  </div>
</template>
