# Story 7.1: Reset-Funktionen

Status: done

## Story

**Als ein** Organisator (Thomas),  
**möchte ich** das Turnier zurücksetzen oder alle Daten löschen können,  
**so dass** ich ein neues Turnier starten oder die App komplett neu beginnen kann.

## Acceptance Criteria

### AC 1: Turnier zurücksetzen (Heats löschen, Piloten behalten)

**Given** ein Turnier läuft oder ist abgeschlossen (tournamentPhase !== 'setup')  
**When** ich auf "Turnier zurücksetzen" klicke  
**Then** erscheint ein Bestätigungs-Dialog: "Alle Ergebnisse löschen? Piloten bleiben erhalten."  

**Given** ich bestätige den Dialog  
**Then** werden alle Heats gelöscht (`heats: []`)  
**And** `tournamentPhase` wird auf 'setup' gesetzt  
**And** `tournamentStarted` wird auf `false` gesetzt  
**And** `currentHeatIndex` wird auf `0` gesetzt  
**And** alle Piloten bleiben erhalten  
**And** ich kann ein neues Turnier starten

### AC 2: Alle Piloten löschen

**Given** ich bin im Piloten-Tab  
**And** es existieren Piloten  
**When** ich auf "Alle Piloten löschen" klicke  
**Then** erscheint ein Bestätigungs-Dialog: "Alle Piloten löschen?"  

**Given** ich bestätige den Dialog  
**Then** werden alle Piloten gelöscht (`pilots: []`)  
**And** falls ein Turnier existiert, wird es ebenfalls zurückgesetzt (wie AC 1)  
**And** die Piloten-Liste ist leer  
**And** ich kann neue Piloten hinzufügen oder importieren

### AC 3: Alles löschen (kompletter Reset)

**Given** ich möchte die App komplett zurücksetzen  
**When** ich auf "Alles löschen" klicke (versteckt im Menü/Settings)  
**Then** erscheint ein Bestätigungs-Dialog mit doppelter Bestätigung  
**And** ich muss "LÖSCHEN" eingeben um zu bestätigen  

**Given** ich gebe "LÖSCHEN" ein und bestätige  
**Then** wird der komplette localStorage gelöscht  
**And** `pilots: []`, `heats: []`, alle States auf Initial  
**And** die App ist im Ausgangszustand

### AC 4: Button-Platzierung gemäß UX-Spec

**Given** die App ist geladen  
**Then** ist "Turnier zurücksetzen" im Piloten-Tab unten sichtbar (klein, destructive-style)  
**And** "Alle Piloten löschen" ist im Piloten-Tab sichtbar (wenn Piloten existieren)  
**And** "Alles löschen" ist versteckt (z.B. im Header-Menü oder Settings-Bereich)

### AC 5: Buttons nur wenn relevant

**Given** kein Turnier gestartet (tournamentPhase === 'setup')  
**Then** ist "Turnier zurücksetzen" Button ausgeblendet oder disabled  

**Given** keine Piloten vorhanden (pilots.length === 0)  
**Then** ist "Alle Piloten löschen" Button ausgeblendet

## Tasks / Subtasks

- [x] Task 1: Store-Erweiterungen (AC: 1, 2, 3)
  - [x] `resetTournament()` Action: Heats löschen, Phase/Started zurücksetzen, Piloten behalten
  - [x] `deleteAllPilots()` Action: Alle Piloten löschen + Turnier zurücksetzen
  - [x] `resetAll()` Action: Kompletter State-Reset auf Initial-Values

- [x] Task 2: Turnier zurücksetzen UI (AC: 1, 4, 5)
  - [x] Button im Piloten-Tab Footer (destructive-style: Night-BG, Rot-Border)
  - [x] Nur sichtbar wenn `tournamentPhase !== 'setup'`
  - [x] Confirmation-Dialog mit Warnung

- [x] Task 3: Alle Piloten löschen UI (AC: 2, 4, 5)
  - [x] Button im Piloten-Tab (neben oder unter Piloten-Liste)
  - [x] Nur sichtbar wenn `pilots.length > 0`
  - [x] Confirmation-Dialog

- [x] Task 4: Alles löschen UI (AC: 3, 4)
  - [x] Button versteckt im Header-Menü (Drei-Punkte-Menü oder Settings-Icon)
  - [x] Doppelte Bestätigung: Modal + "LÖSCHEN" eingeben
  - [x] Höchste Warnstufe im UI

- [x] Task 5: Tests
  - [x] Unit-Test: `resetTournament()` löscht Heats, behält Piloten
  - [x] Unit-Test: `deleteAllPilots()` löscht Piloten und Turnier
  - [x] Unit-Test: `resetAll()` setzt alles auf Initial zurück
  - [x] Integration-Test: Buttons erscheinen/verschwinden je nach State

## Dev Notes

### Store-Erweiterungen

```typescript
interface TournamentState {
  // Bestehende Actions...
  
  // NEU für US-7.1
  resetTournament: () => void
  deleteAllPilots: () => void
  resetAll: () => void
}

// Implementation
resetTournament: () => {
  set({
    heats: [],
    tournamentPhase: 'setup',
    tournamentStarted: false,
    currentHeatIndex: 0,
    // pilots bleiben unverändert!
  })
}

deleteAllPilots: () => {
  set({
    pilots: [],
    heats: [],
    tournamentPhase: 'setup',
    tournamentStarted: false,
    currentHeatIndex: 0,
  })
}

resetAll: () => {
  // Kompletter Reset auf Initial State
  set(initialState)
  // Optional: localStorage.clear() für kompletten Browser-Reset
}
```

### UI-Layout Konzept

```
┌─────────────────────────────────────────────────────────────┐
│  PILOTEN                                    [⋮ Menü]        │
│                                              └─ Alles löschen
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ 🖼 Anna │  │ 🖼 Ben  │  │ 🖼 Chris│  │ 🖼 Dana │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│  ... mehr Piloten ...                                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Alle Piloten löschen]          [Turnier zurücksetzen]    │
│  (nur wenn Piloten)              (nur wenn Turnier läuft)   │
└─────────────────────────────────────────────────────────────┘
```

### Synthwave Button-Styles (Destructive)

```tsx
// Destructive Button: Turnier zurücksetzen / Alle löschen
<button className="bg-night border-2 border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-500/10 transition-colors">
  Turnier zurücksetzen
</button>

// Höchste Warnstufe: Alles löschen (im Menü)
<button className="bg-red-900/50 border border-red-500 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20">
  Alles löschen
</button>
```

### Confirmation Dialog Patterns

```tsx
// Standard Confirmation (Turnier zurücksetzen, Alle Piloten löschen)
<Dialog>
  <DialogTitle>Turnier zurücksetzen?</DialogTitle>
  <DialogDescription>
    Alle Ergebnisse werden gelöscht. Piloten bleiben erhalten.
  </DialogDescription>
  <DialogFooter>
    <Button variant="ghost">Abbrechen</Button>
    <Button variant="destructive">Zurücksetzen</Button>
  </DialogFooter>
</Dialog>

// Doppelte Bestätigung (Alles löschen)
<Dialog>
  <DialogTitle>Alles löschen?</DialogTitle>
  <DialogDescription>
    Alle Piloten und Turnierdaten werden unwiderruflich gelöscht.
    Gib "LÖSCHEN" ein um zu bestätigen.
  </DialogDescription>
  <Input placeholder="LÖSCHEN" onChange={...} />
  <DialogFooter>
    <Button variant="ghost">Abbrechen</Button>
    <Button variant="destructive" disabled={input !== 'LÖSCHEN'}>
      Endgültig löschen
    </Button>
  </DialogFooter>
</Dialog>
```

### Edge Cases

| Case | Handling |
|------|----------|
| Reset während Heat läuft | Erlaubt - User hat bestätigt |
| Reset im Finale | Erlaubt - alles wird gelöscht |
| Piloten löschen während Turnier | Turnier wird automatisch mit zurückgesetzt |
| Alles löschen bei leerem State | Button disabled oder versteckt |
| Browser-Refresh nach Reset | App startet im Setup-Modus (localStorage aktualisiert) |

### References

- [Source: docs/ux-design-specification.md#Confirmation-Patterns] - Destructive Button Styles
- [Source: docs/ux-design-specification.md#Turnier-Management] - Reset-Platzierung
- [Source: docs/prd.md#FR32-35] - localStorage Persistenz
- [Source: docs/architecture.md#stores] - Zustand Store Pattern

## Definition of Done

### Funktional
- [x] `resetTournament()` löscht Heats, setzt Phase zurück, behält Piloten
- [x] `deleteAllPilots()` löscht alle Piloten und setzt Turnier zurück
- [x] `resetAll()` setzt kompletten State auf Initial zurück
- [x] Confirmation-Dialoge für alle destruktiven Aktionen
- [x] Doppelte Bestätigung für "Alles löschen"

### UI/Design
- [x] "Turnier zurücksetzen" Button: Destructive-Style, Piloten-Tab Footer
- [x] "Alle Piloten löschen" Button: Destructive-Style, nur wenn Piloten existieren
- [x] "Alles löschen" Button: Versteckt im Menü, höchste Warnstufe
- [x] Buttons erscheinen/verschwinden basierend auf State

### Tests
- [x] Unit-Test: `resetTournament()` Funktionalität
- [x] Unit-Test: `deleteAllPilots()` Funktionalität  
- [x] Unit-Test: `resetAll()` Funktionalität
- [x] Integration-Test: Button-Visibility basierend auf State

### Qualität
- [x] Keine TypeScript-Fehler
- [x] Keine Console-Errors
- [x] localStorage wird korrekt aktualisiert nach Reset
- [x] Visueller Test: Buttons sind klar als "gefährlich" erkennbar

## Dev Agent Record

### Context Reference
- Story 7-1 basiert auf UX-Design-Spezifikation (Zeilen 1084-1087)
- Feature war spezifiziert aber keine Story erstellt
- Epic 7: Offline & Persistenz (FR32-35)

### Agent Model Used
Claude (Anthropic)

### Completion Notes List
- Implementierte drei Store-Actions: `resetTournament()`, `deleteAllPilots()`, `resetAll()`
- `resetAll()` löscht zusätzlich den localStorage für kompletten Neustart
- Wiederverwendbare `ResetConfirmationDialog` Komponente mit optionaler Tipp-Bestätigung
- Header erweitert mit Drei-Punkte-Menü für verstecktes "Alles löschen"
- Piloten-Tab Footer zeigt Reset-Buttons kontextabhängig
- 12 Unit-Tests für alle Store-Actions inkl. Edge Cases
- Alle 146 Tests grün, Build erfolgreich
- Synthwave-Design konsistent (destructive-style: red border, red text on night bg)

### File List
- src/stores/tournamentStore.ts (Store-Erweiterungen: deleteAllPilots, resetAll)
- src/components/reset-confirmation-dialog.tsx (NEU - wiederverwendbarer Dialog)
- src/components/header.tsx (erweitert - Dropdown-Menü mit "Alles löschen")
- src/App.tsx (erweitert - Reset-Buttons im Piloten-Tab Footer, Dialog-States)
- tests/reset-functions.test.ts (NEU - 12 Unit-Tests)
