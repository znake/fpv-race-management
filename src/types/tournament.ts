// src/types/tournament.ts

import type { Pilot, HeatResults } from '../lib/schemas'
import type { FullBracketStructure } from '../lib/bracket-structure-generator'

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
  winnerPool: string[]
  grandFinalePool: string[]
  isQualificationComplete: boolean
  isWBFinaleComplete: boolean
  isLBFinaleComplete: boolean
  isGrandFinaleComplete: boolean
  fullBracketStructure: FullBracketStructure | null
  lastCompletedBracketType: 'winner' | 'loser' | 'qualifier' | null
}
