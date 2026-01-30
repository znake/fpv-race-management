# [REMOVED] Grand Finale Rematch-Regel

> **Status**: This feature was removed. Grand Finale now directly determines places 1-4 without rematches.

Status: completed

## Story

As a Turnierleiter,
I want die Rematch-Regel nach dem Grand Finale anwenden,
so that WB-Piloten ihre faire zweite Chance bekommen.

## Akzeptanzkriterien

1. **AC1:** Nach GF: Prüfe ob Platz 1 = LB-Pilot UND Platz 3 = WB-Pilot → Rematch für Platz 1
2. **AC2:** Nach GF: Prüfe ob Platz 2 = LB-Pilot UND Platz 4 = WB-Pilot → Rematch für Platz 2
3. **AC3:** Rematch ist 1v1 Heat (2 Piloten)
4. **AC4:** Rematch-Gewinner bekommt höheren Platz, Verlierer niedrigeren
5. **AC5:** UI zeigt Rematch-Status und -Ergebnis

## Hintergrund (aus epic-12-rules.md)

Die Rematch-Regel existiert, weil im Double-Elimination-Format WB-Piloten eine faire zweite Chance verdienen. Wenn ein LB-Pilot (der schon einmal verloren hat) einen WB-Pilot (der noch nie verloren hat) im Grand Finale schlägt, haben beide Piloten genau 1x verloren - daher ein entscheidendes Rematch.

**Rematch-Trigger:**
- Platz 1 = LB + Platz 3 = WB → Rematch um Platz 1 (Gewinner: 1, Verlierer: 3)
- Platz 2 = LB + Platz 4 = WB → Rematch um Platz 2 (Gewinner: 2, Verlierer: 4)

## Tasks / Subtasks

- [x] Task 1: Heat-Interface erweitern (AC: #3)
  - [x] 1.1: `isRematch?: boolean` zu Heat-Interface
  - [x] 1.2: `rematchBetween?: [string, string]` - Pilot IDs
  - [x] 1.3: `rematchForPlace?: 1 | 2` - Um welchen Platz geht's

- [x] Task 2: `checkAndGenerateRematches()` implementieren (AC: #1, #2)
  - [x] 2.1: Funktion nimmt Grand Finale Rankings als Parameter
  - [x] 2.2: Prüft Platz 1 vs 3 Rematch-Bedingung (AC1)
  - [x] 2.3: Prüft Platz 2 vs 4 Rematch-Bedingung (AC2)
  - [x] 2.4: Generiert 0, 1 oder 2 Rematch-Heats

- [x] Task 3: State-Erweiterung (AC: #5)
  - [x] 3.1: `grandFinaleRematchPending: boolean`
  - [x] 3.2: `rematchHeats: Heat[]` (separates Array für Rematches)

- [x] Task 4: `submitHeatResults()` für Rematch anpassen (AC: #4)
  - [x] 4.1: Erkennung von Rematch-Heats (isRematch === true)
  - [x] 4.2: Bei Rematch: Gewinner bekommt rematchForPlace, Verlierer +2

- [x] Task 5: Finale-Platzierungen nach Rematch aktualisieren (AC: #4)
  - [x] 5.1: `getTop4Pilots()` berücksichtigt Rematch-Ergebnisse
  - [x] 5.2: Platzierungen werden erst final wenn alle Rematches completed

- [x] Task 6: Rematch-UI Komponente (AC: #5)
  - [x] 6.1: RematchSection Komponente erstellen
  - [x] 6.2: Zeigt "Rematch um Platz X" Titel
  - [x] 6.3: 1v1 Heat-Box mit beiden Piloten
  - [x] 6.4: Status-Indikator (pending/active/completed)

- [x] Task 7: Unit Tests
  - [x] 7.1: Test: Kein Rematch wenn alle WB-Piloten oben
  - [x] 7.2: Test: Ein Rematch für Platz 1
  - [x] 7.3: Test: Ein Rematch für Platz 2
  - [x] 7.4: Test: Zwei Rematches (seltener Fall)
  - [x] 7.5: Test: Finale Platzierungen nach Rematch

## Dev Notes

### Rematch-Logik im Detail

```typescript
interface RematchCheck {
  needsRematch: boolean
  wbPilotId: string
  lbPilotId: string
  forPlace: 1 | 2
}

checkRematchCondition(
  rankings: Ranking[], 
  pilotBracketStates: Map<string, PilotBracketState>,
  place1: number,  // e.g., 1
  place2: number   // e.g., 3
): RematchCheck | null {
  const pilot1 = rankings.find(r => r.rank === place1)
  const pilot2 = rankings.find(r => r.rank === place2)
  
  if (!pilot1 || !pilot2) return null
  
  const pilot1Origin = pilotBracketStates.get(pilot1.pilotId)?.bracketOrigin
  const pilot2Origin = pilotBracketStates.get(pilot2.pilotId)?.bracketOrigin
  
  // Rematch wenn: höherer Platz = LB UND niedrigerer Platz = WB
  if (pilot1Origin === 'lb' && pilot2Origin === 'wb') {
    return {
      needsRematch: true,
      wbPilotId: pilot2.pilotId,
      lbPilotId: pilot1.pilotId,
      forPlace: place1 as 1 | 2
    }
  }
  
  return null
}
```

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/types/tournament.ts` | Heat erweitern (isRematch, rematchBetween, rematchForPlace) |
| `src/stores/tournamentStore.ts` | checkAndGenerateRematches(), State-Erweiterungen |
| `src/components/bracket/sections/RematchSection.tsx` | NEU |
| `src/components/bracket/sections/GrandFinaleSection.tsx` | Rematch-Status zeigen |
| `tests/rematch-logic.test.ts` | NEU |

### UI-Flow für Rematches

```
Grand Finale completed
       ↓
checkAndGenerateRematches()
       ↓
   ┌───┴───┐
   │ Nein  │ → Tournament completed, Platzierungen final
   │       │
   │  Ja   │ → RematchSection anzeigen
   └───────┘
       ↓
Rematch(es) abschließen
       ↓
Finale Platzierungen berechnen
       ↓
Tournament completed
```

### Testing-Strategie

1. **Unit Tests** für checkRematchCondition()
2. **State Tests** für Rematch-Heat-Generierung
3. **Integration Tests** für kompletten Rematch-Flow
4. **UI Tests** für RematchSection

### Edge Cases

- **Zwei Rematches**: Selten, aber möglich wenn beide WB-Piloten verlieren
- **Kein Rematch**: Wenn WB-Piloten Platz 1+2 belegen (normaler Fall)
- **Nur Platz-1-Rematch**: Wenn WB-Pilot 1 verliert aber WB-Pilot 2 gewinnt

### Project Structure Notes

- RematchSection.tsx folgt bestehendem Pattern von GrandFinaleSection.tsx
- Neue Tests in separater Datei `rematch-logic.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epic-13-runden-basiertes-bracket-redesign.md#US-13.4]
- [Source: _bmad-output/planning-artifacts/epic-12-rules.md#Rematch-Regel]
- [Source: src/stores/tournamentStore.ts#submitHeatResults]
- [Source: src/components/bracket/sections/GrandFinaleSection.tsx]

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (Anthropic) via Claude Code

### Debug Log References

- Tests all pass: 633/633 including 31 new rematch-logic tests

### Completion Notes List

1. **Task 1 (Heat-Interface):** Erweiterte das Heat-Interface in `src/types/tournament.ts` mit drei neuen optionalen Properties: `isRematch`, `rematchBetween`, und `rematchForPlace`.

2. **Task 2 (checkAndGenerateRematches):** Implementierte die Funktion `checkAndGenerateRematches()` im tournamentStore. Die Funktion:
   - Findet das abgeschlossene Grand Finale
   - Prüft bracketOrigin für jeden Piloten (wb/lb)
   - Generiert Rematch-Heats wenn die Bedingungen erfüllt sind (LB-Pilot auf Platz 1/2, WB-Pilot auf Platz 3/4)
   - Unterstützt 0, 1 oder 2 Rematches

3. **Task 3 (State-Erweiterung):** Erweiterte `INITIAL_TOURNAMENT_STATE` und `TournamentState` Interface mit:
   - `grandFinaleRematchPending: boolean`
   - `rematchHeats: Heat[]`

4. **Task 4 (submitHeatResults für Rematch):** Erweiterte die submitHeatResults Funktion um Rematch-Heat-Handling. Wenn `isRematch === true`, werden die Rematch-Heats im Array aktualisiert und der `grandFinaleRematchPending` Status wird verwaltet.

5. **Task 5 (getTop4Pilots):** Überarbeitete die getTop4Pilots Funktion um:
   - Null zurückzugeben wenn Rematches pending sind
   - Nach Abschluss die Rematch-Ergebnisse auf die Grand Finale Rankings anzuwenden
   - Rematch-Gewinner bekommen den höheren Platz, Verlierer den niedrigeren (+2)

6. **Task 6 (RematchSection UI):** Erstellte die neue RematchSection Komponente mit:
   - "Rematch um Platz X" Titel
   - 1v1 Heat-Box mit "VS" Divider
   - Status-Indikatoren (pending/active/completed) mit entsprechendem Styling
   - Gewinner-Hervorhebung bei abgeschlossenem Rematch

7. **Task 7 (Unit Tests):** Erstellte umfangreiche Tests in `tests/rematch-logic.test.ts` mit 31 Tests die alle Szenarien abdecken.

### File List

| Datei | Änderungsart | Beschreibung |
|-------|--------------|--------------|
| `src/types/tournament.ts` | GEÄNDERT | Heat-Interface erweitert mit isRematch, rematchBetween, rematchForPlace |
| `src/stores/tournamentStore.ts` | GEÄNDERT | INITIAL_STATE erweitert, checkAndGenerateRematches() hinzugefügt, submitHeatResults() angepasst, getTop4Pilots() überarbeitet |
| `src/components/bracket/sections/RematchSection.tsx` | NEU | UI-Komponente für Rematch-Anzeige |
| `src/components/bracket/index.ts` | GEÄNDERT | Export für RematchSection hinzugefügt |
| `tests/rematch-logic.test.ts` | NEU | 31 Tests für Rematch-Logik |
