import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { journey } from '../data/journey'
import { scrollSystem, chapterOpacity } from '../lib/scrollSystem'
import { videoManager } from '../lib/videoManager'
import { useMediaProfile } from '../hooks/useMediaProfile'
import { OptimizedVideo } from './OptimizedVideo'
import type { VideoElement } from './OptimizedVideo'
import type { VideoPriority } from '../lib/videoManager'
import type { Chapter } from '../data/journey'

interface VideoStageProps {
  reducedMotion: boolean
}

type MediaRefs = { current: Map<number, HTMLElement> }

interface StageVideoProps {
  index: number
  priority: VideoPriority
  media: Chapter['media']
  focus: string
  className: string
  mediaRefs: MediaRefs
}

/**
 * One mounted chapter layer. Memoized so that a change in the active
 * chapter only re-renders the layers whose fetch priority actually
 * changed — scroll-driven scrubbing never triggers React re-renders.
 */
const StageVideo = memo(function StageVideo({
  index,
  priority,
  media,
  focus,
  className,
  mediaRefs,
}: StageVideoProps) {
  const onElement = useCallback(
    (el: VideoElement | null) => {
      if (el) {
        mediaRefs.current.set(index, el)
        videoManager.registerChapterVideo(index, el)
      } else {
        mediaRefs.current.delete(index)
        videoManager.unregisterChapterVideo(index)
      }
    },
    [index, mediaRefs],
  )

  return (
    <OptimizedVideo
      source={media.video}
      portraitSource={media.videoPortrait}
      lowSource={media.videoLow}
      portraitLowSource={media.videoPortraitLow}
      poster={media.poster}
      priority={priority}
      className={className}
      objectPosition={focus}
      onElement={onElement}
    />
  )
})

/**
 * The fixed cinematic stage behind the story.
 *
 * Videos are never played. A per-frame callback in the scroll system
 * writes `video.currentTime = chapterProgress * duration`, so the
 * visitor's scroll scrubs the film both forward and backward. A small
 * window of chapters stays mounted (active ±1, plus one pre-warm) and
 * far-off chapters are removed from the DOM entirely so memory stays
 * bounded. Only the currently-visible video is ever decoded at full
 * speed; everything else is metadata-only until it is needed.
 */
export function VideoStage({ reducedMotion }: VideoStageProps) {
  const [activeIndex, setActiveIndex] = useState(() => scrollSystem.state.activeIndex)
  const [mounted, setMounted] = useState<number[]>([0])
  const mountedRef = useRef<number[]>(mounted)
  const mediaRefs = useRef<Map<number, HTMLElement>>(new Map())
  const { dataSaver } = useMediaProfile()

  useEffect(() => {
    mountedRef.current = mounted
  }, [mounted])

  useEffect(() => {
    const unreg = scrollSystem.registerFrame(() => {
      const chapters = scrollSystem.chapters
      const len = journey.chapters.length
      if (len === 0) return

      const active = scrollSystem.state.activeIndex
      setActiveIndex((prev) => (prev === active ? prev : active))

      // Keep a small window of chapters mounted so neighbouring
      // footage is loaded before the crossfade band arrives. Chapters
      // outside the window are unmounted (and their video sources
      // released) by React on the next render.
      const desired = new Set<number>()
      const add = (i: number) => {
        if (i >= 0 && i < len) desired.add(i)
      }
      add(active - 1)
      add(active)
      add(active + 1)
      if (chapters[active] && chapters[active].progress > 0.3) add(active + 2)

      const cur = mountedRef.current
      const changed = cur.length !== desired.size || cur.some((i) => !desired.has(i))
      if (changed) {
        const next = Array.from(desired).sort((a, b) => a - b)
        mountedRef.current = next
        setMounted(next)
      }

      // Escalate the incoming chapter from metadata → auto once this
      // chapter is partway through, so its footage is decoded and ready
      // for the crossfade. Data-saver users skip this: each chapter is
      // fetched only when it actually becomes the active one.
      if (!dataSaver) {
        const incoming = chapters[active + 1]
        if (incoming && incoming.progress > 0.25) {
          const el = mediaRefs.current.get(active + 1)
          if (el instanceof HTMLVideoElement && el.preload !== 'auto') el.preload = 'auto'
        }
      }

      // Scrub + crossfade every mounted layer. Under reduced motion the
      // mounted elements are posters (img) — their readyState guard
      // keeps them static while still crossfading between chapters.
      for (const i of mountedRef.current) {
        const el = mediaRefs.current.get(i)
        if (!el) continue
        const opacity = chapterOpacity(i, chapters)
        const current = el.style.opacity === '' ? 1 : parseFloat(el.style.opacity)
        if (Math.abs(current - opacity) > 0.01) {
          el.style.opacity = opacity.toFixed(3)
        }
        // Videos that are fully hidden are not scrubbed: seeking is the
        // single most expensive operation here, and skipping invisible
        // layers keeps the pipeline at one seek per frame except during
        // the brief double-crossfade bands.
        if (opacity < 0.02) continue
        const media = el as HTMLVideoElement
        if (!reducedMotion && media.readyState >= 2 && media.duration > 0 && !Number.isNaN(media.duration)) {
          const target = chapters[i].progress * media.duration
          if (Math.abs(media.currentTime - target) > 0.03) {
            media.currentTime = target
          }
        }
      }
    })
    return () => unreg()
  }, [reducedMotion, dataSaver])

  const activeChapter = journey.chapters[activeIndex]

  return (
    <div className="stage" aria-hidden="true">
      {mounted.map((i) => {
        const chapter = journey.chapters[i]
        if (!chapter) return null

        const className = `stage__video${chapter.media.videoPortrait ? ' stage__video--responsive' : ''}`

        if (reducedMotion) {
          return (
            <img
              key={chapter.id}
              src={chapter.media.poster}
              alt=""
              ref={(el) => {
                if (el) {
                  mediaRefs.current.set(i, el)
                  videoManager.registerChapterVideo(i, el)
                } else {
                  mediaRefs.current.delete(i)
                  videoManager.unregisterChapterVideo(i)
                }
              }}
              className={className}
              style={{ opacity: 0 }}
              loading="lazy"
              decoding="async"
            />
          )
        }

        return (
          <StageVideo
            key={chapter.id}
            index={i}
            priority={i === activeIndex ? 'active' : 'near'}
            media={chapter.media}
            focus={chapter.focus}
            className={className}
            mediaRefs={mediaRefs}
          />
        )
      })}

      <div className={`stage__atmosphere atmo-${activeChapter?.atmosphere ?? 'dawn'}`} />
      <div className="stage__scrim" />
    </div>
  )
}
