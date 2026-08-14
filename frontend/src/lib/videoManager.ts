/**
 * ────────────────────────────────────────────────────────────────
 * VIDEO MANAGER — central coordination of every <video> on the page.
 *
 * The cinematic chapters do not autoplay: their frames are scrubbed
 * from scroll progress by the scroll system. This module still owns
 * the shared playback policy so any *visible* video is the only one
 * actually playing at a time, far-off videos are never decoding, and
 * preload discipline is consistent across the whole site.
 * ────────────────────────────────────────────────────────────────
 */

export type VideoPriority = 'hidden' | 'near' | 'active'

/** preload level that matches a priority. */
export function preloadForPriority(priority: VideoPriority): 'none' | 'metadata' | 'auto' {
  return priority === 'active' ? 'auto' : priority === 'near' ? 'metadata' : 'none'
}

interface ManagedVideo {
  autoplay: boolean
}

class VideoManager {
  private videos = new Map<HTMLVideoElement, ManagedVideo>()
  private chapterVideos = new Map<number, HTMLElement>()

  /** Registers a video element with the coordinator. */
  register(el: HTMLVideoElement, opts: { autoplay?: boolean } = {}): void {
    this.videos.set(el, { autoplay: opts.autoplay ?? false })
  }

  unregister(el: HTMLVideoElement): void {
    this.videos.delete(el)
  }

  /** Registers the live media element (video or poster img) of a chapter. */
  registerChapterVideo(index: number, el: HTMLElement): void {
    this.chapterVideos.set(index, el)
  }

  unregisterChapterVideo(index: number): void {
    this.chapterVideos.delete(index)
  }

  /** The current media element for a chapter, if one is mounted. */
  getChapterVideo(index: number): HTMLElement | undefined {
    return this.chapterVideos.get(index)
  }

  /** Pauses every registered video except `keep`. */
  pauseAllBut(keep: HTMLVideoElement): void {
    for (const el of this.videos.keys()) {
      if (el !== keep && !el.paused) el.pause()
    }
  }

  /** Pauses every registered video. */
  pauseAll(): void {
    for (const el of this.videos.keys()) {
      if (!el.paused) el.pause()
    }
  }

  /**
   * Pauses a video that is far outside the viewport so it stops
   * decoding frames. Memory for far-off videos is reclaimed by the
   * parent removing them from the DOM entirely (the stage keeps only a
   * small window mounted); this is the last-resort pause for videos
   * that must stay mounted.
   */
  suspend(el: HTMLVideoElement): void {
    try {
      if (!el.paused) el.pause()
    } catch {
      /* best-effort; never throw from the coordinator */
    }
  }
}

export const videoManager = new VideoManager()
