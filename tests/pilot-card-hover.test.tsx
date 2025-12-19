import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PilotCard } from '../src/components/pilot-card'

const mockPilot = {
  id: 'test-pilot-1',
  name: 'Test Pilot',
  imageUrl: 'https://example.com/image.jpg',
  instagramHandle: '@test_pilot'
}

describe('PilotCard - Hover Actions', () => {
  const mockOnEdit = vi.fn().mockReturnValue(true)
  const mockOnDelete = vi.fn().mockReturnValue(true)
  const mockOnMarkDroppedOut = vi.fn().mockReturnValue(true)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows action buttons on hover', () => {
    render(
      <PilotCard 
        pilot={mockPilot}
        tournamentStarted={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMarkDroppedOut={mockOnMarkDroppedOut}
      />
    )

    // Find the card
    const card = screen.getByText('Test Pilot').closest('.pilot-card')
    expect(card).toBeTruthy()

    // Hover over the card
    fireEvent.mouseEnter(card!)

    // Now the buttons should be visible (opacity-100)
    const deleteButton = screen.getByTitle('Löschen')
    expect(deleteButton).toBeInTheDocument()
    
    // The button container should have opacity-100
    const buttonContainer = deleteButton.closest('div.absolute')
    expect(buttonContainer).toHaveClass('opacity-100')
  })

  it('hides action buttons when not hovering', () => {
    render(
      <PilotCard 
        pilot={mockPilot}
        tournamentStarted={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMarkDroppedOut={mockOnMarkDroppedOut}
      />
    )

    // The button should exist but have opacity-0
    const deleteButton = screen.getByTitle('Löschen')
    const buttonContainer = deleteButton.closest('div.absolute')
    expect(buttonContainer).toHaveClass('opacity-0')
  })

  it('calls onDelete when delete button is clicked after hover', () => {
    render(
      <PilotCard 
        pilot={mockPilot}
        tournamentStarted={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMarkDroppedOut={mockOnMarkDroppedOut}
      />
    )

    // Find and hover over the card
    const card = screen.getByText('Test Pilot').closest('.pilot-card')
    fireEvent.mouseEnter(card!)

    // Click delete button
    const deleteButton = screen.getByTitle('Löschen')
    fireEvent.click(deleteButton)

    // Confirmation dialog should appear
    expect(screen.getByText('Pilot wirklich löschen?')).toBeInTheDocument()

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: 'Löschen' })
    fireEvent.click(confirmButton)

    // onDelete should have been called
    expect(mockOnDelete).toHaveBeenCalledWith('test-pilot-1')
  })
})
