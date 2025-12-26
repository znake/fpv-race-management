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
 * - Handle WB/LB heat completion with cross-bracket progression
 * - Detect and generate Grand Finale
 * 
 * Story 4-2 Tasks 7-18 (Course Corrections 2025-12-17, 2025-12-19)
 */

import type { Heat } from '../stores/tournamentStore'
import type { 
  FullBracketStructure, 
  BracketHeat,
  BracketHeatStatus,
  BracketType
} from './bracket-structure-generator'

/**
 * Result of finding a bracket heat - includes context about its location
 */
export interface BracketHeatLocation {
  heat: BracketHeat
  bracketType: BracketType
  roundNumber: number
  roundIndex: number  // Index in the rounds array
  heatIndex: number   // Index in the round's heats array
}

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
        
        // Set to pending if heat has enough pilots (2+ for smaller brackets)
        // Heat will be playable when all source heats have contributed
        if (wbHeat.pilotIds.length >= 2) {
          wbHeat.status = 'pending'
        }
      }
    }
    
    // Assign losers to loser bracket
    if (qualiHeat.targetLoserHeat) {
      const lbHeat = findBracketHeatById(updated, qualiHeat.targetLoserHeat)
      if (lbHeat) {
        lbHeat.pilotIds.push(...losers)
        
        // Set to pending if heat has enough pilots (2+ is playable)
        // Note: 3-pilot quali heats only produce 1 loser, so LB heats may have <4 pilots
        if (lbHeat.pilotIds.length >= 2) {
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
 * Task 14: Check if all heats in a specific round are completed
 * 
 * @param bracketStructure - The full bracket structure
 * @param roundNumber - The round number to check
 * @param bracketType - 'winner' or 'loser'
 * @returns true if all heats in the round are completed
 */
export function areAllHeatsInRoundCompleted(
  bracketStructure: FullBracketStructure,
  roundNumber: number,
  bracketType: 'winner' | 'loser'
): boolean {
  const rounds = bracketType === 'winner' 
    ? bracketStructure.winnerBracket.rounds 
    : bracketStructure.loserBracket.rounds
  
  // Find the round by roundNumber
  const round = rounds.find(r => r.roundNumber === roundNumber)
  
  if (!round) {
    // Round doesn't exist - consider it "complete" (no heats to play)
    return true
  }
  
  // Check if all heats in this round are completed
  // Only check heats that have pilots assigned (not empty placeholders)
  const heatsWithPilots = round.heats.filter(h => h.pilotIds.length > 0)
  
  if (heatsWithPilots.length === 0) {
    // No heats with pilots yet - not complete
    return false
  }
  
  return heatsWithPilots.every(h => h.status === 'completed')
}

/**
 * Generate playable heats for the next bracket round
 * Called when all quali heats are completed
 * Returns new Heat[] entries to add to the store
 * 
 * NOTE: This is the legacy function for post-quali generation.
 * For subsequent rounds, use generateHeatsForNextRound()
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
 * Task 15: Generic function to generate heats for the next round
 * Works for ANY bracket round, not just post-quali
 * 
 * @param bracketStructure - The full bracket structure
 * @param completedRoundNumber - The round number that was just completed
 * @param bracketType - 'winner' or 'loser'
 * @param existingHeats - Current heats array (for heat numbering)
 * @returns New Heat[] entries to add to the store
 */
export function generateHeatsForNextRound(
  bracketStructure: FullBracketStructure,
  completedRoundNumber: number,
  bracketType: 'winner' | 'loser',
  existingHeats: Heat[]
): Heat[] {
  const newHeats: Heat[] = []
  let heatNumber = existingHeats.length + 1
  
  const rounds = bracketType === 'winner'
    ? bracketStructure.winnerBracket.rounds
    : bracketStructure.loserBracket.rounds
  
  // Find the index of the completed round
  const completedRoundIndex = rounds.findIndex(r => r.roundNumber === completedRoundNumber)
  
  if (completedRoundIndex === -1) {
    return newHeats // Round not found
  }
  
  // Get the next round (if exists)
  const nextRoundIndex = completedRoundIndex + 1
  if (nextRoundIndex >= rounds.length) {
    // No more rounds in this bracket - might be finale time
    return newHeats
  }
  
  const nextRound = rounds[nextRoundIndex]
  
  // Generate playable heats for the next round
  for (const bracketHeat of nextRound.heats) {
    // Only create heat if it has enough pilots and is pending
    if (bracketHeat.pilotIds.length >= 2 && bracketHeat.status === 'pending') {
      // Check if this heat already exists in heats[]
      const alreadyExists = existingHeats.some(h => h.id === bracketHeat.id)
      if (!alreadyExists) {
        newHeats.push({
          id: bracketHeat.id,
          heatNumber: heatNumber++,
          pilotIds: [...bracketHeat.pilotIds],
          status: 'pending',
        })
      }
    }
  }
  
  // Activate the first new heat if any were created
  if (newHeats.length > 0) {
    newHeats[0].status = 'active'
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
 * Task 17: Check if Grand Finale is ready
 * 
 * Grand Finale is ready when:
 * 1. WB Finale is completed (last round in WB)
 * 2. LB Finale is completed (last round in LB)
 * 3. Grand Finale heat has at least 2 pilots assigned
 * 
 * @returns true if Grand Finale can be played
 */
export function isGrandFinaleReady(bracketStructure: FullBracketStructure): boolean {
  // Check if WB Finale is completed
  const wbRounds = bracketStructure.winnerBracket.rounds
  if (wbRounds.length === 0) return false
  
  const wbFinaleRound = wbRounds[wbRounds.length - 1]
  // Only check heats that have pilots assigned (not empty placeholders)
  const activeWBFinaleHeats = wbFinaleRound.heats.filter(h => h.pilotIds.length > 0)
  
  // If no heats have pilots yet, WB Finale is not ready
  if (activeWBFinaleHeats.length === 0) return false
  
  const wbFinaleCompleted = activeWBFinaleHeats.every(h => h.status === 'completed')
  if (!wbFinaleCompleted) return false
  
  // Check if LB Finale is completed
  const lbRounds = bracketStructure.loserBracket.rounds
  if (lbRounds.length === 0) return false
  
  const lbFinaleRound = lbRounds[lbRounds.length - 1]
  // Only check heats that have pilots assigned (not empty placeholders)
  const activeLBFinaleHeats = lbFinaleRound.heats.filter(h => h.pilotIds.length > 0)
  
  // If no heats have pilots yet, LB Finale is not ready
  if (activeLBFinaleHeats.length === 0) return false
  
  const lbFinaleCompleted = activeLBFinaleHeats.every(h => h.status === 'completed')
  if (!lbFinaleCompleted) return false
  
  // Check if Grand Finale has pilots
  if (!bracketStructure.grandFinale) return false
  
  return bracketStructure.grandFinale.pilotIds.length >= 2 &&
         bracketStructure.grandFinale.status === 'pending'
}

/**
 * Generate Grand Finale heat for the playable heats array
 * 
 * Story 10-3: Konsolidierte Grand-Finale-Generierung
 * Diese Funktion ist die kanonische Implementierung für Grand-Finale-Generierung.
 * Sie wird sowohl von submitHeatResults() als auch von generateGrandFinale() im Store verwendet.
 * 
 * @param bracketStructure - The full bracket structure (can be null)
 * @param existingHeats - Current heats array
 * @param requireReadyCheck - If true, requires isGrandFinaleReady() check (default: false for backward compatibility)
 * @returns The Grand Finale Heat or null if not ready/already exists
 */
export function generateGrandFinaleHeat(
  bracketStructure: FullBracketStructure | null,
  existingHeats: Heat[],
  requireReadyCheck: boolean = false
): Heat | null {
  if (!bracketStructure?.grandFinale) return null
  
  // If requireReadyCheck is true (called from submitHeatResults), verify WB/LB finale are complete
  if (requireReadyCheck && !isGrandFinaleReady(bracketStructure)) return null
  
  // Check if already generated (both ID-based and bracketType-based for compatibility)
  const alreadyExists = existingHeats.some(h => 
    h.id === bracketStructure.grandFinale!.id ||
    h.bracketType === 'grand_finale' ||
    h.bracketType === 'finale'
  )
  if (alreadyExists) return null
  
  // Verify we have both pilots
  const wbWinnerId = bracketStructure.grandFinale.pilotIds[0]
  const lbWinnerId = bracketStructure.grandFinale.pilotIds[1]
  if (!wbWinnerId || !lbWinnerId) return null
  
  return {
    id: bracketStructure.grandFinale.id,
    heatNumber: existingHeats.length + 1,
    pilotIds: [...bracketStructure.grandFinale.pilotIds],
    status: 'active',
    bracketType: 'grand_finale',
    isFinale: true,
    roundName: 'Grand Finale'
  }
}

/**
 * Find a bracket heat by ID across all sections (simple version)
 */
function findBracketHeatById(
  structure: FullBracketStructure, 
  heatId: string
): BracketHeat | undefined {
  const location = findBracketHeatWithLocation(structure, heatId)
  return location?.heat
}

/**
 * Find a bracket heat by ID with full location context
 * Returns the heat along with its bracket type, round, and indices
 */
export function findBracketHeatWithLocation(
  structure: FullBracketStructure,
  heatId: string
): BracketHeatLocation | undefined {
  // Check quali heats
  const qualiIdx = structure.qualification.heats.findIndex(h => h.id === heatId)
  if (qualiIdx !== -1) {
    return {
      heat: structure.qualification.heats[qualiIdx],
      bracketType: 'qualification',
      roundNumber: 1,
      roundIndex: 0,
      heatIndex: qualiIdx
    }
  }
  
  // Check winner bracket rounds
  for (let roundIdx = 0; roundIdx < structure.winnerBracket.rounds.length; roundIdx++) {
    const round = structure.winnerBracket.rounds[roundIdx]
    const heatIdx = round.heats.findIndex(h => h.id === heatId)
    if (heatIdx !== -1) {
      return {
        heat: round.heats[heatIdx],
        bracketType: 'winner',
        roundNumber: round.roundNumber,
        roundIndex: roundIdx,
        heatIndex: heatIdx
      }
    }
  }
  
  // Check loser bracket rounds
  for (let roundIdx = 0; roundIdx < structure.loserBracket.rounds.length; roundIdx++) {
    const round = structure.loserBracket.rounds[roundIdx]
    const heatIdx = round.heats.findIndex(h => h.id === heatId)
    if (heatIdx !== -1) {
      return {
        heat: round.heats[heatIdx],
        bracketType: 'loser',
        roundNumber: round.roundNumber,
        roundIndex: roundIdx,
        heatIndex: heatIdx
      }
    }
  }
  
  // Check grand finale
  if (structure.grandFinale?.id === heatId) {
    return {
      heat: structure.grandFinale,
      bracketType: 'finale',
      roundNumber: 99,
      roundIndex: 0,
      heatIndex: 0
    }
  }
  
  return undefined
}

/**
 * Update bracket after a Winner or Loser bracket heat is completed
 * - WB Winners (rank 1+2) → next WB round via targetHeat
 * - WB Losers (rank 3+4) → feed into LB via targetLoserFromWB
 * - LB Winners (rank 1+2) → next LB round via targetHeat
 * - LB Losers (rank 3+4) → eliminated
 * 
 * Returns: Updated structure AND list of eliminated pilot IDs
 */
export function updateBracketAfterWBLBHeatCompletion(
  heatId: string,
  rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[],
  bracketStructure: FullBracketStructure,
  isResubmission: boolean = false
): { structure: FullBracketStructure; eliminatedPilotIds: string[] } {
  // If resubmission, first rollback previous assignments
  let updated = isResubmission
    ? rollbackWBLBHeatAssignments(heatId, bracketStructure)
    : structuredClone(bracketStructure)
  
  const eliminatedPilotIds: string[] = []
  
  // Find the heat location
  const location = findBracketHeatWithLocation(updated, heatId)
  if (!location) {
    return { structure: updated, eliminatedPilotIds }
  }
  
  const { heat, bracketType, roundIndex } = location
  
  // Mark heat as completed
  heat.status = 'completed'
  
  // Get winners (rank 1+2) and losers (rank 3+4)
  const winners = rankings.filter(r => r.rank === 1 || r.rank === 2).map(r => r.pilotId)
  const losers = rankings.filter(r => r.rank === 3 || r.rank === 4).map(r => r.pilotId)
  
  if (bracketType === 'winner') {
    // WB Winners → next WB round (targetHeat)
    if (heat.targetHeat) {
      const targetWBHeat = findBracketHeatById(updated, heat.targetHeat)
      if (targetWBHeat) {
        targetWBHeat.pilotIds.push(...winners)
        // Set to pending if heat has at least 2 pilots (playable)
        if (targetWBHeat.pilotIds.length >= 2) {
          targetWBHeat.status = 'pending'
        }
      }
    } else {
      // No targetHeat means this is WB Finale
      // Winners go to Grand Finale
      if (updated.grandFinale) {
        updated.grandFinale.pilotIds.push(...winners)
        if (updated.grandFinale.pilotIds.length >= 2) {
          updated.grandFinale.status = 'pending'
        }
      }
    }
    
    // WB Losers → feed into LB (targetLoserFromWB)
    if (heat.targetLoserFromWB) {
      const targetLBHeat = findBracketHeatById(updated, heat.targetLoserFromWB)
      if (targetLBHeat) {
        targetLBHeat.pilotIds.push(...losers)
        // Set to pending if heat has at least 2 pilots (playable)
        if (targetLBHeat.pilotIds.length >= 2) {
          targetLBHeat.status = 'pending'
        }
      }
    } else {
      // Fallback: If no targetLoserFromWB, try to find appropriate LB heat
      // This happens for WB heats that feed into existing LB rounds
      const lbRoundIdx = Math.min(roundIndex, updated.loserBracket.rounds.length - 1)
      if (lbRoundIdx >= 0 && updated.loserBracket.rounds[lbRoundIdx]) {
        const lbRound = updated.loserBracket.rounds[lbRoundIdx]
        // Find first LB heat in this round that can accept pilots
        const availableLBHeat = lbRound.heats.find(h => h.pilotIds.length < 4)
        if (availableLBHeat) {
          availableLBHeat.pilotIds.push(...losers)
          // Set to pending if heat has at least 2 pilots (playable)
          if (availableLBHeat.pilotIds.length >= 2) {
            availableLBHeat.status = 'pending'
          }
        }
      }
    }
  } else if (bracketType === 'loser') {
    // LB Winners → next LB round (targetHeat)
    if (heat.targetHeat) {
      const targetLBHeat = findBracketHeatById(updated, heat.targetHeat)
      if (targetLBHeat) {
        targetLBHeat.pilotIds.push(...winners)
        // Set to pending if heat has at least 2 pilots (playable)
        if (targetLBHeat.pilotIds.length >= 2) {
          targetLBHeat.status = 'pending'
        }
      }
    } else {
      // No targetHeat means this is LB Finale
      // Winners go to Grand Finale
      if (updated.grandFinale) {
        updated.grandFinale.pilotIds.push(...winners)
        if (updated.grandFinale.pilotIds.length >= 2) {
          updated.grandFinale.status = 'pending'
        }
      }
    }
    
    // LB Losers → ELIMINATED (out of tournament)
    eliminatedPilotIds.push(...losers)
  }
  
  return { structure: updated, eliminatedPilotIds }
}

/**
 * Story 10-2: Check if there are pending/active WB heats
 * 
 * Pure function that checks if Winner Bracket has any heats that are not completed.
 * Used for:
 * - Determining loserPool threshold (4 vs 3 pilots)
 * - Pool visualization in bracket-tree.tsx
 * - Auto-generation of LB heats in submitHeatResults
 * 
 * @param bracketStructure - The full bracket structure (can be null)
 * @param heats - Array of actual heats from the store
 * @returns true if there are pending/active WB heats
 */
export function checkHasActiveWBHeats(
  bracketStructure: FullBracketStructure | null,
  heats: Heat[]
): boolean {
  if (!bracketStructure) return false
  
  for (const round of bracketStructure.winnerBracket.rounds) {
    for (const bracketHeat of round.heats) {
      // Find actual heat in heats[]
      const actualHeat = heats.find(h => h.id === bracketHeat.id)
      if (actualHeat) {
        if (actualHeat.status === 'pending' || actualHeat.status === 'active') {
          return true
        }
      } else {
        // Heat not in heats[] yet but has pilots → considered pending
        if (bracketHeat.pilotIds.length > 0 && bracketHeat.status !== 'completed') {
          return true
        }
      }
    }
  }
  
  return false
}

/**
 * Rollback WB/LB heat assignments when reopening for edit
 */
function rollbackWBLBHeatAssignments(
  heatId: string,
  bracketStructure: FullBracketStructure
): FullBracketStructure {
  const updated = structuredClone(bracketStructure)
  
  const location = findBracketHeatWithLocation(updated, heatId)
  if (!location) return updated
  
  const { heat, bracketType } = location
  const pilotsToRemove = new Set(heat.pilotIds)
  
  // Remove from target heats
  if (bracketType === 'winner') {
    // Remove winners from next WB heat
    if (heat.targetHeat) {
      const targetHeat = findBracketHeatById(updated, heat.targetHeat)
      if (targetHeat) {
        targetHeat.pilotIds = targetHeat.pilotIds.filter(id => !pilotsToRemove.has(id))
        if (targetHeat.pilotIds.length < 4) {
          targetHeat.status = 'empty'
        }
      }
    }
    
    // Remove losers from LB target
    if (heat.targetLoserFromWB) {
      const targetLBHeat = findBracketHeatById(updated, heat.targetLoserFromWB)
      if (targetLBHeat) {
        targetLBHeat.pilotIds = targetLBHeat.pilotIds.filter(id => !pilotsToRemove.has(id))
        if (targetLBHeat.pilotIds.length < 4) {
          targetLBHeat.status = 'empty'
        }
      }
    }
    
    // Also check Grand Finale
    if (updated.grandFinale) {
      updated.grandFinale.pilotIds = updated.grandFinale.pilotIds.filter(
        id => !pilotsToRemove.has(id)
      )
      if (updated.grandFinale.pilotIds.length < 2) {
        updated.grandFinale.status = 'empty'
      }
    }
  } else if (bracketType === 'loser') {
    // Remove winners from next LB heat
    if (heat.targetHeat) {
      const targetHeat = findBracketHeatById(updated, heat.targetHeat)
      if (targetHeat) {
        targetHeat.pilotIds = targetHeat.pilotIds.filter(id => !pilotsToRemove.has(id))
        if (targetHeat.pilotIds.length < 4) {
          targetHeat.status = 'empty'
        }
      }
    }
    
    // Also check Grand Finale
    if (updated.grandFinale) {
      updated.grandFinale.pilotIds = updated.grandFinale.pilotIds.filter(
        id => !pilotsToRemove.has(id)
      )
      if (updated.grandFinale.pilotIds.length < 2) {
        updated.grandFinale.status = 'empty'
      }
    }
  }
  
  // Reset heat status to active
  heat.status = 'active'

  return updated
}

// ============================================================================
// Story 10-1: Pool Helper Functions
// ============================================================================

/**
 * Creates a new Winner Bracket heat from the winner pool
 * Uses FIFO principle: takes first 4 pilots from pool
 *
 * @param winnerPool - Set of pilot IDs waiting in winner pool
 * @param currentHeats - Current heats to determine next heat number
 * @returns New heat and updated pool, or null if not enough pilots
 */
export function createWBHeatFromPool(
  winnerPool: Set<string>,
  currentHeats: Pick<Heat, 'heatNumber'>[]
): { heat: Omit<Heat, 'results'> | null; updatedPool: Set<string> } {
  if (winnerPool.size < 4) {
    return { heat: null, updatedPool: winnerPool }
  }

  // FIFO: Take first 4 pilots from pool
  const poolArray = Array.from(winnerPool)
  const pilotsForHeat = poolArray.slice(0, 4)

  // Create new pool without selected pilots
  const updatedPool = new Set(winnerPool)
  for (const pilotId of pilotsForHeat) {
    updatedPool.delete(pilotId)
  }

  // Create WB heat
  const wbHeat: Omit<Heat, 'results'> = {
    id: `wb-heat-${crypto.randomUUID()}`,
    heatNumber: currentHeats.length + 1,
    pilotIds: pilotsForHeat,
    status: 'pending',
    bracketType: 'winner'
  }

  return { heat: wbHeat, updatedPool }
}

/**
 * Creates a new Loser Bracket heat from the loser pool
 * Uses FIFO principle: takes first N pilots from pool (up to 4)
 *
 * @param loserPool - Set of pilot IDs waiting in loser pool
 * @param currentHeats - Current heats to determine next heat number
 * @param minPilots - Minimum pilots required (default: 4)
 * @returns New heat and updated pool, or null if not enough pilots
 */
export function createLBHeatFromPool(
  loserPool: Set<string>,
  currentHeats: Pick<Heat, 'heatNumber'>[],
  minPilots: number = 4
): { heat: Omit<Heat, 'results'> | null; updatedPool: Set<string> } {
  if (loserPool.size < minPilots) {
    return { heat: null, updatedPool: loserPool }
  }

  // FIFO: Take first N pilots from pool (up to 4)
  const poolArray = Array.from(loserPool)
  const heatSize = Math.min(4, poolArray.length)
  const pilotsForHeat = poolArray.slice(0, heatSize)

  // Create new pool without selected pilots
  const updatedPool = new Set(loserPool)
  for (const pilotId of pilotsForHeat) {
    updatedPool.delete(pilotId)
  }

  // Create LB heat
  const lbHeat: Omit<Heat, 'results'> = {
    id: `lb-heat-${crypto.randomUUID()}`,
    heatNumber: currentHeats.length + 1,
    pilotIds: pilotsForHeat,
    status: 'pending',
    bracketType: 'loser'
  }

  return { heat: lbHeat, updatedPool }
}
