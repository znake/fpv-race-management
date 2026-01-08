import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

/**
 * US-14.6: SVG Connector Lines System
 * 
 * Tests für die ConnectorManager Klasse
 * 
 * AC1: ConnectorManager Klasse mit Constructor + Methoden
 * AC2: Linien-Styling (2px stroke, round caps)
 * AC3: Farbcodierung (WB grün, GF gold)
 * AC4: Pfad-Berechnung (vertikal → horizontal → vertikal)
 * AC5: Merge-Connections (2→1)
 * AC6: Grand Finale Connection (WB+LB → GF)
 * AC7: DOM-Position-Berechnung relativ zum Container
 * AC8: Dynamische Neuberechnung bei Resize
 * AC9: Scale-Kompensation bei Zoom
 * AC10: Nur WB + Grand Finale (keine LB-Linien)
 */

// Imports werden nach Erstellung der Klasse hinzugefügt
import { 
  ConnectorManager, 
  type Position, 
  type Connection,
  type ConnectionType 
} from '../src/lib/svg-connector-manager'

// Mock für JSDOM getBoundingClientRect
function mockElement(rect: Partial<DOMRect>): HTMLElement {
  const el = document.createElement('div')
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

function mockSVGElement(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  return svg
}

describe('US-14.6: ConnectorManager', () => {
  let container: HTMLElement
  let svg: SVGSVGElement
  let manager: ConnectorManager

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = ''
    
    container = mockElement({ left: 0, top: 0, width: 1200, height: 800, right: 1200, bottom: 800 })
    container.id = 'bracket-container'
    document.body.appendChild(container)
    
    svg = mockSVGElement()
    svg.id = 'connector-svg'
    container.appendChild(svg)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  describe('AC1: ConnectorManager Klasse mit Constructor + Methoden', () => {
    it('sollte mit containerId und svgId erstellt werden können', () => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
      
      expect(manager).toBeDefined()
      expect(manager).toBeInstanceOf(ConnectorManager)
    })

    it('sollte addConnection Methode haben', () => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
      
      expect(typeof manager.addConnection).toBe('function')
    })

    it('sollte addMergeConnection Methode haben', () => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
      
      expect(typeof manager.addMergeConnection).toBe('function')
    })

    it('sollte addGrandFinaleConnection Methode haben', () => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
      
      expect(typeof manager.addGrandFinaleConnection).toBe('function')
    })

    it('sollte redraw Methode haben', () => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
      
      expect(typeof manager.redraw).toBe('function')
    })

    it('sollte debouncedRedraw Methode haben', () => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
      
      expect(typeof manager.debouncedRedraw).toBe('function')
    })

    it('sollte setScale Methode haben', () => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
      
      expect(typeof manager.setScale).toBe('function')
    })

    it('sollte clearConnections Methode haben', () => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
      
      expect(typeof manager.clearConnections).toBe('function')
    })

    it('sollte destroy Methode haben', () => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
      
      expect(typeof manager.destroy).toBe('function')
    })
  })

  describe('AC1: addConnection für einfache Verbindungen', () => {
    beforeEach(() => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
    })

    it('sollte eine einfache Connection speichern', () => {
      manager.addConnection('heat-1', 'heat-2', 'wb')
      
      const connections = manager.getConnections()
      expect(connections).toHaveLength(1)
      expect(connections[0].fromId).toBe('heat-1')
      expect(connections[0].toId).toBe('heat-2')
      expect(connections[0].type).toBe('wb')
    })

    it('sollte mehrere Connections speichern können', () => {
      manager.addConnection('heat-1', 'heat-3', 'wb')
      manager.addConnection('heat-2', 'heat-3', 'wb')
      
      const connections = manager.getConnections()
      expect(connections).toHaveLength(2)
    })

    it('sollte default type "wb" verwenden wenn nicht angegeben', () => {
      manager.addConnection('heat-1', 'heat-2')
      
      const connections = manager.getConnections()
      expect(connections[0].type).toBe('wb')
    })
  })

  describe('AC1: addMergeConnection für 2→1 Verbindungen', () => {
    beforeEach(() => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
    })

    it('sollte Merge-Connection mit fromIds Array speichern', () => {
      manager.addMergeConnection(['heat-1', 'heat-2'], 'heat-3', 'wb')
      
      const connections = manager.getConnections()
      expect(connections).toHaveLength(1)
      expect(connections[0].fromIds).toEqual(['heat-1', 'heat-2'])
      expect(connections[0].toId).toBe('heat-3')
      expect(connections[0].isMerge).toBe(true)
    })

    it('sollte type korrekt setzen', () => {
      manager.addMergeConnection(['heat-1', 'heat-2'], 'heat-3', 'wb')
      
      const connections = manager.getConnections()
      expect(connections[0].type).toBe('wb')
    })
  })

  describe('AC6: addGrandFinaleConnection', () => {
    beforeEach(() => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
    })

    it('sollte Grand Finale Connection mit beiden Quellen speichern', () => {
      manager.addGrandFinaleConnection('wb-finale', 'lb-finale', 'grand-finale')
      
      const connections = manager.getConnections()
      expect(connections).toHaveLength(1)
      expect(connections[0].fromIds).toEqual(['wb-finale', 'lb-finale'])
      expect(connections[0].toId).toBe('grand-finale')
      expect(connections[0].type).toBe('gf')
      expect(connections[0].isGrandFinale).toBe(true)
    })
  })

  describe('AC7: getRelativePosition', () => {
    beforeEach(() => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
    })

    it('sollte relative Position zum Container berechnen', () => {
      const element = mockElement({ 
        left: 100, 
        right: 200, 
        top: 50, 
        bottom: 150, 
        width: 100, 
        height: 100 
      })
      
      const position = manager.getRelativePosition(element)
      
      expect(position.left).toBe(100) // 100 - 0 (container left)
      expect(position.right).toBe(200) // 200 - 0
      expect(position.top).toBe(50) // 50 - 0 (container top)
      expect(position.bottom).toBe(150)
      expect(position.width).toBe(100)
      expect(position.height).toBe(100)
      expect(position.centerX).toBe(150) // 100 + 100/2
      expect(position.centerY).toBe(100) // 50 + 100/2
    })

    it('sollte alle Position-Felder haben', () => {
      const element = mockElement({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 })
      const position = manager.getRelativePosition(element)
      
      expect(position).toHaveProperty('left')
      expect(position).toHaveProperty('right')
      expect(position).toHaveProperty('top')
      expect(position).toHaveProperty('bottom')
      expect(position).toHaveProperty('centerX')
      expect(position).toHaveProperty('centerY')
      expect(position).toHaveProperty('width')
      expect(position).toHaveProperty('height')
    })
  })

  describe('AC9: Scale-Kompensation bei Zoom', () => {
    beforeEach(() => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
    })

    it('sollte Positionen durch scale teilen', () => {
      manager.setScale(2) // 200% Zoom
      
      const element = mockElement({ 
        left: 200, // skalierte Position (real: 100)
        right: 400, 
        top: 100, 
        bottom: 300, 
        width: 200, // skalierte Größe (real: 100)
        height: 200 
      })
      
      const position = manager.getRelativePosition(element)
      
      // Positionen sollten durch scale geteilt sein
      expect(position.left).toBe(100) // 200 / 2
      expect(position.top).toBe(50) // 100 / 2
      expect(position.width).toBe(100) // 200 / 2
      expect(position.height).toBe(100) // 200 / 2
    })

    it('sollte scale=1 als default haben', () => {
      const element = mockElement({ left: 100, top: 100, width: 100, height: 100, right: 200, bottom: 200 })
      const position = manager.getRelativePosition(element)
      
      // Ohne setScale sollte scale=1 sein (keine Teilung)
      expect(position.left).toBe(100)
    })
  })

  describe('AC2: Linien-Styling', () => {
    beforeEach(() => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
    })

    it('sollte Standard stroke-width von 2px haben', () => {
      // Füge Heat-Elemente zum Container hinzu
      const heat1 = mockElement({ left: 0, top: 0, width: 100, height: 80, right: 100, bottom: 80 })
      heat1.id = 'heat-1'
      container.appendChild(heat1)
      
      const heat2 = mockElement({ left: 0, top: 150, width: 100, height: 80, right: 100, bottom: 230 })
      heat2.id = 'heat-2'
      container.appendChild(heat2)
      
      manager.addConnection('heat-1', 'heat-2', 'wb')
      manager.redraw()
      
      const path = svg.querySelector('path')
      expect(path).not.toBeNull()
      expect(path?.getAttribute('stroke-width')).toBe('2')
    })

    it('sollte stroke-linecap="round" haben', () => {
      const heat1 = mockElement({ left: 0, top: 0, width: 100, height: 80, right: 100, bottom: 80 })
      heat1.id = 'heat-1'
      container.appendChild(heat1)
      
      const heat2 = mockElement({ left: 0, top: 150, width: 100, height: 80, right: 100, bottom: 230 })
      heat2.id = 'heat-2'
      container.appendChild(heat2)
      
      manager.addConnection('heat-1', 'heat-2', 'wb')
      manager.redraw()
      
      const path = svg.querySelector('path')
      expect(path?.getAttribute('stroke-linecap')).toBe('round')
    })

    it('sollte stroke-linejoin="round" haben', () => {
      const heat1 = mockElement({ left: 0, top: 0, width: 100, height: 80, right: 100, bottom: 80 })
      heat1.id = 'heat-1'
      container.appendChild(heat1)
      
      const heat2 = mockElement({ left: 0, top: 150, width: 100, height: 80, right: 100, bottom: 230 })
      heat2.id = 'heat-2'
      container.appendChild(heat2)
      
      manager.addConnection('heat-1', 'heat-2', 'wb')
      manager.redraw()
      
      const path = svg.querySelector('path')
      expect(path?.getAttribute('stroke-linejoin')).toBe('round')
    })

    it('sollte fill="none" haben', () => {
      const heat1 = mockElement({ left: 0, top: 0, width: 100, height: 80, right: 100, bottom: 80 })
      heat1.id = 'heat-1'
      container.appendChild(heat1)
      
      const heat2 = mockElement({ left: 0, top: 150, width: 100, height: 80, right: 100, bottom: 230 })
      heat2.id = 'heat-2'
      container.appendChild(heat2)
      
      manager.addConnection('heat-1', 'heat-2', 'wb')
      manager.redraw()
      
      const path = svg.querySelector('path')
      expect(path?.getAttribute('fill')).toBe('none')
    })

    it('sollte GF-Linien mit stroke-width 3px haben', () => {
      const wbFinale = mockElement({ left: 100, top: 0, width: 100, height: 80, right: 200, bottom: 80 })
      wbFinale.id = 'wb-finale'
      container.appendChild(wbFinale)
      
      const lbFinale = mockElement({ left: 100, top: 200, width: 100, height: 80, right: 200, bottom: 280 })
      lbFinale.id = 'lb-finale'
      container.appendChild(lbFinale)
      
      const grandFinale = mockElement({ left: 100, top: 350, width: 100, height: 80, right: 200, bottom: 430 })
      grandFinale.id = 'grand-finale'
      container.appendChild(grandFinale)
      
      manager.addGrandFinaleConnection('wb-finale', 'lb-finale', 'grand-finale')
      manager.redraw()
      
      const path = svg.querySelector('path')
      expect(path?.getAttribute('stroke-width')).toBe('3')
    })
  })

  describe('AC3: Farbcodierung', () => {
    beforeEach(() => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
      
      // Setup test heats
      const heat1 = mockElement({ left: 0, top: 0, width: 100, height: 80, right: 100, bottom: 80 })
      heat1.id = 'heat-1'
      container.appendChild(heat1)
      
      const heat2 = mockElement({ left: 0, top: 150, width: 100, height: 80, right: 100, bottom: 230 })
      heat2.id = 'heat-2'
      container.appendChild(heat2)
    })

    it('sollte WB-Linien grün (#39ff14) mit 0.7 opacity haben', () => {
      manager.addConnection('heat-1', 'heat-2', 'wb')
      manager.redraw()
      
      const path = svg.querySelector('path')
      expect(path?.getAttribute('stroke')).toBe('#39ff14')
      expect(path?.getAttribute('opacity')).toBe('0.7')
    })

    it('sollte GF-Linien gold (#f9c80e) mit 0.8 opacity haben', () => {
      const wbFinale = mockElement({ left: 100, top: 0, width: 100, height: 80, right: 200, bottom: 80 })
      wbFinale.id = 'wb-finale'
      container.appendChild(wbFinale)
      
      const lbFinale = mockElement({ left: 100, top: 200, width: 100, height: 80, right: 200, bottom: 280 })
      lbFinale.id = 'lb-finale'
      container.appendChild(lbFinale)
      
      const grandFinale = mockElement({ left: 100, top: 350, width: 100, height: 80, right: 200, bottom: 430 })
      grandFinale.id = 'grand-finale'
      container.appendChild(grandFinale)
      
      manager.addGrandFinaleConnection('wb-finale', 'lb-finale', 'grand-finale')
      manager.redraw()
      
      const path = svg.querySelector('path')
      expect(path?.getAttribute('stroke')).toBe('#f9c80e')
      expect(path?.getAttribute('opacity')).toBe('0.8')
    })
  })

  describe('AC4: Pfad-Berechnung', () => {
    beforeEach(() => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
    })

    it('sollte Start unten-mitte der Quell-Box verwenden', () => {
      // Heat 1: centerX=50, bottom=80
      const heat1 = mockElement({ left: 0, top: 0, width: 100, height: 80, right: 100, bottom: 80 })
      heat1.id = 'heat-1'
      container.appendChild(heat1)
      
      // Heat 2: centerX=50, top=150
      const heat2 = mockElement({ left: 0, top: 150, width: 100, height: 80, right: 100, bottom: 230 })
      heat2.id = 'heat-2'
      container.appendChild(heat2)
      
      manager.addConnection('heat-1', 'heat-2', 'wb')
      manager.redraw()
      
      const path = svg.querySelector('path')
      const d = path?.getAttribute('d') || ''
      
      // Start: M 50 80 (centerX, bottom)
      expect(d).toMatch(/^M\s+50\s+80/)
    })

    it('sollte Ende oben-mitte der Ziel-Box verwenden', () => {
      const heat1 = mockElement({ left: 0, top: 0, width: 100, height: 80, right: 100, bottom: 80 })
      heat1.id = 'heat-1'
      container.appendChild(heat1)
      
      const heat2 = mockElement({ left: 0, top: 150, width: 100, height: 80, right: 100, bottom: 230 })
      heat2.id = 'heat-2'
      container.appendChild(heat2)
      
      manager.addConnection('heat-1', 'heat-2', 'wb')
      manager.redraw()
      
      const path = svg.querySelector('path')
      const d = path?.getAttribute('d') || ''
      
      // Ende: 50 150 (centerX, top)
      expect(d).toMatch(/50\s+150\s*$/)
    })

    it('sollte Mid-Point bei 50% der vertikalen Distanz verwenden', () => {
      // Heat 1: bottom=80
      // Heat 2: top=150
      // midY = 80 + (150 - 80) / 2 = 80 + 35 = 115
      const heat1 = mockElement({ left: 0, top: 0, width: 100, height: 80, right: 100, bottom: 80 })
      heat1.id = 'heat-1'
      container.appendChild(heat1)
      
      const heat2 = mockElement({ left: 0, top: 150, width: 100, height: 80, right: 100, bottom: 230 })
      heat2.id = 'heat-2'
      container.appendChild(heat2)
      
      manager.addConnection('heat-1', 'heat-2', 'wb')
      manager.redraw()
      
      const path = svg.querySelector('path')
      const d = path?.getAttribute('d') || ''
      
      // Pfad: M 50 80 L 50 115 L 50 115 L 50 150
      // (bei gleicher X-Position)
      expect(d).toContain('115')
    })

    it('sollte vertikal → horizontal → vertikal Pfad erstellen', () => {
      // Heat 1: centerX=50
      // Heat 2: centerX=150 (verschiedene X-Position)
      const heat1 = mockElement({ left: 0, top: 0, width: 100, height: 80, right: 100, bottom: 80 })
      heat1.id = 'heat-1'
      container.appendChild(heat1)
      
      const heat2 = mockElement({ left: 100, top: 150, width: 100, height: 80, right: 200, bottom: 230 })
      heat2.id = 'heat-2'
      container.appendChild(heat2)
      
      manager.addConnection('heat-1', 'heat-2', 'wb')
      manager.redraw()
      
      const path = svg.querySelector('path')
      const d = path?.getAttribute('d') || ''
      
      // Erwarteter Pfad: M startX startY L startX midY L endX midY L endX endY
      // M 50 80 L 50 115 L 150 115 L 150 150
      expect(d).toMatch(/M\s+50\s+80\s+L\s+50\s+115\s+L\s+150\s+115\s+L\s+150\s+150/)
    })
  })

  describe('AC5: Merge-Connections (2→1)', () => {
    beforeEach(() => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
    })

    it('sollte zwei Quellen auf gemeinsamer horizontaler Linie verbinden', () => {
      // Heat 1: centerX=50, bottom=80
      const heat1 = mockElement({ left: 0, top: 0, width: 100, height: 80, right: 100, bottom: 80 })
      heat1.id = 'heat-1'
      container.appendChild(heat1)
      
      // Heat 2: centerX=250, bottom=80
      const heat2 = mockElement({ left: 200, top: 0, width: 100, height: 80, right: 300, bottom: 80 })
      heat2.id = 'heat-2'
      container.appendChild(heat2)
      
      // Heat 3 (target): centerX=150, top=200
      const heat3 = mockElement({ left: 100, top: 200, width: 100, height: 80, right: 200, bottom: 280 })
      heat3.id = 'heat-3'
      container.appendChild(heat3)
      
      manager.addMergeConnection(['heat-1', 'heat-2'], 'heat-3', 'wb')
      manager.redraw()
      
      // Sollte 2 Pfade erstellen (einer pro Quelle)
      const paths = svg.querySelectorAll('path')
      expect(paths.length).toBeGreaterThanOrEqual(2)
    })

    it('sollte beide Quellen zum gleichen Ziel führen', () => {
      const heat1 = mockElement({ left: 0, top: 0, width: 100, height: 80, right: 100, bottom: 80 })
      heat1.id = 'heat-1'
      container.appendChild(heat1)
      
      const heat2 = mockElement({ left: 200, top: 0, width: 100, height: 80, right: 300, bottom: 80 })
      heat2.id = 'heat-2'
      container.appendChild(heat2)
      
      const heat3 = mockElement({ left: 100, top: 200, width: 100, height: 80, right: 200, bottom: 280 })
      heat3.id = 'heat-3'
      container.appendChild(heat3)
      
      manager.addMergeConnection(['heat-1', 'heat-2'], 'heat-3', 'wb')
      manager.redraw()
      
      const paths = svg.querySelectorAll('path')
      paths.forEach(path => {
        const d = path.getAttribute('d') || ''
        // Alle Pfade sollten bei heat-3 top-center enden (150, 200)
        expect(d).toMatch(/150\s+200\s*$/)
      })
    })
  })

  describe('AC8: Dynamische Neuberechnung bei Resize', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      manager = new ConnectorManager('bracket-container', 'connector-svg')
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('sollte debouncedRedraw mit 150ms Verzögerung aufrufen', () => {
      const redrawSpy = vi.spyOn(manager, 'redraw')

      manager.debouncedRedraw()
      expect(redrawSpy).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(redrawSpy).not.toHaveBeenCalled()

      vi.advanceTimersByTime(60)
      expect(redrawSpy).toHaveBeenCalledTimes(1)
    })

    it('sollte mehrere debouncedRedraw Aufrufe zusammenfassen', () => {
      const redrawSpy = vi.spyOn(manager, 'redraw')

      manager.debouncedRedraw()
      vi.advanceTimersByTime(100)
      manager.debouncedRedraw()
      vi.advanceTimersByTime(100)
      manager.debouncedRedraw()
      vi.advanceTimersByTime(160)

      expect(redrawSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('AC10: Nur WB + Grand Finale (keine LB-Linien)', () => {
    beforeEach(() => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
    })

    it('sollte nur "wb" und "gf" als gültige Connection-Types haben', () => {
      // Type-Check: 'lb' sollte nicht als gültiger ConnectionType funktionieren
      // Dies wird durch TypeScript enforced, aber wir testen trotzdem
      manager.addConnection('heat-1', 'heat-2', 'wb')
      
      const connections = manager.getConnections()
      expect(connections[0].type).toBe('wb')
    })

    it('sollte GF-Connections als type "gf" speichern', () => {
      manager.addGrandFinaleConnection('wb-finale', 'lb-finale', 'grand-finale')
      
      const connections = manager.getConnections()
      expect(connections[0].type).toBe('gf')
    })
  })

  describe('clearConnections und destroy', () => {
    beforeEach(() => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
    })

    it('sollte alle Connections löschen', () => {
      manager.addConnection('heat-1', 'heat-2', 'wb')
      manager.addConnection('heat-2', 'heat-3', 'wb')
      
      expect(manager.getConnections()).toHaveLength(2)
      
      manager.clearConnections()
      
      expect(manager.getConnections()).toHaveLength(0)
    })

    it('sollte bei destroy Event-Listener entfernen', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      manager.destroy()
      
      expect(removeEventListenerSpy).toHaveBeenCalled()
    })
  })

  describe('redraw', () => {
    beforeEach(() => {
      manager = new ConnectorManager('bracket-container', 'connector-svg')
    })

    it('sollte SVG leeren vor dem Zeichnen', () => {
      const heat1 = mockElement({ left: 0, top: 0, width: 100, height: 80, right: 100, bottom: 80 })
      heat1.id = 'heat-1'
      container.appendChild(heat1)
      
      const heat2 = mockElement({ left: 0, top: 150, width: 100, height: 80, right: 100, bottom: 230 })
      heat2.id = 'heat-2'
      container.appendChild(heat2)
      
      manager.addConnection('heat-1', 'heat-2', 'wb')
      manager.redraw()
      manager.redraw() // Zweiter Aufruf
      
      // Sollte nur einen Pfad haben (nicht verdoppelt)
      const paths = svg.querySelectorAll('path')
      expect(paths).toHaveLength(1)
    })

    it('sollte SVG-Dimensionen an Container anpassen', () => {
      manager.redraw()
      
      // Container ist 1200x800
      expect(svg.getAttribute('width')).toBe('1200')
      expect(svg.getAttribute('height')).toBe('800')
    })

    it('sollte SVG-Dimensionen bei Scale kompensieren', () => {
      manager.setScale(2)
      manager.redraw()
      
      // 1200/2 = 600, 800/2 = 400
      expect(svg.getAttribute('width')).toBe('600')
      expect(svg.getAttribute('height')).toBe('400')
    })

    it('sollte keine Pfade zeichnen wenn Elemente nicht gefunden werden', () => {
      manager.addConnection('non-existent-1', 'non-existent-2', 'wb')
      manager.redraw()
      
      const paths = svg.querySelectorAll('path')
      expect(paths).toHaveLength(0)
    })
  })
})
