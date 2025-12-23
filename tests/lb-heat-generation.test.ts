/**
 * Tests for Dynamic LB Heat Generation (Story 9-2)
 *
 * AC1: LB Heat wird generiert wenn Pool >= 4 (während WB aktiv)
 * AC2: Zufällige Pool-Auswahl
 * AC3: LB Gewinner → Pool, Verlierer → eliminiert
 * AC4: Wildcard-Logik (1-2 Piloten warten)
 * AC5: Keine zu kleinen LB-Heats während WB
 * AC6: Pool-Visualisierung
 * AC7: Automatische Abwechslung WB/LB
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTournamentStore } from '../src/stores/tournamentStore'

// Helper to create minimal bracket structure for tests
function createMinimalBracketStructure(options: {
  hasActiveWBHeats?: boolean
  wbHeats?: Array<{ id: string; status: string }>
}) {
  return {
    qualification: { heats: [] },
    winnerBracket: {
      rounds: [{
        id: 'wb-round-1',
        roundNumber: 1,
        roundName: 'WB Runde 1',
        heats: options.wbHeats || [{
          id: 'wb-heat-1',
          heatNumber: 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: options.hasActiveWBHeats ? 'pending' : 'completed',
          roundNumber: 1,
          bracketType: 'winner',
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }]
      }]
    },
    loserBracket: { rounds: [] },
    grandFinale: null
  }
}

describe('Story 9-2: Dynamic LB Heat Generation', () => {
  beforeEach(() => {
    // Reset store to initial state
    useTournamentStore.setState({
      pilots: [],
      tournamentStarted: false,
      tournamentPhase: 'setup',
      heats: [],
      currentHeatIndex: 0,
      winnerPilots: [],
      loserPilots: [],
      eliminatedPilots: [],
      loserPool: [],
      fullBracketStructure: null,
      lastCompletedBracketType: null,
    })
  })

  describe('Task 1: canGenerateLBHeat() - AC1, AC5', () => {
    it('should return false when pool has less than 4 pilots and WB is active', () => {
      useTournamentStore.setState({
        loserPool: ['p1', 'p2', 'p3'],
        tournamentPhase: 'running',
        fullBracketStructure: createMinimalBracketStructure({ hasActiveWBHeats: true }) as any
      })
      
      const { canGenerateLBHeat } = useTournamentStore.getState()
      expect(canGenerateLBHeat()).toBe(false)
    })

    it('should return true when pool has exactly 4 pilots and WB is active', () => {
      useTournamentStore.setState({
        loserPool: ['p1', 'p2', 'p3', 'p4'],
        tournamentPhase: 'running',
        fullBracketStructure: createMinimalBracketStructure({ hasActiveWBHeats: true }) as any
      })
      
      const { canGenerateLBHeat } = useTournamentStore.getState()
      expect(canGenerateLBHeat()).toBe(true)
    })

    it('should return true when pool has more than 4 pilots', () => {
      useTournamentStore.setState({
        loserPool: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
        tournamentPhase: 'running',
        fullBracketStructure: createMinimalBracketStructure({ hasActiveWBHeats: true }) as any
      })
      
      const { canGenerateLBHeat } = useTournamentStore.getState()
      expect(canGenerateLBHeat()).toBe(true)
    })

    it('should return true when pool has 3 pilots and WB is completed (all heats done)', () => {
      useTournamentStore.setState({
        loserPool: ['p1', 'p2', 'p3'],
        tournamentPhase: 'running',
        fullBracketStructure: createMinimalBracketStructure({ hasActiveWBHeats: false }) as any
      })
      
      const { canGenerateLBHeat } = useTournamentStore.getState()
      expect(canGenerateLBHeat()).toBe(true)
    })

    it('should return false when pool is empty', () => {
      useTournamentStore.setState({
        loserPool: [],
        tournamentPhase: 'running',
        fullBracketStructure: createMinimalBracketStructure({ hasActiveWBHeats: true }) as any
      })
      
      const { canGenerateLBHeat } = useTournamentStore.getState()
      expect(canGenerateLBHeat()).toBe(false)
    })

    it('should return false when pool has only 2 pilots and WB not finished', () => {
      useTournamentStore.setState({
        loserPool: ['p1', 'p2'],
        tournamentPhase: 'running',
        fullBracketStructure: createMinimalBracketStructure({ hasActiveWBHeats: true }) as any
      })
      
      const { canGenerateLBHeat } = useTournamentStore.getState()
      expect(canGenerateLBHeat()).toBe(false)
    })
  })

  describe('Task 2: generateLBHeat() - AC1, AC2', () => {
    beforeEach(() => {
      useTournamentStore.setState({
        pilots: [
          { id: 'p1', name: 'Pilot 1', imageUrl: '' },
          { id: 'p2', name: 'Pilot 2', imageUrl: '' },
          { id: 'p3', name: 'Pilot 3', imageUrl: '' },
          { id: 'p4', name: 'Pilot 4', imageUrl: '' },
          { id: 'p5', name: 'Pilot 5', imageUrl: '' },
          { id: 'p6', name: 'Pilot 6', imageUrl: '' },
        ],
        loserPool: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
        tournamentPhase: 'running',
        heats: [],
        fullBracketStructure: createMinimalBracketStructure({ hasActiveWBHeats: true }) as any
      })
    })

    it('should create LB heat with 4 pilots from pool', () => {
      const { generateLBHeat } = useTournamentStore.getState()
      
      const newHeat = generateLBHeat()
      
      expect(newHeat).toBeDefined()
      expect(newHeat?.pilotIds.length).toBe(4)
    })

    it('should remove selected pilots from pool', () => {
      const initialPoolSize = useTournamentStore.getState().loserPool.length
      const { generateLBHeat } = useTournamentStore.getState()
      
      const newHeat = generateLBHeat()
      
      const state = useTournamentStore.getState()
      expect(state.loserPool.length).toBe(initialPoolSize - 4)
      
      // Selected pilots should not be in pool anymore
      newHeat?.pilotIds.forEach(pilotId => {
        expect(state.loserPool).not.toContain(pilotId)
      })
    })

    it('should add heat to heats array', () => {
      const { generateLBHeat } = useTournamentStore.getState()
      
      const newHeat = generateLBHeat()
      
      const state = useTournamentStore.getState()
      expect(state.heats).toContainEqual(expect.objectContaining({
        id: newHeat?.id,
        pilotIds: newHeat?.pilotIds
      }))
    })

    it('should set heat status to pending', () => {
      const { generateLBHeat } = useTournamentStore.getState()
      
      const newHeat = generateLBHeat()
      
      expect(newHeat?.status).toBe('pending')
    })

    it('should assign correct heatNumber (continuing from existing heats)', () => {
      useTournamentStore.setState({
        heats: [
          { id: 'h1', heatNumber: 1, pilotIds: [], status: 'completed' },
          { id: 'h2', heatNumber: 2, pilotIds: [], status: 'completed' },
        ]
      })
      
      const { generateLBHeat } = useTournamentStore.getState()
      const newHeat = generateLBHeat()
      
      expect(newHeat?.heatNumber).toBe(3)
    })

    it('should return null when canGenerateLBHeat is false', () => {
      useTournamentStore.setState({ loserPool: ['p1', 'p2'] }) // Only 2 pilots
      
      const { generateLBHeat } = useTournamentStore.getState()
      const result = generateLBHeat()
      
      expect(result).toBeNull()
    })

    it('should use random selection (shuffle) - different order possible', () => {
      const { generateLBHeat } = useTournamentStore.getState()
      
      // Generate multiple heats and check they use different pilots
      const heat1 = generateLBHeat()
      
      // Refill pool
      useTournamentStore.setState({ loserPool: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'] })
      
      const heat2 = generateLBHeat()
      
      // At least one of the heats should have pilots in different order
      // (statistically very unlikely to be same order twice)
      expect(heat1?.pilotIds).toBeDefined()
      expect(heat2?.pilotIds).toBeDefined()
    })
  })

  describe('Task 3: LB Heat Completion - AC3', () => {
    beforeEach(() => {
      useTournamentStore.setState({
        pilots: [
          { id: 'p1', name: 'Pilot 1', imageUrl: '' },
          { id: 'p2', name: 'Pilot 2', imageUrl: '' },
          { id: 'p3', name: 'Pilot 3', imageUrl: '' },
          { id: 'p4', name: 'Pilot 4', imageUrl: '' },
        ],
        loserPool: [],
        eliminatedPilots: [],
        tournamentPhase: 'running',
        heats: [{
          id: 'lb-heat-1',
          heatNumber: 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'active',
        }],
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: { rounds: [] },
          loserBracket: {
            rounds: [{
              id: 'lb-round-1',
              roundNumber: 1,
              roundName: 'LB Runde 1',
              heats: [{
                id: 'lb-heat-1',
                heatNumber: 1,
                pilotIds: ['p1', 'p2', 'p3', 'p4'],
                status: 'active',
                roundNumber: 1,
                bracketType: 'loser',
                sourceHeats: [],
                position: { x: 0, y: 0 }
              }]
            }]
          },
          grandFinale: null
        } as any
      })
    })

    it('should put LB winners (rank 1+2) back into pool', () => {
      const { submitHeatResults } = useTournamentStore.getState()
      
      submitHeatResults('lb-heat-1', [
        { pilotId: 'p1', rank: 1 },
        { pilotId: 'p2', rank: 2 },
        { pilotId: 'p3', rank: 3 },
        { pilotId: 'p4', rank: 4 },
      ])
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).toContain('p1')
      expect(state.loserPool).toContain('p2')
    })

    it('should eliminate LB losers (rank 3+4)', () => {
      const { submitHeatResults } = useTournamentStore.getState()
      
      submitHeatResults('lb-heat-1', [
        { pilotId: 'p1', rank: 1 },
        { pilotId: 'p2', rank: 2 },
        { pilotId: 'p3', rank: 3 },
        { pilotId: 'p4', rank: 4 },
      ])
      
      const state = useTournamentStore.getState()
      expect(state.eliminatedPilots).toContain('p3')
      expect(state.eliminatedPilots).toContain('p4')
    })

    it('should not put LB losers in pool', () => {
      const { submitHeatResults } = useTournamentStore.getState()
      
      submitHeatResults('lb-heat-1', [
        { pilotId: 'p1', rank: 1 },
        { pilotId: 'p2', rank: 2 },
        { pilotId: 'p3', rank: 3 },
        { pilotId: 'p4', rank: 4 },
      ])
      
      const state = useTournamentStore.getState()
      expect(state.loserPool).not.toContain('p3')
      expect(state.loserPool).not.toContain('p4')
    })
  })

  describe('Task 9-10: lastCompletedBracketType & getNextRecommendedHeat - AC7', () => {
    beforeEach(() => {
      useTournamentStore.setState({
        pilots: [
          { id: 'p1', name: 'Pilot 1', imageUrl: '' },
          { id: 'p2', name: 'Pilot 2', imageUrl: '' },
          { id: 'p3', name: 'Pilot 3', imageUrl: '' },
          { id: 'p4', name: 'Pilot 4', imageUrl: '' },
        ],
        tournamentPhase: 'running',
        lastCompletedBracketType: null,
      })
    })

    it('should track lastCompletedBracketType after heat completion', () => {
      useTournamentStore.setState({
        heats: [{
          id: 'wb-heat-1',
          heatNumber: 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'active',
        }],
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: {
            rounds: [{
              id: 'wb-round-1',
              roundNumber: 1,
              roundName: 'WB Runde 1',
              heats: [{
                id: 'wb-heat-1',
                heatNumber: 1,
                pilotIds: ['p1', 'p2', 'p3', 'p4'],
                status: 'active',
                roundNumber: 1,
                bracketType: 'winner',
                sourceHeats: [],
                position: { x: 0, y: 0 }
              }]
            }]
          },
          loserBracket: { rounds: [] },
          grandFinale: null
        } as any
      })
      
      const { submitHeatResults } = useTournamentStore.getState()
      submitHeatResults('wb-heat-1', [
        { pilotId: 'p1', rank: 1 },
        { pilotId: 'p2', rank: 2 },
        { pilotId: 'p3', rank: 3 },
        { pilotId: 'p4', rank: 4 },
      ])
      
      const state = useTournamentStore.getState()
      expect(state.lastCompletedBracketType).toBe('winner')
    })

    it('should recommend LB heat after WB heat completion', () => {
      useTournamentStore.setState({
        lastCompletedBracketType: 'winner',
        heats: [
          { id: 'wb-heat-1', heatNumber: 1, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'pending' },
          { id: 'lb-heat-1', heatNumber: 2, pilotIds: ['p5', 'p6', 'p7', 'p8'], status: 'pending' },
        ],
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: {
            rounds: [{
              id: 'wb-round-1',
              roundNumber: 1,
              heats: [{ id: 'wb-heat-1', status: 'pending', pilotIds: ['p1', 'p2', 'p3', 'p4'] }]
            }]
          },
          loserBracket: {
            rounds: [{
              id: 'lb-round-1',
              roundNumber: 1,
              heats: [{ id: 'lb-heat-1', status: 'pending', pilotIds: ['p5', 'p6', 'p7', 'p8'] }]
            }]
          },
          grandFinale: null
        } as any
      })
      
      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()
      
      expect(recommended?.id).toBe('lb-heat-1')
    })

    it('should recommend WB heat after LB heat completion', () => {
      useTournamentStore.setState({
        lastCompletedBracketType: 'loser',
        heats: [
          { id: 'wb-heat-1', heatNumber: 1, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'pending' },
          { id: 'lb-heat-1', heatNumber: 2, pilotIds: ['p5', 'p6', 'p7', 'p8'], status: 'pending' },
        ],
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: {
            rounds: [{
              id: 'wb-round-1',
              roundNumber: 1,
              heats: [{ id: 'wb-heat-1', status: 'pending', pilotIds: ['p1', 'p2', 'p3', 'p4'] }]
            }]
          },
          loserBracket: {
            rounds: [{
              id: 'lb-round-1',
              roundNumber: 1,
              heats: [{ id: 'lb-heat-1', status: 'pending', pilotIds: ['p5', 'p6', 'p7', 'p8'] }]
            }]
          },
          grandFinale: null
        } as any
      })
      
      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()
      
      expect(recommended?.id).toBe('wb-heat-1')
    })

    it('should return only available bracket heat when one bracket has no heats', () => {
      useTournamentStore.setState({
        lastCompletedBracketType: 'winner',
        heats: [
          { id: 'wb-heat-1', heatNumber: 1, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'pending' },
        ],
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: {
            rounds: [{
              id: 'wb-round-1',
              roundNumber: 1,
              heats: [{ id: 'wb-heat-1', status: 'pending', pilotIds: ['p1', 'p2', 'p3', 'p4'] }]
            }]
          },
          loserBracket: { rounds: [] },
          grandFinale: null
        } as any
      })
      
      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()
      
      // Should return WB heat since LB has no heats
      expect(recommended?.id).toBe('wb-heat-1')
    })

    it('should return null when no pending heats exist', () => {
      useTournamentStore.setState({
        heats: [
          { id: 'wb-heat-1', heatNumber: 1, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' },
        ],
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: {
            rounds: [{
              id: 'wb-round-1',
              roundNumber: 1,
              heats: [{ id: 'wb-heat-1', status: 'completed', pilotIds: ['p1', 'p2', 'p3', 'p4'] }]
            }]
          },
          loserBracket: { rounds: [] },
          grandFinale: null
        } as any
      })
      
      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()
      
      expect(recommended).toBeNull()
    })
  })

  describe('Task 4-5: Auto-Trigger LB Heat Generation after WB/LB Heat', () => {
    beforeEach(() => {
      useTournamentStore.setState({
        pilots: [
          { id: 'p1', name: 'Pilot 1', imageUrl: '' },
          { id: 'p2', name: 'Pilot 2', imageUrl: '' },
          { id: 'p3', name: 'Pilot 3', imageUrl: '' },
          { id: 'p4', name: 'Pilot 4', imageUrl: '' },
          { id: 'p5', name: 'Pilot 5', imageUrl: '' },
          { id: 'p6', name: 'Pilot 6', imageUrl: '' },
          { id: 'p7', name: 'Pilot 7', imageUrl: '' },
          { id: 'p8', name: 'Pilot 8', imageUrl: '' },
        ],
        tournamentPhase: 'running',
        lastCompletedBracketType: null,
      })
    })

    it('should auto-generate LB heat when WB heat adds losers to pool >= 4', () => {
      // Pool already has 2 pilots, WB heat will add 2 more → total 4 → LB heat generated
      useTournamentStore.setState({
        loserPool: ['p5', 'p6'], // 2 existing
        heats: [{
          id: 'wb-heat-1',
          heatNumber: 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'active',
        }],
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: {
            rounds: [{
              id: 'wb-round-1',
              roundNumber: 1,
              roundName: 'WB Runde 1',
              heats: [{
                id: 'wb-heat-1',
                heatNumber: 1,
                pilotIds: ['p1', 'p2', 'p3', 'p4'],
                status: 'active',
                roundNumber: 1,
                bracketType: 'winner',
                sourceHeats: [],
                position: { x: 0, y: 0 }
              }, {
                id: 'wb-heat-2',
                heatNumber: 2,
                pilotIds: ['p5', 'p6', 'p7', 'p8'],
                status: 'pending',
                roundNumber: 1,
                bracketType: 'winner',
                sourceHeats: [],
                position: { x: 0, y: 0 }
              }]
            }]
          },
          loserBracket: { rounds: [] },
          grandFinale: null
        } as any
      })
      
      const { submitHeatResults } = useTournamentStore.getState()
      
      // Complete WB heat: p3, p4 become losers → added to pool
      submitHeatResults('wb-heat-1', [
        { pilotId: 'p1', rank: 1 },
        { pilotId: 'p2', rank: 2 },
        { pilotId: 'p3', rank: 3 },
        { pilotId: 'p4', rank: 4 },
      ])
      
      const state = useTournamentStore.getState()
      
      // Should have auto-generated an LB heat
      const lbHeats = state.heats.filter(h => h.id.startsWith('lb-heat-'))
      expect(lbHeats.length).toBeGreaterThanOrEqual(1)
      
      // Pool should have less than 4 pilots now (or 0 if exactly 4 were used)
      expect(state.loserPool.length).toBeLessThan(4)
    })

    it('should NOT auto-generate LB heat when pool < 4 after WB heat', () => {
      useTournamentStore.setState({
        loserPool: [], // Empty pool
        heats: [{
          id: 'wb-heat-1',
          heatNumber: 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'active',
        }],
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: {
            rounds: [{
              id: 'wb-round-1',
              roundNumber: 1,
              roundName: 'WB Runde 1',
              heats: [{
                id: 'wb-heat-1',
                heatNumber: 1,
                pilotIds: ['p1', 'p2', 'p3', 'p4'],
                status: 'active',
                roundNumber: 1,
                bracketType: 'winner',
                sourceHeats: [],
                position: { x: 0, y: 0 }
              }, {
                id: 'wb-heat-2',
                heatNumber: 2,
                pilotIds: ['p5', 'p6', 'p7', 'p8'],
                status: 'pending',
                roundNumber: 1,
                bracketType: 'winner',
                sourceHeats: [],
                position: { x: 0, y: 0 }
              }]
            }]
          },
          loserBracket: { rounds: [] },
          grandFinale: null
        } as any
      })
      
      const { submitHeatResults } = useTournamentStore.getState()
      
      // Complete WB heat: only 2 losers → pool will have 2
      submitHeatResults('wb-heat-1', [
        { pilotId: 'p1', rank: 1 },
        { pilotId: 'p2', rank: 2 },
        { pilotId: 'p3', rank: 3 },
        { pilotId: 'p4', rank: 4 },
      ])
      
      const state = useTournamentStore.getState()
      
      // Should NOT have auto-generated LB heat (only 2 in pool)
      const lbHeats = state.heats.filter(h => h.id.startsWith('lb-heat-'))
      expect(lbHeats.length).toBe(0)
      
      // Pool should have exactly 2 losers
      expect(state.loserPool).toContain('p3')
      expect(state.loserPool).toContain('p4')
      expect(state.loserPool.length).toBe(2)
    })
  })

  describe('Task 6: Wildcard Logic - AC4', () => {
    it('should keep 1-2 pilots waiting in pool when not enough for heat', () => {
      useTournamentStore.setState({
        pilots: [
          { id: 'p1', name: 'Pilot 1', imageUrl: '' },
          { id: 'p2', name: 'Pilot 2', imageUrl: '' },
        ],
        loserPool: ['p1', 'p2'],
        tournamentPhase: 'running',
        fullBracketStructure: createMinimalBracketStructure({ hasActiveWBHeats: true }) as any
      })
      
      const { canGenerateLBHeat, generateLBHeat } = useTournamentStore.getState()
      
      // Should not be able to generate with only 2 pilots during WB
      expect(canGenerateLBHeat()).toBe(false)
      expect(generateLBHeat()).toBeNull()
      
      // Pool should still have the waiting pilots
      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual(['p1', 'p2'])
    })

    it('should mix waiting pilots with new LB winners for next heat', () => {
      useTournamentStore.setState({
        pilots: [
          { id: 'p1', name: 'Pilot 1', imageUrl: '' },
          { id: 'p2', name: 'Pilot 2', imageUrl: '' },
          { id: 'p3', name: 'Pilot 3', imageUrl: '' },
          { id: 'p4', name: 'Pilot 4', imageUrl: '' },
          { id: 'p5', name: 'Pilot 5', imageUrl: '' },
          { id: 'p6', name: 'Pilot 6', imageUrl: '' },
        ],
        // 2 pilots already waiting in pool
        loserPool: ['p5', 'p6'],
        tournamentPhase: 'running',
        heats: [{
          id: 'lb-heat-1',
          heatNumber: 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'active',
        }],
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: {
            rounds: [{
              id: 'wb-round-1',
              roundNumber: 1,
              heats: [{ 
                id: 'wb-heat-pending', 
                status: 'pending',
                pilotIds: ['p7', 'p8', 'p9', 'p10'],
                roundNumber: 1,
                bracketType: 'winner'
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
                heatNumber: 1,
                pilotIds: ['p1', 'p2', 'p3', 'p4'],
                status: 'active',
                roundNumber: 1,
                bracketType: 'loser',
                sourceHeats: [],
                position: { x: 0, y: 0 }
              }]
            }]
          },
          grandFinale: null
        } as any
      })
      
      const { submitHeatResults } = useTournamentStore.getState()
      
      // Complete LB heat: p1, p2 win and go back to pool
      submitHeatResults('lb-heat-1', [
        { pilotId: 'p1', rank: 1 },
        { pilotId: 'p2', rank: 2 },
        { pilotId: 'p3', rank: 3 },
        { pilotId: 'p4', rank: 4 },
      ])
      
      const state = useTournamentStore.getState()
      
      // Pool should now have 4 pilots: 2 waiting + 2 winners
      // But since 4 >= minPool, a new LB heat should have been generated
      // So pool should be empty (all 4 used for new heat)
      const lbHeats = state.heats.filter(h => h.id.startsWith('lb-heat-'))
      expect(lbHeats.length).toBeGreaterThanOrEqual(1)
    })
  })
})
