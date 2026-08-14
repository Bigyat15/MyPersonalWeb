import { createContext, useContext } from 'react'

export interface JourneyContextValue {
  /** Id of the chapter currently in view. */
  activeChapterId: string
  /** Index (0-based) into journey.chapters of the active chapter, or -1. */
  activeIndex: number
  reducedMotion: boolean
}

export const JourneyContext = createContext<JourneyContextValue | null>(null)

export function useJourney(): JourneyContextValue {
  const ctx = useContext(JourneyContext)
  if (!ctx) throw new Error('useJourney must be used within <JourneyContext.Provider>')
  return ctx
}
