# Story 3.1: Utils.ts aufteilen in spezialisierte Module

**Epic:** Utils & Types Refactoring
**Aufwand:** S
**Priorität:** 2 (Sprint 2)
**Abhängigkeiten:** Keine

## Beschreibung

Als Entwickler möchte ich die `utils.ts` in spezialisierte Module aufteilen (`csv-parser.ts`, `ui-helpers.ts`, minimales `utils.ts`), damit der Code besser wartbar ist, klare Single-Responsibility hat und Imports gezielter erfolgen können.

## Akzeptanzkriterien

- [ ] AC1: Neue Datei `src/lib/csv-parser.ts` enthält `parseCSV()` und `validateImageUrl()` Funktionen
- [ ] AC2: Neue Datei `src/lib/ui-helpers.ts` enthält `getRankBadgeClasses()`, `getRankBorderClasses()`, `getHeatBorderClasses()`, `sortPilotsByRank()`, `getPilotRank()` und `FALLBACK_PILOT_IMAGE`
- [ ] AC3: `src/lib/utils.ts` enthält nur noch `cn()`, `shuffleArray()`, `debounce()` (ca. 70 Zeilen statt 301)
- [ ] AC4: Alle bestehenden Imports in anderen Dateien sind auf die neuen Modul-Pfade aktualisiert
- [ ] AC5: Alle bestehenden Tests laufen weiterhin erfolgreich
- [ ] AC6: Kein Code wird dupliziert - nur Umstrukturierung

## Technische Details

### Betroffene Dateien
- `src/lib/utils.ts` → Aufsplitten
- `src/lib/csv-parser.ts` → Neu erstellen
- `src/lib/ui-helpers.ts` → Neu erstellen
- Alle Dateien die aus utils.ts importieren → Import-Updates

### Aktueller Zustand von utils.ts (301 Zeilen)

```typescript
// Zeile 1-10: Imports
// Zeile 12-24: cn() - Tailwind Merge ✓ bleibt in utils
// Zeile 26-129: parseCSV() + validateCSVRow() → csv-parser.ts
// Zeile 131-148: validateImageUrl() → csv-parser.ts
// Zeile 150: FALLBACK_PILOT_IMAGE → ui-helpers.ts
// Zeile 152-175: debounce() ✓ bleibt in utils
// Zeile 177-198: shuffleArray() ✓ bleibt in utils
// Zeile 200-220: sortPilotsByRank() → ui-helpers.ts
// Zeile 222-245: getPilotRank() → ui-helpers.ts
// Zeile 247-270: getRankBadgeClasses() → ui-helpers.ts
// Zeile 272-285: getRankBorderClasses() → ui-helpers.ts
// Zeile 287-301: getHeatBorderClasses() → ui-helpers.ts
```

### Neue Dateistruktur

**src/lib/utils.ts (ca. 70 Zeilen)**
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  // ...
}

export function shuffleArray<T>(array: T[]): T[] {
  // Fisher-Yates shuffle
}
```

**src/lib/csv-parser.ts (ca. 130 Zeilen)**
```typescript
import Papa from 'papaparse';
import { csvImportSchema } from './schemas';
import type { CSVImportResult, CSVRow } from '../types/csv';

export async function parseCSV(file: File): Promise<CSVImportResult> {
  // ...
}

export async function validateImageUrl(url: string): Promise<boolean> {
  // ...
}

// Interne Helper
function validateCSVRow(row: CSVRow, index: number) {
  // ...
}
```

**src/lib/ui-helpers.ts (ca. 100 Zeilen)**
```typescript
import type { Pilot } from './schemas';

export const FALLBACK_PILOT_IMAGE = 'data:image/svg+xml,...';

export function sortPilotsByRank(
  pilotIds: string[],
  pilots: Pilot[],
  rankings: { pilotId: string; rank: number }[]
): Pilot[] {
  // ...
}

export function getPilotRank(
  pilotId: string,
  rankings?: { pilotId: string; rank: number }[]
): number | null {
  // ...
}

export function getRankBadgeClasses(rank: 1 | 2 | 3 | 4): string {
  // ...
}

export function getRankBorderClasses(rank?: number): string {
  // ...
}

export function getHeatBorderClasses(
  status: 'pending' | 'active' | 'completed',
  isOnDeck?: boolean
): string {
  // ...
}
```

### Import-Mapping für Migration

| Alter Import | Neuer Import |
|--------------|--------------|
| `parseCSV` from utils | `parseCSV` from csv-parser |
| `validateImageUrl` from utils | `validateImageUrl` from csv-parser |
| `FALLBACK_PILOT_IMAGE` from utils | `FALLBACK_PILOT_IMAGE` from ui-helpers |
| `sortPilotsByRank` from utils | `sortPilotsByRank` from ui-helpers |
| `getPilotRank` from utils | `getPilotRank` from ui-helpers |
| `getRankBadgeClasses` from utils | `getRankBadgeClasses` from ui-helpers |
| `getRankBorderClasses` from utils | `getRankBorderClasses` from ui-helpers |
| `getHeatBorderClasses` from utils | `getHeatBorderClasses` from ui-helpers |
| `cn` from utils | bleibt `cn` from utils |
| `shuffleArray` from utils | bleibt `shuffleArray` from utils |
| `debounce` from utils | bleibt `debounce` from utils |

### Dateien mit Import-Updates

```bash
# Finde alle Imports aus utils
grep -r "from.*lib/utils" src/
grep -r "from.*lib/utils" tests/
```

Erwartete Dateien:
- `src/components/csv-import.tsx` → csv-parser
- `src/components/pilot-card.tsx` → ui-helpers
- `src/components/heat-card.tsx` → ui-helpers
- `src/components/bracket-tree.tsx` → ui-helpers
- `src/hooks/usePilots.ts` → csv-parser (validateImageUrl)
- etc.

## Testplan

1. `npm test -- csv-import.test.tsx` - CSV-Tests
2. `npm test` - alle Tests müssen grün bleiben
3. `npm run build` - Build muss erfolgreich sein
4. Prüfe dass keine "unused import" Warnungen entstehen
