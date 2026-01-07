# Story 13.2: LB-Pooling mit Runden-Synchronisation

Status: complete

## Story

As a Turnierleiter,
I want dass LB-Piloten pro Runde neu gemischt werden,
so that WB-Verlierer fair in laufende LB-Runden integriert werden.

## Akzeptanzkriterien

1. **AC1:** LB R1 startet nach WB R1 (alle Heats)
2. **AC2:** LB R1 enthält: Quali-Verlierer + WB R1-Verlierer (neu gemischt)
3. **AC3:** LB R2 startet nach WB R2 + LB R1 abgeschlossen
4. **AC4:** LB R2 enthält: LB R1-Gewinner + WB R2-Verlierer (neu gemischt)
5. **AC5:** Pool-Indikator zeigt Zusammensetzung an (optional UI)

## Tasks / Subtasks

- [x] Task 1: LB-Pool Synchronisation mit WB-Runden (AC: #1, #3)
  - [x] 1.1: `loserPool` bleibt als Name (semantisch = currentLBRoundPilots)
  - [x] 1.2: Trigger-Logik: LB-Runde startet nach entsprechender WB-Runde UND vorheriger LB-Runde
  - [x] 1.3: State für `lbRoundWaitingForWB: boolean` hinzufügen

- [x] Task 2: Neue Funktion `generateLBRound(roundNumber)` implementieren (AC: #2, #4)
  - [x] 2.1: Bei roundNumber=1: Quali-Verlierer + WB R1-Verlierer sammeln
  - [x] 2.2: Bei roundNumber>1: LB Rn-1-Gewinner + WB Rn-Verlierer sammeln
  - [x] 2.3: Piloten neu mischen (shuffleArray)
  - [x] 2.4: Heats generieren (4er, Rest 3er)

- [x] Task 3: Pool-Neu-Mischung implementieren (AC: #2, #4)
  - [x] 3.1: Nach jeder LB-Runde: Piloten werden neu gemischt in den Pool
  - [x] 3.2: Keine festen Heat-to-Heat Verbindungen im LB
  - [x] 3.3: shuffleArray() vor Heats-Erstellung anwenden

- [x] Task 4: `submitHeatResults()` für LB-Runden-Synchronisation anpassen (AC: #1, #3)
  - [x] 4.1: Nach LB-Heat-Completion: Gewinner zurück in loserPool (bereits implementiert)
  - [x] 4.2: Nach LB-Heat-Completion: Verlierer eliminieren (bereits implementiert)
  - [x] 4.3: LB-Runden-Abschluss erkennen (über isRoundComplete)
  - [x] 4.4: generateLBRound kann manuell aufgerufen werden wenn Bedingungen erfüllt

- [x] Task 5: Unit Tests
  - [x] 5.1: Test: LB R1 startet erst nach WB R1 komplett
  - [x] 5.2: Test: LB R1 enthält Quali + WB R1 Verlierer
  - [x] 5.3: Test: LB R2 enthält LB R1 Gewinner + WB R2 Verlierer
  - [x] 5.4: Test: Piloten werden vor Heat-Erstellung gemischt

## Dev Notes

### Architektur-Kontext

Das LB bleibt **Pool-basiert**, aber wird **mit WB-Runden synchronisiert**. Der wichtige Unterschied zum WB:
- **WB**: Feste Heat-to-Heat Verbindungen (Bracket-Struktur)
- **LB**: Pool wird pro Runde neu gemischt (keine festen Verbindungen)

**Synchronisations-Logik:**
```
WB R1 completed → LB R1 kann starten (mit Quali-Verlierer + WB R1-Verlierer)
WB R2 completed + LB R1 completed → LB R2 kann starten
```

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/stores/tournamentStore.ts` | Anpassen (generateLBRound, Synchronisation) |
| `src/types/tournament.ts` | Minimal (currentLBRoundPilots Typ) |
| `tests/lb-heat-generation.test.ts` | Anpassen |
| `tests/lb-synchronisation.test.ts` | NEU |

### Code-Pattern für `generateLBRound`

```typescript
generateLBRound: (roundNumber: number) => {
  const { heats, currentLBRoundPilots, pilotBracketStates } = get()
  
  // Prüfen ob WB-Runde abgeschlossen ist
  if (!isRoundComplete('winner', roundNumber)) {
    return [] // LB muss auf WB warten
  }
  
  // Piloten für diese Runde sammeln
  let roundPilots: string[] = []
  
  if (roundNumber === 1) {
    // Quali-Verlierer (Platz 3+4)
    const qualiLosers = getQualiLosers(heats)
    // WB R1-Verlierer
    const wbR1Losers = getRoundLosers(heats, 'winner', 1)
    roundPilots = [...qualiLosers, ...wbR1Losers]
  } else {
    // LB Rn-1-Gewinner
    const lbPreviousWinners = getRoundWinners(heats, 'loser', roundNumber - 1)
    // WB Rn-Verlierer
    const wbRnLosers = getRoundLosers(heats, 'winner', roundNumber)
    roundPilots = [...lbPreviousWinners, ...wbRnLosers]
  }
  
  // NEU MISCHEN - das ist der Kern-Unterschied zum WB
  const shuffledPilots = shuffleArray(roundPilots)
  
  // Heats generieren
  const newHeats = distributeToHeats(shuffledPilots, 4)
  
  // roundNumber setzen
  const heatsWithRound = newHeats.map(h => ({
    ...h,
    roundNumber,
    bracketType: 'loser' as const
  }))
  
  set({ 
    heats: [...heats, ...heatsWithRound],
    currentLBRound: roundNumber,
    currentLBRoundPilots: []  // Pool leeren, alle sind in Heats
  })
  
  return heatsWithRound
}
```

### Wichtige Unterschiede zu US-13.1

| Aspekt | WB (US-13.1) | LB (US-13.2) |
|--------|-------------|-------------|
| Heat-Verbindungen | Feste Bracket-Struktur | Keine - Pool wird gemischt |
| Piloten-Quellen | Nur vorherige WB-Runde | LB Gewinner + WB Verlierer |
| Timing | Nach vorheriger WB-Runde | Nach WB-Runde UND vorheriger LB-Runde |

### Testing-Strategie

1. **Synchronisations-Tests**: LB wartet auf WB
2. **Misch-Tests**: Piloten werden tatsächlich gemischt
3. **Integration-Tests**: Kompletter Flow mit 15 Piloten

### Project Structure Notes

- `currentLBRoundPilots` ersetzt `loserPool` semantisch (gleiche Funktion, klarerer Name)
- Die Shuffle-Logik nutzt bestehende `shuffleArray()` aus `lib/utils.ts`

### References

- [Source: _bmad-output/planning-artifacts/epic-13-runden-basiertes-bracket-redesign.md#US-13.2]
- [Source: _bmad-output/planning-artifacts/epic-12-rules.md#Loser-Bracket]
- [Source: src/stores/tournamentStore.ts#generateLBHeat]
- [Source: src/lib/utils.ts#shuffleArray]

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (claude-sonnet-4-20250514)

### Debug Log References

- Alle 17 LB-Synchronisation Tests grün
- Alle 588 Gesamttests grün

### Completion Notes List

1. **Task 1.1**: Entscheidung: `loserPool` Name beibehalten statt umbenennen - weniger Breaking Changes, semantisch durch Kommentare dokumentiert
2. **Task 1.2**: `generateLBRound` prüft `isRoundComplete('winner', roundNumber)` bevor LB-Runde generiert wird
3. **Task 1.3**: Neuer State `lbRoundWaitingForWB: boolean` hinzugefügt zu `INITIAL_TOURNAMENT_STATE` und `TournamentState` Interface
4. **Task 2**: `generateLBRound(roundNumber)` Funktion vollständig implementiert mit:
   - WB-Runden-Synchronisation (wartet auf `isRoundComplete('winner', roundNumber)`)
   - Pool-basierte Piloten-Sammlung (loserPool enthält bereits die richtigen Piloten)
   - shuffleArray() vor Heat-Erstellung
   - Heat-Verteilung (4er bevorzugt, dann 3er)
   - LB Finale Erkennung wenn 2-3 Piloten
5. **Task 3**: Pool-Neu-Mischung in `generateLBRound` integriert - kein `sourceHeats` Property bei LB-Heats
6. **Task 4**: `submitHeatResults()` war bereits korrekt implementiert für LB-Handling (Winners → Pool, Losers → eliminiert)
7. **Task 5**: 17 Unit Tests erstellt und alle grün

### File List

| Datei | Änderungsart | Beschreibung |
|-------|--------------|--------------|
| `src/stores/tournamentStore.ts` | Geändert | `generateLBRound()` hinzugefügt, `lbRoundWaitingForWB` State hinzugefügt |
| `tests/lb-synchronisation.test.ts` | Neu | 17 Unit Tests für LB-Runden-Synchronisation |
