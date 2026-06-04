// Split new-shows.json into N batches and print them for the research agents.
import { readFileSync } from 'node:fs'
const shows = JSON.parse(readFileSync(new URL('./new-shows.json', import.meta.url), 'utf8'))
const N = 7
const per = Math.ceil(shows.length / N)
for (let b = 0; b < N; b++) {
  const batch = shows.slice(b * per, (b + 1) * per)
  if (!batch.length) continue
  console.log(`\n===== BATCH ${b + 1} (${batch.length}) =====`)
  for (const s of batch) console.log(`${s.imdbId} | ${s.title} (${s.year}) [${s.kind}]`)
}
