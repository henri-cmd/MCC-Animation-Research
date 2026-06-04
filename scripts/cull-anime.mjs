// Cull anime down to a curated keep-list; remove the rest from shows.json and
// delete their episode files. Run: node scripts/cull-anime.mjs
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'

const showsFile = new URL('../public/data/shows.json', import.meta.url)
const epDir = new URL('../public/data/episodes/', import.meta.url)

const KEEP = new Set([
  'pokemon', 'mha', 'demon-slayer', 'aot', 'yu-gi-oh', // originals
  'one-piece', 'fullmetal-alchemist-brotherhood', 'death-note', 'cowboy-bebop',
  'naruto', 'dragon-ball-z', 'neon-genesis-evangelion',
])

const d = JSON.parse(readFileSync(showsFile, 'utf8'))
const before = d.shows.length
const removed = []

d.shows = d.shows.filter((s) => {
  if (s.animationStyle === 'Anime' && !KEEP.has(s.id)) {
    removed.push(s.id)
    return false
  }
  return true
})

for (const id of removed) {
  const p = new URL(`${id}.json`, epDir)
  if (existsSync(p)) rmSync(p)
}

d._meta.count = d.shows.length
writeFileSync(showsFile, JSON.stringify(d, null, 2) + '\n')

const anime = d.shows.filter((s) => s.animationStyle === 'Anime')
console.log(`removed ${removed.length} anime · total ${before} → ${d.shows.length}`)
console.log(`anime now (${anime.length}): ${anime.map((s) => s.title).join(', ')}`)
const missing = [...KEEP].filter((id) => !d.shows.some((s) => s.id === id))
if (missing.length) console.log('WARNING keep-id not found:', missing.join(', '))
