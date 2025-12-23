---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - 'docs/prd.md'
  - 'docs/architecture.md'
  - 'docs/ux-design-specification.md'
  - 'docs/ux-design-directions.html'
project_name: 'FPV Racing Heats'
user_name: 'Jakob'
date: '2025-12-13'
---

# FPV Racing Heats - Epics

**Datum:** 2025-12-13  
**Autor:** Product Manager (PM-Agent)  
**Quelle:** PRD (FR1-36), UX-Spec, Architecture  
**Stories:** Detaillierte User Stories befinden sich in `docs/sprint-artifacts/`

## Überblick

- **Epics:** 7 logische Gruppen aus 36 FRs (alle MVP)
- **Stories:** 17 User Stories (siehe sprint-artifacts)
- **Design First:** Synthwave Visual Design als Epic 2 für frühe visuelle Validierung
- **Gesamt-MVP:** 100% Coverage Core Journeys

## Epic List

### Epic 1: Piloten-Verwaltung

Thomas kann Piloten anlegen (Name + Bild-URL + Instagram), importieren via CSV, bearbeiten und löschen. Grundlage für alle weiteren Funktionen.

**FRs covered:** FR1, FR2, FR3, FR4, FR5  
**Stories:** US-1.1, US-1.2, US-1.3

---

### Epic 2: Synthwave Visual Design

App sieht aus wie das Mockup (ux-design-directions.html) – Neon-Glow, Grid-Hintergrund, animierte Auswahl-Hervorhebung. Frühe visuelle Validierung des Designs.

**FRs covered:** FR36  
**Stories:** US-2.1, US-2.2, US-2.3

---

### Epic 3: Turnier-Setup & Heat-Aufteilung

Thomas kann ein Turnier starten mit automatischer Heat-Aufteilung (3er/4er Heats), Shuffle-Funktion und manueller Anpassung.

**FRs covered:** FR6, FR7, FR8, FR9, FR10  
**Stories:** US-3.1, US-3.2, US-3.3

---

### Epic 4: Heat-Durchführung & Bracket

Thomas kann Ergebnisse per Toggle-to-Rank eingeben (2 Klicks + Fertig), Bracket aktualisiert automatisch mit Winner/Loser-Zuordnung und On-Deck Vorschau. Platzierungen werden in Heat-Übersicht und Brackets angezeigt und sortiert.

**FRs covered:** FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21  
**Stories:** US-4.1, US-4.2, US-4.3, US-4.4

---

### Epic 5: Finale & Siegerehrung

Thomas kann das Finale durchführen (automatisch erkannt), alle 4 Platzierungen eingeben und Turnier mit Siegerehrung abschließen.

**FRs covered:** FR22, FR23, FR24, FR25  
**Stories:** US-5.1

---

### Epic 6: Navigation & Beamer-Optimierung

Alle Nutzer können zwischen Tabs wechseln (Piloten/Bracket/Heat), optimiert für Beamer-Projektion (10m-Lesbarkeit).

**FRs covered:** FR26, FR27, FR28, FR29, FR30, FR31  
**Stories:** US-6.1, US-6.2

---

### Epic 7: Offline & Persistenz

Daten bleiben erhalten bei Browser-Neustart, Auto-Save nach jeder Aktion, App funktioniert vollständig offline. Reset-Funktionen ermöglichen Neustart des Turniers oder komplettes Zurücksetzen der App.

**FRs covered:** FR32, FR33, FR34, FR35  
**Stories:** US-7.1 (Reset-Funktionen)

---

### Epic 8: Zeiterfassung (Post-MVP)

Thomas kann optional Zeiten pro Pilot erfassen, um Ranglisten zu erstellen oder bei Gleichstand zu entscheiden. Zeiten werden in Sekunden eingegeben (z.B. "140"), optional mit Millisekunden (z.B. "140.532"). Anzeige in Heat-Ansicht und Bracket.

**FRs covered:** FR37, FR38, FR39, FR40  
**Stories:** US-8.1 (Zeiteingabe in Heat), US-8.2 (Zeitanzeige im Bracket)  
**MVP:** ❌ Nein – Growth Feature Phase 2

---

### Epic 9: Loser Bracket Pooling

Refactoring des Loser Brackets von vorberechneter Struktur zu dynamischem Pool-System. Verlierer werden in einem Pool gesammelt bis genug für einen Heat vorhanden sind (3-4 Piloten). Löst das Problem von nicht-spielbaren LB-Heats mit nur 1-2 Piloten.

**Quelle:** Change Proposal LB-Pooling (2025-12-23)  
**Severity:** Critical - Blocking Tournament Functionality  
**Stories:** US-9.1, US-9.2, US-9.3  
**MVP:** ✅ Must – Korrektur der bestehenden LB-Logik

---

## Epics-Übersicht

| Epic | Beschreibung | FRs | MVP? | Stories |
|------|--------------|-----|------|---------|
| **Epic 1** | Piloten-Verwaltung | FR1-5 | ✅ Must | 3 |
| **Epic 2** | Synthwave Visual Design | FR36 | ✅ Must | 3 |
| **Epic 3** | Turnier-Setup & Heat-Aufteilung | FR6-10 | ✅ Must | 3 |
| **Epic 4** | Heat-Durchführung & Bracket | FR11-21 | ✅ Must | 4 |
| **Epic 5** | Finale & Siegerehrung | FR22-25 | ✅ Must | 1 |
| **Epic 6** | Navigation & Beamer-Optimierung | FR26-31 | ✅ Must | 2 |
| **Epic 7** | Offline & Persistenz + Reset | FR32-35 | ✅ Must | 1 |
| **Epic 8** | Zeiterfassung | FR37-40 | ❌ Growth | 2 |
| **Epic 9** | Loser Bracket Pooling | CP-LB | ✅ Must | 3 |

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

## Sprint-Planung

1. **Sprint 1:** Epic 1 (Piloten-Verwaltung) + Epic 2 (Synthwave Design)
2. **Sprint 2:** Epic 3 (Turnier-Setup) + Epic 4 (Heat & Bracket)
3. **Sprint 3:** Epic 5 (Finale) + Epic 6 (Navigation) + Epic 7 (Persistenz)
4. **Sprint 4:** Epic 9 (Loser Bracket Pooling) – Critical Bug Fix
