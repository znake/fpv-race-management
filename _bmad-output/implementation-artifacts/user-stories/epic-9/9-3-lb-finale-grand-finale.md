# Story 9.3: LB-Finale & Grand Finale (4er)

**Status:** in-progress
**Updated:** 2025-12-23
**Story Points:** 5
**Source:** [Course Correction Dynamic Brackets 2025-12-23](../../change-proposals/course-correction-dynamic-brackets-2025-12-23.md)

> **🔄 COURSE CORRECTION 2025-12-23**
> Story wurde überarbeitet für 4er Grand Finale statt 2er.
> WB Finale (2) + LB Finale (2-4) = Grand Finale (2-4 Piloten).
> Ideal: 4er Grand Finale. Worst Case: 2er Grand Finale.
> Siehe: `docs/sprints/change-proposals/course-correction-dynamic-brackets-2025-12-23.md`

## Story

Als **Turnier-Organisator**,
möchte ich **dass das LB-Finale und Grand Finale korrekt aus dem Pool generiert werden, idealerweise als 4er Heat**,
damit **das Turnier mit einem fairen Finale abgeschlossen werden kann (ideal 4er, worst case 2er)**.

## Hintergrund

Nach dem WB-Finale müssen die verbleibenden Pool-Piloten ein LB-Finale spielen. Der Gewinner tritt dann im Grand Finale gegen den WB-Winner an.

**Wichtig:**
1. **Grand Finale ist idealerweise ein 4er Heat:** WB Finale (2) + LB Finale (2) = Grand Finale (4)
2. **LB Finale reduziert nur bis 2 Piloten:** Nicht bis 1 Pilot
3. **Worst Case:** 2er Grand Finale wenn nicht genug Piloten

## Acceptance Criteria

### AC1: LB Finale (2-4 Piloten)

**Given** WB Finale ist abgeschlossen
**And** Loser Pool hat 2-4 Piloten
**When** LB-Finale generiert wird
**Then** enthält es alle verbleibenden Pool-Piloten
**And** Platz 1-2 gehen in den Grand Finale Pool
**And** Platz 3-4 werden eliminiert

### AC2: Grand Finale Pool Sammlung (NEU)

**Given** WB Finale wird abgeschlossen
**And** LB Finale wird abgeschlossen
**When** die Gewinner in den Grand Finale Pool kommen
**Then** WB-Finale-Gewinner (1 Pilot) → Grand Finale Pool
**And** LB-Finale-Gewinner (1-2 Piloten) → Grand Finale Pool
**And** Grand Finale Pool hat 2-4 Piloten

### AC3: Grand Finale (Ideal: 4er, Worst Case: 2er)

**Given** Grand Finale Pool hat 2-4 Piloten
**When** Grand Finale generiert wird
**Then** enthält es alle Piloten aus dem Grand Finale Pool
**And** bei 4 Piloten → 4er Heat
**And** bei 3 Piloten → 3er Heat
**And** bei 2 Piloten → 2er Heat (Worst Case)
**And** Platz 1 = Turnier-Sieger
**And** Platz 2-4 = Finalisten

### AC4: Edge Case - 1 Pilot im Pool (Wildcard)

**Given** WB Finale ist abgeschlossen
**And** LB Finale wurde erstellt
**And** Loser Pool hat nur 1 Pilot
**And** LB-Finale-Gewinner + 1 Pool-Pilot < 4 Piloten
**When** das System prüft
**Then** gehen alle Piloten in den Grand Finale Pool
**And** Grand Finale wird erstellt mit allen verfügbaren Piloten

### AC5: Grand Finale Completion

**Given** Grand Finale wurde abgeschlossen
**When** die Platzierungen feststehen
**Then** wird `isGrandFinaleComplete` auf true gesetzt
**And** Turnier-Phase auf 'completed' gesetzt
**And** VictoryCeremony wird aktiviert

## Technische Anforderungen

### Grand Finale Pool

```typescript
interface TournamentState {
  // ... existing state ...

  // NEU: Grand Finale Pool
  grandFinalePool: string[]  // WB-Finale-Gewinner + LB-Finale-Gewinner
}
```

### LB Finale Erkennung

```typescript
function checkForLBFinale(): boolean {
  // LB Finale wenn:
  // 1. WB Finale ist abgeschlossen
  // 2. Pool hat noch Piloten (2-4)
  // 3. Kein weiterer LB Heat läuft

  return isWBFinaleComplete() &&
         loserPool.length >= 2 &&
         loserPool.length <= 4 &&
         !hasActiveLBHeats()
}

function generateLBFinale(): Heat {
  const newHeat: Heat = {
    id: generateId(),
    heatNumber: heats.length + 1,
    pilotIds: [...loserPool], // Alle Pool-Piloten
    bracketType: 'loser',
    status: 'pending',
    isFinale: true,
    roundName: 'LB Finale'
  }

  // Pool leeren
  loserPool = []

  return newHeat
}
```

### Grand Finale Pool Sammlung

```typescript
function onWBFinaleComplete(heatId: string, rankings: Ranking[]) {
  // Gewinner (Platz 1) → Grand Finale Pool
  const winner = rankings.find(r => r.rank === 1)
  if (winner) {
    grandFinalePool.push(winner.pilotId)
  }

  // Verlierer (Platz 2) → Loser Pool
  const loser = rankings.find(r => r.rank === 2)
  if (loser) {
    loserPool.push(loser.pilotId)
    // LB Finale erstellen wenn noch Piloten im Pool
    if (loserPool.length >= 2) {
      generateLBFinale()
    }
  }

  // Prüfen ob Grand Finale erstellt werden kann
  checkForGrandFinale()
}

function onLBFinaleComplete(heatId: string, rankings: Ranking[]) {
  // Gewinner (Platz 1-2) → Grand Finale Pool
  const winners = rankings.filter(r => r.rank <= 2)
  grandFinalePool.push(...winners.map(w => w.pilotId))

  // Verlierer (Platz 3-4) → ELIMINIERT
  const losers = rankings.filter(r => r.rank > 2)
  eliminatePilots(losers.map(l => l.pilotId))

  // Prüfen ob Grand Finale erstellt werden kann
  checkForGrandFinale()
}
```

### Grand Finale Generierung

```typescript
function checkForGrandFinale(): boolean {
  // Grand Finale wenn:
  // 1. WB Finale abgeschlossen UND
  // 2. LB Finale abgeschlossen (oder Pool leer) UND
  // 3. Grand Finale Pool hat 2-4 Piloten

  return isWBFinaleComplete() &&
         isLBFinaleComplete() &&
         grandFinalePool.length >= 2 &&
         grandFinalePool.length <= 4
}

function generateGrandFinale(): Heat {
  const newHeat: Heat = {
    id: generateId(),
    heatNumber: heats.length + 1,
    pilotIds: [...grandFinalePool], // Alle Piloten aus dem Pool (2-4 Piloten)
    bracketType: 'grand',
    status: 'pending',
    isFinale: true,
    roundName: 'Grand Finale'
  }

  return newHeat
}
```

### Entscheidungs-Matrix für Pool-Größe nach WB-Finale

| Pool-Größe | Aktion |
|------------|--------|
| 4 Piloten | LB-Finale mit 4 Piloten |
| 3 Piloten | LB-Finale mit 3 Piloten |
| 2 Piloten | LB-Finale mit 2 Piloten (Duell) |
| 1 Pilot | Warten auf LB-Finale-Gewinner → GF mit 2-3 Piloten |
| 0 Piloten | Fehler: Sollte nicht vorkommen |

### Grand Finale Größe

| GF Pool | Grand Finale Größe |
|---------|-------------------|
| 4 Piloten | 4er Heat (Ideal) |
| 3 Piloten | 3er Heat |
| 2 Piloten | 2er Heat (Worst Case) |

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/stores/tournamentStore.ts` | `grandFinalePool`, `checkForLBFinale()`, `generateLBFinale()`, `checkForGrandFinale()`, `generateGrandFinale()` |
| `src/lib/bracket-logic.ts` | Finale-Erkennung, Grand Finale Pool Logic |
| `src/components/heat-detail-modal.tsx` | Finale-spezifische UI (falls nötig) |

## Tasks

- [ ] **Task 1:** `grandFinalePool: string[]` State zum TournamentStore hinzufügen (AC: 2)
- [ ] **Task 2:** `isWBFinaleComplete()` Helper implementieren (AC: 1, 2, 3)
- [ ] **Task 3:** `isLBFinaleComplete()` Helper implementieren (AC: 2, 3)
- [ ] **Task 4:** `checkForLBFinale()` Funktion implementieren (AC: 1)
  - [ ] WB Finale abgeschlossen UND Pool hat 2-4 Piloten
- [ ] **Task 5:** `generateLBFinale()` mit variabler Pilotenzahl (AC: 1)
  - [ ] Alle Pool-Piloten (2-4) in LB Finale
- [ ] **Task 6:** `onWBFinaleComplete()` implementieren (AC: 2)
  - [ ] WB-Finale-Gewinner → Grand Finale Pool
  - [ ] WB-Finale-Verlierer → Loser Pool
- [ ] **Task 7:** `onLBFinaleComplete()` implementieren (AC: 2)
  - [ ] LB-Finale-Gewinner (1-2) → Grand Finale Pool
  - [ ] LB-Finale-Verlierer → Eliminiert
- [ ] **Task 8:** `checkForGrandFinale()` implementieren (AC: 3)
  - [ ] WB Finale + LB Finale abgeschlossen UND GF Pool hat 2-4 Piloten
- [ ] **Task 9:** `generateGrandFinale()` mit variabler Pilotenzahl (AC: 3)
  - [ ] Alle Piloten aus Grand Finale Pool (2-4)
- [ ] **Task 10:** Grand Finale Completion → Turnier-Ende triggern (AC: 5)
- [ ] **Task 11:** Unit Tests für alle Finale-Szenarien
  - [ ] Test: LB Finale mit 4 Piloten
  - [ ] Test: LB Finale mit 3 Piloten
  - [ ] Test: LB Finale mit 2 Piloten
  - [ ] Test: Grand Finale mit 4 Piloten
  - [ ] Test: Grand Finale mit 2 Piloten
- [ ] **Task 12:** Integration Test: Kompletter Turnier-Flow bis Grand Finale

## Dev Notes

### Abhängigkeiten
- **Benötigt:** Story 9-1 (Loser Pool State), Story 9-2 (Dynamische LB-Heat Generierung)
- **Integriert mit:** Epic 5 (Finale & Siegerehrung) - bestehende VictoryCeremony

### Wichtige Hinweise
- **Grand Finale ist idealerweise ein 4er Heat:** WB Finale (2) + LB Finale (2)
- **LB Finale reduziert nur bis 2 Piloten:** Nicht bis 1
- **Grand Finale Pool:** Sammelt WB-Finale-Gewinner + LB-Finale-Gewinner
- Bestehende `getTop4Pilots()` Logik muss ggf. angepasst werden
- VictoryCeremony sollte weiterhin funktionieren

### Grand Finale Größe Beispiel

```
IDEAL CASE:
============
WB Finale: [Jakob, Jürgen] → Jakob gewinnt → GF Pool: [Jakob]
LB Finale: [Niklas, Max, Markus, Andi] → Niklas & Max gewinnen → GF Pool: [Jakob, Niklas, Max]
Grand Finale: [Jakob, Niklas, Max] + [1 Pilot aus LB Pool Wildcard] = 4er Heat

WORST CASE:
===========
WB Finale: [Jakob, Jürgen] → Jakob gewinnt → GF Pool: [Jakob]
LB Finale: [Niklas, Max] → Niklas gewinnt → GF Pool: [Jakob, Niklas]
Grand Finale: [Jakob, Niklas] = 2er Heat
```

### Edge Cases
- WB-Winner gibt auf → LB-Winner gewinnt automatisch
- Grand Finale Pool hat nur 2 Piloten → 2er Duell
- Grand Finale Pool hat 3 Piloten → 3er Heat
- Grand Finale Pool hat 4 Piloten → 4er Heat (Ideal)
- Beide Finalisten haben gleiche Punktzahl → Tiebreaker nötig (Post-MVP)

### Testing
- Unit Tests in `tests/lb-finale.test.ts`
- Verschiedene Pool-Größen testen (2, 3, 4 Piloten)
- Grand Finale Completion testen
- Grand Finale mit verschiedenen Größen testen (2, 3, 4 Piloten)

## References

- [Course Correction: Dynamic Brackets 2025-12-23](../../change-proposals/course-correction-dynamic-brackets-2025-12-23.md)
- [Architecture: TournamentStore](../../architecture.md#TournamentStore)
