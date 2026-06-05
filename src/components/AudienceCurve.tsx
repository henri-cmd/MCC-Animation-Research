import { OPEN_ENDED } from '../data/shows'
import { AGE_TICKS, ADULT_ZONE_START, ageToFrac } from '../lib/scale'
import { SPECTRUM_STOPS } from '../lib/spectrum'

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

/**
 * An illustrative audience-by-age shape for one show, modelled from its realistic
 * viewing range (ageFrom→ageTo): viewership rises from the lower bound to a core
 * peak, then falls toward the upper bound. Open-ended shows keep a long adult tail
 * (the crossover audience). This is a derived shape, NOT measured per-age data.
 */
function audiencePoints(ageFrom: number, ageTo: number) {
  const open = ageTo >= OPEN_ENDED
  const hi = open ? 18 : ageTo
  const lo = ageFrom
  const core = lo + Math.min(2.5, (hi - lo) * 0.18) // peak skews toward the target age
  const pts: { age: number; v: number }[] = []
  for (let a = 0; a <= 18; a += 0.5) {
    let v = 0
    if (a >= lo && a <= hi) {
      if (a <= core) {
        v = Math.pow(clamp01((a - lo) / Math.max(0.5, core - lo)), 1.5)
      } else {
        const t = clamp01((a - core) / Math.max(0.5, hi - core))
        const floor = open ? 0.28 : 0 // crossover shows keep an adult tail
        v = floor + (1 - floor) * Math.pow(1 - t, open ? 1.0 : 1.9)
      }
    }
    pts.push({ age: a, v })
  }
  return { pts, peak: pts.reduce((m, p) => (p.v > m.v ? p : m), pts[0]) }
}

const VB = 1000
const VH = 100

export function AudienceCurve({ ageFrom, ageTo }: { ageFrom: number; ageTo: number }) {
  const { pts, peak } = audiencePoints(ageFrom, ageTo)
  const x = (age: number) => ageToFrac(age) * VB
  const y = (v: number) => VH - v * (VH - 12)
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.age).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ')
  const area = `M0 ${VH} ${pts.map((p) => `L${x(p.age).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ')} L${VB} ${VH} Z`

  return (
    <div className="select-none">
      <div className="relative h-14 overflow-hidden rounded-md bg-ink-800 ring-1 ring-white/5">
        {/* adult-zone wash */}
        <div
          className="absolute inset-y-0 right-0 bg-gradient-to-r from-transparent to-spectrum-9/10"
          style={{ left: `${ADULT_ZONE_START * 100}%` }}
        />
        {/* tick guides */}
        {AGE_TICKS.map((t) => (
          <div
            key={t}
            className="absolute inset-y-0 w-px bg-white/[0.05]"
            style={{ left: `${ageToFrac(t) * 100}%` }}
          />
        ))}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${VB} ${VH}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="audience-spectrum" x1="0" y1="0" x2="1" y2="0">
              {SPECTRUM_STOPS.map((c, i) => (
                <stop key={i} offset={`${(i / (SPECTRUM_STOPS.length - 1)) * 100}%`} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
          <path d={area} fill="url(#audience-spectrum)" opacity={0.5} />
          <path
            d={line}
            fill="none"
            stroke="url(#audience-spectrum)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* peak marker */}
        <div
          className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone ring-2 ring-ink-800"
          style={{ left: `${ageToFrac(peak.age) * 100}%`, top: `${(y(peak.v) / VH) * 100}%` }}
        />
      </div>
      {/* axis labels */}
      <div className="relative mt-1 h-4 font-mono text-[10px] text-ash">
        {AGE_TICKS.map((t) => (
          <span
            key={t}
            className="absolute -translate-x-1/2 tabular-nums"
            style={{ left: `${ageToFrac(t) * 100}%` }}
          >
            {t}
          </span>
        ))}
        <span className="absolute right-0 text-spectrum-9/80">Adult</span>
      </div>
    </div>
  )
}
