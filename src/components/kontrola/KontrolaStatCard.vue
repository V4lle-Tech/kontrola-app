<script setup lang="ts">
import Card from 'primevue/card'
import Skeleton from 'primevue/skeleton'
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  change: undefined,
  changeType: 'neutral',
  icon: undefined,
  loading: false,
})

const changeSeverity = computed(() => {
  if (props.changeType === 'positive') return 'success'
  if (props.changeType === 'negative') return 'danger'
  return 'secondary'
})
</script>

<template>
  <Card>
    <template #content>
      <div v-if="loading" class="flex items-start justify-between">
        <div class="flex-1 space-y-3">
          <Skeleton width="5rem" height="1rem" />
          <Skeleton width="6rem" height="2rem" />
          <Skeleton width="4rem" height="0.875rem" />
        </div>
        <Skeleton shape="circle" size="2.5rem" />
      </div>

      <div v-else class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-muted-color">{{ title }}</p>
          <p class="mt-2 text-2xl font-semibold text-color">{{ value }}</p>
          <p v-if="change" class="mt-1 text-sm" :class="`text-${changeSeverity}-color`">
            {{ change }}
          </p>
        </div>
        <div v-if="icon" class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-800">
          <i :class="icon" class="pi text-primary" />
        </div>
      </div>
    </template>
  </Card>
</template>
