<template>
  <input
    :class="
      cn(
        'flex h-8 w-full rounded-md border border-border bg-input/40 px-3 py-1 text-xs text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
        $attrs.class ?? '',
      )
    "
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';

defineProps<{
  modelValue?: string | number;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>
