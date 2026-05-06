<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)

let rafId = 0
let stars = []
let width = 0
let height = 0
let dpr = 1
let mouseX = -99999
let mouseY = -99999
let time = 0
let reduceMotion = false

const REPEL_RADIUS = 150
const REPEL_STRENGTH = 22
const SPRING = 0.085
const DAMPING = 0.88

function createStars() {
  const area = width * height
  const n = Math.min(2200, Math.max(450, Math.floor(area / 3200)))
  stars = []
  for (let i = 0; i < n; i++) {
    stars.push({
      bx: Math.random() * width,
      by: Math.random() * height,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      r:
        Math.random() < 0.88
          ? 0.35 + Math.random() * 0.9
          : 1.1 + Math.random() * 1.35,
      tw: Math.random() * Math.PI * 2,
      baseA: 0.22 + Math.random() * 0.5,
      accentHint: Math.random() < 0.08,
    })
  }
}

function resize() {
  const c = canvasRef.value
  if (!c) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  c.width = Math.floor(width * dpr)
  c.height = Math.floor(height * dpr)
  c.style.width = `${width}px`
  c.style.height = `${height}px`
  createStars()
}

function onPointerMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
}

function onPointerLeave() {
  mouseX = -99999
  mouseY = -99999
}

function tick() {
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = '#030306'
  ctx.fillRect(0, 0, width, height)

  const style = getComputedStyle(document.documentElement)
  const accentRgb = style.getPropertyValue('--accent-rgb').trim() || '16, 185, 129'

  time += 0.018

  for (const s of stars) {
    if (!reduceMotion) {
      const sx = s.bx + s.ox
      const sy = s.by + s.oy
      let fx = 0
      let fy = 0

      const dx = sx - mouseX
      const dy = sy - mouseY
      const dist = Math.hypot(dx, dy)
      if (dist < REPEL_RADIUS && dist > 0.01) {
        const falloff = (1 - dist / REPEL_RADIUS) ** 1.35
        const inv = 1 / dist
        fx += dx * inv * REPEL_STRENGTH * falloff
        fy += dy * inv * REPEL_STRENGTH * falloff
      }

      fx -= s.ox * SPRING
      fy -= s.oy * SPRING

      s.vx = (s.vx + fx) * DAMPING
      s.vy = (s.vy + fy) * DAMPING
      s.ox += s.vx
      s.oy += s.vy
    } else {
      s.ox += (0 - s.ox) * 0.12
      s.oy += (0 - s.oy) * 0.12
    }

    const tw = 0.82 + 0.18 * Math.sin(time * 0.9 + s.tw)
    const a = s.baseA * tw
    const px = s.bx + s.ox
    const py = s.by + s.oy

    if (px < -4 || py < -4 || px > width + 4 || py > height + 4) continue

    ctx.beginPath()
    if (s.accentHint) {
      ctx.fillStyle = `rgba(${accentRgb}, ${a * 0.95})`
    } else {
      ctx.fillStyle = `rgba(255,255,255,${a})`
    }
    ctx.arc(px, py, s.r, 0, Math.PI * 2)
    ctx.fill()
  }

  rafId = requestAnimationFrame(tick)
}

function onDocMouseOut(e) {
  const rel = e.relatedTarget
  if (rel === null || (rel instanceof Node && !document.documentElement.contains(rel))) {
    onPointerLeave()
  }
}

onMounted(() => {
  reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('blur', onPointerLeave)
  document.addEventListener('mouseout', onDocMouseOut)
  rafId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('blur', onPointerLeave)
  document.removeEventListener('mouseout', onDocMouseOut)
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none fixed inset-0 z-0 h-full w-full"
    aria-hidden="true"
  />
</template>
