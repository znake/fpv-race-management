---
title: 'Vertikales Bracket-Layout'
slug: 'vertikales-bracket-layout'
created: '2026-01-10'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - React 18.3.1
  - TypeScript
  - Tailwind CSS 3.4 mit Custom Synthwave-Theme
  - Zustand für State Management
  - SVG für Connector-Linien (ConnectorManager Klasse)
  - Vitest + React Testing Library
files_to_modify:
  - src/components/bracket/BracketTree.tsx (Haupt-Layout umstrukturieren)
  - src/components/bracket/sections/WinnerBracketSection.tsx (vertikal statt horizontal)
  - src/components/bracket/sections/LoserBracketSection.tsx (vertikal statt horizontal)
  - src/components/bracket/SVGConnectorLines.tsx (Pfad-Berechnung anpassen)
  - src/lib/svg-connector-manager.ts (createPath für vertikalen Flow)
  - src/lib/bracket-layout-calculator.ts (neue Höhen-Berechnungen)
  - src/globals.css (Layout-Klassen anpassen)
  - src/components/bracket/sections/GrandFinaleSection.tsx (Position unten-mittig)
code_patterns:
  - Flexbox mit flex-direction column für vertikalen Flow
  - CSS Variables (--heat-width: 140px, --gap: 10px, etc.)
  - SVG path mit M/L Befehlen für Verbindungslinien
  - ConnectorManager Klasse für zentrale Linien-Verwaltung
  - Refs für DOM-Positionsberechnung
  - data-testid für Testing
test_patterns:
  - Vitest + React Testing Library
  - Mock von useTournamentStore
  - Layout-Tests mit data-testid Attributen
  - Test verschiedener Pilot-Anzahlen (7-60)
---

# Tech-Spec: Vertikales Bracket-Layout

**Created:** 2026-01-10

## Overview

### Problem Statement

Die aktuelle Bracket-Darstellung ist horizontal aufgebaut (Spalten von links nach rechts: Pools → Heats → Finals → Grand Finale). Das entspricht nicht dem gewünschten Design aus dem Mockup, das ein vertikales Layout zeigt - Runden fließen von oben nach unten wie eine umgedrehte Pyramide.

### Referenz-Mockup (F1 Fix)

**Datei:** `_bmad-output/planning-artifacts/design/bracket-tree-dynamic-svg.html`

Öffne lokal im Browser für das Ziel-Layout. Key Design-Elemente:
- Quali: 8 Heats horizontal oben
- WB links (590px breit): 4 Heats R1 → 2 Heats R2 → 1 Finale (vertikal gestapelt)
- LB rechts (890px breit): 6→4→3→2→1 Heats (vertikal gestapelt, Pool-Indicators)
- Grand Finale: mittig unten, 180px breit
- SVG-Linien: grün für WB (#39ff14, 2px, 0.7 opacity), gold für GF (#f9c80e, 3px, 0.8 opacity)

### Solution

Umstellung des Bracket-Layouts von horizontal auf vertikal:
- Quali-Section bleibt oben (horizontal, bereits korrekt)
- WB und LB werden nebeneinander (side-by-side) dargestellt, aber intern vertikal (Runden fließen nach unten)
- Grand Finale wird mittig unten positioniert
- SVG-Verbindungslinien werden vertikal gezeichnet (von Runde zu Runde nach unten)
- Pools-Spalte wird aus der visuellen Darstellung entfernt

### Scope

**In Scope:**
- Layout-Umstellung WB/LB von horizontal auf vertikal
- SVG-Connector-Logik anpassen (vertikal statt horizontal)
- Responsive für variable Pilot-Anzahlen (7-60 Piloten)
- Grand Finale Position anpassen (mittig unten)
- Entfernung der visuellen Pool-Darstellung

**Out of Scope:**
- Änderungen an der Turnier-Logik (Pools, Heat-Generierung)
- Quali-Section Layout (bleibt horizontal wie sie ist)
- Pool-Logik im Store (bleibt erhalten, nur UI-Darstellung entfernt)
- Heat-Box Design (bleibt wie es ist)

## Context for Development

### Codebase Patterns

**Aktuelles Layout (horizontal):**
- `BracketTree.tsx` nutzt `flex items-stretch gap-0` für horizontalen Flow
- Spalten: Pools → Heats → Connector → Finals → Grand Finale
- WB oben, LB unten mit `bracket-spacer` dazwischen
- SVG-Linien gehen von rechts (bottom) nach links (top) der Heat-Boxen

**Komponenten-Struktur:**
- `BracketTree.tsx` - Haupt-Container (~550 Zeilen)
- `WinnerBracketSection.tsx` - Rendert WB-Runden mit `round-section` und `round-heats`
- `LoserBracketSection.tsx` - Rendert LB-Runden mit Pool-Indicators statt SVG-Linien
- `SVGConnectorLines.tsx` - Wrapper für ConnectorManager
- `ConnectorManager` (Klasse) - Erstellt SVG paths mit `createPath()`

**CSS-Klassen (globals.css):**
- `.bracket-tree` - `display: flex; align-items: stretch;`
- `.bracket-column` - `display: flex; flex-direction: column;`
- `.round-section` - `display: flex; flex-direction: column; align-items: center;`
- `.round-heats` - `display: flex; gap: 10px; justify-content: center;`
- `.connector-space` - `height: 40px;` (Platz für SVG-Linien)

**SVG-Pfad-Logik (aktuell horizontal):**
```typescript
// In svg-connector-manager.ts createPath():
// Start: from.centerX, from.bottom
// End: to.centerX, to.top
// Pfad: vertikal → horizontal → vertikal
const d = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`
```

### Files to Reference

| File | Purpose | Änderungen nötig |
| ---- | ------- | ---------------- |
| `_bmad-output/planning-artifacts/design/bracket-tree-dynamic-svg.html` | Mockup mit Ziel-Layout | Referenz |
| `src/components/bracket/BracketTree.tsx` | Haupt-Container | Layout umstrukturieren |
| `src/components/bracket/sections/WinnerBracketSection.tsx` | WB-Runden | flex-direction ändern |
| `src/components/bracket/sections/LoserBracketSection.tsx` | LB-Runden | flex-direction ändern |
| `src/components/bracket/SVGConnectorLines.tsx` | SVG-Wrapper | Minor (Pfade kommen von Manager) |
| `src/lib/svg-connector-manager.ts` | ConnectorManager Klasse | createPath() anpassen |
| `src/lib/bracket-layout-calculator.ts` | Layout-Berechnungen | Höhen statt Breiten |
| `src/globals.css` | CSS-Klassen | .bracket-tree, .bracket-column etc. |
| `src/components/bracket/sections/GrandFinaleSection.tsx` | GF-Position | Position unten-mittig |
| `src/components/bracket/PoolDisplay.tsx` | Pool-Visualisierung | Entfernen aus BracketTree |

### Technical Decisions

1. **Layout-Strategie:** 
   - `BracketTree.tsx`: Wechsel von `flex` (horizontal) zu `flex-col` (vertikal)
   - WB und LB nebeneinander (`flex-row`), aber intern vertikal (`flex-col`)
   - Runden stapeln sich von oben nach unten

2. **SVG-Linien Anpassung:**
   - `createPath()` muss für vertikalen Flow angepasst werden
   - Start: unten-mitte der Source-Heat → Ende: oben-mitte der Target-Heat
   - Bei WB: Linien von R1 → R2 → Finale (nach unten)
   - LB bleibt ohne SVG-Linien (Pool-Indicators)

3. **Pool-Handling Klarstellung (F14 Fix):**
   - **ENTFERNT:** `PoolDisplay` Komponente (WB Pool, LB Pool Visualisierung in `BracketTree.tsx`)
   - **BLEIBT:** Pool-Indicators im LB (Text zwischen Runden: "↓ 12 Piloten weiter + 4 WB Verlierer = 16 Piloten → Neu gemischt")
   - **BLEIBT:** Pool-Logik im Store (`loserPool`, `winnerPilots` für Heat-Generierung)
   - Unterschied: `PoolDisplay` = visuelle Box mit Piloten-Avataren | Pool-Indicators = Text-Zeile zwischen LB-Runden

4. **Grand Finale Position:**
   - Unter WB und LB, horizontal zentriert
   - Berechnung: Mittelpunkt zwischen WB-Finale und LB-Finale X-Positionen

5. **Responsive für 7-60 Piloten:**
   - Breite dynamisch basierend auf max Heats pro Runde
   - Höhe wächst mit Anzahl Runden
   - Horizontales Scrolling bei vielen Heats pro Runde

## Implementation Plan

### Task-Reihenfolge und Dependencies (F8 Fix)

```
Task 1 (CSS) ─────────────────────────────────────────┐
                                                      │
Task 2 (BracketTree) ─── depends on Task 1 ───────────┤
        │                                             │
        ├── Task 3 (WB Section) ── depends on Task 2  │
        │                                             │
        ├── Task 4 (LB Section) ── depends on Task 2  │
        │                                             │
        └── Task 6 (GF Section) ── depends on Task 2  │
                                                      │
Task 5 (SVG Verify) ── independent, parallel möglich ─┤
                                                      │
Task 7 (Calculator Verify) ── independent ────────────┤
                                                      │
Task 8 (Tests) ── depends on Tasks 1-6 ───────────────┘
```

**Empfohlene Reihenfolge:** 1 → 2 → (3,4,6 parallel) → 5 → 7 → 8

### Tasks

#### Task 1: CSS-Klassen für vertikales Layout anpassen
- **File:** `src/globals.css`
- **Action:** 
  - `.bracket-tree` von `display: flex` auf `display: flex; flex-direction: column;` ändern
  - Neue Klasse `.bracket-columns-wrapper` für WB+LB nebeneinander: `display: flex; flex-direction: row; gap: 40px;`
  - `.bracket-column` behält `flex-direction: column` (bereits korrekt)
  - `.connector-space` Höhe beibehalten (40px für SVG-Linien zwischen Runden)
- **Notes:** CSS-Änderungen zuerst, damit nachfolgende Komponenten-Änderungen sofort sichtbar sind

#### Task 2: BracketTree.tsx Layout umstrukturieren (F4 Fix - robuste Referenzen)
- **File:** `src/components/bracket/BracketTree.tsx`
- **Action:**
  - **Entferne:** `<div className="pools-column">` Block (suche nach `pools-column` Klasse)
  - **Entferne:** `<PoolDisplay` Komponenten-Aufrufe (3x: WB Pool, LB Pool, GF Pool)
  - **Entferne:** `heats-column`, `connector-column`, `finals-column` Wrapper
  - **Hinzufüge:** `<div className="bracket-columns-wrapper">` um WinnerBracketSection + LoserBracketSection
  - **Behalte:** GrandFinaleSection (verschiebe unter `bracket-columns-wrapper`)
  - **Behalte:** `winnerPool`, `loserPool` State-Variablen (werden für Heat-Generierung genutzt)
  - **Entferne:** `import { PoolDisplay } from './PoolDisplay'`
- **Struktur nach Änderung:**
  ```tsx
  <div className="bracket-tree">
    {/* Quali Section bleibt */}
    {renderQualificationSection()}
    
    {/* NEU: WB + LB nebeneinander */}
    <div className="bracket-columns-wrapper">
      <WinnerBracketSection ... />
      <LoserBracketSection ... />
    </div>
    
    {/* Grand Finale darunter */}
    <GrandFinaleSection ... />
  </div>
  ```

#### Task 3: WinnerBracketSection für vertikales Layout anpassen (F13 Fix - konkret)
- **File:** `src/components/bracket/sections/WinnerBracketSection.tsx`
- **Action:**
  - **BEHALTEN:** Container `.bracket-column.wb` mit `flex-direction: column` (bereits korrekt)
  - **BEHALTEN:** `calculateColumnWidth()` Funktion - wird weiterhin für Breite der WB-Column genutzt
  - **ENTFERNEN:** Inline `style={{ width: ... }}` wenn vorhanden - CSS übernimmt
  - **PRÜFEN:** `round-heats` hat `display: flex; gap: 10px;` für horizontale Heats
  - **PRÜFEN:** `connector-space` zwischen Runden ist vorhanden (40px Höhe für SVG-Linien)
- **Notes:** 
  - Die Section ist bereits größtenteils korrekt strukturiert (Runden vertikal, Heats horizontal)
  - Nur Container-Breite muss ggf. von fixed auf auto geändert werden

#### Task 4: LoserBracketSection für vertikales Layout anpassen
- **File:** `src/components/bracket/sections/LoserBracketSection.tsx`
- **Action:**
  - Analog zu WinnerBracketSection anpassen
  - Pool-Indicators bleiben (statt SVG-Linien)
  - `calculateLBColumnWidth` Logik prüfen
- **Notes:** LB hat keine SVG-Linien, nur Text-basierte Pool-Indicators zwischen Runden

#### Task 5: SVG ConnectorManager verifizieren (F2 Fix)
- **File:** `src/lib/svg-connector-manager.ts`
- **Action:**
  - **VERIFIZIERT:** Die aktuelle `createPath()` Logik funktioniert bereits für vertikalen Flow:
    ```typescript
    // Aktueller Code (Zeile 166-177):
    const startX = from.centerX
    const startY = from.bottom  // Start: unten-mitte Source
    const endX = to.centerX
    const endY = to.top         // Ende: oben-mitte Target
    const midY = startY + (endY - startY) / 2
    const d = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`
    ```
  - **Keine Änderung nötig** - Pfad geht von bottom→top, funktioniert für vertikalen Flow
  - SVG-Styling bleibt: WB grün (#39ff14, 2px, 0.7 opacity), GF gold (#f9c80e, 3px, 0.8 opacity)
- **Notes:** Task verifiziert - nur testen dass Linien nach Layout-Änderung korrekt gerendert werden

#### Task 6: GrandFinaleSection Position anpassen
- **File:** `src/components/bracket/sections/GrandFinaleSection.tsx`
- **Action:**
  - Position: unter WB und LB, horizontal zentriert
  - `positionGrandFinale()` Funktion anpassen für neue Layout-Struktur
  - Mittelpunkt-Berechnung basierend auf WB-Column und LB-Column Breiten
- **Notes:** 
  - Aktuell berechnet die Funktion den Mittelpunkt zwischen WB-Finale und LB-Finale
  - Bei vertikalem Layout muss die Y-Position nicht mehr dynamisch sein (ist automatisch unten)

#### Task 7: bracket-layout-calculator.ts erweitern (F3 Fix - Scope definiert)
- **File:** `src/lib/bracket-layout-calculator.ts`
- **Action:**
  - **NICHT NÖTIG:** Keine `calculateBracketHeight()` Funktion - CSS Flexbox handled die Höhe automatisch
  - **BEHALTEN:** Bestehende Breiten-Funktionen (`calculateColumnWidth`, `calculateLBColumnWidth`) für horizontale Heat-Anordnung pro Runde
  - **PRÜFEN:** `BRACKET_CONSTANTS` Werte stimmen mit Mockup überein:
    - `HEAT_WIDTH: 140` ✓
    - `HEAT_WIDTH_3: 120` ✓
    - `GAP: 10` ✓
    - `CONNECTOR_HEIGHT: 40` ✓
    - `COLUMN_GAP: 40` ✓
- **Notes:** Task reduziert auf Verification - keine Code-Änderungen nötig

#### Task 8: Tests anpassen (F5 Fix - konkrete Änderungen)
- **Files und konkrete Änderungen:**

  **`tests/bracket-responsive.test.tsx`:**
  - Entferne/Anpasse: Tests für `pools-column` Element
  - Anpasse: `bracket-tree` Assertions von horizontal auf vertikal
  - Prüfe: `data-testid="winner-bracket-section"` und `data-testid="loser-bracket-section"` nebeneinander

  **`tests/dynamic-bracket-viz.test.tsx`:**
  - Entferne: Tests die `PoolDisplay` oder `pool-display-*` selektieren
  - Behalte: Heat-Box Rendering Tests
  - Anpasse: Layout-Struktur Assertions

  **`tests/unified-layout.test.tsx`:**
  - Entferne: Tests für `pools-column`, `heats-column`, `finals-column`
  - Hinzufüge: Test für `bracket-columns-wrapper` enthält WB und LB
  - Anpasse: Grand Finale Position Test (unter WB/LB statt rechts davon)

- **Neue Test-Assertions hinzufügen:**
  ```typescript
  // Vertikales Layout verifizieren
  expect(screen.getByTestId('bracket-columns-wrapper')).toBeInTheDocument()
  expect(screen.getByTestId('winner-bracket-section')).toBeInTheDocument()
  expect(screen.getByTestId('loser-bracket-section')).toBeInTheDocument()
  // Pool-Display sollte NICHT mehr existieren
  expect(screen.queryByTestId('pool-display-compact')).not.toBeInTheDocument()
  ```

### Acceptance Criteria

- [ ] **AC1:** Given das Bracket-Tree wird gerendert, when der User die Seite lädt, then sind Quali-Heats oben horizontal, WB und LB darunter nebeneinander (vertikal aufgebaut), und Grand Finale ganz unten mittig.

- [ ] **AC2:** Given WB-Heats existieren, when das Bracket angezeigt wird, then sind die WB-Runden vertikal gestapelt (R1 oben, R2 darunter, Finale unten) mit Heats horizontal pro Runde.

- [ ] **AC3:** Given LB-Heats existieren, when das Bracket angezeigt wird, then sind die LB-Runden vertikal gestapelt mit Pool-Indicators zwischen den Runden.

- [ ] **AC4:** Given WB-Heats sind completed, when SVG-Linien gerendert werden, then verbinden grüne Linien die Heats vertikal von oben nach unten (Source-Bottom → Target-Top).

- [ ] **AC5:** Given WB-Finale und LB-Finale sind completed, when das Grand Finale angezeigt wird, then ist es horizontal zentriert unter beiden Brackets mit goldenen SVG-Linien von beiden Finales.

- [ ] **AC6:** Given das neue Layout, when PoolDisplay-Komponenten gesucht werden, then sind keine Pool-Visualisierungen mehr im Bracket sichtbar.

- [ ] **AC7:** Given 7 Piloten im Turnier, when das Bracket gerendert wird, then:
  - Quali: 2 Heats (1×4 + 1×3 Piloten)
  - WB: 1 Heat R1 → 1 Finale
  - LB: 1-2 Heats pro Runde
  - Minimum Container-Breite: 400px (WB 200px + Gap 40px + LB 200px)
  - Heat-Boxen behalten Mindestgröße 140px (4-Pilot) bzw. 120px (3-Pilot)

- [ ] **AC8:** Given 60 Piloten im Turnier, when das Bracket gerendert wird, then:
  - Quali: 15 Heats (horizontal scrollbar wenn >8)
  - WB: 8 Heats R1 → 4 R2 → 2 R3 → 1 Finale
  - LB: bis zu 10 Heats pro Runde
  - Horizontales Scrolling aktiviert wenn Container-Breite >1400px
  - Vertikales Scrolling für alle Runden

- [ ] **AC9:** Given das vertikale Layout, when der User scrollt, then funktioniert vertikales Scrolling durch alle Runden bis zum Grand Finale.

## Additional Context

### Dependencies

- Keine neuen Dependencies erforderlich
- Bestehende SVG-Logik wird angepasst, nicht ersetzt
- Zustand Store bleibt unverändert
- Pool-Logik im Store bleibt vollständig erhalten (nur UI-Darstellung entfällt)

### Testing Strategy

**Unit-Tests:**
- SVG-Koordinatenberechnung in `svg-connector-manager.ts` (createPath für vertikalen Flow)
- Layout-Calculator Funktionen (falls neue Höhen-Berechnungen)

**Integration-Tests:**
- Bracket-Rendering mit verschiedenen Pilot-Anzahlen (7, 16, 32, 60)
- SVG-Linien-Verbindungen zwischen WB-Heats
- Grand Finale Positionierung

**Manuelle Tests:**
- Visueller Vergleich mit HTML-Mockup
- Scrolling-Verhalten (vertikal durch Runden, horizontal bei vielen Heats)
- Zoom/Pan Funktionalität (sollte weiterhin funktionieren)

**Bestehende Tests anpassen:**
- `tests/bracket-responsive.test.tsx` - Layout-Assertions
- `tests/dynamic-bracket-viz.test.tsx` - Pool-Display Tests entfernen
- `tests/unified-layout.test.tsx` - Spalten-Layout Tests anpassen

### Notes

**Referenz-Mockup:**
- `_bmad-output/planning-artifacts/design/bracket-tree-dynamic-svg.html`
- Zeigt 32 Piloten als Beispiel für das Ziel-Layout
- WB links, LB rechts, beide vertikal aufgebaut
- Grand Finale mittig unten

**Bekannte Limitierungen:**
- Bei sehr vielen Heats pro Runde (>8) wird horizontales Scrolling nötig
- SVG-Linien werden bei extremen Zoom-Levels möglicherweise unscharf

**Risiken:**
- SVG-Linien könnten bei der Umstellung kurzzeitig falsch positioniert sein
- Tests könnten fehlschlagen bis Layout-Assertions angepasst sind

### Wichtige Erkenntnisse aus Investigation

1. **Pools sind aktiv im Code:**
   - `loserPool` wird im Store persistiert und für LB-Heat-Generierung genutzt
   - `winnerPool` wird dynamisch aus `winnerPilots` berechnet
   - Nur die **visuelle** PoolDisplay-Komponente wird entfernt

2. **SVG-Linien Architektur:**
   - `ConnectorManager` Klasse verwaltet alle Connections
   - `createPath()` erstellt SVG-Pfade mit M/L Befehlen
   - Pfade gehen aktuell: `from.bottom` → `to.top` (sollte für vertikalen Flow bereits passen)
   - Keine Änderung der Pfad-Richtung nötig, nur Layout-Container ändern sich

3. **CSS-Struktur:**
   - `.bracket-tree` ist der Haupt-Container (aktuell `display: flex` horizontal)
   - `.bracket-column.wb` und `.bracket-column.lb` sind die Bracket-Spalten (bereits vertikal)
   - `.round-heats` enthält die Heats einer Runde (horizontal) - bleibt so
   - `.connector-space` ist Platzhalter für SVG-Linien zwischen Runden - bleibt so

4. **Betroffene Test-Files:**
   - `tests/bracket-responsive.test.tsx`
   - `tests/dynamic-bracket-viz.test.tsx`
   - `tests/unified-layout.test.tsx`
