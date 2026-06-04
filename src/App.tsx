import { useEffect, useMemo, useState } from 'react'
import { BUCKET_ORDER, ShowsFile, loadShows } from './data/shows'
import {
  EMPTY_FILTERS,
  Filters,
  GroupBy,
  SortKey,
  applyFilters,
  uniqueDecades,
  uniqueStyles,
  uniqueThemes,
} from './lib/filter'
import { SPECTRUM_STOPS } from './lib/spectrum'
import { useQueryParam } from './lib/hooks'
import { Controls } from './components/Controls'
import { AgeLine } from './components/AgeLine'
import { ListView } from './components/ListView'
import { ShowDetail } from './components/ShowDetail'

type View = 'age' | 'list'

function SpectrumLegend() {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Younger</span>
      <div
        className="h-2 w-40 rounded-full ring-1 ring-white/10 sm:w-56"
        style={{ backgroundImage: `linear-gradient(90deg, ${SPECTRUM_STOPS.join(', ')})` }}
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Older</span>
    </div>
  )
}

export default function App() {
  const [data, setData] = useState<ShowsFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('age')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sortKey, setSortKey] = useState<SortKey>('age')
  const [groupBy, setGroupBy] = useState<GroupBy>('bucket')
  const [selectedId, setSelectedId] = useQueryParam('show')

  useEffect(() => {
    loadShows()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  const shows = useMemo(() => data?.shows ?? [], [data])
  const filtered = useMemo(() => applyFilters(shows, filters), [shows, filters])
  const themes = useMemo(() => uniqueThemes(shows), [shows])
  const styles = useMemo(() => uniqueStyles(shows), [shows])
  const decades = useMemo(() => uniqueDecades(shows), [shows])
  const buckets = useMemo(() => BUCKET_ORDER.filter((b) => shows.some((s) => s.bucket === b)), [shows])
  const hasImages = useMemo(() => shows.some((s) => s.images?.poster), [shows])
  const selectedShow = useMemo(
    () => shows.find((s) => s.id === selectedId) ?? null,
    [shows, selectedId],
  )

  return (
    <div className="min-h-full">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-bone focus:px-3 focus:py-2 focus:font-body focus:text-sm focus:font-semibold focus:text-ink-900"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="mx-auto max-w-7xl px-4 pb-4 pt-10 sm:px-6 sm:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="max-w-2xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ash">
              Interactive · {data?._meta.count ?? (shows.length || 48)} animated series
            </div>
            <h1 className="mt-2 font-display text-5xl uppercase leading-[0.88] tracking-tight text-bone sm:text-7xl">
              The Animation
              <br />
              <span className="bg-gradient-to-r from-spectrum-1 via-spectrum-6 to-spectrum-9 bg-clip-text text-transparent">
                Spectrum
              </span>
            </h1>
            <p className="mt-4 max-w-xl font-body text-[15px] leading-relaxed text-bone/70 text-balance">
              Animated TV mapped by the audience that <em className="not-italic text-bone">actually</em>{' '}
              watches it. Not one age bucket per show — a range across a continuous age line, so
              crossover hits like <em className="not-italic text-spectrum-1">Bluey</em>,{' '}
              <em className="not-italic text-spectrum-3">Avatar</em> and{' '}
              <em className="not-italic text-spectrum-7">Adventure Time</em> stretch the whole way.
            </p>
          </div>
          <SpectrumLegend />
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        {error ? (
          <div className="rounded-lg border border-spectrum-9/40 bg-spectrum-9/10 p-6 font-mono text-sm text-bone">
            Couldn’t load the dataset: {error}
          </div>
        ) : !data ? (
          <div className="flex items-center gap-3 py-24 font-mono text-sm text-ash">
            <span className="h-3 w-3 animate-pulse rounded-full bg-spectrum-1" />
            Loading the spectrum…
          </div>
        ) : (
          <>
            <Controls
              view={view}
              setView={setView}
              filters={filters}
              setFilters={setFilters}
              sortKey={sortKey}
              setSortKey={setSortKey}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
              buckets={buckets}
              themes={themes}
              styles={styles}
              decades={decades}
              resultCount={filtered.length}
              totalCount={shows.length}
            />

            {view === 'age' ? (
              <AgeLine shows={filtered} onSelect={setSelectedId} />
            ) : (
              <ListView shows={filtered} groupBy={groupBy} sortKey={sortKey} onSelect={setSelectedId} />
            )}
          </>
        )}
      </main>

      {/* Footer — About the data */}
      <footer className="border-t border-white/10 bg-ink-900/60">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ash">About the data</h2>
          <div className="mt-3 grid gap-x-10 gap-y-4 font-body text-[13px] leading-relaxed text-bone/65 md:grid-cols-2">
            <p>
              Ages are realistic <em className="not-italic text-bone/85">viewing</em> ranges, not
              content ratings. The right-hand <span className="text-spectrum-9">Adult</span> end marks
              open-ended / all-ages reach (a show that keeps an adult audience), not a hard cut-off.
              Drag the scrubber on the age line to see what a single age can actually watch.
            </p>
            <p>
              <span className="text-bone/85">No revenue or profit figures</span> are included by
              design — they’re often unreliable or tied to spin-off films rather than the show.{' '}
              <span className="text-bone/85">Viewership is shown only where a documented figure is
              sourced</span>; otherwise it reads “Not publicly disclosed,” and streaming originals are
              never numbered. Counts not yet confirmed are best-effort estimates.
            </p>
          </div>
          <p className="mt-6 font-mono text-[11px] text-ash/70">
            The Animation Spectrum · data: seed dataset of {shows.length || 48} series · built as a
            static site.
          </p>
          {hasImages && (
            <p className="mt-1.5 font-mono text-[11px] text-ash/60">
              Show artwork via{' '}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:text-bone hover:underline"
              >
                TMDB
              </a>
              . This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          )}
        </div>
      </footer>

      <ShowDetail show={selectedShow} onClose={() => setSelectedId(null)} />
    </div>
  )
}
