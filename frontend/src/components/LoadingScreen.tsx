import { useLayoutEffect, useRef, useState } from 'react'
import { journey } from '../data/journey'
import { videoManager } from '../lib/videoManager'
import { pauseScroll, resumeScroll } from '../lib/scroll'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * ────────────────────────────────────────────────────────────────
 * CINEMATIC LOADING SCREEN — a film-title opening.
 *
 * The overlay shows a staged editorial reveal ("01" → NEPAL → tag →
 * progress line) while the assets genuinely required for Phase 01
 * (chapter 01) come in: poster, video first frame, critical fonts and
 * the initial layout. Progress is honest — it tracks those events, so
 * a fast load finishes quickly and a slow one waits only for Phase 01.
 *
 * When ready it runs a quiet cinematic exit (text fades → brief dark
 * hold → overlay dissolves) and hands over to Chapter 01, whose video
 * is left READY + PAUSED at frame 0 — the scroll drives the scene, the
 * loading screen never plays it.
 *
 * NOTE: this uses useLayoutEffect so the scroll-lock cleanup (overflow
 * restore) runs synchronously before the overlay node detaches.
 * ────────────────────────────────────────────────────────────────
 */

const MIN_SEQUENCE_MS = 1800
const MIN_SEQUENCE_RM_MS = 400
const VIDEO_TIMEOUT_MS = 7000
const FONT_TIMEOUT_MS = 3000
const COMPLETE_HOLD_MS = 300
const EXIT_MS = 420
const LEAVE_MS = 700

/** Weight of each Phase 01 asset group in the progress total. */
const WEIGHTS = { layout: 15, poster: 30, video: 35, fonts: 20 } as const

interface Ready {
  layout: boolean
  poster: boolean
  video: boolean
  fonts: boolean
}

type Phase = 'loading' | 'completing' | 'exiting' | 'leaving'

export function LoadingScreen() {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('loading')
  const [done, setDone] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const fillRef = useRef<HTMLSpanElement | null>(null)
  const pctRef = useRef<HTMLSpanElement | null>(null)

  useLayoutEffect(() => {
    const startedAt = performance.now()
    const ready: Ready = { layout: false, poster: false, video: false, fonts: false }
    const timers: number[] = []
    let poll: number | null = null
    let raf = 0
    let videoEl: HTMLElement | null = null
    let disposed = false
    let phaseState: Phase = 'loading'

    const target = () =>
      (ready.layout ? WEIGHTS.layout : 0) +
      (ready.poster ? WEIGHTS.poster : 0) +
      (ready.video ? WEIGHTS.video : 0) +
      (ready.fonts ? WEIGHTS.fonts : 0)

    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow

    // Keep the experience pinned at scroll 0 behind the overlay.
    window.scrollTo(0, 0)
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    pauseScroll()
    const unlock = () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      resumeScroll()
    }

    const timer = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms))
    }

    // 1) Phase 01 layout is ready on the first painted frame.
    raf = requestAnimationFrame(() => {
      if (!disposed) ready.layout = true
    })

    // 2) Phase 01 poster.
    const poster = new Image()
    poster.onload = () => {
      if (!disposed) ready.poster = true
    }
    poster.onerror = () => {
      // Fallback: proceed without the poster rather than stall.
      if (!disposed) ready.poster = true
    }
    poster.src = journey.chapters[0]?.media.poster ?? ''

    // 3) Phase 01 video — observe the real mounted element (preload auto).
    const markVideoReady = () => {
      if (disposed) return
      ready.video = true
      if (poll != null) {
        clearInterval(poll)
        poll = null
      }
    }
    const attachVideo = (el: HTMLElement) => {
      videoEl = el
      if (el instanceof HTMLVideoElement) {
        if (el.readyState >= 2) {
          markVideoReady()
          return
        }
        el.addEventListener('loadeddata', markVideoReady, { once: true })
        el.addEventListener('canplay', markVideoReady, { once: true })
        el.addEventListener('error', markVideoReady, { once: true })
      } else {
        // Poster / static fallback is already the visual — ready.
        markVideoReady()
      }
    }
    poll = window.setInterval(() => {
      if (disposed) return
      const el = videoManager.getChapterVideo(0)
      if (el) {
        if (poll != null) clearInterval(poll)
        poll = null
        attachVideo(el)
      }
    }, 150)
    timer(() => {
      if (!ready.video) markVideoReady()
    }, VIDEO_TIMEOUT_MS)

    // 4) Critical fonts.
    let fontsSettled = false
    const markFonts = () => {
      if (disposed || fontsSettled) return
      fontsSettled = true
      ready.fonts = true
    }
    document.fonts.ready.then(markFonts, markFonts)
    timer(markFonts, FONT_TIMEOUT_MS)

    // Progress easing + completion gating. The displayed value is written
    // straight to the DOM so the loader never triggers React re-renders.
    let display = 0
    const minMs = reduced ? MIN_SEQUENCE_RM_MS : MIN_SEQUENCE_MS
    const completeHold = reduced ? 80 : COMPLETE_HOLD_MS
    const exitMs = reduced ? 100 : EXIT_MS
    const leaveMs = reduced ? 150 : LEAVE_MS

    const loop = () => {
      if (disposed) return
      raf = requestAnimationFrame(loop)
      const t = target()
      if (reduced) {
        // No unnecessary motion — jump straight to the honest value.
        display = t
      } else {
        display += (t - display) * 0.14
      }
      const d = Math.min(100, display)
      if (fillRef.current) fillRef.current.style.width = `${d.toFixed(2)}%`
      if (pctRef.current) pctRef.current.textContent = `${Math.round(d)}%`
      if (rootRef.current) rootRef.current.setAttribute('aria-valuenow', String(Math.round(d)))

      if (
        phaseState === 'loading' &&
        t >= 100 &&
        performance.now() - startedAt >= minMs
      ) {
        phaseState = 'completing'
        setPhase('completing')
        timer(() => {
          if (disposed) return
          phaseState = 'exiting'
          setPhase('exiting')
          timer(() => {
            if (disposed) return
            phaseState = 'leaving'
            setPhase('leaving')
            timer(() => {
              if (disposed) return
              // The overlay keeps its component instance alive after this
              // component renders null, so clean up here explicitly rather
              // than relying on the effect cleanup.
              unlock()
              disposed = true
              cancelAnimationFrame(raf)
              if (poll != null) {
                clearInterval(poll)
                poll = null
              }
              if (videoEl instanceof HTMLVideoElement) {
                videoEl.removeEventListener('loadeddata', markVideoReady)
                videoEl.removeEventListener('canplay', markVideoReady)
                videoEl.removeEventListener('error', markVideoReady)
              }
              setDone(true)
            }, leaveMs)
          }, exitMs)
        }, completeHold)
      }
    }
    loop()

    return () => {
      disposed = true
      if (poll != null) clearInterval(poll)
      for (const t of timers) clearTimeout(t)
      cancelAnimationFrame(raf)
      if (videoEl instanceof HTMLVideoElement) {
        videoEl.removeEventListener('loadeddata', markVideoReady)
        videoEl.removeEventListener('canplay', markVideoReady)
        videoEl.removeEventListener('error', markVideoReady)
      }
      unlock()
    }
  }, [reduced])

  if (done) return null

  const ch = journey.chapters[0]
  const name = (ch?.location ?? ch?.title ?? 'Nepal').toUpperCase()

  return (
    <div
      ref={rootRef}
      className={`loading${phase === 'completing' ? ' is-completing' : ''}${phase === 'exiting' ? ' is-exiting' : ''}${phase === 'leaving' ? ' is-leaving' : ''}`}
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div className="loading__inner">
        <p className="loading__no">{ch?.number ?? '01'}</p>
        <h1 className="loading__title">{name}</h1>
        <p className="loading__tag">A JOURNEY IN PROGRESS</p>
        <div className="loading__progress">
          <span className="loading__line" aria-hidden="true">
            <span ref={fillRef} className="loading__fill" />
          </span>
          <span ref={pctRef} className="loading__pct">
            0%
          </span>
        </div>
      </div>
    </div>
  )
}
