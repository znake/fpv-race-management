# Story 9.2: Dynamische LB-Heat Generierung

**Status:** ready-for-dev  
**Story Points:** 5  
**Quelle:** [Change Proposal LB-Pooling 2025-12-23](../../change-proposals/change-proposal-lb-pooling-2025-12-23.md)

## Story

Als **Turnier-Organisator**,  
möchte ich **dass LB-Heats dynamisch aus dem Pool erstellt werden wenn genug Piloten vorhanden sind**,  
damit **jeder LB-Heat spielbar ist (3-4 Piloten)**.

## Hintergrund

Statt vorberechneter LB-Struktur werden LB-Heats on-demand erstellt, wenn der Pool mindestens 4 Piloten enthält (während WB aktiv) oder 3+ Piloten (nach WB-Finale).

## Acceptance Criteria

### AC1: LB Heat wird generiert (während WB aktiv)
**Given** das WB hat noch ausstehende Heats  
**And** der Loser Pool hat 4 oder mehr Piloten  
**When** ein Heat abgeschlossen wird  
**Then** wird ein neuer LB-Heat mit 4 zufällig ausgewählten Piloten erstellt

### AC2: Zufällige Pool-Auswahl
**Given** der Pool hat mehr als 4 Piloten  
**When** ein LB-Heat erstellt wird  
**Then** werden 4 Piloten **zufällig** aus dem Pool ausgewählt  
**And** die Auswahl sorgt für Abwechslung (nicht immer dieselben Gegner)

### AC3: LB Gewinner bleiben im Pool
**Given** ein LB-Heat wird abgeschlossen  
**When** die Rankings eingegeben werden  
**Then** gehen Platz 1+2 zurück in den Pool  
**And** Platz 3+4 werden eliminiert

### AC4: Wildcard (1-2 Piloten warten)
**Given** der Pool hat nur 1-2 Piloten  
**And** noch LB-Heats laufen  
**When** der nächste LB-Heat Gewinner produziert  
**Then** werden die wartenden Piloten mit den Gewinnern gemischt  
**And** der nächste LB-Heat hat dann 3-4 Piloten

### AC5: Keine leeren/zu kleinen LB-Heats während WB
**Given** das WB hat noch ausstehende Heats  
**When** LB-Heats angezeigt werden  
**Then** hat jeder spielbereite LB-Heat genau 4 Piloten

### AC6: Pool-Visualisierung im Loser Bracket
**Given** der Loser Pool enthält Piloten  
**When** die Bracket-Ansicht angezeigt wird  
**Then** werden die Pool-Piloten im Loser Bracket angezeigt  
**And** es ist erkennbar wie viele Piloten noch fehlen für den nächsten Heat

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
    return poolSize >= 4  // Während WB: Warte auf volle Heats
  } else {
    return poolSize >= 3  // Nach WB: Auch 3er-Heats erlaubt
  }
}

// Erstellt neuen LB-Heat aus Pool
function generateLBHeat(): Heat {
  // Nimm max 4 Piloten zufällig aus dem Pool
  const shuffledPool = shuffleArray([...loserPool])
  const pilotsForHeat = shuffledPool.slice(0, 4)
  
  // Aus Pool entfernen
  removeFromLoserPool(pilotsForHeat)
  
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
```

### Geänderte completeHeat Logik für LB

```typescript
function onLBHeatComplete(heatId: string, rankings: Ranking[]) {
  // 1. Gewinner (Platz 1+2) → zurück in den Pool
  const winners = rankings.filter(r => r.rank <= 2)
  addToLoserPool(winners.map(w => w.pilotId))
  
  // 2. Verlierer (Platz 3+4) → ELIMINIERT
  const losers = rankings.filter(r => r.rank > 2)
  eliminatePilots(losers.map(l => l.pilotId))
  
  // 3. Prüfen ob weiterer LB Heat generiert werden kann
  if (canGenerateLBHeat()) {
    generateLBHeat()
  }
}
```

### Trigger-Punkte für LB-Heat Generierung

LB-Heats werden automatisch generiert nach:
1. Abschluss eines WB-Heats (wenn Pool >= 4)
2. Abschluss eines LB-Heats (wenn Pool >= 4, oder >= 3 nach WB-Finale)

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

### Pool-Visualisierung

```
LOSER BRACKET
─────────────────────────────────────────────────────
│ LOSER POOL         │ LB Heat 6          │ LB Heat 7          │
│                    │                    │                    │
│  [Lisa]            │ [in Arbeit...]     │ [noch leer]        │
│  [Thomas]          │                    │                    │
│  [Lukas]           │                    │                    │
│  [David]           │                    │                    │
│                    │                    │                    │
│  4/4 Piloten       │                    │                    │
│  → Heat bereit!    │                    │                    │
─────────────────────────────────────────────────────
```

Die Pool-Anzeige zeigt:
- Alle Piloten im Pool (mit Foto/Name)
- Anzahl Piloten / benötigte Anzahl (z.B. "3/4")
- Status: "Warte auf Piloten" oder "Heat bereit!"

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/stores/tournamentStore.ts` | `generateLBHeat()`, `canGenerateLBHeat()` |
| `src/lib/bracket-logic.ts` | LB-Heat Completion → Pool zurück |
| `src/lib/bracket-structure-generator.ts` | LB-Struktur-Generierung entfernen/deaktivieren |
| `src/components/bracket-tree.tsx` | Pool-Visualisierung im LB-Bereich |
| `src/components/heat-overview.tsx` | Empfohlenen Heat hervorheben |

## Tasks

- [ ] **Task 1:** `canGenerateLBHeat()` Funktion implementieren (AC: 1, 5)
- [ ] **Task 2:** `generateLBHeat()` Funktion mit Shuffle implementieren (AC: 1, 2)
- [ ] **Task 3:** `completeHeat()` für LB anpassen: Gewinner → Pool, Verlierer → eliminiert (AC: 3)
- [ ] **Task 4:** Trigger nach WB-Heat: Auto-Generate wenn Pool >= 4 (AC: 1)
- [ ] **Task 5:** Trigger nach LB-Heat: Auto-Generate wenn Pool >= 4 (AC: 1)
- [ ] **Task 6:** Wildcard-Logik: Wartende Piloten mischen (AC: 4)
- [ ] **Task 7:** Bestehende LB-Vorberechnung in bracket-structure-generator.ts deaktivieren
- [ ] **Task 8:** Pool-Visualisierung in bracket-tree.tsx implementieren (AC: 6)
- [ ] **Task 9:** `lastCompletedBracketType` State hinzufügen (AC: 7)
- [ ] **Task 10:** `getNextRecommendedHeat()` mit Abwechslungs-Logik (AC: 7)
- [ ] **Task 11:** UI: Empfohlenen nächsten Heat hervorheben (AC: 7)
- [ ] **Task 12:** Unit Tests für dynamische LB-Generierung
- [ ] **Task 13:** Integration Tests: Vollständiger Turnier-Flow mit Pool + Abwechslung

## Dev Notes

### Abhängigkeiten
- **Benötigt:** Story 9-1 (Loser Pool State)
- **Basis für:** Story 9-3 (LB-Finale)

### Wichtige Hinweise
- `shuffleArray` Utility existiert bereits in `src/lib/utils.ts`
- Bestehende LB-Struktur aus `bracket-structure-generator.ts` muss deaktiviert werden
- Heat-Nummern müssen fortlaufend sein (auch dynamisch generierte)

### Edge Cases
- Pool hat genau 4 Piloten → Sofort Heat erstellen
- Pool hat 5+ Piloten → 4 zufällig auswählen, Rest bleibt
- Letzter WB-Heat fertig, Pool hat 3 → LB-Heat mit 3 erstellen

### Testing
- Unit Tests in `tests/lb-heat-generation.test.ts`
- Integration mit bestehendem Turnier-Flow testen
- Verschiedene Pilotenanzahlen testen (7, 9, 15, 27)

## References

- [Source: docs/sprints/change-proposals/change-proposal-lb-pooling-2025-12-23.md#3.2]
- [Source: docs/sprints/change-proposals/change-proposal-lb-pooling-2025-12-23.md#2.2]
- [Source: docs/sprints/change-proposals/change-proposal-lb-pooling-2025-12-23.md#9]
