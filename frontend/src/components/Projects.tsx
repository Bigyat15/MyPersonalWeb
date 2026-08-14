import { useState } from 'react'
import { projects, type Project } from '../data/projects'
import { skillLabel } from '../data/skills'
import { useInView } from '../hooks/useInView'
import { ProjectDetail } from './ProjectDetail'

export function Projects() {
  const { ref } = useInView<HTMLElement>({ threshold: 0.08 })
  const [selected, setSelected] = useState<Project | null>(null)

  return (
    <section ref={ref} className="edition projects" data-chapter="projects" aria-labelledby="projects-title">
      <div className="edition__inner">
        <header className="section-head reveal">
          <span className="eyebrow">Projects</span>
          <h2 id="projects-title" className="display section-head__title reveal d1">
            Built, iterated, shipped.
          </h2>
          <p className="section-head__note reveal d2">
            An index of work — from the first real build to the projects still being written. Select one to step inside.
          </p>
        </header>

        <div className="projects__list">
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`project-item reveal d${i + 1} ${p.featured ? 'is-featured' : ''}`}
              onClick={() => setSelected(p)}
              aria-haspopup="dialog"
            >
              <span className="project-item__num" aria-hidden="true">
                {p.number}
              </span>
              <span className="project-item__copy">
                <span className="project-item__row">
                  <span className="project-item__title display">{p.title}</span>
                  <span className={`project-item__status ${p.statusKind === 'current' ? 'is-current' : ''}`}>
                    {p.status}
                  </span>
                </span>
                <span className="project-item__story">{p.story}</span>
                <span className="project-item__stack" aria-hidden="true">
                  {p.stack.map((id) => skillLabel(id)).join('  ·  ')}
                </span>
              </span>
              <span className="project-item__open" aria-hidden="true">
                Open →
              </span>
            </button>
          ))}
        </div>
      </div>

      {selected ? <ProjectDetail project={selected} onClose={() => setSelected(null)} /> : null}
    </section>
  )
}
