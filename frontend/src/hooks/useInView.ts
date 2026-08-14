import { useEffect, useRef, useState } from 'react'

interface Options {
  /** Fraction of the element that must be visible before it fires. */
  threshold?: number
  /** Adds the `is-inview` class to the element instead of re-rendering. */
  toggleClass?: boolean
}

/**
 * Observes visibility and toggles the `is-inview` class on the target
 * element (the recommended path for the chapter sections — avoids
 * re-rendering React trees during scroll) and reports the value too.
 */
export function useInView<T extends HTMLElement>(options: Options = {}) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  const { threshold = 0.25, toggleClass = true } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const active = entry.isIntersecting
          setInView(active)
          if (toggleClass) {
            el.classList.toggle('is-inview', active)
          }
        }
      },
      { threshold },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [threshold, toggleClass])

  return { ref, inView }
}
