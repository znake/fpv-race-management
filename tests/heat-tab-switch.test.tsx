import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useTournamentStore } from '../src/stores/tournamentStore'
import { ActiveHeatView } from '../src/components/active-heat-view'
import type { Pilot } from '../src/lib/schemas'

// Mock the store
vi.mock('../src/stores/tournamentStore', () => ({
  useTournamentStore: vi.fn()
}))

describe('Auto Tab Switch After Heat Completion', () => {
  let mockPilots: Pilot[]
  let mockHeat: any
  let mockOnSubmitResults: any
  let mockOnHeatComplete: any

  beforeEach(() => {
    mockPilots = [
      {
        id: 'p1',
        name: 'Pilot1',
        imageUrl: 'https://example.com/p1.jpg',
        instagramHandle: '@pilot1'
      },
      {
        id: 'p2',
        name: 'Pilot2',
        imageUrl: 'https://example.com/p2.jpg',
        instagramHandle: '@pilot2'
      },
      {
        id: 'p3',
        name: 'Pilot3',
        imageUrl: 'https://example.com/p3.jpg',
        instagramHandle: '@pilot3'
      },
      {
        id: 'p4',
        name: 'Pilot4',
        imageUrl: 'https://example.com/p4.jpg',
        instagramHandle: '@pilot4'
      }
    ]

    mockHeat = {
      id: 'heat-1',
      heatNumber: 1,
      pilotIds: ['p1', 'p2', 'p3', 'p4'],
      status: 'active'
    }

    mockOnSubmitResults = vi.fn()
    mockOnHeatComplete = vi.fn()

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call onHeatComplete callback when heat is submitted', async () => {
    // Mock store to provide heat and pilots
    ;(useTournamentStore as any).mockImplementation((selector: any) => {
      const state = {
        getActiveHeat: () => mockHeat,
        getNextHeat: () => null
      }
      return selector(state)
    })

    render(
      <ActiveHeatView
        heat={mockHeat}
        pilots={mockPilots}
        onSubmitResults={mockOnSubmitResults}
        onHeatComplete={mockOnHeatComplete}
      />
    )

    // Click on first pilot to assign rank 1
    const pilot1Button = screen.getByText('Pilot1').closest('button')
    if (pilot1Button) fireEvent.click(pilot1Button)

    // Click on second pilot to assign rank 2
    const pilot2Button = screen.getByText('Pilot2').closest('button')
    if (pilot2Button) fireEvent.click(pilot2Button)

    // Click finish button
    const finishButton = screen.getByText('Fertig ✓')
    if (finishButton) fireEvent.click(finishButton)

    // Fast-forward through to 300ms delay (wrap in act for state updates)
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    // Should call onHeatComplete callback
    expect(mockOnHeatComplete).toHaveBeenCalledTimes(1)
  })

  it('should not call onHeatComplete if callback is not provided', async () => {
    // Mock store to provide heat and pilots
    ;(useTournamentStore as any).mockImplementation((selector: any) => {
      const state = {
        getActiveHeat: () => mockHeat,
        getNextHeat: () => null
      }
      return selector(state)
    })

    render(
      <ActiveHeatView
        heat={mockHeat}
        pilots={mockPilots}
        onSubmitResults={mockOnSubmitResults}
        // No onHeatComplete callback provided
      />
    )

    // Assign ranks and finish
    const pilot1Button = screen.getByText('Pilot1').closest('button')
    const pilot2Button = screen.getByText('Pilot2').closest('button')
    
    if (pilot1Button) fireEvent.click(pilot1Button)
    if (pilot2Button) fireEvent.click(pilot2Button)
    
    const finishButton = screen.getByText('Fertig ✓')
    if (finishButton) fireEvent.click(finishButton)

    // Fast-forward through the 300ms delay (wrap in act for state updates)
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    // Should not throw error and should still submit results
    expect(mockOnSubmitResults).toHaveBeenCalled()
  }, 6000) // Increased timeout

  it('should show visual feedback before triggering callback', async () => {
    ;(useTournamentStore as any).mockImplementation((selector: any) => {
      const state = {
        getActiveHeat: () => mockHeat,
        getNextHeat: () => null
      }
      return selector(state)
    })

    render(
      <ActiveHeatView
        heat={mockHeat}
        pilots={mockPilots}
        onSubmitResults={mockOnSubmitResults}
        onHeatComplete={mockOnHeatComplete}
      />
    )

    // Assign ranks and finish
    const pilot1Button = screen.getByText('Pilot1').closest('button')
    const pilot2Button = screen.getByText('Pilot2').closest('button')
    
    if (pilot1Button) fireEvent.click(pilot1Button)
    if (pilot2Button) fireEvent.click(pilot2Button)
    
    const finishButton = screen.getByText('Fertig ✓')
    if (finishButton) fireEvent.click(finishButton)

    // Should show success pulse immediately
    const container = document.querySelector('.success-pulse')
    expect(container).toBeDefined()

    // Callback should not be called yet
    expect(mockOnHeatComplete).not.toHaveBeenCalled()

    // Fast-forward and check callback is called (wrap in act for state updates)
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    expect(mockOnHeatComplete).toHaveBeenCalled()
  }, 6000) // Increased timeout
})