/**
 * ────────────────────────────────────────────────────────────────
 * CHOREOGRAPHY — a tiny keyframe interpolator for text layers.
 *
 * Each layer animates through a set of keys `{ at, ...props }` where
 * `at` is a fraction (0..1) of the chapter's scroll progress. The
 * engine interpolates the props between the two surrounding keys and
 * writes them straight onto the element's style — no React state, no
 * allocations per frame beyond the writes.
 *
 * Animated props:
 *   opacity  — 0..1
 *   x, y     — translate offsets in px (composition offsets only)
 *   scale    — uniform scale
 *   blur     — gaussian blur in px
 *   ls       — letter-spacing in em
 *   clip     — 0..1 bottom-up clip reveal (0 = hidden, 1 = fully visible)
 * ────────────────────────────────────────────────────────────────
 */

export type EaseKind = 'linear' | 'in' | 'out' | 'inout'

export interface LayerKey {
  at: number
  ease?: EaseKind
  opacity?: number
  x?: number
  y?: number
  scale?: number
  blur?: number
  ls?: number
  clip?: number
}

const NEUTRAL: Record<Prop, number> = { opacity: 0, x: 0, y: 0, scale: 1, blur: 0, ls: 0, clip: 1 }

const PROPS = ['opacity', 'x', 'y', 'scale', 'blur', 'ls', 'clip'] as const
type Prop = (typeof PROPS)[number]

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

function ease(t: number, kind: EaseKind): number {
  switch (kind) {
    case 'linear':
      return t
    case 'in':
      return t * t
    case 'inout':
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    case 'out':
    default:
      return 1 - (1 - t) * (1 - t)
  }
}

/** Which props are animated by this spec (so untouched props keep their CSS). */
export function layerProps(keys: LayerKey[]): Set<Prop> {
  const used = new Set<Prop>()
  for (const k of keys) {
    for (const p of PROPS) if (k[p] !== undefined) used.add(p)
  }
  return used
}

/** Applies the interpolated state for progress `p` (0..1) onto `el`. */
export function applyLayer(
  el: HTMLElement,
  keys: LayerKey[],
  p: number,
  used: Set<Prop>,
): void {
  const k0 = keys[0]
  const k1 = keys[keys.length - 1]
  if (keys.length === 1 || p <= k0.at) {
    write(el, k0, used)
    return
  }
  if (p >= k1.at) {
    write(el, k1, used)
    return
  }

  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (p < b.at) {
      const span = Math.max(1e-6, b.at - a.at)
      const e = ease(Math.min(1, Math.max(0, (p - a.at) / span)), b.ease ?? 'out')
      const k: LayerKey = { at: p }
      for (const prop of used) {
        const va = a[prop] ?? NEUTRAL[prop]
        const vb = b[prop] ?? NEUTRAL[prop]
        k[prop] = va + (vb - va) * e
      }
      write(el, k, used)
      return
    }
  }

  write(el, k1, used)
}

function write(el: HTMLElement, k: LayerKey, used: Set<Prop>): void {
  const opacity = k.opacity ?? 1
  el.style.opacity = String(opacity)
  // An invisible layer needs nothing else — skip the transform, filter,
  // letter-spacing and clip writes so hidden layers cost almost nothing.
  if (opacity <= 0.01) return

  if (used.has('x') || used.has('y') || used.has('scale')) {
    el.style.transform = `translate3d(${k.x ?? 0}px, ${k.y ?? 0}px, 0) scale(${k.scale ?? 1})`
  }

  if (used.has('blur')) {
    const b = k.blur ?? 0
    el.style.filter = b > 0.25 ? `blur(${b}px)` : 'blur(0px)'
  }

  if (used.has('ls')) el.style.letterSpacing = `${k.ls ?? 0}em`

  if (used.has('clip')) {
    const c = clamp01(k.clip ?? 1)
    el.style.clipPath = c >= 1 ? '' : `inset(${(1 - c) * 100}% 0 0 0)`
  }
}
