// One-off: add IMDb links (researched, high-confidence) + animation-style tags
// to each show in public/data/shows.json.
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = new URL('../public/data/shows.json', import.meta.url)

const imdb = {
  cocomelon: 'tt12427840', 'peppa-pig': 'tt0426769', 'daniel-tiger': 'tt2014553',
  'sesame-street': 'tt0063951', octonauts: 'tt1710177', bluey: 'tt7678620',
  'paw-patrol': 'tt3121722', pokemon: 'tt0168366', spongebob: 'tt0206512',
  'phineas-and-ferb': 'tt0852863', 'loud-house': 'tt4859164', 'teen-titans-go': 'tt2771780',
  'gravity-falls': 'tt1865718', 'avatar-tla': 'tt0417299', amphibia: 'tt8050740',
  'star-vs': 'tt2758770', 'adventure-time': 'tt1305826', 'steven-universe': 'tt3061046',
  'owl-house': 'tt8050756', 'young-justice': 'tt1641384', mha: 'tt5626028',
  'the-simpsons': 'tt0096697', 'bobs-burgers': 'tt1561755', arcane: 'tt11126994',
  'demon-slayer': 'tt9335498', aot: 'tt2560140', 'family-guy': 'tt0182576',
  castlevania: 'tt6517102', bojack: 'tt3398228', 'rick-and-morty': 'tt2861424',
  'south-park': 'tt0121955', invincible: 'tt6741278', 'bob-the-builder': 'tt0262151',
  'fireman-sam': 'tt0329829', arthur: 'tt0169414', recess: 'tt0126170',
  catdog: 'tt0154061', 'rocket-power': 'tt0244926', 'angela-anaconda': 'tt0224455',
  'fairly-oddparents': 'tt0235918', 'wild-thornberrys': 'tt0167743', 'hey-arnold': 'tt0115200',
  'powerpuff-girls': 'tt0175058', 'yu-gi-oh': 'tt0247902', 'ben-10': 'tt0760437',
  'teen-titans': 'tt0343314', 'invader-zim': 'tt0235923', 'big-mouth': 'tt6524350',
}

// Predominant production technique. Vocabulary: 2D, 3D / CGI, Anime, Stop-motion, Cutout, Puppetry.
const style = {
  cocomelon: '3D / CGI', 'peppa-pig': '2D', 'daniel-tiger': '2D', 'sesame-street': 'Puppetry',
  octonauts: '3D / CGI', bluey: '2D', 'paw-patrol': '3D / CGI', pokemon: 'Anime',
  spongebob: '2D', 'phineas-and-ferb': '2D', 'loud-house': '2D', 'teen-titans-go': '2D',
  'gravity-falls': '2D', 'avatar-tla': '2D', amphibia: '2D', 'star-vs': '2D',
  'adventure-time': '2D', 'steven-universe': '2D', 'owl-house': '2D', 'young-justice': '2D',
  mha: 'Anime', 'the-simpsons': '2D', 'bobs-burgers': '2D', arcane: '3D / CGI',
  'demon-slayer': 'Anime', aot: 'Anime', 'family-guy': '2D', castlevania: '2D',
  bojack: '2D', 'rick-and-morty': '2D', 'south-park': 'Cutout', invincible: '2D',
  'bob-the-builder': 'Stop-motion', 'fireman-sam': 'Stop-motion', arthur: '2D', recess: '2D',
  catdog: '2D', 'rocket-power': '2D', 'angela-anaconda': 'Cutout', 'fairly-oddparents': '2D',
  'wild-thornberrys': '2D', 'hey-arnold': '2D', 'powerpuff-girls': '2D', 'yu-gi-oh': 'Anime',
  'ben-10': '2D', 'teen-titans': '2D', 'invader-zim': '2D', 'big-mouth': '2D',
}

const data = JSON.parse(readFileSync(FILE, 'utf8'))
let n = 0
for (const s of data.shows) {
  if (imdb[s.id]) s.links.imdb = `https://www.imdb.com/title/${imdb[s.id]}/`
  else if (!('imdb' in s.links)) s.links.imdb = null
  if (style[s.id]) s.animationStyle = style[s.id]
  n++
}
writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n')

const missingImdb = data.shows.filter((s) => !s.links.imdb).map((s) => s.id)
const missingStyle = data.shows.filter((s) => !s.animationStyle).map((s) => s.id)
console.log(`Enriched ${n} shows.`)
console.log('missing imdb:', missingImdb.length ? missingImdb.join(', ') : 'none')
console.log('missing style:', missingStyle.length ? missingStyle.join(', ') : 'none')
const byStyle = {}
for (const s of data.shows) byStyle[s.animationStyle] = (byStyle[s.animationStyle] || 0) + 1
console.log('style counts:', byStyle)
