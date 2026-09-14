# FPV Racing Heats - Dokumentation

**Projekt:** FPV Racing Tournament Heats Manager
**Version:** Phase 4 (Februar 2026)
**Scan-Datum:** 2026-02-02
**Scan-Level:** Exhaustive

---

## Quick Links

| Dokument | Beschreibung |
|----------|--------------|
| [README](../README.md) | **Aktuellste Dokumentation** - Benutzerhandbuch |
| [Getting Started](./getting-started.md) | Schnelleinstieg & Installation |
| [Architektur Deep-Dive](./architecture-deep-dive.md) | Architektur-Entscheidungen & Patterns |

---

## Dokumentations-Index

### Projekt-Übersicht

| Dokument | Beschreibung | Zuletzt aktualisiert |
|----------|--------------|---------------------|
| [README](../README.md) | Umfassendes Benutzerhandbuch mit Screenshots | 2026-01-31 |
| [Getting Started](./getting-started.md) | Installation, Setup, Turnier-Ablauf | 2026-01-19 |
| [Source Tree](./source-tree.md) | Verzeichnisstruktur & Datei-Beschreibungen | 2026-02-02 |
| [Tech Stack](./tech-stack.md) | Technologien, Dependencies, Design System | 2026-02-02 |

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

## Historische Artefakte

Die frueheren BMAD-Workflow-Artefakte sind nicht Bestandteil des aktuellen Repositorys. Die früher dokumentierten `_bmad-output/...`-Pfade existieren im Repository nicht (mehr) und werden hier bewusst nicht aufgeführt.

---

## Projekt-Statistiken

| Metrik | Wert |
|--------|------|
| **Projekt-Typ** | Web (React/TypeScript/Vite) |
| **Repository-Typ** | Monolith |
| **Source-Dateien** | 58 TypeScript/TSX-Dateien unter `src/` |
| **Components** | 32 |
| **Hooks** | 3 |
| **Lib-Module** | 16 |
| **Test-Dateien** | 32 |
| **Epics** | 14 |
| **User Stories** | 90+ |

---

## Neue Features (seit letztem Scan)

| Feature | Beschreibung |
|---------|--------------|
| ✨ **SVG Pilot Paths** | Bezier-Kurven zeigen Piloten-Reise durch das Bracket |
| ✨ **Channel Optimization** | Intelligente Raceband-Kanal-Zuweisung (R1, R3, R6, R8) |
| ✨ **Pool Aggregation** | Optimierte LB-Heat-Generierung mit korrekter Piloten-Sammlung |
| ✨ **Confetti Victory** | canvas-confetti Animation bei Siegerehrung |
| ✨ **Lap Time Entry** | Optionale Rundenzeiten-Erfassung pro Pilot |
| ✨ **PWA Support** | Progressive Web App für Vollbild auf Mobilgeräten |

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
