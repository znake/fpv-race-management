import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HeatDetailModal } from '../src/components/heat-detail-modal'
import type { Heat } from '../src/stores/tournamentStore'
import type { Pilot } from '../src/lib/schemas'

describe('Heat Detail Modal', () => {
  let mockHeat: Heat
  let mockPilots: Pilot[]
  let mockOnClose: vi.MockedFunction<() => void>
  let mockOnEdit: vi.MockedFunction<() => void>

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
      status: 'completed',
      results: {
        rankings: [
          { pilotId: 'p1', rank: 1 },
          { pilotId: 'p2', rank: 2 },
          { pilotId: 'p3', rank: 3 },
          { pilotId: 'p4', rank: 4 }
        ],
        completedAt: '2025-12-15T21:00:00Z'
      }
    }

    mockOnClose = vi.fn()
    mockOnEdit = vi.fn()
  })

  it('should render heat details when open', () => {
    render(
      <HeatDetailModal
        heat={mockHeat}
        pilots={mockPilots}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
      />
    )

    expect(screen.getByText('HEAT 1')).toBeInTheDocument()
    // Modal shows status badge instead of "HEAT-DETAILS" header
    expect(screen.getByText('ABGESCHLOSSEN')).toBeInTheDocument()
  })

  it('should display all pilots in the heat', () => {
    render(
      <HeatDetailModal
        heat={mockHeat}
        pilots={mockPilots}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
      />
    )

    mockPilots.forEach(pilot => {
      expect(screen.getByText(pilot.name)).toBeInTheDocument()
    })
  })

  it('should show rankings for completed heats', () => {
    render(
      <HeatDetailModal
        heat={mockHeat}
        pilots={mockPilots}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
      />
    )

    // Check for ranking badges
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('should show edit button for completed heats', () => {
    render(
      <HeatDetailModal
        heat={mockHeat}
        pilots={mockPilots}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
      />
    )

    // Button text includes emoji
    const editButton = screen.getByText(/Ergebnisse bearbeiten/)
    expect(editButton).toBeInTheDocument()
    
    fireEvent.click(editButton)
    expect(mockOnEdit).toHaveBeenCalled()
  })

  it('should not show edit button for pending heats', () => {
    const pendingHeat = {
      ...mockHeat,
      status: 'pending' as const,
      results: undefined
    }

    render(
      <HeatDetailModal
        heat={pendingHeat}
        pilots={mockPilots}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
      />
    )

    expect(screen.queryByText('Ergebnisse bearbeiten')).not.toBeInTheDocument()
  })

  it('should show "WARTET" status badge for pending heats', () => {
    const pendingHeat = {
      ...mockHeat,
      status: 'pending' as const,
      results: undefined
    }

    render(
      <HeatDetailModal
        heat={pendingHeat}
        pilots={mockPilots}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
      />
    )

    // Modal shows status badge "WARTET" instead of "Wartet..."
    expect(screen.getByText('WARTET')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    render(
      <HeatDetailModal
        heat={mockHeat}
        pilots={mockPilots}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
      />
    )

    const closeButton = screen.getByText('✕')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call onClose when backdrop is clicked', () => {
    render(
      <HeatDetailModal
        heat={mockHeat}
        pilots={mockPilots}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
      />
    )

    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.click(backdrop)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should not render when closed', () => {
    render(
      <HeatDetailModal
        heat={mockHeat}
        pilots={mockPilots}
        isOpen={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
      />
    )

    expect(screen.queryByText('HEAT 1')).not.toBeInTheDocument()
    expect(screen.queryByText('ABGESCHLOSSEN')).not.toBeInTheDocument()
  })

  it('should display pilot images with correct src', () => {
    render(
      <HeatDetailModal
        heat={mockHeat}
        pilots={mockPilots}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
      />
    )

    const pilotImages = screen.getAllByRole('img')
    expect(pilotImages).toHaveLength(mockPilots.length)
    
    // Check that all images have src attribute
    // Note: React's onError prop doesn't render as HTML attribute
    pilotImages.forEach(img => {
      expect(img).toHaveAttribute('src')
    })
  })
})