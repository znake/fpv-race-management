# Epic 11: Unified Bracket Tree Visualisierung

**Status:** ready
**Created:** 2025-12-28
**Author:** PM (John)
**Mockup:** [bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)

## Vision

Das aktuelle Bracket-Layout mit getrennten Sections (WB/LB/Grand Finale) wird durch einen **zusammenhängenden visuellen Turnierbaum** ersetzt. Alle Heats werden in einer horizontalen Baumstruktur dargestellt, verbunden durch farbcodierte SVG-Linien, die den Turnierfluss zeigen.

**Kernziel:** Zuschauer (auf Beamer) verstehen auf einen Blick:
- Wer fliegt gegen wen?
- Wohin führt dieser Heat?
- Wer kommt weiter, wer ist raus?

## IST-Zustand (Aktuell)

Die aktuelle Implementierung hat **getrennte Bereiche**:
- Qualifikationsbereich (initiale Heats)
- Winner Bracket Section (eigener Container mit grünem Border)
- Loser Bracket Section (eigener Container mit rotem Border)
- Grand Finale Section (eigener Container mit goldenem Border)

**Probleme:**
- Kein visueller Zusammenhang zwischen den Heats
- Keine Verbindungslinien zeigen den Flow
- Zuschauer müssen mental den Zusammenhang herstellen

## SOLL-Zustand (Mockup)

### 1. Zusammenhängende Baumstruktur
- Alle Heats (WB + LB + Grand Finale) in EINEM zusammenhängenden Baum
- Keine getrennten Sections mehr
- Horizontales Layout: Pools → Runde 1 → Finale → Grand Finale

### 2. SVG Verbindungslinien
- **Grüne Linien** für Winner Bracket Verbindungen (mit Glow-Effekt)
- **Rote Linien** für Loser Bracket Verbindungen (mit Glow-Effekt)
- **Goldene Linien** für Verbindungen zum Grand Finale (dicker, mit Glow)

### 3. Farbcodierung der Platzierungen
- **Platz 1 + 2**: Grüner Hintergrund + grüner linker Border (Weiterkommer)
- **Platz 3 + 4**: Roter Hintergrund + roter linker Border (Eliminiert/zum LB)

### 4. Heat-Status Indikatoren
- **Checkmark (✓)** bei abgeschlossenen Heats
- Kein Badge bei noch nicht abgeschlossenen Heats (visuell neutral)

### 5. Pool-Positionierung
- WB Pool: Mittig zwischen Winner Bracket Heats (Runde 1)
- LB Pool: Mittig zwischen Loser Bracket Heats (Runde 1)
- Gestrichelte Border (dashed)

### 6. Grand Finale Herkunfts-Tags
- Piloten zeigen "WB" (grün) oder "LB" (rot) Tag

### 7. Legende
- Erklärt alle Farbcodierungen für Zuschauer

## User Stories

| ID | Titel | Status | Story Points |
|----|-------|--------|--------------|
| 11-1 | Unified Layout Container | ready | 8 (L) |
| 11-2 | SVG Verbindungslinien | ready | 5 (M) |
| 11-3 | Platzierungs-Farbcodierung | ready | 3 (S) |
| 11-4 | Heat-Status Indikatoren (✓ für abgeschlossen) | ready | 2 (XS) |
| 11-5 | Pool-Visualisierung | ready | 3 (S) |
| 11-6 | Grand Finale Tags | ready | 3 (S) |
| 11-7 | Legende | ready | 2 (XS) |

**Gesamt:** 26 Story Points

## Abhängigkeiten

- **Epic 9 (LB Pooling)** muss abgeschlossen sein für korrekte Pool-Darstellung
- **Epic 4 (Heat-Durchführung)** liefert die Daten für Status-Indikatoren

## Technische Risiken

1. **Performance:** SVG mit vielen Linien + Glow-Effekte kann bei älteren Geräten/Beamern ruckeln
2. **Responsiveness:** Horizontales Layout braucht Minimum-Breite – auf Tablets kritisch
3. **Komplexität:** Dynamische Liniengenerierung basierend auf Bracket-Struktur ist nicht trivial

## Betroffene Dateien (geschätzt)

| Datei | Änderung |
|-------|----------|
| `src/components/bracket/BracketTree.tsx` | Kompletter Umbau zu unified Layout |
| `src/components/bracket/SVGConnectorLines.tsx` | NEU: SVG-Linien Komponente |
| `src/components/bracket/heat-boxes/*` | Anpassung für Platzierungs-Farbcodierung |
| `src/components/bracket/BracketLegend.tsx` | NEU: Legende Komponente |
| `src/globals.css` | CSS-Variablen für Glow-Effekte |

## Definition of Done (Epic-Level)

- [ ] Alle 7 User Stories implementiert und getestet
- [ ] Visuell identisch zum Mockup (`bracket-tree-mockup.html`)
- [ ] Performance auf Beamer-Laptop getestet
- [ ] Funktioniert für 8-60 Piloten (verschiedene Bracket-Größen)
- [ ] Horizontales Scrolling auf kleineren Bildschirmen
