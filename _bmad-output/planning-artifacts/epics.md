---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - 'docs/prd.md'
  - 'docs/architecture.md'
  - 'docs/ux-design-specification.md'
  - 'planning-artifacts/analysis/tournament-rules.md'
project_name: 'FPV Racing Heats'
user_name: 'Jakob'
date: '2025-12-13'
---

# FPV Racing Heats - Epics

**Datum:** 2025-12-13 (zuletzt aktualisiert: 2026-01-07)  
**Autor:** Product Manager (PM-Agent)  
**Quelle:** PRD (FR1-36), UX-Spec, Architecture, Tournament Rules  
**Stories:** Detaillierte User Stories befinden sich in `implementation-artifacts/user-stories/`

## Überblick

- **Epics:** 14 logische Gruppen (alle MVP)
- **Stories:** Detaillierte User Stories in `implementation-artifacts/user-stories/`
- **Design First:** Synthwave Visual Design als Epic 2 für frühe visuelle Validierung
- **Gesamt-MVP:** 100% Coverage Core Journeys

## Epic List

| Epic | Beschreibung | FRs | Stories | Status |
|------|--------------|-----|---------|--------|
| **Epic 1** | Piloten-Verwaltung | FR1-5 | 3 | ✅ Abgeschlossen |
| **Epic 2** | Synthwave Visual Design | FR36 | 3 | ✅ Abgeschlossen |
| **Epic 3** | Turnier-Setup & Heat-Aufteilung | FR6-10 | 3 | ✅ Abgeschlossen |
| **Epic 4** | Heat-Durchführung & Bracket | FR11-21 | 5 | ✅ Abgeschlossen |
| **Epic 5** | Finale & Siegerehrung | FR22-25 | 1 | ✅ Abgeschlossen |
| **Epic 6** | Navigation & Beamer-Optimierung | FR26-31 | 2 | ✅ Abgeschlossen |
| **Epic 7** | Offline & Persistenz + Reset | FR32-35 | 1 | ✅ Abgeschlossen |
| **Epic 8** | Zeiterfassung | FR37-40 | 2 | ⏸️ Post-MVP |
| **Epic 9** | Loser Bracket Pooling | CP-LB | 3 | ✅ Abgeschlossen |
| **Epic 10** | Code-Konsolidierung (Refactoring) | Tech Debt | 3 | ✅ Abgeschlossen |
| **Epic 11** | Unified Bracket Tree Visualisierung | FR20, FR27+ | 7 | ✅ Abgeschlossen |
| **Epic 12** | Klassisches Turnierbaum-System (Vertical Bracket) | FR14-21 | 11 | ✅ Abgeschlossen |
| **Epic 13** | Runden-basiertes Bracket Redesign | Logik | 6 | ✅ Abgeschlossen |
| **Epic 14** | Visuelle Integration Bracket-Mockup | UI/UX | 10 | 🔄 In Arbeit |

---

## Epic 1: Piloten-Verwaltung ✅

Thomas kann Piloten anlegen (Name + Bild-URL + Instagram), importieren via CSV, bearbeiten und löschen. Grundlage für alle weiteren Funktionen.

**FRs covered:** FR1, FR2, FR3, FR4, FR5  
**Stories:** US-1.1, US-1.2, US-1.3  
**Status:** ✅ Abgeschlossen

---

## Epic 2: Synthwave Visual Design ✅

App sieht aus wie das Mockup (ux-design-directions.html) – Neon-Glow, Grid-Hintergrund, animierte Auswahl-Hervorhebung. Frühe visuelle Validierung des Designs.

**FRs covered:** FR36  
**Stories:** US-2.1, US-2.2, US-2.3  
**Status:** ✅ Abgeschlossen

---

## Epic 3: Turnier-Setup & Heat-Aufteilung ✅

Thomas kann ein Turnier starten mit automatischer Heat-Aufteilung (3er/4er Heats), Shuffle-Funktion und manueller Anpassung.

**FRs covered:** FR6, FR7, FR8, FR9, FR10  
**Stories:** US-3.1, US-3.2, US-3.3  
**Status:** ✅ Abgeschlossen

---

## Epic 4: Heat-Durchführung & Bracket ✅

Thomas kann Ergebnisse per Toggle-to-Rank eingeben (2 Klicks + Fertig), Bracket aktualisiert automatisch mit Winner/Loser-Zuordnung und On-Deck Vorschau. Platzierungen werden in Heat-Übersicht und Brackets angezeigt und sortiert. Das Bracket wird als klassische horizontale Baumstruktur mit SVG-Verbindungslinien dargestellt.

**FRs covered:** FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21  
**Stories:** US-4.1, US-4.2, US-4.3, US-4.4, US-4.5 (SVG-Baumstruktur)  
**Status:** ✅ Abgeschlossen

---

## Epic 5: Finale & Siegerehrung ✅

Thomas kann das Finale durchführen (automatisch erkannt), alle 4 Platzierungen eingeben und Turnier mit Siegerehrung abschließen.

**FRs covered:** FR22, FR23, FR24, FR25  
**Stories:** US-5.1  
**Status:** ✅ Abgeschlossen

---

## Epic 6: Navigation & Beamer-Optimierung ✅

Alle Nutzer können zwischen Tabs wechseln (Piloten/Bracket/Heat), optimiert für Beamer-Projektion (10m-Lesbarkeit).

**FRs covered:** FR26, FR27, FR28, FR29, FR30, FR31  
**Stories:** US-6.1, US-6.2  
**Status:** ✅ Abgeschlossen

---

## Epic 7: Offline & Persistenz ✅

Daten bleiben erhalten bei Browser-Neustart, Auto-Save nach jeder Aktion, App funktioniert vollständig offline. Reset-Funktionen ermöglichen Neustart des Turniers oder komplettes Zurücksetzen der App.

**FRs covered:** FR32, FR33, FR34, FR35  
**Stories:** US-7.1 (Reset-Funktionen)  
**Status:** ✅ Abgeschlossen

---

## Epic 8: Zeiterfassung (Post-MVP)

Thomas kann optional Zeiten pro Pilot erfassen, um Ranglisten zu erstellen oder bei Gleichstand zu entscheiden. Zeiten werden in Sekunden eingegeben (z.B. "140"), optional mit Millisekunden (z.B. "140.532"). Anzeige in Heat-Ansicht und Bracket.

**FRs covered:** FR37, FR38, FR39, FR40  
**Stories:** US-8.1 (Zeiteingabe in Heat), US-8.2 (Zeitanzeige im Bracket)  
**MVP:** ❌ Nein – Growth Feature Phase 2

---

## Epic 9: Loser Bracket Pooling ✅

Refactoring des Loser Brackets von vorberechneter Struktur zu dynamischem Pool-System. Verlierer werden in einem Pool gesammelt bis genug für einen Heat vorhanden sind (3-4 Piloten). Löst das Problem von nicht-spielbaren LB-Heats mit nur 1-2 Piloten.

**Quelle:** Change Proposal LB-Pooling (2025-12-23)  
**Severity:** Critical - Blocking Tournament Functionality  
**Stories:** US-9.1, US-9.2, US-9.3  
**MVP:** ✅ Must – Korrektur der bestehenden LB-Logik  
**Status:** ✅ Abgeschlossen

---

## Epic 10: Code-Konsolidierung (Refactoring) ✅

Technische Schulden abbauen durch Konsolidierung redundanter Logik für Heat-Generierung, Grand Finale und Zustandsmanagement.

**Quelle:** Technische Analyse (2025-12-23)  
**Stories:** US-10.1, US-10.2, US-10.3  
**MVP:** ⚠️ Should – Technische Stabilität  
**Status:** ✅ Abgeschlossen

---

## Epic 11: Unified Bracket Tree Visualisierung ✅

Das aktuelle Bracket-Layout mit getrennten Sections (WB/LB/Grand Finale) wird durch einen **zusammenhängenden visuellen Turnierbraum** ersetzt. Alle Heats werden in einer horizontalen Baumstruktur dargestellt, verbunden durch farbcodierte SVG-Linien, die den Turnierfluss zeigen.

**Vision:** Zuschauer (auf Beamer) verstehen auf einen Blick: Wer fliegt gegen wen? Wohin führt dieser Heat? Wer kommt weiter, wer ist raus?

**Stories:** US-11.1 bis US-11.7 (7 Stories)  
**MVP:** ⚠️ Should – Signifikantes UX-Upgrade für Zuschauer-Erlebnis  
**Status:** ✅ Abgeschlossen

---

## Epic 12: Klassisches Turnierbaum-System (Vertical Bracket Redesign) ✅

Das aktuelle Pool-basierte Bracket-System wird durch ein **klassisches Runden-basiertes Double-Elimination-System** ersetzt. Die Visualisierung wechselt von horizontal zu **vertikal (Top-Down)**, wobei Winner Bracket links und Loser Bracket rechts nebeneinander dargestellt werden.

**Vision:** Ein klassischer Turnierbaum wie bei professionellen Esports-Events – Runde 1 oben mit allen Heats nebeneinander, dann Runde 2 mit halb so vielen Heats darunter, usw. bis zum Finale. Übersichtlicher bei vielen Piloten, weniger Scrollen nötig.

**Stories:** US-12.1 bis US-12.11 (11 Stories)  
**MVP:** ⚠️ Should – Fundamentales UX/Logik-Upgrade  
**Status:** ✅ Abgeschlossen

**Siehe auch:** `analysis/tournament-rules.md` für die detaillierten Spielregeln

---

## Epic 13: Runden-basiertes Bracket Redesign

Das aktuelle Pool-basierte dynamische Bracket-System wird durch ein **klassisches runden-basiertes Double-Elimination-System** ersetzt. Die Implementierung folgt den Regeln in `analysis/tournament-rules.md`.

**Kernproblem:** Das aktuelle System generiert Heats dynamisch aus Pools, wenn ≥4 Piloten vorhanden sind. Das neue Format erfordert:
1. **Feste Rundenstruktur** mit definierten Heats pro Runde
2. **WB-Verlierer fließen in spezifische LB-Runden** (nicht in einen Pool)
3. **Grand Finale mit 4 Piloten** (nicht 2)
4. **Rematch-Regel** für WB-Piloten im Grand Finale

### Die Goldenen Regeln

| # | Regel | Beschreibung |
|---|-------|--------------|
| 1 | **Quali entscheidet** | Platz 1+2 = WB, Platz 3+4 = LB |
| 2 | **WB = 1. Chance** | 1. Niederlage → LB |
| 3 | **LB = 2. Chance** | 2. Niederlage → Rausfliegen |
| 4 | **Nur 1× rausfliegen** | Wer raus ist, kommt nicht wieder |
| 5 | **Grand Finale = Best of the Best** | 4 Piloten kämpfen um Platz 1-4 |

### Die Reihenfolge

```
WB R1 (alle Heats) → LB R1 (alle Heats) → WB R2 (alle Heats) → LB R2 (alle Heats) → ...
```

WB-Heats einer Runde müssen abgeschlossen sein, bevor LB-Heats dieser Runde starten.

### Grand Finale Rematch-Regel

Nach dem Grand Finale Heat wird automatisch ein **1v1-Rematch** gespielt, wenn die Bedingungen erfüllt sind:

| Grand Finale Platz | Wenn Pilot aus LB | Rematch gegen |
|--------------------|-------------------|---------------|
| Platz 1 | ✓ | Platz 3 (wenn aus WB) |
| Platz 2 | ✓ | Platz 4 (wenn aus WB) |
| Platz 3 | – | Kein Rematch |
| Platz 4 | – | Kein Rematch |

### Stories

| ID | Titel | Priorität |
|----|-------|-----------|
| US-13.1 | Runden-basierte WB-Progression | HIGH |
| US-13.2 | LB-Pooling mit Runden-Synchronisation | HIGH |
| US-13.3 | Grand Finale mit 4 Piloten | HIGH |
| US-13.4 | Grand Finale Rematch-Regel | MEDIUM |
| US-13.5 | WB-vor-LB Reihenfolge | MEDIUM |
| US-13.6 | Migration bestehender Logik ohne toten Code | HIGH |

**MVP:** ✅ Must – Fundamentale Logik-Änderung  
**Status:** ✅ Abgeschlossen

---

## Epic 14: Visuelle Integration Bracket-Mockup 🔄

Das vorhandene Bracket-Design wird durch eine **1:1 Umsetzung des Mockups `bracket-tree-dynamic-svg.html`** ersetzt. Dieses Epic fokussiert auf den **visuellen Umbau** - Layout, Styling, SVG-Linien, Zoom/Pan - während Epic 13 die **Logik-Änderungen** behandelt.

**Kernprinzip:** Das Mockup zeigt 32 Piloten - die Implementierung muss für **8-60 Piloten** dynamisch skalieren.

### Visuelle Struktur

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: "FPV RACING HEATS" + Turnier-Info                    │
├─────────────────────────────────────────────────────────────┤
│ TITLE: "DYNAMISCHER TURNIERBAUM"                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ QUALIFIKATION (8 Heats horizontal)                  │    │
│  │ [Q1] [Q2] [Q3] [Q4] [Q5] [Q6] [Q7] [Q8]             │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌───────────────────────┬────────────────────────────┐    │
│  │    WINNER BRACKET     │       LOSER BRACKET         │    │
│  │    (Grüner Header)    │       (Roter Header)        │    │
│  │                       │                             │    │
│  │  RUNDE 1 (4 Heats)    │  RUNDE 1 (6 Heats)          │    │
│  │  [H1] [H2] [H3] [H4]  │  [H1] ... [H6]              │    │
│  │       \  /            │      Pool-Indicator ↓        │    │
│  │        SVG-Linien     │  RUNDE 2 (4 Heats)          │    │
│  │  RUNDE 2 (2 Heats)    │  [H7] ... [H10]             │    │
│  │     [H5]   [H6]       │      ...                    │    │
│  │       \    /          │  FINALE (1 Heat)            │    │
│  │        SVG-Linien     │      [LB FINALE]            │    │
│  │  FINALE (1 Heat)      │          │                   │    │
│  │      [WB FINALE]      │          │                   │    │
│  │          │            │          └─────────┬─────────┘    │
│  │          │            │                    │              │
│  │          │            │                    ▼              │
│  │          │            │            ┌─────────────┐        │    │
│  │          │            │            │ WB TOP 2    │        │    │
│  │          │            │            │ LB TOP 2    │        │    │
│  │          │            │            │ GRAND FINALE│        │    │
│  │          │            │            └─────────────┘        │    │
│  └───────────────────────┴────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│ LEGEND: Farbcodierung Erklärung                              │
│ ZOOM-INDICATOR: +/- Buttons + Zoom-Level                     │
└─────────────────────────────────────────────────────────────┘
```

### Stories

| ID | Titel | Priorität |
|----|-------|-----------|
| US-14.1 | Synthwave Bracket Container | HIGH |
| US-14.2 | Qualifikations-Section | HIGH |
| US-14.3 | Winner Bracket Layout | HIGH |
| US-14.4 | Loser Bracket Layout | HIGH |
| US-14.5 | Heat-Box Design 1:1 Mockup | HIGH |
| US-14.6 | SVG Connector Lines System | HIGH |
| US-14.7 | Grand Finale Section | HIGH |
| US-14.8 | Zoom & Pan Funktionalität | MEDIUM |
| US-14.9 | Legende im Mockup-Design | LOW |
| US-14.10 | Dynamische Skalierung für alle Pilotenzahlen | HIGH |

**MVP:** ⚠️ Should – Fundamentales UX/UI-Upgrade  
**Status:** 🔄 In Arbeit (2/10 Stories abgeschlossen)

---

## FR Coverage Map

| FR | Epic | Beschreibung |
|----|------|--------------|
| FR1 | Epic 1 | Pilot anlegen (Name + Bild-URL + Instagram) |
| FR2 | Epic 1 | Pilot bearbeiten |
| FR3 | Epic 1 | Pilot löschen |
| FR4 | Epic 1 | CSV-Import |
| FR5 | Epic 1 | Piloten-Übersicht |
| FR6 | Epic 3 | Turnier starten |
| FR7 | Epic 3 | Heat-Aufteilung Vorschlag |
| FR8 | Epic 3 | Flexible Heat-Größen (3er/4er) |
| FR9 | Epic 3 | Heat-Aufteilung anpassen |
| FR10 | Epic 3 | Optimale Verteilung 7-60 Piloten |
| FR11 | Epic 4 | Heat starten |
| FR12 | Epic 4 | Gewinner auswählen (Toggle-to-Rank) |
| FR13 | Epic 4 | Heat abschließen (Fertig-Button) |
| FR14 | Epic 4 | Winner-Bracket Zuordnung |
| FR15 | Epic 4 | Loser-Bracket Zuordnung |
| FR16 | Epic 4 | On-Deck Vorschau |
| FR17 | Epic 4 | Double-Elimination verwalten |
| FR18 | Epic 4 | Bracket auto-update |
| FR19 | Epic 4 | Piloten-Historie sichtbar |
| FR20 | Epic 4 | Farbcodierung (Grün/Rot) |
| FR21 | Epic 4 | Nächste Heat-Paarungen |
| FR22 | Epic 5 | Finale erkennen |
| FR23 | Epic 5 | 4 Platzierungen eingeben |
| FR24 | Epic 5 | Platzierung auf Foto anzeigen |
| FR25 | Epic 5 | Turnier abschließen |
| FR26 | Epic 6 | Piloten-Tab |
| FR27 | Epic 6 | Bracket-Tab |
| FR28 | Epic 6 | Aktueller-Heat-Tab |
| FR29 | Epic 6 | Tab-Wechsel |
| FR30 | Epic 6 | Piloten mit Foto/Name in allen Views |
| FR31 | Epic 6 | Beamer-Optimierung |
| FR32 | Epic 7 | localStorage speichern |
| FR33 | Epic 7 | Auto-Load beim Start |
| FR34 | Epic 7 | Auto-Save nach Aktion |
| FR35 | Epic 7 | Offline-fähig |
| FR36 | Epic 2 | Synthwave Design (Farben, Fonts, Grid-BG, Glow, Animationen) |
| FR37 | Epic 8 | Optionale Zeit pro Pilot eingeben (Post-MVP) |
| FR38 | Epic 8 | Zeiteingabe in Sekunden, optional mit Millisekunden (Post-MVP) |
| FR39 | Epic 8 | Zeitanzeige in Heat-Ansicht und Bracket (Post-MVP) |
| FR40 | Epic 8 | Automatische lesbare Zeitformatierung (Post-MVP) |

---

## Sprint-Planung

1. **Sprint 1:** Epic 1 (Piloten-Verwaltung) + Epic 2 (Synthwave Design)
2. **Sprint 2:** Epic 3 (Turnier-Setup) + Epic 4 (Heat & Bracket)
3. **Sprint 3:** Epic 5 (Finale) + Epic 6 (Navigation) + Epic 7 (Persistenz)
4. **Sprint 4:** Epic 9 (Loser Bracket Pooling) – Critical Bug Fix
5. **Sprint 5:** Epic 10 (Refactoring) + Epic 11 (Unified Bracket Tree) – UX Enhancement
6. **Sprint 6:** Epic 12 (Klassisches Turnierbaum-System) – Fundamentales Redesign
7. **Sprint 7:** Epic 13 (Runden-basierte Logik) – Logik-Transformation
8. **Sprint 8:** Epic 14 (Visuelle Integration) – 1:1 Mockup-Umsetzung

---

## Zusätzliche Dokumentation

| Datei | Beschreibung |
|-------|--------------|
| `analysis/tournament-rules.md` | Detaillierte Spielregeln: Double-Elimination, Rematch-Regel, Beispiel-Abläufe |
| `analysis/product-brief.md` | Ursprünglicher Product Brief |
| `design/ux-design-specification.md` | UX Design Spezifikation |
| `design/bracket-tree-vertical-dynamisch.md` | Design-Dokumentation für vertikales Bracket |

---

*Zuletzt aktualisiert: 2026-01-08*
