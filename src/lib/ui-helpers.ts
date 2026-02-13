import type { Ranking } from './schemas'

/**
 * Inline SVG data URL for offline-first fallback pilot image (Trollface)
 * No external dependencies - works completely offline
 */
export const FALLBACK_PILOT_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180">
  <rect width="200" height="180" fill="#ffffff"/>
  <!-- Head outline -->
  <ellipse cx="100" cy="90" rx="80" ry="70" fill="#ffffff" stroke="#000000" stroke-width="3"/>
  <!-- Left eye -->
  <ellipse cx="65" cy="70" rx="18" ry="12" fill="#ffffff" stroke="#000000" stroke-width="2"/>
  <circle cx="70" cy="70" r="5" fill="#000000"/>
  <!-- Right eye (raised eyebrow look) -->
  <ellipse cx="135" cy="65" rx="18" ry="12" fill="#ffffff" stroke="#000000" stroke-width="2"/>
  <circle cx="140" cy="65" r="5" fill="#000000"/>
  <!-- Raised eyebrow -->
  <path d="M115 45 Q135 35, 160 50" fill="none" stroke="#000000" stroke-width="3"/>
  <!-- Nose -->
  <path d="M100 75 L95 95 L105 95" fill="none" stroke="#000000" stroke-width="2"/>
  <!-- Trollface grin -->
  <path d="M45 105 Q55 145, 100 150 Q145 145, 160 110" fill="#ffffff" stroke="#000000" stroke-width="3"/>
  <path d="M55 115 L60 125 L70 115 L80 125 L90 115 L100 125 L110 115 L120 125 L130 115 L140 125 L145 115" fill="none" stroke="#000000" stroke-width="2"/>
  <!-- Chin wrinkles -->
  <path d="M70 140 Q100 155, 130 140" fill="none" stroke="#000000" stroke-width="1"/>
</svg>
`)}`

/**
 * Get consistent rank badge styling for placements
 *
 * Color scheme:
 * - 1st place: Gold
 * - 2nd place: Silver
 * - 3rd place: Bronze
 * - 4th place: Dark Red
 */
export function getRankBadgeClasses(rank: number): string {
  if (rank === 1) return 'bg-gold text-void shadow-glow-gold'
  if (rank === 2) return 'bg-silver text-void shadow-glow-silver'
  if (rank === 3) return 'bg-bronze text-void shadow-glow-bronze'
  return 'bg-rank-4 text-void shadow-glow-rank-4' // rank 4+
}

/**
 * Get consistent border styling for ranked cards
 */
export function getRankBorderClasses(rank: number): string {
  if (rank === 1) return 'border-gold shadow-glow-gold'
  if (rank === 2) return 'border-silver shadow-glow-silver'
  if (rank === 3) return 'border-bronze shadow-glow-bronze'
  return 'border-rank-4 shadow-glow-rank-4' // rank 4+
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
    return 'heat-live-border shadow-glow-orange'
  }
  if (status === 'completed') {
    return 'border-winner-green shadow-glow-green'
  }
  return 'border-steel'
}

/**
 * Story 11-3: Get CSS class for pilot row based on placement in completed heat
 * 
 * Color coding:
 * - 'top': Green background/border for Weiterkommer
 * - 'bottom': Red background/border for Eliminiert
 * - 'champ': Gold background/border for rank 1 in Grand Finale (Champion)
 * 
 * Rules:
 * - Qualification & Regular Heats: Rank 1+2 = green, Rank 3+4 = red
 * - WB/LB Finale (isFinale=true): Nur Rank 1 = green (geht ins Grand Finale), Rank 2 = rot
 * - Grand Finale: Rank 1 = gold (Champion), Rank 2 = silver (kein rot)
 * 
 * @param rank - Pilot's rank in the heat (1-4)
 * @param heatStatus - Current heat status
 * @param isGrandFinale - Whether this is the grand finale
 * @param isFinale - Whether this is a WB or LB finale (only rank 1 advances)
 * @returns CSS class name ('top', 'bottom', 'champ', or '')
 */
export function getPilotRowClass(
  rank: number,
  heatStatus: string,
  isGrandFinale: boolean,
  isFinale?: boolean
): string {
  // Only apply color coding for completed heats
  if (heatStatus !== 'completed') return ''
  
  // Grand Finale: Champion (rank 1) gets gold, rank 2 gets no special color (silver podium)
  if (isGrandFinale) {
    if (rank === 1) return 'champ'
    return '' // Kein rot für Platz 2 im Grand Finale
  }
  
  // WB Finale / LB Finale: Nur Platz 1 geht ins Grand Finale weiter
  if (isFinale) {
    if (rank === 1) return 'top'
    return 'bottom' // Platz 2+ ist raus (wird automatisch Platz 3 bzw 4)
  }
  
  // Regular heats (Quali, WB, LB): Rank 1+2 weiter, 3+4 raus
  if (rank <= 2) return 'top'
  return 'bottom'
}

/**
 * Format milliseconds as M:SS or M:SS.th lap time string
 * @param ms - Time in milliseconds
 * @returns Formatted string like "0:45", "1:23", "1:23.4", or "1:23.45"
 */
export function formatLapTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const remainderMs = ms % 1000

  const base = `${minutes}:${seconds.toString().padStart(2, '0')}`

  if (remainderMs === 0) {
    return base
  }

  const hundredths = Math.floor(remainderMs / 10)
  if (hundredths % 10 === 0) {
    return `${base}.${Math.floor(hundredths / 10)}`
  }
  return `${base}.${hundredths.toString().padStart(2, '0')}`
}

/**
 * Format partial digit input as M:SS.th preview for time entry overlay.
 * Always MSS format: "0" → "0:__", "04" → "0:4_", "045" → "0:45", "0456" → "0:45.6", "04567" → "0:45.67"
 */
export function formatPartialTimeEntry(digits: string): string {
  if (!digits) return ''
  
  const truncated = digits.slice(0, 5)
  
  if (truncated.length === 1) {
    return `${truncated}:__`
  } else if (truncated.length === 2) {
    return `${truncated[0]}:${truncated[1]}_`
  } else if (truncated.length === 3) {
    return `${truncated[0]}:${truncated.slice(1)}`
  } else if (truncated.length === 4) {
    return `${truncated[0]}:${truncated.slice(1, 3)}.${truncated[3]}`
  } else {
    return `${truncated[0]}:${truncated.slice(1, 3)}.${truncated.slice(3, 5)}`
  }
}

/**
 * Parse digit string (MSS, MSSt, MSSTh) to milliseconds.
 * Always expects M as first digit, SS as next two, then optional t (tenth) and h (hundredth).
 * Examples: "045" → 45000, "123" → 83000, "1234" → 83400, "12345" → 83450
 * @returns Milliseconds or null if invalid/out of range (20s – 9:59.99)
 */
export function parseLapTimeDigits(digits: string): number | null {
  if (!/^\d{3,5}$/.test(digits)) {
    return null
  }

  const minutes = parseInt(digits[0], 10)
  const seconds = parseInt(digits.slice(1, 3), 10)
  let fractionalMs = 0

  if (digits.length === 4) {
    fractionalMs = parseInt(digits[3], 10) * 100
  } else if (digits.length === 5) {
    fractionalMs = parseInt(digits.slice(3, 5), 10) * 10
  }

  if (seconds > 59) {
    return null
  }

  const ms = (minutes * 60 + seconds) * 1000 + fractionalMs

  if (ms < 20000 || ms > 599990) {
    return null
  }

  return ms
}
