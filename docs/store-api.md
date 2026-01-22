# Tournament Store API Referenz

**Modul:** `src/stores/tournamentStore.ts`
**Typ:** Zustand Store mit localStorage Persistenz

---

## Import

```typescript
import { useTournamentStore } from './stores/tournamentStore'
```

---

## State

### Piloten

| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `pilots` | `Pilot[]` | Alle registrierten Piloten |

### Tournament Status

| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `tournamentStarted` | `boolean` | Turnier wurde gestartet |
| `tournamentPhase` | `TournamentPhase` | Aktuelle Phase |

**TournamentPhase Values:**
- `setup` - Vor Turnierstart
- `heat-assignment` - Heat-Zuweisung läuft
- `running` - Turnier läuft
- `finale` - Grand Finale Phase
- `completed` - Turnier beendet

### Heats (Single Source of Truth)

| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `heats` | `Heat[]` | Alle Heats |
| `currentHeatIndex` | `number` | Index des aktuellen Heats |

### Bracket Tracking

| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `winnerPilots` | `string[]` | Piloten im Winner Bracket |
| `loserPilots` | `string[]` | Piloten im Loser Bracket |
| `eliminatedPilots` | `string[]` | Ausgeschiedene Piloten |
| `loserPool` | `string[]` | Pool für LB-Heat-Generierung |
| `grandFinalePool` | `string[]` | Pool für Grand Finale |

### Phase Flags

| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `isQualificationComplete` | `boolean` | Alle Quali-Heats abgeschlossen |
| `isWBFinaleComplete` | `boolean` | WB Finale abgeschlossen |
| `isLBFinaleComplete` | `boolean` | LB Finale abgeschlossen |
| `isGrandFinaleComplete` | `boolean` | Grand Finale abgeschlossen |
| `lastCompletedBracketType` | `'winner' \| 'loser' \| 'qualifier' \| null` | Letzter abgeschlossener Bracket-Typ |

### Synchronisation (Story 13-2)

| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `currentWBRound` | `number` | Aktuelle WB-Runde |
| `currentLBRound` | `number` | Aktuelle LB-Runde |
| `lbRoundWaitingForWB` | `boolean` | LB wartet auf WB |

### Rematch (Story 13-4)

| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `pilotBracketStates` | `Record<string, PilotBracketState>` | Pilot → Bracket-State Mapping |
| `rematchHeats` | `Heat[]` | Generierte Rematch-Heats |
| `grandFinaleRematchPending` | `boolean` | Rematches noch offen |

---

## Actions

### Pilot Management

```typescript
// Pilot hinzufügen (max 60)
addPilot(input: { name: string; imageUrl: string; instagramHandle?: string }): boolean

// Pilot aktualisieren
updatePilot(id: string, updates: { name?: string; imageUrl?: string; instagramHandle?: string }): boolean

// Pilot löschen (nur vor Turnierstart)
deletePilot(id: string): boolean

// Pilot als ausgefallen markieren (während Turnier)
markPilotAsDroppedOut(id: string): boolean

// Alle Piloten löschen (setzt auch Turnier zurück)
deleteAllPilots(): void

// Legacy-Alias für deleteAllPilots
clearAllPilots(): boolean
```

### Tournament Actions

```typescript
// Turnier starten (setzt tournamentStarted = true)
startTournament(): void

// Turnier bestätigen (generiert Heats, setzt Phase auf 'heat-assignment')
confirmTournamentStart(): boolean

// Heats generieren (3er/4er Aufteilung)
generateHeats(seed?: number): void

// Turnier zurücksetzen (Piloten bleiben)
resetTournament(): void

// Alles zurücksetzen (inkl. localStorage)
resetAll(): void
```

### Heat Assignment (Phase: heat-assignment)

```typescript
// Heats neu mischen
shuffleHeats(seed?: number): void

// Pilot zu anderem Heat verschieben
movePilotToHeat(pilotId: string, targetHeatId: string): void

// Heat-Zuweisung bestätigen → Phase: running
confirmHeatAssignment(): void

// Heat-Zuweisung abbrechen → Phase: setup
cancelHeatAssignment(): void
```

### Heat Results

```typescript
// Heat-Ergebnisse speichern (Hauptfunktion)
submitHeatResults(heatId: string, rankings: Ranking[]): void

// Aktiven Heat abrufen
getActiveHeat(): Heat | undefined

// Nächsten Heat abrufen
getNextHeat(): Heat | undefined

// Completed Heat wieder öffnen
reopenHeat(heatId: string): void
```

### Pool Management (Story 9-1)

```typescript
// Piloten zum Loser Pool hinzufügen
addToLoserPool(pilotIds: string[]): void

// Piloten aus Loser Pool entfernen
removeFromLoserPool(pilotIds: string[]): void

// Piloten eliminieren (aus Pool → eliminated)
eliminatePilots(pilotIds: string[]): void
```

### Dynamic Heat Generation (Story 9-2, 9-3)

```typescript
// Prüfen ob LB-Heat generiert werden kann
canGenerateLBHeat(): boolean

// LB-Heat aus Pool generieren
generateLBHeat(): Heat | null

// Nächsten empfohlenen Heat (WB/LB Abwechslung)
getNextRecommendedHeat(): Heat | null

// Prüfen ob aktive WB-Heats existieren
hasActiveWBHeats(): boolean

// Prüfen ob aktive LB-Heats existieren
hasActiveLBHeats(): boolean

// WB Finale abgeschlossen?
checkWBFinaleComplete(): boolean

// LB Finale kann generiert werden?
checkForLBFinale(): boolean

// LB Finale generieren
generateLBFinale(): Heat | null

// Grand Finale generieren (4 Piloten)
generateGrandFinale(): Heat | null
```

### Round Management (Story 13-2)

```typescript
// Prüfen ob Runde abgeschlossen
isRoundComplete(bracketType: 'winner' | 'loser', roundNumber: number): boolean

// LB-Runde generieren
generateLBRound(roundNumber: number): Heat[]
```

### Rematch (Story 13-4)

```typescript
// Rematches prüfen und generieren
checkAndGenerateRematches(): Heat[]
```

### Queries

```typescript
// Pilot-Journey (alle completed Heats eines Piloten)
getPilotJourney(pilotId: string): Heat[]

// Top 4 für Siegerehrung
getTop4Pilots(): { place1: Pilot; place2: Pilot; place3: Pilot; place4: Pilot } | null

// Aktuelle Phase-Beschreibung
getCurrentPhaseDescription(): string
```

### Finale

```typescript
// Turnier als completed markieren
completeTournament(): void
```

---

## Verwendungsbeispiele

### Piloten laden

```typescript
function PilotList() {
  const pilots = useTournamentStore(state => state.pilots)
  return pilots.map(p => <PilotCard key={p.id} pilot={p} />)
}
```

### Heat-Ergebnisse speichern

```typescript
function HeatForm({ heatId }: { heatId: string }) {
  const submitHeatResults = useTournamentStore(state => state.submitHeatResults)

  const handleSubmit = (rankings: Ranking[]) => {
    submitHeatResults(heatId, rankings)
  }
}
```

### Turnier-Phase prüfen

```typescript
function TournamentStatus() {
  const phase = useTournamentStore(state => state.tournamentPhase)
  const description = useTournamentStore(state => state.getCurrentPhaseDescription())

  return <div>{description}</div>
}
```

---

## Persistenz

Der Store wird automatisch in localStorage unter dem Key `tournament-storage` gespeichert.

```typescript
// Manuell löschen (falls nötig)
localStorage.removeItem('tournament-storage')
```
