# Story 4.2: Heat abschliessen & Dynamische Bracket-Progression

**Status:** in-progress
**Updated:** 2025-12-23
**Source:** [Course Correction Dynamic Brackets 2025-12-23](../change-proposals/course-correction-dynamic-brackets-2025-12-23.md)

> **🔄 COURSE CORRECTION 2025-12-23**
> Story wurde überarbeitet für vollständiges dynamisches Bracket-System.
> Keine vorberechneten Strukturen mehr. WB + LB sind beide dynamisch.
> Siehe: `docs/sprints/change-proposals/course-correction-dynamic-brackets-2025-12-23.md`

## Story

**Als ein** Organisator (Thomas),
**möchte ich** nach Eingabe der Platzierungen den Heat abschließen und die Piloten automatisch in Winner- oder Loser-Bracket Pools einordnen lassen,
**so dass** neue Heats dynamisch erstellt werden, basierend auf den Ergebnissen, ohne vorberechnete Bracket-Strukturen.

## Acceptance Criteria

### AC 1: Heat abschließen mit Fertig-Button

**Given** ich bin in der ActiveHeatView
**And** mindestens 2 Piloten haben Platzierungen (Rang 1 + Rang 2)
**When** ich auf den "Fertig"-Button klicke
**Then** wird der Heat-Status auf 'completed' gesetzt
**And** die eingegebenen Rankings werden im Heat gespeichert
**And** ein `completedAt` Timestamp wird gesetzt

### AC 2: Dynamische WB-Progression (NEU)

**Given** ein Qualifikations-Heat wurde abgeschlossen
**And** alle Quali-Heats sind fertig
**When** das WB Pool >= 4 Piloten hat
**Then** wird ein neuer WB-Heat automatisch erstellt
**And** die ersten 4 Piloten aus dem WB Pool werden dem Heat zugewiesen
**And** die Piloten werden aus dem Pool entfernt

### AC 3: WB-Heat Progression

**Given** ein WB-Heat wurde abgeschlossen
**When** das Bracket aktualisiert wird
**Then** werden Piloten mit Rang 1 und 2 in den WB Pool eingefügt (am Ende)
**And** wenn WB Pool >= 4 Piloten hat → Neuer WB-Heat wird erstellt
**And** wenn WB Pool + Gewinner <= 2 Piloten → WB Finale wird erstellt
**And** Piloten mit Rang 3 und 4 gehen in den Loser Pool (am Ende)

### AC 4: Dynamische LB-Progression (NEU)

**Given** ein WB- oder LB-Heat wurde abgeschlossen
**And** noch weitere WB-Heats sind aktiv
**When** der Loser Pool >= 4 Piloten hat
**Then** wird ein neuer LB-Heat mit den ersten 4 Piloten aus dem Pool erstellt (FIFO)
**And** die Piloten werden aus dem Pool entfernt

### AC 5: Warten auf Verlierer wenn WB noch aktiv (NEU)

**Given** ein WB-Heat wurde abgeschlossen
**And** noch weitere WB-Heats sind ausstehend
**And** der Loser Pool hat nur 2-3 Piloten
**When** das System prüft ob ein LB-Heat erstellt werden kann
**Then** wird gewartet, bis weitere WB-Verlierer hinzukommen
**And** erst wenn Pool >= 4 Piloten wird LB-Heat erstellt

### AC 6: LB-Heat Progression

**Given** ein LB-Heat wurde abgeschlossen
**When** das Bracket aktualisiert wird
**Then** werden Piloten mit Rang 1 und 2 in den Loser Pool eingefügt (am Ende)
**And** wenn noch WB-Heats aktiv und Pool >= 4 → Neuer LB-Heat wird erstellt
**And** wenn WB fertig und Pool >= 3 → LB Finale wird erstellt
**And** Piloten mit Rang 3 und 4 werden eliminiert

### AC 7: Nächster Heat wird automatisch aktiviert

**Given** ein Heat wurde abgeschlossen
**When** es noch weitere Heats mit Status 'pending' gibt
**Then** wird der nächste Heat automatisch auf 'active' gesetzt
**And** `currentHeatIndex` wird aktualisiert
**And** die ActiveHeatView zeigt den neuen Heat

### AC 8: Heat-Ergebnis korrigieren (Edit-Mode)

**Given** ein Heat hat Status 'completed'
**When** ich auf den Edit-Button (Stift-Icon) am Heat klicke
**Then** öffnet sich der Heat im Edit-Modus
**And** ich kann die Platzierungen neu vergeben
**And** nach "Fertig" wird das Pool-System rückwirkend aktualisiert

### AC 9: Visuelles Feedback bei Abschluss

**Given** ich klicke auf "Fertig"
**When** der Heat erfolgreich abgeschlossen wird
**Then** erscheint ein kurzer visueller Success-Pulse (300ms)
**And** die HeatBox im Bracket zeigt die vergebenen Ränge
**And** der Border der HeatBox wechselt zu Winner-Green mit Glow

## Tasks / Subtasks

### Phase 1: Store Erweiterung für Dynamisches Bracket

- [x] Task 1: `winnerPool: string[]` State zum TournamentStore hinzufügen (AC: 2, 3)
  - [x] Gewinner für den nächsten WB-Heat
  - [x] FIFO: Am Ende der Liste anfügen

- [x] Task 2: `loserPool: string[]` State zum TournamentStore hinzufügen (AC: 3, 4, 6)
  - [x] Verlierer für den nächsten LB-Heat
  - [x] FIFO: Am Ende der Liste anfügen

- [x] Task 3: `grandFinalePool: string[]` State zum TournamentStore hinzufügen (Grand Finale)
  - [x] WB-Finale-Gewinner + LB-Finale-Gewinner

- [x] Task 4: `eliminatedPilots: string[]` State zum TournamentStore hinzufügen (AC: 6)
  - [x] Endgültig ausgeschiedene Piloten (2x verloren)

- [x] Task 5: Status-Flags hinzufügen (AC: 3, 6)
  - [x] `isQualificationComplete: boolean`
  - [x] `isWBFinaleComplete: boolean`
  - [x] `isLBFinaleComplete: boolean`
  - [x] `isGrandFinaleComplete: boolean`

- [x] Task 6: Pool Actions implementieren (AC: 2, 3, 4, 6)
  - [x] `addToWinnerPool(pilotIds: string[])`
  - [x] `addToLoserPool(pilotIds: string[])`
  - [x] `removeFromWinnerPool(count: number)`
  - [x] `removeFromLoserPool(count: number)` (bereits vorhanden, Signatur angepasst)
  - [x] `eliminatePilots(pilotIds: string[])` (bereits vorhanden)

### Phase 2: Dynamische WB-Heat Generierung

- [ ] Task 7: Nach Quali-Abschluss WB-Heats erstellen (AC: 2)
  - [ ] Prüfen ob alle Quali-Heats completed sind
  - [ ] Sammle alle Gewinner (Platz 1+2) in WB Pool
  - [ ] Wenn WB Pool >= 4 → `generateWBHeat()` aufrufen

- [ ] Task 8: Nach WB-Heat Abschluss Pool füllen (AC: 3)
  - [ ] Gewinner (Platz 1+2) → WB Pool (am Ende anfügen)
  - [ ] Verlierer (Platz 3+4) → Loser Pool (am Ende anfügen)

- [ ] Task 9: `generateWBHeat()` implementieren (AC: 2, 3)
  - [ ] Nimm die ersten 4 Piloten aus dem WB Pool
  - [ ] Erstelle neuen Heat mit `bracketType: 'winner'`
  - [ ] Heat zu `heats` Array hinzufügen

- [ ] Task 10: WB Finale Erkennung & Generierung (AC: 3)
  - [ ] Prüfen ob WB Pool + Gewinner <= 2 Piloten
  - [ ] Wenn ja → `generateWBFinale()` aufrufen
  - [ ] WB-Finale hat 2 Piloten

### Phase 3: Dynamische LB-Heat Generierung

- [ ] Task 11: `checkForMoreWBHeats()` implementieren (AC: 4, 5)
  - [ ] Prüft ob noch WB-Heats mit Status 'pending' existieren
  - [ ] Rückgabewert: boolean

- [ ] Task 12: `generateLBHeat()` implementieren (AC: 4)
  - [ ] Nimm die ersten 4 Piloten aus dem Loser Pool (FIFO)
  - [ ] Erstelle neuen Heat mit `bracketType: 'loser'`
  - [ ] Heat zu `heats` Array hinzufügen

- [ ] Task 13: Warten-Logik implementieren (AC: 5)
  - [ ] Wenn Pool < 4 UND noch WB-Heats aktiv → Nichts tun
  - [ ] Wenn Pool >= 4 → `generateLBHeat()` aufrufen

- [ ] Task 14: Nach LB-Heat Abschluss Pool füllen (AC: 6)
  - [ ] Gewinner (Platz 1+2) → Loser Pool (am Ende anfügen)
  - [ ] Verlierer (Platz 3+4) → Eliminiert

### Phase 4: Fertig-Button Integration

- [ ] Task 15: Fertig-Button in ActiveHeatView einbinden (AC: 1, 9)
  - [ ] onClick ruft `submitHeatResults` auf
  - [ ] Success-Pulse Animation (300ms)
  - [ ] Transition zur nächsten Heat-Ansicht

- [ ] Task 16: `submitHeatResults()` überarbeiten (AC: 1-9)
  - [ ] Heat auf 'completed' setzen
  - [ ] Rankings speichern
  - [ ] Je nach BracketType die richtige Progression aufrufen:
    - [ ] `onQualiHeatComplete()` (AC: 2)
    - [ ] `onWBHeatComplete()` (AC: 3)
    - [ ] `onLBHeatComplete()` (AC: 6)
    - [ ] `onWBFinaleComplete()` (Grand Finale Pool)
    - [ ] `onLBFinaleComplete()` (Grand Finale Pool)
  - [ ] Nächsten Heat aktivieren (AC: 7)

### Phase 5: Edit-Mode

- [ ] Task 17: Edit-Mode für abgeschlossene Heats (AC: 8)
  - [ ] Edit-Button auf HeatBox (nur bei status='completed')
  - [ ] `reopenHeat` Store-Action
  - [ ] Rankings neu vergeben
  - [ ] Pools und Bracket rückwirkend neu berechnen

- [ ] Task 18: Pool-Rollback bei Re-Open (AC: 8)
  - [ ] Piloten aus Pools entfernen, die aus diesem Heat kamen
  - [ ] Piloten zurück in Pools einfügen, die zu diesem Heat gehört haben
  - [ ] Bei Quali-Heat: Alle Piloten zurück in Quali-Heat (nicht in Pools)

### Phase 6: Tests

- [ ] Task 19: Unit-Tests für WB-Progression
  - [ ] Test: Quali-Heat Abschluss → WB Pool gefüllt
  - [ ] Test: WB Pool >= 4 → WB Heat erstellt
  - [ ] Test: WB Heat Abschluss → Gewinner in Pool, Verlierer in LB Pool
  - [ ] Test: WB Finale wird korrekt erkannt und erstellt

- [ ] Task 20: Unit-Tests für LB-Progression
  - [ ] Test: WB-Heat Verlierer → LB Pool (FIFO)
  - [ ] Test: LB Pool >= 4 → LB Heat erstellt (FIFO)
  - [ ] Test: LB Heat Abschluss → Gewinner in Pool, Verlierer eliminiert
  - [ ] Test: Warten auf Verlierer wenn noch WB aktiv

- [ ] Task 21: Integration-Tests
  - [ ] Test: Volles 8-Piloten-Turnier durchspielen
  - [ ] Test: Volles 16-Piloten-Turnier durchspielen
  - [ ] Test: Edit-Mode mit Pool-Rollback

## Dev Notes

### Neue State-Struktur

```typescript
interface TournamentState {
  // Bestehend
  heats: Heat[]
  currentHeatIndex: number
  piloten: Pilot[]

  // NEU für Dynamisches Bracket
  winnerPool: string[]       // Gewinner für nächsten WB-Heat (FIFO)
  loserPool: string[]        // Verlierer für nächsten LB-Heat (FIFO)
  grandFinalePool: string[]  // WB-Finale-Gewinner + LB-Finale-Gewinner
  eliminatedPilots: string[]  // Endgültig ausgeschieden

  // NEU Status-Flags
  isQualificationComplete: boolean
  isWBFinaleComplete: boolean
  isLBFinaleComplete: boolean
  isGrandFinaleComplete: boolean

  // Bestehende Actions
  submitHeatResults: (heatId: string, rankings: { pilotId: string; rank: 1|2|3|4 }[]) => void
  reopenHeat: (heatId: string) => void

  // NEU Actions
  addToWinnerPool: (pilotIds: string[]) => void
  addToLoserPool: (pilotIds: string[]) => void
  removeFromWinnerPool: (count: number) => void
  removeFromLoserPool: (count: number) => void
  eliminatePilots: (pilotIds: string[]) => void
}
```

### Dynamische Heat-Generierung

```typescript
// WB Heat Generierung
function generateWBHeat() {
  const pilotsForHeat = winnerPool.splice(0, 4)  // FIFO

  const newHeat: Heat = {
    id: `wb-heat-${Date.now()}`,
    heatNumber: heats.length + 1,
    pilotIds: pilotsForHeat,
    bracketType: 'winner',
    status: 'pending'
  }

  heats.push(newHeat)
}

// LB Heat Generierung
function generateLBHeat() {
  const pilotsForHeat = loserPool.splice(0, 4)  // FIFO

  const newHeat: Heat = {
    id: `lb-heat-${Date.now()}`,
    heatNumber: heats.length + 1,
    pilotIds: pilotsForHeat,
    bracketType: 'loser',
    status: 'pending'
  }

  heats.push(newHeat)
}
```

### FIFO (First In, First Out) Logik

```typescript
// Alle Piloten werden am Ende der Liste angefügt
function addToWinnerPool(pilotIds: string[]) {
  winnerPool.push(...pilotIds)  // FIFO: An Ende anfügen
}

// Bei Heat-Generierung werden die ersten Piloten genommen
function generateWBHeat() {
  const pilotsForHeat = winnerPool.splice(0, 4)  // FIFO: Von vorne nehmen
}
```

### Warten auf Verlierer wenn noch WB aktiv

```typescript
function checkForLBHeatGeneration() {
  const hasMoreWBHeats = checkForMoreWBHeats()

  if (loserPool.length >= 4 && hasMoreWBHeats) {
    // WB noch aktiv: Warten bis 4 Piloten im Pool
    generateLBHeat()
  } else if (!hasMoreWBHeats && loserPool.length >= 3) {
    // WB fertig: Sofort LB-Finale erstellen
    generateLBFinale()
  }
  // Sonst: Warten
}
```

## Definition of Done

### Funktional
- [ ] Dynamisches WB-System: Heats werden on-the-fly erstellt basierend auf WB Pool
- [ ] Dynamisches LB-System: Heats werden on-the-fly erstellt basierend auf LB Pool (FIFO)
- [ ] FIFO in beiden Brackets: Wer zuerst verliert, fliegt zuerst wieder
- [ ] Warten auf Verlierer wenn noch WB aktiv: Pool wird erst geleert wenn 4 Piloten da sind
- [ ] WB Finale: Wird korrekt erkannt wenn <= 2 Piloten übrig
- [ ] LB Finale: Wird erstellt nach WB-Finale mit allen verbleibenden Pool-Piloten
- [ ] Edit-Mode: Pools werden rückwirkend korrekt aktualisiert

### UI/Design
- [ ] Fertig-Button ruft submitHeatResults auf
- [ ] Success-Pulse Animation bei Abschluss (300ms)
- [ ] HeatBox zeigt Ränge neben Piloten-Namen
- [ ] Completed HeatBox hat Winner-Green Border + Glow
- [ ] Edit-Button (Stift) auf completed HeatBoxen

### Tests
- [ ] Unit-Test: WB-Progression (Pool → Heat → Pool)
- [ ] Unit-Test: LB-Progression (FIFO, Warten auf Verlierer)
- [ ] Unit-Test: WB Finale Erkennung
- [ ] Unit-Test: LB Finale Erkennung
- [ ] Integration-Test: Volles Turnier durchspielen (8 Piloten)
- [ ] Integration-Test: Edit-Mode mit Pool-Rollback

### Qualität
- [ ] Keine TypeScript-Fehler
- [ ] Keine Console-Errors
- [ ] NFR4 erfüllt (< 200ms Bracket-Update)
- [ ] Alle Tests grün

## References

- [Course Correction: Dynamic Brackets 2025-12-23](../change-proposals/course-correction-dynamic-brackets-2025-12-23.md)
- [PRD: FR13] - Heat mit "Fertig"-Button bestätigen
- [PRD: FR14] - Winner-Bracket Zuordnung (dynamisch)
- [PRD: FR15] - Loser-Bracket Zuordnung (dynamisch)
- [PRD: FR18] - Bracket auto-update (dynamisch)
- [Architecture: TournamentStore](../../architecture.md#TournamentStore)
