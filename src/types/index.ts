// src/types/index.ts

// CSV Types
export type {
  CSVImportResult,
  CSVImportError,
  DuplicatePilot,
  CSVImportState,
} from './csv';

// Schema Types (re-export from schemas)
export type { Pilot, PilotInput, Ranking, RankPosition, HeatResults } from '@/lib/schemas';

// Tournament Types
export type {
  TournamentPhase,
  Heat,
  Top4Pilots,
  TournamentStateData,
  PilotBracketState,
} from './tournament';

// Phase 4: Bracket-Structure-Types entfernt - heats[] ist Single Source of Truth
// BracketType wird jetzt direkt in Heat.bracketType definiert
