import { journey } from '../data/journey'
import { useInView } from '../hooks/useInView'

export function Currently() {
  const { ref } = useInView<HTMLElement>({ threshold: 0.3 })
  const { currently } = journey

  return (
    <section ref={ref} className="currently" data-chapter="currently" aria-labelledby="currently-title">
      <div className="currently__inner">
        <span className="eyebrow currently__eyebrow reveal">{currently.kicker}</span>

        <h2 id="currently-title" className="display currently__role reveal d1">
          {currently.role}
        </h2>

        <div className="currently__status reveal d2">
          <span className="pulse-dot" aria-hidden="true" />
          {currently.status}
        </div>

        <div className="currently__lines">
          {currently.lines.map((line, i) => (
            <p key={i} className="reveal d2" style={{ transitionDelay: `${260 + i * 140}ms` }}>
              {line}
            </p>
          ))}
        </div>

        <div className="currently__meta reveal d3">
          <span>Location · {currently.location}</span>
          <span>Focus · {currently.focus}</span>
        </div>
      </div>
    </section>
  )
}
