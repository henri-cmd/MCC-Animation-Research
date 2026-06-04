// Enrich public/data/shows.json with poster + gallery image URLs from TMDB.
//
// TMDB artwork is free to DISPLAY with attribution — it is NOT scraped from IMDb.
// Each show is matched by its existing IMDb id via TMDB's /find endpoint, so
// matches are exact (no fuzzy-title guessing / no wrong reboot).
//
// Usage:
//   TMDB_API_KEY=<your TMDB v3 key>  node scripts/enrich-tmdb.mjs
//   # or a v4 token:
//   TMDB_BEARER=<your v4 read token> node scripts/enrich-tmdb.mjs
//
// Get a free key/token at https://www.themoviedb.org/settings/api
// Then commit public/data/shows.json — the live site picks up the images on deploy.

import { readFileSync, writeFileSync } from 'node:fs'

const FILE = new URL('../public/data/shows.json', import.meta.url)
const KEY = process.env.TMDB_API_KEY
const BEARER = process.env.TMDB_BEARER

if (!KEY && !BEARER) {
  console.error(
    'Missing credentials. Set TMDB_API_KEY (v3 key) or TMDB_BEARER (v4 token).\n' +
      'Get one free at https://www.themoviedb.org/settings/api',
  )
  process.exit(1)
}

const IMG = 'https://image.tmdb.org/t/p'
const POSTER_SIZE = 'w500' // landscape key-art used in cards / hero / tooltip
const STILL_SIZE = 'w780' // gallery stills in the detail drawer
const GALLERY_MAX = 6

const headers = BEARER ? { Authorization: `Bearer ${BEARER}` } : {}
const withKey = (url) => (BEARER ? url : url + (url.includes('?') ? '&' : '?') + `api_key=${KEY}`)

async function tmdb(path) {
  const res = await fetch(withKey(`https://api.themoviedb.org/3${path}`), { headers })
  if (!res.ok) throw new Error(`TMDB ${path} → ${res.status}`)
  return res.json()
}

const ttFrom = (url) => (typeof url === 'string' ? (url.match(/tt\d+/) || [])[0] || null : null)

async function imagesFor(show) {
  // 1) resolve the TMDB tv record, preferring an exact IMDb-id match
  let tv = null
  const tt = ttFrom(show.links?.imdb)
  if (tt) {
    const found = await tmdb(`/find/${tt}?external_source=imdb_id`)
    tv = found.tv_results?.[0] ?? null
  }
  if (!tv) {
    const q = encodeURIComponent(show.title)
    const s = await tmdb(`/search/tv?query=${q}&first_air_date_year=${show.yearStart}`)
    tv = s.results?.[0] ?? null
  }
  if (!tv) return null

  // 2) gather landscape backdrops (best fit for the UI's 16:9 / 16:7 slots)
  let paths = []
  try {
    const imgs = await tmdb(`/tv/${tv.id}/images?include_image_language=en,null`)
    paths = (imgs.backdrops ?? []).map((b) => b.file_path)
  } catch {
    /* gallery optional */
  }
  // primary first, then the rest, deduped; fall back to the portrait poster
  const primary = tv.backdrop_path ?? paths[0] ?? tv.poster_path ?? null
  paths = [primary, ...paths.filter((p) => p && p !== primary)].filter(Boolean)

  if (!primary) return null
  return {
    poster: `${IMG}/${POSTER_SIZE}${primary}`,
    gallery: paths.slice(0, GALLERY_MAX).map((p) => `${IMG}/${STILL_SIZE}${p}`),
  }
}

const data = JSON.parse(readFileSync(FILE, 'utf8'))
let ok = 0
const missed = []

for (const show of data.shows) {
  try {
    const images = await imagesFor(show)
    if (images?.poster) {
      show.images = images
      ok++
      process.stdout.write('.')
    } else {
      missed.push(show.id)
      process.stdout.write('x')
    }
  } catch {
    missed.push(show.id)
    process.stdout.write('!')
  }
}

writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n')
console.log(`\nimages set: ${ok}/${data.shows.length}`)
if (missed.length) console.log('no match (left as spectrum fallback):', missed.join(', '))
console.log('\nReminder: the UI must credit TMDB (already wired in the footer once images exist).')
