import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { SVGConnectorLines, getHeatConnections } from '../src/components/bracket/SVGConnectorLines'
import type { Heat } from '../src/types'

/**
 * US-14.6: SVG Connector Lines System
 * 
 * Tests für die SVGConnectorLines React-Komponente
 * 
 * AC1-AC10: Integration der ConnectorManager Klasse in React
 */

// Mock Heat Factory
const createMockHeat = (overrides: Partial<Heat> = {}): Heat => ({
  id: `heat-${Math.random().toString(36).substr(2, 9)}`,
  heatNumber: 1,
  pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
  status: 'pending',
  bracketType: 'winner',
  ...overrides
})

// Helper: Setup DOM für Tests
function setupTestDOM() {
  document.body.innerHTML = ''
  
  const container = document.createElement('div')
  container.id = 'bracket-container'
  container.style.width = '1200px'
  container.style.height = '800px'
  container.style.position = 'relative'
  document.body.appendChild(container)

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.id = 'connector-svg'
  container.appendChild(svg)

  // Mock getBoundingClientRect
  container.getBoundingClientRect = () => ({
    left: 0, right: 1200, top: 0, bottom: 800,
    width: 1200, height: 800, x: 0, y: 0, toJSON: () => ({})
  })

  return container
}

function createMockHeatElement(id: string, rect: Partial<DOMRect>): HTMLDivElement {
  const el = document.createElement('div')
  el.id = id
  el.getBoundingClientRect = () => ({
    left: rect.left ?? 0,
    right: rect.right ?? 100,
    top: rect.top ?? 0,
    bottom: rect.bottom ?? 100,
    width: rect.width ?? 100,
    height: rect.height ?? 100,
    x: rect.left ?? 0,
    y: rect.top ?? 0,
    toJSON: () => ({})
  })
  return el
}

describe('US-14.6: SVGConnectorLines Component', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    vi.useFakeTimers()
    container = setupTestDOM() as HTMLDivElement
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  describe('AC10: Nur WB + Grand Finale (keine LB-Linien)', () => {
    it('sollte keine Linien für LB-Heats erstellen', () => {
      const containerRef = { current: container }
      const heatRefs = new Map<string, HTMLDivElement | null>()

      // LB Heats
      const lbHeat1 = createMockHeat({ 
        id: 'lb-heat-1', 
        bracketType: 'loser', 
        status: 'completed' 
      })
      const lbHeat2 = createMockHeat({ 
        id: 'lb-heat-2', 
        bracketType: 'loser', 
        status: 'completed' 
      })
      const lbFinale = createMockHeat({ 
        id: 'lb-finale', 
        bracketType: 'loser', 
        isFinale: true,
        status: 'pending'
      })

      // Setup Heat-Elemente
      const el1 = createMockHeatElement('lb-heat-1', { left: 0, top: 0, right: 100, bottom: 80 })
      const el2 = createMockHeatElement('lb-heat-2', { left: 0, top: 100, right: 100, bottom: 180 })
      const el3 = createMockHeatElement('lb-finale', { left: 200, top: 50, right: 300, bottom: 130 })
      container.appendChild(el1)
      container.appendChild(el2)
      container.appendChild(el3)

      heatRefs.set('lb-heat-1', el1)
      heatRefs.set('lb-heat-2', el2)
      heatRefs.set('lb-finale', el3)

      render(
        <SVGConnectorLines
          heats={[lbHeat1, lbHeat2, lbFinale]}
          containerRef={containerRef as any}
          heatRefs={heatRefs}
        />
      )

      vi.advanceTimersByTime(200)

      // LB-Heats sollten KEINE Verbindungslinien haben (Pool-System)
      // Prüfe über getHeatConnections
      const connections = getHeatConnections([lbHeat1, lbHeat2, lbFinale])
      expect(connections.filter(c => c.bracketType === 'lb')).toHaveLength(0)
    })

    it('sollte WB-Connections via getHeatConnections erstellen', () => {
      // WB Heats
      const wbHeat1 = createMockHeat({ 
        id: 'wb-heat-1', 
        bracketType: 'winner',
        roundNumber: 1,
        status: 'completed' 
      })
      const wbHeat2 = createMockHeat({ 
        id: 'wb-heat-2', 
        bracketType: 'winner',
        roundNumber: 1,
        status: 'completed' 
      })
      const wbFinale = createMockHeat({ 
        id: 'wb-finale', 
        bracketType: 'winner',
        roundNumber: 2,
        isFinale: true,
        status: 'pending'
      })

      const connections = getHeatConnections([wbHeat1, wbHeat2, wbFinale])
      
      // Sollte WB-Connections haben
      const wbConnections = connections.filter(c => c.bracketType === 'wb')
      expect(wbConnections).toHaveLength(2)
    })

    it('sollte GF-Connections erstellen wenn beide Finales completed sind', () => {
      const wbFinale = createMockHeat({ 
        id: 'wb-finale', 
        bracketType: 'winner',
        isFinale: true,
        status: 'completed' 
      })
      const lbFinale = createMockHeat({ 
        id: 'lb-finale', 
        bracketType: 'loser',
        isFinale: true,
        status: 'completed'
      })
      const grandFinale = createMockHeat({ 
        id: 'grand-finale', 
        bracketType: 'grand_finale',
        status: 'pending'
      })

      const connections = getHeatConnections([wbFinale, lbFinale, grandFinale])
      
      // Beide Finales → GF
      const gfConnections = connections.filter(c => c.bracketType === 'gf')
      expect(gfConnections).toHaveLength(2) // WB-Finale→GF und LB-Finale→GF
    })
  })

  describe('Scale-Kompensation', () => {
    it('sollte scale prop akzeptieren', () => {
      const containerRef = { current: container }
      const heatRefs = new Map<string, HTMLDivElement | null>()

      // Render sollte ohne Fehler durchlaufen
      const { container: renderContainer } = render(
        <SVGConnectorLines
          heats={[]}
          containerRef={containerRef as any}
          heatRefs={heatRefs}
          scale={2}
        />
      )

      vi.advanceTimersByTime(200)

      // Komponente sollte existieren (rendert null, also keine children)
      expect(renderContainer.childNodes.length).toBe(0)
    })
  })

  describe('Rendering', () => {
    it('sollte null rendern (SVG wird direkt im DOM aktualisiert)', () => {
      const containerRef = { current: container }
      const heatRefs = new Map<string, HTMLDivElement | null>()

      const { container: renderContainer } = render(
        <SVGConnectorLines
          heats={[]}
          containerRef={containerRef as any}
          heatRefs={heatRefs}
        />
      )

      // Komponente rendert null (keine eigenen DOM-Elemente)
      expect(renderContainer.childNodes.length).toBe(0)
    })
  })
})

describe('US-14.6: buildWBConnections - via getHeatConnections', () => {
  it('sollte WB R1 Heats mit WB Finale verbinden', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'wb-r1-h1', bracketType: 'winner', roundNumber: 1, status: 'completed' }),
      createMockHeat({ id: 'wb-r1-h2', bracketType: 'winner', roundNumber: 1, status: 'completed' }),
      createMockHeat({ id: 'wb-finale', bracketType: 'winner', isFinale: true })
    ]
    
    const connections = getHeatConnections(heats)
    
    expect(connections.filter(c => c.bracketType === 'wb')).toHaveLength(2)
    expect(connections.find(c => c.sourceHeatId === 'wb-r1-h1')).toBeDefined()
    expect(connections.find(c => c.sourceHeatId === 'wb-r1-h2')).toBeDefined()
  })

  it('sollte keine Connection erstellen wenn WB-Heats pending sind', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'wb-r1-h1', bracketType: 'winner', roundNumber: 1, status: 'pending' }),
      createMockHeat({ id: 'wb-finale', bracketType: 'winner', isFinale: true })
    ]
    
    const connections = getHeatConnections(heats)
    
    expect(connections.filter(c => c.bracketType === 'wb')).toHaveLength(0)
  })
})

describe('US-14.6: buildGrandFinaleConnection', () => {
  it('sollte WB-Finale + LB-Finale zum Grand Finale verbinden', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'wb-finale', bracketType: 'winner', isFinale: true, status: 'completed' }),
      createMockHeat({ id: 'lb-finale', bracketType: 'loser', isFinale: true, status: 'completed' }),
      createMockHeat({ id: 'grand-finale', bracketType: 'grand_finale' })
    ]
    
    const connections = getHeatConnections(heats)
    
    const gfConnections = connections.filter(c => c.bracketType === 'gf')
    expect(gfConnections).toHaveLength(2)
    expect(gfConnections.find(c => c.sourceHeatId === 'wb-finale')).toBeDefined()
    expect(gfConnections.find(c => c.sourceHeatId === 'lb-finale')).toBeDefined()
  })

  it('sollte keine Connection erstellen wenn GF fehlt', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'wb-finale', bracketType: 'winner', isFinale: true, status: 'completed' }),
      createMockHeat({ id: 'lb-finale', bracketType: 'loser', isFinale: true, status: 'completed' })
    ]
    
    const connections = getHeatConnections(heats)
    
    expect(connections.filter(c => c.bracketType === 'gf')).toHaveLength(0)
  })

  it('sollte nur completed Finale verbinden', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'wb-finale', bracketType: 'winner', isFinale: true, status: 'completed' }),
      createMockHeat({ id: 'lb-finale', bracketType: 'loser', isFinale: true, status: 'pending' }),
      createMockHeat({ id: 'grand-finale', bracketType: 'grand_finale' })
    ]
    
    const connections = getHeatConnections(heats)
    
    const gfConnections = connections.filter(c => c.bracketType === 'gf')
    expect(gfConnections).toHaveLength(1)
    expect(gfConnections[0].sourceHeatId).toBe('wb-finale')
  })
})
