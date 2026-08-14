import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMediaProfile } from '../hooks/useMediaProfile'
import { preloadForPriority, videoManager, type VideoPriority } from '../lib/videoManager'

export type VideoElement = HTMLVideoElement | HTMLImageElement

export interface OptimizedVideoProps {
  /** Primary source (landscape cut). */
  source: string
  /** Poster shown before frames decode and as the failure fallback. */
  poster: string
  /** Portrait cut served to small portrait screens. */
  portraitSource?: string
  /** Lower-resolution landscape cut for slow connections / data saver. */
  lowSource?: string
  /** Lower-resolution portrait cut for slow connections / data saver. */
  portraitLowSource?: string
  /** Fetch/decoding priority. 'active' → preload auto; 'near' → metadata; 'hidden' → none. */
  priority?: VideoPriority
  className?: string
  /** CSS object-position for framing / mobile crop. */
  objectPosition?: string
  /** Reports the live element (video or img) to the parent scrub system. */
  onElement?: (el: VideoElement | null) => void
  /** Autoplay while visible and pause when it leaves the viewport. */
  autoplayVisible?: boolean
}

/**
 * A single, reusable, optimized video layer.
 *
 *  • Responsive quality — picks landscape/portrait and low/high tiers
 *    from the device + connection profile (see useMediaProfile).
 *  • Lazy fetching — preload is driven by the `priority` prop, so a
 *    hidden video never downloads; neighbors fetch metadata only and
 *    the visible video is preloaded fully.
 *  • Poster-first — the `poster` attribute is always set; on error the
 *    element falls back to a static image so the frame never breaks.
 *  • Reduced motion — callers can render the poster still instead.
 *  • Re-render safe — playback is never reflected into React state;
 *    the parent scrubs the returned element directly via refs.
 */
export const OptimizedVideo = memo(function OptimizedVideo({
  source,
  poster,
  portraitSource,
  lowSource,
  portraitLowSource,
  priority = 'active',
  className,
  objectPosition,
  onElement,
  autoplayVisible = false,
}: OptimizedVideoProps) {
  const profile = useMediaProfile()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const posterRef = useRef<HTMLImageElement | null>(null)
  const [failed, setFailed] = useState(false)

  // Best source for this device + connection.
  const resolved = useMemo(() => {
    if (profile.isPortrait) {
      if (profile.useLowQuality && portraitLowSource) return portraitLowSource
      if (portraitSource) return portraitSource
    }
    if (profile.useLowQuality && lowSource) return lowSource
    return source
  }, [profile.isPortrait, profile.useLowQuality, portraitSource, portraitLowSource, lowSource, source])

  const handleError = useCallback(() => setFailed(true), [])

  // Re-arm the element when the chosen source changes (orientation or
  // quality tier changed at runtime).
  useEffect(() => {
    const el = videoRef.current
    if (!el || failed) return
    if (el.getAttribute('src') !== resolved) {
      el.setAttribute('src', resolved)
      el.load()
    }
  }, [resolved, failed])

  // Register with the parent scrub system (video while playing, the
  // poster image when failed so the crossfade keeps working).
  useEffect(() => {
    if (!onElement) return
    onElement(failed ? posterRef.current : videoRef.current)
    return () => onElement(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onElement, failed])

  // Autoplay-visible mode: play only while on screen, and only ever
  // play one video at a time via the central coordinator.
  useEffect(() => {
    const el = videoRef.current
    if (!el || !autoplayVisible || failed) return
    videoManager.register(el, { autoplay: true })
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            videoManager.pauseAllBut(el)
            // autoplay may be rejected before the media is ready; ignore.
            el.play().catch(() => {})
          } else {
            el.pause()
          }
        }
      },
      { rootMargin: '25% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      videoManager.unregister(el)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayVisible, failed])

  if (failed) {
    return (
      <img
        ref={posterRef}
        className={className}
        src={poster}
        alt=""
        loading="lazy"
        decoding="async"
        style={objectPosition ? { objectPosition } : undefined}
      />
    )
  }

  return (
    <video
      ref={videoRef}
      className={className}
      src={resolved}
      poster={poster}
      style={objectPosition ? { objectPosition } : undefined}
      preload={preloadForPriority(priority)}
      muted
      loop
      playsInline
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      onError={handleError}
    />
  )
})
