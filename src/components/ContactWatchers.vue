<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  /** @type {import('vue').PropType<'idle'|'sending'|'success'|'pending'|'error'>} */
  status: { type: String, default: 'idle' },
})

const FIELD_BY_ID = {
  'cf-name': 'name',
  'cf-mail': 'email',
  'cf-subject': 'subject',
  'cf-message': 'message',
}

/** Look targets in normalized stage coords (form left → look left; message → look right). */
const FIELD_LOOK = {
  name: { x: -0.15, y: 0.32 },
  email: { x: -0.28, y: 0.3 },
  subject: { x: -0.12, y: 0.48 },
  message: { x: 1.35, y: 0.42 },
}

const CHARACTERS = [
  { id: 'tall', cx: 0.36, cy: 0.2, max: 7 },
  { id: 'slim', cx: 0.52, cy: 0.26, max: 6 },
  { id: 'mound', cx: 0.3, cy: 0.58, max: 9 },
  { id: 'arch', cx: 0.68, cy: 0.44, max: 8 },
]

const rootEl = ref(null)
const focusField = ref('idle')
const pointer = ref({ x: 0.55, y: 0.4 })
const look = ref({ x: 0.55, y: 0.4 })
const shaking = ref(false)
const shakeTick = ref(0)
let rafId = 0
let shakeTimer = 0
let focusOutTimer = 0

const isAway = computed(() => focusField.value === 'message')
const isLean = computed(() => focusField.value === 'email')
const isCurious = computed(() => focusField.value === 'name' || focusField.value === 'subject')
const isHappy = computed(() => props.status === 'success')

function triggerShake() {
  shaking.value = false
  // Force a reflow restart so repeat errors still animate
  requestAnimationFrame(() => {
    shaking.value = true
    shakeTick.value += 1
    clearTimeout(shakeTimer)
    shakeTimer = window.setTimeout(() => {
      shaking.value = false
    }, 1100)
  })
}

function onPointerMove(e) {
  if (focusField.value !== 'idle') return
  const el = rootEl.value
  if (!el) return
  const r = el.getBoundingClientRect()
  if (r.width < 1 || r.height < 1) return
  pointer.value = {
    x: (e.clientX - r.left) / r.width,
    y: (e.clientY - r.top) / r.height,
  }
}

function onDocFocusIn(e) {
  const field = FIELD_BY_ID[e.target?.id]
  if (!field) return
  clearTimeout(focusOutTimer)
  focusField.value = field
}

function onDocFocusOut(e) {
  const nextId = e.relatedTarget?.id
  if (FIELD_BY_ID[nextId]) return
  clearTimeout(focusOutTimer)
  focusOutTimer = window.setTimeout(() => {
    const activeId = document.activeElement?.id
    focusField.value = FIELD_BY_ID[activeId] || 'idle'
  }, 40)
}

/** Native constraint validation (empty required fields) never reaches fetch — still shake. */
function onDocInvalid(e) {
  if (e.target?.closest?.('#iletisim .contact-form')) {
    triggerShake()
  }
}

function tick() {
  const field = focusField.value
  const target = field !== 'idle' && FIELD_LOOK[field] ? FIELD_LOOK[field] : pointer.value
  const ease =
    field === 'email' ? 0.18 :
    field === 'message' ? 0.12 :
    field !== 'idle' ? 0.15 :
    0.1

  look.value = {
    x: look.value.x + (target.x - look.value.x) * ease,
    y: look.value.y + (target.y - look.value.y) * ease,
  }
  rafId = requestAnimationFrame(tick)
}

function gaze(cx, cy, max) {
  const dx = look.value.x - cx
  const dy = look.value.y - cy
  const dist = Math.hypot(dx, dy) || 1
  const boost = focusField.value === 'email' ? 1.35 : focusField.value === 'message' ? 1.15 : 1
  const mag = Math.min(max * boost, dist * 22 * boost)
  return {
    x: (dx / dist) * mag,
    y: (dy / dist) * mag,
  }
}

const gazes = computed(() => {
  const lean = isLean.value ? -14 : 0
  const map = {}
  for (const c of CHARACTERS) {
    const g = gaze(c.cx, c.cy, c.max)
    map[c.id] = {
      ...g,
      tilt: Math.max(-18, Math.min(10, g.x * 0.55 + lean)),
    }
  }
  return map
})

watch(
  () => props.status,
  (next, prev) => {
    if (next === 'error' && prev !== 'error') {
      triggerShake()
    }
    if (next === 'success' || next === 'pending') {
      shaking.value = false
      focusField.value = 'idle'
    }
  },
)

onMounted(() => {
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('focusin', onDocFocusIn)
  document.addEventListener('focusout', onDocFocusOut)
  document.addEventListener('invalid', onDocInvalid, true)
  rafId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('focusin', onDocFocusIn)
  document.removeEventListener('focusout', onDocFocusOut)
  document.removeEventListener('invalid', onDocInvalid, true)
  cancelAnimationFrame(rafId)
  clearTimeout(shakeTimer)
  clearTimeout(focusOutTimer)
})
</script>

<template>
  <div
    ref="rootEl"
    class="watchers"
    :class="{
      'watchers--away': isAway,
      'watchers--lean': isLean,
      'watchers--curious': isCurious,
      'watchers--shake': shaking,
      'watchers--happy': isHappy,
    }"
    aria-hidden="true"
  >
    <div class="watchers__stage">
      <!-- Tall rectangle -->
      <div class="watcher watcher--tall">
        <div
          class="watcher__tilt"
          :style="{ rotate: `${-3 + gazes.tall.tilt}deg` }"
        >
          <div class="watcher__skin" :key="`tall-${shakeTick}`">
            <div class="watcher__face">
              <div class="eye eye--on-deep">
                <span class="eye__pupil" :style="{ transform: `translate(${gazes.tall.x}px, ${gazes.tall.y}px)` }" />
              </div>
              <div class="eye eye--on-deep">
                <span class="eye__pupil" :style="{ transform: `translate(${gazes.tall.x}px, ${gazes.tall.y}px)` }" />
              </div>
              <div class="mouth mouth--o" :class="{ 'mouth--smile': isHappy, 'mouth--sad': shaking }" />
            </div>
          </div>
        </div>
      </div>

      <!-- Slim rectangle -->
      <div class="watcher watcher--slim">
        <div
          class="watcher__tilt"
          :style="{ rotate: `${gazes.slim.tilt * 0.6}deg` }"
        >
          <div class="watcher__skin" :key="`slim-${shakeTick}`">
            <div class="watcher__face">
              <div class="eye eye--slim eye--on-deep">
                <span class="eye__pupil" :style="{ transform: `translate(${gazes.slim.x}px, ${gazes.slim.y}px)` }" />
              </div>
              <div class="eye eye--slim eye--on-deep">
                <span class="eye__pupil" :style="{ transform: `translate(${gazes.slim.x}px, ${gazes.slim.y}px)` }" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mound -->
      <div class="watcher watcher--mound">
        <div
          class="watcher__tilt"
          :style="{ rotate: `${gazes.mound.tilt * 0.45}deg` }"
        >
          <div class="watcher__skin" :key="`mound-${shakeTick}`">
            <div class="watcher__face">
              <div class="eye">
                <span class="eye__pupil" :style="{ transform: `translate(${gazes.mound.x}px, ${gazes.mound.y}px)` }" />
              </div>
              <div class="eye">
                <span class="eye__pupil" :style="{ transform: `translate(${gazes.mound.x}px, ${gazes.mound.y}px)` }" />
              </div>
              <div
                class="mouth"
                :class="isHappy ? 'mouth--grin' : shaking ? 'mouth--sad' : 'mouth--smile'"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Arch -->
      <div class="watcher watcher--arch">
        <div
          class="watcher__tilt"
          :style="{ rotate: `${2 + gazes.arch.tilt * 0.5}deg` }"
        >
          <div class="watcher__skin" :key="`arch-${shakeTick}`">
            <div class="watcher__face">
              <div class="eye">
                <span class="eye__pupil" :style="{ transform: `translate(${gazes.arch.x}px, ${gazes.arch.y}px)` }" />
              </div>
              <div class="eye">
                <span class="eye__pupil" :style="{ transform: `translate(${gazes.arch.x}px, ${gazes.arch.y}px)` }" />
              </div>
              <div
                class="mouth"
                :class="isHappy ? 'mouth--smile' : shaking ? 'mouth--sad' : 'mouth--line'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.watchers {
  /* Accent tones — theme picker ile birlikte değişir */
  --w-tone-1: var(--color-accent);
  --w-tone-2: color-mix(in oklch, var(--color-accent) 72%, black);
  --w-tone-3: color-mix(in oklch, var(--color-accent) 78%, white);
  --w-tone-4: color-mix(in oklch, var(--color-accent) 55%, var(--color-paper-3));
  --w-ink: var(--color-accent-ink);
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  display: grid;
  place-items: center;
  pointer-events: none;
  user-select: none;
}

.watchers__stage {
  position: relative;
  width: min(100%, 520px);
  height: min(100%, 560px);
  min-height: 420px;
  /* Biraz sağa — forma yapışık durmasınlar */
  margin-left: 12%;
  transition: transform 520ms var(--ease);
}

.watchers--lean .watchers__stage {
  /* Öne gelme / scale yok — sola doğru hafif kayma */
  transform: translateX(-10px);
}

.watchers--away .watchers__stage {
  transform: translateX(18px);
}

.watchers--happy .watchers__stage {
  animation: watchers-bob 780ms var(--ease);
}

.watcher {
  position: absolute;
  transform-origin: 50% 90%;
  will-change: transform;
}

.watcher__tilt {
  width: 100%;
  height: 100%;
  transform-origin: 50% 90%;
  transition: rotate 420ms var(--ease);
}

.watcher__skin {
  width: 100%;
  height: 100%;
  position: relative;
  transform-origin: 50% 85%;
  transition: background-color 220ms var(--ease);
}

.watcher__face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(12px, 3.2vw, 18px);
  padding-top: 16%;
}

/* —— Eyes —— */
.eye {
  position: relative;
  width: clamp(18px, 3.4vw, 26px);
  height: clamp(18px, 3.4vw, 26px);
  border-radius: 50%;
  background: #fffef8;
  box-shadow:
    inset 0 -2px 4px rgb(0 0 0 / 0.12),
    0 1px 2px rgb(0 0 0 / 0.08);
  overflow: hidden;
  flex-shrink: 0;
  transition:
    width 280ms var(--ease),
    height 280ms var(--ease),
    transform 280ms var(--ease);
}

.eye--slim {
  width: clamp(14px, 2.6vw, 20px);
  height: clamp(14px, 2.6vw, 20px);
}

.eye--on-deep {
  background: #f7f4fb;
}

.eye__pupil {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 42%;
  height: 42%;
  margin: -21% 0 0 -21%;
  border-radius: 50%;
  background: #12141a;
  will-change: transform;
}

.eye--on-deep .eye__pupil {
  width: 48%;
  height: 48%;
  margin: -24% 0 0 -24%;
}

.watchers--lean .eye {
  width: clamp(22px, 4vw, 30px);
  height: clamp(22px, 4vw, 30px);
}

.watchers--lean .eye--slim {
  width: clamp(16px, 3vw, 22px);
  height: clamp(16px, 3vw, 22px);
}

.watchers--lean .eye__pupil {
  width: 50%;
  height: 50%;
  margin: -25% 0 0 -25%;
}

.watchers--away .eye {
  transform: scaleX(0.92);
}

/* —— Mouths —— */
.mouth {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  transition:
    width 280ms var(--ease),
    height 280ms var(--ease),
    border-radius 280ms var(--ease),
    top 280ms var(--ease);
}

.mouth--smile {
  top: 42%;
  width: clamp(16px, 3vw, 22px);
  height: clamp(9px, 1.6vw, 12px);
  border: 2.5px solid #12141a;
  border-top: 0;
  background: transparent;
  border-radius: 0 0 14px 14px;
}

.mouth--grin {
  top: 40%;
  width: clamp(20px, 3.6vw, 26px);
  height: clamp(12px, 2vw, 15px);
  border: 2.5px solid #12141a;
  border-top: 0;
  background: transparent;
  border-radius: 0 0 18px 18px;
}

.mouth--line {
  top: 44%;
  width: clamp(14px, 2.8vw, 20px);
  height: 2.5px;
  background: #12141a;
  border-radius: 2px;
}

.mouth--o {
  top: 40%;
  width: clamp(8px, 1.5vw, 11px);
  height: clamp(8px, 1.5vw, 11px);
  background: #12141a;
  border-radius: 50%;
}

.mouth--sad {
  top: 44%;
  width: clamp(16px, 3vw, 22px);
  height: clamp(9px, 1.6vw, 12px);
  border: 2.5px solid #12141a;
  border-bottom: 0;
  background: transparent;
  border-radius: 14px 14px 0 0;
}

/* —— Silhouettes (önceki formlar, biraz sağa kaydırılmış) —— */
.watcher--tall {
  left: 22%;
  top: 2%;
  width: 38%;
  height: 78%;
  z-index: 1;
  animation: sway-a 5.8s ease-in-out infinite;
}
.watcher--tall .watcher__skin {
  background: var(--w-tone-2);
  border-radius: 18px 20px 14px 16px;
  box-shadow: 0 18px 40px color-mix(in oklch, var(--color-accent) 22%, transparent);
}
.watcher--tall .watcher__face {
  gap: clamp(10px, 2.4vw, 14px);
  padding-top: 12%;
}

.watcher--slim {
  left: 56%;
  top: 10%;
  width: 15%;
  height: 64%;
  z-index: 2;
  animation: sway-b 5s ease-in-out infinite;
}
.watcher--slim .watcher__skin {
  background: var(--w-tone-4);
  border-radius: 12px;
  box-shadow: 0 14px 32px color-mix(in oklch, var(--color-accent) 16%, transparent);
}
.watcher--slim .watcher__face {
  gap: clamp(8px, 1.8vw, 12px);
  padding-top: 14%;
}

.watcher--mound {
  left: 14%;
  bottom: 0;
  width: 52%;
  height: 48%;
  z-index: 3;
  animation: sway-c 6.4s ease-in-out infinite;
}
.watcher--mound .watcher__skin {
  background: var(--w-tone-1);
  border-radius: 50% 50% 22% 22% / 92% 92% 30% 30%;
  box-shadow: 0 20px 44px color-mix(in oklch, var(--color-accent) 28%, transparent);
}
.watcher--mound .watcher__face {
  gap: clamp(14px, 3.4vw, 22px);
  padding-top: 24%;
}

.watcher--arch {
  right: -4%;
  bottom: 4%;
  width: 34%;
  height: 58%;
  z-index: 4;
  animation: sway-d 5.4s ease-in-out infinite;
}
.watcher--arch .watcher__skin {
  background: var(--w-tone-3);
  border-radius: 48% 48% 14px 14px / 36% 36% 14px 14px;
  box-shadow: 0 18px 40px color-mix(in oklch, var(--color-accent) 18%, transparent);
}
.watcher--arch .watcher__face {
  gap: clamp(12px, 2.8vw, 16px);
  padding-top: 18%;
}

/* —— Motion —— */
.watchers--shake .watcher__skin {
  animation: head-no 0.55s ease-in-out 0s 2;
}
.watchers--shake .watcher--tall .watcher__skin { animation-delay: 0ms; }
.watchers--shake .watcher--slim .watcher__skin { animation-delay: 40ms; }
.watchers--shake .watcher--mound .watcher__skin { animation-delay: 80ms; }
.watchers--shake .watcher--arch .watcher__skin { animation-delay: 55ms; }

@keyframes sway-a {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -6px; }
}
@keyframes sway-b {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -8px; }
}
@keyframes sway-c {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -4px; }
}
@keyframes sway-d {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -7px; }
}

@keyframes head-no {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(-16deg); }
  40% { transform: rotate(16deg); }
  60% { transform: rotate(-12deg); }
  80% { transform: rotate(10deg); }
}

@keyframes watchers-bob {
  0%, 100% { translate: 0 0; }
  35% { translate: 0 -12px; }
  65% { translate: 0 -3px; }
}

@media (max-width: 900px) {
  .watchers {
    min-height: 280px;
    justify-items: center;
  }
  .watchers__stage {
    width: min(100%, 360px);
    height: 300px;
    min-height: 280px;
    margin-left: 0;
    margin-inline: auto;
  }
  /* Masaüstündeki sağa kaymayı mobilde geri al — grubu ortala */
  .watcher--tall { left: 10%; }
  .watcher--slim { left: 44%; }
  .watcher--mound { left: 2%; }
  .watcher--arch { right: 0; }
  .watchers--lean .watchers__stage,
  .watchers--away .watchers__stage {
    /* lean/away kayması mobilde de ortalanmış gruba göre kalsın */
  }
}

@media (prefers-reduced-motion: reduce) {
  .watcher,
  .watchers__stage,
  .watcher__tilt,
  .watcher__skin,
  .eye,
  .mouth {
    animation: none !important;
    transition: none !important;
  }
}
</style>
