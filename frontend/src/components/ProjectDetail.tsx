import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Project } from '../data/projects'
import { skillLabel } from '../data/skills'
import { pauseScroll, resumeScroll } from '../lib/scroll'

interface ProjectDetailProps {
  project: Project
  onClose: () => void
}

/**
 * Cinematic project detail — the gallery's answer to a modal. The panel
 * clips up from the base of the viewport like a new scene, content
 * staggers in, and returning simply reverses it. Under reduced motion
 * the CSS layer renders it statically and instantly.
 */
export function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  const [entered, setEntered] = useState(false)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    pauseScroll()
    document.body.style.overflow = 'hidden'
    document.body.classList.add('pd-open')
    const frame = requestAnimationFrame(() => setEntered(true))
    const lastFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(frame)
      resumeScroll()
      document.body.style.overflow = ''
      document.body.classList.remove('pd-open')
      window.removeEventListener('keydown', onKey)
      lastFocused?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return createPortal(
    <div
      className={`pd ${entered ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — project details`}
    >
      <button type="button" className="pd__backdrop" onClick={onClose} aria-label="Close project details" tabIndex={-1} />

      <div className="pd__panel" ref={panelRef}>
        <div className="pd__scroll">
          <header className="pd__head">
            <button ref={closeRef} type="button" className="pd__close" onClick={onClose}>
              <span aria-hidden="true">×</span>
              <span className="pd__close-label">Close</span>
            </button>
            <span className={`pd__status ${project.statusKind === 'current' ? 'is-current' : ''}`}>{project.status}</span>
          </header>

          <div className="pd__title-block">
            <span className="pd__num" aria-hidden="true">
              {project.number}
            </span>
            <h3 className="pd__title display">{project.title}</h3>
          </div>

          <p className="pd__story">{project.story}</p>

          <div className="pd__grid">
            <div className="pd__col">
              <h4 className="pd__label">Features</h4>
              <ul className="pd__features">
                {project.features.map((f, i) => (
                  <li key={f} style={{ transitionDelay: `${120 + i * 45}ms` }}>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pd__col">
              <h4 className="pd__label">Technology</h4>
              <ul className="pd__stack">
                {project.stack.map((id) => (
                  <li key={id} className="tag">
                    {skillLabel(id)}
                  </li>
                ))}
              </ul>

              {project.role ? (
                <p className="pd__role">
                  <span className="pd__label">Role</span>
                  {project.role}
                </p>
              ) : null}

              {project.links?.length ? (
                <div className="pd__links">
                  {project.links.map((l) => (
                    <a key={l.href} href={l.href} className="pd__link" target="_blank" rel="noreferrer">
                      {l.label} →
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
