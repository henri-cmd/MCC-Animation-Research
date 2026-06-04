// The age axis scale. The bulk of the axis (ages 0–17) is an honest linear
// age line; the rightmost slice is the "Adult" zone where open-ended shows
// (ageTo === 99) land and fade out.

import { OPEN_ENDED } from '../data/shows'
import { spectrumRGB, rgbCss, MAX_REAL_AGE } from './spectrum'

/** Numeric ticks; the "Adult" label is rendered separately at the right end. */
export const AGE_TICKS = [0, 2, 5, 8, 11, 14, 17] as const

/** Fraction of the plot width where the Adult zone begins. */
export const ADULT_ZONE_START = 0.84

/** Age at which the Adult zone ends (open-ended bars reach here). */
const ADULT_EDGE = 18

/** Map a viewing age to a fraction [0,1] of the plot width. */
export function ageToFrac(age: number): number {
  if (age >= OPEN_ENDED) return 1
  const a = Math.max(0, Math.min(age, ADULT_EDGE))
  if (a <= MAX_REAL_AGE) return (a / MAX_REAL_AGE) * ADULT_ZONE_START
  return (
    ADULT_ZONE_START +
    ((a - MAX_REAL_AGE) / (ADULT_EDGE - MAX_REAL_AGE)) * (1 - ADULT_ZONE_START)
  )
}

/** Convenience: fraction → percentage string. */
export const pctX = (age: number) => `${(ageToFrac(age) * 100).toFixed(3)}%`

/** Highest scrubber value; rendered as the "Adult" end rather than a number. */
export const SCRUB_MAX = ADULT_EDGE

/** Inverse of {@link ageToFrac}: a plot fraction [0,1] → viewing age. */
export function fracToAge(frac: number): number {
  const f = Math.max(0, Math.min(frac, 1))
  if (f <= ADULT_ZONE_START) return (f / ADULT_ZONE_START) * MAX_REAL_AGE
  return MAX_REAL_AGE + ((f - ADULT_ZONE_START) / (1 - ADULT_ZONE_START)) * (ADULT_EDGE - MAX_REAL_AGE)
}

/** Does a show's age span cover this scrubber age? (open-ended reaches the Adult end.) */
export function spanCoversAge(ageFrom: number, ageTo: number, age: number): boolean {
  const effTo = ageTo >= OPEN_ENDED ? 100 : ageTo
  return age >= ageFrom && age <= effTo
}

/**
 * Build a left→right CSS gradient for a bar spanning [ageFrom, ageTo] such that
 * the colour at any point matches the spectrum colour for that age — so every
 * bar reads as a window onto one continuous spectrum field. Open-ended bars
 * (ageTo === 99) hold crimson and fade softly at the end.
 */
export function barFill(ageFrom: number, ageTo: number): string {
  const openEnded = ageTo >= OPEN_ENDED
  const hiAge = openEnded ? ADULT_EDGE : ageTo
  const span = Math.max(1e-4, ageToFrac(hiAge) - ageToFrac(ageFrom))
  const pct = (age: number) =>
    (((ageToFrac(age) - ageToFrac(ageFrom)) / span) * 100).toFixed(1)

  const top = Math.min(hiAge, MAX_REAL_AGE)
  const ages = new Set<number>([ageFrom])
  for (let a = Math.ceil(ageFrom); a <= top; a += 2) ages.add(a)
  ages.add(top)

  const stops = [...ages]
    .sort((x, y) => x - y)
    .map((a) => `${rgbCss(spectrumRGB(a))} ${pct(a)}%`)

  if (openEnded) {
    const crimson = spectrumRGB(MAX_REAL_AGE)
    stops.push(`${rgbCss(crimson)} ${pct(MAX_REAL_AGE)}%`)
    stops.push(`${rgbCss(crimson)} 86%`)
    stops.push(`${rgbCss(crimson, 0.45)} 100%`) // soft "open-ended" fade
  }

  return `linear-gradient(90deg, ${stops.join(', ')})`
}

/** Label for a show's age span, e.g. "8–14" or "2+ (all ages)". */
export function ageRangeLabel(ageFrom: number, ageTo: number): string {
  if (ageTo >= OPEN_ENDED) return `${ageFrom}+`
  return `${ageFrom}–${ageTo}`
}
