import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConnectorManager } from '../src/lib/svg-connector-manager'

describe('ConnectorManager (US-14.6)', () => {
  let container: HTMLElement
  let svg: SVGSVGElement
  let manager: ConnectorManager

  beforeEach(() => {
    // DOM Mocks setup
    container = document.createElement('div')
    container.id = 'bracket-container'
    // Mock getBoundingClientRect for container
    container.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 1000,
      bottom: 800,
      width: 1000,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => {}
    }))
    document.body.appendChild(container)

    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.id = 'connector-svg'
    document.body.appendChild(svg)

    // Helper to create heat elements with mocked positions
    const createHeat = (id: string, rect: any) => {
      const heat = document.createElement('div')
      heat.id = id
      heat.getBoundingClientRect = vi.fn(() => ({
        ...rect,
        toJSON: () => {}
      }))
      document.body.appendChild(heat)
      return heat
    }

    // Setup some test heats
    // Heat 1: WB R1 (top left)
    createHeat('heat-1', { left: 50, top: 100, right: 190, bottom: 200, width: 140, height: 100 })
    // Heat 2: WB R1 (bottom left)
    createHeat('heat-2', { left: 50, top: 300, right: 190, bottom: 400, width: 140, height: 100 })
    // Heat 3: WB R2 (target for 1+2)
    createHeat('heat-3', { left: 300, top: 200, right: 440, bottom: 300, width: 140, height: 100 })

    // WB Finale
    createHeat('wb-finale', { left: 600, top: 200, right: 740, bottom: 300, width: 140, height: 100 })
    // LB Finale
    createHeat('lb-finale', { left: 800, top: 200, right: 940, bottom: 300, width: 140, height: 100 })
    // Grand Finale
    createHeat('grand-finale', { left: 700, top: 500, right: 880, bottom: 620, width: 180, height: 120 })

    manager = new ConnectorManager('bracket-container', 'connector-svg')
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
    manager.destroy()
  })

  it('should initialize correctly', () => {
    expect(manager).toBeDefined()
    // Check internal state if possible or behavior
  })

  it('should add simple connection', () => {
    manager.addConnection('heat-1', 'heat-3')
    const connections = manager.getConnections()
    expect(connections).toHaveLength(1)
    expect(connections[0]).toEqual({
      fromId: 'heat-1',
      toId: 'heat-3',
      type: 'wb'
    })
  })

  it('should add merge connection', () => {
    manager.addMergeConnection(['heat-1', 'heat-2'], 'heat-3')
    const connections = manager.getConnections()
    expect(connections).toHaveLength(1)
    expect(connections[0]).toEqual({
      fromIds: ['heat-1', 'heat-2'],
      toId: 'heat-3',
      type: 'wb',
      isMerge: true
    })
  })

  it('should add grand finale connection', () => {
    manager.addGrandFinaleConnection('wb-finale', 'lb-finale', 'grand-finale')
    const connections = manager.getConnections()
    expect(connections).toHaveLength(1)
    expect(connections[0]).toEqual({
      fromIds: ['wb-finale', 'lb-finale'],
      toId: 'grand-finale',
      type: 'gf',
      isGrandFinale: true
    })
  })

  it('should generate SVG paths on redraw', () => {
    manager.addConnection('heat-1', 'heat-3')
    manager.redraw()

    const paths = svg.querySelectorAll('path')
    expect(paths.length).toBe(1)
    
    // Check path attributes
    const path = paths[0]
    expect(path.getAttribute('stroke')).toBe('#39ff14') // Green
    expect(path.getAttribute('fill')).toBe('none')
    
    // Check path d attribute
    // heat-1 center X: 50 + 70 = 120
    // heat-1 bottom Y: 200
    // heat-3 center X: 300 + 70 = 370
    // heat-3 top Y: 200
    // Mid Y = 200 + (200-200)/2 = 200 (direct horizontal line effectively)
    // Actually wait: heat-1 bottom is 200, heat-3 top is 200.
    // Let's adjust coords to make it more obvious
    
    // Re-setup heat-3 to be lower
    const heat3 = document.getElementById('heat-3')!
    heat3.getBoundingClientRect = vi.fn(() => ({
        left: 300, top: 250, right: 440, bottom: 350, width: 140, height: 100,
        x: 300, y: 250, toJSON: () => {}
    }))
    
    manager.redraw()
    const path2 = svg.querySelectorAll('path')[0]
    const d = path2.getAttribute('d')
    
    // Expected:
    // Start: 120, 200
    // End: 370, 250
    // MidY: 200 + (250-200)/2 = 225
    // Path: M 120 200 L 120 225 L 370 225 L 370 250
    expect(d).toBe('M 120 200 L 120 225 L 370 225 L 370 250')
  })

  it('should handle scale correctly', () => {
    manager.setScale(0.5) // Zoom out
    manager.addConnection('heat-1', 'heat-3')
    manager.redraw()

    // Container width 1000 -> SVG width should be 2000 (inverse scale?)
    // In ConnectorManager: width = containerWidth / scale = 1000 / 0.5 = 2000
    expect(svg.getAttribute('width')).toBe('2000')
    expect(svg.getAttribute('height')).toBe('1600')
  })

  it('should debounce redraw on resize', () => {
    vi.useFakeTimers()
    const redrawSpy = vi.spyOn(manager, 'redraw')
    
    // Trigger resize
    window.dispatchEvent(new Event('resize'))
    
    expect(redrawSpy).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(150)
    expect(redrawSpy).toHaveBeenCalled()
    
    vi.useRealTimers()
  })
})
