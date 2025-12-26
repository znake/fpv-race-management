# Story 3.3: Types-Ordner mit index.ts für Re-Exports erstellen

**Epic:** Utils & Types Refactoring
**Aufwand:** M
**Priorität:** 4 (Sprint 4)
**Abhängigkeiten:** Story 3.2 muss abgeschlossen sein (für Ranking Type)

## Beschreibung

Als Entwickler möchte ich einen zentralen `src/types/index.ts` für Type-Re-Exports, damit alle projektweiten Types an einem Ort importiert werden können und die Import-Pfade konsistent sind.

## Akzeptanzkriterien

- [ ] AC1: `src/types/index.ts` existiert und re-exportiert alle Types aus `csv.ts`
- [ ] AC2: `src/types/index.ts` re-exportiert relevante Types aus `schemas.ts` (Pilot, Ranking, HeatResults)
- [ ] AC3: `src/types/tournament.ts` existiert und enthält `Heat`, `TournamentPhase`, `TournamentState` Interface-Definitionen
- [ ] AC4: `src/types/index.ts` re-exportiert Types aus `tournament.ts`
- [ ] AC5: Komponenten können via `import { Pilot, Heat, Ranking } from '../types'` importieren
- [ ] AC6: `Top4Pilots` Type aus `victory-ceremony.tsx` wird nach `src/types/tournament.ts` verschoben

## Technische Details

### Betroffene Dateien
- `src/types/index.ts` → Neu erstellen
- `src/types/tournament.ts` → Neu erstellen
- `src/types/csv.ts` → Unverändert
- `src/components/victory-ceremony.tsx` → Top4Pilots auslagern
- `src/stores/tournamentStore.ts` → Types importieren statt inline definieren

### Neue Dateistruktur

```
src/types/
├── index.ts          # Re-exports aller Types
├── csv.ts            # Existiert bereits
└── tournament.ts     # Neu: Heat, TournamentPhase, etc.
```

### src/types/tournament.ts

```typescript
// src/types/tournament.ts

import type { Pilot, Ranking, HeatResults } from '../lib/schemas';
import type { FullBracketStructure, BracketType } from '../lib/bracket-structure-generator';

/**
 * Tournament phase states
 */
export type TournamentPhase = 
  | 'setup' 
  | 'qualification' 
  | 'bracket' 
  | 'grand_finale' 
  | 'completed';

/**
 * Heat status
 */
export type HeatStatus = 'pending' | 'active' | 'completed';

/**
 * A single heat in the tournament
 */
export interface Heat {
  id: string;
  heatNumber: number;
  pilotIds: string[];
  status: HeatStatus;
  bracketType?: BracketType;
  isFinale?: boolean;
  roundName?: string;
  results?: HeatResults;
}

/**
 * Top 4 pilots for victory ceremony
 */
export interface Top4Pilots {
  place1: Pilot | null;
  place2: Pilot | null;
  place3: Pilot | null;
  place4: Pilot | null;
}

/**
 * Full tournament state (data only, no actions)
 */
export interface TournamentStateData {
  pilots: Pilot[];
  tournamentStarted: boolean;
  tournamentPhase: TournamentPhase;
  heats: Heat[];
  currentHeatIndex: number;
  winnerPilots: string[];
  loserPilots: string[];
  eliminatedPilots: string[];
  loserPool: string[];
  winnerPool: string[];
  grandFinalePool: string[];
  isQualificationComplete: boolean;
  isWBFinaleComplete: boolean;
  isLBFinaleComplete: boolean;
  isGrandFinaleComplete: boolean;
  fullBracketStructure: FullBracketStructure | null;
  lastCompletedBracketType: BracketType | null;
}
```

### src/types/index.ts

```typescript
// src/types/index.ts

// CSV Types
export type {
  CSVRow,
  CSVImportResult,
  CSVImportError,
  DuplicatePilot,
  CSVImportState,
  ImportProgress,
  ImportStatus,
} from './csv';

// Schema Types (re-export from schemas)
export type { Pilot, PilotInput, Ranking, RankPosition, HeatResults } from '../lib/schemas';

// Tournament Types
export type {
  TournamentPhase,
  HeatStatus,
  Heat,
  Top4Pilots,
  TournamentStateData,
} from './tournament';

// Bracket Types (re-export commonly used)
export type {
  BracketType,
  BracketHeat,
  BracketRound,
  FullBracketStructure,
} from '../lib/bracket-structure-generator';
```

### Migration in Komponenten

**Vorher:**
```typescript
import type { Pilot } from '../lib/schemas';
import type { Heat } from '../stores/tournamentStore';
```

**Nachher:**
```typescript
import type { Pilot, Heat } from '../types';
```

### Migration in victory-ceremony.tsx

```typescript
// Vorher (inline in victory-ceremony.tsx):
interface Top4Pilots {
  place1: Pilot | null;
  // ...
}

// Nachher:
import type { Top4Pilots } from '../types';
```

### Migration in tournamentStore.ts

Der Store kann weiterhin die Interfaces inline haben (für Zustand-Kompatibilität), aber importiert die Basis-Types:

```typescript
import type { Heat, TournamentPhase, TournamentStateData } from '../types';

// TournamentState extends TournamentStateData mit Actions
export interface TournamentState extends TournamentStateData {
  // Actions...
  addPilot: (pilot: PilotInput) => void;
  // etc.
}
```

## Testplan

1. `npx tsc --noEmit` - TypeScript-Kompilierung ohne Fehler
2. `npm test` - alle Tests müssen grün bleiben
3. `npm run build` - Build muss erfolgreich sein
4. Prüfe dass Imports vereinfacht sind
