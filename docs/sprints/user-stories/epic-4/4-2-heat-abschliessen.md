# Story 4.2: Heat abschliessen & Dynamische Bracket-Progression

**Status:** review
**Updated:** 2025-12-24
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

- [x] Task 7: Nach Quali-Abschluss WB-Heats erstellen (AC: 2)
  - [x] Prüfen ob alle Quali-Heats completed sind
  - [x] Sammle alle Gewinner (Platz 1+2) in WB Pool
  - [x] Wenn WB Pool >= 4 → `generateWBHeat()` aufrufen

- [x] Task 8: Nach WB-Heat Abschluss Pool füllen (AC: 3)
  - [x] Gewinner (Platz 1+2) → WB Pool (am Ende anfügen)
  - [x] Verlierer (Platz 3+4) → Loser Pool (am Ende anfügen)

- [x] Task 9: `generateWBHeat()` implementieren (AC: 2, 3)
  - [x] Nimm die ersten 4 Piloten aus dem WB Pool
  - [x] Erstelle neuen Heat mit `bracketType: 'winner'`
  - [x] Heat zu `heats` Array hinzufügen

- [x] Task 10: WB Finale Erkennung & Generierung (AC: 3)
  - [x] Prüfen ob WB Pool + Gewinner <= 2 Piloten
  - [x] Wenn ja → `generateWBFinale()` aufrufen
  - [x] WB-Finale hat 2 Piloten

### Phase 3: Dynamische LB-Heat Generierung

- [x] Task 11: `checkForMoreWBHeats()` implementieren (AC: 4, 5)
  - [x] Prüft ob noch WB-Heats mit Status 'pending' existieren
  - [x] Rückgabewert: boolean → `hasActiveWBHeats()`

- [x] Task 12: `generateLBHeat()` implementieren (AC: 4)
  - [x] Nimm die ersten 4 Piloten aus dem Loser Pool (FIFO)
  - [x] Erstelle neuen Heat mit `bracketType: 'loser'`
  - [x] Heat zu `heats` Array hinzufügen

- [x] Task 13: Warten-Logik implementieren (AC: 5)
  - [x] Wenn Pool < 4 UND noch WB-Heats aktiv → Nichts tun
  - [x] Wenn Pool >= 4 → `generateLBHeat()` aufrufen → `canGenerateLBHeat()`

- [x] Task 14: Nach LB-Heat Abschluss Pool füllen (AC: 6)
  - [x] Gewinner (Platz 1+2) → Loser Pool (am Ende anfügen)
  - [x] Verlierer (Platz 3+4) → Eliminiert

### Phase 4: Fertig-Button Integration

- [x] Task 15: Fertig-Button in ActiveHeatView einbinden (AC: 1, 9)
  - [x] onClick ruft `submitHeatResults` auf
  - [x] Success-Pulse Animation (300ms)
  - [x] Transition zur nächsten Heat-Ansicht

- [x] Task 16: `submitHeatResults()` überarbeiten (AC: 1-9)
  - [x] Heat auf 'completed' setzen
  - [x] Rankings speichern
  - [x] Je nach BracketType die richtige Progression aufrufen:
    - [x] `onQualiHeatComplete()` (AC: 2)
    - [x] `onWBHeatComplete()` (AC: 3)
    - [x] `onLBHeatComplete()` (AC: 6)
    - [x] `onWBFinaleComplete()` (Grand Finale Pool)
    - [x] `onLBFinaleComplete()` (Grand Finale Pool)
  - [x] Nächsten Heat aktivieren (AC: 7)

### Phase 5: Edit-Mode

- [x] Task 17: Edit-Mode für abgeschlossene Heats (AC: 8)
  - [x] Edit-Button auf HeatBox (nur bei status='completed')
  - [x] `reopenHeat` Store-Action
  - [x] Rankings neu vergeben
  - [x] Pools und Bracket rückwirkend neu berechnen

- [x] Task 18: Pool-Rollback bei Re-Open (AC: 8)
  - [x] Piloten aus Pools entfernen, die aus diesem Heat kamen
  - [x] Piloten zurück in Pools einfügen, die zu diesem Heat gehört haben
  - [x] Bei Quali-Heat: Alle Piloten zurück in Quali-Heat (nicht in Pools)

### Phase 6: Tests

- [x] Task 19: Unit-Tests für WB-Progression
  - [x] Test: Quali-Heat Abschluss → WB Pool gefüllt
  - [x] Test: WB Pool >= 4 → WB Heat erstellt
  - [x] Test: WB Heat Abschluss → Gewinner in Pool, Verlierer in LB Pool
  - [x] Test: WB Finale wird korrekt erkannt und erstellt

- [x] Task 20: Unit-Tests für LB-Progression
  - [x] Test: WB-Heat Verlierer → LB Pool (FIFO) → `loser-pool.test.ts`
  - [x] Test: LB Pool >= 4 → LB Heat erstellt (FIFO) → `lb-heat-generation.test.ts`
  - [x] Test: LB Heat Abschluss → Gewinner in Pool, Verlierer eliminiert → `lb-finale.test.ts`
  - [x] Test: Warten auf Verlierer wenn noch WB aktiv → `lb-heat-generation.test.ts`

- [x] Task 21: Integration-Tests
  - [x] Test: Volles 8-Piloten-Turnier durchspielen → `bracket-progression.test.ts`
  - [x] Test: Volles 16-Piloten-Turnier durchspielen → `full-bracket-structure.test.ts`
  - [x] Test: Edit-Mode mit Pool-Rollback → `bracket-progression.test.ts`

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
- [x] Dynamisches WB-System: Heats werden on-the-fly erstellt basierend auf WB Pool
- [x] Dynamisches LB-System: Heats werden on-the-fly erstellt basierend auf LB Pool (FIFO)
- [x] FIFO in beiden Brackets: Wer zuerst verliert, fliegt zuerst wieder
- [x] Warten auf Verlierer wenn noch WB aktiv: Pool wird erst geleert wenn 4 Piloten da sind
- [x] WB Finale: Wird korrekt erkannt wenn <= 2 Piloten übrig
- [x] LB Finale: Wird erstellt nach WB-Finale mit allen verbleibenden Pool-Piloten
- [x] Edit-Mode: Pools werden rückwirkend korrekt aktualisiert

### UI/Design
- [x] Fertig-Button ruft submitHeatResults auf
- [x] Success-Pulse Animation bei Abschluss (300ms)
- [x] HeatBox zeigt Ränge neben Piloten-Namen
- [x] Completed HeatBox hat Winner-Green Border + Glow
- [x] Edit-Button (Stift) auf completed HeatBoxen

### Tests
- [x] Unit-Test: WB-Progression (Pool → Heat → Pool) → `dynamic-brackets-phase2.test.ts`
- [x] Unit-Test: LB-Progression (FIFO, Warten auf Verlierer) → `lb-heat-generation.test.ts`
- [x] Unit-Test: WB Finale Erkennung → `dynamic-brackets-phase2.test.ts`
- [x] Unit-Test: LB Finale Erkennung → `lb-finale.test.ts`
- [x] Integration-Test: Volles Turnier durchspielen (8 Piloten) → `bracket-progression.test.ts`
- [x] Integration-Test: Edit-Mode mit Pool-Rollback → `bracket-progression.test.ts`

### Qualität
- [x] Keine TypeScript-Fehler
- [x] Keine Console-Errors
- [x] NFR4 erfüllt (< 200ms Bracket-Update)
- [x] Alle Tests grün (363 Tests)

## References

- [Course Correction: Dynamic Brackets 2025-12-23](../change-proposals/course-correction-dynamic-brackets-2025-12-23.md)
- [PRD: FR13] - Heat mit "Fertig"-Button bestätigen
- [PRD: FR14] - Winner-Bracket Zuordnung (dynamisch)
- [PRD: FR15] - Loser-Bracket Zuordnung (dynamisch)
- [PRD: FR18] - Bracket auto-update (dynamisch)
- [Architecture: TournamentStore](../../architecture.md#TournamentStore)
