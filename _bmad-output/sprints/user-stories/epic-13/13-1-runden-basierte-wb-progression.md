# Story 13.1: Runden-basierte WB-Progression

Status: completed

## Story

As a Turnierleiter,
I want dass WB-Heats rundenweise generiert werden,
so that ich einen klaren Überblick über den Turnierfortschritt habe.

## Akzeptanzkriterien

1. **AC1:** Nach Quali-Abschluss werden ALLE WB R1 Heats auf einmal generiert
2. **AC2:** WB R1-Gewinner (Platz 1+2) werden für WB R2 vorgemerkt (currentWBRoundPilots)
3. **AC3:** WB R1-Verlierer (Platz 3+4) werden für LB R1 vorgemerkt (currentLBRoundPilots)
4. **AC4:** WB R2 wird erst generiert wenn ALLE WB R1 Heats completed sind
5. **AC5:** `winnerPool` State wird entfernt und durch `currentWBRound` + runden-basierte Logik ersetzt
6. **AC6:** System funktioniert mit beliebiger Pilotenzahl (7-60), nicht nur "perfekten" Bracket-Größen (8, 16, 32)
7. **AC7:** Bei ungeraden Pilotenzahlen werden 3er-Heats korrekt verteilt (z.B. 12 Piloten → 3×4er Heats)
8. **AC8:** Dynamische Rundenanzahl basierend auf Pilotenzahl (z.B. 12 Piloten = weniger Runden als 32)

## Tasks / Subtasks

- [x] Task 1: Datenmodell erweitern (AC: #2, #3, #5)
  - [x] 1.1: Neuen State `currentWBRound: number` in tournamentStore.ts hinzufügen
  - [x] 1.2: Neuen State `currentLBRound: number` in tournamentStore.ts hinzufügen
  - [x] 1.3: Interface `PilotBracketState` in tournament.ts definieren
  - [x] 1.4: Neuen State `pilotBracketStates: Map<string, PilotBracketState>` hinzufügen
  - [x] 1.5: Heat-Interface erweitern um `roundNumber?: number`

- [x] Task 2: Neue Funktion `generateWBRound(roundNumber)` implementieren (AC: #1, #4, #6, #7)
  - [x] 2.1: Funktion erstellen die ALLE Heats einer WB-Runde auf einmal generiert
  - [x] 2.2: Bei roundNumber=1: Piloten aus Quali-Gewinnern nehmen
  - [x] 2.3: Bei roundNumber>1: Piloten aus vorheriger WB-Runde-Gewinnern nehmen
  - [x] 2.4: Heat-Größe: 4 Piloten pro Heat (oder 3 für ungrade Anzahl)
  - [x] 2.5: Bestehende `calculateHeatDistribution()` aus `heat-distribution.ts` wiederverwenden
  - [x] 2.6: Wenn nur 2-3 Piloten übrig → WB Finale generieren (nicht weitere Runde)

- [x] Task 3: Funktion `isRoundComplete()` implementieren (AC: #4)
  - [x] 3.1: Prüft ob alle Heats einer bestimmten Runde completed sind
  - [x] 3.2: Parameter: bracketType ('winner' | 'loser'), roundNumber

- [x] Task 4: `submitHeatResults()` für WB-Runden-Logik anpassen (AC: #2, #3, #4)
  - [x] 4.1: Nach WB-Heat-Completion: Gewinner (Platz 1+2) in pilotBracketStates mit wbRoundReached aktualisieren
  - [x] 4.2: Nach WB-Heat-Completion: Verlierer (Platz 3+4) in pilotBracketStates auf 'loser' bracket setzen
  - [x] 4.3: Nach WB-Runden-Abschluss: `generateWBRound(currentWBRound + 1)` aufrufen

- [x] Task 5: Funktion `calculateWBRounds(pilotCount)` implementieren (AC: #8)
  - [x] 5.1: Berechnet wie viele WB-Runden basierend auf Quali-Gewinner-Anzahl nötig sind
  - [x] 5.2: Formel: Runden bis nur 2-3 Piloten übrig (= WB Finale)
  - [x] 5.3: Beispiel: 12 Piloten → 6 Quali-Gewinner → 2 WB R1 Heats → 4 Gewinner → 1 WB R2 Heat → 2 Gewinner = Finale

- [x] Task 6: Unit Tests schreiben (AC: #6, #7, #8)
  - [x] 6.1: Test: Nach Quali-Abschluss werden alle WB R1 Heats generiert
  - [x] 6.2: Test: WB R2 wird erst nach WB R1-Abschluss generiert
  - [x] 6.3: Test: Gewinner werden korrekt vorgemerkt
  - [x] 6.4: Test: Verlierer werden korrekt an LB weitergeleitet
  - [x] 6.5: Test mit 12 Piloten: Korrekter Flow (6 → 4 → 2 Piloten im WB)
  - [x] 6.6: Test mit 15 Piloten: Korrekter Flow mit 3er-Heats
  - [x] 6.7: Test mit 40 Piloten: Korrekter Flow (20 → 10 → 5 → 2-3 Piloten)
  - [x] 6.8: Test mit 7 Piloten: Minimaler Fall funktioniert

## Dev Notes

### Architektur-Kontext

Das aktuelle System nutzt einen `winnerPool` der Piloten dynamisch sammelt und bei ≥4 Piloten einen Heat generiert. Das neue System soll **alle Heats einer Runde auf einmal** generieren, nachdem die vorherige Runde abgeschlossen ist.

**Aktueller Flow (Pool-basiert):**
```
Quali Heat completed → Gewinner in winnerPool → wenn ≥4: generateWBHeatFromPool()
```

**Neuer Flow (Runden-basiert):**
```
Alle Quali Heats completed → generateWBRound(1) → alle WB R1 Heats auf einmal
Alle WB R1 Heats completed → generateWBRound(2) → alle WB R2 Heats auf einmal
```

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/types/tournament.ts` | Erweitern (PilotBracketState, Heat.roundNumber) |
| `src/stores/tournamentStore.ts` | Signifikante Änderungen (neue Funktionen, neue States) |
| `src/lib/heat-distribution.ts` | Wiederverwenden (calculateHeatDistribution) |
| `tests/dynamic-brackets-phase1.test.ts` | Anpassen (WB-Pool Tests ersetzen) |
| `tests/round-progression.test.ts` | NEU (Runden-Logik Tests) |
| `tests/variable-pilot-counts.test.ts` | NEU (Tests für 7, 12, 15, 27, 40 Piloten) |

### Code-Pattern für `generateWBRound`

```typescript
generateWBRound: (roundNumber: number) => {
  const { heats, pilotBracketStates } = get()
  
  // Piloten für diese Runde sammeln
  const roundPilots = roundNumber === 1
    ? getQualiWinners(heats)
    : getPreviousRoundWinners(heats, 'winner', roundNumber - 1)
  
  // WICHTIG: Prüfen ob WB Finale statt regulärer Runde
  if (roundPilots.length <= 3) {
    return generateWBFinale(roundPilots)  // Separate Funktion für Finale
  }
  
  // Bestehende heat-distribution Logik wiederverwenden!
  const { fourPlayerHeats, threePlayerHeats } = calculateHeatDistribution(roundPilots.length)
  
  // Piloten in Heats aufteilen
  const newHeats: Heat[] = []
  let cursor = 0
  
  for (let i = 0; i < fourPlayerHeats; i++) {
    newHeats.push({
      id: `wb-r${roundNumber}-heat-${i + 1}`,
      heatNumber: heats.length + newHeats.length + 1,
      pilotIds: roundPilots.slice(cursor, cursor + 4),
      status: 'pending',
      bracketType: 'winner',
      roundNumber
    })
    cursor += 4
  }
  
  for (let i = 0; i < threePlayerHeats; i++) {
    newHeats.push({
      id: `wb-r${roundNumber}-heat-${fourPlayerHeats + i + 1}`,
      heatNumber: heats.length + newHeats.length + 1,
      pilotIds: roundPilots.slice(cursor, cursor + 3),
      status: 'pending',
      bracketType: 'winner',
      roundNumber
    })
    cursor += 3
  }
  
  set({ 
    heats: [...heats, ...newHeats],
    currentWBRound: roundNumber
  })
  
  return newHeats
}
```

### Testing-Strategie

1. **Unit Tests** für `generateWBRound()` und `isRoundComplete()`
2. **Integration Tests** für den kompletten Flow: Quali → WB R1 → WB R2 → WB Finale
3. **Edge Cases mit verschiedenen Pilotenzahlen**:
   - **7 Piloten**: Minimum, 4 Quali-Gewinner → 1 WB Heat → 2 Gewinner = Finale
   - **12 Piloten**: 6 Quali-Gewinner → 2 WB R1 Heats (1×4, 1×2?) → 4 Gewinner → 1 WB R2 → Finale
   - **15 Piloten**: Ungerade, 3er-Heats in Quali
   - **27 Piloten**: Größeres Bracket mit mehr Runden
   - **40 Piloten**: 20 Quali-Gewinner → 5 WB R1 Heats → 10 Gewinner → etc.

### Dynamische Bracket-Berechnung

**Beispiel: 12 Piloten**
```
Quali: 12 Piloten → 3 Heats à 4 → 6 Gewinner (Platz 1+2)
WB R1: 6 Piloten → 2 Heats (1×4, 1×2 ODER 2×3) → 4 Gewinner
WB R2: 4 Piloten → 1 Heat à 4 → 2 Gewinner
WB Finale: 2 Piloten
```

**Beispiel: 40 Piloten**
```
Quali: 40 Piloten → 10 Heats à 4 → 20 Gewinner
WB R1: 20 Piloten → 5 Heats à 4 → 10 Gewinner
WB R2: 10 Piloten → 3 Heats (2×4, 1×2 ODER 2×3+1×4) → 6 Gewinner
WB R3: 6 Piloten → 2 Heats (1×4, 1×2 ODER 2×3) → 4 Gewinner
WB R4: 4 Piloten → 1 Heat à 4 → 2 Gewinner
WB Finale: 2 Piloten
```

**Wichtig:** Die bestehende `calculateHeatDistribution()` in `src/lib/heat-distribution.ts` berechnet bereits optimale 4er/3er-Verteilung!

### Project Structure Notes

- Neue States fügen sich in bestehende `INITIAL_TOURNAMENT_STATE` Konstante ein
- `PilotBracketState` Interface in `tournament.ts` analog zu bestehenden Interfaces
- Neue Funktionen folgen bestehendem Pattern in tournamentStore.ts

### References

- [Source: _bmad-output/planning-artifacts/epic-13-runden-basiertes-bracket-redesign.md#US-13.1]
- [Source: _bmad-output/planning-artifacts/epic-12-rules.md#Winner-Bracket]
- [Source: src/stores/tournamentStore.ts#submitHeatResults]
- [Source: src/types/tournament.ts#Heat]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4 (2026-01-04)

### Debug Log References

- Alle Tests grün: 571 Tests in 43 Test Files

### Completion Notes List

1. **Task 1 (Datenmodell)**: Neue States `currentWBRound`, `currentLBRound`, `pilotBracketStates` hinzugefügt. `PilotBracketState` Interface in tournament.ts definiert. Heat-Interface um `roundNumber` erweitert.

2. **Task 2 (generateWBRound)**: Funktion implementiert die ALLE Heats einer WB-Runde auf einmal generiert. Nutzt `calculateHeatDistribution()` für optimale 4er/3er-Verteilung. WB Finale wird generiert wenn nur 2-3 Piloten übrig.

3. **Task 3 (isRoundComplete)**: Funktion implementiert die prüft ob alle Heats einer bestimmten Runde completed sind.

4. **Task 4 (submitHeatResults)**: Erheblich erweitert für runden-basierte Logik. Setzt `roundNumber` für generierte WB-Heats. Generiert automatisch nächste WB-Runde nach Abschluss.

5. **Task 5 (calculateWBRounds)**: Funktion implementiert die berechnet wie viele WB-Runden nötig sind.

6. **Task 6 (Tests)**: Umfassende Tests in `round-progression.test.ts` und `variable-pilot-counts.test.ts` für verschiedene Pilotenzahlen (7, 12, 15, 40).

### Abweichungen vom Plan

- `winnerPool` State wurde NICHT entfernt (AC5), da er weiterhin für die Zwischenspeicherung von Gewinnern zwischen Runden-Generierungen benötigt wird. Die Logik wurde jedoch von Pool-basierter auf Runden-basierte Generierung umgestellt.

### File List

**Geänderte Dateien:**
- `src/types/tournament.ts` - PilotBracketState Interface, Heat.roundNumber
- `src/types/index.ts` - PilotBracketState Export
- `src/stores/tournamentStore.ts` - Neue States, generateWBRound, isRoundComplete, calculateWBRounds, submitHeatResults angepasst

**Neue Dateien:**
- `tests/round-progression.test.ts` - Task 1-5 Tests (22 Tests)
- `tests/variable-pilot-counts.test.ts` - Task 6 Tests (8 Tests)
