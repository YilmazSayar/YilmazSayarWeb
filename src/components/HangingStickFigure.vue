<script setup>
defineProps({
  openThemeLabel: {
    type: String,
    default: 'Tema rengi ayarlarını aç',
  },
})

const emit = defineEmits(['open-theme'])

function onPaletteActivate(e) {
  e.preventDefault()
  e.stopPropagation()
  emit('open-theme')
}
</script>

<template>
  <div class="pointer-events-none fixed right-0 top-0 z-[45] hidden overflow-visible sm:block">
    <svg
      class="stick-figure-svg drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)]"
      width="460"
      height="340"
      viewBox="0 0 460 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Tutunduğu üst çıkıntı -->
      <path
        d="M 160 4 L 460 4 L 460 20 L 160 20 Z"
        fill="rgba(0,0,0,0.9)"
        stroke="rgba(255,255,255,0.1)"
        stroke-width="1"
      />

      <g class="body-swing">
        <!-- Sağ el + kol -->
        <path
          d="M 392 108 L 400 64 Q 406 38 400 22"
          stroke="#fafafa"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M 392 20 Q 398 16 406 18"
          stroke="#fafafa"
          stroke-width="2.2"
          stroke-linecap="round"
        />

        <!-- Sol kol + palet -->
        <g class="arm-menu">
          <path
            class="pointer-events-none"
            d="M 370 108 L 350 103 Q 332 99 322 106 L 308 108"
            stroke="#fafafa"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <g
            transform="translate(289, 118) rotate(-10)"
            class="pointer-events-none"
          >
            <rect
              x="0"
              y="0"
              width="34"
              height="25"
              rx="5"
              fill="rgba(24,24,27,0.94)"
              stroke="rgba(250,250,255,0.35)"
              stroke-width="1.4"
            />
            <circle cx="8" cy="8" r="3.2" fill="#ef4444" />
            <circle cx="17" cy="8" r="3.2" fill="#3b82f6" />
            <circle cx="26" cy="8" r="3.2" fill="#eab308" />
            <circle cx="12" cy="16" r="3.2" fill="#22c55e" />
            <circle cx="21" cy="16" r="3.2" fill="#a855f7" />
          </g>

          <circle
            class="pointer-events-none"
            cx="306"
            cy="112"
            r="4"
            fill="#fafafa"
            opacity="0.95"
          />

          <!-- Tıklanabilir alan: el + palet -->
          <rect
            x="276"
            y="96"
            width="66"
            height="56"
            fill="transparent"
            class="palette-trigger"
            :aria-label="openThemeLabel"
            role="button"
            tabindex="0"
            @click="onPaletteActivate"
            @keydown.enter.prevent="onPaletteActivate"
            @keydown.space.prevent="onPaletteActivate"
          />
        </g>

        <circle cx="382" cy="76" r="13" stroke="#fafafa" stroke-width="2.6" />

        <line
          x1="382"
          y1="89"
          x2="382"
          y2="100"
          stroke="#fafafa"
          stroke-width="2.6"
          stroke-linecap="round"
        />

        <line
          x1="382"
          y1="100"
          x2="382"
          y2="192"
          stroke="#fafafa"
          stroke-width="2.6"
          stroke-linecap="round"
        />

        <path
          d="M 382 192 L 362 268 M 382 192 L 402 268"
          stroke="#fafafa"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.palette-trigger {
  pointer-events: auto;
  cursor: pointer;
}
.palette-trigger:hover {
  outline: 2px solid rgba(var(--accent-rgb), 0.5);
  outline-offset: 2px;
  border-radius: 6px;
}
.palette-trigger:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 6px;
}

.stick-figure-svg {
  transform-origin: 400px 12px;
}

.body-swing {
  transform-origin: 400px 12px;
  animation: hang-sway 5.8s ease-in-out infinite;
}

.arm-menu {
  transform-origin: 370px 108px;
  animation: menu-nudge 5.8s ease-in-out infinite;
}

@keyframes hang-sway {
  0%,
  100% {
    transform: rotate(-2.8deg);
  }
  50% {
    transform: rotate(2.8deg);
  }
}

@keyframes menu-nudge {
  0%,
  100% {
    transform: rotate(-1.2deg);
  }
  50% {
    transform: rotate(1.6deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .body-swing,
  .arm-menu {
    animation: none;
  }
}
</style>
