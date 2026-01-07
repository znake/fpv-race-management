# Story 1.4: Helper-Funktionen nach bracket-logic.ts verschieben

**Epic:** Store Refactoring
**Aufwand:** S
**Priorität:** 2 (Sprint 2)
**Abhängigkeiten:** Story 1.3 idealerweise zuerst (aber nicht blockierend)

## Beschreibung

Als Entwickler möchte ich die Pure Functions `createWBHeatFromPool()` und `createLBHeatFromPool()` (Zeile 47-116) nach `src/lib/bracket-logic.ts` verschieben, damit alle Bracket-bezogene Logik an einem Ort zentralisiert ist und der Store nur State-Mutation enthält.

## Akzeptanzkriterien

- [ ] AC1: Beide Funktionen sind in `bracket-logic.ts` exportiert
- [ ] AC2: Import in `tournamentStore.ts` hinzugefügt
- [ ] AC3: Funktionen aus `tournamentStore.ts` entfernt (nur Import bleibt)
- [ ] AC4: Rückgabetyp verwendet `Heat` statt `HeatForHelper` (nach Story 1.3)
- [ ] AC5: Unit-Tests für die Funktionen existieren in `tests/`
- [ ] AC6: Alle bestehenden Tests bleiben grün

## Technische Details

### Betroffene Dateien
- `src/stores/tournamentStore.ts` - Funktionen entfernen, Import hinzufügen
- `src/lib/bracket-logic.ts` - Funktionen hinzufügen

### Zu verschiebende Funktionen

```typescript
// Zeile 47-75 in tournamentStore.ts
function createWBHeatFromPool(
  winnerPool: Set<string>,
  currentHeats: HeatForHelper[]
): { heat: HeatForHelper | null; updatedPool: Set<string> }

// Zeile 86-116 in tournamentStore.ts  
function createLBHeatFromPool(
  loserPool: Set<string>,
  currentHeats: HeatForHelper[],
  minPilots: number = 4
): { heat: HeatForHelper | null; updatedPool: Set<string> }
```

### Ziel in bracket-logic.ts

```typescript
// Am Ende von bracket-logic.ts hinzufügen:

/**
 * Creates a new Winner Bracket heat from the winner pool
 * @param winnerPool - Set of pilot IDs in the winner pool
 * @param currentHeats - Current heats to determine next heat number
 * @returns New heat and updated pool, or null if not enough pilots
 */
export function createWBHeatFromPool(
  winnerPool: Set<string>,
  currentHeats: Pick<Heat, 'heatNumber'>[]
): { heat: Omit<Heat, 'results'> | null; updatedPool: Set<string> } {
  // ... Implementierung
}

/**
 * Creates a new Loser Bracket heat from the loser pool
 * @param loserPool - Set of pilot IDs in the loser pool
 * @param currentHeats - Current heats to determine next heat number
 * @param minPilots - Minimum pilots required (default: 4)
 * @returns New heat and updated pool, or null if not enough pilots
 */
export function createLBHeatFromPool(
  loserPool: Set<string>,
  currentHeats: Pick<Heat, 'heatNumber'>[],
  minPilots: number = 4
): { heat: Omit<Heat, 'results'> | null; updatedPool: Set<string> } {
  // ... Implementierung
}
```

### Import in tournamentStore.ts

```typescript
import { 
  // ... bestehende Imports
  createWBHeatFromPool,
  createLBHeatFromPool,
} from '../lib/bracket-logic';
```

## Testplan

1. Neue Unit-Tests für `createWBHeatFromPool` und `createLBHeatFromPool` erstellen
2. `npm test` - alle Tests müssen grün bleiben
3. `npm run build` - Build muss erfolgreich sein
