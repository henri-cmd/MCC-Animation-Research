// Interval packing for the Age Line. Each show occupies its age span; a show
// drops into the first row where it doesn't overlap any bar already there, so
// non-overlapping shows share a row and the chart stays compact.

import { OPEN_ENDED } from '../data/shows'

export interface Interval {
  ageFrom: number
  ageTo: number
}

/** ageTo === 99 reaches the open end — treat as 100 for overlap math. */
const hi = (ageTo: number) => (ageTo >= OPEN_ENDED ? 100 : ageTo)

export interface Placed<T> {
  item: T
  row: number
}

/**
 * First-fit interval packing.
 * Items are packed in the order given, so the caller controls vertical priority
 * (e.g. sort by seasons → most-seasons shows rise to the top rows). Each item
 * drops into the first row where it overlaps nothing already there.
 *
 * @param gap minimum age-space gutter between bars sharing a row (visual breathing room).
 * @returns items annotated with a row index, plus the total row count.
 */
export function packRows<T extends Interval>(
  items: T[],
  gap = 0.5,
): { placed: Placed<T>[]; rowCount: number } {
  const rows: Array<Array<[number, number]>> = [] // [from, to] intervals per row
  const placed: Placed<T>[] = []

  for (const item of items) {
    const from = item.ageFrom
    const to = hi(item.ageTo)
    let row = rows.findIndex((ivals) => ivals.every(([f, t]) => to + gap <= f || t + gap <= from))
    if (row === -1) {
      row = rows.length
      rows.push([])
    }
    rows[row].push([from, to])
    placed.push({ item, row })
  }

  return { placed, rowCount: rows.length }
}
