/**
 * Bracket Logic - Double Elimination Bracket Management
 * 
 * Pure functions for bracket operations (no React hooks).
 * 
 * Responsibilities:
 * - Synchronize heats[] with fullBracketStructure
 * - Calculate pilot progression (Winner/Loser Bracket)
 * - Generate next round heats when current round complete
 * - Rollback bracket state for heat corrections
 * 
 * Story 4-2 Tasks 7-12 (Course Correction 2025-12-17)
 */

import type { Heat } from '../stores/tournamentStore'
import type { 
  FullBracketStructure, 
  BracketHeat,
  BracketHeatStatus 
} from './bracket-structure-generator'

/**
 * Sync quali heats from heats[] to fullBracketStructure.qualification
 * Called during confirmTournamentStart after heats are generated
 */
export function syncQualiHeatsToStructure(
  heats: Heat[],
  bracketStructure: FullBracketStructure
): FullBracketStructure {
  // Clone structure to avoid mutation
  const updated = structuredClone(bracketStructure)
  
  // Map heats[] to qualification heats in bracket structure
  heats.forEach((heat, idx) => {
    if (idx < updated.qualification.heats.length) {
      const bracketHeat = updated.qualification.heats[idx]
      
      // Sync pilot IDs
      bracketHeat.pilotIds = [...heat.pilotIds]
      
      // Sync status
      bracketHeat.status = mapHeatStatus(heat.status)
      
      // Store reference to actual heat ID for later lookup
      bracketHeat.id = heat.id
    }
  })
  
  return updated
}

/**
 * Rollback bracket structure when a heat is reopened for editing
 * - Removes pilots from WB/LB that came from this heat
 * - Resets quali heat status to 'active'
 * - Used by reopenHeat() to prepare for re-submission
 */
export function rollbackBracketForHeat(
  heatId: string,
  bracketStructure: FullBracketStructure
): FullBracketStructure {
  const updated = structuredClone(bracketStructure)
  
  // Find the heat in qualification
  const qualiHeatIdx = updated.qualification.heats.findIndex(h => h.id === heatId)
  
  if (qualiHeatIdx !== -1) {
    const qualiHeat = updated.qualification.heats[qualiHeatIdx]
    
    // Get all pilotIds from this quali heat
    const pilotsToRemove = new Set(qualiHeat.pilotIds)
    
    // Remove these pilots from winner bracket target heat
    if (qualiHeat.targetWinnerHeat) {
      const wbHeat = findBracketHeatById(updated, qualiHeat.targetWinnerHeat)
      if (wbHeat) {
        wbHeat.pilotIds = wbHeat.pilotIds.filter(id => !pilotsToRemove.has(id))
        // Reset status if now empty or not full
        if (wbHeat.pilotIds.length < 4) {
          wbHeat.status = 'empty'
        }
      }
    }
    
    // Remove these pilots from loser bracket target heat
    if (qualiHeat.targetLoserHeat) {
      const lbHeat = findBracketHeatById(updated, qualiHeat.targetLoserHeat)
      if (lbHeat) {
        lbHeat.pilotIds = lbHeat.pilotIds.filter(id => !pilotsToRemove.has(id))
        // Reset status if now empty or not full
        if (lbHeat.pilotIds.length < 4) {
          lbHeat.status = 'empty'
        }
      }
    }
    
    // Reset quali heat status to active
    updated.qualification.heats[qualiHeatIdx].status = 'active'
  }
  
  return updated
}

/**
 * Update bracket structure after a heat is completed
 * - Updates quali heat status
 * - Assigns pilots to WB/LB based on rankings
 * - Checks if round is complete for next phase generation
 * 
 * NOTE: For re-submissions, call rollbackBracketForHeat() first to avoid duplicates
 */
export function updateBracketAfterHeatCompletion(
  heatId: string,
  rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[],
  bracketStructure: FullBracketStructure,
  isResubmission: boolean = false
): FullBracketStructure {
  // If this is a resubmission, first rollback previous assignments
  let updated = isResubmission 
    ? rollbackBracketForHeat(heatId, bracketStructure)
    : structuredClone(bracketStructure)
  
  // Find the completed heat in qualification
  const qualiHeatIdx = updated.qualification.heats.findIndex(h => h.id === heatId)
  
  if (qualiHeatIdx !== -1) {
    // Update quali heat status
    updated.qualification.heats[qualiHeatIdx].status = 'completed'
    
    // Get target heats for winner and loser bracket
    const qualiHeat = updated.qualification.heats[qualiHeatIdx]
    
    // Find winners (rank 1+2) and losers (rank 3+4)
    const winners = rankings.filter(r => r.rank === 1 || r.rank === 2).map(r => r.pilotId)
    const losers = rankings.filter(r => r.rank === 3 || r.rank === 4).map(r => r.pilotId)
    
    // Assign winners to winner bracket
    if (qualiHeat.targetWinnerHeat) {
      const wbHeat = findBracketHeatById(updated, qualiHeat.targetWinnerHeat)
      if (wbHeat) {
        wbHeat.pilotIds.push(...winners)
        
        // If heat is full (4 pilots), set to pending
        if (wbHeat.pilotIds.length >= 4) {
          wbHeat.status = 'pending'
        }
      }
    }
    
    // Assign losers to loser bracket
    if (qualiHeat.targetLoserHeat) {
      const lbHeat = findBracketHeatById(updated, qualiHeat.targetLoserHeat)
      if (lbHeat) {
        lbHeat.pilotIds.push(...losers)
        
        // If heat is full (4 pilots), set to pending
        if (lbHeat.pilotIds.length >= 4) {
          lbHeat.status = 'pending'
        }
      }
    }
  }
  
  return updated
}

/**
 * Check if all qualification heats are completed
 */
export function areAllQualiHeatsCompleted(bracketStructure: FullBracketStructure): boolean {
  return bracketStructure.qualification.heats.every(h => h.status === 'completed')
}

/**
 * Generate playable heats for the next bracket round
 * Called when all quali heats are completed
 * Returns new Heat[] entries to add to the store
 */
export function generateNextRoundHeats(
  bracketStructure: FullBracketStructure,
  existingHeats: Heat[]
): Heat[] {
  const newHeats: Heat[] = []
  let heatNumber = existingHeats.length + 1
  
  // Generate WB Round 1 heats
  if (bracketStructure.winnerBracket.rounds.length > 0) {
    const wbRound1 = bracketStructure.winnerBracket.rounds[0]
    
    for (const bracketHeat of wbRound1.heats) {
      // Only create heat if it has pilots assigned
      if (bracketHeat.pilotIds.length > 0 && bracketHeat.status === 'pending') {
        newHeats.push({
          id: bracketHeat.id,
          heatNumber: heatNumber++,
          pilotIds: [...bracketHeat.pilotIds],
          status: newHeats.length === 0 ? 'active' : 'pending', // First one is active
        })
      }
    }
  }
  
  // Generate LB Round 1 heats
  if (bracketStructure.loserBracket.rounds.length > 0) {
    const lbRound1 = bracketStructure.loserBracket.rounds[0]
    
    for (const bracketHeat of lbRound1.heats) {
      if (bracketHeat.pilotIds.length > 0 && bracketHeat.status === 'pending') {
        newHeats.push({
          id: bracketHeat.id,
          heatNumber: heatNumber++,
          pilotIds: [...bracketHeat.pilotIds],
          status: newHeats.length === 0 ? 'active' : 'pending',
        })
      }
    }
  }
  
  return newHeats
}

/**
 * Map Heat status to BracketHeatStatus
 */
function mapHeatStatus(status: Heat['status']): BracketHeatStatus {
  switch (status) {
    case 'active': return 'active'
    case 'completed': return 'completed'
    case 'pending': return 'pending'
    default: return 'empty'
  }
}

/**
 * Find a bracket heat by ID across all sections
 */
function findBracketHeatById(
  structure: FullBracketStructure, 
  heatId: string
): BracketHeat | undefined {
  // Check quali heats
  const qualiHeat = structure.qualification.heats.find(h => h.id === heatId)
  if (qualiHeat) return qualiHeat
  
  // Check winner bracket rounds
  for (const round of structure.winnerBracket.rounds) {
    const wbHeat = round.heats.find(h => h.id === heatId)
    if (wbHeat) return wbHeat
  }
  
  // Check loser bracket rounds
  for (const round of structure.loserBracket.rounds) {
    const lbHeat = round.heats.find(h => h.id === heatId)
    if (lbHeat) return lbHeat
  }
  
  // Check grand finale
  if (structure.grandFinale?.id === heatId) {
    return structure.grandFinale
  }
  
  return undefined
}
