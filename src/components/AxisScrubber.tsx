import { useRef, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from 'react'
import { ageToFrac, fracToAge, SCRUB_MAX } from '../lib/scale'
import { spectrumColor } from '../lib/spectrum'

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n)

const scrubLabel = (age: number) => (age >= SCRUB_MAX ? 'Adult' : String(age))

interface Props {
  scrubAge: number | null
  setScrubAge: (a: number | null) => void
  /** number of (filtered) shows whose span covers scrubAge */
  count: number
  total: number
  /** px height of the axis header strip that acts as the drag rail */
  railHeight: number
}

/**
 * The draggable vertical marker on the age axis. Dragging it lights every bar
 * whose range covers that age and dims the rest — the payoff of the whole idea:
 * "what can a 9-year-old actually watch?"
 */
export function AxisScrubber({ scrubAge, setScrubAge, count, total, railHeight }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const ageFromClientX = (clientX: number): number => {
    const el = rootRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const frac = (clientX - rect.left) / rect.width
    return Math.round(clamp(fracToAge(frac), 0, SCRUB_MAX))
  }

  const onPointerDown = (e: RPointerEvent) => {
    e.preventDefault()
    dragging.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setScrubAge(ageFromClientX(e.clientX))
  }
  const onPointerMove = (e: RPointerEvent) => {
    if (!dragging.current) return
    setScrubAge(ageFromClientX(e.clientX))
  }
  const onPointerUp = (e: RPointerEvent) => {
    dragging.current = false
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* no-op */
    }
  }

  const onKeyDown = (e: RKeyboardEvent) => {
    const cur = scrubAge ?? 8
    let next: number | null = cur
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        next = clamp(cur - 1, 0, SCRUB_MAX)
        break
      case 'ArrowRight':
      case 'ArrowUp':
        next = clamp(cur + 1, 0, SCRUB_MAX)
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = SCRUB_MAX
        break
      case 'Escape':
        next = null
        break
      default:
        return
    }
    e.preventDefault()
    setScrubAge(next)
  }

  const active = scrubAge !== null
  const markerAge = scrubAge ?? 8
  const leftPct = ageToFrac(markerAge) * 100
  const markerColor = spectrumColor(Math.min(markerAge, 17))

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-20">
      {/* Drag rail across the axis header */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="Age scrubber — drag to see what a given age can watch"
        aria-valuemin={0}
        aria-valuemax={SCRUB_MAX}
        aria-valuenow={markerAge}
        aria-valuetext={active ? `Age ${scrubLabel(markerAge)}, ${count} shows` : 'Not set'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        className="pointer-events-auto absolute inset-x-0 top-0 cursor-ew-resize touch-none select-none rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-spectrum-4/70"
        style={{ height: railHeight }}
      />

      {/* Vertical marker line spanning the full plot height */}
      <div
        className="absolute bottom-0 transition-opacity duration-300"
        style={{
          left: `${leftPct}%`,
          top: 0,
          opacity: active ? 1 : 0.28,
        }}
      >
        <div
          className="absolute bottom-0 top-0 w-px -translate-x-1/2"
          style={{
            backgroundColor: markerColor,
            boxShadow: active ? `0 0 12px ${markerColor}` : 'none',
          }}
        />
        {/* handle */}
        <div
          className="absolute -translate-x-1/2 rounded-full ring-2 ring-ink-900"
          style={{
            top: railHeight / 2 - 7,
            height: 14,
            width: 14,
            backgroundColor: markerColor,
            boxShadow: active ? `0 0 0 4px ${spectrumColor(Math.min(markerAge, 17), 0.18)}` : 'none',
          }}
        />
      </div>

      {/* Readout chip — follows the marker, clamped within the plot */}
      <div
        className="absolute top-0 -translate-y-full pb-2 transition-[left] duration-150"
        style={{ left: `clamp(64px, ${leftPct}%, calc(100% - 64px))` }}
      >
        <div className="-translate-x-1/2">
          {active ? (
            <div
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-ink-800 px-3 py-1.5 font-mono text-xs shadow-lg ring-1 ring-white/10"
              style={{ color: markerColor }}
            >
              <span className="text-ash">At age</span>
              <span className="font-bold tnum" style={{ color: markerColor }}>
                {scrubLabel(markerAge)}
              </span>
              <span className="text-bone">·</span>
              <span className="font-bold tnum text-bone">{count}</span>
              <span className="text-ash">
                {markerAge >= SCRUB_MAX ? 'reach adulthood' : `of ${total} shows`}
              </span>
              <button
                onClick={() => setScrubAge(null)}
                aria-label="Clear age scrubber"
                className="pointer-events-auto ml-0.5 rounded-full px-1 text-ash hover:text-bone"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 whitespace-nowrap rounded-full bg-ink-800/80 px-3 py-1.5 font-mono text-xs text-ash shadow-lg ring-1 ring-white/10">
              <span aria-hidden="true">⇠⇢</span>
              Drag to explore by age
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
