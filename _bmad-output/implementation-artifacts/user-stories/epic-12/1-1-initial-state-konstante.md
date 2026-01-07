# Story 1.1: Initial State als Konstante extrahieren

**Epic:** Store Refactoring
**Aufwand:** XS
**Priorität:** 1 (Sprint 1)
**Abhängigkeiten:** Keine

## Beschreibung

Als Entwickler möchte ich den Initial-State des Tournament-Stores als wiederverwendbare Konstante `INITIAL_TOURNAMENT_STATE` extrahieren, damit Reset-Funktionen DRY werden und der Store-Code übersichtlicher wird.

## Akzeptanzkriterien

- [ ] AC1: Neue Konstante `INITIAL_TOURNAMENT_STATE` enthält alle State-Felder mit ihren Default-Werten
- [ ] AC2: Die Konstante ist typisiert (z.B. mit `Omit<TournamentState, 'actions...'>` oder neuem Interface)
- [ ] AC3: Der Store-Initialwert verwendet `...INITIAL_TOURNAMENT_STATE` statt manueller Property-Auflistung
- [ ] AC4: Alle bestehenden Tests bleiben grün

## Technische Details

### Betroffene Dateien
- `src/stores/tournamentStore.ts`

### Implementierungshinweise

```typescript
// Am Dateianfang, nach Imports:
const INITIAL_TOURNAMENT_STATE = {
  pilots: [],
  tournamentStarted: false,
  tournamentPhase: 'setup' as TournamentPhase,
  heats: [],
  currentHeatIndex: 0,
  winnerPilots: [],
  loserPilots: [],
  eliminatedPilots: [],
  loserPool: [],
  winnerPool: [],
  grandFinalePool: [],
  isQualificationComplete: false,
  isWBFinaleComplete: false,
  isLBFinaleComplete: false,
  isGrandFinaleComplete: false,
  fullBracketStructure: null,
  lastCompletedBracketType: null,
} as const;

// Im Store:
export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      ...INITIAL_TOURNAMENT_STATE,
      // Actions...
    }),
    // ...
  )
);
```

### Referenz
- Aktuelle State-Definition: Zeilen 239-256 in `tournamentStore.ts`

## Testplan

1. `npm test` - alle Tests müssen grün bleiben
2. `npm run build` - Build muss erfolgreich sein
3. Manuelle Prüfung: Store initialisiert korrekt beim App-Start
