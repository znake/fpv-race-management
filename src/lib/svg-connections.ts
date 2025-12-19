import type { BracketStructure, BracketHeat } from './bracket-calculator'

export interface SvgPath {
  id: string
  d: string
  stroke: string
  strokeWidth: number
  type: 'winner' | 'loser' | 'finale'
  from: string
  to: string
}

export function calculateSvgPaths(bracketStructure: BracketStructure): SvgPath[] {
  const paths: SvgPath[] = []

  // Generate winner bracket paths
  bracketStructure.winnerRounds.forEach(round => {
    round.heats.forEach(heat => {
      if (heat.targetHeat) {
        const targetHeat = findHeatById(bracketStructure, heat.targetHeat)
        if (targetHeat) {
          paths.push(createSvgPath(heat, targetHeat, 'winner'))
        }
      }
    })
  })

  // Generate loser bracket paths
  bracketStructure.loserRounds.forEach(round => {
    round.heats.forEach(heat => {
      if (heat.targetHeat) {
        const targetHeat = findHeatById(bracketStructure, heat.targetHeat)
        if (targetHeat) {
          paths.push(createSvgPath(heat, targetHeat, 'loser'))
        }
      }
    })
  })

  // Generate finale paths
  if (bracketStructure.finale) {
    bracketStructure.finale.heats.forEach(heat => {
      if (heat.sourceHeats) {
        heat.sourceHeats.forEach(sourceHeatId => {
          const sourceHeat = findHeatById(bracketStructure, sourceHeatId)
          if (sourceHeat) {
            paths.push(createSvgPath(sourceHeat, heat, 'finale'))
          }
        })
      }
    })
  }

  return paths
}

function findHeatById(bracketStructure: BracketStructure, heatId: string): BracketHeat | undefined {
  // Search in winner rounds
  for (const round of bracketStructure.winnerRounds) {
    const heat = round.heats.find(h => h.heatId === heatId)
    if (heat) return heat
  }

  // Search in loser rounds
  for (const round of bracketStructure.loserRounds) {
    const heat = round.heats.find(h => h.heatId === heatId)
    if (heat) return heat
  }

  // Search in finale
  if (bracketStructure.finale) {
    const heat = bracketStructure.finale.heats.find(h => h.heatId === heatId)
    if (heat) return heat
  }

  return undefined
}

function createSvgPath(fromHeat: BracketHeat, toHeat: BracketHeat, type: 'winner' | 'loser' | 'finale'): SvgPath {
  const fromX = fromHeat.position.x
  const fromY = fromHeat.position.y
  const toX = toHeat.position.x
  const toY = toHeat.position.y

  // Calculate control points for curved paths
  const midX = (fromX + toX) / 2
  const controlX = midX + 20 // Slight curve
  
  // Create SVG path string (curved line)
  const d = `M ${fromX} ${fromY} Q ${controlX} ${fromY}, ${midX} ${(fromY + toY) / 2} T ${toX} ${toY}`

  const colorMap = {
    winner: 'var(--winner-green)',
    loser: 'var(--loser-red)',
    finale: 'var(--gold)'
  }

  return {
    id: `path-${fromHeat.heatId}-to-${toHeat.heatId}`,
    d,
    stroke: colorMap[type],
    strokeWidth: 2,
    type,
    from: fromHeat.heatId,
    to: toHeat.heatId
  }
}

// Note: The React component BracketConnections is implemented in bracket-tree.tsx
// to avoid JSX in this utility file