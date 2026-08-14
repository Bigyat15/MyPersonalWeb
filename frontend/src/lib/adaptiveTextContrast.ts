/**
 * ────────────────────────────────────────────────────────────────
 * ADAPTIVE TEXT CONTRAST — a lightweight, shared system that keeps the
 * chapter typography readable over the scroll-scrubbed films.
 *
 * The manager owns a single throttled clock. Each tick it:
 *   • resolves the ACTIVE chapter from the scroll system
 *   • samples a small region of that chapter's video *behind each text
 *     layer* (downsampled to ~24px and luminance-averaged)
 *   • classifies the region into a text treatment (light / dark /
 *     shadow / backdrop) with hysteresis
 *   • applies the treatment as a `data-contrast` attribute, which the
 *     stylesheet translates into ink + shadow choices (CSS transitions
 *     smooth the switch)
 *
 * It only ever analyses the visible video, caches static frames, and
 * skips entirely when the tab is hidden or the text maps outside the
 * footage — so scrolling stays as smooth as before.
 * ────────────────────────────────────────────────────────────────
 */

import { scrollSystem, chapterOpacity } from './scrollSystem'
import { videoManager } from './videoManager'
import { classify, pixelLuminance, type SampleStats, type TextTreatment } from './textContrast'

const TICK_MS = 500
const FRAME_COOLDOWN_MS = 1400
const SAMPLE_MAX = 24

const layersByChapter = new Map<number, Set<HTMLElement>>()
const lastAnalyzed = new Map<number, { media: HTMLElement; frame: number; at: number }>()

let timer: number | null = null
let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

export function registerLayer(chapterIndex: number, layer: HTMLElement): void {
  let set = layersByChapter.get(chapterIndex)
  if (!set) {
    set = new Set()
    layersByChapter.set(chapterIndex, set)
  }
  set.add(layer)
  ensureTicker()
}

export function unregisterLayer(chapterIndex: number, layer: HTMLElement): void {
  const set = layersByChapter.get(chapterIndex)
  if (!set) return
  set.delete(layer)
  if (set.size === 0) {
    layersByChapter.delete(chapterIndex)
    lastAnalyzed.delete(chapterIndex)
  }
  if (layersByChapter.size === 0 && timer != null) {
    clearInterval(timer)
    timer = null
  }
}

function ensureTicker(): void {
  if (timer != null) return
  timer = window.setInterval(tick, TICK_MS)
}

function tick(): void {
  if (document.visibilityState === 'hidden') return
  const idx = scrollSystem.state.activeIndex
  const chapters = scrollSystem.chapters
  if (idx < 0 || idx >= chapters.length) return

  // Only the visible video is analysed; scene crossfades pick the
  // incoming chapter, which is the one the visitor is reading.
  if (chapterOpacity(idx, chapters) < 0.5) return

  const media = videoManager.getChapterVideo(idx)
  if (!media || !isSamplable(media)) return

  const layers = layersByChapter.get(idx)
  if (!layers || layers.size === 0) return

  // A static frame (scroll paused, poster, or an unchanged video) is
  // only re-read after a cooldown, so repeated ticks never re-run the
  // pipeline needlessly.
  const now = performance.now()
  const frame = frameOf(media)
  const prev = lastAnalyzed.get(idx)
  if (prev && prev.media === media && prev.frame === frame && now - prev.at < FRAME_COOLDOWN_MS) {
    return
  }
  lastAnalyzed.set(idx, { media, frame, at: now })

  const mediaRect = media.getBoundingClientRect()
  if (mediaRect.width <= 0 || mediaRect.height <= 0) return

  for (const layer of layers) analyze(layer, media, mediaRect)
}

function isSamplable(media: HTMLElement): boolean {
  if (media instanceof HTMLVideoElement) {
    return media.readyState >= 2 && media.duration > 0 && !Number.isNaN(media.duration)
  }
  if (media instanceof HTMLImageElement) {
    return media.complete && media.naturalWidth > 0
  }
  return false
}

function frameOf(media: HTMLElement): number {
  if (media instanceof HTMLVideoElement) return Math.round(media.currentTime * 100)
  return 0
}

function analyze(layer: HTMLElement, media: HTMLElement, mediaRect: DOMRect): void {
  const anim = layer.querySelector<HTMLElement>('.layer__anim')
  if (!anim) return
  const text = anim.getBoundingClientRect()
  if (text.width < 6 || text.height < 6) return

  // Sample the video *around* the glyphs, not the whole frame. The
  // region follows the element, so it tracks the choreography movement.
  const padX = Math.min(text.width * 0.22, 48) + 4
  const padY = Math.min(text.height * 0.14, 24) + 2
  const region = {
    left: text.left - padX,
    top: text.top - padY,
    right: text.right + padX,
    bottom: text.bottom + padY,
  }

  const v = mapToVideo(media, mediaRect, region)
  if (!v) return
  const stats = sample(media, v)
  if (!stats) return

  const prev = layer.getAttribute('data-contrast') as TextTreatment | null
  const treatment = classify(stats.lum, stats.sigma, prev)
  if (prev !== treatment) layer.setAttribute('data-contrast', treatment)
}

/**
 * Maps a viewport region onto the video's source pixels, accounting for
 * the element's object-fit crop and object-position (the scene `focus`).
 */
function mapToVideo(
  media: HTMLElement,
  rect: DOMRect,
  region: { left: number; top: number; right: number; bottom: number },
): { vx: number; vy: number; vw: number; vh: number } | null {
  const isVideo = media instanceof HTMLVideoElement
  const sw = isVideo ? media.videoWidth : (media as HTMLImageElement).naturalWidth
  const sh = isVideo ? media.videoHeight : (media as HTMLImageElement).naturalHeight
  if (!sw || !sh) return null

  const style = getComputedStyle(media)
  const fit = style.objectFit || 'cover'
  const cw = rect.width
  const ch = rect.height
  if (cw <= 0 || ch <= 0) return null

  // Displayed image area inside the element rect (object-fit mapping).
  let dw = cw
  let dh = ch
  let dx = 0
  let dy = 0
  if (fit === 'cover') {
    const scale = Math.max(cw / sw, ch / sh)
    dw = sw * scale
    dh = sh * scale
    const [px, py] = parseObjectPosition(style.objectPosition)
    dx = (dw - cw) * px
    dy = (dh - ch) * py
  } else if (fit === 'contain') {
    const scale = Math.min(cw / sw, ch / sh)
    dw = sw * scale
    dh = sh * scale
    dx = (cw - dw) / 2
    dy = (ch - dh) / 2
  }
  // 'fill' / 'none': displayed area equals the element rect (dx = dy = 0).

  const left = Math.max(region.left, rect.left)
  const top = Math.max(region.top, rect.top)
  const right = Math.min(region.right, rect.right)
  const bottom = Math.min(region.bottom, rect.bottom)
  if (right <= left || bottom <= top) return null

  const scaleX = dw / sw
  const scaleY = dh / sh
  const vx = (left - rect.left + dx) / scaleX
  const vy = (top - rect.top + dy) / scaleY
  const vw = (right - left) / scaleX
  const vh = (bottom - top) / scaleY
  if (vw <= 0 || vh <= 0) return null
  return { vx, vy, vw, vh }
}

function parseObjectPosition(value: string | null): [number, number] {
  const parts = (value || '50% 50%').trim().split(/\s+/).slice(0, 2)
  const parse = (v: string | undefined): number => {
    if (v === 'center' || v === '50%') return 0.5
    if (v === 'left' || v === 'top' || v === '0%') return 0
    if (v === 'right' || v === 'bottom' || v === '100%') return 1
    const m = v ? v.match(/^(-?[\d.]+)%$/) : null
    if (m) return Math.min(1, Math.max(0, parseFloat(m[1]) / 100))
    return 0.5
  }
  if (parts.length === 1) {
    const p = parse(parts[0])
    return [p, p]
  }
  return [parse(parts[0]), parse(parts[1])]
}

/** Downsamples the mapped region and measures its mean luminance + busyness. */
function sample(
  media: HTMLElement,
  v: { vx: number; vy: number; vw: number; vh: number },
): SampleStats | null {
  const source = media instanceof HTMLVideoElement || media instanceof HTMLImageElement ? media : null
  if (!source) return null

  const isVideo = media instanceof HTMLVideoElement
  const sw = isVideo ? media.videoWidth : (media as HTMLImageElement).naturalWidth
  const sh = isVideo ? media.videoHeight : (media as HTMLImageElement).naturalHeight

  // Clamp the source rect to the media bounds.
  const vx = Math.max(0, v.vx)
  const vy = Math.max(0, v.vy)
  const vw = Math.min(v.vw, sw - vx)
  const vh = Math.min(v.vh, sh - vy)
  if (vw <= 0 || vh <= 0) return null

  const ratio = vw / vh
  let w = SAMPLE_MAX
  let h = SAMPLE_MAX
  if (ratio > 1) h = Math.max(1, Math.round(SAMPLE_MAX / ratio))
  else w = Math.max(1, Math.round(SAMPLE_MAX * ratio))

  if (!canvas) {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d', { willReadFrequently: true })
  }
  if (!ctx) return null
  canvas.width = w
  canvas.height = h

  try {
    ctx.drawImage(source, vx, vy, vw, vh, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data
    let sum = 0
    let sum2 = 0
    const n = data.length / 4
    for (let i = 0; i < data.length; i += 4) {
      const l = pixelLuminance(data[i], data[i + 1], data[i + 2])
      sum += l
      sum2 += l * l
    }
    const lum = sum / n
    const sigma = Math.sqrt(Math.max(0, sum2 / n - lum * lum))
    return { lum, sigma }
  } catch {
    // Canvas is tainted (cross-origin media) or the frame is not readable
    // yet — keep the previous treatment and retry on the next tick.
    return null
  }
}

// Minimal introspection for automated verification (mirrors __lenis).
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__textContrast = {
    classify,
    treatments: Object.freeze(['light', 'light-shadow', 'dark', 'dark-shadow', 'backdrop']),
    registeredChapters: () => layersByChapter.size,
  }
}
