import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
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

      expect(screen.getByTestId('placement-entry-modal')).toBeInTheDocument()
      expect(screen.getByText('WB H1')).toBeInTheDocument()
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

      expect(screen.queryByTestId('placement-entry-modal')).not.toBeInTheDocument()
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
        expect(screen.getByTestId(`pilot-card-${pilot.id}`)).toBeInTheDocument()
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

      expect(screen.getByText('GRAND FINALE')).toBeInTheDocument()
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

      expect(screen.getByText('LB H2')).toBeInTheDocument()
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
      expect(screen.getByText('1')).toBeInTheDocument()
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
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
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
      expect(screen.getByText('1')).toBeInTheDocument()

      // Click again to remove
      fireEvent.click(pilotCard)
      expect(screen.queryByText('1')).not.toBeInTheDocument()
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
      expect(submitBtn).toBeDisabled()
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
      expect(submitBtn).toBeDisabled()
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
      expect(submitBtn).toBeEnabled()
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
        { pilotId: mockPilots[0].id, rank: 1 },
        { pilotId: mockPilots[1].id, rank: 2 },
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
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
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
      expect(screen.queryByTestId('reset-rankings-btn')).not.toBeInTheDocument()

      // Add a ranking
      fireEvent.click(screen.getByTestId(`pilot-card-${mockPilots[0].id}`))

      // Reset button should appear
      expect(screen.getByTestId('reset-rankings-btn')).toBeInTheDocument()
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

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()

      // Click reset
      fireEvent.click(screen.getByTestId('reset-rankings-btn'))

      // Rankings should be gone
      expect(screen.queryByText('1')).not.toBeInTheDocument()
      expect(screen.queryByText('2')).not.toBeInTheDocument()
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
      expect(screen.getByText('2')).toBeInTheDocument()
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
      expect(screen.queryByText('4')).not.toBeInTheDocument()
      expect(screen.queryByText('1')).not.toBeInTheDocument()
      expect(screen.queryByText('2')).not.toBeInTheDocument()
      expect(screen.queryByText('3')).not.toBeInTheDocument()
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
      expect(submitBtn).toBeEnabled()
    })
  })
})
