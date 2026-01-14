import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { SVGConnectorLines, getHeatConnections, ConnectorLine } from '../src/components/bracket/SVGConnectorLines'
import type { Heat } from '../src/types'
import { createRef } from 'react'

/**
 * Story 11-2 / US-14.6: SVG Verbindungslinien Tests
 * 
 * AC1: WB-Linien sind grün mit Glow
 * AC2: ENTFERNT - LB hat keine Linien mehr (Pool-System, AC10)
 * AC3: Grand Finale Linien sind gold und dicker
 * AC4: Linien werden dynamisch berechnet
 * AC5: Linien-Pfade sind L-förmig
 * AC10: Nur WB + Grand Finale (keine LB-Linien)
 */

// Mock Heats für Tests
const createMockHeat = (overrides: Partial<Heat> = {}): Heat => ({
  id: 'heat-1',
  heatNumber: 1,
  pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
  status: 'pending',
  bracketType: 'winner',
  ...overrides
})

describe('getHeatConnections', () => {
  describe('AC1: WB-Linien (grün)', () => {
    it('sollte WB Heat → WB Finale Verbindung erstellen', () => {
      const heats: Heat[] = [
        createMockHeat({ id: 'wb-heat-1', bracketType: 'winner', status: 'completed' }),
        createMockHeat({ id: 'wb-finale', bracketType: 'winner', isFinale: true, status: 'pending' })
      ]
      
      const connections = getHeatConnections(heats)
      
      const wbConnection = connections.find(c => c.bracketType === 'wb')
      expect(wbConnection).toBeDefined()
      expect(wbConnection?.sourceHeatId).toBe('wb-heat-1')
      expect(wbConnection?.targetHeatId).toBe('wb-finale')
    })
    
    it('sollte keine WB-Verbindung für pending Heats erstellen', () => {
      const heats: Heat[] = [
        createMockHeat({ id: 'wb-heat-1', bracketType: 'winner', status: 'pending' }),
        createMockHeat({ id: 'wb-finale', bracketType: 'winner', isFinale: true })
      ]
      
      const connections = getHeatConnections(heats)
      
      expect(connections.filter(c => c.bracketType === 'wb')).toHaveLength(0)
    })
  })
  
  describe('AC10: Keine LB-Linien (Pool-System)', () => {
    it('sollte KEINE LB Heat → LB Finale Verbindung erstellen', () => {
      const heats: Heat[] = [
        createMockHeat({ id: 'lb-heat-1', bracketType: 'loser', status: 'completed' }),
        createMockHeat({ id: 'lb-finale', bracketType: 'loser', isFinale: true, status: 'pending' })
      ]
      
      const connections = getHeatConnections(heats)
      
      // AC10: Keine LB-Verbindungen
      const lbConnection = connections.find(c => c.bracketType === 'lb')
      expect(lbConnection).toBeUndefined()
    })
    
    it('sollte KEINE lb-heat-* IDs verbinden', () => {
      const heats: Heat[] = [
        createMockHeat({ id: 'lb-heat-dynamic-1', bracketType: 'loser', status: 'completed' }),
        createMockHeat({ id: 'lb-finale', bracketType: 'loser', isFinale: true })
      ]
      
      const connections = getHeatConnections(heats)
      
      // AC10: Keine LB-Verbindungen
      const lbConnection = connections.find(c => c.bracketType === 'lb')
      expect(lbConnection).toBeUndefined()
    })
  })
  
  describe('AC3: Grand Finale Linien (gold)', () => {
    it('sollte WB Finale → Grand Finale Verbindung erstellen', () => {
      const heats: Heat[] = [
        createMockHeat({ id: 'wb-finale', bracketType: 'winner', isFinale: true, status: 'completed' }),
        createMockHeat({ id: 'grand-finale', bracketType: 'grand_finale', status: 'pending' })
      ]
      
      const connections = getHeatConnections(heats)
      
      const gfConnection = connections.find(c => c.id === 'wb-finale-to-gf')
      expect(gfConnection).toBeDefined()
      expect(gfConnection?.bracketType).toBe('gf')
      expect(gfConnection?.targetHeatId).toBe('grand-finale')
    })
    
    it('sollte LB Finale → Grand Finale Verbindung erstellen', () => {
      const heats: Heat[] = [
        createMockHeat({ id: 'lb-finale', bracketType: 'loser', isFinale: true, status: 'completed' }),
        createMockHeat({ id: 'grand-finale', bracketType: 'grand_finale', status: 'pending' })
      ]
      
      const connections = getHeatConnections(heats)
      
      // LB-Finale → GF ist GF-Type, nicht LB-Type (führt zum Grand Finale)
      const gfConnection = connections.find(c => c.id === 'lb-finale-to-gf')
      expect(gfConnection).toBeDefined()
      expect(gfConnection?.bracketType).toBe('gf')
    })
    
    it('sollte keine GF-Verbindung wenn Finale noch nicht completed', () => {
      const heats: Heat[] = [
        createMockHeat({ id: 'wb-finale', bracketType: 'winner', isFinale: true, status: 'active' }),
        createMockHeat({ id: 'grand-finale', bracketType: 'grand_finale' })
      ]
      
      const connections = getHeatConnections(heats)
      
      expect(connections.filter(c => c.bracketType === 'gf')).toHaveLength(0)
    })
  })
  
  describe('Edge Cases', () => {
    it('sollte leere Array zurückgeben wenn keine Heats', () => {
      const connections = getHeatConnections([])
      expect(connections).toEqual([])
    })
    
    it('sollte keine Verbindungen erstellen wenn nur ein Heat', () => {
      const heats = [createMockHeat({ status: 'completed' })]
      const connections = getHeatConnections(heats)
      expect(connections).toEqual([])
    })
    
    it('sollte mehrere WB Heats zu WB Finale verbinden', () => {
      const heats: Heat[] = [
        createMockHeat({ id: 'wb-heat-1', bracketType: 'winner', status: 'completed' }),
        createMockHeat({ id: 'wb-heat-2', bracketType: 'winner', status: 'completed' }),
        createMockHeat({ id: 'wb-finale', bracketType: 'winner', isFinale: true })
      ]
      
      const connections = getHeatConnections(heats)
      
      const wbConnections = connections.filter(c => c.bracketType === 'wb')
      expect(wbConnections).toHaveLength(2)
    })
  })
})

describe('SVGConnectorLines Component', () => {
  beforeEach(() => {
    // Setup DOM für ConnectorManager
    document.body.innerHTML = ''
    
    const container = document.createElement('div')
    container.id = 'bracket-container'
    container.style.width = '1200px'
    container.style.height = '800px'
    document.body.appendChild(container)
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.id = 'connector-svg'
    container.appendChild(svg)
    
    // Mock getBoundingClientRect für Container
    container.getBoundingClientRect = () => ({
      left: 0, right: 1200, top: 0, bottom: 800,
      width: 1200, height: 800, x: 0, y: 0, toJSON: () => ({})
    })
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  const createMockContainerRef = () => {
    const container = document.getElementById('bracket-container') as HTMLDivElement
    return { current: container }
  }
  
  const createMockHeatRefs = (): Map<string, HTMLDivElement | null> => {
    return new Map()
  }
  
  describe('Rendering', () => {
    it('sollte SVG-Element rendern', () => {
      const containerRef = createMockContainerRef()
      const heatRefs = createMockHeatRefs()
      
      const { container } = render(
        <SVGConnectorLines
          heats={[]}
          containerRef={containerRef as any}
          heatRefs={heatRefs}
        />
      )
      
      // Komponente rendert SVG-Element
      const svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
      expect(svg?.id).toBe('connector-svg')
    })
  })
  
  describe('AC1-3: CSS Klassen für Linien-Typen', () => {
    // Diese Tests prüfen die CSS-Klassen via getHeatConnections
    it('sollte "wb" bracketType für WB-Verbindungen setzen', () => {
      const heats: Heat[] = [
        createMockHeat({ id: 'wb-1', bracketType: 'winner', status: 'completed' }),
        createMockHeat({ id: 'wb-finale', bracketType: 'winner', isFinale: true })
      ]
      
      const connections = getHeatConnections(heats)
      const wbLine = connections.find(c => c.sourceHeatId === 'wb-1')
      
      expect(wbLine?.bracketType).toBe('wb')
    })
    
    it('sollte KEINE "lb" bracketType haben (AC10)', () => {
      const heats: Heat[] = [
        createMockHeat({ id: 'lb-1', bracketType: 'loser', status: 'completed' }),
        createMockHeat({ id: 'lb-finale', bracketType: 'loser', isFinale: true })
      ]
      
      const connections = getHeatConnections(heats)
      
      // AC10: Keine LB-Verbindungen
      expect(connections.filter(c => c.bracketType === 'lb')).toHaveLength(0)
    })
    
    it('sollte "gf" bracketType für Grand Finale-Verbindungen setzen', () => {
      const heats: Heat[] = [
        createMockHeat({ id: 'wb-finale', bracketType: 'winner', isFinale: true, status: 'completed' }),
        createMockHeat({ id: 'gf', bracketType: 'grand_finale' })
      ]
      
      const connections = getHeatConnections(heats)
      const gfLine = connections.find(c => c.targetHeatId === 'gf')
      
      expect(gfLine?.bracketType).toBe('gf')
    })
  })
})

describe('ConnectorLine Type', () => {
  it('sollte korrekte Struktur haben', () => {
    const line: ConnectorLine = {
      id: 'test-line',
      sourceHeatId: 'heat-1',
      targetHeatId: 'heat-2',
      bracketType: 'wb'
    }
    
    expect(line.id).toBe('test-line')
    expect(line.sourceHeatId).toBe('heat-1')
    expect(line.targetHeatId).toBe('heat-2')
    expect(line.bracketType).toBe('wb')
  })
  
  it('sollte wb und gf bracketType Werte unterstützen', () => {
    const wbLine: ConnectorLine = { id: '1', sourceHeatId: 'a', targetHeatId: 'b', bracketType: 'wb' }
    const gfLine: ConnectorLine = { id: '3', sourceHeatId: 'a', targetHeatId: 'b', bracketType: 'gf' }
    
    expect(wbLine.bracketType).toBe('wb')
    expect(gfLine.bracketType).toBe('gf')
  })
})
