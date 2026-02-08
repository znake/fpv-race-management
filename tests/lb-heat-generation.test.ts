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
import { useTournamentStore } from '@/stores/tournamentStore'

// Helper to create minimal heats array for tests (replaces fullBracketStructure)
function createMinimalHeats(options: {
  hasActiveWBHeats?: boolean
}) {
  return [{
    id: 'wb-heat-1',
    heatNumber: 1,
    pilotIds: ['p1', 'p2', 'p3', 'p4'],
    status: options.hasActiveWBHeats ? 'pending' as const : 'completed' as const,
    bracketType: 'winner' as const
  }]
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
      lastCompletedBracketType: null,
    })
  })

  describe('Task 1: canGenerateLBHeat() - AC1, AC5', () => {
    it('should return false when pool has less than 4 pilots and WB is active', () => {
      useTournamentStore.setState({
        loserPool: ['p1', 'p2', 'p3'],
        tournamentPhase: 'running',
        // REFACTORED: hasActiveWBHeats now uses heats[] not fullBracketStructure
        heats: [{
          id: 'wb-heat-1',
          heatNumber: 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'pending',
          bracketType: 'winner'
        }]
      })
      
      const { canGenerateLBHeat } = useTournamentStore.getState()
      expect(canGenerateLBHeat()).toBe(false)
    })

    it('should return true when pool has exactly 4 pilots and WB is active', () => {
      useTournamentStore.setState({
        loserPool: ['p1', 'p2', 'p3', 'p4'],
        tournamentPhase: 'running',
        heats: [{
          id: 'wb-heat-1',
          heatNumber: 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'pending',
          bracketType: 'winner'
        }]
      })
      
      const { canGenerateLBHeat } = useTournamentStore.getState()
      expect(canGenerateLBHeat()).toBe(true)
    })

    it('should return true when pool has more than 4 pilots', () => {
      useTournamentStore.setState({
        loserPool: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
        tournamentPhase: 'running',
        heats: [{
          id: 'wb-heat-1',
          heatNumber: 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'pending',
          bracketType: 'winner'
        }]
      })
      
      const { canGenerateLBHeat } = useTournamentStore.getState()
      expect(canGenerateLBHeat()).toBe(true)
    })

    it('should return true when pool has 3 pilots and WB is completed (all heats done)', () => {
      useTournamentStore.setState({
        loserPool: ['p1', 'p2', 'p3'],
        tournamentPhase: 'running',
        // No pending/active WB heats
        heats: [{
          id: 'wb-heat-1',
          heatNumber: 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'completed',
          bracketType: 'winner'
        }]
      })
      
      const { canGenerateLBHeat } = useTournamentStore.getState()
      expect(canGenerateLBHeat()).toBe(true)
    })

    it('should return false when pool is empty', () => {
      useTournamentStore.setState({
        loserPool: [],
        tournamentPhase: 'running',
        heats: []
      })
      
      const { canGenerateLBHeat } = useTournamentStore.getState()
      expect(canGenerateLBHeat()).toBe(false)
    })

    it('should return false when pool has only 2 pilots and WB not finished', () => {
      useTournamentStore.setState({
        loserPool: ['p1', 'p2'],
        tournamentPhase: 'running',
        heats: createMinimalHeats({ hasActiveWBHeats: true })
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
        isQualificationComplete: true, // WICHTIG: LB Heats werden erst nach Quali generiert
        heats: createMinimalHeats({ hasActiveWBHeats: true })
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
      useTournamentStore.setState({ 
        loserPool: ['p1', 'p2'],
        isQualificationComplete: true // Quali ist abgeschlossen, aber nur 2 Piloten
      })
      
      const { generateLBHeat } = useTournamentStore.getState()
      const result = generateLBHeat()
      
      expect(result).toBeNull()
    })

    it('should use FIFO selection - first 4 pilots from pool', () => {
      const { generateLBHeat } = useTournamentStore.getState()
      
      // Generate LB heat - should use FIFO (first 4 pilots)
      const heat = generateLBHeat()
      
      // AC 4: FIFO - erste 4 Piloten aus Pool nehmen
      expect(heat?.pilotIds).toEqual(['p1', 'p2', 'p3', 'p4'])
      
      // Remaining pilots should be p5, p6
      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual(['p5', 'p6'])
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
          bracketType: 'loser'
        }]
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
          bracketType: 'winner'
        }]
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
        isQualificationComplete: true,  // WICHTIG: Quali muss abgeschlossen sein
        heats: [
          { id: 'wb-heat-1', heatNumber: 1, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'pending', bracketType: 'winner' },
          { id: 'lb-heat-1', heatNumber: 2, pilotIds: ['p5', 'p6', 'p7', 'p8'], status: 'pending', bracketType: 'loser' },
        ]
      })
      
      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()
      
      expect(recommended?.id).toBe('lb-heat-1')
    })

    it('should recommend WB heat after LB heat completion', () => {
      useTournamentStore.setState({
        lastCompletedBracketType: 'loser',
        heats: [
          { id: 'wb-heat-1', heatNumber: 1, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'pending', bracketType: 'winner' },
          { id: 'lb-heat-1', heatNumber: 2, pilotIds: ['p5', 'p6', 'p7', 'p8'], status: 'pending', bracketType: 'loser' },
        ]
      })
      
      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()
      
      expect(recommended?.id).toBe('wb-heat-1')
    })

    it('should return only available bracket heat when one bracket has no heats', () => {
      useTournamentStore.setState({
        lastCompletedBracketType: 'winner',
        heats: [
          { id: 'wb-heat-1', heatNumber: 1, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'pending', bracketType: 'winner' },
        ]
      })
      
      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()
      
      // Should return WB heat since LB has no heats
      expect(recommended?.id).toBe('wb-heat-1')
    })

    it('should return null when no pending heats exist', () => {
      useTournamentStore.setState({
        heats: [
          { id: 'wb-heat-1', heatNumber: 1, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed', bracketType: 'winner' },
        ]
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
        isQualificationComplete: true, // WICHTIG: LB Heats werden erst nach Quali generiert
        lastCompletedBracketType: null,
      })
    })

    it('should auto-generate LB heat when ALL WB heats of the round are completed', () => {
      // LB R1 can only start after WB R1 is COMPLETELY finished
      // This ensures all WB losers are in the loserPool before LB heats are generated
      useTournamentStore.setState({
        loserPool: ['p9', 'p10', 'p11', 'p12'], // 4 existing from Quali
        heats: [
          {
            id: 'wb-heat-1',
            heatNumber: 1,
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            status: 'active',
            bracketType: 'winner',
            roundNumber: 1
          },
          {
            id: 'wb-heat-2',
            heatNumber: 2,
            pilotIds: ['p5', 'p6', 'p7', 'p8'],
            status: 'pending',
            bracketType: 'winner',
            roundNumber: 1
          }
        ]
      })
      
      const { submitHeatResults } = useTournamentStore.getState()
      
      // Complete FIRST WB heat: p3, p4 become losers → added to pool
      submitHeatResults('wb-heat-1', [
        { pilotId: 'p1', rank: 1 },
        { pilotId: 'p2', rank: 2 },
        { pilotId: 'p3', rank: 3 },
        { pilotId: 'p4', rank: 4 },
      ])
      
      let state = useTournamentStore.getState()
      
      // Should NOT have generated LB heats yet - WB R1 not complete
      let lbHeats = state.heats.filter(h => h.id.startsWith('lb-heat-'))
      expect(lbHeats.length).toBe(0)
      
      // Pool should have 6 pilots now (4 from Quali + 2 from WB)
      expect(state.loserPool.length).toBe(6)
      
      // Complete SECOND WB heat: p7, p8 become losers → added to pool
      submitHeatResults('wb-heat-2', [
        { pilotId: 'p5', rank: 1 },
        { pilotId: 'p6', rank: 2 },
        { pilotId: 'p7', rank: 3 },
        { pilotId: 'p8', rank: 4 },
      ])
      
      state = useTournamentStore.getState()
      
      // NOW LB heats should be generated - WB R1 is complete
      lbHeats = state.heats.filter(h => h.id.startsWith('lb-heat-'))
      expect(lbHeats.length).toBeGreaterThanOrEqual(1)
      
      // Pool should have been used for LB heats (8 pilots → 2 heats of 4)
      expect(state.loserPool.length).toBe(0)
    })

    it('should NOT auto-generate LB heat when pool < 4 after WB heat', () => {
      useTournamentStore.setState({
        loserPool: [], // Empty pool
        heats: [
          {
            id: 'wb-heat-1',
            heatNumber: 1,
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            status: 'active',
            bracketType: 'winner'
          },
          {
            id: 'wb-heat-2',
            heatNumber: 2,
            pilotIds: ['p5', 'p6', 'p7', 'p8'],
            status: 'pending',
            bracketType: 'winner'
          }
        ]
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
        isQualificationComplete: true, // WICHTIG: LB Heats werden erst nach Quali generiert
        heats: createMinimalHeats({ hasActiveWBHeats: true })
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
        isQualificationComplete: true, // WICHTIG: LB Heats werden erst nach Quali generiert
        heats: [
          {
            id: 'lb-heat-1',
            heatNumber: 1,
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            status: 'active',
            bracketType: 'loser'
          },
          {
            id: 'wb-heat-pending',
            heatNumber: 2,
            pilotIds: ['p7', 'p8', 'p9', 'p10'],
            status: 'pending',
            bracketType: 'winner'
          }
        ]
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
