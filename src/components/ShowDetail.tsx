import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Show } from '../data/shows'
import { numericCount } from '../lib/filter'
import { useEpisodes } from '../lib/hooks'
import { spectrumColor } from '../lib/spectrum'
import { ageRangeLabel, barFill } from '../lib/scale'
import { MiniAxis } from './MiniAxis'

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A89F94' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")"

/** Image-ready hero: a real poster + gallery strip when sourced, else an on-theme
 *  spectrum panel. The gallery slot lights up automatically once images.gallery is set. */
function DetailHero({ show }: { show: Show }) {
  const poster = show.images?.poster
  const gallery = show.images?.gallery ?? []
  return (
    <div className="space-y-2">
      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg ring-1 ring-white/10">
        {poster ? (
          <img src={poster} alt={`${show.title} key art`} className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ backgroundImage: barFill(show.ageFrom, show.ageTo) }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
        <span className="absolute left-2 top-2 rounded bg-ink-900/75 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-bone/90 ring-1 ring-white/10 backdrop-blur-sm">
          {show.animationStyle}
        </span>
      </div>
      {gallery.length > 0 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {gallery.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${show.title} still ${i + 1}`}
              loading="lazy"
              className="h-16 w-28 shrink-0 rounded object-cover ring-1 ring-white/10"
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">{label}</div>
      <div className="mt-0.5 truncate font-body text-sm font-semibold text-bone">{value}</div>
    </div>
  )
}

function Viewership({ show }: { show: Show }) {
  const v = show.viewership
  const streaming = v.disclosed === false
  const hasFigure = !streaming && !!v.figure

  return (
    <section aria-label="Viewership" className="rounded-lg bg-ink-800 p-4 ring-1 ring-white/5">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Viewership</div>
      {hasFigure ? (
        <>
          <div className="mt-1.5 font-display text-2xl leading-none text-bone tnum">{v.figure}</div>
          {v.context && <p className="mt-2 text-sm text-bone/70">{v.context}</p>}
          {v.sourceUrl && (
            <a
              href={v.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-spectrum-4 underline-offset-2 hover:underline"
            >
              Source ↗
            </a>
          )}
        </>
      ) : (
        <>
          <div className="mt-1.5 font-body text-lg font-semibold text-bone/85">Not publicly disclosed</div>
          <p className="mt-1.5 text-xs leading-relaxed text-ash">
            {streaming
              ? 'Streaming original — the platform does not release per-title viewership figures.'
              : 'No documented premiere/peak rating or audience milestone is sourced for this show.'}
          </p>
        </>
      )}
    </section>
  )
}

export function ShowDetail({ show, onClose }: { show: Show | null; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!show) return
    const prevFocus = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus?.()
    }
  }, [show, onClose])

  const [selectedSeason, setSelectedSeason] = useState(1)
  const { seasons: epData, loading: epLoading } = useEpisodes(show?.id ?? '')
  useEffect(() => {
    setSelectedSeason(1)
  }, [show?.id])

  if (!show) return null

  const accent = spectrumColor(show.ageFrom)
  const years = `${show.yearStart}–${show.yearEnd ?? 'present'}`
  const tt = show.links.imdb?.match(/tt\d+/)?.[0] ?? null
  const seasonCount = numericCount(show.seasons)
  const seasonOptions =
    epData && epData.length
      ? epData.map((s) => s.s)
      : seasonCount > 0
        ? Array.from({ length: Math.min(seasonCount, 60) }, (_, i) => i + 1)
        : []
  const curEps = epData?.find((s) => s.s === selectedSeason)?.eps ?? null

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <button
        aria-label="Close detail"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default bg-black/65 backdrop-blur-sm"
      />
      {/* drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md animate-drawer-in flex-col bg-ink-900 shadow-2xl ring-1 ring-white/10 sm:border-l sm:border-white/10"
      >
        {/* accent rail */}
        <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundImage: `linear-gradient(180deg, ${accent}, ${spectrumColor(Math.min(show.ageTo, 17))})` }} />

        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ash">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: accent }}
              />
              {show.bucket} · {show.animationStyle}
            </div>
            <h2
              id="detail-title"
              className="mt-1 font-display text-3xl uppercase leading-[0.95] tracking-wide text-bone text-balance"
            >
              {show.title}
            </h2>
            <div className="mt-1 font-mono text-xs text-ash">
              {show.origin} · {years}
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-2 text-ash ring-1 ring-white/10 transition hover:bg-white/5 hover:text-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-spectrum-4"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5 flex-1 space-y-5 overflow-y-auto px-6 pb-8">
          <DetailHero show={show} />

          {/* age range */}
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                Viewing age
              </span>
              <span className="font-mono text-sm text-bone tnum">
                {ageRangeLabel(show.ageFrom, show.ageTo)}
                {show.ageTo >= 99 && <span className="text-ash"> · into adulthood</span>}
              </span>
            </div>
            <MiniAxis ageFrom={show.ageFrom} ageTo={show.ageTo} />
            {show.ageBasis && (
              <p className="mt-2 text-[11px] leading-relaxed text-ash">
                <span className="text-bone/70">Who’s really watching:</span> {show.ageBasis}
              </p>
            )}
          </section>

          {/* stat row */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-ink-800/60 p-4 ring-1 ring-white/5">
            <Stat label="Seasons" value={show.seasons ?? '—'} />
            <Stat label="Episodes" value={show.episodes} />
            <Stat label="Episode length" value={show.epLabel} />
            <Stat label="Bucket" value={show.bucket} />
          </div>

          {/* episodes by season — pick a season to list its episodes */}
          {tt && seasonOptions.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Episodes</span>
                {seasonOptions.length > 1 && (
                  <label className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-ash">Season</span>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      aria-label="Select a season"
                      className="h-7 cursor-pointer appearance-none rounded-md border-0 bg-ink-800 bg-[length:12px] bg-[right_0.35rem_center] bg-no-repeat pl-2 pr-6 font-mono text-xs tabular-nums text-bone ring-1 ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-spectrum-4"
                      style={{ backgroundImage: chevron }}
                    >
                      {seasonOptions.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div className="rounded-lg bg-ink-800/60 ring-1 ring-white/5">
                <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                  <span className="font-mono text-[11px] tabular-nums text-bone/80">
                    Season {selectedSeason}
                    {curEps && <span className="text-ash"> · {curEps.length} eps</span>}
                  </span>
                  <a
                    href={`https://www.imdb.com/title/${tt}/episodes/?season=${selectedSeason}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-spectrum-4 underline-offset-2 hover:underline"
                  >
                    Open on IMDb ↗
                  </a>
                </div>
                {epLoading ? (
                  <p className="px-3 py-3 font-mono text-[11px] text-ash">Loading episodes…</p>
                ) : curEps && curEps.length ? (
                  <ul className="max-h-60 divide-y divide-white/5 overflow-y-auto">
                    {curEps.map((ep) => (
                      <li key={ep.e} className="flex items-baseline gap-2.5 px-3 py-1.5">
                        <span className="w-7 shrink-0 font-mono text-[11px] tabular-nums text-ash">E{ep.e}</span>
                        <span className="flex-1 truncate font-body text-[13px] text-bone/85">{ep.t}</span>
                        {ep.d && (
                          <span className="shrink-0 font-mono text-[10px] tabular-nums text-ash/60">{ep.d.slice(0, 4)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-3 font-mono text-[11px] text-ash">
                    Episode list unavailable — open this season on IMDb.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* synopsis */}
          <p className="text-[15px] leading-relaxed text-bone/85">{show.synopsis}</p>

          {/* reach note */}
          {show.reach && (
            <div
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
              style={{ backgroundColor: spectrumColor(show.ageFrom, 0.12), color: spectrumColor(Math.max(show.ageFrom, 4)) }}
            >
              <span aria-hidden="true">↔</span> {show.reach}
            </div>
          )}

          {/* themes */}
          <section>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Themes</div>
            <div className="flex flex-wrap gap-1.5">
              {show.themes.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/5 px-2.5 py-1 font-body text-xs text-bone/80 ring-1 ring-white/10"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>

          {/* viewership */}
          <Viewership show={show} />

          {/* outbound links — IMDb first, then Wikipedia (+ Fandom) */}
          <div className="flex flex-wrap gap-2 pt-1">
            {show.links.imdb && (
              <a
                href={show.links.imdb}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-[#F5C518] px-3.5 py-2 font-body text-sm font-bold text-ink-900 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518] focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
              >
                <span className="rounded-sm bg-ink-900 px-1 text-[10px] font-black tracking-tight text-[#F5C518]">
                  IMDb
                </span>
                View on IMDb ↗
              </a>
            )}
            <a
              href={show.links.wikipedia}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md px-3.5 py-2 font-body text-sm font-semibold text-bone ring-1 ring-white/15 transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-spectrum-4"
            >
              Wikipedia ↗
            </a>
            {show.links.fandom && (
              <a
                href={show.links.fandom}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md px-3.5 py-2 font-body text-sm font-semibold text-bone ring-1 ring-white/15 transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-spectrum-4"
              >
                Fandom ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
