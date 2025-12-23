# Story 9.3: LB-Finale & Grand Finale

**Status:** ready-for-dev  
**Story Points:** 5  
**Quelle:** [Change Proposal LB-Pooling 2025-12-23](../../change-proposals/change-proposal-lb-pooling-2025-12-23.md)

## Story

Als **Turnier-Organisator**,  
möchte ich **dass das LB-Finale und Grand Finale korrekt aus dem Pool generiert werden**,  
damit **das Turnier mit einem fairen Finale abgeschlossen werden kann**.

## Hintergrund

Nach dem WB-Finale müssen die verbleibenden Pool-Piloten ein LB-Finale spielen. Der Gewinner tritt dann im Grand Finale gegen den WB-Winner an.

## Acceptance Criteria

### AC1: LB Finale (3-4 Piloten)
**Given** WB Finale ist abgeschlossen  
**And** Loser Pool hat 3-4 Piloten  
**When** LB-Finale generiert wird  
**Then** enthält es alle verbleibenden Pool-Piloten  
**And** Platz 1 geht ins Grand Finale

### AC2: Duell-Heat (2 Piloten)
**Given** WB Finale ist abgeschlossen  
**And** Loser Pool hat genau 2 Piloten  
**When** LB-Finale generiert wird  
**Then** fliegen diese 2 Piloten ein Duell  
**And** der Gewinner geht ins Grand Finale

### AC3: Grand Finale
**Given** WB Finale und LB Finale sind abgeschlossen  
**When** Grand Finale generiert wird  
**Then** enthält es genau 2 Piloten: WB-Winner und LB-Winner

### AC4: Edge Case - 1 Pilot im Pool
**Given** WB Finale ist abgeschlossen  
**And** Loser Pool hat nur 1 Pilot  
**And** kein LB-Heat läuft mehr  
**When** das System den Turnier-Status prüft  
**Then** geht dieser Pilot direkt ins Grand Finale (Wildcard)

## Technische Anforderungen

### LB Finale Erkennung

```typescript
function checkForLBFinale(): boolean {
  // LB Finale wenn:
  // 1. WB Finale ist abgeschlossen
  // 2. Pool hat noch Piloten (1-4)
  // 3. Kein weiterer LB Heat läuft
  
  return isWBFinaleComplete() && 
         loserPool.length >= 1 && 
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
  clearLoserPool()
  
  return newHeat
}
```

### Grand Finale Generierung

```typescript
function generateGrandFinale(): Heat {
  const wbWinner = getWBFinaleWinner()
  const lbWinner = getLBFinaleWinner()
  
  const grandFinale: Heat = {
    id: generateId(),
    heatNumber: heats.length + 1,
    pilotIds: [wbWinner.id, lbWinner.id],
    bracketType: 'grand_finale',
    status: 'pending',
    isFinale: true,
    roundName: 'Grand Finale'
  }
  
  return grandFinale
}
```

### Entscheidungs-Matrix für Pool-Größe nach WB-Finale

| Pool-Größe | Aktion |
|------------|--------|
| 4 Piloten | LB-Finale mit 4 Piloten |
| 3 Piloten | LB-Finale mit 3 Piloten |
| 2 Piloten | Duell-Heat (1v1) |
| 1 Pilot | Wildcard → direkt ins Grand Finale |
| 0 Piloten | Fehler: Sollte nicht vorkommen |

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/stores/tournamentStore.ts` | `checkForLBFinale()`, `generateLBFinale()`, `generateGrandFinale()` |
| `src/lib/bracket-logic.ts` | Finale-Erkennung, Wildcard-Logik |
| `src/components/heat-detail-modal.tsx` | Finale-spezifische UI (falls nötig) |

## Tasks

- [ ] **Task 1:** `isWBFinaleComplete()` Helper implementieren (AC: 1, 2, 3)
- [ ] **Task 2:** `checkForLBFinale()` Funktion implementieren (AC: 1, 2)
- [ ] **Task 3:** `generateLBFinale()` mit variabler Pilotenzahl (AC: 1, 2)
- [ ] **Task 4:** Duell-Heat Handling für 2 Piloten (AC: 2)
- [ ] **Task 5:** Wildcard-Logik für 1 Pilot im Pool (AC: 4)
- [ ] **Task 6:** `generateGrandFinale()` mit WB+LB Winner (AC: 3)
- [ ] **Task 7:** Grand Finale Completion → Turnier-Ende triggern
- [ ] **Task 8:** Unit Tests für alle Finale-Szenarien
- [ ] **Task 9:** Integration Test: Kompletter Turnier-Flow bis Grand Finale

## Dev Notes

### Abhängigkeiten
- **Benötigt:** Story 9-1 (Loser Pool State), Story 9-2 (Dynamische LB-Heat Generierung)
- **Integriert mit:** Epic 5 (Finale & Siegerehrung) - bestehende VictoryCeremony

### Wichtige Hinweise
- Grand Finale hat nur 2 Piloten (kein Standard 4er-Heat)
- LB-Finale kann 2-4 Piloten haben (abhängig von Pool-Größe)
- Bestehende `getTop4Pilots()` Logik muss ggf. angepasst werden
- VictoryCeremony sollte weiterhin funktionieren

### Edge Cases
- WB-Winner gibt auf → LB-Winner gewinnt automatisch
- Beide Finalisten haben gleiche Punktzahl → Tiebreaker nötig (Post-MVP)

### Testing
- Unit Tests in `tests/lb-finale.test.ts`
- Verschiedene Pool-Größen testen (1, 2, 3, 4 Piloten)
- Grand Finale Completion testen

## References

- [Source: docs/sprints/change-proposals/change-proposal-lb-pooling-2025-12-23.md#AC6]
- [Source: docs/sprints/change-proposals/change-proposal-lb-pooling-2025-12-23.md#AC7]
- [Source: docs/sprints/change-proposals/change-proposal-lb-pooling-2025-12-23.md#AC9]
- [Source: docs/sprints/change-proposals/change-proposal-lb-pooling-2025-12-23.md#9.3]
