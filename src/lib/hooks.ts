import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/** Track an element's content width via ResizeObserver. */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, width] as const
}

/** Two-way bind a URL query param (e.g. ?show=bluey) to React state, with back/forward support. */
export function useQueryParam(key: string): [string | null, (v: string | null) => void] {
  const read = () => new URLSearchParams(window.location.search).get(key)
  const [value, setValue] = useState<string | null>(read)

  useEffect(() => {
    const onPop = () => setValue(read())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const set = useCallback(
    (v: string | null) => {
      const params = new URLSearchParams(window.location.search)
      if (v === null) params.delete(key)
      else params.set(key, v)
      const qs = params.toString()
      window.history.pushState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname)
      setValue(v)
    },
    [key],
  )

  return [value, set]
}

/** True when the user prefers reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}
