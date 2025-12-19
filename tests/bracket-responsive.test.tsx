import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BracketTree } from '../src/components/bracket-tree'
import { useTournamentStore } from '../src/stores/tournamentStore'
import type { Pilot } from '../src/lib/schemas'
import type { FullBracketStructure } from '../src/lib/bracket-structure-generator'

// Mock the store
vi.mock('../src/stores/tournamentStore', () => ({
  useTournamentStore: vi.fn()
}))

describe('BracketTree Responsive Behavior', () => {
  let mockPilots: Pilot[]
  let mockHeats: any[]
  let mockFullBracketStructure: FullBracketStructure

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
      }
    ]

    mockHeats = [
      {
        id: 'heat-1',
        heatNumber: 1,
        pilotIds: ['p1', 'p2'],
        status: 'completed',
        results: {
          rankings: [
            { pilotId: 'p1', rank: 1 },
            { pilotId: 'p2', rank: 2 }
          ]
        }
      }
    ]

    mockFullBracketStructure = {
      qualification: {
        heats: [
          {
            id: 'quali-1',
            heatNumber: 1,
            roundNumber: 1,
            bracketType: 'qualification',
            status: 'empty',
            pilotIds: [],
            sourceHeats: [],
            position: { x: 0, y: 0 }
          }
        ]
      },
      winnerBracket: {
        rounds: [
          {
            id: 'wb-round-2',
            roundNumber: 2,
            roundName: 'WB Runde 1',
            heats: [{
              id: 'wb-heat-1',
              heatNumber: 2,
              roundNumber: 2,
              bracketType: 'winner',
              status: 'empty',
              pilotIds: [],
              sourceHeats: [],
              position: { x: 280, y: 0 }
            }]
          }
        ]
      },
      loserBracket: {
        rounds: [
          {
            id: 'lb-round-1',
            roundNumber: 1,
            roundName: 'LB Runde 1',
            heats: [{
              id: 'lb-heat-1',
              heatNumber: 3,
              roundNumber: 1,
              bracketType: 'loser',
              status: 'empty',
              pilotIds: [],
              sourceHeats: [],
              position: { x: 0, y: 200 }
            }]
          }
        ]
      },
      grandFinale: {
        id: 'finale',
        heatNumber: 99,
        roundNumber: 99,
        bracketType: 'finale',
        status: 'empty',
        pilotIds: [],
        sourceHeats: [],
        position: { x: 500, y: 100 }
      }
    }

    ;(useTournamentStore as any).mockImplementation((selector: any) => {
      const state = {
        heats: mockHeats,
        fullBracketStructure: mockFullBracketStructure
      }
      return selector(state)
    })
  })

  it('should render bracket container with overflow-x-auto', () => {
    render(<BracketTree pilots={mockPilots} />)
    
    const bracketContainer = document.querySelector('.bracket-container')
    expect(bracketContainer).not.toBeNull()
    expect(bracketContainer).toHaveClass('overflow-x-auto')
  })

  it('should have min-height for bracket container', () => {
    render(<BracketTree pilots={mockPilots} />)
    
    const bracketContainer = document.querySelector('.bracket-container')
    expect(bracketContainer).not.toBeNull()
    expect(bracketContainer).toHaveClass('min-h-[600px]')
  })

  it('should apply min-width to heat boxes', () => {
    render(<BracketTree pilots={mockPilots} />)
    
    // Check if any heat box has min-width class
    const heatBoxes = document.querySelectorAll('[class*="min-w-"]')
    expect(heatBoxes.length).toBeGreaterThan(0)
  })

  it('should handle many pilots with horizontal scroll capability', () => {
    render(<BracketTree pilots={mockPilots} />)
    
    const bracketContainer = document.querySelector('.bracket-container')
    expect(bracketContainer).not.toBeNull()
    expect(bracketContainer).toHaveClass('overflow-x-auto')
  })

  it('should display message when no pilots available', () => {
    render(<BracketTree pilots={[]} />)
    
    expect(screen.getByText('Keine Piloten für Bracket verfügbar')).toBeInTheDocument()
  })

  it('should display message when no heats generated', () => {
    ;(useTournamentStore as any).mockImplementation((selector: any) => {
      const state = {
        heats: [],
        fullBracketStructure: null
      }
      return selector(state)
    })

    render(<BracketTree pilots={mockPilots} />)
    
    expect(screen.getByText('Noch keine Heats generiert')).toBeInTheDocument()
  })

  it('should be readable on beamer viewport (1920x1080)', () => {
    // Mock viewport size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    })

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    })

    render(<BracketTree pilots={mockPilots} />)
    
    // Should render without layout issues
    const bracketContainer = document.querySelector('.bracket-container')
    expect(bracketContainer).toBeInTheDocument()
    
    // Text should be large enough for beamer viewing (check for section headers)
    const headerText = screen.queryAllByText(/WINNER BRACKET|LOSER BRACKET|QUALIFIKATION|GRAND FINALE/)
    expect(headerText.length).toBeGreaterThan(0)
  })

  it('should maintain readable text sizes on mobile viewport', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    })

    render(<BracketTree pilots={mockPilots} />)
    
    const bracketContainer = document.querySelector('.bracket-container')
    expect(bracketContainer).toBeInTheDocument()
    
    // Should still be able to scroll horizontally on mobile
    expect(bracketContainer).toHaveClass('overflow-x-auto')
  })
})

describe('BracketTree Winner/Loser Bracket Data Display', () => {
  let mockPilots: Pilot[]
  
  beforeEach(() => {
    mockPilots = [
      { id: 'p1', name: 'Alpha Pilot', imageUrl: 'https://example.com/p1.jpg' },
      { id: 'p2', name: 'Beta Pilot', imageUrl: 'https://example.com/p2.jpg' },
      { id: 'p3', name: 'Gamma Pilot', imageUrl: 'https://example.com/p3.jpg' },
      { id: 'p4', name: 'Delta Pilot', imageUrl: 'https://example.com/p4.jpg' },
    ]
  })
  
  it('should display pilot names in Winner Bracket when heats have pilots assigned', () => {
    // Create a bracket structure where WB has pilots assigned
    const structureWithPilots: FullBracketStructure = {
      qualification: {
        heats: [
          {
            id: 'q1',
            heatNumber: 1,
            roundNumber: 1,
            bracketType: 'qualification',
            status: 'completed',
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            sourceHeats: [],
            position: { x: 0, y: 0 }
          }
        ]
      },
      winnerBracket: {
        rounds: [
          {
            id: 'wb-round-2',
            roundNumber: 2,
            roundName: 'WB Runde 1',
            heats: [{
              id: 'wb-1',
              heatNumber: 2,
              roundNumber: 2,
              bracketType: 'winner',
              status: 'pending',
              pilotIds: ['p1', 'p2'],  // PILOTEN ZUGEWIESEN!
              sourceHeats: ['q1'],
              position: { x: 280, y: 0 }
            }]
          }
        ]
      },
      loserBracket: {
        rounds: [
          {
            id: 'lb-round-1',
            roundNumber: 1,
            roundName: 'LB Runde 1',
            heats: [{
              id: 'lb-1',
              heatNumber: 3,
              roundNumber: 1,
              bracketType: 'loser',
              status: 'pending',
              pilotIds: ['p3', 'p4'],  // PILOTEN ZUGEWIESEN!
              sourceHeats: ['q1'],
              position: { x: 0, y: 200 }
            }]
          }
        ]
      },
      grandFinale: {
        id: 'finale',
        heatNumber: 99,
        roundNumber: 99,
        bracketType: 'finale',
        status: 'empty',
        pilotIds: [],
        sourceHeats: [],
        position: { x: 500, y: 100 }
      }
    }
    
    // Mock heats (from store)
    const mockHeats = [
      {
        id: 'q1',
        heatNumber: 1,
        pilotIds: ['p1', 'p2', 'p3', 'p4'],
        status: 'completed',
        results: {
          rankings: [
            { pilotId: 'p1', rank: 1 },
            { pilotId: 'p2', rank: 2 },
            { pilotId: 'p3', rank: 3 },
            { pilotId: 'p4', rank: 4 },
          ]
        }
      }
    ]
    
    ;(useTournamentStore as any).mockImplementation((selector: any) => {
      const state = {
        heats: mockHeats,
        fullBracketStructure: structureWithPilots
      }
      return selector(state)
    })
    
    render(<BracketTree pilots={mockPilots} />)
    
    // Winner Bracket section should contain pilot names
    const winnerSection = document.querySelector('.winner-bracket-section')
    expect(winnerSection).not.toBeNull()
    expect(winnerSection?.textContent).toContain('Alpha Pilot')
    expect(winnerSection?.textContent).toContain('Beta Pilot')
    
    // Pilots should appear multiple times (Quali + WB)
    expect(screen.getAllByText('Alpha Pilot').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Beta Pilot').length).toBeGreaterThanOrEqual(2)
  })
  
  it('should display pilot names in Loser Bracket when heats have pilots assigned', () => {
    const structureWithPilots: FullBracketStructure = {
      qualification: {
        heats: [{
          id: 'q1',
          heatNumber: 1,
          roundNumber: 1,
          bracketType: 'qualification',
          status: 'completed',
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }]
      },
      winnerBracket: {
        rounds: [{
          id: 'wb-round-2',
          roundNumber: 2,
          roundName: 'WB Runde 1',
          heats: [{
            id: 'wb-1',
            heatNumber: 2,
            roundNumber: 2,
            bracketType: 'winner',
            status: 'pending',
            pilotIds: ['p1', 'p2'],
            sourceHeats: ['q1'],
            position: { x: 280, y: 0 }
          }]
        }]
      },
      loserBracket: {
        rounds: [{
          id: 'lb-round-1',
          roundNumber: 1,
          roundName: 'LB Runde 1',
          heats: [{
            id: 'lb-1',
            heatNumber: 3,
            roundNumber: 1,
            bracketType: 'loser',
            status: 'pending',
            pilotIds: ['p3', 'p4'],  // Gamma + Delta in Loser Bracket
            sourceHeats: ['q1'],
            position: { x: 0, y: 200 }
          }]
        }]
      },
      grandFinale: {
        id: 'finale',
        heatNumber: 99,
        roundNumber: 99,
        bracketType: 'finale',
        status: 'empty',
        pilotIds: [],
        sourceHeats: [],
        position: { x: 500, y: 100 }
      }
    }
    
    const mockHeats = [{
      id: 'q1',
      heatNumber: 1,
      pilotIds: ['p1', 'p2', 'p3', 'p4'],
      status: 'completed',
      results: {
        rankings: [
          { pilotId: 'p1', rank: 1 },
          { pilotId: 'p2', rank: 2 },
          { pilotId: 'p3', rank: 3 },
          { pilotId: 'p4', rank: 4 },
        ]
      }
    }]
    
    ;(useTournamentStore as any).mockImplementation((selector: any) => {
      const state = {
        heats: mockHeats,
        fullBracketStructure: structureWithPilots
      }
      return selector(state)
    })
    
    render(<BracketTree pilots={mockPilots} />)
    
    // Loser Bracket section should contain pilot names
    const loserSection = document.querySelector('.loser-bracket-section')
    expect(loserSection).not.toBeNull()
    expect(loserSection?.textContent).toContain('Gamma Pilot')
    expect(loserSection?.textContent).toContain('Delta Pilot')
    
    // Pilots should appear multiple times (Quali + LB)
    expect(screen.getAllByText('Gamma Pilot').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Delta Pilot').length).toBeGreaterThanOrEqual(2)
  })
  
  it('should show "Wartet..." only for empty heats with no pilots', () => {
    const structureWithEmptyHeats: FullBracketStructure = {
      qualification: {
        heats: [{
          id: 'q1',
          heatNumber: 1,
          roundNumber: 1,
          bracketType: 'qualification',
          status: 'active',
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }]
      },
      winnerBracket: {
        rounds: [{
          id: 'wb-round-2',
          roundNumber: 2,
          roundName: 'WB Runde 1',
          heats: [{
            id: 'wb-1',
            heatNumber: 2,
            roundNumber: 2,
            bracketType: 'winner',
            status: 'empty',
            pilotIds: [],  // KEINE PILOTEN
            sourceHeats: [],
            position: { x: 280, y: 0 }
          }]
        }]
      },
      loserBracket: {
        rounds: [{
          id: 'lb-round-1',
          roundNumber: 1,
          roundName: 'LB Runde 1',
          heats: [{
            id: 'lb-1',
            heatNumber: 3,
            roundNumber: 1,
            bracketType: 'loser',
            status: 'empty',
            pilotIds: [],  // KEINE PILOTEN
            sourceHeats: [],
            position: { x: 0, y: 200 }
          }]
        }]
      },
      grandFinale: {
        id: 'finale',
        heatNumber: 99,
        roundNumber: 99,
        bracketType: 'finale',
        status: 'empty',
        pilotIds: [],
        sourceHeats: [],
        position: { x: 500, y: 100 }
      }
    }
    
    const mockHeats = [{
      id: 'q1',
      heatNumber: 1,
      pilotIds: ['p1', 'p2', 'p3', 'p4'],
      status: 'active'
    }]
    
    ;(useTournamentStore as any).mockImplementation((selector: any) => {
      const state = {
        heats: mockHeats,
        fullBracketStructure: structureWithEmptyHeats
      }
      return selector(state)
    })
    
    render(<BracketTree pilots={mockPilots} />)
    
    // "Wartet..." should appear for empty WB and LB heats (and Grand Finale)
    // Total: 3 "Wartet..." texts (WB-1, LB-1, Finale)
    const wartets = screen.getAllByText('Wartet...')
    expect(wartets.length).toBe(3)
  })
  
  it('should render BracketHeatBox with pilots in Winner Bracket section (not EmptyBracketHeatBox)', () => {
    // When WB heat has pilotIds.length > 0, should show BracketHeatBox (with pilot images)
    const structureWithFilledWB: FullBracketStructure = {
      qualification: {
        heats: [{
          id: 'q1',
          heatNumber: 1,
          roundNumber: 1,
          bracketType: 'qualification',
          status: 'completed',
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }]
      },
      winnerBracket: {
        rounds: [{
          id: 'wb-round-2',
          roundNumber: 2,
          roundName: 'WB Runde 1',
          heats: [{
            id: 'wb-1',
            heatNumber: 2,
            roundNumber: 2,
            bracketType: 'winner',
            status: 'pending',
            pilotIds: ['p1', 'p2'],  // HAS PILOTS!
            sourceHeats: ['q1'],
            position: { x: 280, y: 0 }
          }]
        }]
      },
      loserBracket: {
        rounds: [{
          id: 'lb-round-1',
          roundNumber: 1,
          roundName: 'LB Runde 1',
          heats: [{
            id: 'lb-1',
            heatNumber: 3,
            roundNumber: 1,
            bracketType: 'loser',
            status: 'empty',
            pilotIds: [],
            sourceHeats: [],
            position: { x: 0, y: 200 }
          }]
        }]
      },
      grandFinale: {
        id: 'finale',
        heatNumber: 99,
        roundNumber: 99,
        bracketType: 'finale',
        status: 'empty',
        pilotIds: [],
        sourceHeats: [],
        position: { x: 500, y: 100 }
      }
    }
    
    const mockHeats = [{
      id: 'q1',
      heatNumber: 1,
      pilotIds: ['p1', 'p2', 'p3', 'p4'],
      status: 'completed',
      results: {
        rankings: [
          { pilotId: 'p1', rank: 1 },
          { pilotId: 'p2', rank: 2 },
          { pilotId: 'p3', rank: 3 },
          { pilotId: 'p4', rank: 4 },
        ]
      }
    }]
    
    ;(useTournamentStore as any).mockImplementation((selector: any) => {
      const state = {
        heats: mockHeats,
        fullBracketStructure: structureWithFilledWB
      }
      return selector(state)
    })
    
    render(<BracketTree pilots={mockPilots} />)
    
    // Winner Bracket section should contain pilot images (img elements)
    const winnerSection = document.querySelector('.winner-bracket-section')
    expect(winnerSection).not.toBeNull()
    
    // Should have img elements for pilots in WB heat (Alpha and Beta)
    const wbImages = winnerSection?.querySelectorAll('img')
    expect(wbImages?.length).toBeGreaterThanOrEqual(2)
    
    // Alpha Pilot and Beta Pilot names should be in WB section
    expect(winnerSection?.textContent).toContain('Alpha Pilot')
    expect(winnerSection?.textContent).toContain('Beta Pilot')
  })
})
