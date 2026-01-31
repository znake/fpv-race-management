import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SVGPilotPaths } from '../src/components/bracket/SVGPilotPaths'
import { BracketHeatBox } from '../src/components/bracket/heat-boxes/BracketHeatBox'
import type { Heat, Pilot } from '../src/types'

// Mock the ConnectorManager logic since we can't easily test DOM geometry in JSDOM without setup
// We will mock getBoundingClientRect for elements
const mockGetBoundingClientRect = vi.fn()
Element.prototype.getBoundingClientRect = mockGetBoundingClientRect

describe('SVGPilotPaths', () => {
  const mockHeats: Heat[] = [
    {
      id: 'heat-1',
      heatNumber: 1,
      roundNumber: 1,
      bracketType: 'winner',
      status: 'completed',
      pilotIds: ['p1'],
      results: {
        rankings: [{ pilotId: 'p1', rank: 1 }],
        completedAt: '2024-01-01'
      }
    },
    {
      id: 'heat-2',
      heatNumber: 2,
      roundNumber: 2,
      bracketType: 'winner',
      status: 'completed',
      pilotIds: ['p1'],
      results: {
        rankings: [{ pilotId: 'p1', rank: 1 }],
        completedAt: '2024-01-01'
      }
    }
  ]

  const mockPilots: Pilot[] = [
    { id: 'p1', name: 'Pilot 1', imageUrl: '' }
  ]

  const containerRef = { current: document.createElement('div') }

  beforeEach(() => {
    vi.clearAllMocks()
    // Setup DOM elements for heats
    document.body.innerHTML = `
      <div id="bracket-container">
        <div id="heat-1"></div>
        <div id="heat-2"></div>
      </div>
    `
    
    // Mock container rect
    mockGetBoundingClientRect.mockReturnValue({
      top: 0, left: 0, right: 1000, bottom: 1000, width: 1000, height: 1000, x: 0, y: 0
    })
  })

  it('renders nothing when visible is false', () => {
    const { container } = render(
      <SVGPilotPaths
        heats={mockHeats}
        pilots={mockPilots}
        containerRef={containerRef}
        visible={false}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders SVG when visible is true', () => {
    render(
      <SVGPilotPaths
        heats={mockHeats}
        pilots={mockPilots}
        containerRef={containerRef}
        visible={true}
      />
    )
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveStyle({ zIndex: '2', position: 'absolute' })
  })

  it('defines markers for arrows and elimination', () => {
    render(
      <SVGPilotPaths
        heats={mockHeats}
        pilots={mockPilots}
        containerRef={containerRef}
        visible={true}
      />
    )
    expect(document.getElementById('pilot-arrow')).toBeInTheDocument()
    expect(document.getElementById('pilot-x')).toBeInTheDocument()
  })

  it('renders paths for pilots with completed heats', async () => {
    // Mock positions for heat elements
    const heat1 = document.getElementById('heat-1')
    const heat2 = document.getElementById('heat-2')
    
    if (heat1) {
        heat1.getBoundingClientRect = vi.fn().mockReturnValue({
            top: 100, left: 100, right: 200, bottom: 200, width: 100, height: 100, x: 100, y: 100
        })
    }
    if (heat2) {
        heat2.getBoundingClientRect = vi.fn().mockReturnValue({
            top: 300, left: 300, right: 400, bottom: 400, width: 100, height: 100, x: 300, y: 300
        })
    }

    render(
      <SVGPilotPaths
        heats={mockHeats}
        pilots={mockPilots}
        containerRef={containerRef}
        visible={true}
      />
    )

    // Wait for effect to run (setTimeout 100ms in component)
    await new Promise(resolve => setTimeout(resolve, 150))

    const paths = document.querySelectorAll('path[data-pilot-id="p1"]')
    expect(paths.length).toBeGreaterThan(0)
    
    const path = paths[0]
    expect(path).toHaveAttribute('d')
    expect(path.getAttribute('d')).toContain('C') // Should use Cubic bezier
    expect(path).toHaveAttribute('stroke')
    expect(path).toHaveAttribute('marker-end', 'url(#pilot-arrow)')
  })

  it('uses pilot avatar position when avatar element exists', async () => {
    // Add pilot avatar elements to the DOM
    document.body.innerHTML = `
      <div id="bracket-container">
        <div id="heat-1">
          <img id="pilot-avatar-p1-heat-1" />
        </div>
        <div id="heat-2">
          <img id="pilot-avatar-p1-heat-2" />
        </div>
      </div>
    `
    
    // Mock avatar positions (different from heat center)
    const heat1 = document.getElementById('heat-1')
    const heat2 = document.getElementById('heat-2')
    const avatar1 = document.getElementById('pilot-avatar-p1-heat-1')
    const avatar2 = document.getElementById('pilot-avatar-p1-heat-2')
    
    if (heat1) {
        heat1.getBoundingClientRect = vi.fn().mockReturnValue({
            top: 100, left: 100, right: 200, bottom: 200, width: 100, height: 100, x: 100, y: 100
        })
    }
    if (heat2) {
        heat2.getBoundingClientRect = vi.fn().mockReturnValue({
            top: 300, left: 300, right: 400, bottom: 400, width: 100, height: 100, x: 300, y: 300
        })
    }

    // Avatar at left edge of heat, 20px wide
    if (avatar1) {
        avatar1.getBoundingClientRect = vi.fn().mockReturnValue({
            top: 120, left: 100, right: 120, bottom: 140, width: 20, height: 20, x: 100, y: 120
        })
    }
    if (avatar2) {
        avatar2.getBoundingClientRect = vi.fn().mockReturnValue({
            top: 320, left: 300, right: 320, bottom: 340, width: 20, height: 20, x: 300, y: 320
        })
    }

    render(
      <SVGPilotPaths
        heats={mockHeats}
        pilots={mockPilots}
        containerRef={containerRef}
        visible={true}
      />
    )

    await new Promise(resolve => setTimeout(resolve, 150))

    const paths = document.querySelectorAll('path[data-pilot-id="p1"]')
    expect(paths.length).toBeGreaterThan(0)
    
    const pathD = paths[0].getAttribute('d')
    // Path should start at avatar right edge (120) + offset (8) = 128
    // Avatar is at x=100, width=20 -> right=120
    expect(pathD).toContain('M 128')
  })
})

describe('BracketHeatBox rank-badge', () => {
  const mockHeatWithRanking: Heat = {
    id: 'heat-1',
    heatNumber: 1,
    roundNumber: 1,
    bracketType: 'winner',
    status: 'completed',
    pilotIds: ['p1', 'p2'],
    results: {
      rankings: [
        { pilotId: 'p1', rank: 1 },
        { pilotId: 'p2', rank: 2 }
      ],
      completedAt: '2024-01-01'
    }
  }

  const mockPilots: Pilot[] = [
    { id: 'p1', name: 'Pilot 1', imageUrl: '' },
    { id: 'p2', name: 'Pilot 2', imageUrl: '' }
  ]

  it('renders rank-badge with correct ID when pilot has ranking', () => {
    render(
      <BracketHeatBox
        heat={mockHeatWithRanking}
        pilots={mockPilots}
        bracketType="winner"
      />
    )

    const rankBadge1 = document.getElementById('rank-badge-p1-heat-1')
    const rankBadge2 = document.getElementById('rank-badge-p2-heat-1')
    
    expect(rankBadge1).toBeInTheDocument()
    expect(rankBadge1).toHaveTextContent('1')
    expect(rankBadge2).toBeInTheDocument()
    expect(rankBadge2).toHaveTextContent('2')
  })

  it('does not render rank-badge for pending heats', () => {
    const pendingHeat: Heat = {
      ...mockHeatWithRanking,
      status: 'pending',
      results: undefined
    }

    render(
      <BracketHeatBox
        heat={pendingHeat}
        pilots={mockPilots}
        bracketType="winner"
      />
    )

    const rankBadge = document.getElementById('rank-badge-p1-heat-1')
    expect(rankBadge).toBeNull()
  })
})
