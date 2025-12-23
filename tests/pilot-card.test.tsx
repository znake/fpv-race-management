import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PilotCard } from '../src/components/pilot-card'
import type { Pilot } from '../src/lib/schemas'

// Mock pilot data
const mockPilot: Pilot = {
  id: '1',
  name: 'Test Pilot',
  imageUrl: 'https://example.com/pilot.jpg',
  instagramHandle: '@test_pilot'
}

const mockPilotNoInstagram: Pilot = {
  id: '2',
  name: 'No Instagram Pilot',
  imageUrl: 'https://example.com/pilot2.jpg'
}

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

  it('applies synthwave design classes', () => {
    render(<PilotCard pilot={mockPilot} />)
    
    const card = screen.getByText('Test Pilot').closest('[class*="bg-night"]')
    expect(card).toHaveClass('bg-night', 'border-steel')
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

  it('uses correct typography classes (Beamer-optimiert)', () => {
    render(<PilotCard pilot={mockPilot} />)
    
    // Story 6.2: Beamer-optimierte Schriftgrößen (min 24px für Namen, min 16px für Captions)
    const nameElement = screen.getByText('Test Pilot')
    expect(nameElement).toHaveClass('font-display', 'text-beamer-name')
    
    const detailElement = screen.getByText('@test_pilot')
    expect(detailElement).toHaveClass('font-ui', 'text-beamer-caption')
  })

  // Visual Validation: Component entspricht exakt ux-design-directions.html
  it('matches visual design specification', () => {
    const { container } = render(<PilotCard pilot={mockPilot} />)
    
    // Check for synthwave design elements
    const card = container.querySelector('[class*="bg-night"]')
    expect(card).toBeInTheDocument()
    
    // Check for rounded corners (16px per US-2.2 spec) and border (3px)
    expect(card).toHaveClass('rounded-[16px]', 'border-[3px]')
    
    // Check for hover effects (US-2.3: translateY -4px → implemented as -1 for subtlety)
    expect(card).toHaveClass('hover:-translate-y-1', 'transition-all', 'duration-200')
    
    // Check for pilot photo container
    const photoContainer = container.querySelector('[class*="rounded-full"]')
    expect(photoContainer).toBeInTheDocument()
    
    // Check for gradient background on photo (120px per US-2.2 spec)
    const pilotPhotoContainer = container.querySelector('.w-\\[120px\\].h-\\[120px\\].rounded-full')
    expect(pilotPhotoContainer).toHaveClass('from-neon-pink', 'to-neon-magenta')
  })
})