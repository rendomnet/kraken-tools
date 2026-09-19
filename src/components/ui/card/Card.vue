<template>
  <div :class="cn('rounded-lg border border-border bg-card/60 backdrop-blur-md text-card-foreground shadow-sm transition-all', $attrs.class ?? '')">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';
</script>
