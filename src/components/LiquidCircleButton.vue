<script setup>
/* global defineProps */
import LiquidGlassButton from './LiquidGlassButton.vue'

defineProps({
  type: {
    type: String,
    default: 'button',
  },
  disabled: Boolean,
  ariaLabel: String,
  title: String,
})
</script>

<template>
  <LiquidGlassButton
    variant="circle"
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :title="title"
    v-bind="$attrs"
  >
    <slot />
  </LiquidGlassButton>
</template>
