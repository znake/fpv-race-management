/**
 * Finale & Siegerehrung Tests
 * 
 * Story 5.1: Finale & Siegerehrung
 * Tests for:
 * - getTop4Pilots() function
 * - completeTournament() action
 * - VictoryCeremony component rendering
 * - Tournament completion flow
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useTournamentStore } from '../src/stores/tournamentStore'
import { VictoryCeremony } from '../src/components/victory-ceremony'
import type { Pilot } from '../src/lib/schemas'

// Reset store before each test
beforeEach(() => {
  useTournamentStore.setState({
    pilots: [],
    heats: [],
    tournamentStarted: false,
    tournamentPhase: 'setup',
    currentHeatIndex: 0,
    winnerPilots: [],
    loserPilots: [],
    eliminatedPilots: []
  })
})

describe('getTop4Pilots', () => {
  it('returns null when no grand finale exists', () => {
    const result = useTournamentStore.getState().getTop4Pilots()
    expect(result).toBeNull()
  })

  it('returns null when grand finale has no results', () => {
    useTournamentStore.setState({
      heats: [{
        id: 'finale-1',
        heatNumber: 99,
        pilotIds: ['p1', 'p2'],
        status: 'pending',
        bracketType: 'grand_finale'
        // No results yet
      }]
    })
    
    const result = useTournamentStore.getState().getTop4Pilots()
    expect(result).toBeNull()
  })

  it('returns all 4 places from grand finale results (4-pilot format per tournament rules)', () => {
    // Story 13-3: Grand Finale hat 4 Piloten (2 aus WB + 2 aus LB)
    const pilots: Pilot[] = [
      { id: 'p1', name: 'Champion', imageUrl: '/p1.jpg' },
      { id: 'p2', name: 'RunnerUp', imageUrl: '/p2.jpg' },
      { id: 'p3', name: 'Third', imageUrl: '/p3.jpg' },
      { id: 'p4', name: 'Fourth', imageUrl: '/p4.jpg' }
    ]
    
    useTournamentStore.setState({
      pilots,
      heats: [
        {
          id: 'wb-finale',
          heatNumber: 5,
          pilotIds: ['p1', 'p4'],
          status: 'completed',
          bracketType: 'winner',
          isFinale: true,
          results: {
            rankings: [
              { pilotId: 'p1', rank: 1 },
              { pilotId: 'p4', rank: 2 }
            ],
            completedAt: '2025-12-20T12:00:00Z'
          }
        },
        {
          id: 'lb-finale',
          heatNumber: 6,
          pilotIds: ['p2', 'p3'],
          status: 'completed',
          bracketType: 'loser',
          isFinale: true,
          results: {
            rankings: [
              { pilotId: 'p2', rank: 1 },
              { pilotId: 'p3', rank: 2 }
            ],
            completedAt: '2025-12-20T12:10:00Z'
          }
        },
        {
          id: 'finale-1',
          heatNumber: 99,
          pilotIds: ['p1', 'p2', 'p3', 'p4'], // 4 Piloten
          status: 'completed',
          bracketType: 'grand_finale',
          results: {
            rankings: [
              { pilotId: 'p1', rank: 1 },
              { pilotId: 'p2', rank: 2 },
              { pilotId: 'p3', rank: 3 },
              { pilotId: 'p4', rank: 4 }
            ],
            completedAt: '2025-12-20T12:20:00Z'
          }
        }
      ]
    })
    
    const result = useTournamentStore.getState().getTop4Pilots()
    
    expect(result).not.toBeNull()
    expect(result?.place1?.name).toBe('Champion')
    expect(result?.place2?.name).toBe('RunnerUp')
    expect(result?.place3?.name).toBe('Third')
    expect(result?.place4?.name).toBe('Fourth')
  })
})

describe('completeTournament', () => {
  it('sets tournamentPhase to completed', () => {
    useTournamentStore.setState({
      tournamentPhase: 'finale'
    })
    
    useTournamentStore.getState().completeTournament()
    
    expect(useTournamentStore.getState().tournamentPhase).toBe('completed')
  })

  it('updates grand finale heat status to completed', () => {
    useTournamentStore.setState({
      tournamentPhase: 'finale',
      heats: [{
        id: 'finale-1',
        heatNumber: 99,
        pilotIds: ['p1', 'p2'],
        status: 'active',
        bracketType: 'grand_finale'
      }]
    })
    
    useTournamentStore.getState().completeTournament()
    
    const grandFinaleHeat = useTournamentStore.getState().heats.find(h => h.bracketType === 'grand_finale')
    expect(grandFinaleHeat?.status).toBe('completed')
  })
})

describe('VictoryCeremony Component', () => {
  const mockTop4 = {
    place1: { id: 'p1', name: 'Anna Champion', imageUrl: '/anna.jpg', instagramHandle: 'anna_fpv' } as Pilot,
    place2: { id: 'p2', name: 'Ben Silver', imageUrl: '/ben.jpg' } as Pilot,
    place3: { id: 'p3', name: 'Chris Bronze', imageUrl: '/chris.jpg' } as Pilot,
    place4: { id: 'p4', name: 'Dana Fourth', imageUrl: '/dana.jpg' } as Pilot
  }

  it('renders victory ceremony section', () => {
    render(<VictoryCeremony top4={mockTop4} onNewTournament={() => {}} />)
    
    expect(screen.getByTestId('victory-ceremony')).toBeInTheDocument()
    expect(screen.getByText('SIEGEREHRUNG')).toBeInTheDocument()
  })

  it('renders all 4 podium places', () => {
    render(<VictoryCeremony top4={mockTop4} onNewTournament={() => {}} />)
    
    expect(screen.getByTestId('podium-place-1')).toBeInTheDocument()
    expect(screen.getByTestId('podium-place-2')).toBeInTheDocument()
    expect(screen.getByTestId('podium-place-3')).toBeInTheDocument()
    expect(screen.getByTestId('podium-place-4')).toBeInTheDocument()
  })

  it('shows champion label for first place', () => {
    render(<VictoryCeremony top4={mockTop4} onNewTournament={() => {}} />)
    
    expect(screen.getByText('CHAMPION')).toBeInTheDocument()
    expect(screen.getByText('Anna Champion')).toBeInTheDocument()
  })

  it('shows placement labels for all positions', () => {
    render(<VictoryCeremony top4={mockTop4} onNewTournament={() => {}} />)
    
    expect(screen.getByText('CHAMPION')).toBeInTheDocument()
    expect(screen.getByText('2. PLATZ')).toBeInTheDocument()
    expect(screen.getByText('3. PLATZ')).toBeInTheDocument()
    expect(screen.getByText('4. PLATZ')).toBeInTheDocument()
  })

  it('shows instagram handle when available', () => {
    render(<VictoryCeremony top4={mockTop4} onNewTournament={() => {}} />)
    
    expect(screen.getByText('anna_fpv')).toBeInTheDocument()
  })

  it('renders new tournament button', () => {
    render(<VictoryCeremony top4={mockTop4} onNewTournament={() => {}} />)
    
    expect(screen.getByTestId('new-tournament-button')).toBeInTheDocument()
    expect(screen.getByText('Neues Turnier starten')).toBeInTheDocument()
  })

  it('handles missing pilots gracefully', () => {
    const partialTop4 = {
      place1: mockTop4.place1,
      place2: mockTop4.place2,
      place3: undefined,
      place4: undefined
    }
    
    render(<VictoryCeremony top4={partialTop4} onNewTournament={() => {}} />)
    
    // Should still render without crashing
    expect(screen.getByTestId('victory-ceremony')).toBeInTheDocument()
    expect(screen.getByText('Anna Champion')).toBeInTheDocument()
    expect(screen.getByText('Ben Silver')).toBeInTheDocument()
  })
})

describe('Tournament Completion Flow', () => {
  it('transitions from finale to completed after grand finale results', () => {
    const pilots: Pilot[] = [
      { id: 'p1', name: 'Winner', imageUrl: '/p1.jpg' },
      { id: 'p2', name: 'Loser', imageUrl: '/p2.jpg' }
    ]
    
    useTournamentStore.setState({
      pilots,
      tournamentPhase: 'finale',
      heats: [{
        id: 'finale-1',
        heatNumber: 99,
        pilotIds: ['p1', 'p2'],
        status: 'active',
        bracketType: 'grand_finale'
      }]
    })
    
    // Submit finale results
    useTournamentStore.getState().submitHeatResults('finale-1', [
      { pilotId: 'p1', rank: 1 },
      { pilotId: 'p2', rank: 2 }
    ])
    
    // Should transition to completed
    expect(useTournamentStore.getState().tournamentPhase).toBe('completed')
  })

  it('preserves heats after tournament completion', () => {
    useTournamentStore.setState({
      tournamentPhase: 'finale',
      heats: [
        { 
          id: 'q1', 
          heatNumber: 1, 
          pilotIds: ['p1', 'p2', 'p3', 'p4'], 
          status: 'completed',
          bracketType: 'qualification'
        },
        {
          id: 'finale-1',
          heatNumber: 99,
          pilotIds: ['p1', 'p2'],
          status: 'active',
          bracketType: 'grand_finale'
        }
      ]
    })
    
    useTournamentStore.getState().completeTournament()
    
    // Heats should be preserved
    const heats = useTournamentStore.getState().heats
    expect(heats).toHaveLength(2)
    expect(heats.find(h => h.id === 'q1')).toBeDefined()
    expect(heats.find(h => h.id === 'finale-1')).toBeDefined()
  })
})
