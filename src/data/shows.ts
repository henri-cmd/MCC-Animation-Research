// Typed loader + Show interface for the bundled seed dataset.
// Source of truth: /public/data/shows.json (renamed from shows.seed.json).

export interface Viewership {
  /** e.g. "8.2M premiere viewers" — null until researched/sourced. */
  figure: string | null
  /** what the figure measures. */
  context: string | null
  /** citation; required if figure is set. */
  sourceUrl: string | null
  /** false = streaming original, never numbered. "unknown" = research or mark undisclosed. */
  disclosed: boolean | 'unknown'
  /** guidance embedded in the seed. */
  note: string
}

export interface Show {
  /** slug, used in ?show= deep links. */
  id: string
  title: string
  /** realistic lower viewing age, in years. */
  ageFrom: number
  /** realistic upper viewing age; 99 = extends into adulthood / open-ended. */
  ageTo: number
  /** one of the nine category bands. */
  bucket: string
  /** typical story length in minutes, for sizing/sorting. */
  epMinutes: number
  /** display string, e.g. "~11 min (22-min slot)". */
  epLabel: string
  seasons: string | number | null
  episodes: string | number
  yearStart: number
  /** null = ongoing. */
  yearEnd: number | null
  /** "Network / Studio · Country". */
  origin: string
  themes: string[]
  synopsis: string
  /** crossover note, may be null. */
  reach: string | null
  /** predominant production technique — one of STYLE_ORDER. */
  animationStyle: string
  links: { wikipedia: string; fandom: string | null; imdb: string | null }
  /** optional artwork (poster thumbnail + gallery). Absent until sourced. */
  images?: { poster?: string | null; gallery?: string[] }
  viewership: Viewership
  /** flipped true once counts are confirmed. */
  verified: boolean
}

export interface ShowsMeta {
  title: string
  description: string
  ageConvention: string
  dataStatus: string
  count: number
}

export interface ShowsFile {
  _meta: ShowsMeta
  shows: Show[]
}

/** Sentinel: ageTo === 99 means "extends into adulthood / open-ended reach". */
export const OPEN_ENDED = 99

/** The nine category bands, ordered young → old. */
export const BUCKET_ORDER = [
  'Toddler',
  'Preschool',
  'Young Kids',
  'Older Kids',
  'Kids → Teens',
  'Tweens → Teens',
  'Teens',
  'Older Teens → Adults',
  'Adults',
] as const

export type Bucket = (typeof BUCKET_ORDER)[number]

/** Animation techniques, ordered for the "group by style" list view. */
export const STYLE_ORDER = ['2D', 'Anime', '3D / CGI', 'Stop-motion', 'Cutout', 'Puppetry'] as const

/** Representative age used for bucket ordering / spectrum sampling of a band. */
export const BUCKET_AGE: Record<string, number> = {
  Toddler: 1,
  Preschool: 3,
  'Young Kids': 5,
  'Older Kids': 7,
  'Kids → Teens': 9,
  'Tweens → Teens': 11,
  Teens: 13,
  'Older Teens → Adults': 15,
  Adults: 17,
}

/** Fetch + lightly validate the dataset. Kept async so the JSON stays a static asset. */
export async function loadShows(): Promise<ShowsFile> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/shows.json`)
  if (!res.ok) throw new Error(`Failed to load shows data (${res.status})`)
  const data = (await res.json()) as ShowsFile
  if (!data?.shows?.length) throw new Error('Shows dataset is empty or malformed')
  return data
}
