# FPV Racing Heats - Dokumentation

**Projekt:** FPV Racing Tournament Heats Manager
**Version:** Phase 4 (Januar 2026)
**Scan-Datum:** 2026-01-19

---

## Quick Links

| Dokument | Beschreibung |
|----------|--------------|
| [Getting Started](./getting-started.md) | Schnelleinstieg & Installation |
| [PRD](./prd.md) | Product Requirements Document |
| [Architektur Deep-Dive](./architecture-deep-dive.md) | Architektur-Entscheidungen & Patterns |

---

## Dokumentations-Index

### Projekt-Übersicht

| Dokument | Beschreibung | Zuletzt aktualisiert |
|----------|--------------|---------------------|
| [Getting Started](./getting-started.md) | Installation, Setup, Turnier-Ablauf | 2026-01-19 |
| [Source Tree](./source-tree.md) | Verzeichnisstruktur & Datei-Beschreibungen | 2026-01-19 |
| [Tech Stack](./tech-stack.md) | Technologien, Dependencies, Design System | 2026-01-19 |

### Architektur

| Dokument | Beschreibung | Zuletzt aktualisiert |
|----------|--------------|---------------------|
| [Architecture Decision Document](./architecture.md) | Ursprüngliche Architektur-Entscheidungen | 2025-12-12 |
| [Architecture Deep-Dive](./architecture-deep-dive.md) | Aktuelle Architektur (Phase 4) | 2026-01-19 |

### API & Referenz

| Dokument | Beschreibung | Zuletzt aktualisiert |
|----------|--------------|---------------------|
| [Store API](./store-api.md) | Tournament Store Actions & State | 2026-01-19 |

### Requirements & Design

| Dokument | Beschreibung | Zuletzt aktualisiert |
|----------|--------------|---------------------|
| [PRD](./prd.md) | Product Requirements Document | 2025-12-12 |

---

## BMAD-Artefakte

Die BMAD-Workflow-Artefakte befinden sich in `_bmad-output/`:

### Planungs-Artefakte

| Pfad | Beschreibung |
|------|--------------|
| `_bmad-output/planning-artifacts/project-context.md` | Projektkontext |
| `_bmad-output/planning-artifacts/epics.md` | Alle Epics (1-14) |
| `_bmad-output/planning-artifacts/analysis/product-brief-*.md` | Product Brief |
| `_bmad-output/planning-artifacts/analysis/tournament-rules.md` | Double-Elimination Regeln |
| `_bmad-output/planning-artifacts/design/ux-design-specification.md` | UX-Design |
| `_bmad-output/planning-artifacts/design/bracket-tree-vertical-dynamisch.md` | Bracket-Design |

### Implementierungs-Artefakte

| Pfad | Beschreibung |
|------|--------------|
| `_bmad-output/implementation-artifacts/user-stories/` | User Stories (Epic 1-14) |
| `_bmad-output/implementation-artifacts/validation-reports/` | Validierungs-Berichte |
| `_bmad-output/implementation-artifacts/completion-reports/` | Abschluss-Berichte |
| `_bmad-output/implementation-artifacts/change-proposals/` | Änderungsvorschläge |

---

## Projekt-Statistiken

| Metrik | Wert |
|--------|------|
| **Projekt-Typ** | Web (React/TypeScript/Vite) |
| **Repository-Typ** | Monolith |
| **Source-Dateien** | ~40 TypeScript/TSX |
| **Test-Dateien** | 17 |
| **Epics** | 14 |
| **User Stories** | 90+ |

---

## Entwicklung

### Schnellstart

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Tests im Watch-Mode
```

### Build

```bash
npm run build    # Production Build → dist/
npm run preview  # Vorschau
```

---

## Kontakt & Support

- **Projekt-Owner:** Jakob
- **BMAD-Methodik:** [bmad.dev](https://bmad.dev)
