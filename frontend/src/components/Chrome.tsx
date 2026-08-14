import { useEffect, useRef } from 'react'
import { journey } from '../data/journey'
import { scrollToId } from '../lib/scroll'
import { scrollSystem } from '../lib/scrollSystem'

interface ChromeProps {
  activeIndex: number
}

export function Chrome({ activeIndex }: ChromeProps) {
  const fillRef = useRef<HTMLDivElement | null>(null)
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Progress indicators update straight on the DOM from the scroll
  // clock, keeping React out of the hot path.
  useEffect(() => {
    const unreg = scrollSystem.registerFrame(() => {
      const s = scrollSystem.state
      if (fillRef.current) {
        fillRef.current.style.width = `${(s.progress * 100).toFixed(2)}%`
      }
      const dots = dotRefs.current
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]
        if (!d) continue
        const p = s.chapterProgress[i] ?? 0
        d.style.setProperty('--dp', p.toFixed(4))
      }
    })
    return () => unreg()
  }, [])

  const nextIndex = activeIndex + 1
  const hasNext = nextIndex < journey.chapters.length

  return (
    <div className="chrome">
      <div className="chrome__wordmark">
        <b>{journey.title}</b>
      </div>

      <div className="chrome__progress" aria-hidden="true">
        <div ref={fillRef} className="chrome__progress-fill" style={{ width: 0 }} />
      </div>

      <nav className="chrome__rail" aria-label="Chapters">
        {journey.chapters.map((ch, i) => (
          <button
            key={ch.id}
            ref={(el) => {
              dotRefs.current[i] = el
            }}
            type="button"
            className={`chrome__dot ${i === activeIndex ? 'is-active' : ''}`}
            onClick={() => scrollToId(ch.id)}
            aria-label={`Chapter ${ch.number}: ${ch.title}`}
            aria-current={i === activeIndex ? 'true' : undefined}
          >
            <span>{ch.number}</span>
            <i aria-hidden="true" />
          </button>
        ))}
      </nav>

      <div className="chrome__counter" aria-hidden="true">
        {String(activeIndex + 1).padStart(2, '0')} / {String(journey.chapters.length).padStart(2, '0')}
      </div>

      {hasNext ? (
        <button
          type="button"
          className="chrome__next"
          onClick={() => scrollToId(journey.chapters[nextIndex].id)}
        >
          <span>Next chapter</span>
          <i aria-hidden="true">↓</i>
        </button>
      ) : null}

      <nav className="chrome__mobile-dots" aria-label="Chapters">
        {journey.chapters.map((ch, i) => (
          <button
            key={ch.id}
            type="button"
            className={i === activeIndex ? 'is-active' : ''}
            onClick={() => scrollToId(ch.id)}
            aria-label={`Chapter ${ch.number}: ${ch.title}`}
            aria-current={i === activeIndex ? 'true' : undefined}
          />
        ))}
      </nav>
    </div>
  )
}
