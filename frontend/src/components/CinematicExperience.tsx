import { lazy, Suspense, useEffect } from 'react'
import { journey } from '../data/journey'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useScrollFrameState } from '../hooks/useScrollFrameState'
import { initLenis, scrollToTop } from '../lib/scroll'
import { JourneyContext } from '../context/JourneyContext'
import { VideoStage } from './VideoStage'
import { Chrome } from './Chrome'
import { ChapterSection } from './ChapterSection'
import { JourneyMap } from './JourneyMap'
import { Currently } from './Currently'
import { Experience } from './Experience'
import { Projects } from './Projects'
import { Skills } from './Skills'
import { Timeline } from './Timeline'
import { FutureChapters } from './FutureChapters'
import { Closing } from './Closing'

// The 3D ambient layer ships Three.js (~1MB). It is code-split, only
// loads after the journey has begun, and appears only once the visitor
// has moved past the cinematic chapters so it never competes with the
// footage.
const SceneCanvas = lazy(() =>
  import('../webgl/SceneCanvas').then((m) => ({ default: m.SceneCanvas })),
)

export function CinematicExperience() {
  const reducedMotion = useReducedMotion()
  const { activeIndex, trailing } = useScrollFrameState()

  // Smooth inertial scroll (native behaviour under reduced motion).
  useEffect(() => initLenis(reducedMotion), [reducedMotion])

  const restart = () => {
    scrollToTop()
  }

  const ctx = {
    activeChapterId: activeIndex >= 0 ? journey.chapters[activeIndex]?.id ?? '' : '',
    activeIndex,
    reducedMotion,
  }

  return (
    <JourneyContext.Provider value={ctx}>
      {/* Cinematic video stage (fixed, behind content) */}
      <VideoStage reducedMotion={reducedMotion} />

      {/* Ambient 3D field — appears only after the chapters end */}
      {!reducedMotion && trailing ? (
        <div className="webgl" aria-hidden="true">
          <Suspense fallback={null}>
            <SceneCanvas />
          </Suspense>
        </div>
      ) : null}

      {/* Scrollable story */}
      <a className="skip-link" href="#map">
        Skip to journey map
      </a>
      <main className="content">
        <ChapterSection chapter={journey.chapters[0]} index={0} />
        {journey.chapters.slice(1).map((ch, i) => (
          <ChapterSection key={ch.id} chapter={ch} index={i + 1} />
        ))}

        <JourneyMap />
        <Currently />
        <Experience />
        <Projects />
        <Skills />
        <Timeline />
        <FutureChapters />
        <Closing onRestart={restart} />
      </main>

      <Chrome activeIndex={activeIndex} />
    </JourneyContext.Provider>
  )
}
