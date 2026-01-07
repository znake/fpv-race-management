# US-14.6: SVG Connector Lines System

| Feld | Wert |
|------|------|
| **Story ID** | US-14.6 |
| **Epic** | Epic 14: Visuelle Integration Bracket-Mockup |
| **Priorität** | HIGH |
| **Geschätzter Aufwand** | 8 Story Points (2-3 Tage) |
| **Abhängigkeiten** | US-14.1 (SVG-Overlay), US-14.3 (WB-Layout mit connector-space) |

---

## User Story

**Als** Zuschauer  
**möchte ich** SVG-Verbindungslinien die den Turnierverlauf zeigen  
**sodass** ich sehe welcher Heat wohin führt

---

## Akzeptanzkriterien

### AC1: ConnectorManager Klasse
- [ ] TypeScript Klasse nach Mockup-Vorlage
- [ ] Constructor: `new ConnectorManager(containerId, svgId)`
- [ ] Methode `addConnection(fromId, toId, type)` für einfache Verbindungen
- [ ] Methode `addMergeConnection(fromIds[], toId, type)` für Merge (2→1)
- [ ] Methode `addGrandFinaleConnection(wbFinaleId, lbFinaleId, gfId)` für spezielle GF-Linie
- [ ] Methode `redraw()` für Neuberechnung aller Linien
- [ ] Methode `debouncedRedraw()` mit 50ms Debounce

### AC2: Linien-Styling
- [ ] Stroke-Width: 2px (Standard), 3px (Grand Finale)
- [ ] Stroke-Linecap: round
- [ ] Stroke-Linejoin: round
- [ ] Fill: none

### AC3: Farbcodierung
- [ ] WB-Linien: Grün (#39ff14), 0.7 Opacity
- [ ] LB-Linien: Rot (#ff073a), 0.7 Opacity (falls benötigt für Übergänge)
- [ ] GF-Linien: Gold (#f9c80e), 3px Stroke, 0.8 Opacity

### AC4: Pfad-Berechnung
- [ ] Start: unten-mitte der Quell-Heat-Box
- [ ] Ende: oben-mitte der Ziel-Heat-Box
- [ ] Pfad-Form: vertikal nach unten → horizontal zum Ziel-X → vertikal zum Ziel
- [ ] Mid-Point: 50% der vertikalen Distanz zwischen Start und Ende

### AC5: Merge-Connections (2→1)
- [ ] Zwei Quellen treffen sich auf gemeinsamer horizontaler Linie
- [ ] Gemeinsamer Pfad führt zum Ziel
- [ ] Beispiel: WB R1 H1 + H2 → WB R2 H1

### AC6: Grand Finale Connection
- [ ] WB-Finale und LB-Finale treffen sich auf einer Höhe
- [ ] Gemeinsamer Pfad führt nach unten zum Grand Finale
- [ ] Beide Quellen kommen von unterschiedlichen X-Positionen

### AC7: DOM-Position-Berechnung
- [ ] `getRelativePosition(element)` relativ zum Container
- [ ] Berücksichtigt: left, right, top, bottom, centerX, centerY, width, height
- [ ] Scale-Kompensation bei Zoom (teilen durch currentScale)

### AC8: Dynamische Neuberechnung
- [ ] ResizeObserver oder window.resize Listener
- [ ] Debounced Redraw (50ms)
- [ ] SVG-Größe passt sich Container-Größe an

### AC9: Scale-Kompensation bei Zoom
- [ ] `getBoundingClientRect()` liefert skalierte Werte
- [ ] Positionen durch `currentScale` teilen für korrekte SVG-Koordinaten
- [ ] SVG-Dimensionen ebenfalls kompensieren

### AC10: Nur WB + Grand Finale
- [ ] LB hat KEINE Verbindungslinien (Pool-basiert)
- [ ] Nur WB-Heats untereinander verbinden
- [ ] WB-Finale + LB-Finale → Grand Finale verbinden

---

## Technische Hinweise

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/components/bracket/SVGConnectorLines.tsx` | Komplett Rewrite |
| `src/lib/svg-connector-manager.ts` | NEU erstellen |

### ConnectorManager Architektur

```typescript
// src/lib/svg-connector-manager.ts
interface Position {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
  width: number
  height: number
}

interface Connection {
  fromId: string | string[] // single oder merge
  toId: string
  type: 'wb' | 'lb' | 'gf'
  isMerge?: boolean
  isGrandFinale?: boolean
}

export class ConnectorManager {
  private svg: SVGSVGElement
  private container: HTMLElement
  private connections: Connection[] = []
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null
  private currentScale: number = 1
  
  constructor(containerId: string, svgId: string) {
    this.container = document.getElementById(containerId)!
    this.svg = document.getElementById(svgId) as SVGSVGElement
    
    window.addEventListener('resize', () => this.debouncedRedraw())
    window.addEventListener('load', () => this.redraw())
  }
  
  setScale(scale: number): void {
    this.currentScale = scale
  }
  
  addConnection(fromId: string, toId: string, type: 'wb' | 'lb' | 'gf' = 'wb'): void {
    this.connections.push({ fromId, toId, type })
  }
  
  addMergeConnection(fromIds: string[], toId: string, type: 'wb' | 'lb' | 'gf' = 'wb'): void {
    this.connections.push({ fromIds, toId, type, isMerge: true })
  }
  
  addGrandFinaleConnection(wbFinaleId: string, lbFinaleId: string, gfId: string): void {
    this.connections.push({
      fromId: wbFinaleId,
      toId: gfId,
      type: 'gf',
      isGrandFinale: true,
      // Speichere zweite Quelle separat
      fromIds: [wbFinaleId, lbFinaleId]
    })
  }
  
  getRelativePosition(element: HTMLElement): Position {
    const containerRect = this.container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const scale = this.currentScale || 1
    
    return {
      left: (elementRect.left - containerRect.left) / scale,
      right: (elementRect.right - containerRect.left) / scale,
      top: (elementRect.top - containerRect.top) / scale,
      bottom: (elementRect.bottom - containerRect.top) / scale,
      centerX: (elementRect.left - containerRect.left + elementRect.width / 2) / scale,
      centerY: (elementRect.top - containerRect.top + elementRect.height / 2) / scale,
      width: elementRect.width / scale,
      height: elementRect.height / scale
    }
  }
  
  private createPath(from: Position, to: Position, type: string): SVGPathElement {
    const startX = from.centerX
    const startY = from.bottom
    const endX = to.centerX
    const endY = to.top
    const midY = startY + (endY - startY) / 2
    
    const d = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke-width', '2')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    this.applyStyle(path, type)
    
    return path
  }
  
  private applyStyle(path: SVGPathElement, type: string): void {
    switch (type) {
      case 'wb':
        path.setAttribute('stroke', '#39ff14')
        path.setAttribute('opacity', '0.7')
        break
      case 'lb':
        path.setAttribute('stroke', '#ff073a')
        path.setAttribute('opacity', '0.7')
        break
      case 'gf':
        path.setAttribute('stroke', '#f9c80e')
        path.setAttribute('stroke-width', '3')
        path.setAttribute('opacity', '0.8')
        break
    }
  }
  
  redraw(): void {
    this.svg.innerHTML = ''
    
    const containerRect = this.container.getBoundingClientRect()
    const scale = this.currentScale || 1
    
    this.svg.setAttribute('width', String(containerRect.width / scale))
    this.svg.setAttribute('height', String(containerRect.height / scale))
    
    this.connections.forEach(conn => {
      // ... Rendering-Logik für verschiedene Connection-Typen
    })
  }
  
  debouncedRedraw(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
    this.resizeTimeout = setTimeout(() => this.redraw(), 50)
  }
}
```

### React-Integration

```tsx
// SVGConnectorLines.tsx
import { useEffect, useRef } from 'react'
import { ConnectorManager } from '../../lib/svg-connector-manager'
import type { Heat } from '../../types'

interface SVGConnectorLinesProps {
  heats: Heat[]
  containerRef: RefObject<HTMLDivElement>
  heatRefs: Map<string, HTMLDivElement | null>
  scale?: number
}

export function SVGConnectorLines({
  heats,
  containerRef,
  heatRefs,
  scale = 1
}: SVGConnectorLinesProps) {
  const managerRef = useRef<ConnectorManager | null>(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    // Manager erstellen
    const manager = new ConnectorManager('bracket-container', 'connector-svg')
    managerRef.current = manager
    
    // Connections basierend auf Heats aufbauen
    buildConnections(heats, manager)
    
    // Initial zeichnen
    manager.redraw()
    
    return () => {
      // Cleanup
    }
  }, [heats])
  
  // Scale-Update
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.setScale(scale)
      managerRef.current.redraw()
    }
  }, [scale])
  
  return null // SVG wird direkt in DOM gerendert
}

function buildConnections(heats: Heat[], manager: ConnectorManager): void {
  // WB R1 → WB R2 Merge Connections
  // ... Logik basierend auf bracket-structure
  
  // WB R2 → WB Finale
  // ...
  
  // WB Finale + LB Finale → Grand Finale
  const wbFinale = heats.find(h => h.bracketType === 'winner' && h.isFinale)
  const lbFinale = heats.find(h => h.bracketType === 'loser' && h.isFinale)
  const grandFinale = heats.find(h => h.bracketType === 'grand_finale')
  
  if (wbFinale && lbFinale && grandFinale) {
    manager.addGrandFinaleConnection(wbFinale.id, lbFinale.id, grandFinale.id)
  }
}
```

---

## Migration von bestehendem Code

Die aktuelle `SVGConnectorLines.tsx` verwendet einen anderen Ansatz:

```tsx
// Aktuell: Deklarative Berechnung mit useState
const [computedLines, setComputedLines] = useState<ComputedLine[]>([])

// L-förmiger Pfad
function generateLShapedPath(coords: LineCoordinates): string {
  const midX = startX + (endX - startX) * 0.6
  return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`
}

// Neu: ConnectorManager Klasse mit Mockup-Logik
// Pfad geht zuerst nach unten, dann horizontal, dann zum Ziel
```

---

## Abhängigkeiten zu anderen Stories

| Story | Abhängigkeit |
|-------|-------------|
| US-14.1 | SVG-Overlay muss vorhanden sein |
| US-14.3 | WB connector-spaces für Linien-Referenz |
| US-14.8 | Zoom-Scale wird an Manager übergeben |

---

## Edge Cases

1. **Heats noch nicht gerendert**: Linien werden erst gezeichnet wenn DOM-Elemente existieren
2. **Resize während Animation**: Debounced Redraw verhindert Flackern
3. **Zoom-Änderung**: Scale-Kompensation für korrekte Positionen
4. **Dynamisch generierte Heats**: Connections müssen bei Heat-Änderungen neu aufgebaut werden

---

## Definition of Done

- [ ] Alle Akzeptanzkriterien erfüllt
- [ ] ConnectorManager Klasse implementiert
- [ ] React-Integration in SVGConnectorLines.tsx
- [ ] WB-Verbindungen werden korrekt gezeichnet
- [ ] Merge-Connections (2→1) funktionieren
- [ ] Grand Finale Connection (WB+LB→GF) funktioniert
- [ ] Scale-Kompensation bei Zoom
- [ ] Resize-Handler mit Debouncing
- [ ] Keine Linien im LB
- [ ] Visueller Vergleich mit Mockup
- [ ] Unit Tests für ConnectorManager
- [ ] Code Review durchgeführt
