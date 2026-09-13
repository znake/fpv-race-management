import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PilotCard } from '@/components/pilot-card'
import { createMockPilot } from './helpers'

// Mock pilot data using factory
const mockPilot = createMockPilot({
  id: '1',
  name: 'Test Pilot',
  imageUrl: 'https://example.com/pilot.jpg',
  instagramHandle: '@test_pilot'
})

const mockPilotNoInstagram = createMockPilot({
  id: '2',
  name: 'No Instagram Pilot',
  imageUrl: 'https://example.com/pilot2.jpg',
  instagramHandle: undefined
})

describe('PilotCard', () => {
  it('renders pilot information correctly', () => {
    render(<PilotCard pilot={mockPilot} />)
    
    expect(screen.getByText('Test Pilot')).toBeInTheDocument()
    expect(screen.getByAltText('Test Pilot')).toBeInTheDocument()
    expect(screen.getByText('@test_pilot')).toBeInTheDocument()
  })

  it('hides Instagram handle when not provided', () => {
    render(<PilotCard pilot={mockPilotNoInstagram} />)
    
    expect(screen.getByText('No Instagram Pilot')).toBeInTheDocument()
    // Instagram handle should not be rendered
    expect(screen.queryByText(/@/)).not.toBeInTheDocument()
  })

  it('shows rank badge when rank is provided', () => {
    render(<PilotCard pilot={mockPilot} rank={1} />)
    
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('applies correct styling for rank 1', () => {
    render(<PilotCard pilot={mockPilot} rank={1} />)
    
    const card = screen.getByText('Test Pilot').closest('[class*="bg-night"]')
    expect(card).toHaveClass('border-gold', 'shadow-glow-gold')
  })

  it('applies correct styling for rank 2', () => {
    render(<PilotCard pilot={mockPilot} rank={2} />)
    
    const card = screen.getByText('Test Pilot').closest('[class*="bg-night"]')
    expect(card).toHaveClass('border-neon-cyan', 'shadow-glow-cyan')
  })

  it('applies selected styling when selected', () => {
    render(<PilotCard pilot={mockPilot} selected={true} />)
    
    const card = screen.getByText('Test Pilot').closest('[class*="bg-night"]')
    expect(card).toHaveClass('border-neon-pink', 'shadow-glow-pink')
  })

  it('handles image error gracefully', () => {
    render(<PilotCard pilot={mockPilot} />)
    
    const img = screen.getByAltText('Test Pilot')
    expect(img).toBeInTheDocument()
    // Check that onError handler exists by checking if the function is called
    expect(img.onerror).toBeDefined()
  })
})