# Story 4.1: Zentrale Store-Reset-Utility für Tests

**Epic:** Tests & Cleanup
**Aufwand:** S
**Priorität:** 1 (Sprint 1)
**Abhängigkeiten:** Keine

## Beschreibung

Als Entwickler möchte ich eine zentrale `resetTournamentStore()` Funktion für Tests, damit ich nicht in jeder Testdatei eine eigene Implementierung pflegen muss und bei neuen State-Feldern nur eine Stelle anpassen muss.

## Akzeptanzkriterien

- [ ] AC1: Neue Datei `tests/helpers/store-helpers.ts` mit `resetTournamentStore()` Funktion
- [ ] AC2: Die Funktion setzt ALLE State-Felder aus `tournamentStore.ts` auf Initialwerte
- [ ] AC3: Alle 6+ Testdateien mit eigener `resetStore()` Implementierung verwenden die zentrale Funktion
- [ ] AC4: Alle Tests laufen weiterhin erfolgreich (`npm test`)

## Technische Details

### Betroffene Dateien
- Neue Datei: `tests/helpers/store-helpers.ts`
- Neue Datei: `tests/helpers/index.ts` (für Re-Exports)
- Migration: 6+ Testdateien

### Aktuelle Duplikationen

Testdateien mit eigener `resetStore()`:
1. `heat-completion.test.tsx`
2. `heat-results.test.tsx`
3. `reset-functions.test.ts`
4. `heat-assignment.test.ts`
5. `generate-heats.test.tsx`
6. `tournament-start.test.tsx`
7. `loser-pool.test.ts` (inline in beforeEach)

**Problem:** Jede Datei hat unterschiedliche Felder:
```typescript
// Beispiel: manche vergessen loserPool, winnerPool, etc.
```

### Neue Helper-Struktur

```
tests/
├── helpers/
│   ├── index.ts           # Re-exports
│   └── store-helpers.ts   # Store-Utilities
├── *.test.ts(x)
└── ...
```

### tests/helpers/store-helpers.ts

```typescript
import { useTournamentStore } from '../../src/stores/tournamentStore';

/**
 * Resets the tournament store to its initial state.
 * Use this in beforeEach() to ensure test isolation.
 * 
 * @example
 * beforeEach(() => {
 *   resetTournamentStore();
 * });
 */
export function resetTournamentStore(): void {
  useTournamentStore.setState({
    // Pilots
    pilots: [],
    
    // Tournament State
    tournamentStarted: false,
    tournamentPhase: 'setup',
    
    // Heats
    heats: [],
    currentHeatIndex: 0,
    
    // Bracket Progression
    winnerPilots: [],
    loserPilots: [],
    eliminatedPilots: [],
    
    // Pools
    loserPool: [],
    winnerPool: [],
    grandFinalePool: [],
    
    // Completion Flags
    isQualificationComplete: false,
    isWBFinaleComplete: false,
    isLBFinaleComplete: false,
    isGrandFinaleComplete: false,
    
    // Structure
    fullBracketStructure: null,
    lastCompletedBracketType: null,
  });
}

/**
 * Gets the current store state (shorthand for tests)
 */
export function getStoreState() {
  return useTournamentStore.getState();
}

/**
 * Sets up a tournament with the given number of pilots
 * Useful for tests that need a running tournament
 * 
 * @param pilotCount - Number of pilots to add (default: 12)
 */
export function setupTournamentWithPilots(pilotCount: number = 12): void {
  resetTournamentStore();
  const store = useTournamentStore.getState();
  
  for (let i = 0; i < pilotCount; i++) {
    store.addPilot({
      name: `Test Pilot ${i + 1}`,
      imageUrl: `https://example.com/pilot${i + 1}.jpg`,
    });
  }
}

/**
 * Sets up and starts a tournament with heats generated
 * 
 * @param pilotCount - Number of pilots to add (default: 12)
 */
export function setupRunningTournament(pilotCount: number = 12): void {
  setupTournamentWithPilots(pilotCount);
  const store = useTournamentStore.getState();
  store.confirmTournamentStart();
  store.confirmHeatAssignment();
}
```

### tests/helpers/index.ts

```typescript
export {
  resetTournamentStore,
  getStoreState,
  setupTournamentWithPilots,
  setupRunningTournament,
} from './store-helpers';
```

### Migration einer Testdatei

**Vorher (heat-completion.test.tsx):**
```typescript
const resetStore = () => {
  useTournamentStore.setState({
    pilots: [],
    tournamentStarted: false,
    tournamentPhase: 'setup',
    heats: [],
    currentHeatIndex: 0,
    winnerPilots: [],
    loserPilots: [],
    eliminatedPilots: []
    // ACHTUNG: loserPool, winnerPool fehlen!
  })
}

beforeEach(() => {
  resetStore();
});
```

**Nachher:**
```typescript
import { resetTournamentStore } from './helpers';

beforeEach(() => {
  resetTournamentStore();
});
```

## Migrations-Schritte

1. `tests/helpers/` Ordner erstellen
2. `store-helpers.ts` implementieren
3. `index.ts` für Re-Exports erstellen
4. Testdateien einzeln migrieren:
   - Import hinzufügen
   - Lokale `resetStore` Funktion entfernen
   - `beforeEach` aktualisieren
5. Nach jeder Migration: `npm test` ausführen

## Testplan

1. `npm test` - alle Tests müssen grün bleiben
2. Prüfe dass keine lokalen `resetStore` mehr existieren:
   ```bash
   grep -r "const resetStore" tests/
   grep -r "function resetStore" tests/
   ```
