import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { PlacementEntryModal } from '@/components/placement-entry-modal'
import { createMockPilots, resetMockPilotCounter } from './helpers/mock-factories'
import type { Heat } from '@/types'

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
    it('should accumulate digits and submit lapTimeMs on Enter', () => {
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

      fireEvent.keyDown(window, { key: '0' })
      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: '9' })
      fireEvent.keyDown(window, { key: 'Enter' })

      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[1].id}`))

      fireEvent.click(screen.getByTestId('submit-placement-btn'))

      expect(mockOnSubmitResults).toHaveBeenCalledWith(mockHeat.id, [
        { pilotId: mockPilots[0].id, rank: 1, lapTimeMs: 59000 },
        { pilotId: mockPilots[1].id, rank: 2, lapTimeMs: undefined },
      ])
    })

    it('should not record time when cancelled with Escape', () => {
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

      fireEvent.keyDown(window, { key: '0' })
      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: '9' })
      fireEvent.keyDown(window, { key: 'Escape' })

      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[1].id}`))
      fireEvent.click(screen.getByTestId('submit-placement-btn'))

      expect(mockOnSubmitResults).toHaveBeenCalledWith(mockHeat.id, [
        { pilotId: mockPilots[0].id, rank: 1, lapTimeMs: undefined },
        { pilotId: mockPilots[1].id, rank: 2, lapTimeMs: undefined },
      ])
    })

    it('should capture digits 1-4 as time digits when time entry mode is active', () => {
      render(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={true}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

      const pilotA = screen.getByTestId(`pilot-card-${mockPilots[0].id}`)
      fireEvent.click(pilotA)

      fireEvent.keyDown(window, { key: '1' })
      fireEvent.keyDown(window, { key: '0' })
      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: 'Enter' })

      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[1].id}`))
      fireEvent.click(screen.getByTestId('submit-placement-btn'))

      expect(mockOnSubmitResults).toHaveBeenCalledWith(mockHeat.id, [
        { pilotId: mockPilots[0].id, rank: 1, lapTimeMs: 65000 },
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

    it('should discard pending digits on modal close', () => {
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

      rerender(
        <PlacementEntryModal
          heat={mockHeat}
          pilots={mockPilots}
          isOpen={false}
          onClose={mockOnClose}
          onSubmitResults={mockOnSubmitResults}
        />
      )

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

    it('should show overlay with formatted time while typing', () => {
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
      fireEvent.keyDown(window, { key: '1' })

      expect(screen.getByTestId('time-entry-overlay')).not.toBeNull()
      expect(screen.getByText('1:__')).not.toBeNull()

      fireEvent.keyDown(window, { key: '2' })
      expect(screen.getByText('1:2_')).not.toBeNull()

      fireEvent.keyDown(window, { key: '3' })
      expect(screen.getByText('1:23')).not.toBeNull()
    })

    it('should delete last digit on Backspace', () => {
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
      fireEvent.keyDown(window, { key: '1' })
      fireEvent.keyDown(window, { key: '2' })
      fireEvent.keyDown(window, { key: '3' })

      expect(screen.getByText('1:23')).not.toBeNull()

      fireEvent.keyDown(window, { key: 'Backspace' })
      expect(screen.getByText('1:2_')).not.toBeNull()

      fireEvent.keyDown(window, { key: 'Backspace' })
      expect(screen.getByText('1:__')).not.toBeNull()

      fireEvent.keyDown(window, { key: 'Backspace' })
      expect(screen.queryByTestId('time-entry-overlay')).toBeNull()
    })

    it('should clear time entry on Escape without affecting rankings', () => {
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
      expect(screen.queryByText('1')).not.toBeNull()

      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: '9' })
      expect(screen.getByTestId('time-entry-overlay')).not.toBeNull()

      fireEvent.keyDown(window, { key: 'Escape' })

      expect(screen.queryByTestId('time-entry-overlay')).toBeNull()
      expect(screen.queryByText('1')).not.toBeNull()
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
