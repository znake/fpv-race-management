import { useState, useLayoutEffect, useCallback, RefObject } from 'react'
import type { Heat } from '../../types'

/**
 * Story 11-2: SVG Verbindungslinien
 * 
 * Farbcodierte SVG-Linien verbinden die Heats visuell:
 * - Grüne Linien: Winner Bracket Verbindungen
 * - Rote Linien: Loser Bracket Verbindungen
 * - Goldene Linien: Verbindungen zum Grand Finale (dicker)
 * 
 * Alle Linien haben Glow-Effekte für den Synthwave-Look.
 */

// TypeScript Interfaces (aus Story-Spezifikation)
export interface ConnectorLine {
  id: string
  sourceHeatId: string
  targetHeatId: string
  bracketType: 'wb' | 'lb' | 'gf'
}

interface LineCoordinates {
  startX: number
  startY: number
  endX: number
  endY: number
}

interface ComputedLine extends ConnectorLine, LineCoordinates {}

interface SVGConnectorLinesProps {
  heats: Heat[]
  containerRef: RefObject<HTMLDivElement | null>
  heatRefs: Map<string, HTMLDivElement | null>
}

/**
 * Utility: Berechnet die Verbindungen zwischen Heats basierend auf der Bracket-Struktur
 * 
 * AC1-3: WB-Linien grün, LB-Linien rot, GF-Linien gold
 * 
 * Verbindungslogik:
 * - WB Heats → WB Finale: Gewinner (Platz 1+2) gehen zum nächsten WB Heat
 * - WB/LB Finale → Grand Finale: Top 2 aus beiden Finals
 * - LB Heats → LB Finale: Gewinner gehen zum nächsten LB Heat
 */
export function getHeatConnections(heats: Heat[]): ConnectorLine[] {
  const connections: ConnectorLine[] = []
  
  // Find finale heats
  const wbFinale = heats.find(h => h.bracketType === 'winner' && h.isFinale)
  const lbFinale = heats.find(h => h.bracketType === 'loser' && h.isFinale)
  const grandFinale = heats.find(h => 
    h.bracketType === 'grand_finale' || h.bracketType === 'finale'
  )
  
  // WB Heats (non-finale) → WB Finale
  const wbHeats = heats.filter(h => 
    h.bracketType === 'winner' && 
    !h.isFinale && 
    h.status === 'completed'
  )
  
  if (wbFinale) {
    wbHeats.forEach((heat) => {
      connections.push({
        id: `wb-${heat.id}-to-finale`,
        sourceHeatId: heat.id,
        targetHeatId: wbFinale.id,
        bracketType: 'wb'
      })
    })
  }
  
  // LB Heats (non-finale) → LB Finale
  const lbHeats = heats.filter(h => 
    (h.bracketType === 'loser' || h.id.startsWith('lb-heat-')) && 
    !h.isFinale && 
    h.status === 'completed'
  )
  
  if (lbFinale) {
    lbHeats.forEach((heat) => {
      connections.push({
        id: `lb-${heat.id}-to-finale`,
        sourceHeatId: heat.id,
        targetHeatId: lbFinale.id,
        bracketType: 'lb'
      })
    })
  }
  
  // WB Finale → Grand Finale (gold, AC3)
  if (wbFinale && grandFinale && wbFinale.status === 'completed') {
    connections.push({
      id: 'wb-finale-to-gf',
      sourceHeatId: wbFinale.id,
      targetHeatId: grandFinale.id,
      bracketType: 'gf'
    })
  }
  
  // LB Finale → Grand Finale (gold, AC3)
  if (lbFinale && grandFinale && lbFinale.status === 'completed') {
    connections.push({
      id: 'lb-finale-to-gf',
      sourceHeatId: lbFinale.id,
      targetHeatId: grandFinale.id,
      bracketType: 'gf'
    })
  }
  
  return connections
}

/**
 * AC4: Berechnet die SVG-Koordinaten aus DOM-Positionen
 * 
 * Transformation: DOM → relative SVG Koordinaten
 * - startX/Y: rechter Rand der Quell-Heat-Box (vertikal zentriert)
 * - endX/Y: linker Rand der Ziel-Heat-Box (vertikal zentriert)
 */
function calculateLineCoordinates(
  connection: ConnectorLine,
  containerRef: RefObject<HTMLDivElement | null>,
  heatRefs: Map<string, HTMLDivElement | null>
): LineCoordinates | null {
  const container = containerRef.current
  const sourceEl = heatRefs.get(connection.sourceHeatId)
  const targetEl = heatRefs.get(connection.targetHeatId)
  
  if (!container || !sourceEl || !targetEl) {
    return null
  }
  
  const containerRect = container.getBoundingClientRect()
  const sourceRect = sourceEl.getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()
  
  // Start: rechter Rand der Quell-Box, vertikal zentriert
  const startX = sourceRect.right - containerRect.left
  const startY = sourceRect.top + sourceRect.height / 2 - containerRect.top
  
  // End: linker Rand der Ziel-Box, vertikal zentriert
  const endX = targetRect.left - containerRect.left
  const endY = targetRect.top + targetRect.height / 2 - containerRect.top
  
  return { startX, startY, endX, endY }
}

/**
 * AC5: Generiert einen L-förmigen SVG-Pfad
 * 
 * Pfad: horizontal → vertikal → horizontal
 * Verwendet die Mitte zwischen Start und End für den Knickpunkt
 */
function generateLShapedPath(coords: LineCoordinates): string {
  const { startX, startY, endX, endY } = coords
  
  // Mittelpunkt für den horizontalen Knick (60% des Weges)
  const midX = startX + (endX - startX) * 0.6
  
  // L-förmiger Pfad: M start → L horizontal → L vertikal → L end
  return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`
}

/**
 * Debounce Utility für Resize-Handler (AC4)
 */
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * SVGConnectorLines Component
 * 
 * AC1: WB-Linien sind grün mit Glow
 * AC2: LB-Linien sind rot mit Glow
 * AC3: Grand Finale Linien sind gold und dicker (3px statt 2px)
 * AC4: Linien werden dynamisch berechnet via getBoundingClientRect()
 * AC5: Linien-Pfade sind L-förmig
 */
export function SVGConnectorLines({
  heats,
  containerRef,
  heatRefs
}: SVGConnectorLinesProps) {
  const [computedLines, setComputedLines] = useState<ComputedLine[]>([])
  const [dimensions, setDimensions] = useState({ width: 1100, height: 900 })
  
  // Recalculate lines when heats change or refs update
  const recalculateLines = useCallback(() => {
    if (!containerRef.current) return
    
    // Get container dimensions for SVG viewBox
    const containerRect = containerRef.current.getBoundingClientRect()
    setDimensions({
      width: containerRect.width,
      height: containerRect.height
    })
    
    // Get connections from heat structure
    const connections = getHeatConnections(heats)
    
    // Calculate coordinates for each connection
    const lines = connections
      .map(connection => {
        const coords = calculateLineCoordinates(connection, containerRef, heatRefs)
        if (!coords) return null
        return { ...connection, ...coords }
      })
      .filter((line): line is ComputedLine => line !== null)
    
    setComputedLines(lines)
  }, [heats, containerRef, heatRefs])
  
  // Use useLayoutEffect for DOM-dependent calculations (Edge Case 4: SSR/Initial Render)
  useLayoutEffect(() => {
    recalculateLines()
  }, [recalculateLines])
  
  // AC4: Resize-Handler mit debounce (150ms)
  useLayoutEffect(() => {
    const debouncedRecalculate = debounce(recalculateLines, 150)
    
    window.addEventListener('resize', debouncedRecalculate)
    
    return () => {
      window.removeEventListener('resize', debouncedRecalculate)
    }
  }, [recalculateLines])
  
  // Edge Case 1: Keine Linien wenn keine completed Heats
  if (computedLines.length === 0) {
    return null
  }
  
  return (
    <svg 
      className="svg-lines"
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      preserveAspectRatio="xMinYMin meet"
      data-testid="svg-connector-lines"
    >
      {computedLines.map(line => (
        <path
          key={line.id}
          className={`line ${line.bracketType}`}
          d={generateLShapedPath(line)}
          data-testid={`connector-line-${line.bracketType}`}
          data-source={line.sourceHeatId}
          data-target={line.targetHeatId}
        />
      ))}
    </svg>
  )
}
