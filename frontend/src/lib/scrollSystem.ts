/**
 * ────────────────────────────────────────────────────────────────
 * SCROLL SYSTEM — the single animation clock for the experience.
 *
 * A module-level rAF loop that:
 *   • measures every registered chapter section
 *   • maps window scroll → per-chapter progress (0..1) with seamless
 *     hand-off windows and a shared crossfade band between chapters
 *   • writes the progress onto each section as the CSS variable `--p`
 *   • invokes registered frame callbacks (video scrub, text layers,
 *     chrome indicators) once per frame
 *
 * Windows are arranged so the incoming chapter's video begins fading
 * in one band before the outgoing chapter's window ends — both videos
 * scrub simultaneously during the band for a connected transition.
 * Scrolling upward simply reverses progress; the same mapping plays
 * the film backward.
 * ────────────────────────────────────────────────────────────────
 */

/** Fraction of a viewport height used as the inter-chapter crossfade band. */
export const CROSSFADE_VH = 0.4

/**
 * Text choreography completes by this fraction of the chapter window,
 * well before the crossfade band begins, so the outgoing chapter's
 * typography is always gone when the incoming frame slides in.
 */
export const TEXT_HOLD_END = 0.72

export interface ChapterProgress {
  index: number
  el: HTMLElement
  /** Scroll y at which this chapter is at progress 0. */
  start: number
  /** Scroll y at which this chapter is at progress 1. */
  end: number
  /** Current progress, 0..1, clamped. */
  progress: number
}

export interface SystemState {
  y: number
  /** Document progress 0..1. */
  progress: number
  /** Index of the first chapter whose window has been entered. */
  activeIndex: number
  activeId: string
  /** True once the visitor has scrolled past every chapter. */
  trailing: boolean
  /** Live per-chapter progress, index-aligned. */
  chapterProgress: number[]
}

type FrameFn = () => void

class ScrollSystem {
  chapters: ChapterProgress[] = []
  state: SystemState = {
    y: 0,
    progress: 0,
    activeIndex: 0,
    activeId: '',
    trailing: false,
    chapterProgress: [],
  }

  private frames = new Set<FrameFn>()
  private registry = new Map<number, HTMLElement>()
  private raf = 0
  private running = false

  start() {
    if (this.running) return
    this.running = true
    const loop = () => {
      this.raf = requestAnimationFrame(loop)
      this.tick()
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  registerChapter(index: number, el: HTMLElement): () => void {
    this.registry.set(index, el)
    this.rebuild()
    if (!this.running) this.start()
    return () => {
      this.registry.delete(index)
      this.rebuild()
    }
  }

  registerFrame(fn: FrameFn): () => void {
    this.frames.add(fn)
    return () => {
      this.frames.delete(fn)
    }
  }

  private rebuild() {
    const entries = Array.from(this.registry.entries()).sort((a, b) => a[0] - b[0])
    this.chapters = entries.map(([index, el]) => ({ index, el, start: 0, end: 0, progress: 0 }))
    this.state.chapterProgress = new Array(this.chapters.length).fill(0)
  }

  private tick() {
    const n = this.chapters.length
    if (n === 0) return

    const y = window.scrollY
    const vh = window.innerHeight
    const band = vh * CROSSFADE_VH

    const tops = new Array<number>(n)
    const hs = new Array<number>(n)
    for (let i = 0; i < n; i++) {
      const el = this.chapters[i].el
      tops[i] = el.getBoundingClientRect().top + y
      hs[i] = el.offsetHeight
    }

    const starts = new Array<number>(n)
    const ends = new Array<number>(n)
    for (let i = 0; i < n; i++) {
      // Every chapter's window begins one band before its own section
      // top; chapter 0 sits at the top of the story, so it clamps to 0
      // and its fade-in happens at the very start of the journey.
      starts[i] = Math.max(0, tops[i] - band)
      ends[i] = i === n - 1 ? tops[i] + hs[i] : tops[i + 1] + band
    }

    let activeIndex = 0
    for (let i = 0; i < n; i++) {
      const span = Math.max(1, ends[i] - starts[i])
      const p = Math.min(1, Math.max(0, (y - starts[i]) / span))
      const c = this.chapters[i]
      c.start = starts[i]
      c.end = ends[i]
      c.progress = p
      this.state.chapterProgress[i] = p
      c.el.style.setProperty('--p', p.toFixed(4))
      if (y >= starts[i]) activeIndex = i
    }

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh)
    this.state.y = y
    this.state.progress = Math.min(1, Math.max(0, y / maxScroll))
    this.state.trailing = n > 0 ? y >= ends[n - 1] : false

    if (this.state.activeIndex !== activeIndex) {
      this.state.activeIndex = activeIndex
      this.state.activeId = this.chapters[activeIndex]?.el.dataset.chapter ?? ''
    }

    for (const fn of this.frames) fn()
  }
}

export const scrollSystem = new ScrollSystem()

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

/**
 * Visibility of a chapter's video given the shared crossfade band.
 * Returns 0..1. Consecutive windows overlap by two bands centred on the
 * frame hand-off, so the outgoing video (1 → 0) and the incoming video
 * (0 → 1) are scrubbed and blended simultaneously across the band.
 */
export function chapterOpacity(index: number, chapters: ChapterProgress[]): number {
  const c = chapters[index]
  if (!c) return 0
  const n = chapters.length
  const span = Math.max(1, c.end - c.start)
  const b = Math.min(0.5, (2 * window.innerHeight * CROSSFADE_VH) / span)

  // Every chapter — including chapter 0, the first scene — fades its
  // video in over the opening band and out over the outgoing band, so
  // each scene waits for the visitor's scroll before its footage begins.
  if (c.progress < b) return clamp01(c.progress / b)
  if (index < n - 1 && c.progress > 1 - b) return clamp01((1 - c.progress) / b)
  return 1
}
