import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PilotCard } from '../src/components/pilot-card'

// Mock pilot data
const mockPilot = {
  id: 'test-pilot-1',
  name: 'Test Pilot',
  imageUrl: 'https://example.com/image.jpg',
  instagramHandle: '@test_pilot'
}

describe('PilotCard', () => {
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnMarkDroppedOut = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders pilot information correctly', () => {
    render(
      <PilotCard 
        pilot={mockPilot}
      />
    )

    expect(screen.getByText('Test Pilot')).toBeInTheDocument()
    expect(screen.getByText('@test_pilot')).toBeInTheDocument()
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
    expect(image).toHaveAttribute('alt', 'Test Pilot')
  })

  it('shows action buttons in DOM (visible on hover)', () => {
    render(
      <PilotCard 
        pilot={mockPilot}
        tournamentStarted={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMarkDroppedOut={mockOnMarkDroppedOut}
      />
    )

    // Buttons are always in DOM, just with opacity-0 until hover
    expect(screen.getByTitle('Bearbeiten')).toBeInTheDocument()
    expect(screen.getByTitle('Löschen')).toBeInTheDocument()
  })

  it('shows dropout button when tournament is started', () => {
    render(
      <PilotCard 
        pilot={mockPilot}
        tournamentStarted={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMarkDroppedOut={mockOnMarkDroppedOut}
      />
    )

    expect(screen.getByTitle('Als ausgefallen markieren')).toBeInTheDocument()
    expect(screen.queryByTitle('Bearbeiten')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Löschen')).not.toBeInTheDocument()
  })

  it('enters edit mode when edit button is clicked', () => {
    render(
      <PilotCard 
        pilot={mockPilot}
        tournamentStarted={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMarkDroppedOut={mockOnMarkDroppedOut}
      />
    )

    const editButton = screen.getByTitle('Bearbeiten')
    fireEvent.click(editButton)

    expect(screen.getByDisplayValue('Test Pilot')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://example.com/image.jpg')).toBeInTheDocument()
    expect(screen.getByText('Speichern')).toBeInTheDocument()
    expect(screen.getByText('Abbrechen')).toBeInTheDocument()
  })

  it('calls onEdit when save is clicked with valid data', async () => {
    render(
      <PilotCard 
        pilot={mockPilot}
        tournamentStarted={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMarkDroppedOut={mockOnMarkDroppedOut}
      />
    )

    // Enter edit mode
    const editButton = screen.getByTitle('Bearbeiten')
    fireEvent.click(editButton)

    // Change name
    const nameInput = screen.getByDisplayValue('Test Pilot')
    fireEvent.change(nameInput, { target: { value: 'Updated Pilot' } })

    // Save
    const saveButton = screen.getByText('Speichern')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith('test-pilot-1', {
        name: 'Updated Pilot'
      })
    })
  })

  it('shows delete confirmation dialog when delete button is clicked', () => {
    render(
      <PilotCard 
        pilot={mockPilot}
        tournamentStarted={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMarkDroppedOut={mockOnMarkDroppedOut}
      />
    )

    const deleteButton = screen.getByTitle('Löschen')
    fireEvent.click(deleteButton)

    // Check if confirmation dialog appears
    expect(screen.getByText('Pilot wirklich löschen?')).toBeInTheDocument()
    expect(screen.getByText('Diese Aktion kann nicht rückgängig gemacht werden.')).toBeInTheDocument()
  })

  it('calls onDelete when delete is confirmed', () => {
    render(
      <PilotCard 
        pilot={mockPilot}
        tournamentStarted={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMarkDroppedOut={mockOnMarkDroppedOut}
      />
    )

    // Click delete button to show dialog
    const deleteButton = screen.getByTitle('Löschen')
    fireEvent.click(deleteButton)

    // Click confirm button
    const confirmButton = screen.getByText('Löschen')
    fireEvent.click(confirmButton)

    expect(mockOnDelete).toHaveBeenCalledWith('test-pilot-1')
  })

  it('calls onMarkDroppedOut when dropout button is clicked', () => {
    render(
      <PilotCard 
        pilot={mockPilot}
        tournamentStarted={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMarkDroppedOut={mockOnMarkDroppedOut}
      />
    )

    const dropoutButton = screen.getByTitle('Als ausgefallen markieren')
    fireEvent.click(dropoutButton)

    expect(mockOnMarkDroppedOut).toHaveBeenCalledWith('test-pilot-1')
  })

  it('displays dropped out badge when pilot is dropped out', () => {
    const droppedOutPilot = { ...mockPilot, droppedOut: true }

    render(
      <PilotCard 
        pilot={droppedOutPilot}
        tournamentStarted={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMarkDroppedOut={mockOnMarkDroppedOut}
      />
    )

    expect(screen.getByText('AUSGEFALLEN')).toBeInTheDocument()
  })

  it('cancels edit mode when cancel button is clicked', () => {
    render(
      <PilotCard 
        pilot={mockPilot}
        tournamentStarted={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMarkDroppedOut={mockOnMarkDroppedOut}
      />
    )

    // Enter edit mode
    const editButton = screen.getByTitle('Bearbeiten')
    fireEvent.click(editButton)

    // Change name
    const nameInput = screen.getByDisplayValue('Test Pilot')
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } })

    // Cancel
    const cancelButton = screen.getByText('Abbrechen')
    fireEvent.click(cancelButton)

    // Should exit edit mode and show original name
    expect(screen.queryByDisplayValue('Test Pilot')).not.toBeInTheDocument()
    expect(screen.getByText('Test Pilot')).toBeInTheDocument()
    expect(mockOnEdit).not.toHaveBeenCalled()
  })

  it('shows rank badge when rank is provided', () => {
    render(
      <PilotCard 
        pilot={mockPilot} 
        rank={1}
      />
    )

    const rankBadge = screen.getByText('1')
    expect(rankBadge).toBeInTheDocument()
    expect(rankBadge).toHaveClass('bg-gold', 'shadow-glow-gold', 'text-void')
  })

  it('handles image error gracefully', () => {
    render(
      <PilotCard 
        pilot={mockPilot}
      />
    )

    const image = screen.getByRole('img')
    fireEvent.error(image)

    // Should use offline-first SVG fallback (data URL)
    const src = image.getAttribute('src')
    expect(src).toMatch(/^data:image\/svg\+xml/)
  })
})