/**
 * @deprecated This module is deprecated. Use bracket-structure-generator.ts instead.
 * Kept for backward compatibility with svg-connections.ts and existing tests.
 * Will be removed in a future version when SVG connections are refactored.
 */

import type { Heat } from '../stores/tournamentStore'

// Bracket-Runde Definition
export interface BracketRound {
  id: string
  roundNumber: number
  bracketType: 'winner' | 'loser' | 'finale'
  heats: BracketHeat[]
}

export interface BracketHeat {
  heatId: string
  position: { x: number; y: number }
  sourceHeats?: string[]
  targetHeat?: string
}

export interface BracketStructure {
  winnerRounds: BracketRound[]
  loserRounds: BracketRound[]
  finale?: BracketRound
}

export function calculateBracketStructure(heats: Heat[]): BracketStructure {
  const winnerRounds: BracketRound[] = []
  const loserRounds: BracketRound[] = []
  
  // If no heats exist, return empty structure
  if (heats.length === 0) {
    return { winnerRounds, loserRounds }
  }
  
  // All heats are shown in the initial winner bracket round (Round 1)
  // This ensures the bracket is visible from the beginning
  const initialRound: BracketRound = {
    id: 'winner-round-1',
    roundNumber: 1,
    bracketType: 'winner',
    heats: heats.map((heat, index) => ({
      heatId: heat.id,
      position: { x: 0, y: index * 120 + 50 },
      sourceHeats: heat.pilotIds,
      targetHeat: 'winner-semi-final'
    }))
  }
  winnerRounds.push(initialRound)
  
  // Get completed heats for bracket progression
  const completedHeats = heats.filter(h => h.status === 'completed' && h.results)
  
  // Calculate loser bracket from heat results
  const loserPilots = new Set<string>()
  completedHeats.forEach(heat => {
    if (heat.results) {
      heat.results.rankings.forEach(ranking => {
        if (ranking.rank === 3 || ranking.rank === 4) {
          loserPilots.add(ranking.pilotId)
        }
      })
    }
  })
  
  // Create loser bracket rounds if there are loser pilots
  if (loserPilots.size > 0) {
    // Use actual heat IDs (not with suffix) so they can be found
    const loserBracketHeats = completedHeats.filter(heat => 
      heat.results?.rankings.some(r => loserPilots.has(r.pilotId))
    )
    
    const loserRound: BracketRound = {
      id: 'loser-round-1',
      roundNumber: 1,
      bracketType: 'loser',
      heats: loserBracketHeats.map((heat, index) => ({
        heatId: heat.id, // Use original heat ID, not with '-loser' suffix
        position: { x: 300, y: index * 120 + 50 },
        sourceHeats: Array.from(loserPilots).filter(pilotId => 
          heat.pilotIds.includes(pilotId)
        )
      }))
    }
    loserRounds.push(loserRound)
  }
  
  // Create finale if we have enough completed heats
  const winnerPilots = new Set<string>()
  completedHeats.forEach(heat => {
    if (heat.results) {
      heat.results.rankings.forEach(ranking => {
        if (ranking.rank === 1 || ranking.rank === 2) {
          winnerPilots.add(ranking.pilotId)
        }
      })
    }
  })
  
  if (winnerPilots.size >= 2) {
    const finale: BracketRound = {
      id: 'finale',
      roundNumber: 99,
      bracketType: 'finale',
      heats: [{
        heatId: 'grand-finale',
        position: { x: 500, y: 200 },
        sourceHeats: Array.from(winnerPilots).slice(0, 2)
      }]
    }
    
    return {
      winnerRounds,
      loserRounds,
      finale
    }
  }
  
  return {
    winnerRounds,
    loserRounds
  }
}
