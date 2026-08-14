import { useState } from 'react'
import { experience } from '../data/experience'
import { skillLabel } from '../data/skills'
import { useInView } from '../hooks/useInView'

export function Experience() {
  const { ref } = useInView<HTMLElement>({ threshold: 0.12 })
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section ref={ref} className="edition experience" data-chapter="experience" aria-labelledby="experience-title">
      <div className="edition__inner">
        <header className="section-head reveal">
          <span className="eyebrow">Experience</span>
          <h2 id="experience-title" className="display section-head__title reveal d1">
            The work behind the journey.
          </h2>
          <p className="section-head__note reveal d2">
            Professional chapters so far — each one opens up as it was lived.
          </p>
        </header>

        <div className="experience__list">
          {experience.map((exp, i) => {
            const open = openId === exp.id
            return (
              <article
                key={exp.id}
                className={`exp-row reveal d${i + 1} ${exp.featured ? 'is-featured' : ''} ${open ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="exp-row__head"
                  onClick={() => setOpenId(open ? null : exp.id)}
                  aria-expanded={open}
                  aria-controls={`exp-${exp.id}`}
                >
                  <span className="exp-row__num" aria-hidden="true">
                    {exp.number}
                  </span>
                  <span className="exp-row__main">
                    <span className="exp-row__kicker">{exp.kicker}</span>
                    <span className="exp-row__role display">{exp.role}</span>
                    <span className="exp-row__meta">
                      {exp.company} · {exp.location} · {exp.period}
                    </span>
                  </span>
                  <span className="exp-row__toggle" aria-hidden="true">
                    {open ? '—' : '+'}
                  </span>
                </button>

                <div id={`exp-${exp.id}`} className="exp-row__body">
                  <div className="exp-row__content">
                    <p className="exp-row__summary">{exp.summary}</p>

                    <div className="exp-row__blocks">
                      <div className="exp-block">
                        <h3 className="exp-block__label">What I did</h3>
                        <ul className="exp-block__list">
                          {exp.did.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {exp.learned ? (
                        <div className="exp-block">
                          <h3 className="exp-block__label">What I learned</h3>
                          <ul className="exp-block__list">
                            {exp.learned.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div className="exp-block">
                        <h3 className="exp-block__label">Technologies</h3>
                        <ul className="exp-block__tags">
                          {exp.stack.map((id) => (
                            <li key={id} className="tag">
                              {skillLabel(id)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
