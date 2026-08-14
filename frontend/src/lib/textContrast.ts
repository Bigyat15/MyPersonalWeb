/**
 * ────────────────────────────────────────────────────────────────
 * TEXT CONTRAST — pure luminance + classification helpers for the
 * adaptive text-treatment system.
 *
 * The classifier maps a sampled video region (mean relative luminance
 * plus a "busyness" measure) onto a text treatment:
 *
 *   dark region        → light text          (existing design, Option A)
 *   busy dark region   → light text + shadow (Option C)
 *   mid region         → light text + shadow (Option C)
 *   very busy mid      → light text + backdrop plate (Option D)
 *   bright region      → dark ink text       (Option B)
 *   busy bright region → dark ink + shadow
 *
 * Luminance uses the WCAG relative-luminance curve, and hysteresis
 * keeps the treatment stable while the video hovers near a threshold.
 * ────────────────────────────────────────────────────────────────
 */

export type TextTreatment = 'light' | 'light-shadow' | 'dark' | 'dark-shadow' | 'backdrop'

export interface SampleStats {
  /** Mean relative luminance of the sampled video region (0..1). */
  lum: number
  /** Standard deviation of per-pixel luminance — the region's busyness. */
  sigma: number
}

/** sRGB → linear look-up table (WCAG relative luminance precompute). */
const LINEAR = new Float32Array(256)
for (let i = 0; i < 256; i++) {
  const c = i / 255
  LINEAR[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/** Relative luminance of a single sRGB pixel (0..1). */
export function pixelLuminance(r: number, g: number, b: number): number {
  return 0.2126 * LINEAR[r] + 0.7152 * LINEAR[g] + 0.0722 * LINEAR[b]
}

/** WCAG contrast ratio between two relative luminances. */
export function contrastRatio(a: number, b: number): number {
  const hi = Math.max(a, b)
  const lo = Math.min(a, b)
  return (hi + 0.05) / (lo + 0.05)
}

// Decision bands (relative luminance) — conservative so every treatment
// keeps strong readable contrast against the actual footage.
const DARK_MAX = 0.42
const LIGHT_MIN = 0.6
const BUSY = 0.13
const VERY_BUSY = 0.17
/** Do not flip light ↔ dark families while the reading sits this close to mid. */
const FLIP_MARGIN = 0.06

function isLightFamily(t: TextTreatment): boolean {
  return t === 'light' || t === 'light-shadow' || t === 'backdrop'
}

/**
 * Pick the best text treatment for a sampled region, keeping the
 * previous treatment when the reading is ambiguous (hysteresis) so the
 * text never flickers while the video crosses a threshold.
 */
export function classify(lum: number, sigma: number, prev: TextTreatment | null): TextTreatment {
  let cand: TextTreatment
  if (lum < DARK_MAX) {
    cand = sigma >= BUSY ? 'light-shadow' : 'light'
  } else if (lum > LIGHT_MIN) {
    cand = sigma >= BUSY ? 'dark-shadow' : 'dark'
  } else {
    cand = sigma >= VERY_BUSY ? 'backdrop' : 'light-shadow'
  }

  if (prev == null || cand === prev) return cand
  if (isLightFamily(cand) !== isLightFamily(prev) && Math.abs(lum - 0.5) < FLIP_MARGIN) return prev
  return cand
}
