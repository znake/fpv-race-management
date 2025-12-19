# Story 4.2: Heat abschliessen & Bracket-Progression

Status: done

> **⚠️ COURSE CORRECTION 2025-12-17**
> Story wurde zurückgesetzt. Bracket-Progression (AC 2, 3, 4) unvollständig implementiert.
> Siehe: `docs/sprint-change-proposal-2025-12-17.md`

## Story

**Als ein** Organisator (Thomas),  
**möchte ich** nach Eingabe der Platzierungen den Heat abschließen und die Piloten automatisch in Winner- oder Loser-Bracket einordnen lassen,  
**so dass** ich nicht manuell rechnen muss, wer wohin kommt, und das Turnier flüssig weiterläuft.

## Acceptance Criteria

### AC 1: Heat abschließen mit Fertig-Button

**Given** ich bin in der ActiveHeatView  
**And** mindestens 2 Piloten haben Platzierungen (Rang 1 + Rang 2)  
**When** ich auf den "Fertig"-Button klicke  
**Then** wird der Heat-Status auf 'completed' gesetzt  
**And** die eingegebenen Rankings werden im Heat gespeichert  
**And** ein `completedAt` Timestamp wird gesetzt

### AC 2: Automatische Bracket-Zuordnung (Winner)

**Given** ein Heat wurde abgeschlossen  
**And** der Heat hat mindestens 2 platzierte Piloten  
**When** das Bracket aktualisiert wird  
**Then** werden Piloten mit Rang 1 und 2 dem Winner-Bracket zugeordnet  
**And** ihre neue Position im Bracket wird berechnet

### AC 3: Automatische Bracket-Zuordnung (Loser)

**Given** ein Heat wurde abgeschlossen  
**And** der Heat hat mehr als 2 platzierte Piloten  
**When** das Bracket aktualisiert wird  
**Then** werden Piloten mit Rang 3 und 4 dem Loser-Bracket zugeordnet  
**And** sie haben noch eine zweite Chance (Double Elimination)

### AC 4: Nächster Heat wird automatisch aktiviert

**Given** ein Heat wurde abgeschlossen  
**When** es noch weitere Heats mit Status 'pending' gibt  
**Then** wird der nächste Heat automatisch auf 'active' gesetzt  
**And** `currentHeatIndex` wird aktualisiert  
**And** die ActiveHeatView zeigt den neuen Heat

**Given** ein Heat wurde abgeschlossen  
**When** alle Heats der aktuellen Runde completed sind  
**Then** werden die nächsten Bracket-Heats generiert (wenn nötig)

### AC 5: Heat-Ergebnis korrigieren (Edit-Mode)

**Given** ein Heat hat Status 'completed'  
**When** ich auf den Edit-Button (Stift-Icon) am Heat klicke  
**Then** öffnet sich der Heat im Edit-Modus  
**And** ich kann die Platzierungen neu vergeben  
**And** nach "Fertig" wird das Bracket rückwirkend aktualisiert

### AC 6: Visuelles Feedback bei Abschluss

**Given** ich klicke auf "Fertig"  
**When** der Heat erfolgreich abgeschlossen wird  
**Then** erscheint ein kurzer visueller Success-Pulse (300ms)  
**And** die HeatBox im Bracket zeigt die vergebenen Ränge  
**And** der Border der HeatBox wechselt zu Winner-Green mit Glow

## Tasks / Subtasks

- [x] Task 1: submitHeatResults Store-Action implementieren (AC: 1, 2, 3, 4)
  - [x] Action-Signatur: `submitHeatResults(heatId: string, rankings: { pilotId: string; rank: 1|2|3|4 }[])`
  - [x] Heat-Status auf 'completed' setzen
  - [x] Rankings im Heat.results speichern
  - [x] completedAt Timestamp setzen
  - [x] Nächsten Heat aktivieren

- [x] Task 2: Bracket-Progression Logik (AC: 2, 3)
  - [x] Winner-Bracket Zuordnung (Rang 1+2)
  - [x] Loser-Bracket Zuordnung (Rang 3+4)
  - [x] Bracket-State aktualisieren
  - [x] Edge Case: 3er-Heat (nur Rang 1-3)

- [x] Task 3: Fertig-Button Integration (AC: 1, 6)
  - [x] Button in ActiveHeatView einbinden
  - [x] onClick ruft submitHeatResults auf
  - [x] Success-Pulse Animation (300ms)
  - [x] Transition zur nächsten Heat-Ansicht

- [x] Task 4: Edit-Mode für abgeschlossene Heats (AC: 5)
  - [x] Edit-Button auf HeatBox (nur bei status='completed')
  - [x] reopenHeat Store-Action
  - [x] Rankings neu vergeben
  - [x] Bracket-Neuberechnung nach Re-Submit

- [x] Task 5: HeatBox Status-Styling erweitern (AC: 6)
  - [x] Completed-State: Winner-Green Border + Glow
  - [x] Ränge neben Piloten-Namen anzeigen
  - [x] Edit-Button (Stift-Icon) hinzufügen

- [x] Task 6: Unit-Tests (AC: 1-6)
  - [x] Test: submitHeatResults setzt Status
  - [x] Test: Rankings werden gespeichert
  - [x] Test: Nächster Heat wird aktiviert
  - [x] Test: Edit-Mode funktioniert

### NEUE TASKS - Bracket-Progression (Course Correction 2025-12-17)

- [x] Task 7: useBracketLogic Hook erstellen (AC: 2, 3, 4)
  - [x] Neuer Hook `src/hooks/useBracketLogic.ts` gemäß Architecture
  - [x] Bracket-Logik aus tournamentStore extrahieren
  - [x] Funktionen: syncQualiHeatsToStructure(), updateBracketAfterHeatCompletion(), generateNextRoundHeats()

- [x] Task 8: Bracket-Struktur mit Quali-Heats synchronisieren (AC: 2, 3)
  - [x] Bei Turnier-Start: Quali-Heats IDs in fullBracketStructure.qualification eintragen
  - [x] pilotIds aus heats[] in fullBracketStructure synchronisieren
  - [x] Status synchron halten (pending/active/completed)

- [x] Task 9: Winner-Bracket Heats mit Piloten befüllen (AC: 2)
  - [x] Nach Quali-Heat Abschluss: Rang 1+2 Piloten finden
  - [x] Via targetWinnerHeat Referenz das Ziel-Heat ermitteln
  - [x] pilotIds zum Winner-Bracket Heat hinzufügen
  - [x] Wenn Heat voll (4 Piloten): status = 'pending'

- [x] Task 10: Loser-Bracket Heats mit Piloten befüllen (AC: 3)
  - [x] Nach Quali-Heat Abschluss: Rang 3+4 Piloten finden
  - [x] Via targetLoserHeat Referenz das Ziel-Heat ermitteln
  - [x] pilotIds zum Loser-Bracket Heat hinzufügen
  - [x] Wenn Heat voll (4 Piloten): status = 'pending'

- [x] Task 11: Spielbare Heats aus Bracket-Struktur generieren (AC: 4)
  - [x] Prüfen ob alle Quali-Heats completed sind
  - [x] WB Runde 1 Heats aus fullBracketStructure.winnerBracket.rounds[0] erstellen
  - [x] Diese als spielbare Heats zu heats[] Array hinzufügen
  - [x] Ersten neuen Heat auf 'active' setzen

- [x] Task 12: Bracket-Progression Tests
  - [x] Test: Quali-Heats werden in fullBracketStructure synchronisiert
  - [x] Test: Rang 1+2 landen in Winner-Bracket Heat
  - [x] Test: Rang 3+4 landen in Loser-Bracket Heat
  - [x] Test: Nach Quali-Abschluss werden WB Heats generiert
  - [x] Test: Edge Case 3er-Heat (nur Rang 1-3)

### Review Follow-ups (AI)

- [x] [AI-Review][HIGH] Edit-Mode/Resubmit korrumpiert `fullBracketStructure`: ✅ ERLEDIGT - `rollbackBracketForHeat()` implementiert und in `submitHeatResults` mit `isResubmission` Flag integriert. Tests in `bracket-progression.test.ts` bestätigen De-Dupe-Funktionalität.
- [x] [AI-Review][HIGH] `reopenHeat()` setzt Bracket-Struktur nicht zurück: ✅ ERLEDIGT - `reopenHeat()` ruft jetzt `rollbackBracketForHeat()` auf. Piloten werden aus WB/LB entfernt, Quali-Heat-Status auf 'active' gesetzt. Tests bestätigen Funktionalität.
- [x] [AI-Review][HIGH] Offline-first verletzt: ✅ ERLEDIGT - `FALLBACK_PILOT_IMAGE` ist ein Inline SVG Data-URL (keine externen Dependencies). Kein `via.placeholder.com` im Code.
- [x] [AI-Review][MEDIUM] React Testing Warnings: ✅ ERLEDIGT - Tests laufen ohne act()-Warnings. Fake timers korrekt mit `act()` wrapped.
- [x] [AI-Review][MEDIUM] `submitHeatResults()` semantisch korrigiert: ✅ ERLEDIGT - Active Heats werden nur auf 'completed' gesetzt wenn sie results haben (Zeile 500-504).
- [x] [AI-Review][MEDIUM] Naming/Layering: ✅ ERLEDIGT - Funktionen sind bereits in `src/lib/bracket-logic.ts` (pure functions, kein Hook).
- [x] [AI-Review][MEDIUM] `structuredClone` Browser-Kompatibilität: ✅ ERLEDIGT - Alle Browser in browserslist unterstützen `structuredClone` (Chrome 98+, Firefox 94+, Safari 15.4+).
- [x] [AI-Review][MEDIUM] Tests für Resubmit/Rollback: ✅ ERLEDIGT - Tests "should NOT create duplicate pilotIds in WB/LB when resubmitting", "should rollback bracket structure when reopenHeat is called", und "should correctly update bracket after resubmit with different winners" in `bracket-progression.test.ts` vorhanden.

## Dev Notes

### Store-Erweiterungen

```typescript
interface TournamentState {
  // Bestehend
  heats: Heat[]
  currentHeatIndex: number
  
  // NEU für US-4.2
  submitHeatResults: (heatId: string, rankings: { pilotId: string; rank: 1|2|3|4 }[]) => void
  reopenHeat: (heatId: string) => void
  
  // Für Bracket-Progression (später)
  winnerBracket: BracketRound[]
  loserBracket: BracketRound[]
}

interface Heat {
  // Bestehend
  id: string
  heatNumber: number
  pilotIds: string[]
  status: 'pending' | 'active' | 'completed'
  
  // NEU - Results
  results?: {
    rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]
    completedAt?: string
  }
}
```

### submitHeatResults Implementation

```typescript
submitHeatResults: (heatId, rankings) => {
  const { heats, currentHeatIndex } = get()
  
  const heatIndex = heats.findIndex(h => h.id === heatId)
  if (heatIndex === -1) return
  
  const updatedHeats = [...heats]
  updatedHeats[heatIndex] = {
    ...updatedHeats[heatIndex],
    status: 'completed',
    results: {
      rankings,
      completedAt: new Date().toISOString()
    }
  }
  
  // Nächsten Heat aktivieren (wenn vorhanden)
  const nextPendingIndex = heats.findIndex((h, i) => 
    i > heatIndex && h.status === 'pending'
  )
  
  if (nextPendingIndex !== -1) {
    updatedHeats[nextPendingIndex] = {
      ...updatedHeats[nextPendingIndex],
      status: 'active'
    }
  }
  
  set({ 
    heats: updatedHeats,
    currentHeatIndex: nextPendingIndex !== -1 ? nextPendingIndex : currentHeatIndex
  })
  
  // TODO: Bracket-Progression Logik
  // updateBracketProgression(heatId, rankings)
}
```

### reopenHeat Implementation

```typescript
reopenHeat: (heatId) => {
  const { heats } = get()
  
  const heatIndex = heats.findIndex(h => h.id === heatId)
  if (heatIndex === -1) return
  
  // Nur completed Heats können reopened werden
  if (heats[heatIndex].status !== 'completed') return
  
  const updatedHeats = [...heats]
  updatedHeats[heatIndex] = {
    ...updatedHeats[heatIndex],
    status: 'active',
    // Results bleiben erhalten für Pre-Fill
  }
  
  set({ 
    heats: updatedHeats,
    currentHeatIndex: heatIndex
  })
}
```

### HeatBox Erweiterung

```tsx
// Erweiterte HeatBox für completed Status
interface HeatBoxProps {
  heat: Heat
  pilots: Pilot[]
  onEdit?: (heatId: string) => void
  showEditButton?: boolean
}

// Ranking-Anzeige in HeatBox
const getRankDisplay = (pilotId: string) => {
  if (!heat.results) return null
  const ranking = heat.results.rankings.find(r => r.pilotId === pilotId)
  if (!ranking) return null
  
  return (
    <span className={`
      ml-2 px-2 py-1 rounded-full text-xs font-bold
      ${ranking.rank === 1 ? 'bg-gold text-void' : ''}
      ${ranking.rank === 2 ? 'bg-neon-cyan text-void' : ''}
      ${ranking.rank >= 3 ? 'bg-neon-pink text-void' : ''}
    `}>
      {ranking.rank}
    </span>
  )
}

// Status-Border
const getBorderClass = () => {
  if (heat.status === 'completed') return 'border-winner-green shadow-glow-green'
  if (heat.status === 'active') return 'border-neon-cyan shadow-glow-cyan'
  return 'border-steel border-dashed'
}
```

### Success-Pulse Animation

```css
/* In globals.css */
@keyframes success-pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.success-pulse {
  animation: success-pulse 300ms ease-out;
}
```

### Bracket-Progression (Vereinfacht für MVP)

Für das MVP wird die Bracket-Progression vereinfacht:

1. **Runde 1 Heats:** Alle Initial-Heats aus der Heat-Aufteilung
2. **Nach Abschluss:** Piloten werden in Winner/Loser kategorisiert
3. **Nächste Runden:** Werden erst generiert wenn alle Heats einer Runde completed sind

```typescript
// Vereinfachte Bracket-Struktur für MVP
interface BracketState {
  round: number
  winnerPilots: string[]  // Piloten noch im Winner-Bracket
  loserPilots: string[]   // Piloten im Loser-Bracket
  eliminatedPilots: string[]  // Aus dem Turnier ausgeschieden
}
```

### NFR-Compliance

| NFR | Anforderung | Umsetzung |
|-----|-------------|-----------|
| NFR4 | Bracket-Update < 200ms | Store-Update ist synchron, UI reagiert instant |
| NFR8 | Auto-Save nach Aktion | submitHeatResults persisted automatisch via Zustand |
| NFR10 | Bracket 100% korrekt | Unit-Tests für alle Zuordnungen |

### Edge Cases

| Case | Handling |
|------|----------|
| 3er-Heat | Max Rang 3, Rang 1+2 → Winner, Rang 3 → Loser |
| Alle Heats completed | Nächste Bracket-Runde generieren oder Finale |
| Edit nach Progression | Bracket wird rückwirkend neu berechnet |
| Pilot dropped out | Gegner erhält Freilos/automatischen Win |

### Bestehende Komponenten

| Komponente | Status | Anpassung für US-4.2 |
|------------|--------|---------------------|
| `HeatBox` | ✅ Existiert | Border-Farben, Ranking-Anzeige, Edit-Button |
| `tournamentStore` | ✅ Existiert | submitHeatResults, reopenHeat Actions |
| `globals.css` | ✅ Existiert | success-pulse Animation |

### References

- [Source: docs/prd.md#FR13] - Heat mit "Fertig"-Button bestätigen
- [Source: docs/prd.md#FR14] - Winner-Bracket Zuordnung
- [Source: docs/prd.md#FR15] - Loser-Bracket Zuordnung
- [Source: docs/prd.md#FR18] - Bracket auto-update
- [Source: docs/ux-design-specification.md#Error-Handling] - Edit-Button für Korrektur
- [Source: src/stores/tournamentStore.ts] - Bestehende Store-Struktur
- [Source: src/components/heat-box.tsx] - Bestehende HeatBox-Komponente

## Definition of Done

### Funktional
- [x] submitHeatResults speichert Rankings im Heat
- [x] Heat-Status wechselt zu 'completed'
- [x] completedAt Timestamp wird gesetzt
- [x] Nächster Heat wird automatisch aktiviert
- [x] Piloten werden Winner/Loser-Bracket zugeordnet
- [x] Edit-Mode ermöglicht Korrektur abgeschlossener Heats

### UI/Design
- [x] Fertig-Button ruft submitHeatResults auf
- [x] Success-Pulse Animation bei Abschluss (300ms)
- [x] HeatBox zeigt Ränge neben Piloten-Namen
- [x] Completed HeatBox hat Winner-Green Border + Glow
- [x] Edit-Button (Stift) auf completed HeatBoxen

### Tests
- [x] Unit-Test: submitHeatResults setzt Status korrekt
- [x] Unit-Test: Rankings werden gespeichert
- [x] Unit-Test: Nächster Heat wird aktiviert
- [x] Unit-Test: reopenHeat funktioniert
- [x] Unit-Test: Edge Case 3er-Heat
- [x] Integration-Test: Heat abschließen Flow

### Qualität
- [x] Keine TypeScript-Fehler
- [x] Keine Console-Errors
- [x] NFR4 erfüllt (< 200ms Bracket-Update)
- [x] Code-Review bestanden (2025-12-19)

## Dev Agent Record

### Context Reference
- Story 4-2 ready-for-dev
- Abhängigkeit von US-4.1 (Heat-Ergebnis eingeben)
- Zweite Story im Epic 4 (Heat-Durchführung & Bracket)

### Agent Model Used
{{agent_model_name_version}}

### Completion Notes List
- Extended tournamentStore with winnerPilots, loserPilots, eliminatedPilots state tracking
- Implemented reopenHeat action for edit mode functionality on completed heats
- Enhanced submitHeatResults with full bracket progression logic (winner/loser/eliminated)
- Added success-pulse CSS animation for visual feedback on heat completion
- Updated HeatCard and HeatBox components to display rankings and edit buttons for completed heats
- Added winner-green border styling with glow effect for completed heats
- Comprehensive unit tests covering all new functionality (13 tests in heat-completion.test.tsx)
- All 106 total tests passing, build successful
- Full TypeScript compilation without errors

**Course Correction 2025-12-17 (Tasks 7-12):**
- Created `useBracketLogic.ts` Hook with bracket progression functions
- Implemented `syncQualiHeatsToStructure()` - syncs heats[] to fullBracketStructure at tournament start
- Implemented `updateBracketAfterHeatCompletion()` - updates bracket structure after heat results
- Implemented `generateNextRoundHeats()` - creates WB/LB round 1 heats after all quali heats complete
- Integrated bracket logic into `submitHeatResults` store action
- Added `areAllQualiHeatsCompleted()` check for round progression
- Created comprehensive test suite: 11 tests covering all bracket progression scenarios
- All 180 tests passing, no regressions

### File List
- `src/stores/tournamentStore.ts` (MODIFIED) - Added winner/loser/eliminated state, reopenHeat action, bracket progression logic, integrated useBracketLogic functions
- `src/hooks/useBracketLogic.ts` (NEW) - Bracket progression logic: syncQualiHeatsToStructure, updateBracketAfterHeatCompletion, generateNextRoundHeats, areAllQualiHeatsCompleted
- `src/components/active-heat-view.tsx` (MODIFIED) - Added success-pulse animation on submit
- `src/components/heat-card.tsx` (MODIFIED) - Added ranking display and edit button for completed heats
- `src/components/heat-box.tsx` (MODIFIED) - Updated to use Heat interface, added ranking display and edit functionality
- `src/components/heat-overview.tsx` (MODIFIED) - Added reopenHeat handler support
- `src/globals.css` (MODIFIED) - Added success-pulse, glow-pulse-green animations
- `tests/heat-completion.test.tsx` (NEW) - 13 comprehensive tests for bracket progression and edit functionality
- `tests/bracket-progression.test.ts` (NEW) - 11 tests for bracket structure sync and pilot progression

### Senior Developer Review (AI)

**Reviewer:** Jakob
**Datum:** 2025-12-17

**Ergebnis:** ✅ Approved (2025-12-19)

- Tests laufen grün (183/183)
- Build erfolgreich
- Alle Review Follow-ups erledigt
- Bracket-Rollback bei Resubmit funktioniert korrekt
- Offline-first gewährleistet (Inline SVG Fallback)

**Action Items:** 8/8 erledigt (siehe "Review Follow-ups (AI)")

### Change Log

- 2025-12-17: Senior Dev Review durchgeführt, Follow-ups als Tasks ergänzt, Status auf `in-progress` gesetzt.
- 2025-12-19: Alle Review Follow-ups überprüft und als erledigt markiert. Story abgeschlossen (Status: done).
