import { journey } from '../data/journey'
import { useInView } from '../hooks/useInView'

interface ClosingProps {
  onRestart: () => void
}

export function Closing({ onRestart }: ClosingProps) {
  const { ref } = useInView<HTMLElement>({ threshold: 0.35 })

  return (
    <section ref={ref} className="closing" data-chapter="closing" aria-label="Closing">
      <p className="closing__line display reveal">
        {journey.closing[0]}
        <br />
        <span style={{ color: 'var(--gold)' }}>{journey.closing[1]}</span>
      </p>

      <p className="closing__sub reveal d1">More chapters will be added as they happen.</p>

      <div className="closing__cta reveal d2">
        <button type="button" className="btn-begin" onClick={onRestart}>
          <span className="btn-label">Return to the beginning</span>
          <span className="btn-arrow" aria-hidden="true">
            ↑
          </span>
        </button>
      </div>

      <footer className="closing__footer">
        <span>Bigyat Thapa</span>
        <span>Nepal → Australia</span>
      </footer>
    </section>
  )
}
