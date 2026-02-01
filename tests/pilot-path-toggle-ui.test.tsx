import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PilotPathToggle } from '../src/components/bracket/PilotPathToggle'
import { useTournamentStore } from '../src/stores/tournamentStore'

vi.mock('../src/stores/tournamentStore', () => ({
  useTournamentStore: vi.fn()
}))

describe('PilotPathToggle', () => {
  const mockTogglePilotPaths = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useTournamentStore as any).mockReturnValue({
      showPilotPaths: false,
      togglePilotPaths: mockTogglePilotPaths
    })
  })

  it('renders with correct label', () => {
    render(<PilotPathToggle />)
    expect(screen.getByText('Pilot-Pfade')).toBeInTheDocument()
  })

  it('reflects showPilotPaths state (off)', () => {
    ;(useTournamentStore as any).mockReturnValue({
      showPilotPaths: false,
      togglePilotPaths: mockTogglePilotPaths
    })
    render(<PilotPathToggle />)
    
    const toggle = screen.getByTestId('pilot-path-toggle')
    expect(toggle).toHaveClass('pilot-path-toggle-button')
    expect(toggle).toHaveAttribute('data-active', 'false')
  })

  it('reflects showPilotPaths state (on)', () => {
    ;(useTournamentStore as any).mockReturnValue({
      showPilotPaths: true,
      togglePilotPaths: mockTogglePilotPaths
    })
    render(<PilotPathToggle />)
    
    const toggle = screen.getByTestId('pilot-path-toggle')
    expect(toggle).toHaveClass('pilot-path-toggle-button')
    expect(toggle).toHaveAttribute('data-active', 'true')
  })

  it('calls togglePilotPaths when clicked', () => {
    render(<PilotPathToggle />)
    const toggle = screen.getByTestId('pilot-path-toggle')
    
    fireEvent.click(toggle)
    expect(mockTogglePilotPaths).toHaveBeenCalledTimes(1)
  })

  it('has correct CSS class for positioning', () => {
    const { container } = render(<PilotPathToggle />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('pilot-path-toggle')
  })
})
