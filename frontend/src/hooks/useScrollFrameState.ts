import { useEffect, useState } from 'react'
import { scrollSystem } from '../lib/scrollSystem'

export interface FrameState {
  activeIndex: number
  trailing: boolean
}

/**
 * Subscribes to the scroll system and re-renders only when the
 * discrete state changes (active chapter / trailing flag). Continuous
 * values like progress are consumed via direct-DOM frame callbacks so
 * React never re-renders per scroll frame.
 */
export function useScrollFrameState(): FrameState {
  const [state, setState] = useState<FrameState>({
    activeIndex: scrollSystem.state.activeIndex,
    trailing: scrollSystem.state.trailing,
  })

  useEffect(() => {
    scrollSystem.start()
    return scrollSystem.registerFrame(() => {
      const s = scrollSystem.state
      setState((prev) =>
        prev.activeIndex !== s.activeIndex || prev.trailing !== s.trailing
          ? { activeIndex: s.activeIndex, trailing: s.trailing }
          : prev,
      )
    })
  }, [])

  return state
}
