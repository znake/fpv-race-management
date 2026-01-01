# Story 9.1: Loser Pool State & FIFO Logik

**Status:** in-progress
**Updated:** 2025-12-23
**Story Points:** 3
**Source:** [Course Correction Dynamic Brackets 2025-12-23](../../change-proposals/course-correction-dynamic-brackets-2025-12-23.md)

> **🔄 COURSE CORRECTION 2025-12-23**
> Story wurde überarbeitet für FIFO (First In, First Out) statt zufälliger Auswahl.
> Wer zuerst verliert, fliegt zuerst wieder.
> Siehe: `docs/sprints/change-proposals/course-correction-dynamic-brackets-2025-12-23.md`

## Story

Als **Turnier-Organisator**,
möchte ich **dass Verlierer aus dem Winner Bracket in einem Pool gesammelt werden (FIFO)**,
damit **sie später zu spielbaren LB-Heats zusammengefasst werden können und in der Reihenfolge des Verlierens wieder fliegen**.

## Hintergrund

Die aktuelle Bracket-Struktur generiert LB-Heats vorab basierend auf einer mathematischen Struktur, die für 1v1-Matches konzipiert ist. Bei 4er-Heats führt das zu LB-Heats mit nur 1-2 Piloten, die nicht spielbar sind.

**Kernprinzip:** Verlierer werden in einem Pool gesammelt, bis genug für einen Heat vorhanden sind (3-4 Piloten). **Wichtig: FIFO (First In, First Out) statt zufälliger Auswahl.**

## Acceptance Criteria

### AC1: Pool wird gefüllt (aus WB-Heats)

**Given** ein WB-Heat wird abgeschlossen
**When** die Rankings eingegeben werden
**Then** landen Platz 3+4 im Loser Pool
**And** Platz 1+2 gehen weiter im Winner Bracket
**And** die Piloten werden am **Ende** der Liste angefügt (FIFO)

### AC2: FIFO bei Heat-Erstellung (NEU)

**Given** ein LB-Heat erstellt werden soll
**And** der Loser Pool hat 4 oder mehr Piloten
**When** die Piloten für den Heat ausgewählt werden
**Then** werden die **ersten 4 Piloten** aus dem Pool genommen
**And** die Reihenfolge des Verlierens wird beibehalten

### AC3: Eliminierte Piloten sind raus

**Given** ein Pilot wurde im LB eliminiert (2x verloren)
**When** das Turnier weiterläuft
**Then** erscheint der Pilot in keinem weiteren Heat
**And** der Pilot wird als "eliminiert" markiert

## Technische Anforderungen

### Neue State-Variablen im TournamentStore

```typescript
interface TournamentState {
  // ... existing state ...

  // NEU: Loser Pool - Piloten die auf LB-Heat warten (FIFO)
  loserPool: string[]  // Pilot IDs (am Ende anfügen = FIFO)

  // NEU: Eliminierte Piloten (endgültig raus aus Turnier)
  eliminatedPilots: string[]
}
```

### Neue Actions

```typescript
// Piloten zum Loser Pool hinzufügen (am Ende anfügen = FIFO)
addToLoserPool: (pilotIds: string[]) => void

// Piloten aus dem Pool entfernen (vorne nehmen = FIFO)
removeFromLoserPool: (count: number) => void

// Piloten eliminieren (2. Niederlage im LB)
eliminatePilots: (pilotIds: string[]) => void
```

### Geänderte Logik in completeHeat

Die bestehende `completeHeat` Funktion muss angepasst werden:

```typescript
function completeHeat(heatId: string, rankings: Ranking[]) {
  const heat = getHeat(heatId)

  if (heat.bracketType === 'winner' || heat.bracketType === 'qualifier') {
    // Gewinner (Platz 1+2) → nächster WB Heat (bestehende Logik)
    const winners = rankings.filter(r => r.rank <= 2)
    assignToNextWBHeat(winners)

    // NEU: Verlierer (Platz 3+4) → Loser Pool (am Ende anfügen)
    const losers = rankings.filter(r => r.rank > 2)
    addToLoserPool(losers.map(l => l.pilotId))  // FIFO: Am Ende anfügen
  }
}
```

### FIFO Implementierung

```typescript
// Anfügen = FIFO: Am Ende der Liste anfügen
function addToLoserPool(pilotIds: string[]) {
  loserPool.push(...pilotIds)
  // Result: [...loserPool, ...newPilots]
}

// Entnehmen = FIFO: Die ersten N Piloten nehmen
function removeFromLoserPool(count: number) {
  return loserPool.splice(0, count)
  // Result: Entfernt die ersten N, der Rest bleibt
}
```

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/stores/tournamentStore.ts` | `loserPool`, `eliminatedPilots` State + FIFO Actions |
| `src/lib/bracket-logic.ts` | WB-Heat Completion → Pool-Logik (FIFO) |

## Tasks

- [ ] **Task 1:** `loserPool: string[]` State zum TournamentStore hinzufügen (AC: 1)
- [ ] **Task 2:** `eliminatedPilots: string[]` State zum TournamentStore hinzufügen (AC: 3)
- [ ] **Task 3:** `addToLoserPool()` Action mit FIFO implementieren (AC: 1)
  - [ ] Piloten am Ende der Liste anfügen (FIFO)
- [ ] **Task 4:** `removeFromLoserPool()` Action mit FIFO implementieren (AC: 2)
  - [ ] Die ersten N Piloten aus dem Pool nehmen
- [ ] **Task 5:** `eliminatePilots()` Action implementieren (AC: 3)
- [ ] **Task 6:** `completeHeat()` anpassen: WB-Verlierer → Pool (FIFO) (AC: 1)
- [ ] **Task 7:** Unit Tests für FIFO-Logik schreiben (AC: 1, 2)
  - [ ] Test: Piloten werden am Ende angefügt (FIFO)
  - [ ] Test: Die ersten N Piloten werden entnommen (FIFO)
  - [ ] Test: Reihenfolge wird beibehalten
- [ ] **Task 8:** localStorage Persistenz für Pool-State sicherstellen

## Dev Notes

### Abhängigkeiten
- Keine Abhängigkeiten zu anderen Stories in Epic 9
- Basis für alle anderen LB-Pooling Stories

### Wichtige Hinweise
- **FIFO ist kritisch:** Wer zuerst verliert, fliegt zuerst wieder
- Pool muss bei `resetTournament()` geleert werden
- Pool-State muss in localStorage persistiert werden (Zustand persist middleware)
- Bestehende LB-Struktur-Generierung wird in Story 9-2 entfernt

### FIFO Beispiel

```typescript
// Pool: [] (leer)

// Heat 1 abgeschlossen: Verlierer = [Max, Markus]
addToLoserPool([Max, Markus])
// Pool: [Max, Markus]

// Heat 2 abgeschlossen: Verlierer = [Simon, Andi]
addToLoserPool([Simon, Andi])
// Pool: [Max, Markus, Simon, Andi]

// LB Heat erstellen:
removeFromLoserPool(4)
// Entnommen: [Max, Markus, Simon, Andi] (FIFO)
// Pool: []
```

### Testing
- Unit Tests in `tests/loser-pool.test.ts`
- Integration mit bestehendem Heat-Completion Flow testen

## References

- [Course Correction: Dynamic Brackets 2025-12-23](../../change-proposals/course-correction-dynamic-brackets-2025-12-23.md)
- [Architecture: TournamentStore](../../architecture.md#TournamentStore)
