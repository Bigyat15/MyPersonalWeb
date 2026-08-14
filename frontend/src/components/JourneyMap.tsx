import { journey } from '../data/journey'
import { useInView } from '../hooks/useInView'
import { scrollToId } from '../lib/scroll'

const ROUTE_LABELS: Record<string, string> = {
  'ch-01': 'Nepal',
  'ch-02': 'The Journey',
  'ch-03': 'Australia',
  'ch-04': 'IT Education',
  'ch-05': 'The Foundation',
}

export function JourneyMap() {
  const { ref } = useInView<HTMLElement>({ threshold: 0.2 })
  const total = journey.chapters.length

  return (
    <section ref={ref} className="map" data-chapter="map" aria-label="Journey map">
      <div className="map__inner">
        <header className="map__head reveal">
          <span className="eyebrow">The Route</span>
          <h2 className="display map__title">The journey so far</h2>
        </header>

        <div className="map__path">
          <div className="map__line" aria-hidden="true" />

          {journey.chapters.map((ch, i) => {
            const current = ch.status === 'in-progress'
            return (
              <button
                key={ch.id}
                type="button"
                className={`map__node reveal ${current ? 'is-current' : ''} d${i + 1}`}
                onClick={() => scrollToId(ch.id)}
                aria-label={`Go to chapter ${ch.number}: ${ch.title}`}
              >
                <span className="map__node-copy">
                  <span className="map__node-head">
                    <span className="map__node-loc">{ROUTE_LABELS[ch.id] ?? ch.title}</span>
                    <span className="map__node-num">{ch.number}</span>
                  </span>
                  <span className="map__node-sub">{ch.kicker}</span>
                  <span className="map__node-status">
                    {current ? 'In progress' : `Chapter ${ch.number}`}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <p className="map__head reveal d3" style={{ marginTop: '3rem', marginBottom: 0 }}>
          <span className="eyebrow" style={{ color: 'var(--paper-faint)' }}>
            {total} chapters so far — select one to return
          </span>
        </p>
      </div>
    </section>
  )
}
