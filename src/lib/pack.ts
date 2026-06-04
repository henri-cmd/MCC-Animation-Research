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
 * @param gap minimum age-space gutter between bars sharing a row (visual breathing room).
 * @returns items annotated with a row index, plus the total row count.
 */
export function packRows<T extends Interval>(
  items: T[],
  gap = 0.5,
): { placed: Placed<T>[]; rowCount: number } {
  // Sort by start age, then by end age — standard greedy order.
  const order = [...items].sort(
    (a, b) => a.ageFrom - b.ageFrom || hi(a.ageTo) - hi(b.ageTo),
  )

  const rowEnds: number[] = [] // current rightmost end per row
  const placed: Placed<T>[] = []

  for (const item of order) {
    let row = rowEnds.findIndex((end) => end + gap <= item.ageFrom)
    if (row === -1) {
      row = rowEnds.length
      rowEnds.push(hi(item.ageTo))
    } else {
      rowEnds[row] = Math.max(rowEnds[row], hi(item.ageTo))
    }
    placed.push({ item, row })
  }

  return { placed, rowCount: rowEnds.length }
}
