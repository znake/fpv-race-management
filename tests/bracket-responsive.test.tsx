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

describe('BracketTree Responsive Behavior (Fixed)', () => {
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
            id: 'lb-heat-1',
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
    
    // Mock with all required values for Story 9-2 + Story 4.3 + Story 10-2
    ;(useTournamentStore as any).mockImplementation((selector: any) => {
      const state = {
        heats: mockHeats,
        fullBracketStructure: mockFullBracketStructure,
        loserPool: [], // Story 9-2: Add loserPool to mock
        winnerPool: [], // Story 4.3: Add winnerPool to mock
        grandFinalePool: [], // Story 4.3: Add grandFinalePool to mock
        getTop4Pilots: () => null,
        hasActiveWBHeats: () => true // Story 10-2: Add hasActiveWBHeats to mock
      }
      return selector(state)
    })
  })
  
  it('should render bracket container with overflow-x-auto', () => {
    render(<BracketTree pilots={mockPilots} tournamentPhase="running" onSubmitResults={() => {}} />)
    
    const bracketContainer = document.querySelector('.bracket-container')
    expect(bracketContainer).not.toBeNull()
    expect(bracketContainer).toHaveClass('overflow-x-auto')
  })
  
  it('should have min-height for bracket container', () => {
    render(<BracketTree pilots={mockPilots} tournamentPhase="running" onSubmitResults={() => {}} />)
    
    const bracketContainer = document.querySelector('.bracket-container')
    expect(bracketContainer).not.toBeNull()
    expect(bracketContainer).toHaveClass('min-h-[600px]')
  })
  
  it('should apply min-width to heat boxes', () => {
    render(<BracketTree pilots={mockPilots} tournamentPhase="running" onSubmitResults={() => {}} />)
    
    // Check if any heat box has min-width class
    const heatBoxes = document.querySelectorAll('[class*="min-w-"]')
    expect(heatBoxes.length).toBeGreaterThan(0)
  })
  
  it('should handle many pilots with horizontal scroll capability', () => {
    render(<BracketTree pilots={mockPilots} tournamentPhase="running" onSubmitResults={() => {}} />)
    
    const bracketContainer = document.querySelector('.bracket-container')
    expect(bracketContainer).not.toBeNull()
    expect(bracketContainer).toHaveClass('overflow-x-auto')
  })
  
  it('should display message when no pilots available', () => {
    render(<BracketTree pilots={[]} tournamentPhase="running" onSubmitResults={() => {}} />)
    
    expect(screen.getByText('Keine Piloten für Bracket verfügbar')).toBeInTheDocument()
  })
  
  it('should display message when no heats generated', () => {
    ;(useTournamentStore as any).mockImplementation((selector: any) => {
      const state = {
        heats: [],
        fullBracketStructure: null,
        loserPool: [],
        winnerPool: [], // Story 4.3: Add winnerPool to mock
        grandFinalePool: [], // Story 4.3: Add grandFinalePool to mock
        getTop4Pilots: () => null,
        hasActiveWBHeats: () => false // Story 10-2: Add hasActiveWBHeats to mock
      }
      return selector(state)
    })
    
    render(<BracketTree pilots={mockPilots} tournamentPhase="running" onSubmitResults={() => {}} />)
    
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
    
    render(<BracketTree pilots={mockPilots} tournamentPhase="running" onSubmitResults={() => {}} />)
    
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
    
    render(<BracketTree pilots={mockPilots} tournamentPhase="running" onSubmitResults={() => {}} />)
    
    const bracketContainer = document.querySelector('.bracket-container')
    expect(bracketContainer).toBeInTheDocument()
    
    // Should still be able to scroll horizontally on mobile
    expect(bracketContainer).toHaveClass('overflow-x-auto')
  })
})
