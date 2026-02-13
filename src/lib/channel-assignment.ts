import type { Pilot } from './schemas'

type RacebandChannel = 1 | 3 | 6 | 8

export function getChannelsForHeat(pilotCount: number): number[] {
  if (pilotCount <= 0) return []
  if (pilotCount === 1) return [1]
  if (pilotCount === 2) return [1, 3]
  if (pilotCount === 3) return [1, 3, 6]
  // default to 4-wide
  return [1, 3, 6, 8]
}

export function getChannelForPosition(position: number, pilotCount: number): number {
  const channels = getChannelsForHeat(pilotCount)
  if (position < 0 || position >= channels.length) {
    throw new Error(`Position out of range: ${position} for pilotCount=${pilotCount}`)
  }
  return channels[position]
}

export function formatChannel(channel: number): string {
  return `R${channel}`
}

/**
 * Reorders pilotIds to maximize how often a pilot's lastChannel matches
 * the channel they would receive based on position.
 */
export function optimizePilotOrder(pilotIds: string[], pilots: Pilot[]): string[] {
  const pilotCount = pilotIds.length
  const channels = getChannelsForHeat(pilotCount)

  const pilotById = new Map(pilots.map(p => [p.id, p]))
  const available = new Set(pilotIds)

  // If nobody has channel info, don't change anything.
  const hasAnyLastChannel = pilotIds.some(id => pilotById.get(id)?.lastChannel !== undefined)
  if (!hasAnyLastChannel) return pilotIds

  const result: string[] = []

  for (const channel of channels) {
    const preferred: string[] = []

    for (const id of available) {
      const last = pilotById.get(id)?.lastChannel
      if (last === (channel as RacebandChannel)) preferred.push(id)
    }

    let selected: string | undefined

    if (preferred.length === 1) {
      selected = preferred[0]
    } else if (preferred.length > 1) {
      // Random tie-breaker.
      const idx = Math.floor(Math.random() * preferred.length)
      selected = preferred[idx]
    } else {
      // No preferred candidate for this channel.
      // Greedy fallback: keep as close as possible to original order.
      selected = pilotIds.find(id => available.has(id))
    }

    if (!selected) {
      // Should not happen, but keep function total.
      return pilotIds
    }

    result.push(selected)
    available.delete(selected)
  }

  // If something went wrong (e.g. pilotCount > 4), don't optimize.
  if (result.length !== pilotCount) return pilotIds
  return result
}
