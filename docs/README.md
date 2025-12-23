# Dokumentationsstruktur

Dieses Verzeichnis enthält alle Projektdokumentationen für FPV Racing Heats.

## Ordnerstruktur

```
docs/
├── analysis/           # Ursprüngliche Analysen & Brainstorming
├── design/             # UX-Design Spezifikationen
├── sample-data/        # Test- und Beispieldaten (CSV)
├── sprints/            # Sprint-bezogene Artefakte
│   ├── bug-fixes/          # Bug-Fix Dokumentation
│   ├── change-proposals/   # Sprint Change Proposals
│   ├── completion-reports/ # Abschlussberichte (Epics, Course Corrections)
│   ├── user-stories/       # User Stories nach Epics sortiert
│   │   ├── epic-1/             # Pilotenverwaltung
│   │   ├── epic-2/             # Synthwave Design
│   │   ├── epic-3/             # Turnierstart & Heat-Aufteilung
│   │   ├── epic-4/             # Heat-Durchführung & Bracket
│   │   ├── epic-5/             # Finale & Siegerehrung
│   │   ├── epic-6/             # Beamer-Optimierung & UI
│   │   └── epic-7/             # Reset-Funktionen
│   └── validation-reports/ # Validation Reports
└── [Kern-Dokumente]    # PRD, Epics, Architecture, etc.
```

## Kern-Dokumente (Hauptordner)

| Datei | Beschreibung |
|-------|--------------|
| `prd.md` | Product Requirements Document |
| `epics.md` | Epic-Übersicht und Priorisierung |
| `architecture.md` | Technische Architektur |
| `project-context.md` | Projektkontext für AI-Assistenten |
| `bmm-workflow-status.yaml` | BMM Workflow Status |

## Sprint-Artefakte

### User Stories (`sprints/user-stories/`)
Alle User Stories sind nach Epics gruppiert. Namenskonvention: `{epic}-{story}-beschreibung.md`

### Change Proposals (`sprints/change-proposals/`)
Dokumentation von Scope-Änderungen und Sprint-Anpassungen.

### Validation Reports (`sprints/validation-reports/`)
QA-Berichte und Validierungsergebnisse.

### Completion Reports (`sprints/completion-reports/`)
Abschlussberichte für Epics und Course Corrections.

### Bug Fixes (`sprints/bug-fixes/`)
Dokumentation von Bug-Fixes und deren Lösungen.
