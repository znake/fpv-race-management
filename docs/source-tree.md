# Source Tree Analyse

**Generiert:** 2026-01-19
**Projekt:** FPV Racing Heats Manager
**Scan-Level:** Exhaustive

---

## Verzeichnisstruktur

```
heats/
├── src/                          # Hauptquellcode
│   ├── components/               # React-Komponenten
│   │   ├── bracket/              # Tournament-Bracket-Visualisierung
│   │   │   ├── BracketTree.tsx           # Haupt-Bracket-Komponente (US-14)
│   │   │   ├── SVGConnectorLines.tsx     # SVG-Verbindungslinien (US-14.6)
│   │   │   ├── ZoomIndicator.tsx         # Zoom-Controls (US-14.8)
│   │   │   ├── BracketLegend.tsx         # Legende (Story 11-7)
│   │   │   ├── sections/                 # Bracket-Sektionen
│   │   │   │   ├── QualiSection.tsx      # Qualifikations-Heats
│   │   │   │   ├── WinnerBracketSection.tsx  # Winner Bracket
│   │   │   │   ├── LoserBracketSection.tsx   # Loser Bracket
│   │   │   │   └── GrandFinaleSection.tsx    # Grand Finale (US-14.7)
│   │   │   ├── types.ts                  # Bracket-spezifische Types
│   │   │   └── index.ts                  # Barrel exports
│   │   ├── ui/                   # Wiederverwendbare UI-Komponenten (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── heat-card.tsx            # Heat-Visualisierung
│   │   │   └── ...
│   │   ├── pilot-card.tsx        # Piloten-Karte
│   │   ├── add-pilot-form.tsx    # Piloten-Formular
│   │   ├── csv-import.tsx        # CSV-Import-Dialog
│   │   ├── header.tsx            # App-Header
│   │   ├── heat-assignment-view.tsx  # Heat-Zuweisung (Story 3.3)
│   │   ├── active-heat-view.tsx  # Aktiver Heat mit Ergebniseingabe
│   │   ├── heat-detail-modal.tsx # Heat-Detail-Modal
│   │   ├── victory-ceremony.tsx  # Siegerehrung (Story 5.1)
│   │   ├── tournament-start-dialog.tsx
│   │   └── reset-confirmation-dialog.tsx
│   │
│   ├── stores/                   # Zustand State Management
│   │   └── tournamentStore.ts    # Haupt-Store (~1600 Zeilen)
│   │
│   ├── lib/                      # Utility-Funktionen & Business-Logik
│   │   ├── bracket-logic.ts      # Double-Elimination Logik
│   │   ├── heat-completion.ts    # Heat-Completion Helper
│   │   ├── heat-distribution.ts  # Heat-Aufteilung (3er/4er)
│   │   ├── bracket-layout-calculator.ts  # Layout-Berechnung (US-14.10)
│   │   ├── schemas.ts            # Zod Validierungsschemas
│   │   └── utils.ts              # Allgemeine Utilities
│   │
│   ├── hooks/                    # Custom React Hooks
│   │   ├── usePilots.ts          # Piloten-Management
│   │   └── useZoomPan.ts         # Zoom & Pan (US-14.8)
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
├── tests/                        # Test-Dateien
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
│   ├── grand-finale-4-piloten.test.ts
│   ├── rematch-logic.test.ts
│   ├── round-progression.test.ts
│   ├── eight-pilots-flow.test.ts
│   ├── reset-functions.test.ts
│   └── finale-ceremony.test.tsx
│
├── docs/                         # Dokumentation
│   ├── prd.md                    # Product Requirements Document
│   ├── architecture.md           # Architektur-Entscheidungen
│   ├── README.md                 # Docs-Index
│   └── sample-data/              # Test-Daten
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
│       ├── completion-reports/
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
| `src/stores/tournamentStore.ts` | Zentraler Zustand Store mit localStorage-Persistenz | ~1600 |

### Business-Logik
| Datei | Beschreibung |
|-------|--------------|
| `src/lib/bracket-logic.ts` | Pool-basierte WB/LB Heat-Generierung |
| `src/lib/heat-completion.ts` | Heat-Abschluss-Logik |
| `src/lib/heat-distribution.ts` | 3er/4er Heat-Aufteilung |
| `src/lib/schemas.ts` | Zod Validierung für Piloten & CSV |

### UI-Komponenten (Hauptkomponenten)
| Datei | Beschreibung |
|-------|--------------|
| `src/App.tsx` | Haupt-App mit Tab-Navigation |
| `src/components/bracket/BracketTree.tsx` | Double-Elimination Bracket-Visualisierung |
| `src/components/active-heat-view.tsx` | Ergebniseingabe für aktiven Heat |
| `src/components/victory-ceremony.tsx` | Top-4 Siegerehrung |

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
├── PilotCard[] (Piloten-Tab)
├── AddPilotForm
├── CSVImport (Modal)
├── TournamentStartDialog (Modal)
├── HeatAssignmentView (Heat-Zuweisung Phase)
└── BracketTree (Turnier-Tab)
    ├── QualiSection
    ├── WinnerBracketSection
    ├── LoserBracketSection
    ├── GrandFinaleSection
    ├── SVGConnectorLines
    ├── BracketLegend
    ├── ZoomIndicator
    ├── ActiveHeatView
    ├── HeatDetailModal
    └── VictoryCeremony
```

---

## Datenfluss

```
User Input → usePilots Hook → tournamentStore → localStorage
                                    ↓
                              heats[] (Single Source of Truth)
                                    ↓
                              BracketTree → Sections → HeatCard
```

**Schlüsselprinzip:** `heats[]` Array ist die einzige Datenquelle für Tournament-State. Keine separate Bracket-Struktur - alles wird dynamisch aus `heats[]` berechnet.
