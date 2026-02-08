import type { Heat } from '@/types/tournament'

export interface PathSegment {
  fromHeatId: string
  toHeatId: string
  isElimination: boolean
  pilotId: string
  showMarker: boolean  // false for pending/active heats (no arrow/X)
}

export const SYNTHWAVE_COLORS = [
  '#ff2a6d',
  '#05d9e8',
  '#d300c5',
  '#f9c80e',
  '#39ff14',
  '#ff6b00',
  '#c0c0c0',
] as const

export function isEliminatedInHeat(pilotId: string, heat: Heat): boolean {
  if (heat.bracketType !== 'loser' || !heat.results) {
    return false
  }

  const ranking = heat.results.rankings.find(r => r.pilotId === pilotId)
  if (!ranking) {
    return false
  }

  return ranking.rank === 3 || ranking.rank === 4
}

export function assignPilotColor(pilotId: string, allPilotIds: string[]): string {
  const index = allPilotIds.indexOf(pilotId)
  if (index === -1) {
    return SYNTHWAVE_COLORS[0]
  }
  return SYNTHWAVE_COLORS[index % SYNTHWAVE_COLORS.length]
}

export function calculatePilotPath(pilotId: string, heats: Heat[]): PathSegment[] {
  const pilotHeats = heats
    .filter(heat => heat.pilotIds.includes(pilotId))
    .sort((a, b) => a.heatNumber - b.heatNumber)

  if (pilotHeats.length < 2) {
    return []
  }

  const segments: PathSegment[] = []

  for (let i = 0; i < pilotHeats.length - 1; i++) {
    const fromHeat = pilotHeats[i]
    const toHeat = pilotHeats[i + 1]
    
    const toHeatCompleted = toHeat.status === 'completed'
    const isLastSegment = i === pilotHeats.length - 2
    const isElimination = toHeatCompleted && isLastSegment && isEliminatedInHeat(pilotId, toHeat)

    segments.push({
      fromHeatId: fromHeat.id,
      toHeatId: toHeat.id,
      isElimination,
      pilotId,
      showMarker: toHeatCompleted
    })
  }

  return segments
}
