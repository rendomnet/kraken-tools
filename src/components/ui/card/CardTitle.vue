<template>
  <h3 :class="cn('font-title text-base font-bold leading-none tracking-tight text-foreground', $attrs.class ?? '')">
    <slot />
  </h3>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';
</script>
