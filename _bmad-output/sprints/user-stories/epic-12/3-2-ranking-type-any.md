# Story 3.2: Zentralen Ranking Type erstellen und any-Types eliminieren

**Epic:** Utils & Types Refactoring
**Aufwand:** S
**Priorität:** 2 (Sprint 2)
**Abhängigkeiten:** Idealerweise nach Story 3.1 (aber nicht blockierend)

## Beschreibung

Als Entwickler möchte ich einen zentralen `Ranking` Type in `schemas.ts` definieren und alle `any`-Types im Produktionscode eliminieren, damit die Typsicherheit gewährleistet ist und keine Laufzeitfehler durch fehlende Typisierung entstehen.

## Akzeptanzkriterien

- [ ] AC1: `src/lib/schemas.ts` enthält exportierten Type `RankPosition = 1 | 2 | 3 | 4`
- [ ] AC2: `src/lib/schemas.ts` enthält exportierten Type `Ranking = { pilotId: string; rank: RankPosition }`
- [ ] AC3: `src/lib/schemas.ts` enthält exportierten Type `HeatResults = { rankings: Ranking[]; completedAt?: string }`
- [ ] AC4: `utils.ts` (oder `csv-parser.ts`) Zeile 53 `(row: any, ...)` ist durch korrekten Type ersetzt
- [ ] AC5: `usePilots.ts` Zeile 20 `useRef<Map<string, any>>` ist durch spezifischen Type ersetzt
- [ ] AC6: Alle inline `{ pilotId: string; rank: 1|2|3|4 }[]` Definitionen nutzen den zentralen `Ranking[]` Type
- [ ] AC7: TypeScript strict mode zeigt keine `any`-Warnungen für betroffene Dateien

## Technische Details

### Betroffene Dateien
- `src/lib/schemas.ts` → Neue Types hinzufügen
- `src/lib/utils.ts` oder `src/lib/csv-parser.ts` → any ersetzen
- `src/hooks/usePilots.ts` → any ersetzen
- `src/stores/tournamentStore.ts` → Ranking[] Type nutzen
- `src/lib/bracket-logic.ts` → Ranking[] Type nutzen

### Neue Types in schemas.ts

```typescript
// src/lib/schemas.ts

// Am Ende der Datei hinzufügen:

/**
 * Valid rank positions in a heat (1st to 4th place)
 */
export type RankPosition = 1 | 2 | 3 | 4;

/**
 * A single pilot's ranking in a heat
 */
export interface Ranking {
  pilotId: string;
  rank: RankPosition;
}

/**
 * Complete results for a heat
 */
export interface HeatResults {
  rankings: Ranking[];
  completedAt?: string;
}
```

### any-Type Fixes

**1. csv-parser.ts (ehemals utils.ts Zeile 53)**

```typescript
// Vorher:
results.data.forEach((row: any, index) => {

// Nachher:
interface CSVRawRow {
  name?: string;
  Name?: string;
  pilot?: string;
  Pilot?: string;
  image?: string;
  imageUrl?: string;
  instagram?: string;
  instagramHandle?: string;
  [key: string]: string | undefined;
}

results.data.forEach((row: CSVRawRow, index) => {
```

**2. usePilots.ts Zeile 20**

```typescript
// Vorher:
const optimisticUpdatesRef = useRef<Map<string, any>>(new Map());

// Nachher:
interface OptimisticPilotUpdate {
  name: string;
  imageUrl: string;
}

const optimisticUpdatesRef = useRef<Map<string, OptimisticPilotUpdate>>(new Map());
```

### Stellen für Ranking-Type Migration

Suche nach inline Ranking-Definitionen:
```bash
grep -r "pilotId: string; rank:" src/
grep -r "rank: 1 | 2 | 3 | 4" src/
```

**tournamentStore.ts:**
```typescript
// Vorher (mehrfach):
results?: { rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]; ... }

// Nachher:
import { Ranking, HeatResults } from '../lib/schemas';
results?: HeatResults;
```

**bracket-logic.ts:**
```typescript
// Vorher:
rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]

// Nachher:
import { Ranking } from './schemas';
rankings: Ranking[]
```

**ui-helpers.ts (nach Story 3.1):**
```typescript
// Vorher:
rankings: { pilotId: string; rank: number }[]

// Nachher:
import { Ranking } from './schemas';
rankings: Ranking[]
```

## Testplan

1. `npx tsc --noEmit` - TypeScript-Kompilierung ohne Fehler
2. `npm test -- csv-import.test.tsx` - CSV-Tests
3. `npm test` - alle Tests müssen grün bleiben
4. Prüfe: `grep -r ": any" src/` sollte keine Produktionscode-Treffer zeigen
