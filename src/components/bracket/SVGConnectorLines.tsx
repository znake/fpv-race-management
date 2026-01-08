import { useEffect, useRef, useCallback, RefObject } from 'react'
import type { Heat } from '../../types'
import { ConnectorManager } from '../../lib/svg-connector-manager'

/**
 * US-14.6: SVG Connector Lines System
 * 
 * Farbcodierte SVG-Linien verbinden die Heats visuell:
 * - Grüne Linien: Winner Bracket Verbindungen
 * - Goldene Linien: Verbindungen zum Grand Finale (dicker)
 * 
 * WICHTIG (AC10): LB hat KEINE Verbindungslinien (Pool-basiertes System)
 * 
 * Features:
 * - AC1: ConnectorManager Klasse für zentrale Linien-Verwaltung
 * - AC2: Linien-Styling (2px stroke, round caps)
 * - AC3: Farbcodierung (WB grün, GF gold)
 * - AC4: Pfad-Berechnung (vertikal → horizontal → vertikal)
 * - AC5: Merge-Connections (2→1)
 * - AC6: Grand Finale Connection (WB+LB → GF)
 * - AC7: DOM-Position-Berechnung relativ zum Container
 * - AC8: Dynamische Neuberechnung bei Resize
 * - AC9: Scale-Kompensation bei Zoom
 */

// Legacy Exports für Rückwärtskompatibilität
export interface ConnectorLine {
  id: string
  sourceHeatId: string
  targetHeatId: string
  bracketType: 'wb' | 'lb' | 'gf'
}

/**
 * Legacy-Funktion für Rückwärtskompatibilität
 * AC10: Erstellt nur WB und GF Connections (keine LB-Linien)
 */
export function getHeatConnections(heats: Heat[]): ConnectorLine[] {
  const connections: ConnectorLine[] = []
  
  // Find finale heats
  const wbFinale = heats.find(h => h.bracketType === 'winner' && h.isFinale)
  const grandFinale = heats.find(h => 
    h.bracketType === 'grand_finale' || h.bracketType === 'finale'
  )
  const lbFinale = heats.find(h => h.bracketType === 'loser' && h.isFinale)
  
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
  
  // AC10: KEINE LB-Verbindungen mehr (Pool-System)
  // LB Heats sind über den Pool verbunden, nicht über direkte Linien
  
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
  // Diese Verbindung bleibt, da sie zum Grand Finale führt
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

interface SVGConnectorLinesProps {
  heats: Heat[]
  containerRef: RefObject<HTMLDivElement | null>
  heatRefs: Map<string, HTMLDivElement | null>
  /** AC9: Scale-Faktor für Zoom-Kompensation (default: 1) */
  scale?: number
}

/**
 * AC5: Baut WB Merge-Connections auf
 * 
 * Analysiert WB-Heats nach Runden und erstellt Merge-Connections:
 * - WB R1 H1 + H2 → WB R2 H1 (2 Quellen → 1 Ziel)
 */
function buildWBConnections(heats: Heat[], manager: ConnectorManager): void {
  // Gruppiere WB-Heats nach Runden
  const wbHeats = heats.filter(h => h.bracketType === 'winner' && !h.isFinale)
  const wbFinale = heats.find(h => h.bracketType === 'winner' && h.isFinale)
  
  if (!wbFinale) return
  
  // Sortiere nach roundNumber
  const heatsByRound = new Map<number, Heat[]>()
  wbHeats.forEach(heat => {
    const round = heat.roundNumber ?? 1
    const heatsInRound = heatsByRound.get(round) || []
    heatsInRound.push(heat)
    heatsByRound.set(round, heatsInRound)
  })
  
  // Finde die maximale Runde vor dem Finale
  const rounds = Array.from(heatsByRound.keys()).sort((a, b) => a - b)
  
  // Verbinde Heats zwischen Runden
  for (let i = 0; i < rounds.length; i++) {
    const currentRound = rounds[i]
    const nextRound = rounds[i + 1]
    const heatsInCurrentRound = heatsByRound.get(currentRound) || []
    
    // Nur completed Heats verbinden
    const completedHeats = heatsInCurrentRound.filter(h => h.status === 'completed')
    
    if (completedHeats.length === 0) continue
    
    // Zur nächsten Runde oder zum Finale
    if (nextRound && heatsByRound.has(nextRound)) {
      const heatsInNextRound = heatsByRound.get(nextRound) || []
      
      // Merge-Verbindung: 2 Heats → 1 Heat in nächster Runde
      for (let j = 0; j < heatsInNextRound.length; j++) {
        const targetHeat = heatsInNextRound[j]
        const sourceHeats = completedHeats.slice(j * 2, j * 2 + 2)
        
        if (sourceHeats.length === 2) {
          manager.addMergeConnection(
            sourceHeats.map(h => h.id),
            targetHeat.id,
            'wb'
          )
        } else if (sourceHeats.length === 1) {
          manager.addConnection(sourceHeats[0].id, targetHeat.id, 'wb')
        }
      }
    } else {
      // Letzte Runde → Finale
      if (completedHeats.length >= 2) {
        manager.addMergeConnection(
          completedHeats.map(h => h.id),
          wbFinale.id,
          'wb'
        )
      } else if (completedHeats.length === 1) {
        manager.addConnection(completedHeats[0].id, wbFinale.id, 'wb')
      }
    }
  }
}

/**
 * AC6: Grand Finale Connection erstellen
 * 
 * Verbindet WB-Finale + LB-Finale → Grand Finale
 */
function buildGrandFinaleConnection(heats: Heat[], manager: ConnectorManager): void {
  const wbFinale = heats.find(h => h.bracketType === 'winner' && h.isFinale)
  const lbFinale = heats.find(h => h.bracketType === 'loser' && h.isFinale)
  const grandFinale = heats.find(h => 
    h.bracketType === 'grand_finale' || h.bracketType === 'finale'
  )
  
  if (!grandFinale) return
  
  // Beide Finales müssen completed sein für GF-Connection
  const wbFinaleCompleted = wbFinale?.status === 'completed'
  const lbFinaleCompleted = lbFinale?.status === 'completed'
  
  if (wbFinaleCompleted && lbFinaleCompleted && wbFinale && lbFinale) {
    // AC6: Spezielle Grand Finale Connection
    manager.addGrandFinaleConnection(wbFinale.id, lbFinale.id, grandFinale.id)
  } else if (wbFinaleCompleted && wbFinale) {
    // Nur WB-Finale completed
    manager.addConnection(wbFinale.id, grandFinale.id, 'gf')
  } else if (lbFinaleCompleted && lbFinale) {
    // Nur LB-Finale completed
    manager.addConnection(lbFinale.id, grandFinale.id, 'gf')
  }
}

/**
 * SVGConnectorLines Component
 * 
 * Verwendet den ConnectorManager für das Zeichnen der Verbindungslinien.
 * 
 * AC1: Nutzt ConnectorManager Klasse
 * AC2-3: Styling über ConnectorManager
 * AC4: Pfad-Berechnung über ConnectorManager
 * AC5: Merge-Connections werden automatisch erstellt
 * AC6: Grand Finale Connection
 * AC7-9: Position-Berechnung mit Scale-Kompensation
 * AC10: Nur WB + Grand Finale Linien
 * 
 * @returns null - SVG wird direkt im DOM über den ConnectorManager aktualisiert
 */
export function SVGConnectorLines({
  heats,
  containerRef,
  heatRefs,
  scale = 1
}: SVGConnectorLinesProps) {
  const managerRef = useRef<ConnectorManager | null>(null)
  
  // Connections aufbauen und zeichnen
  const buildAndDraw = useCallback(() => {
    if (!containerRef.current) return
    if (!managerRef.current) return
    
    const manager = managerRef.current
    
    // Connections leeren
    manager.clearConnections()
    
    // AC5: WB-Connections aufbauen
    buildWBConnections(heats, manager)
    
    // AC6: Grand Finale Connection
    buildGrandFinaleConnection(heats, manager)
    
    // AC10: KEINE LB-Connections (Pool-System)
    
    // Zeichnen
    manager.redraw()
  }, [heats, containerRef])
  
  // Manager erstellen und initialisieren
  useEffect(() => {
    if (!containerRef.current) return
    
    // Sicherstellen, dass SVG existiert
    const svg = document.getElementById('connector-svg')
    if (!svg) return
    
    // Sicherstellen, dass Container ID hat
    if (!containerRef.current.id) {
      containerRef.current.id = 'bracket-container'
    }
    
    // Manager erstellen
    const manager = new ConnectorManager(
      containerRef.current.id,
      'connector-svg'
    )
    managerRef.current = manager
    
    // Initial zeichnen (mit kleiner Verzögerung für DOM)
    const initTimer = setTimeout(() => {
      buildAndDraw()
    }, 50)
    
    // Cleanup
    return () => {
      clearTimeout(initTimer)
      manager.destroy()
      managerRef.current = null
    }
  }, [containerRef, buildAndDraw])
  
  // AC9: Scale-Update
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.setScale(scale)
      managerRef.current.redraw()
    }
  }, [scale])
  
  // Heats-Änderungen verarbeiten
  useEffect(() => {
    if (managerRef.current) {
      buildAndDraw()
    }
  }, [heats, buildAndDraw])
  
  // HeatRefs-Änderungen verarbeiten (debounced)
  useEffect(() => {
    if (!managerRef.current) return
    
    const timer = setTimeout(() => {
      buildAndDraw()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [heatRefs, buildAndDraw])
  
  // Component rendert nichts - SVG wird direkt im DOM aktualisiert
  return null
}
