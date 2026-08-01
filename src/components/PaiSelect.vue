<template>
  <button
    class="tile-button"
    :class="{
      horiz: name && name[0] === 'H',
      pressed: isPressed,
      dragging: isDragging,
      disabled: disabled,
    }"
    type="button"
    :draggable="!disabled"
    :disabled="disabled"
    :aria-label="`麻将牌 ${name}`"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @mousedown="onMouseDown"
    @dragstart="onNativeDragStart"
    @dragend="onNativeDragEnd"
    @click="onClick"
  >
    <img
      :src='require("../assets/"+name+".webp")'
      :alt="`麻将牌 ${name}`"
      draggable="false"
    />
  </button>
</template>

<script>
export default {
  name: "PaiSelect",
  emits: ["click", "drag-start", "drag-move", "drag-end", "drag-cancel"],
  props: {
    name: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      pointerId: null,
      startPoint: null,
      sourceElement: null,
      isDragging: false,
      isPressed: false,
      suppressClick: false,
    };
  },
  methods: {
    pointPayload(event) {
      const source = this.sourceElement || event.currentTarget;
      const rect = source && source.getBoundingClientRect
        ? source.getBoundingClientRect()
        : { left: 0, top: 0 };
      return {
        name: this.name,
        point: { x: event.clientX, y: event.clientY },
        offset: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      };
    },
    startPointer(event, pointerId) {
      this.pointerId = pointerId;
      this.startPoint = { x: event.clientX, y: event.clientY };
      this.sourceElement = event.currentTarget || this.sourceElement;
      this.isDragging = false;
      this.suppressClick = false;
      this.isPressed = true;
      this.attachGlobalListeners();
    },
    onPointerDown(event) {
      if (this.disabled || this.pointerId !== null) return;

      this.startPointer(event, event.pointerId);

      if (event.currentTarget.setPointerCapture) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    },
    onPointerMove(event) {
      this.updatePointer(event, event.pointerId);
    },
    updatePointer(event, pointerId) {
      if (this.disabled || this.pointerId !== pointerId || !this.startPoint) return;

      const dx = event.clientX - this.startPoint.x;
      const dy = event.clientY - this.startPoint.y;
      const movedEnough = Math.hypot(dx, dy) >= 8;

      if (!this.isDragging && !movedEnough) return;

      if (!this.isDragging) {
        this.isDragging = true;
        this.suppressClick = true;
        this.$emit("drag-start", this.pointPayload(event));
      }

      event.preventDefault();
      this.$emit("drag-move", this.pointPayload(event));
    },
    onPointerUp(event) {
      if (this.pointerId !== event.pointerId) return;

      this.finishPointer(event);
    },
    onPointerCancel(event) {
      if (this.pointerId !== event.pointerId) return;

      this.isPressed = false;
      if (this.isDragging) {
        this.$emit("drag-cancel", this.pointPayload(event));
      }
      this.resetPointer();
      this.suppressClick = false;
    },
    onMouseDown(event) {
      // Pointer Events browsers dispatch pointerdown before mousedown. The
      // guard keeps the fallback from starting a second gesture there, while
      // still supporting automation and older mouse-only environments.
      if (this.disabled || this.pointerId !== null) return;

      this.startPointer(event, "mouse");
    },
    onWindowPointerMove(event) {
      if (this.pointerId === null || this.pointerId === "mouse") return;
      this.updatePointer(event, event.pointerId);
    },
    onWindowPointerUp(event) {
      if (this.pointerId === null || this.pointerId === "mouse") return;
      if (this.pointerId !== event.pointerId) return;
      this.finishPointer(event);
    },
    onWindowPointerCancel(event) {
      if (this.pointerId === null || this.pointerId === "mouse") return;
      if (this.pointerId !== event.pointerId) return;
      this.onPointerCancel(event);
    },
    onWindowMouseMove(event) {
      if (this.pointerId === "mouse") {
        this.updatePointer(event, "mouse");
      } else if (this.pointerId !== null && event.buttons > 0) {
        // Some embedded browsers begin with Pointer Events but continue a
        // mouse gesture with mousemove/mouseup events only.
        this.updatePointer(event, this.pointerId);
      }
    },
    onWindowMouseUp(event) {
      if (this.pointerId === null) return;
      this.finishPointer(event);
    },
    finishPointer(event) {
      this.isPressed = false;
      if (this.isDragging) {
        event.preventDefault();
        this.$emit("drag-end", this.pointPayload(event));
        this.resetPointer();

        // Native click is dispatched after pointerup. Keep the drag from
        // accidentally adding the tile a second time, but do not block the
        // next independent tap if the browser skips click synthesis.
        window.setTimeout(() => {
          this.suppressClick = false;
        }, 0);
        return;
      }

      this.resetPointer();
    },
    onNativeDragStart(event) {
      if (this.disabled) return;

      this.detachGlobalListeners();
      this.isPressed = false;
      this.isDragging = true;
      this.suppressClick = true;
      this.pointerId = null;
      this.startPoint = null;
      this.sourceElement = event.currentTarget;

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text/plain", this.name);
      }

      this.$emit("drag-start", this.pointPayload(event));
    },
    onNativeDragEnd() {
      this.isPressed = false;
      this.resetPointer();
      this.suppressClick = false;
    },
    attachGlobalListeners() {
      window.addEventListener("pointermove", this.onWindowPointerMove);
      window.addEventListener("pointerup", this.onWindowPointerUp);
      window.addEventListener("pointercancel", this.onWindowPointerCancel);
      window.addEventListener("mousemove", this.onWindowMouseMove);
      window.addEventListener("mouseup", this.onWindowMouseUp);
    },
    detachGlobalListeners() {
      window.removeEventListener("pointermove", this.onWindowPointerMove);
      window.removeEventListener("pointerup", this.onWindowPointerUp);
      window.removeEventListener("pointercancel", this.onWindowPointerCancel);
      window.removeEventListener("mousemove", this.onWindowMouseMove);
      window.removeEventListener("mouseup", this.onWindowMouseUp);
    },
    resetPointer() {
      this.detachGlobalListeners();
      this.pointerId = null;
      this.startPoint = null;
      this.sourceElement = null;
      this.isDragging = false;
    },
    onClick(event) {
      if (this.suppressClick || this.disabled) {
        event.preventDefault();
        this.suppressClick = false;
        return;
      }
      this.$emit("click", event);
    },
  },
};
</script>

<style scoped>
.tile-button {
  --tile-height: 6rem;
  appearance: none;
  border: 0;
  background: transparent;
  border-radius: 0.7rem;
  cursor: pointer;
  display: block;
  flex: 0 0 auto;
  font: inherit;
  line-height: 0;
  padding: 0.18rem;
  touch-action: none;
  transition:
    transform 140ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 140ms ease,
    opacity 140ms ease;
  user-select: none;
  -webkit-user-select: none;
}

.tile-button img {
  height: var(--tile-height);
  display: block;
  pointer-events: none;
  width: auto;
}

.tile-button.horiz img {
  height: auto;
  width: var(--tile-height);
}

.tile-button:hover {
  filter: brightness(1.035) saturate(1.04);
  transform: translateY(-0.14rem);
}

.tile-button.pressed {
  filter: brightness(0.98) saturate(1.08);
  transform: scale(0.94) translateY(0.1rem);
}

.tile-button.dragging {
  opacity: 0.42;
  transform: scale(0.94);
}

.tile-button.disabled,
.tile-button:disabled {
  cursor: not-allowed;
  filter: grayscale(0.4);
  opacity: 0.36;
  transform: none;
}

@media screen and (max-width: 799px) {
  .tile-button {
    --tile-height: 3.35rem;
    border-radius: 0.52rem;
    padding: 0.1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile-button {
    transition: opacity 120ms ease, filter 120ms ease;
  }

  .tile-button:hover,
  .tile-button.pressed,
  .tile-button.dragging {
    transform: none;
  }
}
</style>
