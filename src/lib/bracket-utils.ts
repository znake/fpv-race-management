import type { Heat } from '@/types'

/**
 * Groups heats by their roundNumber and returns sorted entries.
 *
 * Heats without a roundNumber default to round 1.
 * The result is sorted ascending by round number.
 *
 * @param heats - Array of heats to group
 * @returns Sorted array of [roundNumber, heats[]] tuples
 */
export function groupHeatsByRound(heats: Heat[]): [number, Heat[]][] {
  const heatsByRound = new Map<number, Heat[]>()
  heats.forEach(heat => {
    const round = heat.roundNumber ?? 1
    const existing = heatsByRound.get(round) || []
    existing.push(heat)
    heatsByRound.set(round, existing)
  })
  return Array.from(heatsByRound.entries()).sort(([a], [b]) => a - b)
}
