import { useMemo } from 'react'
import { Show } from '../data/shows'
import { GroupBy, SortKey, buildGroups } from '../lib/filter'
import { ageRangeLabel, barFill } from '../lib/scale'
import { inkOn, spectrumColor } from '../lib/spectrum'

/** Poster thumbnail: a real image when sourced, else an on-theme spectrum panel.
 *  Title + style badge + age chip overlay either way, so it's image-ready. */
function PosterThumb({ show }: { show: Show }) {
  const poster = show.images?.poster
  const years = `${show.yearStart}–${show.yearEnd ?? 'present'}`
  return (
    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
      {poster ? (
        <img
          src={poster}
          alt={`${show.title} key art`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className="absolute inset-0 transition duration-300 group-hover:scale-[1.03]"
          style={{ backgroundImage: barFill(show.ageFrom, show.ageTo) }}
        />
      )}
      {/* scrim so the title reads on image or gradient alike */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/35 to-transparent" />
      <span className="absolute left-2 top-2 rounded bg-ink-900/75 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-bone/90 ring-1 ring-white/10 backdrop-blur-sm">
        {show.animationStyle}
      </span>
      <span
        className="absolute right-2 top-2 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tnum ring-1 ring-white/15 backdrop-blur-sm"
        style={{ backgroundColor: spectrumColor(show.ageFrom, 0.85), color: inkOn(show.ageFrom) }}
      >
        {ageRangeLabel(show.ageFrom, show.ageTo)}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-2.5">
        <h3
          className="font-display text-lg uppercase leading-[0.95] tracking-wide text-bone line-clamp-2"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}
        >
          {show.title}
        </h3>
        <div className="mt-0.5 font-mono text-[10px] text-bone/70 tnum">{years}</div>
      </div>
    </div>
  )
}

function ShowCard({ show, onSelect }: { show: Show; onSelect: (id: string) => void }) {
  const hasFigure = show.viewership.disclosed !== false && !!show.viewership.figure
  return (
    <button
      type="button"
      onClick={() => onSelect(show.id)}
      aria-label={`${show.title}, ages ${ageRangeLabel(show.ageFrom, show.ageTo)}, ${show.animationStyle}, ${show.bucket}`}
      className="group flex h-full flex-col gap-3 rounded-xl bg-ink-800/70 p-3 text-left ring-1 ring-white/[0.07] transition duration-200 hover:-translate-y-0.5 hover:bg-ink-700/70 hover:ring-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-bone"
    >
      <PosterThumb show={show} />

      <div className="flex flex-1 flex-col px-1">
        {/* The complaint fix: age range + episode duration, front and centre. */}
        <div className="flex flex-wrap items-baseline gap-x-2 font-mono text-xs">
          <span className="font-bold tnum" style={{ color: spectrumColor(show.ageFrom) }}>
            Ages {ageRangeLabel(show.ageFrom, show.ageTo)}
          </span>
          <span className="text-ash">·</span>
          <span className="text-bone/85">{show.epLabel}</span>
        </div>
        <div className="mt-1 font-mono text-[11px] text-ash tnum">
          {show.seasons ?? '—'} {show.seasons === 1 ? 'season' : 'seasons'} · {show.episodes} eps · {show.origin}
        </div>

        <p className="mt-2.5 line-clamp-2 font-body text-[12.5px] leading-snug text-bone/65">
          {show.synopsis}
        </p>

        <div className="mt-auto border-t border-white/5 pt-2.5">
          <div className="flex flex-wrap gap-1">
            {show.themes.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/5 px-2 py-0.5 font-body text-[10.5px] text-bone/70 ring-1 ring-white/10"
              >
                {t}
              </span>
            ))}
          </div>
          {hasFigure ? (
            <div
              className="mt-1.5 truncate font-mono text-[10.5px] text-spectrum-3"
              title={show.viewership.context ?? undefined}
            >
              ◍ {show.viewership.figure}
            </div>
          ) : show.reach ? (
            <div className="mt-1.5 truncate font-mono text-[10.5px] text-ash" title={show.reach}>
              ↔ {show.reach}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  )
}

const avgAgeFrom = (shows: Show[]) =>
  shows.reduce((a, s) => a + s.ageFrom, 0) / Math.max(shows.length, 1)

interface Props {
  shows: Show[]
  groupBy: GroupBy
  sortKey: SortKey
  onSelect: (id: string) => void
}

export function ListView({ shows, groupBy, sortKey, onSelect }: Props) {
  const groups = useMemo(() => buildGroups(shows, groupBy, sortKey), [shows, groupBy, sortKey])

  if (!shows.length) {
    return (
      <p className="py-16 text-center font-mono text-sm text-ash">No shows match these filters.</p>
    )
  }

  return (
    <div className="space-y-9 pt-2">
      {groups.map((g) => {
        const color = spectrumColor(avgAgeFrom(g.shows))
        const showHeader = groupBy !== 'none'
        return (
          <section key={g.key} aria-label={g.label}>
            {showHeader && (
              <div className="mb-4 flex items-center gap-3">
                <span className="h-3 w-8 rounded-full" style={{ backgroundColor: color }} />
                <h2 className="font-display text-2xl uppercase tracking-wide text-bone">{g.label}</h2>
                <span className="font-mono text-xs text-ash tnum">
                  {g.shows.length} {g.shows.length === 1 ? 'show' : 'shows'}
                </span>
                <span
                  className="h-px flex-1"
                  style={{ background: `linear-gradient(90deg, ${color}40, transparent)` }}
                />
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {g.shows.map((show) => (
                <ShowCard key={show.id} show={show} onSelect={onSelect} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
