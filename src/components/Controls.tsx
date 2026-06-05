import { EMPTY_FILTERS, Filters, GROUP_LABELS, GroupBy, SORT_LABELS, SortKey, filtersActive } from '../lib/filter'

type View = 'age' | 'list'

interface Props {
  view: View
  setView: (v: View) => void
  filters: Filters
  setFilters: (f: Filters) => void
  sortKey: SortKey
  setSortKey: (k: SortKey) => void
  groupBy: GroupBy
  setGroupBy: (g: GroupBy) => void
  buckets: readonly string[]
  themes: string[]
  styles: string[]
  decades: number[]
  resultCount: number
  totalCount: number
}

const selectCls =
  'h-9 cursor-pointer rounded-md border-0 bg-ink-800 pl-3 pr-8 font-mono text-xs text-bone ring-1 ring-white/10 transition hover:ring-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-spectrum-4 appearance-none bg-[length:14px] bg-[right_0.5rem_center] bg-no-repeat'

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23A89F94' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")"

export function Controls({
  view,
  setView,
  filters,
  setFilters,
  sortKey,
  setSortKey,
  groupBy,
  setGroupBy,
  buckets,
  themes,
  styles,
  decades,
  resultCount,
  totalCount,
}: Props) {
  const active = filtersActive(filters)
  const patch = (p: Partial<Filters>) => setFilters({ ...filters, ...p })

  return (
    <div className="sticky top-0 z-30 -mx-4 mb-2 border-b border-white/10 bg-ink-900/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        {/* Row 1: search + view toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[180px] flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ash"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={filters.query}
              onChange={(e) => patch({ query: e.target.value })}
              placeholder="Search shows…"
              aria-label="Search shows by title"
              className="h-9 w-full rounded-md bg-ink-800 pl-9 pr-3 font-body text-sm text-bone placeholder:text-ash ring-1 ring-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-spectrum-4"
            />
          </div>

          <div className="flex shrink-0 rounded-md bg-ink-800 p-0.5 ring-1 ring-white/10" role="tablist" aria-label="View">
            {(
              [
                ['age', 'Age Line'],
                ['list', 'List'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={view === key}
                onClick={() => setView(key)}
                className={`rounded px-3 py-1.5 font-body text-xs font-semibold transition ${
                  view === key ? 'bg-bone text-ink-900 shadow' : 'text-ash hover:text-bone'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: filters + (list-mode) group/sort */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className={selectCls}
            style={{ backgroundImage: chevron }}
            value={filters.bucket ?? ''}
            onChange={(e) => patch({ bucket: e.target.value || null })}
            aria-label="Filter by category band"
          >
            <option value="">All buckets</option>
            {buckets.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            className={selectCls}
            style={{ backgroundImage: chevron }}
            value={filters.style ?? ''}
            onChange={(e) => patch({ style: e.target.value || null })}
            aria-label="Filter by animation style"
          >
            <option value="">All styles</option>
            {styles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className={selectCls}
            style={{ backgroundImage: chevron }}
            value={filters.theme ?? ''}
            onChange={(e) => patch({ theme: e.target.value || null })}
            aria-label="Filter by theme"
          >
            <option value="">All themes</option>
            {themes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            className={selectCls}
            style={{ backgroundImage: chevron }}
            value={filters.decade ?? ''}
            onChange={(e) => patch({ decade: e.target.value ? Number(e.target.value) : null })}
            aria-label="Filter by decade of first airing"
          >
            <option value="">All decades</option>
            {decades.map((d) => (
              <option key={d} value={d}>
                {d}s
              </option>
            ))}
          </select>

          <button
            onClick={() => patch({ ongoingOnly: !filters.ongoingOnly })}
            aria-pressed={filters.ongoingOnly}
            className={`h-9 rounded-md px-3 font-mono text-xs ring-1 transition ${
              filters.ongoingOnly
                ? 'bg-spectrum-3/20 text-spectrum-3 ring-spectrum-3/40'
                : 'bg-ink-800 text-ash ring-white/10 hover:ring-white/25'
            }`}
          >
            ● Ongoing
          </button>

          <div className="ml-auto flex items-center gap-2">
            {view === 'list' && (
              <label className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-ash">Group</span>
                <select
                  className={selectCls}
                  style={{ backgroundImage: chevron }}
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                  aria-label="Group shows by"
                >
                  {(Object.keys(GROUP_LABELS) as GroupBy[]).map((g) => (
                    <option key={g} value={g}>
                      {GROUP_LABELS[g]}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-ash">{view === 'age' ? 'Stack' : 'Sort'}</span>
              <select
                className={selectCls}
                style={{ backgroundImage: chevron }}
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                aria-label={view === 'age' ? 'Stack the age line by' : 'Sort the list by'}
                title={view === 'age' ? 'Sets the top-to-bottom order of the bars' : undefined}
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-ash">
            <span className="tnum">
              {resultCount}
              <span className="text-ash/50">/{totalCount}</span>
            </span>
            {active && (
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="rounded px-2 py-1 text-ash underline-offset-2 ring-1 ring-white/10 transition hover:text-bone hover:ring-white/25"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
