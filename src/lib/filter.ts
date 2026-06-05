// Pure search / filter / sort helpers shared by both views.

import { BUCKET_ORDER, OPEN_ENDED, STYLE_ORDER, Show } from '../data/shows'

export type SortKey = 'age' | 'seasons' | 'episodes' | 'length' | 'year' | 'reach' | 'az'

export type GroupBy = 'bucket' | 'style' | 'decade' | 'none'

export const GROUP_LABELS: Record<GroupBy, string> = {
  bucket: 'Bucket',
  style: 'Animation style',
  decade: 'Decade',
  none: 'None (A–Z)',
}

export const SORT_LABELS: Record<SortKey, string> = {
  age: 'Age (young → old)',
  seasons: 'Most seasons',
  episodes: 'Most episodes',
  length: 'Longest episodes',
  year: 'Newest first',
  reach: 'Widest age span',
  az: 'Title A → Z',
}

export interface Filters {
  query: string
  bucket: string | null
  theme: string | null
  style: string | null
  decade: number | null
  ongoingOnly: boolean
}

export const EMPTY_FILTERS: Filters = {
  query: '',
  bucket: null,
  theme: null,
  style: null,
  decade: null,
  ongoingOnly: false,
}

export const filtersActive = (f: Filters): boolean =>
  f.query.trim() !== '' ||
  f.bucket !== null ||
  f.theme !== null ||
  f.style !== null ||
  f.decade !== null ||
  f.ongoingOnly

export const decadeOf = (year: number) => Math.floor(year / 10) * 10

/** Parse loose count strings like "150+", "~60", "1,200+" into a number. */
export function numericCount(v: string | number | null): number {
  if (v == null) return 0
  if (typeof v === 'number') return v
  const m = v.replace(/,/g, '').match(/\d+/)
  return m ? parseInt(m[0], 10) : 0
}

/** Width of a show's age span (open-ended counts to 100) — used for "reach" sort. */
export const spanWidth = (s: Show) => (s.ageTo >= OPEN_ENDED ? 100 : s.ageTo) - s.ageFrom

export function uniqueThemes(shows: Show[]): string[] {
  const set = new Set<string>()
  for (const s of shows) for (const t of s.themes) set.add(t)
  return [...set].sort((a, b) => a.localeCompare(b))
}

export function uniqueStyles(shows: Show[]): string[] {
  const present = new Set(shows.map((s) => s.animationStyle))
  return STYLE_ORDER.filter((s) => present.has(s))
}

export function uniqueDecades(shows: Show[]): number[] {
  const set = new Set<number>()
  for (const s of shows) set.add(decadeOf(s.yearStart))
  return [...set].sort((a, b) => a - b)
}

export function applyFilters(shows: Show[], f: Filters): Show[] {
  const q = f.query.trim().toLowerCase()
  return shows.filter((s) => {
    if (q && !s.title.toLowerCase().includes(q)) return false
    if (f.bucket && s.bucket !== f.bucket) return false
    if (f.theme && !s.themes.includes(f.theme)) return false
    if (f.style && s.animationStyle !== f.style) return false
    if (f.decade !== null && decadeOf(s.yearStart) !== f.decade) return false
    if (f.ongoingOnly && s.yearEnd !== null) return false
    return true
  })
}

export function sortShows(shows: Show[], key: SortKey): Show[] {
  const arr = [...shows]
  switch (key) {
    case 'age':
      return arr.sort((a, b) => a.ageFrom - b.ageFrom || a.ageTo - b.ageTo)
    case 'seasons':
      return arr.sort((a, b) => numericCount(b.seasons) - numericCount(a.seasons) || a.title.localeCompare(b.title))
    case 'episodes':
      return arr.sort((a, b) => numericCount(b.episodes) - numericCount(a.episodes) || a.title.localeCompare(b.title))
    case 'length':
      return arr.sort((a, b) => b.epMinutes - a.epMinutes || a.title.localeCompare(b.title))
    case 'year':
      return arr.sort((a, b) => b.yearStart - a.yearStart || a.title.localeCompare(b.title))
    case 'reach':
      return arr.sort((a, b) => spanWidth(b) - spanWidth(a) || a.ageFrom - b.ageFrom)
    case 'az':
      return arr.sort((a, b) => a.title.localeCompare(b.title))
  }
}

export interface Group {
  key: string
  label: string
  shows: Show[]
}

/** Partition shows into ordered groups for the list view, each sorted by sortKey. */
export function buildGroups(shows: Show[], by: GroupBy, sortKey: SortKey): Group[] {
  if (by === 'none') {
    return shows.length ? [{ key: 'all', label: 'All shows', shows: sortShows(shows, sortKey) }] : []
  }

  const map = new Map<string, Show[]>()
  for (const s of shows) {
    const k =
      by === 'bucket' ? s.bucket : by === 'style' ? s.animationStyle : String(decadeOf(s.yearStart))
    ;(map.get(k) ?? map.set(k, []).get(k)!).push(s)
  }

  const order =
    by === 'bucket'
      ? [...BUCKET_ORDER]
      : by === 'style'
        ? [...STYLE_ORDER]
        : [...map.keys()].sort((a, b) => Number(a) - Number(b))

  const groups: Group[] = []
  for (const k of order) {
    const arr = map.get(k)
    if (arr?.length) groups.push({ key: k, label: by === 'decade' ? `${k}s` : k, shows: sortShows(arr, sortKey) })
  }
  // safety: any keys not in the predefined order
  for (const [k, arr] of map) {
    if (!order.includes(k)) groups.push({ key: k, label: k, shows: sortShows(arr, sortKey) })
  }
  return groups
}
