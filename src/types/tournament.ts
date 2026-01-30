// src/types/tournament.ts

import type { Pilot, HeatResults } from '../lib/schemas'
// Phase 3: fullBracketStructure entfernt - heats[] ist Single Source of Truth

/**
 * Tournament phase states
 */
export type TournamentPhase =
  | 'setup'
  | 'heat-assignment'
  | 'running'
  | 'finale'
  | 'completed'

/**
 * Heat status
 */
export type HeatStatus = 'pending' | 'active' | 'completed'

/**
 * A single heat in the tournament
 */
export interface Heat {
  id: string
  heatNumber: number
  pilotIds: string[]
  status: HeatStatus
  bracketType?: 'loser' | 'grand_finale' | 'qualification' | 'winner' | 'finale'
  isFinale?: boolean
  roundName?: string
  results?: HeatResults
  /** Story 13-1: Runden-Nummer innerhalb des Brackets (1 = erste Runde nach Quali) */
  roundNumber?: number
}

/**
 * Story 13-1: Pilot-Status im Bracket-System
 * Trackt in welchem Bracket ein Pilot ist und welche Runde er erreicht hat
 */
export interface PilotBracketState {
  /** Aktuelles Bracket des Piloten */
  bracket: 'winner' | 'loser' | 'eliminated' | 'grand_finale'
  /** Höchste erreichte Runde in diesem Bracket (1-basiert) */
  roundReached: number
  /** Story 13-3: Herkunft des Piloten im Grand Finale (WB oder LB) */
  bracketOrigin?: 'wb' | 'lb'
}

/**
 * Top 4 pilots for victory ceremony
 */
export interface Top4Pilots {
  place1: Pilot | undefined
  place2: Pilot | undefined
  place3: Pilot | undefined
  place4: Pilot | undefined
}

/**
 * Full tournament state (data only, no actions)
 * Phase 3: fullBracketStructure entfernt - heats[] ist Single Source of Truth
 */
export interface TournamentStateData {
  pilots: Pilot[]
  tournamentStarted: boolean
  tournamentPhase: TournamentPhase
  heats: Heat[]
  currentHeatIndex: number
  winnerPilots: string[]
  loserPilots: string[]
  eliminatedPilots: string[]
  loserPool: string[]
  grandFinalePool: string[]
  isQualificationComplete: boolean
  isWBFinaleComplete: boolean
  isLBFinaleComplete: boolean
  isGrandFinaleComplete: boolean
  lastCompletedBracketType: 'winner' | 'loser' | 'qualifier' | null
}
