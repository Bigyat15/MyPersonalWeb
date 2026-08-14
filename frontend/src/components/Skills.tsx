import { useMemo, useState } from 'react'
import { projects } from '../data/projects'
import { SKILL_GROUPS, skillLabel } from '../data/skills'
import { useInView } from '../hooks/useInView'

export function Skills() {
  const { ref } = useInView<HTMLElement>({ threshold: 0.08 })
  const [active, setActive] = useState('django')

  // Derive "used in" relationships from the projects themselves — one
  // source of truth, so adding a project automatically updates the map.
  const related = useMemo(
    () => projects.filter((p) => p.stack.includes(active)).map((p) => ({ number: p.number, title: p.title })),
    [active],
  )

  return (
    <section ref={ref} className="edition skills" data-chapter="skills" aria-labelledby="skills-title">
      <div className="edition__inner">
        <header className="section-head reveal">
          <span className="eyebrow">Skills</span>
          <h2 id="skills-title" className="display section-head__title reveal d1">
            The tools I build with.
          </h2>
          <p className="section-head__note reveal d2">
            An ecosystem, not a badge wall. Select a technology to see the work it was actually used in.
          </p>
        </header>

        <div className="skills__layout">
          <div className="skills__clusters">
            {SKILL_GROUPS.map((group, gi) => (
              <div key={group.id} className="skill-cluster reveal d2" style={{ transitionDelay: `${gi * 60}ms` }}>
                <h3 className="skill-cluster__label">{group.label}</h3>
                <div className="skill-cluster__nodes">
                  {group.skills.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={`skill-node ${active === id ? 'is-active' : ''}`}
                      onClick={() => setActive(id)}
                      aria-pressed={active === id}
                    >
                      {skillLabel(id)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <aside className="skills__panel reveal d2" aria-live="polite">
            <span className="eyebrow">Used in</span>
            <h3 className="skills__panel-name display">{skillLabel(active)}</h3>

            {related.length ? (
              <ul className="skills__panel-list">
                {related.map((p) => (
                  <li key={p.number}>
                    <span className="skills__panel-num" aria-hidden="true">
                      {p.number}
                    </span>
                    <span>{p.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="skills__panel-empty">Applied across personal and upcoming builds.</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
