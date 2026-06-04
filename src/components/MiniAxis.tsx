import { OPEN_ENDED } from '../data/shows'
import { AGE_TICKS, ADULT_ZONE_START, ageToFrac, barFill } from '../lib/scale'

/** A compact, non-interactive age axis with one show's range drawn on it. */
export function MiniAxis({ ageFrom, ageTo }: { ageFrom: number; ageTo: number }) {
  const left = ageToFrac(ageFrom) * 100
  const right = ageToFrac(ageTo) * 100
  const openEnded = ageTo >= OPEN_ENDED

  return (
    <div className="select-none">
      <div className="relative h-9 rounded-md bg-ink-800 ring-1 ring-white/5 overflow-hidden">
        {/* adult zone wash */}
        <div
          className="absolute inset-y-0 right-0 bg-gradient-to-r from-transparent to-spectrum-9/10"
          style={{ left: `${ADULT_ZONE_START * 100}%` }}
        />
        {/* baseline */}
        <div className="absolute inset-x-2 bottom-2 h-px bg-white/10" />
        {/* ticks */}
        {AGE_TICKS.map((t) => (
          <div
            key={t}
            className="absolute bottom-2 h-1.5 w-px bg-white/20"
            style={{ left: `${ageToFrac(t) * 100}%` }}
          />
        ))}
        {/* the show's range bar */}
        <div
          className="absolute top-1.5 h-4 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
          style={{
            left: `${left}%`,
            width: `${Math.max(right - left, 1.5)}%`,
            backgroundImage: barFill(ageFrom, ageTo),
            maskImage: openEnded
              ? 'linear-gradient(90deg, #000 80%, rgba(0,0,0,0.35) 100%)'
              : undefined,
            WebkitMaskImage: openEnded
              ? 'linear-gradient(90deg, #000 80%, rgba(0,0,0,0.35) 100%)'
              : undefined,
          }}
        />
      </div>
      {/* labels */}
      <div className="relative mt-1 h-4 font-mono text-[10px] text-ash">
        {AGE_TICKS.map((t) => (
          <span
            key={t}
            className="absolute -translate-x-1/2 tnum"
            style={{ left: `${ageToFrac(t) * 100}%` }}
          >
            {t}
          </span>
        ))}
        <span className="absolute right-0 translate-x-0 text-spectrum-9/80">Adult</span>
      </div>
    </div>
  )
}
