// One-off: apply researched counts + sourced viewership to public/data/shows.json.
// Every viewership figure below was returned by a research pass with a real source
// URL; figures without a documented source are intentionally left as null
// ("Not publicly disclosed"). No revenue/profit figures are added (by design).
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = new URL('../public/data/shows.json', import.meta.url)

// id -> { counts?: {seasons?, episodes?, yearEnd?, verified}, viewership?: {figure, context, sourceUrl} }
const patch = {
  // ── Toddler / Preschool ───────────────────────────────────────────────
  cocomelon: {
    counts: { seasons: 12, yearEnd: null, verified: false }, // episode count genuinely ambiguous; left as seed estimate
    viewership: {
      figure: '231.1M Netflix views (2024)',
      context: '#1 most-viewed series on Netflix in 2024 (views = hours viewed ÷ runtime)',
      sourceUrl: 'https://www.moonbug.com/news/cocomelon-was-the-most-viewed-series-on-netflix-in-2024',
    },
  },
  'peppa-pig': { counts: { seasons: 9, episodes: 434, yearEnd: null, verified: true } },
  'daniel-tiger': { counts: { seasons: 7, episodes: 155, yearEnd: null, verified: true } },
  'sesame-street': {
    counts: { seasons: 56, episodes: 4736, yearEnd: null, verified: true },
    viewership: {
      figure: '1.9M households (premiere)',
      context: 'U.S. series premiere, Nov 10 1969 — 3.3 Nielsen rating',
      sourceUrl: 'https://en.wikipedia.org/wiki/Sesame_Street',
    },
  },
  octonauts: {
    counts: { seasons: 5, episodes: 121, yearEnd: null, verified: true },
    viewership: {
      figure: '257K daily viewers (Australia)',
      context: '2nd most-watched children’s programme in Australia, 2014 (ABC2)',
      sourceUrl: 'https://en.wikipedia.org/wiki/Octonauts',
    },
  },

  // ── Young Kids / Older Kids ──────────────────────────────────────────
  'paw-patrol': {
    counts: { seasons: 13, episodes: 303, yearEnd: null, verified: true },
    viewership: {
      figure: '4.2M viewers (Live+7)',
      context: '“Mission PAW” special, Mar 2017 — series ratings record (P2+)',
      sourceUrl: 'https://www.cynopsis.com/story/nickelodeon-flying-high-as-paw-patrol-scores-series-ratings-record/',
    },
  },
  'loud-house': {
    counts: { seasons: 9, episodes: 308, yearEnd: null, verified: true },
    viewership: {
      figure: '1.9M viewers (first month)',
      context: 'Avg. total viewers in the month after the May 2016 premiere (981K kids 2–11)',
      sourceUrl: 'http://www.nickalive.net/2016/06/the-loud-house-quickly-becomes.html',
    },
  },
  'phineas-and-ferb': {
    counts: { seasons: 5, episodes: 157, yearEnd: null, verified: true },
    viewership: {
      figure: '10.8M viewers (premiere)',
      context: 'Series premiere, Aug 17 2007 (after a Hannah Montana lead-in)',
      sourceUrl: 'https://en.wikipedia.org/wiki/Phineas_and_Ferb',
    },
  },
  'teen-titans-go': {
    counts: { seasons: 9, episodes: 447, yearEnd: null, verified: true },
    viewership: {
      figure: '3M+ viewers (premiere)',
      context: 'Pilot on Cartoon Network, Apr 23 2013',
      sourceUrl: 'https://en.wikipedia.org/wiki/Teen_Titans_Go!',
    },
  },
  'fairly-oddparents': {
    viewership: {
      figure: '8.89M viewers',
      context: 'Premiere of the TV movie “Fairly OddBaby”, 2008',
      sourceUrl: 'https://en.wikipedia.org/wiki/The_Fairly_OddParents',
    },
  },
  'powerpuff-girls': {
    viewership: {
      figure: '2.2M households',
      context: 'Episode airing Sep 8 2000 — 3.4 Nielsen, then Cartoon Network’s highest-rated',
      sourceUrl: 'https://en.wikipedia.org/wiki/The_Powerpuff_Girls',
    },
  },
  spongebob: {
    viewership: {
      figure: '50M+ monthly viewers',
      context: 'Nickelodeon-reported monthly audience at its peak — most-watched animated series at the time',
      sourceUrl: 'https://www.diamondcomics.com/Article/4007-Nickelodeon-Announces-SpongeBob-SquarePants-Viewership-Statistics',
    },
  },

  // ── Action / anime ───────────────────────────────────────────────────
  pokemon: {
    counts: { seasons: 28, episodes: 1372, yearEnd: null, verified: true },
    viewership: {
      figure: '3.1M viewers (U.S.)',
      context: 'Kids’ WB audience by Sept 1999, at the peak of “Pokémania”',
      sourceUrl: 'https://en.wikipedia.org/wiki/Pok%C3%A9mon_(TV_series)',
    },
  },
  'yu-gi-oh': { counts: { seasons: '10 series', episodes: 1244, yearEnd: null, verified: true } },
  mha: {
    counts: { seasons: 8, episodes: 170, yearEnd: 2025, verified: true },
    viewership: {
      figure: '3.9% household rating (Japan)',
      context: 'Season 6 premiere — the series’ highest seasonal-premiere rating in Japan',
      sourceUrl: 'https://en.wikipedia.org/wiki/My_Hero_Academia',
    },
  },
  'demon-slayer': {
    counts: { seasons: 4, episodes: 63, yearEnd: 2024, verified: true },
    viewership: {
      figure: '25.97M viewers (Japan)',
      context: 'Entertainment District Arc finale (ep 11) — peak single-episode audience, per Video Research',
      sourceUrl: 'https://en.wikipedia.org/wiki/Demon_Slayer:_Kimetsu_no_Yaiba_(TV_series)',
    },
  },

  // ── Kids → Teens crossover ───────────────────────────────────────────
  'gravity-falls': {
    viewership: {
      figure: '2.9M viewers (finale)',
      context: 'Series finale “Weirdmageddon 3”, Feb 2016 — a Disney XD record (Nielsen L+3)',
      sourceUrl: 'https://variety.com/2016/tv/news/gravity-falls-series-finale-disney-xd-ratings-records-1201711939/',
    },
  },
  'avatar-tla': {
    viewership: {
      figure: '5.6M viewers (finale)',
      context: 'Series finale “Sozin’s Comet”, Jul 19 2008',
      sourceUrl: 'https://en.wikipedia.org/wiki/Sozin%27s_Comet',
    },
  },
  'adventure-time': {
    viewership: {
      figure: '3.4M viewers (peak)',
      context: 'Season 5 premiere — the series’ peak single-episode audience',
      sourceUrl: 'https://en.wikipedia.org/wiki/Adventure_Time',
    },
  },
  'steven-universe': {
    counts: { seasons: 5, episodes: 160, yearEnd: 2019, verified: true },
    viewership: {
      figure: '~1.9M viewers (premiere)',
      context: 'Series premiere, Nov 4 2013 — Cartoon Network’s top series premiere of 2013',
      sourceUrl: 'https://www.nickandmore.com/2013/11/06/steven-universe-premieres-as-cartoon-networks-highest-rated-premiere-with-kidsboys-in-2013/',
    },
  },
  amphibia: { counts: { seasons: 3, episodes: 58, yearEnd: 2022, verified: true } },
  'star-vs': {
    counts: { seasons: 4, episodes: 77, yearEnd: 2019, verified: true },
    viewership: {
      figure: '1.2M viewers (premiere)',
      context: 'Series premiere — most-watched animated debut in Disney XD history at the time',
      sourceUrl: 'https://en.wikipedia.org/wiki/Star_vs._the_Forces_of_Evil',
    },
  },
  'owl-house': {
    counts: { seasons: 3, episodes: 43, yearEnd: 2023, verified: true },
    viewership: {
      figure: '~375K viewers (finale)',
      context: 'Series finale, Apr 8 2023 (P2+, Nielsen)',
      sourceUrl: 'https://en.wikipedia.org/wiki/The_Owl_House',
    },
  },
  bluey: {
    viewership: {
      figure: '55.62B minutes streamed (2024)',
      context: 'Most-streamed title in the U.S. in 2024 (Disney+), per Nielsen',
      sourceUrl: 'https://www.nielsen.com/insights/2025/top-streaming-tv-trends-2024-artey-awards/',
    },
  },

  // ── Teens / Adults (network) ─────────────────────────────────────────
  'the-simpsons': {
    counts: { seasons: 37, episodes: 805, yearEnd: null, verified: true },
    viewership: {
      figure: '13.4M households (premiere)',
      context: 'Series premiere “Simpsons Roasting on an Open Fire”, Dec 17 1989 (14.5 Nielsen)',
      sourceUrl: 'https://en.wikipedia.org/wiki/Simpsons_Roasting_on_an_Open_Fire',
    },
  },
  'family-guy': {
    counts: { seasons: 24, episodes: 461, yearEnd: null, verified: true },
    viewership: {
      figure: '22.0M viewers (premiere)',
      context: 'Series premiere after Super Bowl XXXIII, Jan 31 1999 (Fox)',
      sourceUrl: 'https://en.wikipedia.org/wiki/Family_Guy_season_1',
    },
  },
  'south-park': {
    counts: { seasons: 28, episodes: 338, yearEnd: null, verified: true },
    viewership: {
      figure: '6.2M viewers',
      context: '“Cartman’s Mom…” (S2, Apr 1998) — then a basic-cable record (8.2 Nielsen)',
      sourceUrl: 'https://en.wikipedia.org/wiki/South_Park',
    },
  },
  'bobs-burgers': {
    counts: { seasons: 16, episodes: 313, yearEnd: null, verified: true },
    viewership: {
      figure: '9.39M viewers (premiere)',
      context: 'Series premiere “Human Flesh”, Jan 9 2011 (Fox)',
      sourceUrl: 'https://en.wikipedia.org/wiki/Bob%27s_Burgers',
    },
  },
  'rick-and-morty': {
    counts: { seasons: 9, episodes: 83, yearEnd: null, verified: true },
    viewership: {
      figure: '2.6M viewers (finale)',
      context: 'Season 3 finale (L+SD) — a record Adult Swim telecast at the time',
      sourceUrl: 'https://en.wikipedia.org/wiki/Rick_and_Morty_season_3',
    },
  },
  'young-justice': { counts: { seasons: 4, episodes: 98, yearEnd: 2022, verified: true } },
  'invader-zim': {
    viewership: {
      figure: '~1.8M viewers (premiere)',
      context: 'Series premiere, 2001 — 6.0 rating / 17 share among kids 2–11',
      sourceUrl: 'https://en.wikipedia.org/wiki/Invader_Zim',
    },
  },
}

const data = JSON.parse(readFileSync(FILE, 'utf8'))
let counts = 0
let views = 0

for (const s of data.shows) {
  const p = patch[s.id]
  if (!p) continue
  if (p.counts) {
    if ('seasons' in p.counts) s.seasons = p.counts.seasons
    if ('episodes' in p.counts) s.episodes = p.counts.episodes
    if ('yearEnd' in p.counts) s.yearEnd = p.counts.yearEnd
    if ('verified' in p.counts) s.verified = p.counts.verified
    counts++
  }
  if (p.viewership) {
    s.viewership.figure = p.viewership.figure
    s.viewership.context = p.viewership.context
    s.viewership.sourceUrl = p.viewership.sourceUrl
    s.viewership.disclosed = true
    views++
  }
}

data._meta.dataStatus =
  'Verified 2026-06: counts confirmed via web sources (per-show "verified" flag). Viewership is shown only where a documented figure (premiere/peak rating or audience milestone) is sourced; otherwise "Not publicly disclosed". Streaming originals are never numbered. NO revenue/profit figures by design.'

writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n')
console.log(`Applied counts to ${counts} shows, viewership to ${views} shows.`)
const unverified = data.shows.filter((s) => !s.verified).map((s) => s.id)
console.log(`Still verified:false → ${unverified.length ? unverified.join(', ') : 'none'}`)
