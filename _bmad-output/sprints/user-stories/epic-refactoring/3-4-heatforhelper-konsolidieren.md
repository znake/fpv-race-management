# Story 3.4: HeatForHelper und Heat Types konsolidieren

**Epic:** Utils & Types Refactoring
**Aufwand:** XS
**Priorität:** 5 (Sprint 5)
**Abhängigkeiten:** Story 3.3 muss abgeschlossen sein (Heat Type in types/tournament.ts)

## Beschreibung

Als Entwickler möchte ich die doppelte Type-Definition von `HeatForHelper` (tournamentStore.ts Zeile 22-34) eliminieren und stattdessen den zentralen `Heat` Type nutzen, damit keine Inkonsistenzen zwischen quasi-identischen Types entstehen können.

## Akzeptanzkriterien

- [ ] AC1: `HeatForHelper` Interface in tournamentStore.ts wird entfernt
- [ ] AC2: Helper-Funktionen `createWBHeatFromPool()` und `createLBHeatFromPool()` nutzen den zentralen `Heat` Type
- [ ] AC3: Falls Unterschiede bestehen, wird ein `Pick<Heat, ...>` oder `Partial<Heat>` verwendet
- [ ] AC4: Alle Tests laufen weiterhin erfolgreich
- [ ] AC5: Kein Funktionalitätsverlust durch die Konsolidierung

## Technische Details

### Betroffene Dateien
- `src/stores/tournamentStore.ts` → HeatForHelper entfernen
- `src/lib/bracket-logic.ts` → Falls Helper dort sind (nach Story 1.4)

### Aktueller Zustand

```typescript
// tournamentStore.ts Zeile 22-34
interface HeatForHelper {
  id: string
  heatNumber: number
  pilotIds: string[]
  status: 'pending' | 'active' | 'completed'
  bracketType?: 'loser' | 'grand_finale' | 'qualification' | 'winner' | 'finale'
  isFinale?: boolean
  roundName?: string
  results?: { rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]; completedAt?: string }
}

// tournamentStore.ts Zeile 125-138
export interface Heat {
  id: string
  heatNumber: number
  pilotIds: string[]
  status: 'pending' | 'active' | 'completed'
  bracketType?: 'loser' | 'grand_finale' | 'qualification' | 'winner' | 'finale'
  isFinale?: boolean
  roundName?: string
  results?: { rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]; completedAt?: string }
}
```

**Beobachtung:** Die Interfaces sind **identisch**!

### Ziel-Zustand

```typescript
// tournamentStore.ts

// HeatForHelper ENTFERNT

// Import des zentralen Heat Types
import type { Heat, HeatResults } from '../types';

// Falls ein partieller Type benötigt wird:
type HeatInput = Omit<Heat, 'results'> & { results?: HeatResults };
// ODER einfach Heat direkt verwenden
```

### Anpassung der Helper-Funktionen

Falls die Helper noch im Store sind (vor Story 1.4):
```typescript
function createWBHeatFromPool(
  winnerPool: Set<string>,
  currentHeats: Heat[]  // statt HeatForHelper[]
): { heat: Omit<Heat, 'results'> | null; updatedPool: Set<string> }
```

Falls die Helper in bracket-logic.ts sind (nach Story 1.4):
```typescript
// bracket-logic.ts
import type { Heat } from '../types';

export function createWBHeatFromPool(
  winnerPool: Set<string>,
  currentHeats: Pick<Heat, 'heatNumber'>[]
): { heat: Omit<Heat, 'results'> | null; updatedPool: Set<string> }
```

## Testplan

1. `npx tsc --noEmit` - TypeScript-Kompilierung ohne Fehler
2. `npm test` - alle Tests müssen grün bleiben
3. Bestätige dass `HeatForHelper` nirgends mehr vorkommt:
   ```bash
   grep -r "HeatForHelper" src/
   ```
