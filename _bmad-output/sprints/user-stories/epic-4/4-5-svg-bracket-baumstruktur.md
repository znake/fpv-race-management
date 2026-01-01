# Story 4.5: SVG-Bracket-Baumstruktur mit Verbindungslinien

**Status:** ready  
**Created:** 2025-12-28  
**Priority:** High  
**Estimated Effort:** M (Medium)

## Story

**Als ein** Zuschauer, Pilot oder Organisator (Lisa, Familie Huber, Thomas),  
**möchte ich** das Bracket als klassische seitliche Baumstruktur mit SVG-Verbindungslinien sehen,  
**so dass** ich auf einen Blick verstehe, welche Piloten aus welchen Heats wohin weiterkommen und wie das Turnier aufgebaut ist.

## Problem Statement

### Aktueller Zustand
Die Bracket-Visualisierung zeigt aktuell nur separate HeatBoxen in vertikalen Listen, ohne visuelle Verbindung zwischen zusammenhängenden Heats. Es fehlt:
- Die klassische horizontale Baumstruktur (wie bei Esports-Turnieren)
- SVG-Linien die zeigen, welche Gewinner/Verlierer wohin fließen
- Visuelle Klarheit über die Turnierprogression

### Gewünschter Zustand
Eine echte Bracket-Baumstruktur, bei der:
- Heats horizontal von links nach rechts angeordnet sind (Quali → Finale)
- SVG-Linien die Pfade der Piloten durch das Turnier zeigen (erst nach Heat-Abschluss)
- Winner- und Loser-Pfade visuell klar unterscheidbar sind
- Der Baum dynamisch wächst wenn Heats abgeschlossen werden

### Design-Entscheidungen

| Aspekt | Entscheidung |
|--------|--------------|
| **Pools** | Werden wie HeatBoxen dargestellt (Label: "Winner Pool" / "Loser Pool"), keine Verbindungslinien zu Pools |
| **Linien-Timing** | Linien werden erst erstellt wenn Heats abgeschlossen sind – der Baum wächst dynamisch mit dem Turnier |
| **Vorschau-Linien** | Keine gestrichelten Linien zu noch nicht existierenden Heats |

## Acceptance Criteria

### AC 1: Horizontale Baumstruktur

**Given** ein Turnier wurde gestartet  
**When** ich den Bracket-Tab öffne  
**Then** sehe ich eine horizontale Baumstruktur:
- Linke Seite: Frühere Runden (Quali-Heats)
- Rechte Seite: Spätere Runden (Finale)
- Heats einer Runde sind vertikal untereinander angeordnet
- Runden sind horizontal nebeneinander angeordnet

### AC 2: SVG-Verbindungslinien zwischen abgeschlossenen Heats

**Given** ich betrachte das Bracket  
**When** ein Heat abgeschlossen wurde und Piloten in einen Folge-Heat weitergekommen sind  
**Then** sehe ich eine SVG-Linie die beide Heats verbindet
**And** die Linie zeigt klar die Richtung der Progression (von links nach rechts)
**And** die Linien überlappen sich nicht mit HeatBoxen oder anderen Linien
**And** es gibt KEINE Linien zu noch nicht existierenden Heats (kein "Vorschau"-Modus)

### AC 3: Winner-Bracket Pfadvisualisierung

**Given** ich betrachte das Winner-Bracket  
**When** ein Pilot von einem WB-Heat zum nächsten WB-Heat weiterkommt  
**Then** sehe ich eine grüne/cyan SVG-Linie die den Pfad zeigt
**And** die Linie verbindet die Position des Piloten im ersten Heat mit dem Ziel-Heat
**And** bei abgeschlossenen Heats wird der Pfad des Gewinners hervorgehoben

### AC 4: Loser-Bracket Pfadvisualisierung

**Given** ich betrachte das Loser-Bracket  
**When** ein Pilot vom WB ins LB wechselt oder im LB weiterkommt  
**Then** sehe ich eine rot/pink SVG-Linie die den Pfad zeigt
**And** Piloten die vom WB ins LB fallen haben eine "Abstieg"-Linie
**And** Piloten die im LB weiterkommen haben eine Progressions-Linie

### AC 5: Grand Finale Verbindung

**Given** das Turnier nähert sich dem Ende  
**When** WB-Finale und LB-Finale Gewinner feststehen  
**Then** sehe ich zwei goldene SVG-Linien die zum Grand Finale führen
**And** die Linien sind prominent (dicker, mit Glow)
**And** "WB Champion" und "LB Champion" Labels sind sichtbar

### AC 6: Farbcodierung der Linien

**Given** ich betrachte die SVG-Linien  
**When** verschiedene Bracket-Typen dargestellt werden  
**Then** haben die Linien folgende Farben:
- **Quali → WB Pool:** Cyan (#05d9e8)
- **Quali → LB Pool:** Pink (#ff2a6d)
- **WB-intern:** Grün (#39ff14)
- **LB-intern:** Rot/Pink (#ff073a)
- **→ Grand Finale:** Gold (#f9c80e)

### AC 7: Animierte Linien bei Heat-Abschluss

**Given** ein Heat wird abgeschlossen  
**When** Piloten in den nächsten Heat weitergeleitet werden  
**Then** animiert sich die entsprechende SVG-Linie kurz (Glow-Pulse)
**And** die Animation dauert 300-500ms
**And** die Animation ist dezent und nicht ablenkend

### AC 8: Responsive Skalierung

**Given** das Bracket wird auf verschiedenen Bildschirmgrößen angezeigt  
**When** das Bracket größer als der Viewport ist  
**Then** kann ich horizontal scrollen
**And** SVG-Linien skalieren proportional mit den HeatBoxen
**And** Linien bleiben scharf (Vektor-basiert, kein Pixeln)
**And** auf 1920x1080 (Beamer) ist alles gut lesbar

### AC 9: Pool-Darstellung (keine Linien)

**Given** ich betrachte das Bracket  
**When** Pools (Winner Pool, Loser Pool) Piloten enthalten  
**Then** werden die Pools wie HeatBoxen dargestellt mit Label "Winner Pool" / "Loser Pool"
**And** es gibt KEINE SVG-Linien die zu oder von Pools führen
**And** Pools sind visuell klar als "Wartebereiche" erkennbar (z.B. gestrichelter Rahmen)

## Visual Reference

### Zielvisualisierung (nach mehreren abgeschlossenen Heats)

```
                    WINNER BRACKET
    ┌─────────┐
    │ QUALI 1 │────────┐
    │    ✓    │        │
    └─────────┘        │
                       ├────┐
    ┌─────────┐        │    │
    │ QUALI 2 │────────┘    │
    │    ✓    │              │      ┌─────────┐
    └─────────┘              ├──────│  WB-3   │────────┐
                             │      │    ✓    │        │
    ┌─────────┐              │      └─────────┘        │
    │ QUALI 3 │────────┐     │                         │
    │    ✓    │        │     │    ┌ ─ ─ ─ ─ ─ ┐       │
    └─────────┘        ├─────┘    │ WB POOL   │        │
                       │          │ (2 Piloten)│        │
    ┌─────────┐        │          └ ─ ─ ─ ─ ─ ┘        │
    │ QUALI 4 │────────┘                               │
    │    ✓    │                                        │
    └─────────┘                                        │     ┌───────────┐
                                                       ├─────│   GRAND   │
                                                       │     │  FINALE   │
                    LOSER BRACKET                      │     └───────────┘
                                                       │
    ┌ ─ ─ ─ ─ ─ ┐    ┌─────────┐      ┌─────────┐     │
    │ LB POOL   │    │  LB-1   │──────│LB FINALE│─────┘
    │ (3 Piloten)│    │    ✓    │      │         │
    └ ─ ─ ─ ─ ─ ┘    └─────────┘      └─────────┘

    ──────── = Cyan (Quali → WB)
    ──────── = Grün (WB-intern)
    ──────── = Pink/Rot (LB-intern)
    ════════ = Gold (→ Finale)
    ┌ ─ ─ ─ ┐ = Pool (keine Linien, gestrichelter Rahmen)
```

### Wichtig: Dynamisches Wachstum

Der Baum startet leer und wächst mit jedem abgeschlossenen Heat:

1. **Turnier-Start:** Nur Quali-HeatBoxen sichtbar, keine Linien
2. **Nach Quali 1:** Linie von Quali 1 → (noch kein Ziel, da WB-Heat noch nicht existiert)
3. **Nach allen Qualis:** Linien von Qualis → WB-Heats (sobald diese erstellt werden)
4. **Fortlaufend:** Jeder Heat-Abschluss fügt neue Linien hinzu

### Linien-Stil

```
Standard-Linie:
─────────────────────────
  stroke-width: 2px
  stroke: var(--color)
  stroke-linecap: round

Aktive/Hervorgehobene Linie:
═════════════════════════
  stroke-width: 3px
  stroke: var(--color)
  filter: drop-shadow(0 0 8px var(--color))

Finale-Linie:
═══════════════════════════
  stroke-width: 4px
  stroke: #f9c80e (Gold)
  filter: drop-shadow(0 0 12px rgba(249, 200, 14, 0.7))
```

## Technical Approach

### SVG-Linien-Berechnung

```typescript
interface BracketConnection {
  fromHeatId: string
  toHeatId: string
  fromPilotSlot: number  // 0-3 (Position im Quell-Heat)
  toPilotSlot: number    // 0-3 (Position im Ziel-Heat)
  type: 'quali-wb' | 'quali-lb' | 'wb' | 'lb' | 'finale'
  isActive: boolean      // Hervorgehoben wenn gerade benutzt
}

interface LineCoordinates {
  x1: number  // Start X (rechte Kante des Quell-Heats)
  y1: number  // Start Y (Position des Piloten)
  x2: number  // End X (linke Kante des Ziel-Heats)
  y2: number  // End Y (Position im Ziel)
}

// Berechnet Linien-Koordinaten basierend auf HeatBox-Positionen
function calculateLineCoordinates(
  fromHeatRect: DOMRect,
  toHeatRect: DOMRect,
  fromSlot: number,
  toSlot: number
): LineCoordinates {
  const slotHeight = fromHeatRect.height / 4  // 4 Piloten pro Heat
  
  return {
    x1: fromHeatRect.right,
    y1: fromHeatRect.top + (fromSlot + 0.5) * slotHeight,
    x2: toHeatRect.left,
    y2: toHeatRect.top + (toSlot + 0.5) * slotHeight
  }
}
```

### SVG-Pfad-Generierung

```typescript
// Generiert einen geschwungenen Pfad (Bezier-Kurve)
function generateBezierPath(line: LineCoordinates): string {
  const midX = (line.x1 + line.x2) / 2
  
  // Horizontale Bezier-Kurve für sanfte Verbindung
  return `M ${line.x1} ${line.y1} 
          C ${midX} ${line.y1}, 
            ${midX} ${line.y2}, 
            ${line.x2} ${line.y2}`
}

// Alternative: Rechtwinklige Verbindung (klassischer Bracket-Stil)
function generateElbowPath(line: LineCoordinates): string {
  const midX = (line.x1 + line.x2) / 2
  
  return `M ${line.x1} ${line.y1}
          H ${midX}
          V ${line.y2}
          H ${line.x2}`
}
```

### Komponenten-Struktur

```
src/components/bracket/
├── BracketTree.tsx           # Haupt-Container (erweitert)
├── svg/
│   ├── BracketSVGLayer.tsx   # SVG-Overlay für alle Linien
│   ├── BracketLine.tsx       # Einzelne Verbindungslinie
│   ├── useLineCalculation.ts # Hook für Koordinaten-Berechnung
│   └── lineStyles.ts         # Farb- und Stil-Definitionen
├── layout/
│   ├── HorizontalBracket.tsx # Neues horizontales Layout
│   └── BracketColumn.tsx     # Spalte für eine Runde
└── ...
```

## Tasks / Subtasks

### Phase 1: Layout-Umbau (Horizontal)

- [ ] Task 1: HorizontalBracket-Komponente erstellen (AC: 1)
  - [ ] Neues horizontales Layout mit CSS Grid/Flexbox
  - [ ] Runden als vertikale Spalten
  - [ ] Heats innerhalb einer Spalte vertikal gestapelt
  - [ ] Responsive Breite pro Spalte

- [ ] Task 2: BracketColumn-Komponente erstellen (AC: 1)
  - [ ] Props: `roundName`, `heats[]`, `bracketType`
  - [ ] Vertikale Anordnung der HeatBoxen
  - [ ] Gleiche Abstände zwischen Heats

### Phase 2: SVG-Linien-System

- [ ] Task 3: BracketSVGLayer erstellen (AC: 2)
  - [ ] SVG-Container über dem gesamten Bracket (position: absolute)
  - [ ] viewBox passt sich automatisch an Bracket-Größe an
  - [ ] Z-Index unter HeatBoxen, aber über Hintergrund

- [ ] Task 4: BracketLine-Komponente erstellen (AC: 2, 6)
  - [ ] Props: `from`, `to`, `type`, `isActive`
  - [ ] Bezier-Kurven-Pfad generieren
  - [ ] Farbcodierung nach `type`
  - [ ] Glow-Effekt für aktive Linien

- [ ] Task 5: useLineCalculation Hook erstellen (AC: 2)
  - [ ] Nutzt ResizeObserver für dynamische Positionierung
  - [ ] Berechnet Koordinaten basierend auf DOM-Positionen
  - [ ] Caching für Performance

### Phase 3: Bracket-spezifische Linien

- [ ] Task 6: Winner-Bracket Linien (AC: 3)
  - [ ] Quali-Heat → WB-Heat Verbindungen (nur abgeschlossene Heats)
  - [ ] WB-Heat → WB-Heat Verbindungen
  - [ ] WB-Finale → Grand Finale
  - [ ] KEINE Linien zu/von WB Pool

- [ ] Task 7: Loser-Bracket Linien (AC: 4)
  - [ ] LB-Heat → LB-Heat Verbindungen (nur abgeschlossene Heats)
  - [ ] LB-Finale → Grand Finale
  - [ ] KEINE Linien zu/von LB Pool

- [ ] Task 8: Grand Finale Linien (AC: 5)
  - [ ] WB-Finale-Gewinner → Grand Finale (Gold)
  - [ ] LB-Finale-Gewinner → Grand Finale (Gold)
  - [ ] Prominente Darstellung (dicker, mehr Glow)

### Phase 4: Animationen & Polish

- [ ] Task 9: Linien-Animationen (AC: 7)
  - [ ] CSS-Animation für Glow-Pulse
  - [ ] Trigger bei Heat-Abschluss
  - [ ] Respektiert `prefers-reduced-motion`

- [ ] Task 10: Responsive & Skalierung (AC: 8)
  - [ ] Horizontales Scrollen bei großen Brackets
  - [ ] SVG-Linien skalieren mit
  - [ ] Beamer-Test (1920x1080)

### Phase 5: Tests

- [ ] Task 11: Unit-Tests
  - [ ] Test: Linien-Koordinaten-Berechnung
  - [ ] Test: Pfad-Generierung
  - [ ] Test: Farbcodierung nach Bracket-Typ

- [ ] Task 12: Integration-Tests
  - [ ] Test: Linien werden bei Heat-Abschluss erstellt
  - [ ] Test: Keine Linien zu Pools
  - [ ] Test: Responsive Skalierung
  - [ ] Test: Beamer-Darstellung

## Dev Notes

### Performance-Überlegungen

- SVG statt Canvas für Vektor-Schärfe und einfaches Styling
- `useMemo` für Linien-Berechnungen
- `ResizeObserver` für dynamische Updates (nicht requestAnimationFrame)
- Keine Linien-Berechnung während Animationen

### Bekannte Herausforderungen

1. **DOM-Positionierung:** HeatBox-Positionen müssen nach dem Render bekannt sein (useLayoutEffect)
2. **Scroll-Sync:** SVG muss mit dem Container scrollen
3. **Dynamisches Bracket:** Neue Linien werden erstellt wenn Heats abgeschlossen werden (kein Vorberechnen)

### Vereinfachungen gegenüber ursprünglichem Plan

| Was | Entscheidung |
|-----|--------------|
| **Pools** | Keine Linien zu/von Pools – Pools werden nur als Box dargestellt |
| **Vorschau-Linien** | Keine gestrichelten Linien zu nicht-existierenden Heats |
| **Zoom/Pan** | Gestrichen – horizontales Scrollen reicht |
| **Interaktive Linien** | Gestrichen – Klick auf HeatBox reicht für Details |

### Abhängigkeiten

- Story 4.3: Bracket-Visualisierung (DONE) - Basis-Layout
- Story 4.4: Platzierungsanzeige (DONE) - HeatBox-Struktur
- Epic 9: Loser Bracket Pooling (DONE) - Dynamische Heat-Erstellung

## Definition of Done

### Funktional
- [ ] Horizontale Baumstruktur (Quali links, Finale rechts)
- [ ] SVG-Linien zwischen abgeschlossenen, verbundenen Heats
- [ ] Winner-Bracket mit grünen Linien
- [ ] Loser-Bracket mit roten Linien
- [ ] Grand Finale mit goldenen Linien
- [ ] Linien werden bei Heat-Abschluss erstellt (dynamisch wachsender Baum)
- [ ] Pools werden als Box ohne Linien dargestellt

### UI/Design
- [ ] Linien sind Synthwave-themed (Farben, Glow)
- [ ] Bezier-Kurven für sanfte Verbindungen
- [ ] Finale-Linien sind prominent (dicker, mehr Glow)
- [ ] Animation bei Heat-Abschluss (300-500ms)
- [ ] Pools haben gestrichelten Rahmen (visuell als "Wartebereich")

### Tests
- [ ] Unit-Test: Linien-Koordinaten korrekt berechnet
- [ ] Unit-Test: Pfad-Generierung korrekt
- [ ] Unit-Test: Farbcodierung nach Bracket-Typ
- [ ] Integration-Test: Linien werden bei Heat-Abschluss erstellt
- [ ] Integration-Test: Keine Linien zu Pools

### Qualität
- [ ] Keine TypeScript-Fehler
- [ ] Keine Console-Errors
- [ ] Beamer-tauglich (1920x1080, 10m Lesbarkeit)
- [ ] Responsive (horizontales Scrollen)
- [ ] Performance: Keine Ruckler bei Linien-Updates

## References

- [UX-Spec: BracketTree Features](../../design/ux-design-specification.md#BracketTree) - "SVG-Linien verbinden Heats"
- [PRD: FR19-20](../../prd.md) - Piloten-Historie sichtbar, Farbcodierung
- [Change Proposal: Bracket Restructure 2025-12-16](../change-proposals/change-proposal-bracket-restructure-2025-12-16.md) - Ursprünglicher Plan für Baumstruktur
- [Sprint Change Proposal 2025-12-17](../change-proposals/sprint-change-proposal-2025-12-17.md) - Task 4-3.C: SVG-Verbindungslinien
