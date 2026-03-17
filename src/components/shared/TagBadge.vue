<script setup lang="ts">
import type { Tag } from '@/types/recruitment'
import Button from 'primevue/button'
import { computed } from 'vue'

interface Props {
  tag: Tag
  removable?: boolean
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  removable: false,
  size: 'sm',
})

const emit = defineEmits<{
  remove: []
}>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2 py-0.5 text-xs gap-1.5',
  }
  return sizes[props.size]
})
</script>

<template>
  <span
    :class="['inline-flex items-center rounded-full font-medium', sizeClasses]"
    :style="{ backgroundColor: tag.color + '20', color: tag.color }"
  >
    {{ tag.name }}
    <Button
      v-if="removable"
      type="button"
      icon="pi pi-times"
      text
      rounded
      :class="[size === 'sm' ? 'h-3 w-3 !p-0 text-[8px]' : 'h-3.5 w-3.5 !p-0 text-[10px]']"
      @click.stop="emit('remove')"
    />
  </span>
</template>
