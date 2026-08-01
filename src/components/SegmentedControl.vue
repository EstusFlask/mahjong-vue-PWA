<template>
  <div
    ref="root"
    class="segmented-control"
    :class="{ 'is-tab-control': semantics === 'tab' }"
    :role="groupRole"
    v-bind="$attrs"
  >
    <div ref="track" class="segmented-track">
      <span
        class="segmented-indicator"
        :class="{ 'is-ready': indicatorReady }"
        :style="indicatorStyle"
        aria-hidden="true"
      ></span>

      <button
        v-for="(option, index) in options"
        :key="option.value"
        class="segmented-option"
        :class="{ 'is-selected': isSelected(option) }"
        type="button"
        :role="optionRole"
        :aria-checked="semantics === 'radio' ? isSelected(option) : undefined"
        :aria-selected="semantics === 'tab' ? isSelected(option) : undefined"
        :tabindex="isSelected(option) ? 0 : -1"
        :disabled="option.disabled"
        @click="select(option)"
        @keydown="onKeydown($event, index)"
      >
        <span class="segmented-option-label">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SegmentedControl',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number, Boolean],
      default: null,
    },
    options: {
      type: Array,
      required: true,
    },
    semantics: {
      type: String,
      default: 'radio',
      validator: (value) => ['radio', 'tab'].includes(value),
    },
  },
  data() {
    return {
      indicatorX: 0,
      indicatorWidth: 0,
      indicatorReady: false,
      targetX: 0,
      targetWidth: 0,
      springVelocityX: 0,
      animationFrame: null,
      resizeFrame: null,
      resizeObserver: null,
    };
  },
  computed: {
    activeIndex() {
      const index = this.options.findIndex((option) => option.value === this.modelValue);
      return index >= 0 ? index : 0;
    },
    groupRole() {
      return this.semantics === 'tab' ? 'tablist' : 'radiogroup';
    },
    optionRole() {
      return this.semantics === 'tab' ? 'tab' : 'radio';
    },
    indicatorStyle() {
      return {
        transform: `translate3d(${this.indicatorX}px, 0, 0)`,
        width: `${this.indicatorWidth}px`,
      };
    },
  },
  watch: {
    modelValue() {
      this.$nextTick(() => this.animateToSelected());
    },
    options: {
      deep: true,
      handler() {
        this.$nextTick(() => this.animateToSelected());
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.syncIndicator(true);
      this.observeSize();
    });
  },
  beforeUnmount() {
    this.stopAnimation();
    if (this.resizeFrame !== null) {
      cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = null;
    }
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    isSelected(option) {
      return option.value === this.modelValue;
    },
    select(option) {
      if (!option.disabled && option.value !== this.modelValue) {
        this.$emit('update:modelValue', option.value);
      }
    },
    onKeydown(event, index) {
      const directionKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!directionKeys.includes(event.key)) {
        return;
      }

      event.preventDefault();
      const enabledOptions = this.options
        .map((option, optionIndex) => ({ option, optionIndex }))
        .filter(({ option }) => !option.disabled);
      if (!enabledOptions.length) {
        return;
      }

      const currentPosition = Math.max(
        0,
        enabledOptions.findIndex(({ optionIndex }) => optionIndex === index),
      );
      let nextPosition = currentPosition;
      if (event.key === 'ArrowLeft') nextPosition -= 1;
      if (event.key === 'ArrowRight') nextPosition += 1;
      if (event.key === 'Home') nextPosition = 0;
      if (event.key === 'End') nextPosition = enabledOptions.length - 1;

      nextPosition = Math.max(0, Math.min(nextPosition, enabledOptions.length - 1));
      const nextOption = enabledOptions[nextPosition].option;
      this.select(nextOption);
      this.$nextTick(() => {
        const buttons = this.$refs.track.querySelectorAll('.segmented-option');
        buttons[enabledOptions[nextPosition].optionIndex]?.focus();
      });
    },
    observeSize() {
      window.addEventListener('resize', this.handleResize, { passive: true });
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.scheduleIndicatorSync());
        this.resizeObserver.observe(this.$refs.track);
      }
    },
    handleResize() {
      this.scheduleIndicatorSync();
    },
    scheduleIndicatorSync() {
      if (this.resizeFrame !== null) return;

      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = null;
        this.$nextTick(() => this.syncIndicator(false));
      });
    },
    measureSelectedOption() {
      const track = this.$refs.track;
      if (!track) return null;

      const optionCount = this.options.length;
      if (!optionCount || !track.offsetWidth) return null;

      const trackStyles = window.getComputedStyle(track);
      const inset = parseFloat(trackStyles.paddingLeft) || 0;
      const gap = parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;
      const availableWidth = track.clientWidth - (inset * 2) - (gap * (optionCount - 1));
      const optionWidth = availableWidth / optionCount;
      if (optionWidth <= 0) return null;

      return {
        x: this.activeIndex * (optionWidth + gap),
        width: optionWidth,
      };
    },
    syncIndicator(immediate) {
      const measurement = this.measureSelectedOption();
      if (!measurement) return;

      const targetChanged = Math.abs(this.targetX - measurement.x) > 0.05
        || Math.abs(this.targetWidth - measurement.width) > 0.05;
      if (!immediate && this.indicatorReady && !targetChanged) return;

      this.targetX = measurement.x;
      this.targetWidth = measurement.width;
      if (immediate || !this.indicatorReady || this.prefersReducedMotion()) {
        this.stopAnimation();
        this.indicatorX = measurement.x;
        this.indicatorWidth = measurement.width;
        this.springVelocityX = 0;
        this.indicatorReady = true;
        return;
      }

      this.startAnimation();
    },
    prefersReducedMotion() {
      return typeof window !== 'undefined'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    animateToSelected() {
      this.syncIndicator(false);
    },
    startAnimation() {
      if (this.animationFrame !== null) return;

      // Critically damped spring: response is about 0.34s and has no artificial bounce.
      const stiffness = 360;
      const damping = 2 * Math.sqrt(stiffness);
      let previousTime = performance.now();

      const tick = (now) => {
        const delta = Math.min((now - previousTime) / 1000 || 0.016, 0.032);
        previousTime = now;

        const accelerationX = stiffness * (this.targetX - this.indicatorX)
          - damping * this.springVelocityX;
        this.springVelocityX += accelerationX * delta;
        this.indicatorX += this.springVelocityX * delta;

        const settled = Math.abs(this.targetX - this.indicatorX) < 0.1
          && Math.abs(this.springVelocityX) < 0.1;

        if (settled) {
          this.indicatorX = this.targetX;
          this.indicatorWidth = this.targetWidth;
          this.springVelocityX = 0;
          this.animationFrame = null;
          return;
        }

        this.animationFrame = requestAnimationFrame(tick);
      };

      this.animationFrame = requestAnimationFrame(tick);
    },
    stopAnimation() {
      if (this.animationFrame !== null) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    },
  },
};
</script>

<style>
.segmented-control {
  display: inline-flex;
  min-width: 0;
}

.segmented-track {
  --segment-gap: 0.2rem;
  --segment-inset: 0.2rem;
  align-items: stretch;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82), 0 0.4rem 1.2rem rgba(44, 83, 113, 0.06);
  display: flex;
  gap: var(--segment-gap);
  min-width: 0;
  padding: var(--segment-inset);
  position: relative;
  width: 100%;
}

/*
 * The glass treatment below is adapted from LGGC-liquid-glass by Guochen Wang
 * under the MIT license: https://github.com/u7663394/LGGC-liquid-glass
 */
.segmented-indicator {
  --lggc-blur: 0.9rem;
  --lggc-highlight: rgba(255, 255, 255, 0.86);
  background: rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(calc(var(--lggc-blur) * 0.35)) saturate(160%);
  -webkit-backdrop-filter: blur(calc(var(--lggc-blur) * 0.35)) saturate(160%);
  border: 1px double rgba(51, 51, 51, 0.08);
  border-radius: 9999px;
  box-shadow:
    inset 1.5px -1.5px 1px -1px var(--lggc-highlight),
    inset -1.5px 1.5px 1px -1px rgba(255, 255, 255, 0.9),
    inset 0 0 3px rgba(15, 23, 42, 0.28),
    0 0.45rem 1rem rgba(44, 83, 113, 0.14);
  height: calc(100% - (var(--segment-inset) * 2));
  isolation: isolate;
  left: var(--segment-inset);
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  top: var(--segment-inset);
  transform-origin: left center;
  transition: opacity 120ms ease;
  will-change: transform;
  width: 0;
  z-index: 0;
}

.segmented-indicator::before,
.segmented-indicator::after {
  border-radius: inherit;
  content: "";
  pointer-events: none;
  position: absolute;
}

.segmented-indicator::before {
  border: 1px double rgba(40, 70, 90, 0.18);
  filter: blur(var(--lggc-blur));
  height: calc(100% - 1rem);
  left: 50%;
  top: 35%;
  transform: translateX(-50%);
  width: calc(100% - 1rem);
}

.segmented-indicator::after {
  background: linear-gradient(115deg, rgba(255, 255, 255, 0.42), transparent 32%, rgba(255, 255, 255, 0.16));
  inset: 0;
}

.segmented-indicator.is-ready {
  opacity: 1;
}

.segmented-option {
  align-items: center;
  appearance: none;
  background: transparent;
  border: 0;
  border-radius: 999px;
  color: var(--muted, #64758b);
  cursor: pointer;
  display: inline-flex;
  flex: 1 1 0;
  font: inherit;
  font-size: 0.92rem;
  font-weight: 650;
  justify-content: center;
  line-height: 1.25;
  min-height: 2.25rem;
  min-width: 0;
  padding: 0.55rem 0.85rem;
  position: relative;
  transition: color 180ms ease, transform 120ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 1;
}

.segmented-option:hover:not(:disabled) {
  color: var(--teal-strong, #08779d);
}

.segmented-option.is-selected {
  color: var(--teal-strong, #08779d);
}

.segmented-option:active:not(:disabled) {
  transform: scale(0.96);
}

.segmented-option:focus-visible {
  outline: 0.15rem solid rgba(25, 142, 176, 0.7);
  outline-offset: 0.08rem;
  z-index: 2;
}

.segmented-option:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.segmented-option-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .segmented-indicator {
    transition: none;
  }

  .segmented-option {
    transition: color 1ms linear;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .segmented-indicator {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(82, 121, 153, 0.24);
  }

  .segmented-indicator::before {
    display: none;
  }
}
</style>
