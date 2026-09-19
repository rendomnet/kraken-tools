<template>
  <DialogRoot v-bind="props" @update:open="$emit('update:open', $event)">
    <slot />
  </DialogRoot>
</template>

<script setup lang="ts">
import { DialogRoot, type DialogRootEmits, type DialogRootProps } from 'radix-vue';

const props = defineProps<DialogRootProps>();
defineEmits<DialogRootEmits>();
</script>
