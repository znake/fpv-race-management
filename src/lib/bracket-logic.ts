/**
 * Bracket Logic - Double Elimination Bracket Management
 *
 * Phase 4 REFACTORED: fullBracketStructure entfernt.
 * Diese Datei enthält nur noch Funktionen, die mit heats[] arbeiten.
 *
 * Verantwortlichkeiten:
 * - Pilot-Bracket-Origin bestimmen (WB vs LB)
 * - Pool-basierte Heat-Generierung Helper
 * - Bracket-Type-Inferenz aus Heat-IDs
 * - WinnerPool-Berechnung
 */

import type { Heat } from '@/types'
import { HEAT_ID_PREFIXES } from './bracket-constants'
import { optimizePilotOrder } from './channel-assignment'
import type { Pilot } from './schemas'

// ============================================================================
// Story 1.6: Bracket Type Inference
// ============================================================================

/**
 * Infers the bracket type from a heat's ID or explicit bracketType
 *
 * Story 1.6: Extrahiert aus submitHeatResults (Zeilen 522-542)
 *
 * Priority order for ID matching:
 * 1. Explicit bracketType on heat
 * 2. Specific finale prefixes (wb-finale-, lb-finale-)
 * 3. Specific heat prefixes (wb-heat-, lb-heat-)
 * 4. Grand finale patterns
 * 5. Generic bracket prefixes (wb-, lb-)
 * 6. Legacy finale patterns
 * 7. Default to qualification
 *
 * @param heat - The heat to infer bracket type from
 * @returns The inferred bracket type
 */
export function inferBracketType(heat: Heat): Heat['bracketType'] {
  // If heat already has explicit bracketType, use it
  if (heat.bracketType) {
    return heat.bracketType
  }

  const id = heat.id

  // WICHTIG: Reihenfolge beachten! Spezifischere Prefixes zuerst
  // wb-finale und lb-finale müssen vor allgemeinen wb-/lb- checks kommen
  if (id.startsWith(HEAT_ID_PREFIXES.WB_FINALE) || id.startsWith(HEAT_ID_PREFIXES.WB_HEAT)) {
    return 'winner'
  }

  if (id.startsWith(HEAT_ID_PREFIXES.LB_FINALE) || id.startsWith(HEAT_ID_PREFIXES.LB_HEAT)) {
    return 'loser'
  }

  if (id.startsWith(HEAT_ID_PREFIXES.GRAND_FINALE) || id.includes('grand_finale')) {
    return 'grand_finale'
  }

  // Generic bracket prefixes (fallback for legacy tests)
  // Used by tests that don't set explicit bracketType (e.g. tests/heat-completion.test.ts)
  if (id.startsWith('wb-') || id.includes('winner')) {
    return 'winner'
  }

  if (id.startsWith('lb-') || id.includes('loser')) {
    return 'loser'
  }

  // Legacy test compatibility: 'finale-1' etc. treated as grand finale
  // Used by tests/finale-ceremony.test.tsx and others that use simple IDs
  if (id.startsWith('finale-') || id === 'finale') {
    return 'grand_finale'
  }

  // Default to qualification
  return 'qualification'
}

/**
 * Checks if a bracket type represents a Grand Finale
 *
 * WICHTIG: isGrandFinale nur für bracketType 'grand_finale' oder 'finale'
 * NICHT für heat.isFinale, da WB Finale und LB Finale auch isFinale=true haben!
 *
 * @param bracketType - The bracket type to check
 * @returns true if this is a grand finale bracket type
 */
export function isGrandFinaleBracketType(bracketType: Heat['bracketType']): boolean {
  return bracketType === 'grand_finale' || bracketType === 'finale'
}

// ============================================================================
// Story 1.6: WinnerPool Calculation
// ============================================================================

/**
 * Calculates the available winner pool from winner pilots minus those in pending/active WB heats
 *
 * Story 1.6: Extrahiert aus submitHeatResults (Zeilen 583-590)
 * Story 13-6: winnerPool wird dynamisch berechnet statt persistiert
 *
 * Verfügbare WB-Piloten = winnerPilots MINUS Piloten in pending/active WB-Heats
 *
 * @param winnerPilots - All pilots who have qualified for the winner bracket
 * @param heats - All tournament heats
 * @returns Set of pilot IDs available for new WB heats
 */
export function calculateAvailableWinnerPool(
  winnerPilots: string[],
  heats: Heat[]
): Set<string> {
  // Find pilots currently in pending or active WB heats
  const pilotsInPendingWBHeats = new Set(
    heats
      .filter(h => h.bracketType === 'winner' && (h.status === 'pending' || h.status === 'active'))
      .flatMap(h => h.pilotIds)
  )

  // WinnerPool = winnerPilots minus pilots already assigned to heats
  return new Set(
    winnerPilots.filter(p => !pilotsInPendingWBHeats.has(p))
  )
}

// ============================================================================
// Story 11-6: Pilot Bracket Origin (Herkunfts-Tags)
// ============================================================================

/**
 * Determines whether a pilot came through Winner Bracket or Loser Bracket
 * 
 * Story 11-6 AC4: Herkunft wird aus Pilot-Historie ermittelt
 * - Checks if pilot was ever in a Loser Bracket heat
 * - If yes → 'lb' (pilot lost once, fought back)
 * - If no → 'wb' (pilot never lost in elimination rounds)
 * 
 * @param pilotId - The pilot's ID
 * @param heats - All heats in the tournament
 * @returns 'wb' or 'lb'
 */
export function getPilotBracketOrigin(pilotId: string, heats: Heat[]): 'wb' | 'lb' {
  const wasInLoserBracket = heats.some(heat =>
    heat.bracketType === 'loser' &&
    heat.pilotIds?.includes(pilotId)
  )
  return wasInLoserBracket ? 'lb' : 'wb'
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
  currentHeats: Pick<Heat, 'heatNumber'>[],
  pilots: Pilot[] = []
): { heat: Heat | null; updatedPool: Set<string> } {
  if (winnerPool.size < 4) {
    return { heat: null, updatedPool: winnerPool }
  }

  // FIFO: Take first 4 pilots from pool
  const poolArray = Array.from(winnerPool)
  const pilotsForHeat = poolArray.slice(0, 4)
  const optimizedPilotIds = optimizePilotOrder(pilotsForHeat, pilots)

  // Create new pool without selected pilots
  const updatedPool = new Set(winnerPool)
  for (const pilotId of pilotsForHeat) {
    updatedPool.delete(pilotId)
  }

  // Create WB heat
  const wbHeat: Heat = {
    id: `wb-heat-${crypto.randomUUID()}`,
    heatNumber: currentHeats.length + 1,
    pilotIds: optimizedPilotIds,
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
  pilots: Pilot[],
  minPilots?: number
): { heat: Heat | null; updatedPool: Set<string> }
export function createLBHeatFromPool(
  loserPool: Set<string>,
  currentHeats: Pick<Heat, 'heatNumber'>[],
  minPilots?: number
): { heat: Heat | null; updatedPool: Set<string> }
export function createLBHeatFromPool(
  loserPool: Set<string>,
  currentHeats: Pick<Heat, 'heatNumber'>[],
  pilotsOrMinPilots: Pilot[] | number = [],
  minPilots: number = 4
): { heat: Heat | null; updatedPool: Set<string> } {
  const resolvedPilots = Array.isArray(pilotsOrMinPilots) ? pilotsOrMinPilots : []
  const resolvedMinPilots = typeof pilotsOrMinPilots === 'number' ? pilotsOrMinPilots : minPilots

  if (loserPool.size < resolvedMinPilots) {
    return { heat: null, updatedPool: loserPool }
  }

  // FIFO: Take first N pilots from pool (up to 4)
  const poolArray = Array.from(loserPool)
  const heatSize = Math.min(4, poolArray.length)
  const pilotsForHeat = poolArray.slice(0, heatSize)
  const optimizedPilotIds = optimizePilotOrder(pilotsForHeat, resolvedPilots)

  // Create new pool without selected pilots
  const updatedPool = new Set(loserPool)
  for (const pilotId of pilotsForHeat) {
    updatedPool.delete(pilotId)
  }

  // Create LB heat
  const lbHeat: Heat = {
    id: `lb-heat-${crypto.randomUUID()}`,
    heatNumber: currentHeats.length + 1,
    pilotIds: optimizedPilotIds,
    status: 'pending',
    bracketType: 'loser'
  }

  return { heat: lbHeat, updatedPool }
}
