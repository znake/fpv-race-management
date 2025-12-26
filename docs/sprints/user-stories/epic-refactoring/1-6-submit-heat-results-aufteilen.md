# Story 1.6: submitHeatResults() aufteilen

**Epic:** Store Refactoring
**Aufwand:** L
**Priorität:** 5 (Sprint 5)
**Abhängigkeiten:** Story 1.1 (Initial State), Story 1.4 (Helper verschieben)

## Beschreibung

Als Entwickler möchte ich die 300-Zeilen-Funktion `submitHeatResults()` in kleinere, fokussierte Hilfsfunktionen aufteilen, damit der Code lesbar, testbar und wartbar wird.

## Akzeptanzkriterien

- [x] AC1: Neue Pure Functions extrahiert:
  - `processQualiHeatCompletion(rankings, state) → { newWinnerPilots, newLoserPilots, updatedStructure }`
  - `processWBHeatCompletion(rankings, state) → { newWinnerPool, newLoserPool, updatedStructure }`
  - `processLBHeatCompletion(rankings, state) → { newLoserPool, eliminatedPilots, updatedStructure }`
  - `determineNextPhase(heats, currentPhase) → TournamentPhase`
- [x] AC2: `submitHeatResults()` orchestriert nur noch die Hilfsfunktionen und führt das finale `set()` aus
- [x] AC3: Neue Funktionen sind in `bracket-logic.ts` oder einer neuen Datei `src/lib/heat-completion.ts`
- [x] AC4: Jede extrahierte Funktion hat mindestens einen Unit-Test
- [ ] AC5: Alle bestehenden Tests bleiben grün (ein Test fällt aufgrund komplexen Test-Szenarios)
- [x] AC6: Die `submitHeatResults()` Funktion ist nach Refactoring maximal 80 Zeilen lang

## Technische Details

### Betroffene Dateien
- `src/stores/tournamentStore.ts` - Funktion vereinfachen
- `src/lib/bracket-logic.ts` oder `src/lib/heat-completion.ts` - Neue Funktionen

### Aktueller Zustand

Die Funktion `submitHeatResults` (Zeilen 652-951) ist ~300 Zeilen lang und macht:
- Bracket-Logik für Qualification
- Bracket-Logik für Winner/Loser
- Bracket-Logik für Grand Finale
- Pool-Management (Winner, Loser)
- Status-Tracking
- Heat-Generierung
- Phase-Transitions

### Ziel-Struktur

```typescript
// src/lib/heat-completion.ts (neue Datei)

interface HeatCompletionResult {
  updatedHeats: Heat[];
  updatedWinnerPool: string[];
  updatedLoserPool: string[];
  updatedEliminatedPilots: string[];
  updatedStructure: FullBracketStructure | null;
  newPhase?: TournamentPhase;
  isComplete?: boolean;
}

export function processQualiHeatCompletion(
  heat: Heat,
  rankings: Ranking[],
  state: Pick<TournamentState, 'heats' | 'fullBracketStructure' | 'winnerPilots' | 'loserPilots'>
): HeatCompletionResult {
  // ~50 Zeilen fokussierte Quali-Logik
}

export function processWBHeatCompletion(
  heat: Heat,
  rankings: Ranking[],
  state: Pick<TournamentState, 'heats' | 'fullBracketStructure' | 'winnerPool' | 'loserPool'>
): HeatCompletionResult {
  // ~60 Zeilen fokussierte WB-Logik
}

export function processLBHeatCompletion(
  heat: Heat,
  rankings: Ranking[],
  state: Pick<TournamentState, 'heats' | 'fullBracketStructure' | 'loserPool' | 'eliminatedPilots'>
): HeatCompletionResult {
  // ~60 Zeilen fokussierte LB-Logik
}

export function processFinaleCompletion(
  heat: Heat,
  rankings: Ranking[],
  state: Pick<TournamentState, 'heats' | 'fullBracketStructure'>
): HeatCompletionResult {
  // ~30 Zeilen Finale-Logik
}
```

### Vereinfachte submitHeatResults im Store

```typescript
submitHeatResults: (heatId, rankings) => {
  const state = get();
  const heat = state.heats.find(h => h.id === heatId);
  if (!heat) return;
  
  let result: HeatCompletionResult;
  
  switch (heat.bracketType) {
    case 'qualification':
      result = processQualiHeatCompletion(heat, rankings, state);
      break;
    case 'winner':
      result = processWBHeatCompletion(heat, rankings, state);
      break;
    case 'loser':
      result = processLBHeatCompletion(heat, rankings, state);
      break;
    case 'finale':
    case 'grand_finale':
      result = processFinaleCompletion(heat, rankings, state);
      break;
    default:
      return;
  }
  
  set({
    heats: result.updatedHeats,
    winnerPool: result.updatedWinnerPool,
    loserPool: result.updatedLoserPool,
    eliminatedPilots: result.updatedEliminatedPilots,
    fullBracketStructure: result.updatedStructure,
    ...(result.newPhase && { tournamentPhase: result.newPhase }),
  });
}
```

## Testplan

1. Neue Unit-Tests für jede extrahierte Funktion:
   - `processQualiHeatCompletion.test.ts`
   - `processWBHeatCompletion.test.ts`
   - `processLBHeatCompletion.test.ts`
   - `processFinaleCompletion.test.ts`
2. `npm test -- heat-completion.test.tsx` - bestehende Integrationstests
3. `npm test -- bracket-progression.test.ts` - Bracket-Tests
4. `npm test` - alle Tests müssen grün bleiben

## Risiken

- **Hoch:** Dies ist die komplexeste Story - sorgfältiges Testen erforderlich
- **Mittel:** State-Updates müssen atomar bleiben
- **Empfehlung:** Schrittweise refaktorieren, nach jeder extrahierten Funktion Tests laufen lassen
