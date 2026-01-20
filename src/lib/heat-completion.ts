/**
 * Heat Completion Logic - Pure Functions for Heat Result Processing
 *
 * Phase 4 REFACTORED: fullBracketStructure entfernt.
 * Diese Datei enthält nur noch Helper-Funktionen für Heat-Completion-Logik.
 * Die Hauptlogik ist jetzt direkt in submitHeatResults() im Store.
 *
 * Story 1.6: submitHeatResults() aufteilen
 */

import type { Heat } from '../types'
import type { TournamentPhase } from '../types/tournament'
import type { Ranking } from '../lib/schemas'

import { createLBHeatFromPool, isGrandFinaleBracketType } from './bracket-logic'
import { isTopRank } from './bracket-constants'

/**
 * State Slice für Heat-Completion-Logik (ohne fullBracketStructure)
 */
export interface HeatCompletionState {
  heats: Heat[]
  winnerPilots: string[]
  loserPilots: string[]
  eliminatedPilots: string[]
  winnerPool: string[]
  loserPool: string[]
  isQualificationComplete: boolean
  tournamentPhase: TournamentPhase
}

/**
 * Ergebnis einer Heat-Completion-Verarbeitung (ohne fullBracketStructure)
 */
export interface HeatCompletionResult {
  updatedHeats: Heat[]
  updatedWinnerPool: string[]
  updatedLoserPool: string[]
  updatedWinnerPilots: string[]
  updatedLoserPilots: string[]
  updatedEliminatedPilots: string[]
  newPhase?: TournamentPhase
  isComplete?: boolean
  completedBracketType?: 'winner' | 'loser' | 'qualifier' | null
}

// ============================================================================
// Story 1.6: Rematch Completion Handling
// ============================================================================

/**
 * Input für handleRematchCompletion
 */
export interface RematchCompletionInput {
  heatId: string
  updatedHeat: Heat
  rematchHeats: Heat[]
  grandFinaleRematchPending: boolean
}

/**
 * Ergebnis der Rematch-Verarbeitung
 */
export interface RematchCompletionResult {
  updatedRematchHeats: Heat[]
  updatedGrandFinaleRematchPending: boolean
}

/**
 * Verarbeitet das Abschließen eines Rematch-Heats
 *
 * Story 1.6: Extrahiert aus submitHeatResults (Zeilen 558-573)
 * Story 13-4: Handle Rematch completion
 *
 * @param input - Alle erforderlichen Eingabedaten
 * @returns Aktualisierte Rematch-Daten
 */
export function handleRematchCompletion(input: RematchCompletionInput): RematchCompletionResult {
  const { heatId, updatedHeat, rematchHeats, grandFinaleRematchPending } = input

  // Update the rematch in the rematchHeats array
  const newRematchHeats = [...rematchHeats]
  const rematchIndex = newRematchHeats.findIndex(r => r.id === heatId)

  if (rematchIndex !== -1) {
    newRematchHeats[rematchIndex] = updatedHeat
  }

  // Check if all rematches are completed
  const allRematchesCompleted = newRematchHeats.every(r => r.status === 'completed')
  const newGrandFinaleRematchPending = allRematchesCompleted ? false : grandFinaleRematchPending

  return {
    updatedRematchHeats: newRematchHeats,
    updatedGrandFinaleRematchPending: newGrandFinaleRematchPending
  }
}

// ============================================================================
// Story 1.6: Ranking Processing by Bracket Type
// ============================================================================

/**
 * Input für processRankingsByBracket
 */
export interface RankingProcessingInput {
  rankings: Ranking[]
  bracketType: Heat['bracketType']
  winnerPilots: Set<string>
  loserPilots: Set<string>
  eliminatedPilots: Set<string>
  winnerPool: Set<string>
  loserPool: Set<string>
  heats: Heat[]
}

/**
 * Ergebnis der Ranking-Verarbeitung
 */
export interface RankingProcessingResult {
  winnerPilots: Set<string>
  loserPilots: Set<string>
  eliminatedPilots: Set<string>
  winnerPool: Set<string>
  loserPool: Set<string>
  isQualificationComplete: boolean
  newPhase: TournamentPhase | null
}

/**
 * Verarbeitet Rankings basierend auf dem Bracket-Typ
 *
 * Story 1.6: Extrahiert aus submitHeatResults (Zeilen 606-663)
 *
 * Logik:
 * - Grand Finale: Phase → completed
 * - Qualification: Top 2 → winnerPool, Bottom 2 → loserPool
 * - Winner Bracket: Top 2 bleiben, Bottom 2 → loserPool
 * - Loser Bracket: Top 2 bleiben, Bottom 2 → eliminated
 *
 * @param input - Alle erforderlichen Eingabedaten
 * @returns Aktualisierte Sets und Flags
 */
export function processRankingsByBracket(input: RankingProcessingInput): RankingProcessingResult {
  const {
    rankings,
    bracketType,
    winnerPilots,
    loserPilots,
    eliminatedPilots,
    winnerPool,
    loserPool,
    heats
  } = input

  // Create mutable copies
  const newWinnerPilots = new Set(winnerPilots)
  const newLoserPilots = new Set(loserPilots)
  const newEliminatedPilots = new Set(eliminatedPilots)
  const newWinnerPool = new Set(winnerPool)
  const newLoserPool = new Set(loserPool)

  let newPhase: TournamentPhase | null = null
  let isQualificationComplete = false

  // Check if this is a Grand Finale
  if (isGrandFinaleBracketType(bracketType)) {
    // GRAND FINALE COMPLETED
    newPhase = 'completed'
    return {
      winnerPilots: newWinnerPilots,
      loserPilots: newLoserPilots,
      eliminatedPilots: newEliminatedPilots,
      winnerPool: newWinnerPool,
      loserPool: newLoserPool,
      isQualificationComplete,
      newPhase
    }
  }

  if (bracketType === 'qualification') {
    // QUALIFICATION HEAT
    for (const ranking of rankings) {
      if (isTopRank(ranking.rank)) {
        // Winners → winnerPool für WB
        newWinnerPilots.add(ranking.pilotId)
        newWinnerPool.add(ranking.pilotId)
      } else {
        // Losers (rank 3+4) → loserPool für LB
        newLoserPilots.add(ranking.pilotId)
        newLoserPool.add(ranking.pilotId)
      }
    }

    // Check if all quali heats are completed
    const qualiHeats = heats.filter(h => !h.bracketType || h.bracketType === 'qualification')
    const allQualiCompleted = qualiHeats.every(h => h.status === 'completed')

    if (allQualiCompleted) {
      isQualificationComplete = true
    }

  } else if (bracketType === 'winner') {
    // WINNER BRACKET HEAT
    for (const ranking of rankings) {
      if (isTopRank(ranking.rank)) {
        // WB Winners → bleiben in winnerPool
        newWinnerPilots.add(ranking.pilotId)
        newWinnerPool.add(ranking.pilotId)
      } else {
        // WB Losers (rank 3+4) → fallen in loserPool
        newWinnerPilots.delete(ranking.pilotId)
        newWinnerPool.delete(ranking.pilotId)  // WICHTIG: Auch aus winnerPool entfernen!
        newLoserPilots.add(ranking.pilotId)
        newLoserPool.add(ranking.pilotId)
      }
    }

  } else if (bracketType === 'loser') {
    // LOSER BRACKET HEAT
    for (const ranking of rankings) {
      if (isTopRank(ranking.rank)) {
        // LB Winners → bleiben in loserPool
        newLoserPilots.add(ranking.pilotId)
        newLoserPool.add(ranking.pilotId)
      } else {
        // LB Losers (rank 3+4) → ELIMINIERT
        newLoserPilots.delete(ranking.pilotId)
        newLoserPool.delete(ranking.pilotId)
        newEliminatedPilots.add(ranking.pilotId)
      }
    }
  }

  return {
    winnerPilots: newWinnerPilots,
    loserPilots: newLoserPilots,
    eliminatedPilots: newEliminatedPilots,
    winnerPool: newWinnerPool,
    loserPool: newLoserPool,
    isQualificationComplete,
    newPhase
  }
}

/**
 * Aktiviert den nächsten pending Heat
 *
 * @param heats - Array aller Heats
 * @param _heatIndex - Index der gerade abgeschlossenen Heat (nicht verwendet)
 * @returns Aktualisiertes heats[] Array
 */
export function activateNextPendingHeat(
  heats: Heat[],
  _heatIndex: number
): Heat[] {
  const updatedHeats = [...heats]

  // Check if there's an active heat
  const hasActiveHeat = updatedHeats.some(h => h.status === 'active')

  // If no active heat, activate first pending heat
  if (!hasActiveHeat) {
    const nextPendingIndex = updatedHeats.findIndex(h => h.status === 'pending')
    if (nextPendingIndex !== -1) {
      updatedHeats[nextPendingIndex] = {
        ...updatedHeats[nextPendingIndex],
        status: 'active'
      }
    }
  }

  return updatedHeats
}

/**
 * Check if WB still has pending/active heats
 * Pure function version using heats[] directly
 */
export function checkHasActiveWBHeats(heats: Heat[]): boolean {
  return heats.some(h =>
    h.bracketType === 'winner' &&
    (h.status === 'pending' || h.status === 'active')
  )
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
  const { tournamentPhase } = state

  // Check if WB still has pending/active heats
  const hasActiveWB = checkHasActiveWBHeats(heats)

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
  const allCompleted = heats.every(h => h.status === 'completed')
  const hasPendingHeats = heats.some(h => h.status === 'pending')
  const hasActiveHeat = heats.some(h => h.status === 'active')

  // Only transition to finale if:
  // 1. All heats are completed
  // 2. No pending heats exist
  // 3. No active heat exists
  // 4. No pilots waiting in winnerPool or loserPool (all assigned to heats)
  if (allCompleted && !hasPendingHeats && !hasActiveHeat && winnerPool.length === 0 && loserPool.length === 0 && currentPhase === 'running') {
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

// ============================================================================
// Story 1.6: Heat Generation Logic
// ============================================================================

import type { PilotBracketState } from '../types/tournament'
import { HEAT_ID_PREFIXES, POOL_THRESHOLDS } from './bracket-constants'

/**
 * Input für generateNextHeats
 */
export interface HeatGenerationInput {
  heats: Heat[]
  winnerPool: Set<string>
  loserPool: Set<string>
  isQualificationComplete: boolean
}

/**
 * Ergebnis der Heat-Generierung
 */
export interface HeatGenerationResult {
  newHeats: Heat[]
  updatedWinnerPool: Set<string>
  updatedLoserPool: Set<string>
  newPhase: TournamentPhase | null
  pilotBracketStateUpdates: Record<string, PilotBracketState>
}

/**
 * Generiert neue Heats basierend auf Pool-Zuständen
 *
 * Story 1.6: Extrahiert aus submitHeatResults (Zeilen 665-786)
 *
 * Logik:
 * - WB Heat: Wenn winnerPool >= 4 Piloten
 * - WB Finale: Wenn winnerPool 2-3 Piloten und keine pending/active WB Heats
 * - LB Heat: Wenn loserPool >= 4 Piloten
 * - LB Finale: Wenn loserPool 2-3 Piloten und WB Finale completed
 * - Grand Finale: Wenn WB + LB Finale beide completed
 *
 * @param input - Alle erforderlichen Eingabedaten
 * @returns Generierte Heats und aktualisierte Pools
 */
export function generateNextHeats(input: HeatGenerationInput): HeatGenerationResult {
  const { heats, winnerPool, loserPool, isQualificationComplete } = input

  let updatedHeats = [...heats]
  const newWinnerPool = new Set(winnerPool)
  const newLoserPool = new Set(loserPool)
  let newPhase: TournamentPhase | null = null
  const pilotBracketStateUpdates: Record<string, PilotBracketState> = {}
  const generatedHeats: Heat[] = []

  // ===== HELPER: Berechne aktuelle Rundennummer für ein Bracket =====
  const getCurrentRound = (bracketType: 'winner' | 'loser'): number => {
    const bracketHeats = updatedHeats.filter(h => h.bracketType === bracketType)
    if (bracketHeats.length === 0) return 1 // Erste Runde
    
    // Finde die höchste Rundennummer
    const maxRound = Math.max(...bracketHeats.map(h => h.roundNumber ?? 1))
    
    // Prüfe ob alle Heats dieser Runde abgeschlossen sind
    const currentRoundHeats = bracketHeats.filter(h => (h.roundNumber ?? 1) === maxRound)
    const allCompleted = currentRoundHeats.every(h => h.status === 'completed')
    
    // Wenn alle abgeschlossen → nächste Runde, sonst aktuelle Runde
    return allCompleted ? maxRound + 1 : maxRound
  }

  // ===== HELPER: Prüft ob WB-Runde N abgeschlossen ist =====
  // Wird benötigt um sicherzustellen, dass LB-Runde N erst startet wenn WB-Runde N fertig ist
  const isWBRoundComplete = (roundNumber: number): boolean => {
    const wbHeats = updatedHeats.filter(h => h.bracketType === 'winner')
    if (wbHeats.length === 0) return false // Keine WB-Heats = Runde nicht fertig
    
    const roundHeats = wbHeats.filter(h => (h.roundNumber ?? 1) === roundNumber)
    if (roundHeats.length === 0) return false // Keine Heats in dieser Runde
    
    return roundHeats.every(h => h.status === 'completed')
  }

  // ===== HELPER: Prüft ob WB keine weiteren regulären Heats mehr hat =====
  // WB ist "fertig" wenn:
  // 1. WB Finale existiert (egal ob pending/active/completed), ODER
  // 2. Keine pending/active WB-Heats mehr UND winnerPool < 4 (nicht genug für reguläre Heats)
  const isWBFinishedOrInFinale = (): boolean => {
    const wbFinaleExists = updatedHeats.some(h => h.bracketType === 'winner' && h.isFinale)
    if (wbFinaleExists) return true
    
    const hasPendingOrActiveWB = updatedHeats.some(h => 
      h.bracketType === 'winner' && (h.status === 'pending' || h.status === 'active')
    )
    // WB ist fertig wenn keine pending/active WB-Heats und winnerPool zu klein für reguläre Heats
    return !hasPendingOrActiveWB && newWinnerPool.size < POOL_THRESHOLDS.MIN_FOR_REGULAR_HEAT
  }

  // ===== HELPER: Berechnet erwartete Pilotenzahl für eine LB-Runde =====
  // LB R1: Quali-Verlierer (50%) + WB R1-Verlierer (50% von 50%)
  // LB R2: LB R1-Gewinner (50%) + WB R2-Verlierer (falls vorhanden)
  // usw.
  const calculateExpectedLBPoolSize = (lbRound: number): number => {
    // Zähle Quali-Heats um Verlierer zu bestimmen
    const qualiHeats = updatedHeats.filter(h => h.bracketType === 'qualification')
    
    if (lbRound === 1) {
      // LB R1: Quali-Verlierer + WB R1-Verlierer
      // Quali-Verlierer: ~50% aller Piloten (Platz 3+4 aus jedem Heat)
      const qualiLosers = qualiHeats.reduce((sum, h) => {
        // Platz 3+4 = 2 Piloten bei 4er-Heat, 1 Pilot bei 3er-Heat
        return sum + Math.max(0, h.pilotIds.length - 2)
      }, 0)
      
      // WB R1-Verlierer: 50% der WB R1-Piloten
      const wbR1Heats = updatedHeats.filter(h => h.bracketType === 'winner' && (h.roundNumber ?? 1) === 1)
      const wbR1Losers = wbR1Heats.reduce((sum, h) => {
        return sum + Math.max(0, h.pilotIds.length - 2)
      }, 0)
      
      return qualiLosers + wbR1Losers
    }
    
    // Für spätere Runden: LB-Gewinner der Vorrunde + WB-Verlierer dieser Runde
    const prevLBHeats = updatedHeats.filter(h => h.bracketType === 'loser' && (h.roundNumber ?? 1) === lbRound - 1)
    const prevLBSurvivors = prevLBHeats.reduce((sum, h) => {
      // Top 2 überleben
      return sum + Math.min(2, h.pilotIds.length)
    }, 0)
    
    // WB-Verlierer dieser Runde (WB Runde N verliert zu LB Runde N)
    const wbRoundHeats = updatedHeats.filter(h => h.bracketType === 'winner' && (h.roundNumber ?? 1) === lbRound)
    const wbRoundLosers = wbRoundHeats.reduce((sum, h) => {
      return sum + Math.max(0, h.pilotIds.length - 2)
    }, 0)
    
    return prevLBSurvivors + wbRoundLosers
  }

  // ===== HELPER: Prüft ob LB-Heats für eine bestimmte Runde generiert werden können =====
  // LB-Runde N darf erst generiert werden wenn:
  // 1. WB-Runde N komplett ist (damit alle WB-Verlierer im loserPool sind), ODER
  // 2. WB bereits im Finale ist (keine weiteren WB-Runden mehr)
  // 3. Alle LB-Heats der aktuellen Runde abgeschlossen sind
  // 4. NEU: Alle erwarteten Piloten im Pool sind (Pool-Aggregation)
  const canGenerateLBHeats = (): boolean => {
    const lbHeats = updatedHeats.filter(h => h.bracketType === 'loser')
    
    // Bestimme welche LB-Runde generiert werden soll
    let targetLBRound = 1
    if (lbHeats.length > 0) {
      const maxLBRound = Math.max(...lbHeats.map(h => h.roundNumber ?? 1))
      const currentLBRoundHeats = lbHeats.filter(h => (h.roundNumber ?? 1) === maxLBRound)
      const allLBHeatsComplete = currentLBRoundHeats.every(h => h.status === 'completed')
      
      if (!allLBHeatsComplete) return false // Aktuelle LB-Runde noch nicht fertig
      targetLBRound = maxLBRound + 1
    }
    
    // Prüfe ob entsprechende WB-Runde komplett ist ODER WB im Finale
    const wbRoundComplete = isWBRoundComplete(targetLBRound) || isWBFinishedOrInFinale()
    if (!wbRoundComplete) return false
    
    // NEU: Prüfe ob Pool die erwartete Größe erreicht hat
    // Dies stellt sicher, dass alle Piloten gesammelt werden bevor Heats generiert werden
    const expectedPoolSize = calculateExpectedLBPoolSize(targetLBRound)
    
    // Wenn WB im Finale ist, akzeptiere auch kleinere Pools (keine weiteren WB-Verlierer)
    if (isWBFinishedOrInFinale()) {
      // Pool muss mindestens 3 Piloten haben für ein Heat
      return newLoserPool.size >= 3
    }
    
    // Sonst: Pool muss erwartete Größe erreicht haben
    return newLoserPool.size >= expectedPoolSize
  }

  // ===== HELPER: Prüft ob LB-Runde N abgeschlossen ist =====
  const isLBRoundComplete = (roundNumber: number): boolean => {
    const lbHeats = updatedHeats.filter(h => h.bracketType === 'loser')
    if (lbHeats.length === 0) return false // Keine LB-Heats = Runde nicht fertig
    
    const roundHeats = lbHeats.filter(h => (h.roundNumber ?? 1) === roundNumber)
    if (roundHeats.length === 0) return false // Keine Heats in dieser Runde
    
    return roundHeats.every(h => h.status === 'completed')
  }

  // ===== HELPER: Prüft ob WB-Heats für eine bestimmte Runde generiert werden können =====
  // WB-Runde N+1 darf erst generiert werden wenn:
  // 1. WB-Runde N komplett ist
  // 2. LB-Runde N komplett ist (damit der Ablauf WB R1 → LB R1 → WB R2 → LB R2 eingehalten wird)
  // Ausnahme: WB R1 kann direkt nach Quali starten (kein LB R0)
  const canGenerateWBHeats = (): boolean => {
    const wbHeats = updatedHeats.filter(h => h.bracketType === 'winner')
    
    // Erste WB-Runde: Kann direkt nach Quali starten
    if (wbHeats.length === 0) {
      return true
    }
    
    // Finde die aktuelle WB-Rundennummer
    const maxWBRound = Math.max(...wbHeats.map(h => h.roundNumber ?? 1))
    const currentWBRoundHeats = wbHeats.filter(h => (h.roundNumber ?? 1) === maxWBRound)
    const allWBHeatsComplete = currentWBRoundHeats.every(h => h.status === 'completed')
    
    if (!allWBHeatsComplete) return false // Aktuelle WB-Runde noch nicht fertig
    
    // Nächste WB-Runde (N+1) kann starten wenn LB-Runde N fertig ist
    // Beispiel: WB R2 kann starten wenn LB R1 fertig ist
    return isLBRoundComplete(maxWBRound)
  }

  // ===== WINNER BRACKET HEAT GENERATION =====

  // Generate WB Heats from pool
  // IMPORTANT: Only generate after all quali heats are completed
  // AND only if corresponding LB round is completed (to maintain proper round order)
  // Ablauf: Quali → WB R1 → LB R1 → WB R2 → LB R2 → ...
  if (isQualificationComplete && canGenerateWBHeats()) {
    const wbRoundNumber = getCurrentRound('winner')
    
    // Generate as many heats as possible for this round
    while (newWinnerPool.size >= POOL_THRESHOLDS.MIN_FOR_REGULAR_HEAT) {
      const pilots = Array.from(newWinnerPool).slice(0, 4)
      const wbHeat: Heat = {
        id: `${HEAT_ID_PREFIXES.WB_HEAT}${crypto.randomUUID()}`,
        heatNumber: updatedHeats.length + 1,
        pilotIds: pilots,
        status: 'pending',
        bracketType: 'winner',
        roundNumber: wbRoundNumber
      }
      updatedHeats = [...updatedHeats, wbHeat]
      generatedHeats.push(wbHeat)
      pilots.forEach(p => newWinnerPool.delete(p))
    }
  }
  
  // Nach dem Generieren der regulären Heats: Prüfe auf WB Finale
  // Neu berechnen, da sich der Pool geändert haben könnte
  const updatedPendingWBHeats = updatedHeats.filter(h => h.bracketType === 'winner' && h.status === 'pending')
  const updatedActiveWBHeats = updatedHeats.filter(h => h.bracketType === 'winner' && h.status === 'active')
  const updatedWbNoActiveHeats = updatedPendingWBHeats.length === 0 && updatedActiveWBHeats.length === 0
  const updatedWbFinaleExists = updatedHeats.some(h => h.bracketType === 'winner' && h.isFinale)
  
  // WB Finale wenn: 3-4 Piloten im Pool und keine pending/active WB-Heats
  const updatedCanGenerateWBFinale = !updatedWbFinaleExists &&
                                     newWinnerPool.size >= POOL_THRESHOLDS.MIN_FOR_FINALE &&
                                     newWinnerPool.size <= POOL_THRESHOLDS.MIN_FOR_REGULAR_HEAT &&
                                     updatedWbNoActiveHeats &&
                                     isQualificationComplete
  
  const updatedCanDirectQualifyWB = !updatedWbFinaleExists &&
                                    newWinnerPool.size === POOL_THRESHOLDS.DIRECT_QUALIFY_COUNT &&
                                    updatedWbNoActiveHeats &&
                                    isQualificationComplete
  
  if (updatedCanGenerateWBFinale) {
    // Generate WB Finale (genau 3 pilots - Top 2 kommen weiter)
    const wbRoundNumber = getCurrentRound('winner')
    const pilots = Array.from(newWinnerPool)
    const wbFinale: Heat = {
      id: `${HEAT_ID_PREFIXES.WB_FINALE}${crypto.randomUUID()}`,
      heatNumber: updatedHeats.length + 1,
      pilotIds: pilots,
      status: 'pending',
      bracketType: 'winner',
      isFinale: true,
      roundName: 'WB Finale',
      roundNumber: wbRoundNumber
    }
    updatedHeats = [...updatedHeats, wbFinale]
    generatedHeats.push(wbFinale)
    newWinnerPool.clear()
  } else if (updatedCanDirectQualifyWB) {
    // Direct Qualify: 2 Piloten → beide direkt als WB-Finalisten markieren
    // Kein Heat nötig - beide kommen ins Grand Finale
    const pilots = Array.from(newWinnerPool)
    pilots.forEach((pilotId) => {
      pilotBracketStateUpdates[pilotId] = {
        bracket: 'grand_finale',
        roundReached: 0,
        bracketOrigin: 'wb'
      }
    })
    // Pool leeren - Piloten sind jetzt "virtuelle WB Finalisten"
    newWinnerPool.clear()
  }

  // ===== LOSER BRACKET HEAT GENERATION =====

  const wbFinaleCompleted = updatedHeats.some(h => h.bracketType === 'winner' && h.isFinale && h.status === 'completed')
  
  // WB ist "ready" für Grand Finale wenn:
  // 1. WB Finale completed ist (3 Piloten Szenario), ODER
  // 2. WB Direct Qualify passiert ist (2 Piloten wurden als grand_finale/wb markiert)
  const wbDirectQualifiedPilots = Object.entries(pilotBracketStateUpdates)
    .filter(([_, state]) => state.bracketOrigin === 'wb' && state.bracket === 'grand_finale')
  const wbReadyForGrandFinale = wbFinaleCompleted || wbDirectQualifiedPilots.length === 2

  // Generate LB Heats - nur wenn:
  // 1. Quali abgeschlossen ist
  // 2. Die entsprechende WB-Runde abgeschlossen ist (damit alle WB-Verlierer im Pool sind)
  // 3. Alle LB-Heats der aktuellen Runde abgeschlossen sind
  // 4. Pool hat die erwartete Größe erreicht (Pool-Aggregation)
  // WICHTIG: LB-Runde N wartet auf WB-Runde N, damit die WB-Verlierer ins LB kommen!
  if (isQualificationComplete && canGenerateLBHeats()) {
    const lbRoundNumber = getCurrentRound('loser')
    
    // BATCH-GENERIERUNG: Alle Heats dieser Runde gleichzeitig generieren
    // Berechne optimale Verteilung von 4er- und 3er-Heats
    const poolArray = Array.from(newLoserPool)
    const poolSize = poolArray.length
    
    if (poolSize >= 3) {
      // Berechne Heat-Verteilung: Maximiere 4er-Heats, Rest als 3er-Heats
      let fourPlayerHeats = Math.floor(poolSize / 4)
      let remaining = poolSize - (fourPlayerHeats * 4)
      let threePlayerHeats = 0
      
      // Wenn Rest 1 oder 2 ist, konvertiere einen 4er-Heat zu 3er-Heats
      if (remaining === 1 && fourPlayerHeats > 0) {
        // 4 + 1 = 5 → 3 + 3 - 1 = nicht möglich, also 4 + 3 - 2 extra
        // Besser: einen 4er wegnehmen → 5 Piloten → nicht durch 3 teilbar
        // Lösung: 2x 4er → 1x 4er + 1 = 5, nicht gut
        // Bei Rest 1: Nimm einen 4er weg → 5 Piloten → nicht teilbar
        // Besser: 2 4er wegnehmen → 9 Piloten → 3x 3er
        fourPlayerHeats -= 2
        remaining = poolSize - (fourPlayerHeats * 4)
        threePlayerHeats = Math.floor(remaining / 3)
      } else if (remaining === 2 && fourPlayerHeats > 0) {
        // Rest 2: Nimm einen 4er weg → 6 Piloten → 2x 3er
        fourPlayerHeats -= 1
        remaining = poolSize - (fourPlayerHeats * 4)
        threePlayerHeats = Math.floor(remaining / 3)
      } else if (remaining === 0) {
        // Perfekt durch 4 teilbar
        threePlayerHeats = 0
      } else {
        // remaining === 3 → perfekt für einen 3er-Heat
        threePlayerHeats = 1
      }
      
      // Edge case: Wenn fourPlayerHeats negativ wurde
      if (fourPlayerHeats < 0) {
        fourPlayerHeats = 0
        threePlayerHeats = Math.floor(poolSize / 3)
      }
      
      let cursor = 0
      
      // Generiere alle 4er-Heats
      for (let i = 0; i < fourPlayerHeats; i++) {
        const pilots = poolArray.slice(cursor, cursor + 4)
        cursor += 4
        const lbHeat: Heat = {
          id: `${HEAT_ID_PREFIXES.LB_HEAT}${crypto.randomUUID()}`,
          heatNumber: updatedHeats.length + 1,
          pilotIds: pilots,
          status: 'pending',
          bracketType: 'loser',
          roundNumber: lbRoundNumber
        }
        updatedHeats = [...updatedHeats, lbHeat]
        generatedHeats.push(lbHeat)
        pilots.forEach(p => newLoserPool.delete(p))
      }
      
      // Generiere alle 3er-Heats
      for (let i = 0; i < threePlayerHeats; i++) {
        const pilots = poolArray.slice(cursor, cursor + 3)
        cursor += 3
        const lbHeat: Heat = {
          id: `${HEAT_ID_PREFIXES.LB_HEAT}${crypto.randomUUID()}`,
          heatNumber: updatedHeats.length + 1,
          pilotIds: pilots,
          status: 'pending',
          bracketType: 'loser',
          roundNumber: lbRoundNumber
        }
        updatedHeats = [...updatedHeats, lbHeat]
        generatedHeats.push(lbHeat)
        pilots.forEach(p => newLoserPool.delete(p))
      }
    }
  }
  
  // Nach dem Generieren der regulären LB-Heats: Prüfe auf LB Finale
  const lbFinaleExists = updatedHeats.some(h => h.bracketType === 'loser' && h.isFinale)
  const updatedPendingLBHeats = updatedHeats.filter(h => h.bracketType === 'loser' && h.status === 'pending')
  const updatedActiveLBHeats = updatedHeats.filter(h => h.bracketType === 'loser' && h.status === 'active')
  const updatedLbNoActiveHeats = updatedPendingLBHeats.length === 0 && updatedActiveLBHeats.length === 0
  
  // LB Finale wenn: 3-4 Piloten im Pool und WB ready für Grand Finale
  const canGenerateLBFinale = wbReadyForGrandFinale && 
                               !lbFinaleExists &&
                               newLoserPool.size >= POOL_THRESHOLDS.MIN_FOR_FINALE &&
                               newLoserPool.size <= POOL_THRESHOLDS.MIN_FOR_REGULAR_HEAT &&
                               updatedLbNoActiveHeats
                               
  if (canGenerateLBFinale) {
    // LB Finale (3-4 pilots - Top 2 kommen weiter ins Grand Finale)
    const lbRoundNumber = getCurrentRound('loser')
    const pilots = Array.from(newLoserPool)
    const lbFinale: Heat = {
      id: `${HEAT_ID_PREFIXES.LB_FINALE}${crypto.randomUUID()}`,
      heatNumber: updatedHeats.length + 1,
      pilotIds: pilots,
      status: 'pending',
      bracketType: 'loser',
      isFinale: true,
      roundName: 'LB Finale',
      roundNumber: lbRoundNumber
    }
    updatedHeats = [...updatedHeats, lbFinale]
    generatedHeats.push(lbFinale)
    newLoserPool.clear()
  } else if (wbReadyForGrandFinale && !lbFinaleExists &&
             newLoserPool.size === POOL_THRESHOLDS.DIRECT_QUALIFY_COUNT &&
             updatedLbNoActiveHeats) {
    // LB Direct Qualify: 2 Piloten → beide direkt als LB-Finalisten markieren
    // Kein Heat nötig - beide kommen ins Grand Finale
    const pilots = Array.from(newLoserPool)
    pilots.forEach((pilotId) => {
      pilotBracketStateUpdates[pilotId] = {
        bracket: 'grand_finale',
        roundReached: 0,
        bracketOrigin: 'lb'
      }
    })
    // Pool leeren - Piloten sind jetzt "virtuelle LB Finalisten"
    newLoserPool.clear()
  }

  // ===== GRAND FINALE GENERATION =====

  const wbFinaleHeat = updatedHeats.find(h => h.bracketType === 'winner' && h.isFinale)
  const lbFinaleHeat = updatedHeats.find(h => h.bracketType === 'loser' && h.isFinale)
  const grandFinaleExists = updatedHeats.some(h => h.bracketType === 'grand_finale' || h.bracketType === 'finale')

  // Sammle alle Piloten die für Grand Finale qualifiziert sind
  // Entweder durch Finale-Heat-Ergebnis ODER durch Direct-Qualify
  
  // WB Finalisten: Entweder aus WB Finale (Top 2) oder Direct-Qualify
  let wbFinalists: string[] = []
  if (wbFinaleHeat?.status === 'completed' && wbFinaleHeat.results?.rankings) {
    // Aus WB Finale: Top 2
    wbFinalists = wbFinaleHeat.results.rankings
      .filter(r => r.rank <= 2)
      .sort((a, b) => a.rank - b.rank)
      .map(r => r.pilotId)
  } else {
    // Direct-Qualify: Piloten die bereits als WB grand_finale markiert sind
    wbFinalists = Object.entries(pilotBracketStateUpdates)
      .filter(([_, state]) => state.bracketOrigin === 'wb' && state.bracket === 'grand_finale')
      .map(([pilotId]) => pilotId)
  }

  // LB Finalisten: Entweder aus LB Finale (Top 2) oder Direct-Qualify
  let lbFinalists: string[] = []
  if (lbFinaleHeat?.status === 'completed' && lbFinaleHeat.results?.rankings) {
    // Aus LB Finale: Top 2
    lbFinalists = lbFinaleHeat.results.rankings
      .filter(r => r.rank <= 2)
      .sort((a, b) => a.rank - b.rank)
      .map(r => r.pilotId)
  } else {
    // Direct-Qualify: Piloten die bereits als LB grand_finale markiert sind
    lbFinalists = Object.entries(pilotBracketStateUpdates)
      .filter(([_, state]) => state.bracketOrigin === 'lb' && state.bracket === 'grand_finale')
      .map(([pilotId]) => pilotId)
  }

  // Grand Finale generieren wenn wir genau 2 WB + 2 LB Finalisten haben
  if (!grandFinaleExists && wbFinalists.length === 2 && lbFinalists.length === 2) {
    const gfPilots = [...wbFinalists, ...lbFinalists]
    const uniquePilots = [...new Set(gfPilots)]

    if (uniquePilots.length === 4) {
      // bracketOrigin setzen für Piloten die noch nicht markiert sind (aus Finale-Heats)
      if (wbFinaleHeat?.status === 'completed') {
        pilotBracketStateUpdates[wbFinalists[0]] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
        pilotBracketStateUpdates[wbFinalists[1]] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
      }
      if (lbFinaleHeat?.status === 'completed') {
        pilotBracketStateUpdates[lbFinalists[0]] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' }
        pilotBracketStateUpdates[lbFinalists[1]] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' }
      }

      const grandFinale: Heat = {
        id: `${HEAT_ID_PREFIXES.GRAND_FINALE}${crypto.randomUUID()}`,
        heatNumber: updatedHeats.length + 1,
        pilotIds: [wbFinalists[0], wbFinalists[1], lbFinalists[0], lbFinalists[1]],  // 4 Piloten!
        status: 'pending',
        bracketType: 'grand_finale',
        isFinale: true,
        roundName: 'Grand Finale'
      }
      updatedHeats = [...updatedHeats, grandFinale]
      generatedHeats.push(grandFinale)
      newPhase = 'finale'
    }
  }

  return {
    newHeats: generatedHeats,
    updatedWinnerPool: newWinnerPool,
    updatedLoserPool: newLoserPool,
    newPhase,
    pilotBracketStateUpdates
  }
}

/**
 * Appends generated heats to the current heats array
 * Helper für Konsistenz mit bestehender Logik
 */
export function appendGeneratedHeats(heats: Heat[], newHeats: Heat[]): Heat[] {
  return [...heats, ...newHeats]
}

// ============================================================================
// Legacy exports for test compatibility (deprecated, will be removed)
// ============================================================================

export function processQualiHeatCompletion(): HeatCompletionResult {
  throw new Error('processQualiHeatCompletion is deprecated - use submitHeatResults directly')
}

export function processWBHeatCompletion(): HeatCompletionResult {
  throw new Error('processWBHeatCompletion is deprecated - use submitHeatResults directly')
}

export function processLBHeatCompletion(): HeatCompletionResult {
  throw new Error('processLBHeatCompletion is deprecated - use submitHeatResults directly')
}

export function processFinaleCompletion(): HeatCompletionResult {
  throw new Error('processFinaleCompletion is deprecated - use submitHeatResults directly')
}
