# Source Tree Analyse

**Generiert:** 2026-01-22
**Projekt:** FPV Racing Heats Manager
**Scan-Level:** Exhaustive

---

## Verzeichnisstruktur

```
heats/
├── src/                          # Hauptquellcode
│   ├── components/               # React-Komponenten
│   │   ├── bracket/              # Tournament-Bracket-Visualisierung
│   │   │   ├── BracketTree.tsx           # Haupt-Bracket-Komponente
│   │   │   ├── SVGConnectorLines.tsx     # SVG-Verbindungslinien
│   │   │   ├── ZoomIndicator.tsx         # Zoom-Controls
│   │   │   ├── PoolDisplay.tsx           # Pool-Anzeige (WB/LB)
│   │   │   ├── heat-boxes/               # Heat-Box-Komponenten
│   │   │   │   ├── BracketHeatBox.tsx        # Basis Heat-Box
│   │   │   │   ├── FilledBracketHeatBox.tsx  # Gefüllter Heat
│   │   │   │   └── EmptyBracketHeatBox.tsx   # Leerer Placeholder
│   │   │   ├── sections/                 # Bracket-Sektionen
│   │   │   │   ├── QualiSection.tsx          # Qualifikations-Heats
│   │   │   │   ├── WinnerBracketSection.tsx  # Winner Bracket
│   │   │   │   ├── LoserBracketSection.tsx   # Loser Bracket
│   │   │   │   ├── GrandFinaleSection.tsx    # Grand Finale
│   │   │   │   ├── GrandFinaleHeatBox.tsx    # Grand Finale Heat-Box
│   │   │   │   └── RematchSection.tsx        # Rematch-Heats
│   │   │   └── index.ts                  # Barrel exports
│   │   ├── ui/                   # Wiederverwendbare UI-Komponenten (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── heat-card.tsx            # Heat-Visualisierung
│   │   │   ├── pilot-avatar.tsx         # Piloten-Avatar
│   │   │   └── rank-badge.tsx           # Platzierungs-Badge
│   │   ├── pilot-card.tsx        # Piloten-Karte
│   │   ├── add-pilot-form.tsx    # Piloten-Formular
│   │   ├── csv-import.tsx        # CSV-Import-Dialog
│   │   ├── header.tsx            # App-Header
│   │   ├── app-footer.tsx        # App-Footer (Export/Import Buttons)
│   │   ├── heat-assignment-view.tsx  # Heat-Zuweisung mit Drag & Drop
│   │   ├── heat-detail-modal.tsx     # Heat-Detail-Modal
│   │   ├── heat-overview.tsx         # Heat-Übersicht
│   │   ├── on-deck-preview.tsx       # Nächster Heat Vorschau
│   │   ├── placement-entry-modal.tsx # Inline-Platzierungseingabe
│   │   ├── victory-ceremony.tsx      # Siegerehrung mit CSV-Export
│   │   ├── tournament-start-dialog.tsx
│   │   ├── reset-confirmation-dialog.tsx
│   │   ├── import-confirm-dialog.tsx # JSON-Import Bestätigung
│   │   ├── PhaseIndicator.tsx        # Turnier-Phase-Anzeige
│   │   └── bracket-tree.tsx          # Legacy Bracket (re-export)
│   │
│   ├── stores/                   # Zustand State Management
│   │   └── tournamentStore.ts    # Haupt-Store (~1800 Zeilen)
│   │
│   ├── lib/                      # Utility-Funktionen & Business-Logik
│   │   ├── bracket-logic.ts      # Double-Elimination Logik
│   │   ├── bracket-constants.ts  # Bracket-Konstanten
│   │   ├── bracket-layout-calculator.ts  # Layout-Berechnung
│   │   ├── heat-completion.ts    # Heat-Completion Helper
│   │   ├── heat-distribution.ts  # Heat-Aufteilung (3er/4er)
│   │   ├── export-import.ts      # JSON/CSV Export & Import
│   │   ├── csv-parser.ts         # CSV-Parsing
│   │   ├── svg-connector-manager.ts  # SVG-Linien Management
│   │   ├── ui-helpers.ts         # UI-Hilfsfunktionen
│   │   ├── schemas.ts            # Zod Validierungsschemas
│   │   └── utils.ts              # Allgemeine Utilities
│   │
│   ├── hooks/                    # Custom React Hooks
│   │   ├── usePilots.ts          # Piloten-Management
│   │   └── useZoomPan.ts         # Zoom & Pan
│   │
│   ├── types/                    # TypeScript-Typdefinitionen
│   │   ├── index.ts              # Barrel exports
│   │   ├── tournament.ts         # Tournament/Heat Types
│   │   └── csv.ts                # CSV-Import Types
│   │
│   ├── test/                     # Test-Setup
│   │   └── setup.ts              # Vitest Setup
│   │
│   ├── App.tsx                   # Haupt-App-Komponente
│   ├── main.tsx                  # Entry Point
│   └── index.css                 # Globale Styles + Synthwave Theme
│
├── tests/                        # Test-Dateien (16 Tests)
│   ├── helpers/                  # Test-Utilities
│   │   ├── mock-factories.ts     # Mock-Daten-Factories
│   │   ├── store-helpers.ts      # Store-Test-Helpers
│   │   └── index.ts
│   ├── pilot-card.test.tsx
│   ├── csv-import.test.tsx
│   ├── tournament-start.test.tsx
│   ├── heat-assignment.test.ts
│   ├── heat-results.test.tsx
│   ├── heat-completion.test.ts
│   ├── loser-pool.test.ts
│   ├── lb-heat-generation.test.ts
│   ├── lb-synchronization-32-pilots.test.ts  # LB Sync für 32 Piloten
│   ├── grand-finale-4-piloten.test.ts
│   ├── rematch-logic.test.ts
│   ├── round-progression.test.ts
│   ├── eight-pilots-flow.test.ts
│   ├── reset-functions.test.ts
│   ├── placement-entry-modal.test.tsx
│   └── finale-ceremony.test.tsx
│
├── docs/                         # Dokumentation
│   ├── README.md                 # Haupt-Dokumentation
│   ├── prd.md                    # Product Requirements Document
│   ├── architecture.md           # Architektur-Übersicht
│   ├── architecture-deep-dive.md # Technische Architektur-Details
│   ├── getting-started.md        # Schnellstart-Anleitung
│   ├── tech-stack.md             # Technologie-Stack
│   ├── store-api.md              # Store API Referenz
│   ├── source-tree.md            # Diese Datei
│   ├── index.md                  # Docs-Index
│   └── images/                   # Screenshots
│
├── public/                       # Statische Assets
│
├── _bmad/                        # BMAD Workflow-Dateien
│
├── _bmad-output/                 # BMAD Output-Artefakte
│   ├── planning-artifacts/       # Analyse & Design
│   │   ├── project-context.md
│   │   ├── epics.md
│   │   ├── analysis/
│   │   └── design/
│   └── implementation-artifacts/ # Implementierung
│       ├── user-stories/
│       ├── validation-reports/
│       └── change-proposals/
│
└── Konfiguration
    ├── package.json              # Dependencies & Scripts
    ├── vite.config.ts            # Vite + Vitest Config
    ├── tailwind.config.js        # Tailwind + Synthwave Theme
    ├── tsconfig.json             # TypeScript Config
    └── components.json           # shadcn/ui Config
```

---

## Schlüsseldateien nach Funktion

### State Management
| Datei | Beschreibung | LOC |
|-------|--------------|-----|
| `src/stores/tournamentStore.ts` | Zentraler Zustand Store mit localStorage-Persistenz | ~1800 |

### Business-Logik
| Datei | Beschreibung |
|-------|--------------|
| `src/lib/bracket-logic.ts` | Pool-basierte WB/LB Heat-Generierung |
| `src/lib/heat-completion.ts` | Heat-Abschluss-Logik |
| `src/lib/heat-distribution.ts` | 3er/4er Heat-Aufteilung |
| `src/lib/export-import.ts` | JSON/CSV Export & Import |
| `src/lib/csv-parser.ts` | CSV-Parsing mit PapaParse |
| `src/lib/schemas.ts` | Zod Validierung für Piloten & CSV |

### UI-Komponenten (Hauptkomponenten)
| Datei | Beschreibung |
|-------|--------------|
| `src/App.tsx` | Haupt-App mit Tab-Navigation |
| `src/components/bracket/BracketTree.tsx` | Double-Elimination Bracket-Visualisierung |
| `src/components/placement-entry-modal.tsx` | Inline-Platzierungseingabe im Bracket |
| `src/components/victory-ceremony.tsx` | Top-4 Siegerehrung mit CSV-Export |
| `src/components/heat-assignment-view.tsx` | Drag & Drop Heat-Zuweisung |
| `src/components/app-footer.tsx` | Export/Import Aktionen |

### Types
| Datei | Beschreibung |
|-------|--------------|
| `src/types/tournament.ts` | Heat, TournamentPhase, PilotBracketState |
| `src/types/csv.ts` | CSV-Import Types |
| `src/lib/schemas.ts` | Pilot, Ranking, HeatResults |

---

## Abhängigkeitsbaum (Vereinfacht)

```
App.tsx
├── Header
├── AppFooter (Export/Import)
├── PilotCard[] (Piloten-Tab)
├── AddPilotForm
├── CSVImport (Modal)
├── TournamentStartDialog (Modal)
├── ResetConfirmationDialog (Modal)
├── ImportConfirmDialog (Modal)
├── HeatAssignmentView (Heat-Zuweisung Phase)
│   └── Drag & Drop Piloten-Zuweisung
└── BracketTree (Turnier-Tab)
    ├── QualiSection
    ├── WinnerBracketSection
    ├── LoserBracketSection
    ├── GrandFinaleSection
    │   └── GrandFinaleHeatBox
    ├── RematchSection
    ├── SVGConnectorLines
    ├── ZoomIndicator
    ├── PoolDisplay
    ├── PlacementEntryModal (Inline-Ergebniseingabe)
    ├── HeatDetailModal
    └── VictoryCeremony (mit CSV-Export)
```

---

## Datenfluss

```
User Input → usePilots Hook → tournamentStore → localStorage
                                    ↓
                              heats[] (Single Source of Truth)
                                    ↓
                              BracketTree → Sections → HeatCard
                                    ↓
                              PlacementEntryModal → submitHeatResults()
                                    ↓
                              Pool-Update (winnerPilots/loserPool)
                                    ↓
                              Dynamische Heat-Generierung
```

**Schlüsselprinzipien:**
- `heats[]` Array ist die einzige Datenquelle für Tournament-State
- Keine separate Bracket-Struktur - alles wird dynamisch aus `heats[]` berechnet
- Pool-basierte Heat-Generierung: WB/LB-Heats werden on-demand erstellt

### Export/Import Flow

```
Tournament State → exportJSON()/exportCSV() → JSON/CSV-Datei
                                                    ↓
JSON-Datei → parseImportedJSON() → ImportConfirmDialog → importJSON()
                                                              ↓
                                                    localStorage (Page Reload)
```
