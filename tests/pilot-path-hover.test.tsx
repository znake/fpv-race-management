import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SVGPilotPaths } from '../src/components/bracket/SVGPilotPaths'
import type { Heat, Pilot } from '../src/types'

// Mock getBoundingClientRect
const mockGetBoundingClientRect = vi.fn()
Element.prototype.getBoundingClientRect = mockGetBoundingClientRect

describe('SVGPilotPaths Hover Interaction', () => {
  const mockHeats: Heat[] = [
    {
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
    },
    {
      id: 'heat-2',
      heatNumber: 2,
      roundNumber: 2,
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
  ]

  const mockPilots: Pilot[] = [
    { id: 'p1', name: 'Pilot 1', imageUrl: '' },
    { id: 'p2', name: 'Pilot 2', imageUrl: '' }
  ]

  const containerRef = { current: document.createElement('div') }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    document.body.innerHTML = `
      <div id="bracket-container">
        <div id="heat-1"></div>
        <div id="heat-2"></div>
      </div>
    `
    mockGetBoundingClientRect.mockReturnValue({
      top: 0, left: 0, right: 1000, bottom: 1000, width: 1000, height: 1000, x: 0, y: 0
    })
  })

  const setup = async () => {
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

    const result = render(
      <SVGPilotPaths
        heats={mockHeats}
        pilots={mockPilots}
        containerRef={containerRef}
        visible={true}
      />
    )

    // Wait for initial ready timer
    act(() => {
      vi.advanceTimersByTime(150)
    })

    // Trigger resize to force path calculation
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    // Wait for any state updates from resize
    act(() => {
      vi.advanceTimersByTime(10)
    })

    // Re-render with same props to ensure paths are in state
    result.rerender(
      <SVGPilotPaths
        heats={mockHeats}
        pilots={mockPilots}
        containerRef={containerRef}
        visible={true}
      />
    )

    return result
  }

  it('highlights hovered path and fades others after debounce', async () => {
    const { container } = await setup()

    const pathP1 = container.querySelector('path[data-pilot-id="p1"]')
    const pathP2 = container.querySelector('path[data-pilot-id="p2"]')

    expect(pathP1).toBeInTheDocument()
    expect(pathP2).toBeInTheDocument()

    // Initial state
    expect(pathP1).not.toHaveClass('pilot-path-highlighted')
    expect(pathP1).not.toHaveClass('pilot-path-faded')
    expect(pathP2).not.toHaveClass('pilot-path-highlighted')
    expect(pathP2).not.toHaveClass('pilot-path-faded')

    // Hover P1
    fireEvent.mouseEnter(pathP1!)

    // Should not change immediately (debounce 50ms)
    expect(pathP1).not.toHaveClass('pilot-path-highlighted')

    act(() => {
      vi.advanceTimersByTime(50)
    })

    expect(pathP1).toHaveClass('pilot-path-highlighted')
    expect(pathP1).toHaveAttribute('opacity', '1')
    expect(pathP1).toHaveAttribute('stroke-width', '2.5')
    
    expect(pathP2).toHaveClass('pilot-path-faded')
    expect(pathP2).toHaveAttribute('opacity', '0.15')
  })

  it('resets paths on mouse leave after debounce', async () => {
    const { container } = await setup()

    const pathP1 = container.querySelector('path[data-pilot-id="p1"]')
    
    // Hover P1
    fireEvent.mouseEnter(pathP1!)
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(pathP1).toHaveClass('pilot-path-highlighted')

    // Leave P1
    fireEvent.mouseLeave(pathP1!)
    
    // Should not reset immediately
    expect(pathP1).toHaveClass('pilot-path-highlighted')

    act(() => {
      vi.advanceTimersByTime(50)
    })

    expect(pathP1).not.toHaveClass('pilot-path-highlighted')
    expect(pathP1).not.toHaveClass('pilot-path-faded')
    expect(pathP1).toHaveAttribute('opacity', '0.6')
    expect(pathP1).toHaveAttribute('stroke-width', '1.5')
  })

  it('prevents flicker with rapid hover changes', async () => {
    const { container } = await setup()

    const pathP1 = container.querySelector('path[data-pilot-id="p1"]')
    const pathP2 = container.querySelector('path[data-pilot-id="p2"]')

    // Hover P1
    fireEvent.mouseEnter(pathP1!)
    act(() => {
      vi.advanceTimersByTime(20) // Less than 50ms
    })
    
    // Quickly move to P2
    fireEvent.mouseLeave(pathP1!)
    fireEvent.mouseEnter(pathP2!)
    
    act(() => {
      vi.advanceTimersByTime(30) // Total 50ms since P1 enter, but P2 enter was later
    })

    // P1 should not be highlighted because it was left before 50ms
    expect(pathP1).not.toHaveClass('pilot-path-highlighted')
    
    act(() => {
      vi.advanceTimersByTime(20) // Now 50ms since P2 enter
    })
    
    expect(pathP2).toHaveClass('pilot-path-highlighted')
  })
})
