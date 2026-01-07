# Epic: Code Refactoring & Standardisierung

**Erstellt:** 2025-12-26
**Status:** Backlog
**Ziel:** Technische Schulden abbauen, Code-Duplikation eliminieren, einheitliche Standards etablieren

## Zusammenfassung

Nach einer umfassenden Code-Analyse wurden 23 User Stories identifiziert, die das Projekt wartbarer, konsistenter und besser strukturiert machen.

## Problembereiche

| Bereich | Hauptprobleme |
|---------|---------------|
| Store | 1.472 Zeilen monolithischer Store, 4 duplizierte Reset-Funktionen, 300-Zeilen-Mega-Funktion |
| Komponenten | 1.163-Zeilen bracket-tree.tsx, 4 verschiedene Heat-Komponenten, 6 Modal-Implementierungen |
| Utils & Types | utils.ts als "Catch-All", duplizierte Types, any-Types in Produktion |
| Tests | 6 verschiedene resetStore()-Implementierungen, fehlende gemeinsame Helpers |
| Projektstruktur | Ungenutzte Dependencies, CSV-Dateien im Root, ungenutzter Path-Alias |

## Story-Übersicht

| Epic | Stories | Aufwand |
|------|---------|---------|
| 1: Store Refactoring | 6 | 1×XS, 3×S, 1×M, 1×L |
| 2: Komponenten Refactoring | 7 | 2×S, 3×M, 1×L, 1×XS |
| 3: Utils & Types | 5 | 1×XS, 3×S, 1×M |
| 4: Tests & Cleanup | 5 | 3×XS, 2×S |
| **Gesamt** | **23** | |

## Empfohlene Sprint-Planung

### Sprint 1: Foundation (Quick Wins + Grundlagen)
- 4.4 Ungenutzte Dependencies (XS)
- 4.3 CSV-Dateien verschieben (XS)
- 4.5 Path-Alias bereinigen (XS)
- 1.1 Initial State Konstante (XS)
- 1.3 HeatForHelper → Pick (XS)
- 4.1 Store-Reset-Utility (S)

### Sprint 2: Store & Types
- 1.2 Reset-Funktionen konsolidieren (S)
- 1.4 Helper nach bracket-logic (S)
- 3.1 Utils.ts aufteilen (S)
- 3.2 Ranking Type & any (S)
- 4.2 Mock-Pilot-Factory (S)

### Sprint 3: Komponenten Basis
- 2.1 Modal-Komponente (S)
- 2.3 PilotAvatar & RankBadge (S)
- 2.4 bracket-tree aufteilen (L)

### Sprint 4: Komponenten Konsolidierung
- 2.2 Modals migrieren (M)
- 2.5 HeatCard konsolidieren (M)
- 2.6 Pool-Visualisierung (M)
- 3.3 Types-Ordner (M)

### Sprint 5: Finalisierung
- 1.5 Pool-Aktionen generisch (S)
- 1.6 submitHeatResults aufteilen (L)
- 2.7 Design-Token-Konsistenz (M)
- 3.4 HeatForHelper konsolidieren (XS)
- 3.5 ID-Generierung (S)

## Abhängigkeitsgraph

```
Sprint 1 (Foundation)
├── 4.4 Dependencies ──────────────────────────────────────────┐
├── 4.3 CSV verschieben ───────────────────────────────────────┤
├── 4.5 Path-Alias ────────────────────────────────────────────┤
├── 1.1 Initial State ──────► 1.2 Reset konsolidieren         │
├── 1.3 HeatForHelper ──────► 1.4 Helper verschieben          │
└── 4.1 Store-Reset ────────► 4.2 Mock-Factory                │
                                                               │
Sprint 2 (Store & Types)                                       │
├── 1.2 Reset konsolidieren                                    │
├── 1.4 Helper verschieben                                     │
├── 3.1 Utils aufteilen ────► 3.2 Ranking Type ──► 3.3 Types  │
└── 4.2 Mock-Factory                                           │
                                                               │
Sprint 3 (Komponenten Basis)                                   │
├── 2.1 Modal ──────────────► 2.2 Modals migrieren            │
├── 2.3 Avatar/Badge ───────► 2.5 HeatCard                    │
└── 2.4 bracket-tree ───────► 2.5, 2.6                        │
                                                               │
Sprint 4 (Konsolidierung)                                      │
├── 2.2 Modals migrieren                                       │
├── 2.5 HeatCard konsolidieren                                 │
├── 2.6 Pool-Visualisierung                                    │
└── 3.3 Types-Ordner ───────► 3.4 HeatForHelper               │
                                                               │
Sprint 5 (Finalisierung)                                       │
├── 1.5 Pool-Aktionen                                          │
├── 1.6 submitHeatResults (benötigt 1.1, 1.4)                  │
├── 2.7 Design-Tokens (nach 2.4-2.6)                           │
├── 3.4 HeatForHelper                                          │
└── 3.5 ID-Generierung                                         │
```

## Hinweise für Entwickler

1. **Jede Story einzeln abarbeiten** - nach jeder Story `npm test` ausführen
2. **Keine funktionalen Änderungen** - reines Refactoring
3. **Commits pro Story** - ermöglicht einfaches Rollback
4. **TypeScript-Strikt** - keine neuen `any` Types einführen
