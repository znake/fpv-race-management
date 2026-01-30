# Lap Time Feature - Optionale Zeiteingabe fuer Heats

## Context

### Original Request
User moechte optionale Zeiteingabe fuer Heats hinzufuegen (Zeit fuer 3 Runden pro Pilot). Zeiten sollen unaufdringlich aber einfach zu erfassen sein. Typische Zeiten: 45 Sekunden bis 2 Minuten.

### Interview Summary
**Key Discussions**:
- Zeit-Eingabe via Digit-Akkumulation NACH Rang-Vergabe (wenn Pilot fokussiert und bereits Rang hat)
- Anzeige in Bracket Heat-Boxes neben Rank-Badge
- Uhr-Icon im Heat-Detail-Modal fuer nachtraegliche Eingabe (Add/Edit/Remove)
- Timeout: 2 Sekunden nach Klick/letztem Tastendruck
- Format: Immer M:SS (z.B. `0:45`, `1:23`)
- Validierung: 20s - 5min, ausserhalb wird ignoriert
- Mobile: Gleich wie Desktop

**Research Findings**:
- Test-Framework: Vitest mit React Testing Library
- Storage: Zustand mit localStorage persistence (keine Migration noetig)
- Icon-Library: Lucide React bereits installiert
- Keyboard-Shortcuts: `useEffect` + `window.addEventListener` Pattern
- Relevante Tests: `/tests/placement-entry-modal.test.tsx`

### Metis Review
**Identified Gaps** (addressed):
- Timeout-Dauer: 2s (user confirmed - nach Klick oder letztem Digit)
- Zeit-Format: M:SS (user confirmed)
- Edit/Remove UX: Vollstaendig mit X-Button (user confirmed)
- Mobile: Gleich wie Desktop (user confirmed)
- Validierung: 20s - 5min (user confirmed)

---

## Work Objectives

### Core Objective
Optionale Rundenzeiten pro Pilot in Heats erfassen und anzeigen - unauffaellig aber leicht zugaenglich.

### Concrete Deliverables
- Schema-Erweiterung: `lapTimeMs?: number` in `Ranking` Interface
- Utility-Funktionen: `formatLapTime()` und `parseLapTimeDigits()` in `/src/lib/ui-helpers.ts`
- PlacementEntryModal: Digit-Akkumulation fuer Zeit-Eingabe
- FilledBracketHeatBox: Zeit-Anzeige neben Rank-Badge
- HeatDetailModal: Uhr-Icon mit Inline-Input fuer Add/Edit/Remove
- CSV-Export: Zeiten im "Ergebnisse"-Feld (Format: `WB-R1-H1: 1. (0:45)`)
- Tests fuer Zeit-Parsing und UI-Interaktionen

### Definition of Done
- [x] Zeiten koennen im Placement-Modal via Ziffern eingegeben werden (nach Rang-Vergabe)
- [x] Zeiten werden in Heat-Boxes angezeigt (Format M:SS)
- [x] Zeiten koennen nachtraeglich hinzugefuegt/bearbeitet/entfernt werden
- [x] Alle neuen Tests bestehen: `npm test`
- [x] Zeiten persistieren in localStorage

### Must Have
- Zeit-Eingabe nach Rang-Vergabe (Digit-Akkumulation)
- Zeit-Anzeige in Bracket-View
- Nachtraegliche Zeit-Bearbeitung via Detail-Modal
- Validierung: 20s - 5min

### Must NOT Have (Guardrails)
- KEINE separate TimeEntry-Komponente erstellen
- KEINE Zeit-Statistiken oder Leaderboards
- KEINE Sortierung nach Zeit
- KEINE Validierungs-Fehlermeldungen im UI (ungueltige Eingaben werden ignoriert)
- KEINE Animationen fuer Zeit-Eingabe (ausser bestehende rank-badge Animationen)
- KEINE Aenderung am Heat Interface (Zeiten nur in Ranking)
- KEINE neuen Interfaces ausser lapTimeMs in Ranking
- MAX 10 neue Test-Cases insgesamt

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest)
- **User wants tests**: TDD
- **Framework**: Vitest + React Testing Library

### TDD Workflow
Jede Task folgt RED-GREEN-REFACTOR:
1. **RED**: Schreibe fehlenden Test zuerst
2. **GREEN**: Implementiere minimalen Code zum Bestehen
3. **REFACTOR**: Bereinige bei gruenen Tests

---

## Task Flow

```
Task 1 (Schema) ──┬──> Task 2 (Utilities)
                  │
                  └──> Task 3 (PlacementModal) ──> Task 5 (DetailModal)
                  │
                  └──> Task 4 (BracketHeatBox)
                  │
                  └──> Task 6 (CSV-Export)
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 3, 4, 6 | Alle haengen nur von Task 1+2 ab |

| Task | Depends On | Reason |
|------|------------|--------|
| 2 | 1 | Braucht Ranking.lapTimeMs Type |
| 3 | 1, 2 | Braucht Type und Utilities |
| 4 | 1, 2 | Braucht Type und formatLapTime |
| 5 | 1, 2 | Braucht Type und Utilities |
| 6 | 1, 2 | Braucht Type und formatLapTime |

---

## TODOs

- [x] 1. Schema erweitern: lapTimeMs in Ranking Interface

  **What to do**:
  - Oeffne `/src/lib/schemas.ts`
  - Erweitere `Ranking` Interface um `lapTimeMs?: number`
  - Type repraesentiert Zeit in Millisekunden

  **Must NOT do**:
  - Kein neues TimeEntry Interface
  - Keine Zod-Validierung fuer lapTimeMs (optional field)

  **Parallelizable**: NO (Basis fuer alle anderen Tasks)

  **References**:
  - `src/lib/schemas.ts:69-72` - Ranking Interface (hier erweitern)
  - `src/lib/schemas.ts:77-80` - HeatResults Interface nutzt Ranking[] (Zeile 78: `rankings: Ranking[]`)
  - `src/types/index.ts:15` - Re-exports Ranking und HeatResults fuer gesamte App

  **Acceptance Criteria**:
  - [x] `Ranking` Interface hat `lapTimeMs?: number` Property
  - [x] TypeScript kompiliert ohne Fehler: `npx tsc --noEmit`

  **Commit**: YES
  - Message: `feat(schema): add optional lapTimeMs to Ranking interface`
  - Files: `src/lib/schemas.ts`

---

- [x] 2. Utility-Funktionen: formatLapTime und parseLapTimeDigits

  **What to do**:
  - Oeffne `/src/lib/ui-helpers.ts`
  - Implementiere `formatLapTime(ms: number): string`
    - Gibt immer M:SS Format zurueck (z.B. `0:45`, `1:23`)
    - Edge cases: 0 -> `0:00`, 60000 -> `1:00`
  - Implementiere `parseLapTimeDigits(digits: string): number | null`
    - 2 Ziffern: Sekunden (z.B. "45" -> 45000ms)
    - 3 Ziffern: M:SS (z.B. "123" -> 83000ms = 1:23)
    - Validierung: 20000ms - 300000ms, sonst null
    - Leerer String oder ungueltig -> null
  - Schreibe Tests ZUERST in `/tests/lap-time-formatting.test.ts`

  **Must NOT do**:
  - Keine separate Datei fuer Zeit-Utilities
  - Keine TimeParser Klasse
  - Keine komplexen Validierungen

  **Parallelizable**: NO (haengt von Task 1 ab, Basis fuer 3-5)

  **References**:
  - `src/lib/ui-helpers.ts` - Hier die Funktionen hinzufuegen (existierende Helper-Datei)
  - `src/lib/ui-helpers.ts:1-20` - Bestehende Helper-Funktionen als Pattern

  **Acceptance Criteria**:
  - [x] Test-Datei erstellt: `/tests/lap-time-formatting.test.ts`
  - [x] `formatLapTime(45000)` === `"0:45"`
  - [x] `formatLapTime(83000)` === `"1:23"`
  - [x] `formatLapTime(120000)` === `"2:00"`
  - [x] `parseLapTimeDigits("45")` === `45000`
  - [x] `parseLapTimeDigits("123")` === `83000`
  - [x] `parseLapTimeDigits("10")` === `null` (unter 20s)
  - [x] `parseLapTimeDigits("999")` === `null` (9:99 = 599s, aber Sekunden >59 ungueltig)
  - [x] `parseLapTimeDigits("500")` === `null` (ueber 5min)
  - [x] `npm test -- lap-time-formatting` -> PASS (via vitest)

  **Commit**: YES
  - Message: `feat(utils): add lap time formatting and parsing utilities`
  - Files: `src/lib/ui-helpers.ts`, `tests/lap-time-formatting.test.ts`

---

- [x] 3. PlacementEntryModal: Digit-Akkumulation fuer Zeit-Eingabe

  **ABLAUF (User Story)**:
  ```
  1. User klickt auf Pilot A → bekommt Rang 1
  2. User tippt innerhalb 2s "130" → Zeit 1:30 wird zu Pilot A gespeichert
  3. User klickt auf Pilot B → bekommt Rang 2
  4. User klickt auf Pilot C → bekommt Rang 3 (keine Zeit, weil keine Ziffern)
  5. User klickt auf Pilot D → bekommt Rang 4
  6. User tippt "213" → Zeit 2:13 wird zu Pilot D gespeichert
  7. Fertig klicken → alle Rankings + Zeiten werden gespeichert
  ```
  
  **Kern-Logik**: Nach jedem Klick (Rang-Vergabe) startet ein 2-Sekunden-Fenster.
  Ziffern die in diesem Fenster getippt werden, gehoeren zum ZULETZT GEKLICKTEN Piloten.

  **What to do**:
  - Oeffne `/src/components/placement-entry-modal.tsx`
  
  **Prop-Signatur Erweiterung** (Zeile 13):
  ```typescript
  // ALT:
  onSubmitResults: (heatId: string, rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]) => void
  // NEU:
  onSubmitResults: (heatId: string, rankings: { pilotId: string; rank: 1 | 2 | 3 | 4; lapTimeMs?: number }[]) => void
  ```
  - Die Callsite in `BracketTree.tsx` (Zeile ~180) ruft `submitHeatResults` auf, das bereits `Ranking[]` akzeptiert
  - Da `Ranking` nach Task 1 `lapTimeMs?: number` hat, ist keine weitere Anpassung noetig
  
  **State-Modell** (KRITISCH: Immutable Map Pattern + Refs fuer Stale Closures):
  ```typescript
  // State fuer Zeit-Daten (NICHT rankings - das bleibt unveraendert)
  const [lapTimes, setLapTimes] = useState<Map<string, number>>(new Map())
  
  // Refs fuer Keyboard-Handler (vermeidet stale closures)
  const lastClickedPilotIdRef = useRef<string | null>(null)
  const timeDigitBufferRef = useRef<string>('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  ```
  
  **WARUM Refs statt State fuer Keyboard-Handler**:
  - Der Keyboard-Handler (Zeile 154-181) hat stabile Dependencies (`[isOpen, assignDirectRank, resetRankings]`)
  - Er nutzt bereits `rankingsSizeRef` um Listener-Churn zu vermeiden (Zeile 41-45)
  - Neue Werte (`lastClickedPilotId`, `timeDigitBuffer`) muessen im GLEICHEN Pattern via Refs gelesen werden
  - State-Updates wuerden den Listener nicht neu registrieren → stale values
  
  **WARUM ReturnType<typeof setTimeout> statt NodeJS.Timeout**:
  - Vite/Browser-Umgebung hat NICHT `NodeJS.Timeout`
  - `ReturnType<typeof setTimeout>` ist plattformunabhaengig korrekt
  
  **Prefill-Logik Erweiterung** (Zeile 56-67):
  ```typescript
  // BESTEHEND: Rankings prefill
  useEffect(() => {
    if (isOpen && heat.results?.rankings) {
      const existingRankings = new Map<string, number>()
      const existingLapTimes = new Map<string, number>()  // NEU
      heat.results.rankings.forEach((r) => {
        existingRankings.set(r.pilotId, r.rank)
        if (r.lapTimeMs !== undefined) {  // NEU
          existingLapTimes.set(r.pilotId, r.lapTimeMs)
        }
      })
      setRankings(existingRankings)
      setLapTimes(existingLapTimes)  // NEU
    } else if (isOpen) {
      setRankings(new Map())
      setLapTimes(new Map())  // NEU
    }
  }, [isOpen, heat.id, heat.results])
  ```
  
  **Click-Handler Erweiterung** (toggleRank Funktion, Zeile 80-105):
  
  **STRUKTUR-REFACTORING fuer saubere Side-Effects**:
  Die bestehende `toggleRank` Funktion nutzt `setRankings(prev => {...})`.
  Um Side-Effects (Zeit-Fenster) sauber zu handhaben, MUSS die Logik umstrukturiert werden:
  
  ```typescript
  const toggleRank = useCallback((pilotId: string) => {
    // 1. Berechne neuen State OHNE ihn zu setzen
    const currentRank = rankings.get(pilotId)
    let willAssignRank = false
    
    if (currentRank !== undefined) {
      // REMOVE: Pilot hat Rang -> wird entfernt
      willAssignRank = false
    } else {
      // ASSIGN: Neuer Rang wird vergeben
      const nextRank = rankings.size + 1
      willAssignRank = nextRank <= heatPilots.length
    }
    
    // 2. State Update (bestehende Logik)
    setRankings((prev) => {
      // ... bestehende Logik bleibt UNVERAENDERT ...
    })
    
    // 3. Side-Effects NUR wenn Rang vergeben wurde
    if (willAssignRank) {
      // Clear vorherigen Timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      // Clear Buffer (vorherige unvollstaendige Eingabe verwerfen)
      timeDigitBufferRef.current = ''
      // Setze neuen Piloten fuer Zeit-Eingabe
      lastClickedPilotIdRef.current = pilotId
      // Starte 2s Timeout
      timeoutRef.current = setTimeout(() => {
        finalizeTimeEntry()
      }, 2000)
    }
    // Bei Rang-ENTFERNUNG: KEINE Aenderung an Zeit-Refs
  }, [rankings, heatPilots.length])
  ```
  
  **WARUM dieses Pattern**:
  - Side-Effects passieren AUSSERHALB von `setRankings` (kein Risiko von doppelten Aufrufen)
  - `willAssignRank` wird VOR dem setState berechnet (basierend auf aktuellem `rankings` State)
  - Die `rankings` Dependency ist OK hier, da wir den aktuellen Wert brauchen
  - Alternative waere useRef fuer rankings, aber das waere groesseres Refactoring
  
  **Keyboard-Handler Erweiterung** (Zeilen 154-181):
  - BESTEHENDE Logik (1-4 fuer Rang) bleibt UNVERAENDERT
  - NEU: Zusaetzliche Bedingung fuer Digit-Eingabe NUR fuer 0, 5-9:
    ```typescript
    // NACH der bestehenden 1-4 Logik (die bereits `return` hat nach assignDirectRank)
    // VOR dem Escape-Handler:
    
    // KEY-PRECEDENCE REGEL (KRITISCH):
    // - Tasten 1-4: IMMER Rank-Vergabe (bestehende Logik, hat bereits `return`)
    // - Tasten 0, 5-9: Zeit-Digit wenn Zeit-Fenster offen
    // - Taste 1-4 KANN NICHT als Zeit-Digit verwendet werden!
    //   (User muss "130" als "1" Minute "30" Sekunden eingeben, NICHT als Taste-1-3-0)
    //   ABER: Minute wird durch erste Ziffer 0-5 kodiert, Sekunden durch 2 Ziffern
    //   Beispiel: "45" = 45s, "130" = 1:30, "213" = 2:13
    //   Da 1-4 immer Rank vergibt, kann man NUR "0xx", "5xx" eingeben wenn kein Pilot fokussiert
    
    // LOESUNG: Zeit-Digits nur fuer 0 und 5-9 (nicht 1-4)
    const isTimeDigit = /^[0589]$/.test(e.key) || (e.key === '6') || (e.key === '7')
    // Vollstaendig: 0, 5, 6, 7, 8, 9 - NICHT 1, 2, 3, 4
    
    if (lastClickedPilotIdRef.current && isTimeDigit) {
      e.preventDefault()
      timeDigitBufferRef.current += e.key
      // Reset Timeout auf weitere 2s
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        finalizeTimeEntry()
      }, 2000)
      return  // WICHTIG: return nach Zeit-Digit Handling
    }
    ```
  
  **KEY-PRECEDENCE REGEL (KRITISCH)**:
  - Taste 1-4: IMMER Rank-Vergabe, NIEMALS Zeit-Digit
  - Taste 0, 5-9: Zeit-Digit wenn Zeit-Fenster offen
  - Die bestehende 1-4 Logik hat bereits `e.preventDefault()` und endet den Handler-Zweig
  - Zeit-Eingabe ist auf Zeiten beschraenkt die mit 0 oder 5-9 beginnen:
    - 2-Digit: "45" (45s), "59" (59s), "08" (8s - mit fuehrender Null)
    - 3-Digit: "059" (59s), "500" (5:00 = 300s - INVALID da >5min)
    - EINSCHRAENKUNG: Zeiten wie "123" (1:23) sind NICHT eingebbar per Keyboard
      (aber per Detail-Modal nachtraeglich editierbar)
  - Diese Einschraenkung ist akzeptabel da:
    1. Schnelle Eingabe fuer typische Zeiten (45s-59s) funktioniert
    2. Detail-Modal erlaubt alle Zeiten
    3. Alternative waere komplexe Mode-Switching-Logik
  
  **finalizeTimeEntry Helper-Funktion** (neu, nach den Callbacks):
  ```typescript
  const finalizeTimeEntry = useCallback(() => {
    const pilotId = lastClickedPilotIdRef.current
    const buffer = timeDigitBufferRef.current
    
    if (pilotId && buffer) {
      const parsedMs = parseLapTimeDigits(buffer)
      if (parsedMs !== null) {
        // IMMUTABLE Map Update (KRITISCH!)
        setLapTimes(prev => new Map(prev).set(pilotId, parsedMs))
      }
    }
    
    // Clear state
    lastClickedPilotIdRef.current = null
    timeDigitBufferRef.current = ''
    timeoutRef.current = null
  }, [])
  ```
  
  **TIMER-CLEANUP bei Modal Close/Unmount (KRITISCH)**:
  ```typescript
  // Cleanup-Effect fuer Timer bei Modal close oder unmount
  useEffect(() => {
    if (!isOpen) {
      // Modal wurde geschlossen -> cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      // ENTSCHEIDUNG: Pending digits werden VERWORFEN (nicht finalisiert)
      // Grund: User hat Modal geschlossen = will Eingabe abbrechen
      lastClickedPilotIdRef.current = null
      timeDigitBufferRef.current = ''
    }
    
    // Cleanup bei Component unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isOpen])
  ```
  
  **WARUM pending digits verworfen werden**:
  - Modal schliessen = User will Aktion abbrechen
  - Finalisieren bei Close waere unerwartet (User sieht es nicht)
  - Konsistent mit "Escape resets rankings" Verhalten
  
  **Submit-Handler Anpassung** (Zeile 146-148):
  ```typescript
  const rankingsArray = Array.from(rankings.entries())
    .map(([pilotId, rank]) => ({
      pilotId,
      rank: rank as 1 | 2 | 3 | 4,
      lapTimeMs: lapTimes.get(pilotId)  // undefined wenn nicht gesetzt
    }))
    .sort((a, b) => a.rank - b.rank)
  ```
  
  **KRITISCH: Auto-Complete im Store + LapTimes**:
  Der Store (`submitHeatResults`, Zeilen 582-608) ergaenzt automatisch unranked Piloten mit Bottom-Ranks.
  **Das ist OK fuer LapTimes**, weil:
  1. LapTimes werden nur fuer Piloten gesetzt, die der User AKTIV geklickt hat
  2. Der Store ergaenzt `{ pilotId, rank: 3|4 }` OHNE `lapTimeMs` (undefined)
  3. LapTimes gehen NICHT verloren - sie werden im Submit-Array mitgeschickt fuer gerankte Piloten
  
  **Szenario-Verifikation**:
  - User klickt nur Pilot A (Rang 1) und Pilot B (Rang 2) mit Zeiten
  - Submit: `[{A, rank:1, lapTimeMs:X}, {B, rank:2, lapTimeMs:Y}]`
  - Store ergaenzt: `[{A, rank:1, lapTimeMs:X}, {B, rank:2, lapTimeMs:Y}, {C, rank:3}, {D, rank:4}]`
  - Zeiten fuer A und B bleiben erhalten ✓

  **Must NOT do**:
  - Kein visuelles Eingabefeld fuer Zeit im Modal
  - Keine Zeit-Anzeige im Modal waehrend Eingabe
  - Keine Backspace-Behandlung
  - Keine Debounce-Library (einfaches setTimeout)
  - KEINE Aenderung an der bestehenden Rang-Logik (1-4 Tasten)

  **Parallelizable**: YES (mit Task 4)

  **References**:
  - `src/components/placement-entry-modal.tsx:13` - Prop-Signatur (erweitern fuer lapTimeMs)
  - `src/components/placement-entry-modal.tsx:34-36` - State-Deklaration (lapTimes Map hinzufuegen)
  - `src/components/placement-entry-modal.tsx:41-45` - Ref-Pattern fuer rankingsSize (gleiches Pattern fuer Zeit-Refs)
  - `src/components/placement-entry-modal.tsx:56-67` - Prefill-Effect (lapTimes auch prefill)
  - `src/components/placement-entry-modal.tsx:80-105` - toggleRank (Zeit-Fenster oeffnen)
  - `src/components/placement-entry-modal.tsx:146-152` - Submit-Handler (lapTimeMs hinzufuegen)
  - `src/components/placement-entry-modal.tsx:154-181` - Keyboard-Handler (Digit-Akkumulation)
  - `src/components/bracket/BracketTree.tsx:414` - Callsite fuer onSubmitResults (keine Aenderung noetig)
  - `src/stores/tournamentStore.ts:582-608` - Auto-Complete Logik (behaelt lapTimeMs)
  - `tests/placement-entry-modal.test.tsx:333-388` - Keyboard-Test Pattern

  **Test-Strategie**:
  - Nutze Vitest Fake Timers: `vi.useFakeTimers()` / `vi.advanceTimersByTime(2000)`
  
  **Acceptance Criteria**:
  - [x] Klick auf Pilot → Rang vergeben → innerhalb 2s "59" tippen → Zeit 0:59 gesetzt
  - [x] Klick auf Pilot → Rang vergeben → 3s warten → "59" tippen → KEINE Zeit (Fenster zu)
  - [x] Taste 1-4 vergibt Rang UND startet Zeit-Fenster (aber 1-4 sind NICHT als Zeit-Digits nutzbar)
  - [x] Taste 0, 5-9 werden als Zeit-Digits akzeptiert wenn Zeit-Fenster offen
  - [x] **KEY-PRECEDENCE TEST**: Pilot A fokussiert, Rang 1 vergeben, "5" tippen → "5" im Buffer, NICHT Rang 5
  - [x] Reopen Modal mit existierenden Zeiten → lapTimes sind prefilled
  - [x] **TIMER-CLEANUP TEST**: Rang vergeben → sofort Modal schliessen → kein React warning, pending Zeit verworfen
  - [x] `npm test -- placement-entry-modal` -> PASS

  **Commit**: YES
  - Message: `feat(placement): add digit accumulation for lap time entry`
  - Files: `src/components/placement-entry-modal.tsx`, `tests/placement-entry-modal.test.tsx`

---

- [x] 4. FilledBracketHeatBox: Zeit-Anzeige neben Rank-Badge

  **What to do**:
  - Oeffne `/src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx`
  - Importiere `formatLapTime` aus `../../../lib/ui-helpers`
  - Im Pilot-Row Bereich (Zeilen 116-136):
    - Nach Rank-Badge (Zeile 130-134): wenn `ranking?.lapTimeMs` existiert, zeige Zeit
    - Format: `formatLapTime(ranking.lapTimeMs)`
  
  **Styling-Entscheidung** (WICHTIG):
  Die Komponente nutzt CSS-Klassen (`pilot-row`, `rank-badge`, etc.) statt Tailwind-Utilities.
  **Loesung**: Nutze Tailwind-Utilities fuer die Zeit, da:
  - Die Zeit ist ein NEUES Element (keine bestehende Klasse)
  - Tailwind-Klassen funktionieren hier (cn() utility ist importiert)
  - Konsistent mit anderen Inline-Styles in der Komponente
  
  **Konkrete Implementierung** (nach Zeile 134, innerhalb des Pilot-Row div):
  ```tsx
  {/* Rank-Badge (bestehend) */}
  {rank && (
    <span className={cn('rank-badge', `r${rank}`)}>
      {rank}
    </span>
  )}
  {/* NEU: Zeit neben Rank-Badge */}
  {ranking?.lapTimeMs && (
    <span className="text-xs text-steel ml-1">
      {formatLapTime(ranking.lapTimeMs)}
    </span>
  )}
  ```

  **Must NOT do**:
  - Keine Icons neben Zeit
  - Keine Tooltips
  - Keine Click-Handler auf Zeit
  - Keine neue CSS-Klasse in separatem Stylesheet

  **Parallelizable**: YES (mit Task 3, 6)

  **References**:
  - `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx:111-137` - Pilot-Row Rendering
  - `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx:112` - ranking Variable (hat lapTimeMs nach Task 1)
  - `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx:130-134` - Rank-Badge (Zeit kommt danach)
  - `src/lib/ui-helpers.ts` - formatLapTime Funktion (Task 2)

  **Acceptance Criteria**:
  - [x] Import von formatLapTime hinzugefuegt
  - [x] Zeit wird neben Rank-Badge angezeigt wenn vorhanden
  - [x] Format ist M:SS (z.B. "1:23")
  - [x] Styling: `text-xs text-steel ml-1` (klein, dezent, Abstand zum Badge)
  - [x] Keine Zeit = nichts angezeigt (kein Platzhalter)
  - [x] Manueller Test: Heat mit Zeit -> Bracket-Ansicht zeigt Zeit

  **Commit**: YES
  - Message: `feat(bracket): display lap times next to rank badges`
  - Files: `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx`

---

- [x] 5. HeatDetailModal: Uhr-Icon mit Inline-Input (Add/Edit/Remove)

  **What to do**:
  - Oeffne `/src/components/heat-detail-modal.tsx`
  - Imports hinzufuegen:
    ```typescript
    import { useState, useRef } from 'react'
    import { Clock, X } from 'lucide-react'
    import { useTournamentStore } from '../stores/tournamentStore'
    import { formatLapTime, parseLapTimeDigits } from '../lib/ui-helpers'
    ```
  - Erweitere Component mit lokalem State:
    ```typescript
    const [editingTimeForPilot, setEditingTimeForPilot] = useState<string | null>(null)
    const [timeInputValue, setTimeInputValue] = useState<string>('')
    // Ref um Blur-vs-Delete Race Condition zu verhindern
    const isDeleteClickRef = useRef(false)
    ```
  - Store-Hook fuer submitHeatResults:
    ```typescript
    const submitHeatResults = useTournamentStore(state => state.submitHeatResults)
    ```
  
  **PERMISSION-REGEL (KRITISCH)**:
  Zeit-Editing ist NUR erlaubt wenn `canEdit === true`.
  Grund: Konsistent mit "Bearbeiten"-Button Logik (Zeile 109).
  ```tsx
  // Clock-Icon nur zeigen wenn canEdit UND heat completed UND ranking existiert
  {heat.status === 'completed' && canEdit && ranking && (
    // ... Clock/Input UI ...
  )}
  ```
  
  **Im Pilot-Row Bereich** (Zeilen 51-89):
  - Wenn Heat completed UND canEdit UND Pilot hat Ranking:
    - Zeige Clock-Icon Button (neben Ranking-Badge)
    - Wenn Zeit existiert: zeige auch aktuelle Zeit als Text
    - Bei Klick auf Clock: oeffne Inline-Input
  
  **BLUR-VS-DELETE RACE CONDITION LOESUNG (KRITISCH)**:
  Problem: Click auf X-Button triggert zuerst onBlur des Inputs -> handleSaveTime feuert vor handleDeleteTime.
  Loesung: onMouseDown auf X-Button setzt Flag, onBlur prueft Flag.
  
  **Inline-Input Implementierung**:
  ```tsx
  {heat.status === 'completed' && canEdit && ranking && (
    <>
      {editingTimeForPilot === pilot.id ? (
        <div className="flex items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            value={timeInputValue}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '')
              setTimeInputValue(val)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveTime(pilot.id)
              } else if (e.key === 'Escape') {
                setEditingTimeForPilot(null)
              }
            }}
            onBlur={() => {
              // KRITISCH: Pruefen ob Delete-Click gerade passiert
              if (!isDeleteClickRef.current) {
                handleSaveTime(pilot.id)
              }
              isDeleteClickRef.current = false
            }}
            className="w-12 px-1 text-center text-sm bg-void border border-steel rounded"
            autoFocus
          />
          {ranking?.lapTimeMs && (
            <button 
              onMouseDown={() => {
                // KRITISCH: Flag setzen BEVOR blur feuert
                isDeleteClickRef.current = true
              }}
              onClick={() => handleDeleteTime(pilot.id)}
            >
              <X className="w-4 h-4 text-steel hover:text-neon-pink" />
            </button>
          )}
        </div>
      ) : (
        <button onClick={() => handleOpenTimeEdit(pilot.id, ranking?.lapTimeMs)}>
          <Clock className="w-4 h-4 text-steel hover:text-neon-cyan" />
        </button>
      )}
      {/* Aktuelle Zeit anzeigen (wenn nicht editierend) */}
      {ranking?.lapTimeMs && editingTimeForPilot !== pilot.id && (
        <span className="text-xs text-steel ml-1">
          {formatLapTime(ranking.lapTimeMs)}
        </span>
      )}
    </>
  )}
  ```
  
  **Handler-Funktionen**:
  ```typescript
  // ms zu Digit-String konvertieren (fuer Pre-fill)
  const msToDigits = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    if (minutes === 0) {
      return String(seconds)
    }
    return `${minutes}${String(seconds).padStart(2, '0')}`
  }
  
  const handleOpenTimeEdit = (pilotId: string, currentMs?: number) => {
    setEditingTimeForPilot(pilotId)
    setTimeInputValue(currentMs ? msToDigits(currentMs) : '')
  }
  
  const handleSaveTime = (pilotId: string) => {
    if (!heat.results?.rankings) return
    
    const parsedMs = parseLapTimeDigits(timeInputValue)
    // Wenn ungueltig oder leer: schliesse einfach ohne Speichern
    if (timeInputValue && parsedMs === null) {
      setEditingTimeForPilot(null)
      return
    }
    
    const updatedRankings = heat.results.rankings.map(r =>
      r.pilotId === pilotId
        ? { ...r, lapTimeMs: parsedMs ?? undefined }
        : r
    )
    
    submitHeatResults(heat.id, updatedRankings)
    setEditingTimeForPilot(null)
  }
  
  const handleDeleteTime = (pilotId: string) => {
    if (!heat.results?.rankings) return
    
    const updatedRankings = heat.results.rankings.map(r =>
      r.pilotId === pilotId
        ? { ...r, lapTimeMs: undefined }
        : r
    )
    
    submitHeatResults(heat.id, updatedRankings)
    setEditingTimeForPilot(null)
  }
  ```
  
  **KRITISCH: submitHeatResults Nebenwirkungen**:
  `submitHeatResults` (Zeilen 519-714) macht VIEL mehr als nur Rankings speichern:
  - Setzt `completedAt` neu (Zeile 541)
  - Prozessiert Pilot-Pools (Winner/Loser/Eliminated)
  - Generiert neue Heats
  - Aktiviert naechsten Heat
  
  **WARUM das trotzdem sicher ist**:
  1. Wir submitten die GLEICHEN Rankings (nur lapTimeMs geaendert)
  2. Die Pool-Verarbeitung basiert auf `rank` Werten - die aendern wir NICHT
  3. `completedAt` wird ueberschrieben - das ist akzeptabel (zeigt letzte Bearbeitung)
  4. Heat-Generierung: Da Ranks gleich bleiben, werden KEINE neuen Heats generiert
  5. Die Auto-Complete-Logik (Zeile 582-608) aendert nichts, weil alle Piloten bereits gerankt sind
  
  **Manuelle Verifikation** (KRITISCH - Teil der Acceptance Criteria):
  - Nach Zeit-Edit: Pruefe dass `currentHeatIndex` unveraendert bleibt
  - Nach Zeit-Edit: Pruefe dass keine neuen Heats erschienen sind
  - Nach Zeit-Edit: Pruefe dass Pilot-Pools unveraendert sind

  **Must NOT do**:
  - Kein separates Modal fuer Zeit-Eingabe
  - Kein Time-Picker
  - Keine Validierungs-Fehlermeldungen im UI
  - Keine 4-Digit Eingabe (nur 2-3 Digits: SS oder MSS)
  - KEINE Aenderung der rank-Werte beim Submit

  **Parallelizable**: NO (haengt von Task 1+2 ab, aber unabhaengig von 3+4+6)

  **References**:
  - `src/components/heat-detail-modal.tsx:51-89` - Pilot-Row Bereich
  - `src/components/heat-detail-modal.tsx:78-86` - Ranking-Badge Position (Zeit daneben)
  - `src/stores/tournamentStore.ts:519-714` - submitHeatResults (VOLLSTAENDIGE Funktion lesen!)
  - `src/stores/tournamentStore.ts:536-543` - Heat completion (setzt completedAt neu)
  - `src/stores/tournamentStore.ts:582-608` - Auto-Complete (aendert nichts bei vollstaendigen Rankings)
  - `src/stores/tournamentStore.ts:610-638` - Pool-Verarbeitung (basiert auf rank, nicht lapTimeMs)
  - `src/lib/ui-helpers.ts` - parseLapTimeDigits und formatLapTime (Task 2)

  **Acceptance Criteria**:
  - [x] Clock-Icon sichtbar bei completed Heats mit Ranking UND canEdit=true
  - [x] Clock-Icon NICHT sichtbar wenn canEdit=false
  - [x] Klick oeffnet Inline-Input mit Pre-filled Digits
  - [x] Input zeigt aktuelle Zeit als Digits wenn vorhanden (z.B. "130" fuer 1:30)
  - [x] Enter speichert Zeit (via submitHeatResults)
  - [x] X-Button entfernt Zeit (setzt lapTimeMs: undefined)
  - [x] Blur (ausserhalb klicken) speichert/schliesst
  - [x] **BLUR-VS-DELETE TEST**: Klick auf X-Button loescht Zeit (Blur feuert NICHT vorher Save)
  - [x] **KRITISCH**: Nach Zeit-Edit bleibt currentHeatIndex unveraendert
  - [x] **KRITISCH**: Nach Zeit-Edit erscheinen keine neuen Heats
  - [x] Manueller Test: Heat oeffnen -> Clock klicken -> Zeit eingeben -> speichern -> reload -> Zeit noch da
  - [x] Manueller Test: Heat oeffnen -> Clock klicken -> "45" eingeben -> X klicken -> Zeit ist geloescht (nicht "45")

  **Commit**: YES
  - Message: `feat(detail-modal): add clock icon for lap time add/edit/remove`
  - Files: `src/components/heat-detail-modal.tsx`

---

- [x] 6. CSV-Export: Zeiten im Ergebnisse-Feld anzeigen

  **What to do**:
  - Oeffne `/src/lib/export-import.ts`
  - Importiere `formatLapTime` aus `./ui-helpers`
  - Erweitere die `formatHeatResults` Funktion (Zeilen 385-414)
  
  **Aktuelle Ausgabe** (Zeile 410):
  ```typescript
  return `${heatName}: ${place}`
  // Beispiel: "WB-R1-H1: 1."
  ```
  
  **Neue Ausgabe mit Zeit**:
  ```typescript
  // Wenn lapTimeMs vorhanden:
  const timeStr = ranking?.lapTimeMs ? ` (${formatLapTime(ranking.lapTimeMs)})` : ''
  return `${heatName}: ${place}${timeStr}`
  // Beispiel mit Zeit: "WB-R1-H1: 1. (0:45)"
  // Beispiel ohne Zeit: "WB-R1-H1: 1."
  ```
  
  **Konkrete Aenderung in formatHeatResults** (Zeilen 392-410):
  ```typescript
  const results = pilotHeats.map(heat => {
    const ranking = heat.results?.rankings.find(r => r.pilotId === pilot.id)
    const place = ranking ? `${ranking.rank}.` : '?'
    
    // NEU: Zeit-String wenn vorhanden
    const timeStr = ranking?.lapTimeMs 
      ? ` (${formatLapTime(ranking.lapTimeMs)})` 
      : ''
    
    // Format heat name (bestehender Code bleibt unveraendert)
    let heatName: string
    // ... (Zeilen 397-408 bleiben gleich)
    
    return `${heatName}: ${place}${timeStr}`  // NEU: timeStr angehaengt
  })
  ```

  **Must NOT do**:
  - Keine separate Spalte fuer Zeiten
  - Keine Aggregation/Summe der Zeiten
  - Keine Sortierung nach Zeit
  - Keine Aenderung am CSV-Header

  **Parallelizable**: YES (mit Task 3, 4)

  **References**:
  - `src/lib/export-import.ts:385-414` - formatHeatResults Funktion
  - `src/lib/export-import.ts:392-394` - Ranking-Lookup (hier lapTimeMs verfuegbar)
  - `src/lib/export-import.ts:410` - Return-Statement (hier Zeit anhaengen)
  - `src/lib/ui-helpers.ts` - formatLapTime (Task 2)

  **Acceptance Criteria**:
  - [x] Import von formatLapTime hinzugefuegt
  - [x] CSV zeigt Zeit in Klammern wenn vorhanden: `WB-R1-H1: 1. (0:45)`
  - [x] CSV zeigt keine Klammern wenn keine Zeit: `WB-R1-H1: 1.`
  - [x] Manueller Test: Tournament mit Zeiten exportieren -> CSV oeffnen -> Zeiten sichtbar
  - [x] TypeScript kompiliert: `npx tsc --noEmit`

  **Commit**: YES
  - Message: `feat(export): include lap times in CSV results column`
  - Files: `src/lib/export-import.ts`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(schema): add optional lapTimeMs to Ranking interface` | schemas.ts | `npx tsc --noEmit` |
| 2 | `feat(utils): add lap time formatting and parsing utilities` | ui-helpers.ts, lap-time-formatting.test.ts | `npm test -- lap-time-formatting` |
| 3 | `feat(placement): add digit accumulation for lap time entry` | placement-entry-modal.tsx, placement-entry-modal.test.tsx | `npm test -- placement-entry-modal` |
| 4 | `feat(bracket): display lap times next to rank badges` | FilledBracketHeatBox.tsx | Manual visual check |
| 5 | `feat(detail-modal): add clock icon for lap time add/edit/remove` | heat-detail-modal.tsx | Manual interaction test |
| 6 | `feat(export): include lap times in CSV results column` | export-import.ts | Manual CSV export check |

---

## Success Criteria

### Verification Commands
```bash
# TypeScript Check
npx tsc --noEmit  # Expected: No errors

# All Tests (via vitest - package.json script)
npm test  # Expected: All tests pass

# Specific Test Files (vitest pattern matching)
npm test -- lap-time-formatting  # Expected: 8+ tests pass
npm test -- placement-entry-modal  # Expected: All existing + 3 new tests pass
```

### Final Checklist
- [x] Schema erweitert (lapTimeMs in Ranking)
- [x] Utility-Funktionen implementiert und getestet
- [x] Zeit-Eingabe im Placement-Modal funktioniert
- [x] Zeit-Anzeige in Bracket-View funktioniert
- [x] Zeit Add/Edit/Remove im Detail-Modal funktioniert
- [x] CSV-Export enthaelt Zeiten im Ergebnisse-Feld
- [x] Alle Tests bestehen
- [x] Zeiten persistieren nach Reload
- [x] KEINE der "Must NOT Have" Punkte verletzt
