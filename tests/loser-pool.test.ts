/**
 * Tests for Loser Pool State & Logic (Story 9-1)
 *
 * AC1: WB-Verlierer (Platz 3+4) landen im Loser Pool
 * AC2: Eliminierte Piloten sind endgültig raus
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTournamentStore } from '../src/stores/tournamentStore'
import { resetTournamentStore } from './helpers'

describe('Loser Pool State & Actions', () => {
  beforeEach(() => {
    resetTournamentStore()
  })

  describe('loserPool State', () => {
    it('should initialize loserPool as empty array', () => {
      const state = useTournamentStore.getState()
      expect(state.loserPool).toBeDefined()
      expect(state.loserPool).toEqual([])
    })
  })

  describe('eliminatedPilots State', () => {
    it('should initialize eliminatedPilots as empty array', () => {
      const state = useTournamentStore.getState()
      expect(state.eliminatedPilots).toBeDefined()
      expect(state.eliminatedPilots).toEqual([])
    })
  })

  describe('addToLoserPool Action', () => {
    it('should add pilot IDs to loserPool', () => {
      const { addToLoserPool } = useTournamentStore.getState()
      
      addToLoserPool(['pilot-1', 'pilot-2'])
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).toContain('pilot-1')
      expect(state.loserPool).toContain('pilot-2')
      expect(state.loserPool.length).toBe(2)
    })

    it('should append to existing loserPool', () => {
      useTournamentStore.setState({ loserPool: ['existing-pilot'] })
      const { addToLoserPool } = useTournamentStore.getState()
      
      addToLoserPool(['pilot-1'])
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual(['existing-pilot', 'pilot-1'])
    })

    it('should not add duplicate pilot IDs', () => {
      useTournamentStore.setState({ loserPool: ['pilot-1'] })
      const { addToLoserPool } = useTournamentStore.getState()
      
      addToLoserPool(['pilot-1', 'pilot-2'])
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual(['pilot-1', 'pilot-2'])
    })

    it('should handle empty array input', () => {
      const { addToLoserPool } = useTournamentStore.getState()
      
      addToLoserPool([])
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual([])
    })
  })

  describe('removeFromLoserPool Action', () => {
    it('should remove specified pilot IDs from loserPool', () => {
      useTournamentStore.setState({ loserPool: ['pilot-1', 'pilot-2', 'pilot-3'] })
      const { removeFromLoserPool } = useTournamentStore.getState()
      
      removeFromLoserPool(['pilot-2'])
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual(['pilot-1', 'pilot-3'])
    })

    it('should remove multiple pilot IDs', () => {
      useTournamentStore.setState({ loserPool: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'] })
      const { removeFromLoserPool } = useTournamentStore.getState()
      
      removeFromLoserPool(['pilot-1', 'pilot-3'])
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual(['pilot-2', 'pilot-4'])
    })

    it('should handle removing non-existent pilot IDs gracefully', () => {
      useTournamentStore.setState({ loserPool: ['pilot-1'] })
      const { removeFromLoserPool } = useTournamentStore.getState()
      
      removeFromLoserPool(['non-existent'])
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual(['pilot-1'])
    })

    it('should handle empty array input', () => {
      useTournamentStore.setState({ loserPool: ['pilot-1'] })
      const { removeFromLoserPool } = useTournamentStore.getState()
      
      removeFromLoserPool([])
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual(['pilot-1'])
    })
  })

  describe('eliminatePilots Action', () => {
    it('should add pilot IDs to eliminatedPilots', () => {
      const { eliminatePilots } = useTournamentStore.getState()
      
      eliminatePilots(['pilot-1', 'pilot-2'])
      
      const state = useTournamentStore.getState()
      expect(state.eliminatedPilots).toContain('pilot-1')
      expect(state.eliminatedPilots).toContain('pilot-2')
    })

    it('should remove eliminated pilots from loserPool', () => {
      useTournamentStore.setState({ loserPool: ['pilot-1', 'pilot-2', 'pilot-3'] })
      const { eliminatePilots } = useTournamentStore.getState()
      
      eliminatePilots(['pilot-2'])
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual(['pilot-1', 'pilot-3'])
      expect(state.eliminatedPilots).toContain('pilot-2')
    })

    it('should not add duplicate eliminated pilots', () => {
      useTournamentStore.setState({ eliminatedPilots: ['pilot-1'] })
      const { eliminatePilots } = useTournamentStore.getState()
      
      eliminatePilots(['pilot-1', 'pilot-2'])
      
      const state = useTournamentStore.getState()
      expect(state.eliminatedPilots).toEqual(['pilot-1', 'pilot-2'])
    })
  })

  describe('resetTournament clears pool state', () => {
    it('should clear loserPool on resetTournament', () => {
      useTournamentStore.setState({ 
        loserPool: ['pilot-1', 'pilot-2'],
        tournamentStarted: true
      })
      const { resetTournament } = useTournamentStore.getState()
      
      resetTournament()
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual([])
    })

    it('should clear eliminatedPilots on resetTournament', () => {
      useTournamentStore.setState({ 
        eliminatedPilots: ['pilot-1'],
        tournamentStarted: true
      })
      const { resetTournament } = useTournamentStore.getState()
      
      resetTournament()
      
      const state = useTournamentStore.getState()
      expect(state.eliminatedPilots).toEqual([])
    })
  })

  describe('resetAll clears pool state', () => {
    it('should clear loserPool on resetAll', () => {
      useTournamentStore.setState({ loserPool: ['pilot-1'] })
      const { resetAll } = useTournamentStore.getState()
      
      resetAll()
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual([])
    })
  })
})

describe('WB Heat Completion adds losers to pool (AC1)', () => {
  beforeEach(() => {
    resetTournamentStore()
    // Add test pilots
    useTournamentStore.setState({
      pilots: [
        { id: 'p1', name: 'Pilot 1', imageUrl: '' },
        { id: 'p2', name: 'Pilot 2', imageUrl: '' },
        { id: 'p3', name: 'Pilot 3', imageUrl: '' },
        { id: 'p4', name: 'Pilot 4', imageUrl: '' },
      ],
      tournamentStarted: true,
      tournamentPhase: 'running',
    })
  })

  it('should add WB losers (rank 3+4) to loserPool when WB heat is completed', () => {
    // Create a simple WB heat (without full bracket structure for this unit test)
    const wbHeat = {
      id: 'wb-heat-1',
      heatNumber: 1,
      pilotIds: ['p1', 'p2', 'p3', 'p4'],
      status: 'active' as const,
    }
    
    // Create minimal bracket structure with WB heat
    const bracketStructure = {
      qualification: { heats: [] },
      winnerBracket: {
        rounds: [{
          roundNumber: 1,
          heats: [{
            id: 'wb-heat-1',
            heatNumber: 1,
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            status: 'active' as const,
            roundNumber: 1,
          }]
        }]
      },
      loserBracket: { rounds: [] },
      grandFinale: null
    }
    
    useTournamentStore.setState({ 
      heats: [wbHeat],
      fullBracketStructure: bracketStructure as any
    })
    
    const { submitHeatResults } = useTournamentStore.getState()
    
    // Submit results: p1=1st, p2=2nd (winners), p3=3rd, p4=4th (losers)
    submitHeatResults('wb-heat-1', [
      { pilotId: 'p1', rank: 1 },
      { pilotId: 'p2', rank: 2 },
      { pilotId: 'p3', rank: 3 },
      { pilotId: 'p4', rank: 4 },
    ])
    
    const state = useTournamentStore.getState()
    
    // Losers should be in loserPool
    expect(state.loserPool).toContain('p3')
    expect(state.loserPool).toContain('p4')
    expect(state.loserPool.length).toBe(2)
    
    // Winners should NOT be in loserPool
    expect(state.loserPool).not.toContain('p1')
    expect(state.loserPool).not.toContain('p2')
  })
})
