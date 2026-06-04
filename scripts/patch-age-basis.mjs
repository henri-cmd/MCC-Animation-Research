// Add the "who's really watching" basis note to the original 48 shows so it's
// uniform across the whole dataset. Run: node scripts/patch-age-basis.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const BASIS = {
  cocomelon: 'Toddlers; minimal appeal beyond the target age, but endlessly re-watched',
  'peppa-pig': "Preschoolers; parents co-view, but it's squarely a young-kids show",
  'daniel-tiger': 'Preschoolers learning to name feelings; co-viewed with parents',
  'sesame-street': 'Preschoolers core; nostalgia and celebrity bits pull adults too',
  octonauts: 'Preschoolers into animals and rescue; co-viewed with parents',
  bluey: 'Preschoolers, plus a famously large adult audience for the writing',
  'paw-patrol': 'Preschool/young-kids; merch-driven, little crossover beyond the age',
  pokemon: 'Kids core, but a massive multigenerational adult fandom',
  spongebob: 'Kids core; huge teen/adult crossover and meme culture',
  'phineas-and-ferb': 'Kids core; layered jokes give it a real adult audience',
  'loud-house': 'Older kids; big-family relatability, limited adult crossover',
  'teen-titans-go': 'Younger kids core; meta gags amuse some older viewers',
  'gravity-falls': 'Kids/teens at launch, now a devoted adult mystery fandom',
  'avatar-tla': 'Kids/teens originally; a huge adult fandom has since formed',
  amphibia: 'Kids and tweens; the coming-of-age arc skews slightly older',
  'star-vs': 'Tweens; magical-girl action with a teen fan following',
  'adventure-time': 'Kids on the surface, a heavy teen/adult cult underneath',
  'steven-universe': 'Kids/tweens core; identity themes built a big adult fandom',
  'owl-house': 'Tweens/teens; LGBTQ+ themes drew a passionate adult audience',
  'young-justice': 'Teens and adult comic fans; mature serialised superhero plotting',
  mha: 'Teens core; an enormous global teen-to-adult shonen fandom',
  'the-simpsons': 'Written for teens+; decades of adults, few young children',
  'bobs-burgers': 'Teens and adults; warm prime-time family comedy',
  arcane: 'Older teens and adults; mature themes, prestige adult animation',
  'demon-slayer': 'Teens and adults; graphic action skews older than typical shonen',
  aot: 'Older teens and adults; brutal, politically heavy seinen',
  'family-guy': 'Adults; shock comedy strictly for grown-ups',
  castlevania: 'Adults; graphic violence, a mature dark-fantasy audience',
  bojack: 'Adults; depression and addiction themes for grown-ups',
  'rick-and-morty': 'Adults 18-34, heavy male skew; nihilistic sci-fi',
  'south-park': 'Adults; topical, taboo satire not for children',
  invincible: 'Adults; extreme graphic violence behind a superhero premise',
  'bob-the-builder': 'Preschoolers; gentle problem-solving, co-viewed with parents',
  'fireman-sam': 'Preschoolers into rescue and safety; co-viewed with parents',
  arthur: 'Young kids; real-issue stories give it slightly older reach',
  recess: 'Older kids; playground politics with light adult nostalgia',
  catdog: 'Older kids; odd-couple slapstick, some 90s-kid nostalgia',
  'rocket-power': 'Older kids into extreme sports; 2000s-kid nostalgia',
  'angela-anaconda': 'Older kids; schoolyard rivalry in cut-out collage style',
  'fairly-oddparents': 'Older kids; wish-fulfilment comedy with light adult nostalgia',
  'wild-thornberrys': 'Older kids into animals and globe-trotting adventure',
  'hey-arnold': 'Older kids/tweens; inner-city stories carry adult nostalgia',
  'powerpuff-girls': 'Kids core; tongue-in-cheek style built an adult cult',
  'yu-gi-oh': 'Kids core; the card game sustains a large adult fandom',
  'ben-10': 'Older kids/tweens into transforming-hero action',
  'teen-titans': 'Tweens/teens; anime-styled action with adult nostalgia',
  'invader-zim': 'Teens and an enduring adult cult; dark sci-fi comedy',
  'big-mouth': 'Adults; raunchy puberty comedy strictly for grown-ups',
}

const f = new URL('../public/data/shows.json', import.meta.url)
const d = JSON.parse(readFileSync(f, 'utf8'))
let n = 0
for (const s of d.shows) {
  if (!s.ageBasis && BASIS[s.id]) {
    s.ageBasis = BASIS[s.id]
    n++
  }
}
writeFileSync(f, JSON.stringify(d, null, 2) + '\n')
const still = d.shows.filter((s) => !s.ageBasis).map((s) => s.id)
console.log(`added ageBasis to ${n} shows. still missing: ${still.length ? still.join(', ') : 'none'}`)
