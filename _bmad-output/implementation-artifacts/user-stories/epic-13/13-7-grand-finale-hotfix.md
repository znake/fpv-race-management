# Story 13.7: Grand Finale Hotfix

Status: completed

## Story

As a Turnierleiter,
I want das Grand Finale korrekt mit 4 Piloten generiert wird,
so that das Turnier regelkonform und fair abgeschlossen werden kann.

## Hintergrund

Bei der Kurskorrektur-Analyse am 2026-01-09 wurde festgestellt, dass die automatische Grand Finale Generierung in `submitHeatResults()` fehlerhaft ist:
- Nur 2 Piloten statt 4 werden ins Grand Finale genommen
- Nur Rang 1 von WB/LB Finale wird berücksichtigt (statt Rang 1+2)
- `pilotBracketStates` wird nicht gesetzt (WB/LB Tags fehlen)
- Keine Duplikat-Validierung (derselbe Pilot kann zweimal erscheinen)

Die manuelle `generateGrandFinale()` Funktion ist korrekt implementiert, wird aber nie aufgerufen.

## Akzeptanzkriterien

1. **AC1:** Grand Finale enthält genau 4 verschiedene Piloten
2. **AC2:** 2 Piloten aus WB Finale (Rang 1+2) - nie verloren
3. **AC3:** 2 Piloten aus LB Finale (Rang 1+2) - 1x verloren
4. **AC4:** `pilotBracketStates` wird mit korrektem `bracketOrigin` ('wb'/'lb') gesetzt
5. **AC5:** Duplikat-Validierung verhindert dass ein Pilot zweimal im GF erscheint
6. **AC6:** Test mit 14 Piloten funktioniert korrekt (kein Pilot doppelt)
7. **AC7:** Alle existierenden Tests bestehen weiterhin

## Tasks / Subtasks

- [x] Task 1: `submitHeatResults()` Grand Finale Generierung fixen (AC: #1, #2, #3)
  - [x] 1.1: WB Finale Rang 1+2 für Grand Finale nehmen (nicht nur Rang 1)
  - [x] 1.2: LB Finale Rang 1+2 für Grand Finale nehmen (nicht nur Rang 1)
  - [x] 1.3: `pilotIds` Array mit 4 Piloten erstellen: [WB1, WB2, LB1, LB2]

- [x] Task 2: `pilotBracketStates` korrekt setzen (AC: #4)
  - [x] 2.1: WB-Piloten erhalten `bracketOrigin: 'wb'`
  - [x] 2.2: LB-Piloten erhalten `bracketOrigin: 'lb'`

- [x] Task 3: Duplikat-Validierung (AC: #5)
  - [x] 3.1: Prüfen dass alle 4 Pilot-IDs unique sind
  - [x] 3.2: Grand Finale nur generieren wenn 4 unique Piloten vorhanden

- [x] Task 4: Tests hinzufügen (AC: #6, #7)
  - [x] 4.1: Test für automatische GF-Generierung in `submitHeatResults()`
  - [x] 4.2: Test für Duplikat-Validierung
  - [x] 4.3: Integration-Test mit 14 Piloten
  - [x] 4.4: Bestehende Tests verifizieren

## Dev Notes

### Betroffene Datei

`src/stores/tournamentStore.ts` - Zeile 757-783

### Aktueller (fehlerhafter) Code

```typescript
// Zeile 767-783 - NUR 2 PILOTEN, NUR RANG 1
if (!grandFinaleExists && 
    wbFinaleHeat?.status === 'completed' && 
    lbFinaleHeat?.status === 'completed') {
  const wbWinner = wbFinaleHeat.results?.rankings.find(r => r.rank === 1)?.pilotId  // NUR RANG 1!
  const lbWinner = lbFinaleHeat.results?.rankings.find(r => r.rank === 1)?.pilotId  // NUR RANG 1!
  
  if (wbWinner && lbWinner) {
    const grandFinale: Heat = {
      id: `grand-finale-${crypto.randomUUID()}`,
      heatNumber: updatedHeats.length + 1,
      pilotIds: [wbWinner, lbWinner],  // NUR 2 PILOTEN!
      status: 'pending',
      bracketType: 'grand_finale',
      isFinale: true,
      roundName: 'Grand Finale'
    }
    updatedHeats = [...updatedHeats, grandFinale]
    newPhase = 'finale'
  }
}
```

### Korrigierter Code

```typescript
// Grand Finale Generation - Story 13-3: 4 Piloten
if (!grandFinaleExists && 
    wbFinaleHeat?.status === 'completed' && 
    lbFinaleHeat?.status === 'completed') {
  
  // Get TOP 2 from WB Finale
  const wbRank1 = wbFinaleHeat.results?.rankings.find(r => r.rank === 1)?.pilotId
  const wbRank2 = wbFinaleHeat.results?.rankings.find(r => r.rank === 2)?.pilotId
  
  // Get TOP 2 from LB Finale
  const lbRank1 = lbFinaleHeat.results?.rankings.find(r => r.rank === 1)?.pilotId
  const lbRank2 = lbFinaleHeat.results?.rankings.find(r => r.rank === 2)?.pilotId
  
  // Validate all 4 pilots exist and are unique
  const gfPilots = [wbRank1, wbRank2, lbRank1, lbRank2].filter(Boolean) as string[]
  const uniquePilots = [...new Set(gfPilots)]
  
  if (uniquePilots.length === 4) {
    // Set bracketOrigin for WB/LB tags
    const newPilotBracketStates = { ...get().pilotBracketStates }
    newPilotBracketStates[wbRank1!] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
    newPilotBracketStates[wbRank2!] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
    newPilotBracketStates[lbRank1!] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' }
    newPilotBracketStates[lbRank2!] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' }
    
    const grandFinale: Heat = {
      id: `grand-finale-${crypto.randomUUID()}`,
      heatNumber: updatedHeats.length + 1,
      pilotIds: [wbRank1!, wbRank2!, lbRank1!, lbRank2!],  // 4 Piloten!
      status: 'pending',
      bracketType: 'grand_finale',
      isFinale: true,
      roundName: 'Grand Finale'
    }
    updatedHeats = [...updatedHeats, grandFinale]
    newPhase = 'finale'
    
    // IMPORTANT: pilotBracketStates muss im finalen set() call aktualisiert werden
    // Der Code muss so angepasst werden, dass newPilotBracketStates in den set() call aufgenommen wird
  }
}
```

### WICHTIG: pilotBracketStates Update

Der aktuelle `set()` call am Ende von `submitHeatResults()` (ca. Zeile 829) muss erweitert werden:

```typescript
set({
  heats: updatedHeats,
  currentHeatIndex: newCurrentHeatIndex,
  tournamentPhase: newPhase,
  winnerPilots: Array.from(newWinnerPilots),
  loserPilots: Array.from(newLoserPilots),
  eliminatedPilots: Array.from(newEliminatedPilots),
  loserPool: Array.from(newLoserPool),
  isQualificationComplete: newIsQualificationComplete,
  lastCompletedBracketType: completedBracketType,
  grandFinaleRematchPending: newGrandFinaleRematchPending,
  rematchHeats: newRematchHeats,
  pilotBracketStates: newPilotBracketStates  // NEU HINZUFÜGEN!
})
```

### Test-Vorlage

```typescript
// tests/grand-finale-auto-generation.test.ts
describe('Grand Finale Auto-Generation in submitHeatResults', () => {
  it('should generate Grand Finale with 4 pilots after both finales complete', () => {
    // Setup: WB Finale + LB Finale completed
    // Act: submitHeatResults for LB Finale
    // Assert: Grand Finale has 4 unique pilots
  })
  
  it('should set bracketOrigin correctly for all 4 pilots', () => {
    // Assert: WB pilots have bracketOrigin='wb', LB pilots have bracketOrigin='lb'
  })
  
  it('should not generate Grand Finale if pilots are not unique', () => {
    // Edge case: Same pilot in both finales (should not happen, but validate)
  })
  
  it('should work correctly with 14 pilots', () => {
    // Integration test matching the reported bug scenario
  })
})
```

### References

- [Sprint Change Proposal 2026-01-09]
- [Source: tournament-rules.md#Grand-Finale]
- [Source: 13-3-grand-finale-4-piloten.md]
- [Bug Report: Thomas Weber erscheint zweimal im Grand Finale]
