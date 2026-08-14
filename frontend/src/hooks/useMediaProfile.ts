import { useEffect, useRef, useState } from 'react'

/**
 * Device + connection profile used to pick video quality tiers.
 *
 * Everything is read reactively: matchMedia queries and the Network
 * Information API (where available) push a new profile only when a
 * relevant value actually changes, so scroll-time rendering never
 * re-runs because of this hook.
 */

export interface MediaProfile {
  /** Small portrait screen (the portrait video cut applies). */
  isPortrait: boolean
  /** Touch / coarse pointer device. */
  isMobile: boolean
  /** User has OS data-saver enabled. */
  dataSaver: boolean
  /** Connection is slow (2G/3G or low downlink). */
  slowNetwork: boolean
  /** Prefer the lower-resolution video tier. */
  useLowQuality: boolean
  /** prefers-reduced-motion is set. */
  prefersReducedMotion: boolean
}

/** Minimal shape of the Network Information API — not in lib.dom for TS 6. */
interface NetworkInformationLike {
  saveData?: boolean
  effectiveType?: string
  downlink?: number
  addEventListener?: (type: string, listener: () => void) => void
  removeEventListener?: (type: string, listener: () => void) => void
}

interface NavigatorWithNetwork extends Navigator {
  connection?: NetworkInformationLike
}

const PORTRAIT_QUERY = '(max-width: 700px) and (orientation: portrait)'
const COARSE_QUERY = '(pointer: coarse)'
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

function getConnection(): NetworkInformationLike | undefined {
  return (navigator as NavigatorWithNetwork).connection
}

function isSlowNetwork(prevSlow: boolean | undefined): boolean {
  const conn = getConnection()
  if (!conn) return false
  const et = conn.effectiveType
  if (et === 'slow-2g' || et === '2g' || et === '3g') return true
  const downlink = typeof conn.downlink === 'number' ? conn.downlink : Number.NaN
  if (!Number.isFinite(downlink)) return false
  // Hysteresis: enter slow mode below ~1.5 Mbps but only leave it again
  // once the connection is clearly faster, so borderline connections
  // never flap between quality tiers and reload the current video.
  return prevSlow ? downlink < 2 : downlink < 1.5
}

function readProfile(prevSlow?: boolean): MediaProfile {
  const dataSaver = getConnection()?.saveData === true
  const slowNetwork = isSlowNetwork(prevSlow)
  return {
    isPortrait: window.matchMedia(PORTRAIT_QUERY).matches,
    isMobile: window.matchMedia(COARSE_QUERY).matches,
    dataSaver,
    slowNetwork,
    useLowQuality: dataSaver || slowNetwork,
    prefersReducedMotion: window.matchMedia(REDUCED_QUERY).matches,
  }
}

function sameProfile(a: MediaProfile, b: MediaProfile): boolean {
  return (
    a.isPortrait === b.isPortrait &&
    a.isMobile === b.isMobile &&
    a.dataSaver === b.dataSaver &&
    a.slowNetwork === b.slowNetwork &&
    a.prefersReducedMotion === b.prefersReducedMotion
  )
}

export function useMediaProfile(): MediaProfile {
  const [profile, setProfile] = useState<MediaProfile>(() => readProfile())
  const slowRef = useRef<boolean>(profile.slowNetwork)

  useEffect(() => {
    const mqs = [PORTRAIT_QUERY, COARSE_QUERY, REDUCED_QUERY].map((q) => window.matchMedia(q))
    const conn = getConnection()

    const update = () => {
      const next = readProfile(slowRef.current)
      slowRef.current = next.slowNetwork
      setProfile((prev) => (sameProfile(prev, next) ? prev : next))
    }

    const mqCleanups = mqs.map((mq) => {
      mq.addEventListener('change', update)
      return () => mq.removeEventListener('change', update)
    })

    let connected = false
    if (conn?.addEventListener) {
      conn.addEventListener('change', update)
      connected = true
    }

    return () => {
      mqCleanups.forEach((clean) => clean())
      if (connected && conn?.removeEventListener) conn.removeEventListener('change', update)
    }
  }, [])

  return profile
}
