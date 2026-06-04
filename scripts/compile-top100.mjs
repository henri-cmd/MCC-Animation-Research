// Merge the three research pools, dedupe by IMDb id, drop shows already in the
// dataset, rank by rating, and write a reusable candidate file.
import { readFileSync, writeFileSync } from 'node:fs'

const existing = new Set(
  JSON.parse(readFileSync(new URL('../public/data/shows.json', import.meta.url), 'utf8')).shows
    .map((s) => (s.links?.imdb?.match(/tt\d+/) || [])[0])
    .filter(Boolean),
)

const anime = [
  ['Fullmetal Alchemist: Brotherhood','tt1355642',9.1,2009],['One Piece','tt0388629',9.0,1999],
  ['Hunter x Hunter','tt2098220',9.0,2011],['Bleach: Thousand-Year Blood War','tt14986406',9.0,2022],
  ['Legend of the Galactic Heroes','tt0096633',9.0,1988],['Death Note','tt0877057',8.9,2006],
  ["Frieren: Beyond Journey's End",'tt22248376',8.9,2023],['Cowboy Bebop','tt0213338',8.9,1998],
  ['Dragon Ball Z','tt0121220',8.8,1989],['Vinland Saga','tt10233448',8.8,2019],
  ['Steins;Gate','tt1910272',8.8,2011],['Jujutsu Kaisen','tt12343534',8.8,2020],
  ['Clannad','tt1118804',8.8,2007],['Hajime no Ippo','tt0481256',8.8,2000],
  ['Gintama','tt0988818',8.7,2005],['Berserk','tt0318871',8.7,1997],['Monster','tt0434706',8.7,2004],
  ['Code Geass','tt0994314',8.7,2006],['Naruto: Shippuden','tt0988824',8.7,2007],
  ['Haikyuu!!','tt3398540',8.7,2014],['One Punch Man','tt4508902',8.6,2015],
  ['Hunter x Hunter (1999)','tt0426719',8.6,1999],['Monogatari Series: Second Season','tt2922300',8.6,2013],
  ['Neon Genesis Evangelion','tt0112159',8.5,1995],['Samurai Champloo','tt0423731',8.5,2004],
  ['Rurouni Kenshin','tt0182629',8.5,1996],['Mob Psycho 100','tt5897304',8.5,2016],
  ['Kaguya-sama: Love is War','tt9522300',8.5,2019],['Solo Leveling','tt21209876',8.5,2024],
  ['Mushi-Shi','tt0807832',8.5,2005],['Dragon Ball','tt0088509',8.5,1986],
  ['Your Lie in April','tt3895150',8.5,2014],['Dandadan','tt30217403',8.5,2024],
  ['Erased','tt5249462',8.4,2016],['Violet Evergarden','tt7078180',8.4,2018],
  ['Naruto','tt0409591',8.4,2002],['Fullmetal Alchemist (2003)','tt0421357',8.4,2003],
  ['Dragon Ball Super','tt4644488',8.3,2015],['Gurren Lagann','tt0948103',8.3,2007],
  ['Odd Taxi','tt14134550',8.3,2021],['Bocchi the Rock!','tt17158756',8.3,2022],
  ['Oshi no Ko','tt21030032',8.3,2023],['Chainsaw Man','tt13616990',8.3,2022],
  ['Made in Abyss','tt7222086',8.3,2017],['Puella Magi Madoka Magica','tt1773185',8.2,2011],
  ['Bleach','tt0434665',8.2,2004],['Black Clover','tt7441658',8.2,2017],
  ['Parasyte: The Maxim','tt3358020',8.2,2014],['Kaiju No. 8','tt21975436',8.2,2024],
  ['Dororo','tt9458304',8.2,2019],['Re:Zero','tt5607616',8.1,2016],['Psycho-Pass','tt2379308',8.1,2012],
  ['Blue Lock','tt15222080',8.1,2022],['Banana Fish','tt8515016',8.1,2018],
  ['The Promised Neverland','tt8788458',8.1,2019],['Delicious in Dungeon','tt21621494',8.1,2024],
  ['Bakemonogatari','tt1480925',8.0,2009],['Spy x Family','tt13706018',8.0,2022],
  ['Shaman King','tt0367409',8.0,2001],['Toradora!','tt1279024',7.9,2008],
  ['Assassination Classroom','tt3837246',7.9,2013],['Inuyasha','tt0290223',7.9,2000],
  ['Elfen Lied','tt0480489',7.8,2004],['Noragami','tt3225270',7.8,2014],
  ['Ghost in the Shell: Stand Alone Complex','tt0346314',8.5,2002],['Doraemon (2005)','tt4083422',8.4,2005],
]

const western = [
  ['Batman: The Animated Series','tt0103359',9.0,1992],['Justice League Unlimited','tt6025022',8.7,2004],
  ["X-Men '97",'tt16026746',8.7,2024],['Blue Eye Samurai','tt13309742',8.7,2023],
  ['Over the Garden Wall','tt3718778',8.7,2014],['Primal','tt10332508',8.6,2019],
  ['Regular Show','tt1710308',8.6,2010],['Hilda','tt6385540',8.6,2018],['Archer','tt1486217',8.6,2009],
  ['Scavengers Reign','tt21056886',8.6,2023],['Futurama','tt0149460',8.5,1999],
  ['Justice League','tt0275137',8.5,2001],['Star Wars: The Clone Wars','tt0458290',8.5,2008],
  ['Pantheon','tt11680642',8.5,2022],['Samurai Jack','tt0278238',8.5,2001],
  ['The Boondocks','tt0373732',8.5,2005],['Infinity Train','tt8146754',8.4,2019],
  ['Harley Quinn','tt7658402',8.4,2019],['X-Men: The Animated Series','tt0103584',8.4,1992],
  ['The Spectacular Spider-Man','tt0976192',8.4,2008],['Spider-Man: The Animated Series','tt0112175',8.4,1994],
  ['The Amazing World of Gumball','tt1942683',8.4,2011],['The Legend of Korra','tt1695360',8.3,2012],
  ['DuckTales (2017)','tt5531466',8.3,2017],['Kipo and the Age of Wonderbeasts','tt10482560',8.3,2020],
  ['Metalocalypse','tt0839188',8.3,2006],['Courage the Cowardly Dog','tt0220880',8.3,1999],
  ['Wakfu','tt1807824',8.2,2008],['The Midnight Gospel','tt11639414',8.2,2020],
  ['Final Space','tt6317068',8.2,2018],['The Dragon Prince','tt8688814',8.2,2018],
  ['Star Wars: Rebels','tt2930604',8.1,2014],['Moral Orel','tt0476922',8.1,2005],
  ['Sym-Bionic Titan','tt1709198',8.1,2010],['Transformers Prime','tt1659175',8.1,2010],
  ['Batman Beyond','tt0147746',8.1,1999],['She-Ra and the Princesses of Power','tt7745956',8.1,2018],
  ['Superman: The Animated Series','tt0115378',8.1,1996],['The Amazing Digital Circus','tt27610198',8.1,2023],
  ['Looney Tunes Cartoons','tt8543208',8.0,2020],['DuckTales (1987)','tt0092345',8.0,1987],
  ['Gargoyles','tt0108783',8.0,1994],['Wolverine and the X-Men','tt0772145',8.0,2008],
  ['Green Lantern: The Animated Series','tt1724587',8.0,2011],['Helluva Boss','tt10691770',8.0,2019],
  ["Rocko's Modern Life",'tt0106115',7.9,1993],['Solar Opposites','tt8910922',7.9,2020],
  ['Jonny Quest','tt0057730',7.9,1964],['Scooby-Doo, Where Are You!','tt0063950',7.9,1969],
  ['Star Wars: The Bad Batch','tt12708542',7.8,2021],['Close Enough','tt6994156',7.8,2020],
  ['Star Trek: Lower Decks','tt9184820',7.8,2020],['Animaniacs','tt0105941',7.8,1993],
  ["Dexter's Laboratory",'tt0115157',7.8,1996],['Pinky and the Brain','tt0112123',7.8,1995],
  ['ThunderCats (2011)','tt1666278',7.8,2011],['Metalocalypse2','tt0839188',7.8,2006],
  ['Harvey Birdman, Attorney at Law','tt0294097',7.7,2000],['Inside Job','tt10231312',7.7,2021],
  ['King of the Hill','tt0118375',7.6,1997],['Craig of the Creek','tt7713450',7.6,2018],
  ['Centaurworld','tt10919290',7.6,2021],['Hazbin Hotel','tt7216636',7.6,2019],
  ["Milo Murphy's Law",'tt5439480',7.6,2016],['Big City Greens','tt7165904',7.6,2018],
  ['My Adventures with Superman','tt14681924',7.6,2023],['Darkwing Duck','tt0101076',7.6,1991],
  ['Generator Rex','tt1636691',7.6,2010],['Castlevania: Nocturne','tt14833612',7.5,2023],
  ['Tuca & Bertie','tt8036272',7.4,2019],['Wander Over Yonder','tt2252938',7.4,2013],
  ['Superjail!','tt1031283',7.4,2007],['Disenchantment','tt5363918',7.2,2018],
  ['Adventure Time: Fionna & Cake','tt15248880',8.7,2023],['Shaun the Sheep','tt0983983',8.2,2007],
  ['Hey Duggee','tt4291050',8.8,2014],['Tumble Leaf','tt2948562',8.6,2013],
]

// merge, dedupe by imdb id (keep first/highest rating), exclude existing, tag kind
const byId = new Map()
const add = (rows, kind) => {
  for (const [title, imdbId, rating, year] of rows) {
    const id = imdbId
    if (existing.has(id)) continue
    const prev = byId.get(id)
    if (!prev || rating > prev.rating) byId.set(id, { title, imdbId: id, rating, year, kind: prev?.kind ?? kind })
  }
}
add(anime, 'anime')
add(western, 'western')

// Collapse same-franchise continuations/seasons/remakes to ONE representative id;
// keep genuinely distinct entries (different era/technique). Drop the rest.
const COLLAPSE_DROP = new Set([
  'tt0088509', 'tt4644488', // Dragon Ball, Dragon Ball Super  → Dragon Ball Z
  'tt0988824', // Naruto: Shippuden → Naruto
  'tt14986406', // Bleach: TYBW → Bleach
  'tt0426719', // Hunter x Hunter (1999) → HxH (2011)
  'tt0421357', // Fullmetal Alchemist (2003) → Brotherhood
  'tt1992744', 'tt3514596', // Hajime no Ippo seasons → Hajime no Ippo
  'tt2922300', // Monogatari S2 → Bakemonogatari (Monogatari Series)
  'tt6025022', // Justice League Unlimited → Justice League
])
const TITLE_FIX = {
  tt0121220: 'Dragon Ball Z', // represents the Dragon Ball franchise
  tt0409591: 'Naruto',
  tt0434665: 'Bleach',
  tt2098220: 'Hunter x Hunter',
  tt1355642: 'Fullmetal Alchemist: Brotherhood',
  tt0481256: 'Hajime no Ippo',
  tt1480925: 'Monogatari Series',
  tt0275137: 'Justice League / Unlimited',
}
const dropped = []
for (const id of COLLAPSE_DROP) {
  if (byId.has(id)) dropped.push(byId.get(id).title), byId.delete(id)
}
for (const [id, t] of Object.entries(TITLE_FIX)) if (byId.has(id)) byId.get(id).title = t

const all = [...byId.values()].sort((a, b) => b.rating - a.rating || a.year - b.year)

writeFileSync(new URL('./new-shows.json', import.meta.url), JSON.stringify(all, null, 2) + '\n')

console.log(`final new shows: ${all.length}  (anime ${all.filter((s) => s.kind === 'anime').length}, western/other ${all.filter((s) => s.kind === 'western').length})`)
console.log(`collapsed away (${dropped.length}): ${dropped.join(', ')}`)
console.log(`rating range: ${all[all.length - 1].rating} – ${all[0].rating}`)
const decades = {}
for (const s of all) { const d = Math.floor(s.year / 10) * 10; decades[d] = (decades[d] || 0) + 1 }
console.log('by decade:', Object.entries(decades).sort().map(([d, n]) => `${d}s:${n}`).join('  '))
