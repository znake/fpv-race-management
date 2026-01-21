import { useEffect, useRef } from 'react'
import type { Heat } from '../../types'
import { ConnectorManager } from '../../lib/svg-connector-manager'

// Legacy Exports für Tests
export interface ConnectorLine {
  id: string
  sourceHeatId: string
  targetHeatId: string
  bracketType: 'wb' | 'lb' | 'gf'
}

/**
 * Find WB Finale: either marked with isFinale, or the single heat in the highest round
 */
function findWBFinale(heats: Heat[]): Heat | undefined {
  let wbFinale = heats.find(h => h.bracketType === 'winner' && h.isFinale)
  if (!wbFinale) {
    const wbHeats = heats.filter(h => h.bracketType === 'winner')
    if (wbHeats.length > 0) {
      const maxRound = Math.max(...wbHeats.map(h => h.roundNumber ?? 1))
      const heatsInMaxRound = wbHeats.filter(h => (h.roundNumber ?? 1) === maxRound)
      if (heatsInMaxRound.length === 1) {
        wbFinale = heatsInMaxRound[0]
      }
    }
  }
  return wbFinale
}

/**
 * Find LB Finale: either marked with isFinale, or the single heat in the highest round
 */
function findLBFinale(heats: Heat[]): Heat | undefined {
  let lbFinale = heats.find(h => h.bracketType === 'loser' && h.isFinale)
  if (!lbFinale) {
    const lbHeats = heats.filter(h => h.bracketType === 'loser')
    if (lbHeats.length > 0) {
      const maxRound = Math.max(...lbHeats.map(h => h.roundNumber ?? 1))
      const heatsInMaxRound = lbHeats.filter(h => (h.roundNumber ?? 1) === maxRound)
      if (heatsInMaxRound.length === 1) {
        lbFinale = heatsInMaxRound[0]
      }
    }
  }
  return lbFinale
}

/**
 * Legacy-Funktion für Rückwärtskompatibilität und Tests
 */
export function getHeatConnections(heats: Heat[]): ConnectorLine[] {
  const connections: ConnectorLine[] = []
  
  const wbFinale = findWBFinale(heats)
  const grandFinale = heats.find(h => h.bracketType === 'grand_finale' || h.bracketType === 'finale')
  const lbFinale = findLBFinale(heats)
  
  const wbHeats = heats.filter(h => h.bracketType === 'winner' && h.id !== wbFinale?.id && h.status === 'completed')
  
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
  
  if (wbFinale && grandFinale && wbFinale.status === 'completed') {
    connections.push({
      id: 'wb-finale-to-gf',
      sourceHeatId: wbFinale.id,
      targetHeatId: grandFinale.id,
      bracketType: 'gf'
    })
  }
  
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
  containerRef: React.RefObject<HTMLDivElement | null>
  heatRefs: Map<string, HTMLDivElement | null>
  scale?: number
}

/**
 * US-14.6: SVG Connector Lines Component
 * 
 * Verwendet ConnectorManager um Verbindungen zu zeichnen.
 * - WB Connections (grün)
 * - GF Connections (gold)
 * - Keine LB Connections
 */
export function SVGConnectorLines({
  heats,
  containerRef: _containerRef,
  heatRefs: _heatRefs,
  scale = 1
}: SVGConnectorLinesProps) {
  const managerRef = useRef<ConnectorManager | null>(null)

  // Initialize ConnectorManager
  useEffect(() => {
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      if (!managerRef.current) {
         const container = document.getElementById('bracket-container')
         if (container) {
             managerRef.current = new ConnectorManager('bracket-container', 'connector-svg')
             updateConnections() // Initial draw
         }
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (managerRef.current) {
        managerRef.current.destroy()
        managerRef.current = null
      }
    }
  }, []) // Run once on mount

  // Handle Scale
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.setScale(scale)
      managerRef.current.debouncedRedraw()
    }
  }, [scale])

  // Update Connections Logic
  const updateConnections = () => {
    const manager = managerRef.current
    if (!manager) return

    manager.clearConnections()
    
    // Group WB Heats by round
    const wbFinale = findWBFinale(heats)
    const wbHeats = heats.filter(h => h.bracketType === 'winner' && h.id !== wbFinale?.id)
    const grandFinale = heats.find(h => h.bracketType === 'grand_finale' || h.bracketType === 'finale')
    const lbFinale = findLBFinale(heats)

    const heatsByRound = new Map<number, Heat[]>()
    wbHeats.forEach(heat => {
      const round = heat.roundNumber ?? 1
      const heatsInRound = heatsByRound.get(round) || []
      heatsInRound.push(heat)
      heatsByRound.set(round, heatsInRound)
    })
    
    const rounds = Array.from(heatsByRound.keys()).sort((a, b) => a - b)
    
    for (let i = 0; i < rounds.length; i++) {
      const currentRound = rounds[i]
      const nextRound = rounds[i + 1]
      const heatsInCurrentRound = heatsByRound.get(currentRound) || []
      // Sort heats by heatNumber to ensure correct mapping
      heatsInCurrentRound.sort((a, b) => (a.heatNumber || 0) - (b.heatNumber || 0))
      
      // Determine target heats
      let targetHeats: Heat[] = []
      if (nextRound && heatsByRound.has(nextRound)) {
        targetHeats = heatsByRound.get(nextRound) || []
        targetHeats.sort((a, b) => (a.heatNumber || 0) - (b.heatNumber || 0))
      } else if (wbFinale) {
        targetHeats = [wbFinale]
      }
      
      // Map sources to targets (2 sources -> 1 target)
      for (let j = 0; j < targetHeats.length; j++) {
        const targetHeat = targetHeats[j]
        const sourceHeats = heatsInCurrentRound.slice(j * 2, j * 2 + 2)
        
        if (sourceHeats.length > 0) {
            const sourceIds = sourceHeats.map(h => h.id)
            if (sourceIds.length > 1) {
                manager.addMergeConnection(sourceIds, targetHeat.id, 'wb')
            } else {
                manager.addConnection(sourceIds[0], targetHeat.id, 'wb')
            }
        }
      }
    }
    
    // Grand Finale Connection
    if (grandFinale && wbFinale && lbFinale) {
         manager.addGrandFinaleConnection(wbFinale.id, lbFinale.id, grandFinale.id)
    } else if (grandFinale && wbFinale) {
         manager.addConnection(wbFinale.id, grandFinale.id, 'gf')
    } else if (grandFinale && lbFinale) {
         manager.addConnection(lbFinale.id, grandFinale.id, 'gf')
    }

    manager.redraw()
  }

  // Update when heats change
  useEffect(() => {
    // Debounce heat updates slightly
    const timer = setTimeout(() => {
        updateConnections()
    }, 50)
    return () => clearTimeout(timer)
  }, [heats])

  return (
    <svg
      id="connector-svg"
      data-testid="connector-svg"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible'
      }}
    />
  )
}
