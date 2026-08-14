import { timeline, SPHERE_LABELS } from '../data/timeline'
import { useInView } from '../hooks/useInView'

export function Timeline() {
  const { ref } = useInView<HTMLElement>({ threshold: 0.1 })

  return (
    <section ref={ref} className="edition timeline" data-chapter="timeline" aria-labelledby="timeline-title">
      <div className="edition__inner">
        <header className="section-head reveal">
          <span className="eyebrow">The Road So Far</span>
          <h2 id="timeline-title" className="display section-head__title reveal d1">
            One thing at a time.
          </h2>
          <p className="section-head__note reveal d2">
            The personal and the professional, meeting on the same line.
          </p>
        </header>

        <ol className="timeline__list">
          <li className="timeline__rail" aria-hidden="true" />
          {timeline.map((entry, i) => (
            <li key={`${entry.year}-${entry.title}`} className="tl-entry reveal d1">
              <span className="tl-entry__year">{entry.year}</span>
              <span className="tl-entry__node" aria-hidden="true" />
              <div className="tl-entry__body">
                <span className="tl-entry__sphere">{SPHERE_LABELS[entry.sphere]}</span>
                <h3 className="tl-entry__title">{entry.title}</h3>
                {entry.note ? <p className="tl-entry__note">{entry.note}</p> : null}
              </div>
              <span className="tl-entry__index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
