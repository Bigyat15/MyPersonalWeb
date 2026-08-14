import { useEffect, useRef, type CSSProperties } from 'react'
import type { Chapter } from '../data/journey'
import { scenes, type SceneLayer } from '../data/scenes'
import { scrollSystem, CROSSFADE_VH, TEXT_HOLD_END, clamp01 } from '../lib/scrollSystem'
import { applyLayer, layerProps } from '../lib/choreography'
import { registerLayer, unregisterLayer } from '../lib/adaptiveTextContrast'
import { useJourney } from '../context/JourneyContext'

interface ChapterSectionProps {
  chapter: Chapter
  index: number
}

function placementStyle(layer: SceneLayer): CSSProperties {
  const s = {
    '--x': `${layer.x}%`,
    '--y': `${layer.y}%`,
    '--mobX': `${layer.mobileX ?? layer.x}%`,
    '--mobY': `${layer.mobileY ?? layer.y}%`,
  } as CSSProperties
  return s
}

/**
 * A chapter is a tall scroll section whose sticky inner frame holds the
 * cinematic typography. The scroll system maps the section's progress
 * onto `--p` and drives each text layer's keyframe choreography.
 */
export function ChapterSection({ chapter, index }: ChapterSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const layerRefs = useRef<Record<string, HTMLElement>>({})
  const { reducedMotion } = useJourney()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const unregChapter = scrollSystem.registerChapter(index, el)

    const scene = scenes[index]
    const specs = scene.layers.map((l) => ({ ...l, used: layerProps(l.keys) }))

    const unregFrame = scrollSystem.registerFrame(() => {
      if (reducedMotion) return
      const c = scrollSystem.chapters[index]
      let p = c?.progress ?? 0
      // Map the choreography onto the period while this chapter's frame
      // is pinned and visible — starting at the crossfade band and ending
      // before the next band, so reveals play in front of the visitor and
      // every layer is long gone before the outgoing crossfade.
      if (c) {
        const span = Math.max(1, c.end - c.start)
        const pin = c.start > 0 ? (window.innerHeight * CROSSFADE_VH) / span : 0
        p = clamp01((p - pin) / (TEXT_HOLD_END - pin))
      }
      for (const spec of specs) {
        const node = layerRefs.current[spec.id]
        if (node) applyLayer(node, spec.keys, p, spec.used)
      }
    })

    return () => {
      unregChapter()
      unregFrame()
    }
  }, [index, reducedMotion])

  // Feed this chapter's text layers to the adaptive text-contrast system
  // so their ink adapts to the video region behind them.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const layers = Array.from(el.querySelectorAll<HTMLElement>('.layer'))
    for (const layer of layers) registerLayer(index, layer)
    return () => {
      for (const layer of layers) unregisterLayer(index, layer)
    }
  }, [index])

  const scene = scenes[index] ?? { layers: [] as SceneLayer[] }

  return (
    <section
      ref={sectionRef}
      id={chapter.id}
      className="chapter"
      data-chapter={chapter.id}
      data-atmosphere={chapter.atmosphere}
      data-tone={chapter.tone}
      aria-labelledby={`${chapter.id}-title`}
    >
      <h2 id={`${chapter.id}-title`} className="sr-only">
        Chapter {chapter.number}: {chapter.title}
      </h2>

      <div className="chapter__frame" aria-hidden="true">
        {scene.layers.map((layer) => (
          <div
            key={layer.id}
            className={`layer layer--${layer.tag}`}
            data-align={layer.align}
            data-malign={layer.mobileAlign ?? layer.align}
            style={placementStyle(layer)}
          >
            <div
              className="layer__anim"
              ref={(el) => {
                if (el) layerRefs.current[layer.id] = el
              }}
            >
              {layer.split ? (
                <span className="title__split">
                  <span className="split__small">{layer.split.small}</span>
                  <span className="split__big">{layer.split.big}</span>
                </span>
              ) : (
                layer.text
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
