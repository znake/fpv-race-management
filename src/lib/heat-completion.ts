/**
 * Heat Completion Logic - Pure Functions for Heat Result Processing
 *
 * Verantwortlichkeiten:
 * - Verarbeiten von Heat-Abschlüssen für alle Bracket-Typen (Quali, WB, LB, Finale)
 * - Aktualisieren von Pools (winnerPool, loserPool)
 * - Aktualisieren von Bracket-Tracking (winnerPilots, loserPilots, eliminatedPilots)
 * - Erstellen neuer Heats (dynamische Heat-Generierung)
 * - Bestimmen der nächsten Phase
 *
 * Diese Funktionen sind PURE (kein State-Management, keine Seiteneffekte).
 * Sie werden von submitHeatResults() im Store aufgerufen.
 *
 * Story 1.6: submitHeatResults() aufteilen
 */

import type { Heat } from '../types'
import type { Ranking } from './schemas'
import type { FullBracketStructure } from './bracket-structure-generator'
import type { TournamentPhase } from '../types/tournament'

// Import helper functions from bracket-logic.ts
import {
  updateBracketAfterHeatCompletion,
  updateBracketAfterWBLBHeatCompletion,
  areAllQualiHeatsCompleted,
  generateGrandFinaleHeat,
  checkHasActiveWBHeats,
  createLBHeatFromPool
} from './bracket-logic'

/**
 * State Slice für Heat-Completion-Logik
 * Enthält nur die für die Verarbeitung benötigten Daten
 */
export interface HeatCompletionState {
  heats: Heat[]
  fullBracketStructure: FullBracketStructure | null
  winnerPilots: string[]
  loserPilots: string[]
  eliminatedPilots: string[]
  winnerPool: string[]
  loserPool: string[]
  isQualificationComplete: boolean
  tournamentPhase: TournamentPhase
}

/**
 * Ergebnis einer Heat-Completion-Verarbeitung
 * Enthält alle aktualisierten Daten
 */
export interface HeatCompletionResult {
  updatedHeats: Heat[]
  updatedWinnerPool: string[]
  updatedLoserPool: string[]
  updatedWinnerPilots: string[]
  updatedLoserPilots: string[]
  updatedEliminatedPilots: string[]
  updatedStructure: FullBracketStructure | null
  newPhase?: TournamentPhase
  isComplete?: boolean
  completedBracketType?: 'winner' | 'loser' | 'qualifier' | null
}

/**
 * Verarbeitet den Abschluss einer Qualification Heat
 *
 * Tasks:
 * - Rankings anwenden und winnerPilots/loserPilots/eliminatedPilots aktualisieren
 * - Bracket-Struktur aktualisieren (Quali → WB/LB)
 * - Wenn alle Quali-Heats fertig: WB-Heats aus winnerPool generieren
 * - ggf. LB-Heats generieren
 *
 * @param heat - Die abgeschlossene Heat
 * @param rankings - Die Ergebnisse
 * @param state - Der aktuelle State
 * @param heatIndex - Index der Heat im heats[] Array
 * @param isResubmission - True bei Neusubmission (Edit-Mode)
 * @returns HeatCompletionResult mit allen aktualisierten Daten
 */
export function processQualiHeatCompletion(
  heat: Heat,
  rankings: Ranking[],
  state: HeatCompletionState,
  heatIndex: number,
  isResubmission: boolean
): HeatCompletionResult {
  const {
    heats,
    fullBracketStructure,
    winnerPilots,
    loserPilots,
    eliminatedPilots,
    winnerPool,
    loserPool
  } = state

  const newWinnerPilots = new Set(winnerPilots)
  const newLoserPilots = new Set(loserPilots)
  const newEliminatedPilots = new Set(eliminatedPilots)
  let newWinnerPool = new Set(winnerPool)
  const newLoserPool = new Set(loserPool)

  // Handle re-submission: remove old assignments first
  if (isResubmission) {
    const oldHeat = heats[heatIndex]
    if (oldHeat.results) {
      for (const oldRanking of oldHeat.results.rankings) {
        newWinnerPilots.delete(oldRanking.pilotId)
        newLoserPilots.delete(oldRanking.pilotId)
        newEliminatedPilots.delete(oldRanking.pilotId)
        newWinnerPool.delete(oldRanking.pilotId)
        newLoserPool.delete(oldRanking.pilotId)
      }
    }
  }

  // Apply rankings to bracket tracking
  for (const ranking of rankings) {
    if (ranking.rank === 1 || ranking.rank === 2) {
      newWinnerPilots.add(ranking.pilotId)
    } else if (ranking.rank === 3 || ranking.rank === 4) {
      // Double Elimination: Check if pilot was already in loser bracket
      if (loserPilots.includes(ranking.pilotId)) {
        // Second loss → eliminated
        newLoserPilots.delete(ranking.pilotId)
        newEliminatedPilots.add(ranking.pilotId)
      } else {
        // First loss → loser bracket
        newLoserPilots.add(ranking.pilotId)
      }
    }
  }

  // Update bracket structure
  let updatedBracketStructure = fullBracketStructure
  if (fullBracketStructure) {
    console.log('DEBUG processQualiHeatCompletion: Before updateBracketAfterHeatCompletion')
    console.log('  heats.length:', heats.length)
    updatedBracketStructure = updateBracketAfterHeatCompletion(
      heat.id,
      rankings,
      fullBracketStructure,
      isResubmission
    )
    console.log('DEBUG processQualiHeatCompletion: After updateBracketAfterHeatCompletion')
    console.log('  quali heats count:', updatedBracketStructure.qualification.heats.length)
    console.log('  wb heats count:', updatedBracketStructure.winnerBracket.rounds.flatMap(r => r.heats).length)
  }

  // Check if all quali heats are completed
  let updatedHeats = [...heats]
  updatedHeats[heatIndex] = {
    ...updatedHeats[heatIndex],
    status: 'completed',
    results: {
      rankings,
      completedAt: new Date().toISOString()
    }
  }

  const allQualiCompleted = updatedBracketStructure && areAllQualiHeatsCompleted(updatedBracketStructure)
  console.log('DEBUG processQualiHeatCompletion:')
  console.log('  updatedBracketStructure:', !!updatedBracketStructure)
  if (updatedBracketStructure) {
    const qualiHeats = updatedBracketStructure.qualification.heats
    const completedQuali = qualiHeats.filter(h => h.status === 'completed')
    console.log('  qualiHeats length:', qualiHeats.length)
    console.log('  completedQuali length:', completedQuali.length)
  }
  console.log('  allQualiCompleted:', allQualiCompleted)

  if (allQualiCompleted) {
    console.log('DEBUG Quali all completed - collecting winners')
    // Collect winners from all completed quali heats into winnerPool (only those not already in pool)
    for (const qualiHeat of updatedBracketStructure!.qualification.heats) {
      const actualHeat = updatedHeats.find(h => h.id === qualiHeat.id)
      if (actualHeat?.results) {
        for (const ranking of actualHeat.results.rankings) {
          if (ranking.rank === 1 || ranking.rank === 2 && !newWinnerPool.has(ranking.pilotId)) {
            newWinnerPool.add(ranking.pilotId)
          }
        }
      }
    }

    console.log('DEBUG: Collected winnerPool size:', newWinnerPool.size)
    // Note: WB heat auto-generation is handled in submitHeatResults()
    // after determining new phase to avoid timing issues
  }

  return {
    updatedHeats,
    updatedWinnerPool: Array.from(newWinnerPool),
    updatedLoserPool: Array.from(newLoserPool),
    updatedWinnerPilots: Array.from(newWinnerPilots),
    updatedLoserPilots: Array.from(newLoserPilots),
    updatedEliminatedPilots: Array.from(newEliminatedPilots),
    updatedStructure: updatedBracketStructure,
    newPhase: undefined,
    isComplete: false,
    completedBracketType: 'qualifier'
  }
}

/**
 * Verarbeitet den Abschluss einer Winner Bracket Heat
 *
 * Tasks:
 * - Rankings anwenden (rank 1+2 → WB bleibt im Pool, rank 3+4 → LB)
 * - Bracket-Struktur aktualisieren (WB → WB/LB)
 * - WB-Heats aus winnerPool generieren
 * - ggf. Grand Finale generieren
 *
 * @param heat - Die abgeschlossene Heat
 * @param rankings - Die Ergebnisse
 * @param state - Der aktuelle State
 * @param heatIndex - Index der Heat im heats[] Array
 * @param bracketType - Der Bracket-Typ ('winner' oder 'loser')
 * @param isResubmission - True bei Neusubmission (Edit-Mode)
 * @returns HeatCompletionResult mit allen aktualisierten Daten
 */
export function processWBHeatCompletion(
  heat: Heat,
  rankings: Ranking[],
  state: HeatCompletionState,
  heatIndex: number,
  bracketType: 'winner' | 'loser',
  isResubmission: boolean
): HeatCompletionResult {
  const {
    heats,
    fullBracketStructure,
    winnerPilots,
    loserPilots,
    eliminatedPilots,
    winnerPool,
    loserPool
  } = state

  const newWinnerPilots = new Set(winnerPilots)
  const newLoserPilots = new Set(loserPilots)
  const newEliminatedPilots = new Set(eliminatedPilots)
  let newWinnerPool = new Set(winnerPool)
  const newLoserPool = new Set(loserPool)

  // Handle re-submission: remove old assignments first
  if (isResubmission) {
    const oldHeat = heats[heatIndex]
    if (oldHeat.results) {
      for (const oldRanking of oldHeat.results.rankings) {
        newWinnerPilots.delete(oldRanking.pilotId)
        newLoserPilots.delete(oldRanking.pilotId)
        newEliminatedPilots.delete(oldRanking.pilotId)
        newWinnerPool.delete(oldRanking.pilotId)
        newLoserPool.delete(oldRanking.pilotId)
      }
    }
  }

  // Update winner/loser pool tracking
  for (const ranking of rankings) {
    if (ranking.rank === 1 || ranking.rank === 2) {
      // Winners stay in their current bracket
      if (bracketType === 'winner') {
        newWinnerPilots.add(ranking.pilotId)
        newWinnerPool.add(ranking.pilotId)
      } else {
        // LB winners continue in LB pool
        newLoserPilots.add(ranking.pilotId)
        newLoserPool.add(ranking.pilotId)
      }
    } else if (ranking.rank === 3 || ranking.rank === 4) {
      if (bracketType === 'winner') {
        // WB losers drop to LB pool
        newWinnerPilots.delete(ranking.pilotId)
        newLoserPilots.add(ranking.pilotId)
        newLoserPool.add(ranking.pilotId)
      } else {
        // LB losers are eliminated
        newLoserPilots.delete(ranking.pilotId)
        newLoserPool.delete(ranking.pilotId)
        newEliminatedPilots.add(ranking.pilotId)
      }
    }
  }

  // Update heats
  let updatedHeats = [...heats]
  updatedHeats[heatIndex] = {
    ...updatedHeats[heatIndex],
    status: 'completed',
    results: {
      rankings,
      completedAt: new Date().toISOString()
    }
  }

  // Note: WB heat auto-generation is handled in submitHeatResults()
  // after determining the new phase to avoid timing issues

  // Update bracket structure
  let updatedBracketStructure = fullBracketStructure
  if (fullBracketStructure) {
    const result = updateBracketAfterWBLBHeatCompletion(
      heat.id,
      rankings,
      fullBracketStructure,
      isResubmission
    )
    updatedBracketStructure = result.structure

    // Add eliminated pilots from LB (already handled above, but sync for structure)
    for (const eliminatedId of result.eliminatedPilotIds) {
      newLoserPilots.delete(eliminatedId)
      newEliminatedPilots.add(eliminatedId)
    }

    // Check if Grand Finale is ready
    const finaleHeat = generateGrandFinaleHeat(updatedBracketStructure, updatedHeats, true)
    if (finaleHeat) {
      // Deactivate any active heat first
      updatedHeats = updatedHeats.map(h => ({
        ...h,
        status: h.status === 'active' && h.results
          ? 'completed'
          : h.status
      } as Heat))

      updatedHeats = [...updatedHeats, finaleHeat]
    }
  }

  return {
    updatedHeats,
    updatedWinnerPool: Array.from(newWinnerPool),
    updatedLoserPool: Array.from(newLoserPool),
    updatedWinnerPilots: Array.from(newWinnerPilots),
    updatedLoserPilots: Array.from(newLoserPilots),
    updatedEliminatedPilots: Array.from(newEliminatedPilots),
    updatedStructure: updatedBracketStructure,
    newPhase: undefined,
    isComplete: false,
    completedBracketType: bracketType === 'winner' ? 'winner' : 'loser'
  }
}

/**
 * Verarbeitet den Abschluss einer Loser Bracket Heat
 *
 * Tasks:
 * - Rankings anwenden (rank 1+2 → LB bleiben im Pool, rank 3+4 → eliminated)
 * - Bracket-Struktur aktualisieren (LB → LB/Grand Finale)
 * - LB-Heats aus loserPool generieren (dynamisch)
 * - ggf. Grand Finale generieren
 *
 * @param heat - Die abgeschlossene Heat
 * @param rankings - Die Ergebnisse
 * @param state - Der aktuelle State
 * @param heatIndex - Index der Heat im heats[] Array
 * @param isResubmission - True bei Neusubmission (Edit-Mode)
 * @returns HeatCompletionResult mit allen aktualisierten Daten
 */
export function processLBHeatCompletion(
  heat: Heat,
  rankings: Ranking[],
  state: HeatCompletionState,
  heatIndex: number,
  isResubmission: boolean
): HeatCompletionResult {
  // LB completion is handled by processWBHeatCompletion with bracketType='loser'
  const result = processWBHeatCompletion(
    heat,
    rankings,
    state,
    heatIndex,
    'loser',
    isResubmission
  )

  // LB winners (rank 1+2) go back to pool
  let newLoserPool = new Set(result.updatedLoserPool)
  const newEliminatedPilots = new Set(result.updatedEliminatedPilots)
  for (const ranking of rankings) {
    if (ranking.rank === 1 || ranking.rank === 2) {
      newLoserPool.add(ranking.pilotId)
    } else if (ranking.rank === 3 || ranking.rank === 4) {
      // LB losers are eliminated - remove from pool if they're there
      newLoserPool.delete(ranking.pilotId)
      newEliminatedPilots.add(ranking.pilotId)
    }
  }

  return {
    ...result,
    updatedLoserPool: Array.from(newLoserPool),
    updatedEliminatedPilots: Array.from(newEliminatedPilots)
  }
}

/**
 * Verarbeitet den Abschluss einer Finale oder Grand Finale Heat
 *
 * Tasks:
 * - Phase auf 'completed' setzen
 * - Bracket-Struktur aktualisieren
 *
 * @param rankings - Die Ergebnisse
 * @param state - Der aktuelle State
 * @param heatIndex - Index der Heat im heats[] Array
 * @returns HeatCompletionResult mit allen aktualisierten Daten
 */
export function processFinaleCompletion(
  rankings: Ranking[],
  state: HeatCompletionState,
  heatIndex: number
): HeatCompletionResult {
  const { heats, fullBracketStructure } = state

  // Update heats
  const updatedHeats = [...heats]
  updatedHeats[heatIndex] = {
    ...updatedHeats[heatIndex],
    status: 'completed',
    results: {
      rankings,
      completedAt: new Date().toISOString()
    }
  }

  // Update grand finale status in bracket structure
  let updatedBracketStructure = fullBracketStructure
  if (updatedBracketStructure?.grandFinale) {
    updatedBracketStructure = structuredClone(updatedBracketStructure)
    updatedBracketStructure.grandFinale!.status = 'completed'
  }

  return {
    updatedHeats,
    updatedWinnerPool: state.winnerPool,
    updatedLoserPool: state.loserPool,
    updatedWinnerPilots: state.winnerPilots,
    updatedLoserPilots: state.loserPilots,
    updatedEliminatedPilots: state.eliminatedPilots,
    updatedStructure: updatedBracketStructure,
    newPhase: 'completed',
    isComplete: true,
    completedBracketType: null
  }
}

/**
 * Aktiviert den nächsten pending Heat
 *
 * @param heats - Array aller Heats
 * @param heatIndex - Index der gerade abgeschlossenen Heat
 * @returns Aktualisiertes heats[] Array
 */
export function activateNextPendingHeat(
  heats: Heat[],
  _heatIndex: number
): Heat[] {
  const updatedHeats = [...heats]

  console.log('DEBUG activateNextPendingHeat:')
  console.log('  heats.length:', heats.length)
  console.log('  heats statuses:', heats.map(h => ({ id: h.id, status: h.status, bracketType: h.bracketType })))

  // Check if there's an active heat
  const hasActiveHeat = updatedHeats.some(h => h.status === 'active')
  console.log('  hasActiveHeat:', hasActiveHeat)

  // If no active heat, activate first pending heat
  if (!hasActiveHeat) {
    const nextPendingIndex = updatedHeats.findIndex(h => h.status === 'pending')
    console.log('  nextPendingIndex:', nextPendingIndex)
    if (nextPendingIndex !== -1) {
      console.log('  Activating heat:', updatedHeats[nextPendingIndex].id)
      updatedHeats[nextPendingIndex] = {
        ...updatedHeats[nextPendingIndex],
        status: 'active'
      }
    }
  }

  console.log('  result statuses:', updatedHeats.map(h => ({ id: h.id, status: h.status })))
  return updatedHeats
}

/**
 * Generiert LB-Heat aus loserPool (falls genug Piloten)
 *
 * @param state - Der aktuelle State
 * @param newLoserPool - Der aktualisierte loserPool (Set für Modifikation)
 * @param heats - Array aller Heats
 * @returns { heat: Heat | null, updatedPool: Set<string> }
 */
export function autoGenerateLBHeat(
  state: HeatCompletionState,
  newLoserPool: Set<string>,
  heats: Heat[]
): { heat: Heat | null; updatedPool: Set<string> } {
  const { fullBracketStructure, tournamentPhase } = state

  // Story 10-2: Check if WB still has pending/active heats using pure function
  const hasActiveWB = checkHasActiveWBHeats(fullBracketStructure, heats)

  // Determine if we should auto-generate LB heat
  // Only generate if tournament is still in running phase (not finale/completed)
  const minPoolForLB = hasActiveWB ? 4 : 3
  const shouldAutoGenerate = tournamentPhase === 'running' &&
                               newLoserPool.size >= minPoolForLB

  if (!shouldAutoGenerate) {
    return { heat: null, updatedPool: newLoserPool }
  }

  // Create LB heat from pool
  const lbResult = createLBHeatFromPool(newLoserPool, heats, minPoolForLB)
  return lbResult
}

/**
 * Bestimmt die neue Tournament-Phase nach Heat-Abschluss
 *
 * @param heats - Array aller Heats
 * @param currentPhase - Aktuelle Phase
 * @param bracketType - Bracket-Typ des gerade abgeschlossenen Heats
 * @returns Neue Phase
 */
export function determineNextPhase(
  heats: Heat[],
  currentPhase: TournamentPhase,
  bracketType: 'finale' | 'grand_finale' | 'qualification' | 'winner' | 'loser',
  winnerPool: string[] = [],
  loserPool: string[] = []
): TournamentPhase {
  if (bracketType === 'finale' || bracketType === 'grand_finale') {
    return 'completed'
  }

  // If current phase is completed or finale, keep it (don't transition back to running)
  if (currentPhase === 'completed' || currentPhase === 'finale') {
    return currentPhase
  }

  // Check if all heats are completed
  // If all heats are done and no more pending, transition to finale
  const allCompleted = heats.every(h => h.status === 'completed')
  const hasPendingHeats = heats.some(h => h.status === 'pending')
  const hasActiveHeat = heats.some(h => h.status === 'active')

  console.log('DEBUG determineNextPhase:')
  console.log('  bracketType:', bracketType)
  console.log('  currentPhase:', currentPhase)
  console.log('  allCompleted:', allCompleted)
  console.log('  hasPendingHeats:', hasPendingHeats)
  console.log('  hasActiveHeat:', hasActiveHeat)
  console.log('  winnerPool size:', winnerPool.length)
  console.log('  loserPool size:', loserPool.length)
  console.log('  heats.length:', heats.length)
  console.log('  returning:', currentPhase)

  // Only transition to finale if:
  // 1. All heats are completed
  // 2. No pending heats exist
  // 3. No active heat exists
  // 4. No pilots waiting in winnerPool or loserPool (all assigned to heats)
  if (allCompleted && !hasPendingHeats && !hasActiveHeat && winnerPool.length === 0 && loserPool.length === 0 && currentPhase === 'running') {
    // All heats done, no new ones generated, no pilots waiting → finale phase
    return 'finale'
  }

  return currentPhase
}

/**
 * Bestimmt den neuen currentHeatIndex nach Heat-Abschluss
 *
 * @param heats - Array aller Heats
 * @returns Der neue Index
 */
export function determineCurrentHeatIndex(heats: Heat[]): number {
  const activeHeatIndex = heats.findIndex(h => h.status === 'active')
  return activeHeatIndex !== -1 ? activeHeatIndex : heats.length - 1
}
