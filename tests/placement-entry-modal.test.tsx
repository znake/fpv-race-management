import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { PlacementEntryModal } from '../src/components/placement-entry-modal'
import { createMockPilots, resetMockPilotCounter } from './helpers/mock-factories'
import type { Heat } from '../src/types'

describe('PlacementEntryModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSubmitResults = vi.fn()
  let mockPilots: ReturnType<typeof createMockPilots>
  let mockHeat: Heat

  beforeEach(() => {
    cleanup()
    resetMockPilotCounter()
    mockOnClose.mockClear()
    mockOnSubmitResults.mockClear()

    mockPilots = createMockPilots(4)
    mockHeat = {
      id: 'wb-heat-1',
      heatNumber: 1,
      pilotIds: mockPilots.map(p => p.id),
      status: 'active',
      bracketType: 'winner',
    }
  })

  describe('Rendering', () => {
    it('should render modal with heat info when open', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      expect(screen.queryByTestId('placement-entry-modal')).not.toBeNull()
      expect(screen.queryByText('WB H1')).not.toBeNull()
    })

    it('should not render modal when closed', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={false}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      expect(screen.queryByTestId('placement-entry-modal')).toBeNull()
    })

    it('should render all pilot cards', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      mockPilots.forEach(pilot => {
        expect(screen.queryByTestId(`pilot-card-${pilot.id}`)).not.toBeNull()
      })
    })

    it('should show Grand Finale label for finale heat', () => {
      const finaleHeat: Heat = {
        ...mockHeat,
        bracketType: 'finale',
      }

      render(
        <PlacementEntryModal
          heat={finaleHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      expect(screen.queryByText('GRAND FINALE')).not.toBeNull()
    })

    it('should show LB label for loser bracket heat', () => {
      const lbHeat: Heat = {
        ...mockHeat,
        bracketType: 'loser',
        heatNumber: 2,
      }

      render(
        <PlacementEntryModal
          heat={lbHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      expect(screen.queryByText('LB H2')).not.toBeNull()
    })
  })

  describe('Ranking Logic', () => {
    it('should assign rank on pilot click', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      const firstPilotCard = screen.getByTestId(`pilot-card-${mockPilots[0].id}`)
      fireEvent.click(firstPilotCard)

      // Rank badge should appear with "1"
      expect(screen.queryByText('1')).not.toBeNull()
    })

    it('should assign sequential ranks on multiple clicks', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      // Click first three pilots
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[0].id}`))
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[1].id}`))
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[2].id}`))

      // All three ranks should be visible
      expect(screen.queryByText('1')).not.toBeNull()
      expect(screen.queryByText('2')).not.toBeNull()
      expect(screen.queryByText('3')).not.toBeNull()
    })

    it('should remove rank when clicking ranked pilot', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      const pilotCard = screen.getByTestId(`pilot-card-${mockPilots[0].id}`)
      
      // Click to assign rank
      fireEvent.click(pilotCard)
      expect(screen.queryByText('1')).not.toBeNull()

      // Click again to remove
      fireEvent.click(pilotCard)
      expect(screen.queryByText('1')).toBeNull()
    })
  })

  describe('Submit Button', () => {
    it('should be disabled with no rankings', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      const submitBtn = screen.getByTestId('submit-placement-btn')
      expect((submitBtn as HTMLButtonElement).disabled).toBe(true)
    })

    it('should be disabled with only 1 ranking (when 4 pilots)', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[0].id}`))

      const submitBtn = screen.getByTestId('submit-placement-btn')
      expect((submitBtn as HTMLButtonElement).disabled).toBe(true)
    })

    it('should be enabled with 2 rankings', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[0].id}`))
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[1].id}`))

      const submitBtn = screen.getByTestId('submit-placement-btn')
      expect((submitBtn as HTMLButtonElement).disabled).toBe(false)
    })

    it('should call onSubmitResults with correct data on submit', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      // Assign ranks to first two pilots
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[0].id}`))
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[1].id}`))

      // Submit
      fireEvent.click(screen.getByTestId('submit-placement-btn'))

      expect(mockOnSubmitResults).toHaveBeenCalledWith(mockHeat.id, [
        { pilotId: mockPilots[0].id, rank: 1, lapTimeMs: undefined },
        { pilotId: mockPilots[1].id, rank: 2, lapTimeMs: undefined },
      ])
    })
  })

  describe('Pre-fill from existing results', () => {
    it('should pre-fill rankings from heat.results', () => {
      const heatWithResults: Heat = {
        ...mockHeat,
        results: {
          rankings: [
            { pilotId: mockPilots[0].id, rank: 1 },
            { pilotId: mockPilots[1].id, rank: 2 },
          ],
          completedAt: new Date().toISOString(),
        },
      }

      render(
        <PlacementEntryModal
          heat={heatWithResults}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      // Rank badges should be visible
      expect(screen.queryByText('1')).not.toBeNull()
      expect(screen.queryByText('2')).not.toBeNull()
    })
  })

  describe('Lap time digit accumulation', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should accumulate digits within 2s and submit lapTimeMs', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      // Click Pilot A -> rank 1, opens time window
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[0].id}`))

      // Enter "59" within 2s
      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: '9' })

      // Finalize after inactivity window
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // Click Pilot B -> rank 2 (submit enabled)
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[1].id}`))

      fireEvent.click(screen.getByTestId('submit-placement-btn'))

      expect(mockOnSubmitResults).toHaveBeenCalledWith(mockHeat.id, [
        { pilotId: mockPilots[0].id, rank: 1, lapTimeMs: 59000 },
        { pilotId: mockPilots[1].id, rank: 2, lapTimeMs: undefined },
      ])
    })

    it('should not record time when typing after the 2s window closed', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[0].id}`))

      // Let window expire
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      // Type after window -> ignored
      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: '9' })
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[1].id}`))
      fireEvent.click(screen.getByTestId('submit-placement-btn'))

      expect(mockOnSubmitResults).toHaveBeenCalledWith(mockHeat.id, [
        { pilotId: mockPilots[0].id, rank: 1, lapTimeMs: undefined },
        { pilotId: mockPilots[1].id, rank: 2, lapTimeMs: undefined },
      ])
    })

    it('should treat keys 1-4 as rank keys and not time digits', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      // Click Pilot A (rank 1) and keep it focused
      const pilotA = screen.getByTestId(`pilot-card-${mockPilots[0].id}`)
      fireEvent.click(pilotA)

      // If "1" was incorrectly treated as time digit, "105" would be parsed as 1:05 (valid)
      fireEvent.keyDown(window, { key: '1' })
      fireEvent.keyDown(window, { key: '0' })
      fireEvent.keyDown(window, { key: '5' })

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[1].id}`))
      fireEvent.click(screen.getByTestId('submit-placement-btn'))

      expect(mockOnSubmitResults).toHaveBeenCalledWith(mockHeat.id, [
        { pilotId: mockPilots[0].id, rank: 1, lapTimeMs: undefined },
        { pilotId: mockPilots[1].id, rank: 2, lapTimeMs: undefined },
      ])
    })

    it('should prefill lapTimes from existing results and include them on submit', () => {
      const heatWithResults: Heat = {
        ...mockHeat,
        results: {
          rankings: [
            { pilotId: mockPilots[0].id, rank: 1, lapTimeMs: 59000 },
            { pilotId: mockPilots[1].id, rank: 2 },
          ],
          completedAt: new Date().toISOString(),
        },
      }

      render(
        <PlacementEntryModal
          heat={heatWithResults}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      fireEvent.click(screen.getByTestId('submit-placement-btn'))

      expect(mockOnSubmitResults).toHaveBeenCalledWith(heatWithResults.id, [
        { pilotId: mockPilots[0].id, rank: 1, lapTimeMs: 59000 },
        { pilotId: mockPilots[1].id, rank: 2, lapTimeMs: undefined },
      ])
    })

    it('should cleanup timer and discard pending digits on modal close', () => {
      const { rerender } = render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[0].id}`))
      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: '9' })

      // Close before the 2s timeout triggers finalize
      rerender(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={false}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      // Let any pending timers run; should not crash or save
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      // Reopen and submit: no lapTimeMs should be present
      rerender(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[0].id}`))
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[1].id}`))
      fireEvent.click(screen.getByTestId('submit-placement-btn'))

      expect(mockOnSubmitResults).toHaveBeenCalledWith(mockHeat.id, [
        { pilotId: mockPilots[0].id, rank: 1, lapTimeMs: undefined },
        { pilotId: mockPilots[1].id, rank: 2, lapTimeMs: undefined },
      ])
    })
  })

  describe('Reset functionality', () => {
    it('should show reset button when rankings exist', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      // Initially no reset button
      expect(screen.queryByTestId('reset-rankings-btn')).toBeNull()

      // Add a ranking
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[0].id}`))

      // Reset button should appear
      expect(screen.queryByTestId('reset-rankings-btn')).not.toBeNull()
    })

    it('should clear all rankings on reset click', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      // Add rankings
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[0].id}`))
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[1].id}`))

      expect(screen.queryByText('1')).not.toBeNull()
      expect(screen.queryByText('2')).not.toBeNull()

      // Click reset
      fireEvent.click(screen.getByTestId('reset-rankings-btn'))

      // Rankings should be gone
      expect(screen.queryByText('1')).toBeNull()
      expect(screen.queryByText('2')).toBeNull()
    })
  })

  describe('Keyboard shortcuts', () => {
    it('should assign direct rank via number keys when pilot is focused', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      const pilotCard = screen.getByTestId(`pilot-card-${mockPilots[0].id}`)
      
      // Focus the pilot card
      pilotCard.focus()
      
      // Press "2" key
      fireEvent.keyDown(window, { key: '2' })

      // Rank 2 should be assigned
      expect(screen.queryByText('2')).not.toBeNull()
    })

    it('should ignore rank assignment when pressing rank higher than pilot count', () => {
      const threePilots = mockPilots.slice(0, 3)
      const threePilotHeat: Heat = {
        ...mockHeat,
        pilotIds: threePilots.map(p => p.id),
      }

      render(
        <PlacementEntryModal
          heat={threePilotHeat}
          pilots={threePilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      const pilotCard = screen.getByTestId(`pilot-card-${threePilots[0].id}`)
      
      // Focus the pilot card
      pilotCard.focus()
      
      // Press "4" key - should be ignored since only 3 pilots
      fireEvent.keyDown(window, { key: '4' })

      // No rank badge should appear
      expect(screen.queryByText('4')).toBeNull()
      expect(screen.queryByText('1')).toBeNull()
      expect(screen.queryByText('2')).toBeNull()
      expect(screen.queryByText('3')).toBeNull()
    })
  })

  describe('3-pilot heats', () => {
    it('should enable submit with 2 rankings for 3-pilot heat', () => {
      const threePilots = mockPilots.slice(0, 3)
      const threePilotHeat: Heat = {
        ...mockHeat,
        pilotIds: threePilots.map(p => p.id),
      }

      render(
        <PlacementEntryModal
          heat={threePilotHeat}
          pilots={threePilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      // Assign 2 rankings
      fireEvent.click(screen.getByTestId(`pilot-card-${threePilots[0].id}`))
      fireEvent.click(screen.getByTestId(`pilot-card-${threePilots[1].id}`))

      const submitBtn = screen.getByTestId('submit-placement-btn')
      expect((submitBtn as HTMLButtonElement).disabled).toBe(false)
    })
  })
})
