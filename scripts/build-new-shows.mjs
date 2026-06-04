// Assemble the new shows: pull facts + images from TMDB (by IMDb id) and merge
// with the editorial.json judgment fields → full Show records → append to shows.json.
//   TMDB_API_KEY=<key> node scripts/build-new-shows.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const KEY = process.env.TMDB_API_KEY
if (!KEY) {
  console.error('Set TMDB_API_KEY (v3 key).')
  process.exit(1)
}

const ROOT = new URL('../', import.meta.url)
const showsFile = new URL('public/data/shows.json', ROOT)
const data = JSON.parse(readFileSync(showsFile, 'utf8'))
const EDITORIAL = process.env.EDITORIAL || 'scripts/editorial.json'
const editorial = JSON.parse(readFileSync(new URL(EDITORIAL, ROOT), 'utf8'))

const IMG = 'https://image.tmdb.org/t/p'
const tmdb = async (path) => {
  const url = `https://api.themoviedb.org/3${path}${path.includes('?') ? '&' : '?'}api_key=${KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB ${path} → ${res.status}`)
  return res.json()
}

const COUNTRY = { US: 'US', JP: 'Japan', GB: 'UK', FR: 'France', KR: 'South Korea', CA: 'Canada', AU: 'Australia', IE: 'Ireland', ES: 'Spain', DE: 'Germany' }
const BUCKETS = ['Toddler', 'Preschool', 'Young Kids', 'Older Kids', 'Kids → Teens', 'Tweens → Teens', 'Teens', 'Older Teens → Adults', 'Adults']
const bucketFor = (a) =>
  a <= 1 ? 'Toddler' : a <= 3 ? 'Preschool' : a <= 5 ? 'Young Kids' : a <= 7 ? 'Older Kids' : a <= 9 ? 'Kids → Teens' : a <= 11 ? 'Tweens → Teens' : a <= 13 ? 'Teens' : a <= 15 ? 'Older Teens → Adults' : 'Adults'

const existingIds = new Set(data.shows.map((s) => s.id))
const slug = (t) => {
  const base = t.toLowerCase().replace(/×/g, 'x').normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
  let id = base
  let n = 2
  while (existingIds.has(id)) id = `${base}-${n++}`
  existingIds.add(id)
  return id
}

const newShows = []
const failed = []
for (const e of editorial) {
  const tt = e.imdbId
  try {
    const found = await tmdb(`/find/${tt}?external_source=imdb_id`)
    const tv = found.tv_results?.[0]
    if (!tv) {
      failed.push(tt)
      process.stdout.write('x')
      continue
    }
    const d = await tmdb(`/tv/${tv.id}?language=en-US`)
    let backs = []
    try {
      const im = await tmdb(`/tv/${tv.id}/images?include_image_language=en,null`)
      backs = (im.backdrops || []).map((b) => b.file_path)
    } catch {
      /* gallery optional */
    }
    const primary = d.backdrop_path || tv.backdrop_path || backs[0] || d.poster_path || tv.poster_path
    const gallery = [primary, ...backs.filter((p) => p && p !== primary)].filter(Boolean).slice(0, 6)

    const ageTo = e.ageTo >= 18 ? 99 : e.ageTo
    const bucket = BUCKETS.includes(e.bucket) ? e.bucket : bucketFor(e.ageFrom)
    const epMin = (d.episode_run_time && d.episode_run_time[0]) || (e.animationStyle === 'Anime' ? 24 : 22)
    const yearStart = d.first_air_date ? +d.first_air_date.slice(0, 4) : null
    const ended = d.status === 'Ended' || d.status === 'Canceled'
    const yearEnd = ended && d.last_air_date ? +d.last_air_date.slice(0, 4) : null
    const net = d.networks?.[0]?.name || d.production_companies?.[0]?.name || ''
    const country = COUNTRY[d.origin_country?.[0]] || d.origin_country?.[0] || ''
    const origin = [net, country].filter(Boolean).join(' · ')

    const v = { ...e.viewership }
    if (v.figure) {
      v.disclosed = true
    } else {
      v.context = null
      v.sourceUrl = null
      if (v.disclosed !== false) v.disclosed = 'unknown'
    }
    v.note = v.figure
      ? 'Documented figure — sourced.'
      : v.disclosed === false
        ? "Per-title viewership not released by the streaming platform — display 'Not publicly disclosed'."
        : "No documented premiere/peak figure sourced — display 'Not publicly disclosed'."

    newShows.push({
      id: slug(d.name || tv.name),
      title: d.name || tv.name,
      ageFrom: e.ageFrom,
      ageTo,
      bucket,
      epMinutes: epMin,
      epLabel: `~${epMin} min`,
      seasons: d.number_of_seasons ?? null,
      episodes: d.number_of_episodes ?? 0,
      yearStart,
      yearEnd,
      origin,
      themes: e.themes,
      synopsis: (d.overview || '').trim() || 'No synopsis available.',
      reach: e.reach ?? null,
      ageBasis: e.ageBasis,
      animationStyle: e.animationStyle,
      links: { wikipedia: e.wikipedia, fandom: null, imdb: `https://www.imdb.com/title/${tt}/` },
      images: { poster: `${IMG}/w500${primary}`, gallery: gallery.map((p) => `${IMG}/w780${p}`) },
      viewership: v,
      verified: true,
    })
    process.stdout.write('.')
  } catch {
    failed.push(tt)
    process.stdout.write('!')
  }
}

data.shows.push(...newShows)
data._meta.count = data.shows.length
writeFileSync(showsFile, JSON.stringify(data, null, 2) + '\n')
console.log(`\nadded ${newShows.length} shows → total ${data.shows.length}`)
console.log('failed:', failed.length ? failed.join(', ') : 'none')
