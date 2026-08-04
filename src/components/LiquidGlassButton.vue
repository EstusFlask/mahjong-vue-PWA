<script setup>
/* global defineProps, defineEmits */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { LiquidGlass } from '@wxperia/liquid-glass-vue'

const GLASS_SETTINGS = Object.freeze({
  displacementScale: 64,
  blurAmount: 0.1,
  saturation: 130,
  aberrationIntensity: 2,
  elasticity: 0.35,
  cornerRadius: 100,
})

const props = defineProps({
  variant: {
    type: String,
    default: 'pill',
    validator: value => ['pill', 'circle'].includes(value),
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: Boolean,
  ariaLabel: String,
  title: String,
})

const emit = defineEmits(['click'])
const buttonRef = ref(null)
const buttonSize = ref({ width: 0, height: 0 })
let resizeObserver = null

const glassConfig = computed(() => props.variant === 'circle'
  ? { className: 'liquid-glass-button--circle', padding: '11px 12px' }
  : { className: 'liquid-glass-button--pill', padding: '10px 18px' })

/*
 * The demo's 64px setting is tuned for a much larger glass surface. On a
 * 44px icon button it would displace more than the whole control, producing
 * chromatic smears instead of a clean edge. Keep the requested setting as
 * the ceiling, but scale the effective value to the rendered button size.
 */
const effectiveDisplacementScale = computed(() => {
  const fallbackSize = props.variant === 'circle' ? 44 : 64
  const shortSide = Math.min(
    buttonSize.value.width || fallbackSize,
    buttonSize.value.height || fallbackSize,
  )
  return Math.max(10, Math.min(
    GLASS_SETTINGS.displacementScale,
    Math.round(GLASS_SETTINGS.displacementScale * shortSide / 236),
  ))
})

function updateButtonSize() {
  if (!buttonRef.value) return
  const rect = buttonRef.value.getBoundingClientRect()
  buttonSize.value = { width: rect.width, height: rect.height }
}

onMounted(() => {
  updateButtonSize()
  if (typeof ResizeObserver === 'undefined' || !buttonRef.value) return
  resizeObserver = new ResizeObserver(updateButtonSize)
  resizeObserver.observe(buttonRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

function handleClick(event) {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    ref="buttonRef"
    class="liquid-glass-button"
    :class="glassConfig.className"
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :title="title"
    @click="handleClick"
  >
    <span class="liquid-glass-button__label" aria-hidden="true"><slot /></span>

    <span class="liquid-glass-button__glass">
      <LiquidGlass
        :displacement-scale="effectiveDisplacementScale"
        :blur-amount="GLASS_SETTINGS.blurAmount"
        :saturation="GLASS_SETTINGS.saturation"
        :aberration-intensity="GLASS_SETTINGS.aberrationIntensity"
        :elasticity="GLASS_SETTINGS.elasticity"
        :corner-radius="GLASS_SETTINGS.cornerRadius"
        :padding="glassConfig.padding"
        mode="standard"
        :mouse-container="buttonRef"
        :style="{ position: 'absolute', top: '50%', left: '50%' }"
      >
        <span class="liquid-glass-button__measure"><slot /></span>
      </LiquidGlass>
    </span>
  </button>
</template>

<style scoped>
.liquid-glass-button {
  align-items: center;
  appearance: none;
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: var(--text);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  justify-content: center;
  line-height: 1;
  overflow: visible !important;
  padding: 0;
  position: relative;
  isolation: isolate;
  touch-action: manipulation;
  transition:
    color 180ms ease,
    filter 180ms ease,
    transform 120ms cubic-bezier(0.22, 1, 0.36, 1);
}

.liquid-glass-button--pill {
  min-height: 2.7rem !important;
  padding: 0.64rem 1.12rem;
}

.liquid-glass-button--circle {
  height: 2.75rem;
  width: 2.75rem;
}

.liquid-glass-button__label {
  font-size: 0.86rem;
  font-weight: 750;
  line-height: 1.1;
  position: relative;
  z-index: 1;
  visibility: hidden;
}

.liquid-glass-button--circle .liquid-glass-button__label {
  align-items: center;
  display: inline-flex;
  height: 1.25rem;
  justify-content: center;
  width: 1.25rem;
}

.liquid-glass-button__glass {
  background: transparent;
  border-radius: 100px;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
  z-index: 0;
}

.liquid-glass-button__glass :deep(*) {
  pointer-events: none;
}

/* Let the library-owned glass be the sole visible shell. Its filter and
 * backdrop still provide the refraction while this keeps the wrapper inert. */
.liquid-glass-button__glass :deep(.glass) {
  /* Keep the library's glass transparent enough for the backdrop refraction
   * to remain visible instead of painting a second opaque pill over it. */
  background: rgba(255, 255, 255, 0.24) !important;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.7),
    inset 0 -1px 0 rgba(69, 108, 135, 0.12),
    0 0.35rem 0.85rem rgba(44, 83, 113, 0.08) !important;
  display: flex !important;
  gap: 0 !important;
  justify-content: center !important;
  padding: 0 !important;
  transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1) !important;
}

/* The library's SVG displacement filter composites a dark edge on these
 * small controls. Keep the translucent blur, but avoid that bad raster pass. */
.liquid-glass-button__glass :deep(.glass__warp) {
  filter: none !important;
}

.liquid-glass-button__glass :deep(.relative),
.liquid-glass-button__glass > div {
  transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1) !important;
  will-change: transform;
}

/* Match the library's measured glass to the real button box, including
 * buttons that intentionally have a minimum width. */
.liquid-glass-button__glass :deep(.relative),
.liquid-glass-button__glass :deep(.glass) {
  box-sizing: border-box !important;
  height: 100% !important;
  width: 100% !important;
}

.liquid-glass-button__glass :deep(.glass > div:last-child) {
  color: inherit !important;
  font-family: inherit !important;
  font-size: 0.86rem !important;
  font-weight: 750 !important;
  line-height: 1.1 !important;
  text-shadow: none !important;
}

/* Hide only the optional black overlays. Keep the library's rounded rim
 * layers so the small controls retain their pill/circle silhouette. */
.liquid-glass-button__glass :deep(> div:nth-child(-n + 2)) {
  display: none !important;
}

.liquid-glass-button__glass :deep(> span) {
  box-shadow:
    0 0 0 0.5px rgba(255, 255, 255, 0.5) inset,
    0 1px 3px rgba(255, 255, 255, 0.25) inset !important;
}

.liquid-glass-button--pill .liquid-glass-button__glass :deep(.glass) {
  border: 1px solid rgba(75, 111, 137, 0.34) !important;
}

.liquid-glass-button--circle .liquid-glass-button__glass :deep(.glass) {
  border: 1px solid rgba(75, 111, 137, 0.28) !important;
}

.liquid-glass-button.clear-button .liquid-glass-button__glass :deep(.glass) {
  border: 1px solid rgba(183, 78, 101, 0.7) !important;
}

.liquid-glass-button.calculate-button .liquid-glass-button__glass :deep(.glass) {
  border: 1px solid rgba(44, 126, 89, 0.7) !important;
}

.liquid-glass-button__measure {
  display: inline-block;
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 750;
  line-height: 1.1;
  white-space: nowrap;
}

.liquid-glass-button--circle .liquid-glass-button__measure {
  align-items: center;
  display: flex;
  height: 1.25rem;
  justify-content: center;
  width: 1.25rem;
}

.liquid-glass-button:hover:not(:disabled) {
  color: var(--teal-strong);
  filter: brightness(1.035) saturate(1.04);
}

.liquid-glass-button:active:not(:disabled),
.liquid-glass-button.is-pressing:not(:disabled) {
  transform: scale(0.96) translateY(0.04rem);
}

.liquid-glass-button:focus-visible {
  outline: 0.15rem solid rgba(25, 142, 176, 0.7);
  outline-offset: 0.18rem;
}

.liquid-glass-button:disabled {
  cursor: not-allowed;
  filter: saturate(0.55);
  opacity: 0.72;
}
</style>
