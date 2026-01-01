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

Thomas kann Ergebnisse per Toggle-to-Rank eingeben (2 Klicks + Fertig), Bracket aktualisiert automatisch mit Winner/Loser-Zuordnung und On-Deck Vorschau. Platzierungen werden in Heat-Übersicht und Brackets angezeigt und sortiert. Das Bracket wird als klassische horizontale Baumstruktur mit SVG-Verbindungslinien dargestellt.

**FRs covered:** FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21  
**Stories:** US-4.1, US-4.2, US-4.3, US-4.4, US-4.5 (SVG-Baumstruktur)

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

### Epic 10: Code-Konsolidierung (Refactoring)

Technische Schulden abbauen durch Konsolidierung redundanter Logik für Heat-Generierung, Grand Finale und Zustandsmanagement.

**Quelle:** Technische Analyse (2025-12-23)  
**Stories:** US-10.1, US-10.2, US-10.3  
**MVP:** ⚠️ Should – Technische Stabilität

---

### Epic 11: Unified Bracket Tree Visualisierung

Das aktuelle Bracket-Layout mit getrennten Sections (WB/LB/Grand Finale) wird durch einen **zusammenhängenden visuellen Turnierbraum** ersetzt. Alle Heats werden in einer horizontalen Baumstruktur dargestellt, verbunden durch farbcodierte SVG-Linien, die den Turnierfluss zeigen.

**Vision:** Zuschauer (auf Beamer) verstehen auf einen Blick: Wer fliegt gegen wen? Wohin führt dieser Heat? Wer kommt weiter, wer ist raus?

**Mockup-Referenz:** [`docs/design/bracket-tree-mockup.html`](design/bracket-tree-mockup.html)

#### Akzeptanzkriterien (Epic-Level)

1. **Zusammenhängendes Layout**
   - Alle Heats (WB + LB + Grand Finale) in EINEM visuellen Container
   - Keine getrennten Sections mit eigenem Border mehr
   - Horizontales Layout: Pools → Runde 1 → Finale → Grand Finale

2. **SVG Verbindungslinien**
   - Grüne Linien für Winner Bracket Verbindungen (mit Glow-Effekt)
   - Rote Linien für Loser Bracket Verbindungen (mit Glow-Effekt)
   - Goldene Linien für Verbindungen zum Grand Finale (dicker, mit Glow)
   - Linien werden dynamisch basierend auf Bracket-Struktur generiert

3. **Farbcodierung der Platzierungen**
   - Platz 1 + 2: Grüner Hintergrund + grüner linker Border (Weiterkommer)
   - Platz 3 + 4: Roter Hintergrund + roter linker Border (Eliminiert/zum LB)
   - Sofort erkennbar wer weiterkommt

4. **Heat-Status Indikatoren**
   - Checkmark (✓) bei abgeschlossenen Heats im Header
   - Kein Badge bei noch nicht abgeschlossenen Heats (visuell neutral)

5. **Pool-Integration**
   - WB Pool: Mittig positioniert zwischen Winner Bracket Heats (Runde 1)
   - LB Pool: Mittig positioniert zwischen Loser Bracket Heats (Runde 1)
   - Gestrichelte Border (dashed) zur Unterscheidung von aktiven Heats

6. **Grand Finale Herkunfts-Tags**
   - Piloten im Grand Finale zeigen "WB" (grün) oder "LB" (rot) Tag
   - Zeigt woher jeder Finalist kommt

7. **Legende**
   - Erklärt alle Farbcodierungen für Zuschauer
   - Am unteren Rand des Brackets

8. **Performance & Responsiveness**
   - Smooth Rendering auf typischen Beamer-Laptops
   - Horizontales Scrolling auf kleineren Bildschirmen
   - Minimum-Breite definiert für lesbare Darstellung

#### Mögliche User Stories (zur Verfeinerung mit SM)

| ID | Titel | Beschreibung |
|----|-------|--------------|
| US-11.1 | Unified Layout Container | Von getrennten Sections zu einem zusammenhängenden Bracket-Container |
| US-11.2 | SVG Verbindungslinien | Dynamische Liniengenerierung mit Farbcodierung (WB/LB/GF) und Glow |
| US-11.3 | Platzierungs-Farbcodierung | Grün/Rot Hintergrund für Weiterkommer/Eliminierte in Heat-Boxen |
| US-11.4 | Heat-Status Indikatoren | ✓ für abgeschlossene Heats, kein Badge für wartende |
| US-11.5 | Pool-Visualisierung | Pools mittig zwischen zugehörigen Heats mit dashed Border |
| US-11.6 | Grand Finale Tags | WB/LB Herkunfts-Tags für Finalisten |
| US-11.7 | Legende | Farbcodierungs-Erklärung für Zuschauer |

#### Technische Hinweise

- SVG-Linien müssen dynamisch berechnet werden basierend auf DOM-Positionen der Heat-Boxen
- Glow-Effekte via CSS `filter: drop-shadow()` oder SVG `<filter>`
- Pools müssen dynamisch positioniert werden basierend auf LB-Pool-State (Epic 9)
- Berücksichtigung von verschiedenen Bracket-Größen (8-60 Piloten)

#### Abhängigkeiten

- **Epic 9 (LB Pooling)** muss abgeschlossen sein für korrekte Pool-Darstellung
- **Epic 4 (Heat-Durchführung)** liefert die Daten für Status-Indikatoren

**FRs covered:** FR20 (Farbcodierung), FR27 (Bracket-Tab) – Enhancement  
**Stories:** US-11.1 bis US-11.7 (7 Stories geschätzt)  
**MVP:** ⚠️ Should – Signifikantes UX-Upgrade für Zuschauer-Erlebnis

---

### Epic 12: Klassisches Turnierbaum-System (Vertical Bracket Redesign)

Das aktuelle Pool-basierte Bracket-System wird durch ein **klassisches Runden-basiertes Double-Elimination-System** ersetzt. Die Visualisierung wechselt von horizontal zu **vertikal (Top-Down)**, wobei Winner Bracket links und Loser Bracket rechts nebeneinander dargestellt werden.

**Vision:** Ein klassischer Turnierbaum wie bei professionellen Esports-Events – Runde 1 oben mit allen Heats nebeneinander, dann Runde 2 mit halb so vielen Heats darunter, usw. bis zum Finale. Übersichtlicher bei vielen Piloten, weniger Scrollen nötig.

**Mockup-Referenz:** [`design/bracket-tree-vertical-mockup.html`](design/bracket-tree-vertical-mockup.html) (32 Piloten Beispiel)

#### Kernänderungen

**1. Logik-Redesign (Runden-basiert statt Pool-basiert)**

| Aktuell (Pool-basiert) | Neu (Runden-basiert) |
|------------------------|----------------------|
| Quali → Winners in Pool → Pool voll (4+) → Neuer WB Heat | Quali → Runde 1 Heats (alle gleichzeitig generiert) |
| Heats werden DYNAMISCH generiert wenn Pool ≥4 | Heats werden PRO RUNDE generiert wenn vorherige Runde abgeschlossen |
| Pool entscheidet wann nächster Heat kommt | Runden-Struktur definiert Turnierverlauf |
| Pools sind primärer Mechanismus | Pools nur für Rest-Piloten (nicht durch 4 teilbar) |

**2. Visualisierungs-Redesign (Vertikal statt Horizontal)**

```
┌─────────────────────────────────────────────────────────────┐
│     WINNER BRACKET (links)      │    LOSER BRACKET (rechts) │
├─────────────────────────────────┼───────────────────────────┤
│ Pool (oben, nur wenn nötig)     │ Pool (oben, nur wenn nötig)│
├─────────────────────────────────┼───────────────────────────┤
│ RUNDE 1                         │ RUNDE 1                   │
│ [H1] [H2] [H3] [H4]             │ [H1] [H2] [H3] [H4]       │
│   ↓    ↓    ↓    ↓              │   ↓    ↓    ↓    ↓        │
│ RUNDE 2                         │ RUNDE 2                   │
│   [H5]   [H6]                   │   [H5]   [H6]             │
│     ↓      ↓                    │     ↓      ↓              │
│ SEMIFINALE                      │ SEMIFINALE                │
│       [H7]                      │       [H7]                │
│         ↓                       │         ↓                 │
│            └──────────┬─────────┘                           │
│                 GRAND FINALE                                 │
│                    [GF]                                      │
└─────────────────────────────────────────────────────────────┘
```

#### Akzeptanzkriterien (Epic-Level)

1. **Runden-basierte Bracket-Struktur**
   - WB und LB haben definierte Runden (Runde 1, 2, 3, ... Finale)
   - Jede Runde hat eine feste Anzahl Heats basierend auf Pilotenzahl
   - Runde N+1 wird erst generiert wenn Runde N abgeschlossen ist
   - WB und LB laufen parallel mit gleicher Runden-Logik

2. **4er-Heats als Standard (wichtig!)**
   - **Idealfall:** Jeder Heat hat genau 4 Piloten
   - **Fallback:** 3er-Heats wenn Pilotenzahl nicht durch 4 teilbar
   - **Minimum:** 2er-Heats nur wenn absolut notwendig (z.B. Finale mit nur 2 Piloten)
   - Die Logik muss IMMER versuchen, 4er-Heats zu maximieren
   - Beispiel: Bei 14 Piloten → 3x 4er-Heat + 1x 2er-Heat (nicht 4x 3er-Heat + 1x 2er-Heat)

3. **Progression zwischen Runden**
   - WB: Platz 1+2 → nächste WB-Runde, Platz 3+4 → entsprechende LB-Runde
   - LB: Platz 1+2 → nächste LB-Runde, Platz 3+4 → eliminiert
   - Klare Zuordnung welcher Heat in welchen Folge-Heat führt

4. **Pool als Fallback-Mechanismus**
   - Pool wird NUR verwendet wenn Pilotenanzahl nicht durch 4 teilbar ist
   - Rest-Piloten warten im Pool bis nächste Runde sie aufnehmen kann
   - Pool ist sekundär, nicht primärer Mechanismus

5. **Vertikales Layout (Top-Down)**
   - Winner Bracket auf der linken Seite
   - Loser Bracket auf der rechten Seite
   - Runden fließen von oben nach unten
   - Grand Finale am unteren Ende, mittig zwischen WB und LB

6. **Bracket Headers (volle Breite)**
   - "WINNER BRACKET" und "LOSER BRACKET" als breite Header über allen Heats
   - Header-Breite entspricht der Breite aller Heats der ersten Runde (660px bei 4 Heats)
   - Farbcodierter Rahmen und dezenter Hintergrund (grün für WB, rot für LB)
   - Visuell deutliche Trennung der beiden Brackets

7. **Round Labels (im Freiraum)**
   - Runden-Bezeichnungen ("WB RUNDE 1", "WB RUNDE 2", "WB FINALE" etc.)
   - Positioniert im **Freiraum zwischen den Runden**, nicht über den Heats
   - Zentriert über der gesamten Bracket-Breite
   - Dezente Schrift (hellgrau, letter-spacing)

8. **SVG-Verbindungslinien (vertikal)**
   - Linien starten aus der **Mitte unten** jedes Heats
   - Einheitlicher vertikaler Abstand: ~20px nach unten, dann horizontal zusammenführen
   - Grün für WB-Verbindungen (mit Glow-Effekt)
   - Rot für LB-Verbindungen (mit Glow-Effekt)
   - **Gold** für Verbindungen zum Grand Finale (dicker, 3px, mit starkem Glow)
   - Linien verbinden zur **Mitte oben** des Ziel-Heats

9. **Grand Finale Verbindung**
   - Goldene Linien von WB-Finale und LB-Finale führen zum Grand Finale
   - Beide Linien starten unten-mittig aus den Finale-Boxen
   - Führen nach unten, dann horizontal zur Mitte, dann runter zum Grand Finale
   - Visuelle Betonung als Höhepunkt des Turniers

10. **Beamer-Optimierung**
    - Weniger vertikales Scrollen bei vielen Piloten
    - Horizontales Scrollen nur bei sehr vielen Runde-1-Heats
    - Übersichtliche Darstellung des gesamten Turnierverlaufs
    - Mindestbreite für lesbare Darstellung auf Beamer

#### Betroffene Komponenten

| Bereich | Dateien | Änderungsart |
|---------|---------|--------------|
| **Logik** | `bracket-structure-generator.ts` | Komplettes Rewrite |
| **Logik** | `bracket-logic.ts` | Signifikante Änderungen |
| **Logik** | `heat-completion.ts` | Anpassungen |
| **Store** | `tournamentStore.ts` | Pool-Logik auf Runden umstellen |
| **UI** | `BracketTree.tsx` | Komplettes Layout Rewrite |
| **UI** | `SVGConnectorLines.tsx` | Vertikale Linien |
| **Tests** | ~15-20 Test-Dateien | Anpassungen/Rewrites |

#### Technische Hinweise (WICHTIG: Dynamische Generierung)

Das Mockup (`bracket-tree-vertical-mockup.html`) zeigt ein **statisches Beispiel** mit 32 Piloten. Die **Implementierung muss vollständig dynamisch** sein:

1. **Dynamische Bracket-Struktur**
   - Anzahl der Runden wird aus Pilotenzahl berechnet (z.B. 8 Piloten → 2 Runden, 32 Piloten → 4 Runden)
   - Anzahl der Heats pro Runde wird dynamisch ermittelt
   - Funktioniert für **8-60 Piloten** (MVP-Bereich)

2. **Dynamische SVG-Linien**
   - Linien werden basierend auf **DOM-Positionen der Heat-Boxen** berechnet
   - Keine hardcodierten Koordinaten wie im Mockup
   - Neuberechnung bei Fenstergrößenänderung (Resize-Handler)
   - Korrekte Verbindungen auch bei unterschiedlichen Rundenzahlen

3. **Dynamische Layout-Berechnung**
   - Heat-Box-Breiten und -Abstände passen sich der Anzahl an
   - Container-Höhe wächst mit Rundenzahl
   - Bracket-Header-Breite entspricht der Breite aller Runde-1-Heats

4. **Dynamische Daten**
   - Pilotennamen, Avatare, Rankings aus Store
   - Heat-Status (abgeschlossen/offen) aus Store
   - Platzierungen aus Store nach Heat-Abschluss

5. **Skalierbarkeit**
   - 8 Piloten: 2 Quali-Heats → 1 WB-Runde → Finale
   - 16 Piloten: 4 Quali-Heats → 2 WB-Runden → Finale
   - 32 Piloten: 8 Quali-Heats → 3 WB-Runden → Finale
   - 60 Piloten: 15 Quali-Heats → 4 WB-Runden → Finale

#### Mögliche User Stories (zur Verfeinerung mit SM)

| ID | Titel | Priorität | Beschreibung |
|----|-------|-----------|--------------|
| US-12.1 | Runden-basierte Bracket-Struktur | HIGH | Logik für definierte Runden statt dynamischer Pools |
| US-12.2 | Runden-Progression Winner Bracket | HIGH | Platz 1+2 → nächste WB-Runde, Platz 3+4 → LB |
| US-12.3 | Runden-Progression Loser Bracket | HIGH | Platz 1+2 → nächste LB-Runde, Platz 3+4 → eliminiert |
| US-12.4 | Pool als Fallback-Mechanismus | MEDIUM | Pool nur für Rest-Piloten wenn nicht durch 4 teilbar |
| US-12.5 | Vertikales Layout Winner Bracket | HIGH | WB links, Runden von oben nach unten |
| US-12.6 | Vertikales Layout Loser Bracket | HIGH | LB rechts, Runden von oben nach unten |
| US-12.7 | Bracket Headers (volle Breite) | MEDIUM | "WINNER BRACKET"/"LOSER BRACKET" über alle Heats |
| US-12.8 | Round Labels (im Freiraum) | LOW | Runden-Bezeichnungen zwischen den Heat-Reihen |
| US-12.9 | SVG-Linien für vertikales Layout | MEDIUM | Linien aus Mitte-unten, ~20px runter, dann horizontal |
| US-12.10 | Grand Finale Positionierung & Linien | MEDIUM | Grand Finale unten-mittig, goldene Verbindungslinien |
| US-12.11 | Test-Migration | HIGH | Bestehende Tests an neue Logik anpassen |

#### Geschätzter Aufwand

| Bereich | Aufwand |
|---------|---------|
| Logik-Redesign (Runden-basiert) | 3-5 Tage |
| Visualisierung (Vertikales Layout) | 2-3 Tage |
| SVG-Verbindungslinien (vertikal) | 1-2 Tage |
| Bracket Headers & Round Labels | 0.5-1 Tag |
| Tests anpassen | 2-3 Tage |
| Integration & Debug | 1-2 Tage |
| **GESAMT** | **9-16 Tage** |

#### Abhängigkeiten

- **Epic 11 (Unified Bracket Tree)** kann parallel oder danach erfolgen – einige UI-Konzepte überschneiden sich
- **Epic 9 (LB Pooling)** wird durch dieses Epic teilweise ersetzt (Pool wird sekundär)
- **Epic 10 (Code-Konsolidierung)** sollte idealerweise vorher abgeschlossen sein

#### Risiken

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| Bestehende Tests brechen | Hoch | Inkrementelle Migration, Feature-Flag |
| Komplexität unterschätzt | Mittel | Früher Prototyp der Logik |
| Edge Cases bei ungeraden Pilotenzahlen | Mittel | Extensive Tests mit 7, 9, 11, 15 Piloten |

**FRs covered:** FR14, FR15, FR17, FR18, FR20, FR21 – Redesign  
**Stories:** US-12.1 bis US-12.11 (11 Stories geschätzt)  
**MVP:** ⚠️ Should – Fundamentales UX/Logik-Upgrade

---

## Epics-Übersicht

| Epic | Beschreibung | FRs | MVP? | Stories |
|------|--------------|-----|------|---------|
| **Epic 1** | Piloten-Verwaltung | FR1-5 | ✅ Must | 3 |
| **Epic 2** | Synthwave Visual Design | FR36 | ✅ Must | 3 |
| **Epic 3** | Turnier-Setup & Heat-Aufteilung | FR6-10 | ✅ Must | 3 |
| **Epic 4** | Heat-Durchführung & Bracket | FR11-21 | ✅ Must | 5 |
| **Epic 5** | Finale & Siegerehrung | FR22-25 | ✅ Must | 1 |
| **Epic 6** | Navigation & Beamer-Optimierung | FR26-31 | ✅ Must | 2 |
| **Epic 7** | Offline & Persistenz + Reset | FR32-35 | ✅ Must | 1 |
| **Epic 8** | Zeiterfassung | FR37-40 | ❌ Growth | 2 |
| **Epic 9** | Loser Bracket Pooling | CP-LB | ✅ Must | 3 |
| **Epic 10** | Code-Konsolidierung (Refactoring) | Tech Debt | ⚠️ Should | 3 |
| **Epic 11** | Unified Bracket Tree Visualisierung | FR20, FR27+ | ⚠️ Should | 7 |
| **Epic 12** | Klassisches Turnierbaum-System (Vertical Bracket Redesign) | FR14-21 | ⚠️ Should | 11 |

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
5. **Sprint 5:** Epic 10 (Refactoring) + Epic 11 (Unified Bracket Tree) – UX Enhancement
6. **Sprint 6:** Epic 12 (Klassisches Turnierbaum-System) – Fundamentales Redesign
