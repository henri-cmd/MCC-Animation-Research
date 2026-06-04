// Pull per-show episode lists from TMDB → public/data/episodes/{id}.json
// (compact: { id, seasons: [{ s, eps: [{ e, t, d }] }] }). Loaded on demand by
// the detail panel's season dropdown. Run: TMDB_API_KEY=<key> node scripts/pull-episodes.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const KEY = process.env.TMDB_API_KEY
if (!KEY) {
  console.error('Set TMDB_API_KEY (v3 key).')
  process.exit(1)
}

const ROOT = new URL('../', import.meta.url)
const shows = JSON.parse(readFileSync(new URL('public/data/shows.json', ROOT), 'utf8')).shows
const OUT = new URL('public/data/episodes/', ROOT)
mkdirSync(OUT, { recursive: true })

const tmdb = async (p) => {
  const r = await fetch(`https://api.themoviedb.org/3${p}${p.includes('?') ? '&' : '?'}api_key=${KEY}`)
  if (!r.ok) throw new Error(`${p} → ${r.status}`)
  return r.json()
}
const ttOf = (url) => (url?.match(/tt\d+/) || [])[0]

let done = 0
let fail = 0
const failed = []

async function one(show) {
  const id = ttOf(show.links?.imdb)
  if (!id) return
  try {
    const found = await tmdb(`/find/${id}?external_source=imdb_id`)
    const tv = found.tv_results?.[0]
    if (!tv) {
      fail++
      failed.push(show.id)
      process.stdout.write('x')
      return
    }
    const d = await tmdb(`/tv/${tv.id}?language=en-US`)
    const nums = (d.seasons || []).map((s) => s.season_number).filter((n) => n >= 1)
    const seasons = []
    for (const n of nums) {
      try {
        const s = await tmdb(`/tv/${tv.id}/season/${n}?language=en-US`)
        const eps = (s.episodes || []).map((e) => ({ e: e.episode_number, t: e.name, d: e.air_date || null }))
        if (eps.length) seasons.push({ s: n, eps })
      } catch {
        /* skip season */
      }
    }
    if (seasons.length) {
      writeFileSync(new URL(`${show.id}.json`, OUT), JSON.stringify({ id: show.id, seasons }))
      done++
      process.stdout.write('.')
    } else {
      fail++
      failed.push(show.id)
      process.stdout.write('o')
    }
  } catch {
    fail++
    failed.push(show.id)
    process.stdout.write('!')
  }
}

// modest concurrency (TMDB allows plenty)
const queue = [...shows]
const workers = Array.from({ length: 6 }, async () => {
  while (queue.length) await one(queue.shift())
})
await Promise.all(workers)

console.log(`\nepisode files written: ${done}, failed/empty: ${fail}`)
if (failed.length) console.log('no episodes:', failed.join(', '))
