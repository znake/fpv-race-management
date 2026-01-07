# FPV Racing Heats - Projekt-Dokumentation

Dieses Verzeichnis enthält die **lebenden Haupt-Dokumente** für das FPV Racing Heats Projekt. Dies ist der "Source of Truth" für alle Projekt-Dokumentationen.

## Kern-Dokumente

| Datei | Beschreibung |
|-------|--------------|
| `prd.md` | Product Requirements Document - Alle Feature-Anforderungen |
| `architecture.md` | Technische Architektur - Stack, Patterns, Komponenten |
| `README.md` | Diese Übersicht |

## Projekt-Artefakte

Alle weiteren Artefakte (Epics, User Stories, Reports, etc.) befinden sich in `_bmad-output/`:

```
_bmad-output/
├── planning-artifacts/          # Planungs-Dokumente
│   ├── epics.md                 # Alle Epics (1-14) mit Stories
│   ├── analysis/                # Analysen & Spielregeln
│   │   ├── tournament-rules.md  # Double-Elimination Regeln
│   │   ├── product-brief.md
│   │   └── brainstorming-session.md
│   └── design/                  # Design-Dokumentation
│       ├── ux-design-specification.md
│       └── bracket-tree-vertical-dynamisch.md
│
└── implementation-artifacts/    # Implementierungs-Artefakte
    ├── user-stories/            # User Stories nach Epics
    │   ├── epic-1/ ... epic-14/
    ├── change-proposals/        # Scope-Änderungen
    ├── bug-fixes/               # Bug-Fix Dokumentation
    ├── validation-reports/      # QA-Berichte
    └── completion-reports/      # Abschlussberichte
```

## Schnell-Links

- **Anforderungen:** [`prd.md`](prd.md)
- **Architektur:** [`architecture.md`](architecture.md)
- **Epics & Stories:** [`_bmad-output/planning-artifacts/epics.md`](../_bmad-output/planning-artifacts/epics.md)
- **Spielregeln:** [`_bmad-output/planning-artifacts/analysis/tournament-rules.md`](../_bmad-output/planning-artifacts/analysis/tournament-rules.md)

---

*Zuletzt aktualisiert: 2026-01-07*
