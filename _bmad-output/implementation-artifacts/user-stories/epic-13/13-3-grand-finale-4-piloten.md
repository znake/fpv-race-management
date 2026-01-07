# Story 13.3: Grand Finale mit 4 Piloten

Status: done

## Story

As a Turnierleiter,
I want ein Grand Finale mit 4 Piloten,
so that der Turniersieg in einem epischen Finale entschieden wird.

## Akzeptanzkriterien

1. **AC1:** Grand Finale enthält 2 WB-Finale-Piloten (Platz 1+2 - nie verloren)
2. **AC2:** Grand Finale enthält 2 LB-Finale-Piloten (Platz 1+2 - 1x verloren)
3. **AC3:** Alle 4 Piloten fliegen zusammen in einem Heat
4. **AC4:** Ergebnis bestimmt Platz 1-4 des Turniers (direkt, ohne Rematch in dieser Story)
5. **AC5:** WB/LB Tags zeigen Herkunft jedes Piloten im Grand Finale UI

## Tasks / Subtasks

- [x] Task 1: `generateGrandFinale()` für 4 Piloten anpassen (AC: #1, #2, #3)
  - [x] 1.1: WB-Finale-Gewinner (Platz 1+2) sammeln statt nur Platz 1
  - [x] 1.2: LB-Finale-Gewinner (Platz 1+2) sammeln statt nur Platz 1
  - [x] 1.3: Heat mit 4 Piloten erstellen
  - [x] 1.4: `pilotIds` Reihenfolge: [WB1, WB2, LB1, LB2]

- [x] Task 2: Grand Finale Results für 4 Piloten (AC: #4)
  - [x] 2.1: `submitHeatResults()` akzeptiert 4 Rankings für Grand Finale
  - [x] 2.2: Platzierungen 1-4 werden direkt aus Rankings übernommen
  - [x] 2.3: Tournament wird auf 'completed' gesetzt

- [x] Task 3: `getTop4Pilots()` anpassen (AC: #4)
  - [x] 3.1: Liest Platz 1-4 direkt aus Grand Finale Rankings
  - [x] 3.2: Keine komplizierte Logik mehr (WB Finale Loser etc.)

- [x] Task 4: `pilotBracketStates` mit `bracketOrigin` erweitern (AC: #5)
  - [x] 4.1: Neues Feld `bracketOrigin: 'wb' | 'lb'` zu PilotBracketState
  - [x] 4.2: Im Grand Finale: WB-Piloten haben origin='wb', LB-Piloten haben origin='lb'

- [x] Task 5: GrandFinaleSection UI anpassen (AC: #5)
  - [x] 5.1: Heat-Box für 4 Piloten statt 2
  - [x] 5.2: WB/LB Tags bei jedem Piloten anzeigen (nutzt bracketOrigin)
  - [x] 5.3: Visuelle Unterscheidung WB (grün) vs LB (orange)

- [x] Task 6: Unit Tests
  - [x] 6.1: Test: Grand Finale hat genau 4 Piloten
  - [x] 6.2: Test: 2 WB + 2 LB Piloten
  - [x] 6.3: Test: Platzierung 1-4 aus Rankings
  - [x] 6.4: Test: bracketOrigin wird korrekt gesetzt

## Dev Notes

### Architektur-Kontext

**Aktuelles Grand Finale (2 Piloten):**
```typescript
// Aktuell in generateGrandFinale()
pilotIds: [wbWinner, lbWinner]  // Nur 2 Piloten
```

**Neues Grand Finale (4 Piloten):**
```typescript
// Neu
pilotIds: [wbFinaleRank1, wbFinaleRank2, lbFinaleRank1, lbFinaleRank2]  // 4 Piloten
```

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/stores/tournamentStore.ts` | generateGrandFinale(), getTop4Pilots() |
| `src/types/tournament.ts` | PilotBracketState.bracketOrigin |
| `src/components/bracket/sections/GrandFinaleSection.tsx` | UI für 4 Piloten |
| `tests/grand-finale-tags.test.tsx` | Anpassen für 4 Piloten |
| `tests/finale-ceremony.test.tsx` | Anpassen |

### Code-Pattern für `generateGrandFinale`

```typescript
generateGrandFinale: () => {
  const { heats, pilotBracketStates } = get()
  
  // Find WB and LB Finale heats
  const wbFinaleHeat = heats.find(h => 
    h.bracketType === 'winner' && h.isFinale && h.status === 'completed'
  )
  const lbFinaleHeat = heats.find(h => 
    h.bracketType === 'loser' && h.isFinale && h.status === 'completed'
  )
  
  if (!wbFinaleHeat?.results || !lbFinaleHeat?.results) return null
  
  // Get TOP 2 from each finale (not just winner!)
  const wbRank1 = wbFinaleHeat.results.rankings.find(r => r.rank === 1)?.pilotId
  const wbRank2 = wbFinaleHeat.results.rankings.find(r => r.rank === 2)?.pilotId
  const lbRank1 = lbFinaleHeat.results.rankings.find(r => r.rank === 1)?.pilotId
  const lbRank2 = lbFinaleHeat.results.rankings.find(r => r.rank === 2)?.pilotId
  
  if (!wbRank1 || !wbRank2 || !lbRank1 || !lbRank2) return null
  
  // Update bracketOrigin for these pilots
  const newPilotStates = new Map(pilotBracketStates)
  newPilotStates.get(wbRank1)!.bracketOrigin = 'wb'
  newPilotStates.get(wbRank2)!.bracketOrigin = 'wb'
  newPilotStates.get(lbRank1)!.bracketOrigin = 'lb'
  newPilotStates.get(lbRank2)!.bracketOrigin = 'lb'
  
  const finaleHeat: Heat = {
    id: `grand-finale-${crypto.randomUUID()}`,
    heatNumber: heats.length + 1,
    pilotIds: [wbRank1, wbRank2, lbRank1, lbRank2],  // 4 Piloten!
    status: 'active',
    bracketType: 'grand_finale',
    isFinale: true,
    roundName: 'Grand Finale'
  }
  
  set({
    heats: [...heats, finaleHeat],
    pilotBracketStates: newPilotStates,
    tournamentPhase: 'finale'
  })

  return finaleHeat
}
```

### UI-Änderung für GrandFinaleSection

Die bestehende Komponente zeigt aktuell 2 Piloten nebeneinander. Für 4 Piloten:

```tsx
// GrandFinaleSection.tsx
<div className="grid grid-cols-2 gap-4">
  {/* WB Piloten */}
  <div className="border-l-4 border-winner-green">
    <PilotCard pilot={wbPilot1} tag="WB" />
    <PilotCard pilot={wbPilot2} tag="WB" />
  </div>
  {/* LB Piloten */}
  <div className="border-l-4 border-neon-pink">
    <PilotCard pilot={lbPilot1} tag="LB" />
    <PilotCard pilot={lbPilot2} tag="LB" />
  </div>
</div>
```

### Testing-Strategie

1. **Unit Tests** für generateGrandFinale mit 4 Piloten
2. **UI Tests** für GrandFinaleSection Rendering
3. **Integration Test**: Kompletter Flow bis Grand Finale mit 8 Piloten

### References

- [Source: _bmad-output/planning-artifacts/epic-13-runden-basiertes-bracket-redesign.md#US-13.3]
- [Source: _bmad-output/planning-artifacts/epic-12-rules.md#Grand-Finale]
- [Source: src/stores/tournamentStore.ts#generateGrandFinale]
- [Source: src/components/bracket/sections/GrandFinaleSection.tsx]

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (Anthropic)

### Debug Log References

Keine Debugging-Probleme aufgetreten.

### Completion Notes List

1. **Task 1-4 (Store-Logik):** 
   - `generateGrandFinale()` angepasst um 4 Piloten zu sammeln (WB Rank 1+2, LB Rank 1+2)
   - `submitHeatResults()` in automatischer Grand Finale Generierung ebenfalls für 4 Piloten aktualisiert
   - `getTop4Pilots()` vereinfacht - liest jetzt direkt Platz 1-4 aus Grand Finale Rankings
   - `PilotBracketState` um optionales `bracketOrigin: 'wb' | 'lb'` Feld erweitert
   - `pilotBracketStates` wird bei Grand Finale Generierung mit korrekten bracketOrigin Werten befüllt

2. **Task 5 (UI):**
   - `GrandFinaleHeatBox` komplett redesigned für 4 Piloten mit 2x2 Grid Layout
   - WB Piloten (Index 0+1): Grüner Border, "Winner Bracket" Header
   - LB Piloten (Index 2+3): Pink/Orange Border, "Loser Bracket" Header
   - WB/LB Tags werden aus `bracketOrigin` via `getPilotBracketOrigin()` ermittelt

3. **Task 6 (Tests):**
   - Neue Testdatei `tests/grand-finale-4-piloten.test.ts` mit 14 Tests erstellt
   - Tests für alle ACs: 4 Piloten, korrekte Reihenfolge, Rankings 1-4, bracketOrigin
   - Bestehende Tests angepasst: `lb-finale.test.ts`, `eight-pilots-flow.test.ts`

4. **Breaking Changes:**
   - Grand Finale hat jetzt 4 Piloten statt 2
   - Tests die auf 2 Piloten prüften wurden aktualisiert

### File List

| Datei | Änderung |
|-------|----------|
| `src/stores/tournamentStore.ts` | `generateGrandFinale()` für 4 Piloten, `getTop4Pilots()` vereinfacht, automatische GF-Generierung in `submitHeatResults()` |
| `src/types/tournament.ts` | `PilotBracketState.bracketOrigin?: 'wb' \| 'lb'` hinzugefügt |
| `src/components/bracket/sections/GrandFinaleHeatBox.tsx` | Komplett redesigned für 4 Piloten mit WB/LB Gruppierung |
| `tests/grand-finale-4-piloten.test.ts` | **NEU** - 14 Tests für Story 13-3 |
| `tests/lb-finale.test.ts` | Test für 4 Piloten in Grand Finale aktualisiert |
| `tests/eight-pilots-flow.test.ts` | Grand Finale Test für 4 Piloten aktualisiert |
