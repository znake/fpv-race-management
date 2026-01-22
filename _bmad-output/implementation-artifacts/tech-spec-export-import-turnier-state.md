---
title: 'Export/Import Turnier-State'
slug: 'export-import-turnier-state'
created: '2026-01-22'
status: 'implemented'
implemented: '2026-01-22'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['React 18', 'TypeScript', 'Zustand 4.5 mit persist Middleware', 'Tailwind CSS', 'Vitest + React Testing Library']
files_to_modify: ['src/lib/export-import.ts', 'src/components/app-footer.tsx', 'src/components/victory-ceremony.tsx', 'src/App.tsx', 'src/components/import-confirm-dialog.tsx', 'src/components/bracket/BracketTree.tsx']
code_patterns: ['Zustand persist middleware', 'Blob download pattern', 'File input pattern', 'Modal/Dialog pattern']
test_patterns: ['Vitest mit vi.mock', 'React Testing Library', 'Mock für URL.createObjectURL']
---

# Tech-Spec: Export/Import Turnier-State

**Created:** 2026-01-22

## Overview

### Problem Statement

Es gibt aktuell keinen Weg, ein laufendes Turnier zu pausieren und später fortzusetzen - weder auf demselben noch auf einem anderen Rechner. Außerdem fehlt die Möglichkeit, Turnierergebnisse für spätere Auswertungen zu archivieren.

### Solution

Zwei-Format-Ansatz:
1. **JSON Export/Import** für kompletten State Backup/Restore (Turnier pausieren & fortsetzen)
2. **CSV Export** für menschenlesbare Piloten-Übersicht (Archivierung & Auswertung)

### Scope

**In Scope:**
- JSON Export: Kompletter Turnier-State (Piloten, Heats, Brackets, Pools, Phase)
- JSON Import: State komplett überschreiben mit Confirm-Dialog
- CSV Export: Piloten-zentrierte Übersicht (Name, Status, Platzierung, Bracket, Heats Geflogen, Ergebnisse, Nächster Heat)
- UI: Sticky Footer mit dezenten Import/Export Buttons auf allen Seiten
- UI: Prominenter "Export CSV" Button bei Siegerehrung
- Dateiname-Konvention: `heats_YYYY-MM-DD_HH-MM.json` / `.csv`

**Out of Scope:**
- CSV Import für State (nur JSON)
- Turniername-Feld im System
- Intelligentes State-Merging (nur Überschreiben)
- Piloten-CSV-Import (existiert bereits separat in `csv-import.tsx`)

## Context for Development

### Codebase Patterns

1. **State Management Pattern:**
   - Zustand Store mit `persist` Middleware speichert nach `localStorage` unter Key `tournament-storage`
   - `INITIAL_TOURNAMENT_STATE` Konstante für Reset-Logik
   - State enthält: pilots, heats, pools, phase flags, bracket states

2. **File Download Pattern (aus csv-import.tsx):**
   ```typescript
   const blob = new Blob([content], { type: 'application/json' })
   const link = document.createElement('a')
   link.href = URL.createObjectURL(blob)
   link.download = 'filename.json'
   link.click()
   ```

3. **File Upload Pattern (aus csv-import.tsx):**
   - Hidden `<input type="file">` mit ref
   - `file.text()` für async Lesen
   - Processing mit Progress-Indicator

4. **Dialog Pattern (aus reset-confirmation-dialog.tsx, tournament-start-dialog.tsx):**
   - Modal-Komponente mit `isOpen`, `onClose`
   - Confirm/Cancel Buttons
   - Optional: Checkbox-Bestätigung für destruktive Aktionen

5. **Styling Conventions:**
   - Synthwave Theme: `neon-pink`, `neon-cyan`, `steel`, `void`, `night`
   - Beamer-optimiert: min 48px Höhe für Buttons
   - Tailwind Utility Classes mit `cn()` Helper

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/stores/tournamentStore.ts` | State-Struktur, `INITIAL_TOURNAMENT_STATE`, persist config |
| `src/components/csv-import.tsx` | File upload/download Pattern, Blob handling |
| `src/components/victory-ceremony.tsx` | Siegerehrung - Export CSV Button hier einfügen |
| `src/components/reset-confirmation-dialog.tsx` | Dialog Pattern für Import-Bestätigung |
| `src/App.tsx` | Hauptlayout - Footer hier einbinden |
| `src/lib/utils.ts` | `cn()` Helper, `generateId()` |
| `tests/csv-import.test.tsx` | Test Pattern für File-Handling |

### Technical Decisions

1. **JSON Export = localStorage Snapshot:**
   - Exportiere exakt den State aus `tournament-storage` localStorage Key
   - Import überschreibt diesen Key und triggert Page Reload
   - Kein Custom-Mapping nötig - Zustand persist Middleware handled alles

2. **CSV Export = Berechnete View:**
   - Neue Funktion `generateCSVExport(state)` in `src/lib/export-import.ts`
   - Iteriert über Piloten und berechnet: Status, Platzierung, geflogene Heats, Ergebnisse, nächster Heat
   - Manuelles CSV-Building (kein PapaParse.unparse nötig für einfache Struktur)

3. **Footer als eigene Komponente:**
   - Neues `src/components/app-footer.tsx`
   - Sticky am unteren Rand (`fixed bottom-0`)
   - Dezent gestylt (`text-steel`, kleiner Font)

4. **Import Confirmation:**
   - Eigener Dialog `import-confirm-dialog.tsx`
   - Zeigt Zusammenfassung des zu importierenden States (Pilot-Anzahl, Phase)
   - Warnung: "Aktueller Stand wird überschrieben"

## Implementation Plan

### Tasks

#### Story 1: Export/Import Utility Functions

- [x] **Task 1.1:** Create export-import utility file
  - File: `src/lib/export-import.ts` (NEW)
  - Action: Create new file with helper functions
  - Contents:
    - `generateTimestamp()`: Returns `YYYY-MM-DD_HH-MM` format string
    - `generateFilename(extension: 'json' | 'csv')`: Returns `heats_YYYY-MM-DD_HH-MM.{ext}`
    - `downloadFile(content: string, filename: string, mimeType: string)`: Blob download helper
    - `exportJSON()`: Get localStorage `tournament-storage`, trigger download
    - `parseImportedJSON(jsonString: string)`: Parse and validate structure
    - `importJSON(jsonString: string)`: Set localStorage, return success boolean

- [x] **Task 1.2:** Create CSV export function
  - File: `src/lib/export-import.ts`
  - Action: Add `generateCSVExport(state: TournamentStateData)` function
  - Logic:
    - Header row: `Pilot,Status,Platzierung,Bracket,Heats Geflogen,Ergebnisse,Nächster Heat`
    - For each pilot: calculate status (Aktiv/Ausgeschieden/Sieger/Noch nicht gestartet)
    - Calculate Platzierung from completed Grand Finale or `-`
    - Determine current Bracket (Winner/Loser/-)
    - Count completed heats per pilot
    - Build Ergebnisse string: `WB-R1-H1: 1. | LB-R1-H2: 2.` etc.
    - Find next pending heat containing pilot
  - Returns: CSV string ready for download

#### Story 2: Import Confirmation Dialog

- [x] **Task 2.1:** Create import confirmation dialog component
  - File: `src/components/import-confirm-dialog.tsx` (NEW)
  - Action: Create dialog based on `reset-confirmation-dialog.tsx` pattern
  - Props: `isOpen`, `onConfirm`, `onCancel`, `importData: { pilotCount, phase, heatCount }`
  - Content:
    - Title: "Turnier-Stand importieren?"
    - Summary: "{pilotCount} Piloten, {heatCount} Heats, Phase: {phase}"
    - Warning: "Der aktuelle Stand wird unwiderruflich überschrieben."
    - Buttons: "Abbrechen" (secondary), "Importieren" (primary/destructive)

#### Story 3: App Footer Component

- [x] **Task 3.1:** Create sticky footer component
  - File: `src/components/app-footer.tsx` (NEW)
  - Action: Create new component
  - Props: `onExportJSON`, `onExportCSV`, `onImportJSON`
  - Styling:
    - `fixed bottom-0 left-0 right-0` for sticky positioning
    - `bg-void/90 backdrop-blur-sm` for subtle background
    - `border-t border-steel/20` for separation
    - `py-2 px-4` for compact spacing
    - `text-xs text-steel` for dezent appearance
    - `z-40` to stay above content but below modals
  - Layout:
    - Right-aligned: `flex justify-end gap-4`
    - Buttons styled as subtle links: `hover:text-neon-cyan transition-colors`
  - Hidden file input for JSON import with `accept=".json"`

- [x] **Task 3.2:** Integrate footer into App
  - File: `src/App.tsx`
  - Action: 
    - Import `AppFooter` component
    - Add state for import dialog: `showImportDialog`, `pendingImportData`
    - Add footer before closing `</div>` of main container
    - Add padding-bottom to main content to prevent footer overlap: `pb-12`
    - Wire up handlers for export/import actions
  - Import flow:
    1. User clicks Import → file picker opens
    2. File selected → parse JSON, extract summary
    3. Show `ImportConfirmDialog` with summary
    4. User confirms → call `importJSON()`, trigger `window.location.reload()`

#### Story 4: Victory Ceremony Export Button

- [x] **Task 4.1:** Add prominent CSV export button to victory ceremony
  - File: `src/components/victory-ceremony.tsx`
  - Action: Add "Export CSV" button next to "Neues Turnier starten" button
  - Props: Add `onExportCSV: () => void` to `VictoryCeremonyProps`
  - Styling:
    - `bg-neon-cyan text-void` for prominence
    - Same size as "Neues Turnier" button
    - Icon: Download or document icon (optional)
  - Position: Left of "Neues Turnier starten" button in the flex container

- [x] **Task 4.2:** Wire up export handler in App.tsx
  - File: `src/App.tsx`
  - Action: 
    - Import `generateCSVExport`, `downloadFile`, `generateFilename` from export-import
    - Create handler function that gets current state and triggers CSV download
    - Pass handler to `VictoryCeremony` component via `BracketTree`

- [x] **Task 4.3:** Update BracketTree to pass export handler
  - File: `src/components/bracket-tree.tsx`
  - Action:
    - Add `onExportCSV?: () => void` prop
    - Pass through to `VictoryCeremony` component

### Acceptance Criteria

#### AC 1: JSON Export
- [x] **AC 1.1:** Given the app is open, when user clicks "Export JSON" in footer, then a file `heats_YYYY-MM-DD_HH-MM.json` is downloaded containing the complete tournament state.
- [x] **AC 1.2:** Given a tournament is in progress with heats completed, when user exports JSON, then all pilots, heats, results, and phase information are included in the export.

#### AC 2: JSON Import
- [x] **AC 2.1:** Given the app is open, when user clicks "Import" and selects a valid JSON file, then a confirmation dialog shows the import summary (pilot count, heat count, phase).
- [x] **AC 2.2:** Given the confirmation dialog is shown, when user clicks "Importieren", then localStorage is updated and page reloads with the imported state.
- [x] **AC 2.3:** Given the confirmation dialog is shown, when user clicks "Abbrechen", then the dialog closes and no changes are made.
- [x] **AC 2.4:** Given user selects an invalid JSON file (wrong structure), when parsing fails, then an error message is shown and no import occurs.

#### AC 3: CSV Export
- [x] **AC 3.1:** Given a tournament with pilots and heats, when user clicks "Export CSV" (footer or victory ceremony), then a file `heats_YYYY-MM-DD_HH-MM.csv` is downloaded.
- [x] **AC 3.2:** Given the CSV is exported, when opened in Excel/Sheets, then columns are: Pilot, Status, Platzierung, Bracket, Heats Geflogen, Ergebnisse, Nächster Heat.
- [x] **AC 3.3:** Given a pilot has flown multiple heats, when CSV is exported, then the Ergebnisse column shows all results formatted as `WB-R1-H1: 1. | LB-R1-H2: 2.`.
- [x] **AC 3.4:** Given a tournament is completed, when CSV is exported, then all pilots have their final Platzierung filled in.

#### AC 4: Footer UI
- [x] **AC 4.1:** Given the app is open on any tab (Piloten or Turnier), when viewing the page, then a sticky footer is visible at the bottom with Import/Export buttons.
- [x] **AC 4.2:** Given the footer is visible, when scrolling the page, then the footer remains fixed at the bottom.
- [x] **AC 4.3:** Given the footer is visible, then buttons are styled dezent (small, steel color) and don't distract from main content.

#### AC 5: Victory Ceremony Export
- [x] **AC 5.1:** Given the tournament is completed and victory ceremony is shown, when viewing the podium, then a prominent "Export CSV" button is visible next to "Neues Turnier starten".
- [x] **AC 5.2:** Given the "Export CSV" button is clicked in victory ceremony, when the file downloads, then it contains the complete tournament results.

## Additional Context

### Dependencies

- **Keine neuen Dependencies** nötig
- PapaParse bereits vorhanden (nicht benötigt für einfaches CSV-Building)
- Zustand persist bereits konfiguriert mit Key `tournament-storage`

### Testing Strategy

#### Unit Tests (`tests/export-import.test.ts`)
- [x] `generateTimestamp()` returns correct format
- [x] `generateFilename('json')` returns `heats_YYYY-MM-DD_HH-MM.json`
- [x] `generateFilename('csv')` returns `heats_YYYY-MM-DD_HH-MM.csv`
- [x] `exportJSON()` uses state snapshot and triggers download
- [x] `parseImportedJSON()` validates structure correctly
- [x] `parseImportedJSON()` rejects invalid JSON
- [x] `generateCSVExport()` produces correct header row
- [x] `generateCSVExport()` correctly formats heat results
- [x] `generateCSVExport()` uses top4 placement map when provided

#### Component Tests (`tests/app-footer.test.tsx`)
- [x] Footer renders with Import/Export buttons
- [x] Export JSON button triggers `onExportJSON` callback
- [x] Export CSV button triggers `onExportCSV` callback
- [x] File selection triggers `onImportJSON` with file content

#### Component Tests (`tests/import-confirm-dialog.test.tsx`)
- [ ] Dialog renders with import summary (not yet implemented)
- [ ] "Importieren" button triggers `onConfirm` (not yet implemented)
- [ ] "Abbrechen" button triggers `onCancel` (not yet implemented)

#### Integration Tests (Manual)
- [ ] Export JSON → Import on fresh browser → State restored correctly
- [ ] Export CSV → Open in Excel → All columns readable
- [ ] Footer visible on all pages
- [ ] Victory ceremony export works

### Notes

- **CSV-Format ist "read-only"** - nur zum Auswerten, nicht zum Wiederherstellen
- **JSON-Import triggert Page Reload** - einfachste Methode um Zustand zu synchronisieren
- **Footer z-index: 40** - unter Modals (z-50) aber über Content
- **Padding-bottom auf main** - verhindert dass Footer Content überdeckt
- **Error Handling bei Import** - ungültiges JSON zeigt Alert, kein Crash

### CSV Format Example

```csv
Pilot,Status,Platzierung,Bracket,Heats Geflogen,Ergebnisse,Nächster Heat
Max Mustermann,Aktiv,-,Winner,2,"WB-R1-H1: 1. | WB-R2-H1: 1.",WB-Finale
Lisa Schmidt,Aktiv,-,Loser,2,"WB-R1-H1: 2. | LB-R1-H1: 1.",LB-R2-H1
Tom Berger,Ausgeschieden,7,Loser,2,"WB-R1-H1: 3. | LB-R1-H1: 3.",-
Anna Klein,Noch nicht gestartet,-,-,0,"-",WB-R1-H3
```

