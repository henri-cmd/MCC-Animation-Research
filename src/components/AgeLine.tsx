import { useMemo, useState } from 'react'
import { OPEN_ENDED, Show } from '../data/shows'
import { SortKey, sortShows } from '../lib/filter'
import { packRows } from '../lib/pack'
import {
  AGE_TICKS,
  ADULT_ZONE_START,
  ageRangeLabel,
  ageToFrac,
  barFill,
  spanCoversAge,
} from '../lib/scale'
import { SPECTRUM_STOPS, inkOn, spectrumColor } from '../lib/spectrum'
import { useElementWidth } from '../lib/hooks'
import { AxisScrubber } from './AxisScrubber'

const RAIL_H = 44 // axis header height / scrub rail
const DENSITY_H = 60 // audience-density chart band
const ROW_H = 30
const BAR_H = 22
const TOP_PAD = RAIL_H + DENSITY_H + 12
const BOTTOM_PAD = 14

/**
 * Audience-density curve: for each age, how many of the (filtered) shows are
 * watchable. The peak marks where the most content piles up. Aligned to the same
 * age axis as the bars.
 */
function DensityChart({
  shows,
  width,
  height,
  scrubAge,
}: {
  shows: Show[]
  width: number
  height: number
  scrubAge: number | null
}) {
  const { points, peak, max } = useMemo(() => {
    const pts: { age: number; c: number }[] = []
    for (let age = 0; age <= 18; age++) {
      let c = 0
      for (const s of shows) if (spanCoversAge(s.ageFrom, s.ageTo, age)) c++
      pts.push({ age, c })
    }
    const peak = pts.reduce((a, b) => (b.c > a.c ? b : a), pts[0])
    return { points: pts, peak, max: Math.max(1, ...pts.map((p) => p.c)) }
  }, [shows])

  if (width < 1) return null
  const pad = 12
  const x = (age: number) => ageToFrac(age) * width
  const y = (c: number) => height - 2 - (c / max) * (height - pad - 2)
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.age).toFixed(1)} ${y(p.c).toFixed(1)}`).join(' ')
  const area = `${line} L${x(18).toFixed(1)} ${height} L0 ${height} Z`
  const scrubPt = scrubAge != null ? points[Math.max(0, Math.min(18, scrubAge))] : null

  return (
    <>
      <svg width={width} height={height} className="block" aria-hidden="true">
        <defs>
          <linearGradient id="density-spectrum" x1="0" y1="0" x2="1" y2="0">
            {SPECTRUM_STOPS.map((c, i) => (
              <stop key={i} offset={`${(i / (SPECTRUM_STOPS.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        <path d={area} fill="url(#density-spectrum)" opacity={0.32} />
        <path d={line} fill="none" stroke="url(#density-spectrum)" strokeWidth={2} />
        <circle cx={x(peak.age)} cy={y(peak.c)} r={3.5} fill="#F3EDE3" />
        {scrubPt && (
          <circle cx={x(scrubPt.age)} cy={y(scrubPt.c)} r={3.5} fill="#F3EDE3" stroke="#14110F" strokeWidth={1.2} />
        )}
      </svg>
      <div
        className="pointer-events-none absolute -translate-x-1/2 font-mono text-[10px] font-bold tabular-nums text-bone"
        style={{ left: `clamp(20px, ${ageToFrac(peak.age) * 100}%, calc(100% - 20px))`, top: y(peak.c) - 15 }}
      >
        {peak.c}
      </div>
      <div className="pointer-events-none absolute left-0 top-0 font-mono text-[9px] uppercase tracking-[0.14em] text-ash/70">
        Shows watchable per age
      </div>
    </>
  )
}

// Rough px width a title needs to sit inside a bar (Archivo ~12px semibold).
const titleNeedsPx = (title: string) => title.length * 7 + 18

interface BarLayout {
  show: Show
  row: number
  leftPct: number
  widthPct: number
  barPx: number
  label: 'inside' | 'leader' | 'none'
  leaderMaxPx: number
}

interface Props {
  shows: Show[]
  sortKey: SortKey
  onSelect: (id: string) => void
}

export function AgeLine({ shows, sortKey, onSelect }: Props) {
  const [plotRef, width] = useElementWidth<HTMLDivElement>()
  const [scrubAge, setScrubAge] = useState<number | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)

  const { layout, rowCount } = useMemo(() => {
    const { placed, rowCount } = packRows(sortShows(shows, sortKey), 0.5)

    // For leader-label spacing, find each bar's right-neighbour in its row.
    const byRow = new Map<number, typeof placed>()
    for (const p of placed) {
      const arr = byRow.get(p.row) ?? []
      arr.push(p)
      byRow.set(p.row, arr)
    }
    for (const arr of byRow.values()) arr.sort((a, b) => a.item.ageFrom - b.item.ageFrom)

    const layout: BarLayout[] = placed.map(({ item, row }) => {
      const left = ageToFrac(item.ageFrom)
      const right = ageToFrac(item.ageTo) // ageToFrac maps 99 → 1
      const widthFrac = Math.max(right - left, 0.012)
      const barPx = widthFrac * width

      // available room to the right for a leader label
      const rowArr = byRow.get(row)!
      const idx = rowArr.findIndex((p) => p.item.id === item.id)
      const nextStart = idx >= 0 && idx < rowArr.length - 1 ? rowArr[idx + 1].item.ageFrom : 18
      const gapFrac = Math.max(0, ageToFrac(nextStart) - right)
      const leaderMaxPx = gapFrac * width - 8

      let label: BarLayout['label'] = 'none'
      if (width > 0) {
        if (barPx >= titleNeedsPx(item.title)) label = 'inside' // full title fits
        else if (item.ageTo < OPEN_ENDED && leaderMaxPx >= 40) label = 'leader'
        else if (barPx >= 38) label = 'inside' // truncated, still legible + tooltip on hover
        else label = 'none'
      }

      return {
        show: item,
        row,
        leftPct: left * 100,
        widthPct: widthFrac * 100,
        barPx,
        label,
        leaderMaxPx,
      }
    })

    return { layout, rowCount }
  }, [shows, sortKey, width])

  const plotHeight = TOP_PAD + rowCount * ROW_H + BOTTOM_PAD
  const scrubCount =
    scrubAge === null
      ? 0
      : shows.filter((s) => spanCoversAge(s.ageFrom, s.ageTo, scrubAge)).length

  const hovered = hoverId ? layout.find((b) => b.show.id === hoverId) : null

  return (
    <div className="relative">
      {/* Horizontal scroll on narrow screens. The pt-16 headroom keeps the scrubber
          readout + hover tooltips (which sit above the plot) from being clipped. */}
      <div className="-mx-4 overflow-x-auto overflow-y-hidden px-4 pb-2 pt-16 sm:mx-0 sm:px-0">
        <div
          ref={plotRef}
          className="relative min-w-[720px]"
          style={{ height: plotHeight }}
          aria-label="Age line: animated shows plotted across a continuous age axis"
        >
        {/* Adult zone wash (full height) */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 rounded-r-lg"
          style={{
            left: `${ADULT_ZONE_START * 100}%`,
            background:
              'linear-gradient(90deg, rgba(192,57,43,0.00), rgba(192,57,43,0.07) 60%, rgba(192,57,43,0.13))',
          }}
        />

        {/* Vertical guide lines at each tick */}
        {AGE_TICKS.map((t) => (
          <div
            key={t}
            className="pointer-events-none absolute w-px bg-white/[0.06]"
            style={{ left: `${ageToFrac(t) * 100}%`, top: RAIL_H - 8, bottom: 0 }}
          />
        ))}

        {/* Axis labels in the header strip */}
        <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: RAIL_H }}>
          {AGE_TICKS.map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 font-mono text-[11px] tabular-nums text-ash"
              style={{ left: `${ageToFrac(t) * 100}%`, top: 6 }}
            >
              {t}
            </span>
          ))}
          <span
            className="absolute right-0 top-1 font-display text-sm uppercase tracking-wider text-spectrum-9/80"
            style={{ transform: 'translateX(0)' }}
          >
            Adult
          </span>
          <div className="absolute inset-x-0 bg-white/10" style={{ top: RAIL_H - 8, height: 1 }} />
        </div>

        {/* Audience-density chart band */}
        <div className="pointer-events-none absolute inset-x-0" style={{ top: RAIL_H, height: DENSITY_H }}>
          <DensityChart shows={shows} width={width} height={DENSITY_H} scrubAge={scrubAge} />
        </div>

        {/* Bars */}
        {layout.map(({ show, row, leftPct, widthPct, label, leaderMaxPx }) => {
          const lit = scrubAge === null || spanCoversAge(show.ageFrom, show.ageTo, scrubAge)
          const top = TOP_PAD + row * ROW_H
          const colorAge = show.ageFrom
          const openEnded = show.ageTo >= OPEN_ENDED
          return (
            <div key={show.id}>
              <button
                type="button"
                onClick={() => onSelect(show.id)}
                onMouseEnter={() => setHoverId(show.id)}
                onMouseLeave={() => setHoverId((h) => (h === show.id ? null : h))}
                onFocus={() => setHoverId(show.id)}
                onBlur={() => setHoverId((h) => (h === show.id ? null : h))}
                aria-label={`${show.title}, ages ${ageRangeLabel(show.ageFrom, show.ageTo)}, ${show.bucket}`}
                className="group absolute flex items-center overflow-hidden rounded-full ring-1 ring-inset ring-white/10 transition-[transform,opacity,box-shadow] duration-300 will-change-transform animate-bar-in hover:z-30 hover:-translate-y-[2px] hover:ring-white/30 focus:z-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-bone"
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  top,
                  height: BAR_H,
                  backgroundImage: barFill(show.ageFrom, show.ageTo),
                  opacity: lit ? 1 : 0.16,
                  filter: lit ? undefined : 'saturate(0.5)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
                  animationDelay: `${(ageToFrac(show.ageFrom) * 0.45).toFixed(2)}s`,
                }}
              >
                {label === 'inside' && (
                  <span
                    className="truncate px-2.5 font-body text-[12px] font-semibold leading-none"
                    style={{ color: inkOn(colorAge) }}
                  >
                    {show.title}
                  </span>
                )}
                {openEnded && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-1.5 text-[10px] font-bold"
                    style={{ color: inkOn(16) }}
                  >
                    ›
                  </span>
                )}
              </button>

              {label === 'leader' && (
                <span
                  className="pointer-events-none absolute truncate pl-1.5 font-body text-[11px] text-bone/55"
                  style={{
                    left: `${leftPct + widthPct}%`,
                    top: top + BAR_H / 2,
                    transform: 'translateY(-50%)',
                    maxWidth: leaderMaxPx,
                    opacity: lit ? 1 : 0.25,
                  }}
                >
                  {show.title}
                </span>
              )}
            </div>
          )
        })}

        {/* Hover tooltip */}
        {hovered && (
          <div
            className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-full pb-2"
            style={{
              left: `clamp(96px, ${hovered.leftPct + hovered.widthPct / 2}%, calc(100% - 96px))`,
              top: TOP_PAD + hovered.row * ROW_H - 2,
            }}
          >
            <div className="w-56 rounded-lg bg-ink-800 p-2.5 shadow-xl ring-1 ring-white/10">
              <div className="relative mb-2 aspect-[16/9] w-full overflow-hidden rounded-md ring-1 ring-white/10">
                {hovered.show.images?.poster ? (
                  <img
                    src={hovered.show.images.poster}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundImage: barFill(hovered.show.ageFrom, hovered.show.ageTo) }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
                <span className="absolute left-1.5 top-1.5 rounded bg-ink-900/75 px-1 py-0.5 font-mono text-[8px] uppercase tracking-wide text-bone/90 ring-1 ring-white/10 backdrop-blur-sm">
                  {hovered.show.animationStyle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: spectrumColor(hovered.show.ageFrom) }}
                />
                <span className="font-body text-sm font-bold text-bone">{hovered.show.title}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-ash">
                <span className="tnum text-bone/80">
                  Ages {ageRangeLabel(hovered.show.ageFrom, hovered.show.ageTo)}
                </span>
                <span>·</span>
                <span>{hovered.show.epLabel}</span>
                <span>·</span>
                <span>{hovered.show.seasons ?? '—'} seasons</span>
              </div>
            </div>
          </div>
        )}

        {/* Scrubber overlay */}
        <AxisScrubber
          scrubAge={scrubAge}
          setScrubAge={setScrubAge}
          count={scrubCount}
          total={shows.length}
          railHeight={RAIL_H}
        />
        </div>
      </div>

      {shows.length === 0 && (
        <p className="py-16 text-center font-mono text-sm text-ash">
          No shows match these filters.
        </p>
      )}
    </div>
  )
}
