<script setup lang="ts">
interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

withDefaults(defineProps<Props>(), {
    size: 'md',
});

const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg',
};
</script>

<template>
    <!-- Icon placeholder - replace with actual logo when available -->
    <div class="flex shrink-0 items-center justify-center rounded-lg bg-primary" :class="sizeClasses[size]">
        <span class="font-bold text-primary-contrast">K</span>
    </div>
</template>
