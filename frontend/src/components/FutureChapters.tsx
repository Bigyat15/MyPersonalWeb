import { journey } from '../data/journey'
import { useInView } from '../hooks/useInView'

export function FutureChapters() {
  const { ref } = useInView<HTMLElement>({ threshold: 0.15 })

  return (
    <section ref={ref} className="edition future" data-chapter="future" aria-labelledby="future-title">
      <div className="edition__inner">
        <header className="section-head reveal">
          <span className="eyebrow">The Next Chapters</span>
          <h2 id="future-title" className="display section-head__title reveal d1">
            Not yet. But on the map.
          </h2>
          <p className="section-head__note reveal d2">
            Nothing here has happened. These are the directions the story may take — added to the journey only when they
            become real.
          </p>
        </header>

        <div className="future__list">
          <span className="future__rail" aria-hidden="true" />
          {journey.future.map((f, i) => (
            <article key={f.title} className="future__item reveal d2" style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="future__item-node" aria-hidden="true" />
              <div className="future__item-copy">
                <span className="future__item-phase">{f.phase}</span>
                <h3 className="future__item-title">{f.title}</h3>
                <p className="future__item-hint">{f.hint}</p>
              </div>
              <span className="future__item-tag">Upcoming</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
