# Story 9.1: Loser Pool State & Logik

**Status:** done  
**Story Points:** 3  
**Quelle:** [Change Proposal LB-Pooling 2025-12-23](../../change-proposals/change-proposal-lb-pooling-2025-12-23.md)

## Story

Als **Turnier-Organisator**,  
möchte ich **dass Verlierer aus dem Winner Bracket in einem Pool gesammelt werden**,  
damit **sie später zu spielbaren LB-Heats zusammengefasst werden können**.

## Hintergrund

Die aktuelle Bracket-Struktur generiert LB-Heats vorab basierend auf einer mathematischen Struktur, die für 1v1-Matches konzipiert ist. Bei 4er-Heats führt das zu LB-Heats mit nur 1-2 Piloten, die nicht spielbar sind.

**Kernprinzip:** Verlierer werden in einem Pool gesammelt, bis genug für einen Heat vorhanden sind (3-4 Piloten).

## Acceptance Criteria

### AC1: Pool wird gefüllt (aus WB-Heats)
**Given** ein WB-Heat wird abgeschlossen  
**When** die Rankings eingegeben werden  
**Then** landen Platz 3+4 im Loser Pool  
**And** Platz 1+2 gehen weiter im Winner Bracket

### AC2: Eliminierte Piloten sind raus
**Given** ein Pilot wurde im LB eliminiert (2x verloren)  
**When** das Turnier weiterläuft  
**Then** erscheint der Pilot in keinem weiteren Heat  
**And** der Pilot wird als "eliminiert" markiert

## Technische Anforderungen

### Neue State-Variablen im TournamentStore

```typescript
interface TournamentState {
  // ... existing state ...
  
  // NEU: Loser Pool - Piloten die auf LB-Heat warten
  loserPool: string[]  // Pilot IDs
  
  // NEU: Eliminierte Piloten (endgültig raus aus Turnier)
  eliminatedPilots: string[]
}
```

### Neue Actions

```typescript
// Piloten zum Loser Pool hinzufügen
addToLoserPool: (pilotIds: string[]) => void

// Piloten aus dem Pool entfernen (für Heat-Erstellung)
removeFromLoserPool: (pilotIds: string[]) => void

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
    
    // NEU: Verlierer (Platz 3+4) → Loser Pool
    const losers = rankings.filter(r => r.rank > 2)
    addToLoserPool(losers.map(l => l.pilotId))
  }
}
```

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/stores/tournamentStore.ts` | `loserPool`, `eliminatedPilots` State + Actions |
| `src/lib/bracket-logic.ts` | WB-Heat Completion → Pool-Logik |

## Tasks

- [x] **Task 1:** `loserPool: string[]` State zum TournamentStore hinzufügen (AC: 1)
- [x] **Task 2:** `eliminatedPilots: string[]` State zum TournamentStore hinzufügen (AC: 2)
- [x] **Task 3:** `addToLoserPool()` Action implementieren (AC: 1)
- [x] **Task 4:** `removeFromLoserPool()` Action implementieren (AC: 1)
- [x] **Task 5:** `eliminatePilots()` Action implementieren (AC: 2)
- [x] **Task 6:** `completeHeat()` anpassen: WB-Verlierer → Pool (AC: 1)
- [x] **Task 7:** Unit Tests für Pool-Logik schreiben (AC: 1, 2)
- [x] **Task 8:** localStorage Persistenz für Pool-State sicherstellen

## Dev Notes

### Abhängigkeiten
- Keine Abhängigkeiten zu anderen Stories in Epic 9
- Basis für alle anderen LB-Pooling Stories

### Wichtige Hinweise
- Pool muss bei `resetTournament()` geleert werden
- Pool-State muss in localStorage persistiert werden (Zustand persist middleware)
- Bestehende LB-Struktur-Generierung wird in Story 9-2 entfernt

### Testing
- Unit Tests in `tests/loser-pool.test.ts`
- Integration mit bestehendem Heat-Completion Flow testen

## References

- [Source: docs/sprints/change-proposals/change-proposal-lb-pooling-2025-12-23.md#3.1]
- [Source: docs/sprints/change-proposals/change-proposal-lb-pooling-2025-12-23.md#3.2]
- [Source: docs/architecture.md - TournamentStore]
