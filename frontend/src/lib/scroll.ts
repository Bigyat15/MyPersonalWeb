import Lenis from 'lenis'
import { scrollSystem } from './scrollSystem'

let lenis: Lenis | null = null
let rafId = 0

/** Initialises smooth inertial scrolling. No-op under reduced motion. */
export function initLenis(reduced: boolean): () => void {
  if (reduced || lenis) return () => {}
  lenis = new Lenis({ lerp: 0.07, smoothWheel: true })
  // Exposed for programmatic control and automated verification.
  ;(window as unknown as Record<string, unknown>).__lenis = lenis
  const raf = (time: number) => {
    lenis?.raf(time)
    rafId = requestAnimationFrame(raf)
  }
  rafId = requestAnimationFrame(raf)
  return () => {
    cancelAnimationFrame(rafId)
    lenis?.destroy()
    lenis = null
    delete (window as unknown as Record<string, unknown>).__lenis
  }
}

function shouldUseNative(): boolean {
  return (
    !lenis &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Resolves the scroll target for an element, honouring chapter windows. */
function targetFor(id: string): number | null {
  const el = document.getElementById(id)
  if (!el) return null
  const idx = scrollSystem.chapters.findIndex((c) => c.el === el)
  if (idx >= 0) {
    const c = scrollSystem.chapters[idx]
    // Land just past the crossfade band so the chosen chapter is fully
    // visible at the frame where its title begins to reveal.
    const band = Math.min(window.innerHeight * 0.4, Math.max(0, c.end - c.start))
    return Math.max(0, c.start + band)
  }
  return el.offsetTop
}

export function scrollToId(id: string) {
  const target = targetFor(id)
  if (target == null) return
  if (lenis) lenis.scrollTo(target, { duration: 1.8 })
  else if (shouldUseNative()) window.scrollTo({ top: target, behavior: 'auto' })
  else window.scrollTo({ top: target, behavior: 'smooth' })
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.8 })
  else if (shouldUseNative()) window.scrollTo({ top: 0, behavior: 'auto' })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** Pauses inertial scrolling (e.g. while an overlay is open). */
export function pauseScroll() {
  lenis?.stop()
}

/** Resumes inertial scrolling after pauseScroll(). */
export function resumeScroll() {
  lenis?.start()
}
