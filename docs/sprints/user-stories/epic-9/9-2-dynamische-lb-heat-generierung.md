# Story 9.2: Dynamische LB-Heat Generierung (FIFO)

**Status:** in-progress
**Updated:** 2025-12-23
**Story Points:** 5
**Source:** [Course Correction Dynamic Brackets 2025-12-23](../../change-proposals/course-correction-dynamic-brackets-2025-12-23.md)

> **🔄 COURSE CORRECTION 2025-12-23**
> Story wurde überarbeitet für FIFO statt Random und Warten auf Verlierer wenn noch WB aktiv.
> Wer zuerst verliert, fliegt zuerst wieder. Pool wird erst geleert wenn noch WB-Heats aktiv.
> Siehe: `docs/sprints/change-proposals/course-correction-dynamic-brackets-2025-12-23.md`

## Story

Als **Turnier-Organisator**,
möchte ich **dass LB-Heats dynamisch aus dem Pool erstellt werden, wenn genug Piloten vorhanden sind (FIFO)**,
damit **jeder LB-Heat spielbar ist (3-4 Piloten) und Piloten nicht zu lange warten**.

## Hintergrund

Statt vorberechneter LB-Struktur werden LB-Heats on-demand erstellt, wenn der Pool mindestens 4 Piloten enthält (während WB aktiv) oder 3+ Piloten (nach WB-Finale).

**Wichtig:**
1. **FIFO statt Random:** Wer zuerst verliert, fliegt zuerst wieder
2. **Warten wenn noch WB aktiv:** Pool wird erst geleert wenn noch WB-Heats laufen

## Acceptance Criteria

### AC1: LB Heat wird generiert (während WB aktiv)

**Given** das WB hat noch ausstehende Heats
**And** der Loser Pool hat 4 oder mehr Piloten
**When** ein Heat abgeschlossen wird
**Then** wird ein neuer LB-Heat mit den ersten 4 Piloten aus dem Pool erstellt (FIFO)

### AC2: FIFO Pool-Auswahl (NEU)

**Given** der Pool hat mehr als 4 Piloten
**When** ein LB-Heat erstellt wird
**Then** werden die **ersten 4 Piloten** aus dem Pool genommen (FIFO)
**And** die Reihenfolge des Verlierens wird beibehalten
**And** verbleibende Piloten warten auf den nächsten LB-Heat

### AC3: Warten auf Verlierer wenn noch WB aktiv (NEU)

**Given** ein WB-Heat wurde abgeschlossen
**And** der Loser Pool hat nur 2-3 Piloten
**And** noch weitere WB-Heats sind ausstehend
**When** das System prüft ob ein LB-Heat erstellt werden kann
**Then** wird gewartet, bis weitere WB-Verlierer hinzukommen
**And** erst wenn Pool >= 4 Piloten wird LB-Heat erstellt

### AC4: LB Gewinner bleiben im Pool

**Given** ein LB-Heat wird abgeschlossen
**When** die Rankings eingegeben werden
**Then** gehen Platz 1+2 zurück in den Pool (am Ende anfügen)
**And** Platz 3+4 werden eliminiert

### AC5: LB Finale nach WB-Finale (NEU)

**Given** WB Finale ist abgeschlossen
**And** der Loser Pool hat noch Piloten
**And** kein weiterer LB-Heat läuft mehr
**When** das System prüft ob ein LB-Heat erstellt werden kann
**Then** wird LB Finale mit allen verbleibenden Pool-Piloten erstellt
**And** der Pool wird geleert

### AC6: Pool-Visualisierung im Loser Bracket

**Given** der Loser Pool enthält Piloten
**When** die Bracket-Ansicht angezeigt wird
**Then** werden die Pool-Piloten im Loser Bracket angezeigt
**And** es ist erkennbar wie viele Piloten noch für den nächsten Heat fehlen
**And** ein Pfeil zeigt, dass die ersten 4 Piloten in den nächsten LB-Heat gehen

### AC7: Automatische Abwechslung WB/LB

**Given** ein Heat wurde abgeschlossen
**And** es gibt spielbereite Heats in beiden Brackets (WB und LB)
**When** der nächste Heat bestimmt wird
**Then** wird automatisch das andere Bracket priorisiert (WB → LB → WB → ...)
**And** der Organisator kann manuell einen anderen Heat wählen falls gewünscht

## Technische Anforderungen

### Neue Funktionen

```typescript
// Prüft ob LB-Heat erstellt werden kann
function canGenerateLBHeat(): boolean {
  const isWBActive = hasActiveWBHeats()
  const poolSize = loserPool.length

  if (isWBActive) {
    // Während WB: Warten auf volle Heats
    return poolSize >= 4
  } else {
    // Nach WB: Sofort LB-Finale erstellen wenn noch Piloten da
    return poolSize >= 3
  }
}

// Erstellt neuen LB-Heat aus Pool (FIFO)
function generateLBHeat(): Heat {
  // Nimm die ersten 4 Piloten aus dem Pool (FIFO)
  const pilotsForHeat = loserPool.splice(0, 4)

  const newHeat: Heat = {
    id: generateId(),
    heatNumber: heats.length + 1,
    pilotIds: pilotsForHeat,
    bracketType: 'loser',
    status: 'pending',
    roundNumber: calculateLBRound()
  }

  return newHeat
}

// Prüft ob noch WB-Heats aktiv sind
function hasActiveWBHeats(): boolean {
  return heats.some(h =>
    h.bracketType === 'winner' &&
    h.status === 'pending' ||
    h.status === 'active'
  )
}
```

### Geänderte completeHeat Logik für LB

```typescript
function onLBHeatComplete(heatId: string, rankings: Ranking[]) {
  // 1. Gewinner (Platz 1+2) → zurück in den Pool (am Ende anfügen)
  const winners = rankings.filter(r => r.rank <= 2)
  addToLoserPool(winners.map(w => w.pilotId))  // FIFO

  // 2. Verlierer (Platz 3+4) → ELIMINIERT
  const losers = rankings.filter(r => r.rank > 2)
  eliminatePilots(losers.map(l => l.pilotId))

  // 3. Prüfen ob weiterer LB Heat generiert werden kann
  if (canGenerateLBHeat()) {
    generateLBHeat()
  }
}
```

### WB-Heat Abschluss Logik (erweitert)

```typescript
function onWBHeatComplete(heatId: string, rankings: Ranking[]) {
  // ... Gewinner Logik ...

  // Verlierer (Platz 3+4) → Loser Pool (am Ende anfügen)
  const losers = rankings.filter(r => r.rank > 2)
  addToLoserPool(losers.map(l => l.pilotId))  // FIFO

  // Warten auf Verlierer wenn noch WB aktiv
  if (hasActiveWBHeats() && loserPool.length >= 4) {
    generateLBHeat()
  } else if (!hasActiveWBHeats() && loserPool.length >= 3) {
    // WB fertig: Sofort LB-Finale erstellen
    generateLBFinale()
  }
}
```

### Trigger-Punkte für LB-Heat Generierung

LB-Heats werden automatisch generiert nach:
1. Abschluss eines WB-Heats (wenn Pool >= 4 UND noch WB-Heats aktiv)
2. Abschluss eines LB-Heats (wenn Pool >= 4 UND noch WB-Heats aktiv)
3. Nach WB-Finale (wenn Pool >= 3) → LB Finale

### Heat-Scheduling (Abwechslung WB/LB)

```typescript
// Speichert welches Bracket zuletzt gespielt wurde
lastCompletedBracketType: 'winner' | 'loser' | 'qualifier' | null

// Bestimmt den nächsten empfohlenen Heat
function getNextRecommendedHeat(): Heat | null {
  const pendingWB = getPendingHeats('winner')
  const pendingLB = getPendingHeats('loser')

  // Wenn nur ein Bracket Heats hat → das nehmen
  if (pendingWB.length === 0) return pendingLB[0] ?? null
  if (pendingLB.length === 0) return pendingWB[0] ?? null

  // Beide haben Heats → abwechseln
  if (lastCompletedBracketType === 'winner' || lastCompletedBracketType === 'qualifier') {
    return pendingLB[0]  // LB ist dran
  } else {
    return pendingWB[0]  // WB ist dran
  }
}
```

**Abwechslungs-Logik:**
- Nach WB-Heat → Nächster empfohlener Heat ist LB (falls verfügbar)
- Nach LB-Heat → Nächster empfohlener Heat ist WB (falls verfügbar)
- Qualifier-Heats zählen als WB
- Organisator kann jederzeit manuell anderen Heat wählen

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/stores/tournamentStore.ts` | `generateLBHeat()`, `canGenerateLBHeat()`, `hasActiveWBHeats()` |
| `src/lib/bracket-logic.ts` | LB-Heat Completion → Pool zurück, WB Heat → Warten-Logik |
| `src/lib/bracket-structure-generator.ts` | LB-Struktur-Generierung entfernen/deaktivieren |
| `src/components/bracket-tree.tsx` | Pool-Visualisierung im LB-Bereich |
| `src/components/heat-overview.tsx` | Empfohlenen Heat hervorheben |

## Tasks

- [ ] **Task 1:** `hasActiveWBHeats()` Funktion implementieren (AC: 3)
- [ ] **Task 2:** `canGenerateLBHeat()` Funktion implementieren (AC: 1, 3, 5)
  - [ ] Warten auf 4 Piloten wenn noch WB aktiv
  - [ ] Sofort LB-Finale wenn WB fertig
- [ ] **Task 3:** `generateLBHeat()` Funktion mit FIFO implementieren (AC: 1, 2)
  - [ ] Die ersten 4 Piloten aus dem Pool nehmen (FIFO)
- [ ] **Task 4:** `onLBHeatComplete()` anpassen: Gewinner → Pool (FIFO), Verlierer → eliminiert (AC: 4)
- [ ] **Task 5:** `onWBHeatComplete()` erweitern: Warten auf Verlierer wenn noch WB aktiv (AC: 3)
  - [ ] Nur LB-Heat erstellen wenn Pool >= 4 UND noch WB aktiv
  - [ ] LB-Finale erstellen wenn WB fertig UND Pool >= 3
- [ ] **Task 6:** Trigger nach WB-Heat: Auto-Generate wenn Pool >= 4 (AC: 1)
- [ ] **Task 7:** Trigger nach LB-Heat: Auto-Generate wenn Pool >= 4 (AC: 1)
- [ ] **Task 8:** Bestehende LB-Vorberechnung in bracket-structure-generator.ts deaktivieren
- [ ] **Task 9:** Pool-Visualisierung in bracket-tree.tsx implementieren (AC: 6)
- [ ] **Task 10:** `lastCompletedBracketType` State hinzufügen (AC: 7)
- [ ] **Task 11:** `getNextRecommendedHeat()` mit Abwechslungs-Logik (AC: 7)
- [ ] **Task 12:** UI: Empfohlenen nächsten Heat hervorheben (AC: 7)
- [ ] **Task 13:** Unit Tests für FIFO-Logik
  - [ ] Test: Die ersten 4 Piloten werden entnommen (FIFO)
  - [ ] Test: Reihenfolge wird beibehalten
- [ ] **Task 14:** Unit Tests für Warten auf Verlierer
  - [ ] Test: Warten wenn noch WB aktiv und Pool < 4
  - [ ] Test: LB-Heat erstellen wenn Pool >= 4
- [ ] **Task 15:** Integration Tests: Vollständiger Turnier-Flow mit Pool + Abwechslung

## Dev Notes

### Abhängigkeiten
- **Benötigt:** Story 9-1 (Loser Pool State)
- **Basis für:** Story 9-3 (LB-Finale)

### Wichtige Hinweise
- **FIFO ist kritisch:** Keine zufällige Auswahl mehr
- `splice(0, 4)` nimmt die ersten 4 aus dem Pool (FIFO)
- Bestehende LB-Struktur aus `bracket-structure-generator.ts` muss deaktiviert werden
- Heat-Nummern müssen fortlaufend sein (auch dynamisch generierte)

### FIFO vs Random

```typescript
// RANDOM (alt - NICHT MEHR VERWENDEN):
const shuffledPool = shuffleArray([...loserPool])
const pilotsForHeat = shuffledPool.slice(0, 4)

// FIFO (neu - KORREKT):
const pilotsForHeat = loserPool.splice(0, 4)  // Erste 4 nehmen
```

### Warten auf Verlierer Beispiel

```
Situation:
- WB Heat 3 abgeschlossen: Verlierer = [Max, Markus]
- Pool jetzt: [Max, Markus] = 2 Piloten
- Noch WB Heat 4 ausstehend

Aktion:
- Prüfen: Pool < 4 UND noch WB aktiv
- Ergebnis: NICHTS TUN (warten auf mehr Verlierer)

Nächster Schritt:
- WB Heat 4 abgeschlossen: Verlierer = [Simon, Andi]
- Pool jetzt: [Max, Markus, Simon, Andi] = 4 Piloten
- Prüfen: Pool >= 4
- Ergebnis: LB Heat erstellen mit [Max, Markus, Simon, Andi] (FIFO)
```

### Edge Cases
- Pool hat genau 4 Piloten → Sofort Heat erstellen
- Pool hat 5+ Piloten → Die ersten 4 nehmen (FIFO), Rest bleibt
- WB fertig, Pool hat 3 → LB Finale mit 3 erstellen
- WB fertig, Pool hat 2 → LB Finale mit 2 erstellen (Duell)
- WB fertig, Pool hat 1 → Wildcard → direkt ins Grand Finale

### Testing
- Unit Tests in `tests/lb-heat-generation.test.ts`
- Integration mit bestehendem Turnier-Flow testen
- Verschiedene Pilotenanzahlen testen (7, 9, 15, 27)
- FIFO-Logik testen: Reihenfolge wird beibehalten

## References

- [Course Correction: Dynamic Brackets 2025-12-23](../../change-proposals/course-correction-dynamic-brackets-2025-12-23.md)
- [Architecture: TournamentStore](../../architecture.md#TournamentStore)
