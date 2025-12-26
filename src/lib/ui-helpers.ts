import type { Ranking } from './schemas'

/**
 * Inline SVG data URL for offline-first fallback pilot image
 * No external dependencies - works completely offline
 */
export const FALLBACK_PILOT_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150">
  <rect width="150" height="150" fill="#0d0221"/>
  <circle cx="75" cy="55" r="30" fill="#ff2a6d"/>
  <ellipse cx="75" cy="130" rx="45" ry="35" fill="#ff2a6d"/>
  <text x="75" y="60" font-family="sans-serif" font-size="24" fill="#0d0221" text-anchor="middle">?</text>
</svg>
`)}`

/**
 * Get consistent rank badge styling for placements
 *
 * Color scheme:
 * - 1st place: Gold
 * - 2nd place: Silver
 * - 3rd place: Bronze
 * - 4th place: Neon Cyan
 */
export function getRankBadgeClasses(rank: number): string {
  if (rank === 1) return 'bg-gold text-void shadow-glow-gold'
  if (rank === 2) return 'bg-silver text-void shadow-glow-silver'
  if (rank === 3) return 'bg-bronze text-void shadow-glow-bronze'
  return 'bg-neon-cyan text-void shadow-glow-cyan' // rank 4+
}

/**
 * Get consistent border styling for ranked cards
 */
export function getRankBorderClasses(rank: number): string {
  if (rank === 1) return 'border-gold shadow-glow-gold'
  if (rank === 2) return 'border-silver shadow-glow-silver'
  if (rank === 3) return 'border-bronze shadow-glow-bronze'
  return 'border-neon-cyan shadow-glow-cyan' // rank 4+
}

/**
 * Sortiert Piloten nach Platzierung (Story 4.4 - Task 1)
 *
 * @param pilotIds - Array of pilot IDs to sort
 * @param results - Heat results with rankings
 * @returns Sorted pilot IDs (rank 1 first, then 2, 3, 4)
 */
export function sortPilotsByRank(
  pilotIds: string[],
  results?: { rankings: Ranking[] }
): string[] {
  if (!results || !results.rankings) {
    return pilotIds // Ursprüngliche Reihenfolge für pending/active Heats
  }

  const rankingMap = new Map<string, number>()
  results.rankings.forEach(r => rankingMap.set(r.pilotId, r.rank))

  // Sortieren: Piloten mit Rang zuerst (1, 2, 3, 4), dann Piloten ohne Rang (rank=99)
  return [...pilotIds].sort((a, b) => {
    const rankA = rankingMap.get(a) ?? 99
    const rankB = rankingMap.get(b) ?? 99
    return rankA - rankB
  })
}

/**
 * Get pilot rank from heat results (Story 4.4 - Task 1)
 *
 * @param pilotId - Pilot ID to get rank for
 * @param heat - Heat object with results
 * @returns Pilot rank (1-4) or undefined if not ranked
 */
export function getPilotRank(
  pilotId: string,
  heat: { results?: { rankings: Ranking[] } }
): number | undefined {
  if (!heat.results || !heat.results.rankings) {
    return undefined
  }
  const ranking = heat.results.rankings.find(r => r.pilotId === pilotId)
  return ranking?.rank
}

/**
 * Get consistent border styling for heat cards based on status
 *
 * @param status - Heat status ('pending' | 'active' | 'completed')
 * @param isRecommended - Optional flag for recommended heat highlight (Story 9-2)
 * @returns Tailwind classes for border and shadow
 */
export function getHeatBorderClasses(status: string, isRecommended?: boolean): string {
  if (isRecommended && status === 'pending') {
    return 'border-neon-cyan shadow-glow-cyan animate-pulse'
  }
  if (status === 'active') {
    return 'border-neon-cyan shadow-glow-cyan'
  }
  if (status === 'completed') {
    return 'border-winner-green shadow-glow-green'
  }
  return 'border-steel'
}
