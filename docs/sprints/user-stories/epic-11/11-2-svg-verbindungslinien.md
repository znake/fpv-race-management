# Story 11.2: SVG Verbindungslinien

**Status:** ready
**Created:** 2025-12-28
**Story Points:** 5 (M-Shirt)
**Mockup:** [bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)

## Story

Als **Zuschauer auf dem Beamer**,
möchte ich **farbcodierte Linien sehen, die zeigen welcher Heat wohin führt**,
damit **ich den Turnierfluss sofort verstehen kann**.

## Hintergrund

SVG-Linien verbinden die Heats visuell und zeigen den Fluss:
- **Grüne Linien:** Winner Bracket Verbindungen
- **Rote Linien:** Loser Bracket Verbindungen  
- **Goldene Linien:** Verbindungen zum Grand Finale (dicker)

Alle Linien haben einen Glow-Effekt für den Synthwave-Look.

## Acceptance Criteria

### AC1: WB-Linien sind grün mit Glow

**Given** ein WB-Heat hat einen Ziel-Heat
**When** das Bracket gerendert wird
**Then** verbindet eine grüne Linie die beiden Heats
**And** die Linie hat einen grünen Glow-Effekt

### AC2: LB-Linien sind rot mit Glow

**Given** ein LB-Heat hat einen Ziel-Heat
**When** das Bracket gerendert wird
**Then** verbindet eine rote Linie die beiden Heats
**And** die Linie hat einen roten Glow-Effekt

### AC3: Grand Finale Linien sind gold und dicker

**Given** ein Finale-Heat führt zum Grand Finale
**When** das Bracket gerendert wird
**Then** verbindet eine goldene Linie die beiden Heats
**And** die Linie ist dicker als normale Linien (3px statt 2px)
**And** die Linie hat einen goldenen Glow-Effekt

### AC4: Linien werden dynamisch berechnet

**Given** die Heat-Boxen haben unterschiedliche Positionen (je nach Bracket-Größe)
**When** das Bracket gerendert wird
**Then** werden die Linien-Endpunkte via `getBoundingClientRect()` berechnet
**And** jede Linie startet am rechten Rand der Quell-Heat-Box (vertikal zentriert)
**And** jede Linie endet am linken Rand der Ziel-Heat-Box (vertikal zentriert)
**And** bei Window-Resize werden die Koordinaten neu berechnet (debounced)

### AC5: Linien-Pfade sind L-förmig

**Given** zwei Heats müssen verbunden werden
**When** die Linie gerendert wird
**Then** folgt sie einem L-förmigen Pfad (horizontal → vertikal → horizontal)
**And** verwendet SVG `<path>` mit entsprechenden Koordinaten

## Technische Anforderungen

### TypeScript Interface

```typescript
interface ConnectorLine {
  id: string;
  sourceHeatId: string;
  targetHeatId: string;
  bracketType: 'wb' | 'lb' | 'gf';
}

interface LineCoordinates {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}
```

### Datenquelle für Verbindungen

Die Linien-Verbindungen werden aus der bestehenden Heat-Struktur abgeleitet:
- **WB Heats → WB Finale:** Gewinner (Platz 1+2) gehen zum nächsten WB Heat
- **WB Heats → LB Pool:** Verlierer (Platz 3+4) gehen zum LB Pool
- **LB Heats → LB Finale:** Gewinner gehen zum nächsten LB Heat
- **WB/LB Finale → Grand Finale:** Top 2 aus beiden Finals

Implementierung via Utility-Funktion:
```typescript
function getHeatConnections(heats: Heat[]): ConnectorLine[]
```

### SVG Layer über dem Bracket

```tsx
<div className="bracket-container">
  <svg className="svg-lines" viewBox="0 0 1100 900">
    {/* Linien werden hier gerendert */}
  </svg>
  <div className="bracket-tree">...</div>
</div>
```

### CSS für Linien (aus Mockup)

```css
.svg-lines {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.line {
  fill: none;
  stroke-width: 2px;
  stroke-linecap: square;
}

.line.wb { 
  stroke: var(--winner-green); 
  filter: drop-shadow(0 0 3px rgba(57, 255, 20, 0.6)); 
}

.line.lb { 
  stroke: var(--loser-red); 
  filter: drop-shadow(0 0 3px rgba(255, 7, 58, 0.6)); 
}

.line.gf { 
  stroke: var(--gold); 
  stroke-width: 3px; 
  filter: drop-shadow(0 0 5px rgba(249, 200, 14, 0.7)); 
}
```

### Pfad-Berechnung

```tsx
// Beispiel L-förmiger Pfad
<path class="line wb" d="M 350 150 L 400 150 L 400 200 L 450 200" />
```

## Tasks

- [ ] **Task 1:** `SVGConnectorLines` Komponente erstellen
- [ ] **Task 2a:** Heat-Refs sammeln (useRef Map für alle Heat-Boxen)
- [ ] **Task 2b:** Koordinaten-Transformation (Absolute DOM → relative SVG viewBox)
- [ ] **Task 2c:** `getHeatConnections()` Funktion implementieren (Bracket-State → ConnectorLine[])
- [ ] **Task 3:** Pfad-Berechnung für L-förmige Verbindungen implementieren
- [ ] **Task 4:** Farbcodierung basierend auf bracketType
- [ ] **Task 5:** Glow-Effekte via CSS filter implementieren
- [ ] **Task 6:** Grand Finale Linien dicker machen (3px statt 2px)
- [ ] **Task 7:** Resize-Handler mit debounce (150ms) für dynamische Neuberechnung
- [ ] **Task 8:** Performance-Test mit vielen Linien (60 Piloten Szenario)

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/bracket/SVGConnectorLines.tsx` | NEU |
| `src/components/bracket/BracketTree.tsx` | SVG Layer einbinden |
| `src/globals.css` | CSS-Klassen für Linien |

## Edge Cases

1. **Leere Heats:** Keine Linie rendern wenn Quell-Heat noch nicht gestartet (`heat.status === 'pending'`)
2. **Grand Finale ohne Gegner:** Nur 1 Linie wenn LB-Sieger noch nicht feststeht
3. **Dynamische Bracket-Größen:** 8 Piloten = 4-6 Linien, 60 Piloten = 20+ Linien
4. **SSR/Initial Render:** Linien erst nach DOM-Mounting berechnen (`useLayoutEffect`)
5. **Container Scroll:** Linien-Positionen müssen relativ zum Container sein, nicht zum Viewport

## Dev Notes

### Abhängigkeiten
- Story 11-1 muss abgeschlossen sein (Container-Layout)
- Bracket-State muss Heat-IDs enthalten für Verbindungs-Mapping

### Technische Herausforderungen
- DOM-Positionen müssen nach Render ausgelesen werden (`useLayoutEffect` statt `useEffect`)
- Bei Fenster-Resize müssen Linien neu berechnet werden (debounced)
- Performance bei vielen Heats beachten (memoization der Pfad-Berechnungen)
- SVG viewBox muss zur Container-Größe passen

### Koordinaten-Berechnung

```typescript
// Transformation: DOM → SVG
const containerRect = containerRef.current.getBoundingClientRect();
const heatRect = heatRef.current.getBoundingClientRect();

const relativeX = heatRect.left - containerRect.left;
const relativeY = heatRect.top - containerRect.top;
```

## References

- [Mockup: bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)
- [Epic 11 Overview](./00-epic-overview.md)
