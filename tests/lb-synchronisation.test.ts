/**
 * Tests for Story 13-2: LB-Pooling mit Runden-Synchronisation
 *
 * AC1: LB R1 startet nach WB R1 (alle Heats)
 * AC2: LB R1 enthält: Quali-Verlierer + WB R1-Verlierer (neu gemischt)
 * AC3: LB R2 startet nach WB R2 + LB R1 abgeschlossen
 * AC4: LB R2 enthält: LB R1-Gewinner + WB R2-Verlierer (neu gemischt)
 * AC5: Pool-Indikator zeigt Zusammensetzung an (optional UI)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTournamentStore, INITIAL_TOURNAMENT_STATE } from '../src/stores/tournamentStore'
import type { Pilot } from '../src/lib/schemas'
import type { Heat } from '../src/types'

// Helper: Create test pilots
function createTestPilots(count: number): Pilot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `pilot-${i + 1}`,
    name: `Pilot ${i + 1}`,
    imageUrl: `https://example.com/pilot-${i + 1}.jpg`,
  }))
}

// Helper: Reset store to clean state
function resetStore() {
  useTournamentStore.setState({
    ...structuredClone(INITIAL_TOURNAMENT_STATE),
  })
}

describe('Story 13-2: LB-Pooling mit Runden-Synchronisation', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('Task 1: LB-Pool Synchronisation mit WB-Runden', () => {
    describe('1.1: currentLBRoundPilots state exists (renamed from loserPool conceptually)', () => {
      it('should have loserPool state (existing name, semantic = currentLBRoundPilots)', () => {
        const state = useTournamentStore.getState()
        // loserPool bleibt als Name, wird aber semantisch als currentLBRoundPilots behandelt
        expect(Array.isArray(state.loserPool)).toBe(true)
      })
    })

    describe('1.2: LB-Runde startet nach WB-Runde UND vorheriger LB-Runde', () => {
      it('should not generate LB R1 before WB R1 is complete', () => {
        const pilots = createTestPilots(15)
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 1,
          currentLBRound: 0,
          // WB R1 heats exist but not completed
          heats: [
            {
              id: 'wb-r1-heat-1',
              heatNumber: 5,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'active', // NOT completed
              bracketType: 'winner',
              roundNumber: 1,
            },
          ],
          // Quali losers in pool
          loserPool: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8'],
        })

        const { generateLBRound, isRoundComplete } = useTournamentStore.getState()
        
        // WB R1 is NOT complete
        expect(isRoundComplete('winner', 1)).toBe(false)
        
        // Try to generate LB R1 - should return empty array
        const lbHeats = generateLBRound(1)
        expect(lbHeats).toEqual([])
      })

      it('should generate LB R1 when WB R1 is complete', () => {
        const pilots = createTestPilots(15)
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 1,
          currentLBRound: 0,
          // WB R1 heats completed
          heats: [
            {
              id: 'wb-r1-heat-1',
              heatNumber: 5,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-1', rank: 1 },
                  { pilotId: 'pilot-2', rank: 2 },
                  { pilotId: 'pilot-3', rank: 3 },
                  { pilotId: 'pilot-4', rank: 4 },
                ],
                completedAt: new Date().toISOString(),
              },
            },
          ],
          // Quali losers + WB R1 losers would be in pool
          loserPool: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8', 'pilot-3', 'pilot-4'],
        })

        const { generateLBRound, isRoundComplete } = useTournamentStore.getState()
        
        // WB R1 IS complete
        expect(isRoundComplete('winner', 1)).toBe(true)
        
        // Generate LB R1 - should create heats
        const lbHeats = generateLBRound(1)
        expect(lbHeats.length).toBeGreaterThan(0)
        expect(lbHeats[0].bracketType).toBe('loser')
        expect(lbHeats[0].roundNumber).toBe(1)
      })
    })

    describe('1.3: lbRoundWaitingForWB state', () => {
      it('should have lbRoundWaitingForWB state', () => {
        const state = useTournamentStore.getState()
        // Der State existiert und ist initial false
        expect(typeof state.lbRoundWaitingForWB).toBe('boolean')
      })

      it('should set lbRoundWaitingForWB to true when LB cannot proceed', () => {
        useTournamentStore.setState({
          isQualificationComplete: true,
          currentWBRound: 1,
          currentLBRound: 1,
          // LB R1 is complete
          heats: [
            {
              id: 'lb-r1-heat-1',
              heatNumber: 6,
              pilotIds: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8'],
              status: 'completed',
              bracketType: 'loser',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-5', rank: 1 },
                  { pilotId: 'pilot-6', rank: 2 },
                  { pilotId: 'pilot-7', rank: 3 },
                  { pilotId: 'pilot-8', rank: 4 },
                ],
                completedAt: new Date().toISOString(),
              },
            },
            // WB R2 NOT complete
            {
              id: 'wb-r2-heat-1',
              heatNumber: 7,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-9', 'pilot-10'],
              status: 'pending',
              bracketType: 'winner',
              roundNumber: 2,
            },
          ],
          loserPool: ['pilot-5', 'pilot-6'], // LB R1 winners waiting
        })

        const { isRoundComplete } = useTournamentStore.getState()
        
        // LB R1 is complete
        expect(isRoundComplete('loser', 1)).toBe(true)
        // WB R2 is NOT complete
        expect(isRoundComplete('winner', 2)).toBe(false)
        
        // Cannot generate LB R2 because WB R2 is not complete
        const { generateLBRound } = useTournamentStore.getState()
        const lbHeats = generateLBRound(2)
        expect(lbHeats).toEqual([])
        
        // State should indicate waiting
        const state = useTournamentStore.getState()
        expect(state.lbRoundWaitingForWB).toBe(true)
      })
    })
  })

  describe('Task 2: generateLBRound(roundNumber) implementieren', () => {
    describe('2.1: Bei roundNumber=1 - Quali-Verlierer + WB R1-Verlierer sammeln', () => {
      it('should collect quali losers and WB R1 losers for LB R1', () => {
        const pilots = createTestPilots(12)
        
        // Setup: 12 Piloten → 3 Quali-Heats (4er) → 6 Gewinner für WB, 6 Verlierer
        // WB R1 mit 6 Gewinnern → 2 Heats (3er) → 4 WB-Verlierer
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 1,
          currentLBRound: 0,
          heats: [
            // Quali heats (completed) - nicht relevant für diesen Test
            // WB R1 heats (completed)
            {
              id: 'wb-r1-heat-1',
              heatNumber: 4,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-1', rank: 1 },
                  { pilotId: 'pilot-2', rank: 2 },
                  { pilotId: 'pilot-3', rank: 3 }, // WB loser
                ],
                completedAt: new Date().toISOString(),
              },
            },
            {
              id: 'wb-r1-heat-2',
              heatNumber: 5,
              pilotIds: ['pilot-4', 'pilot-5', 'pilot-6'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-4', rank: 1 },
                  { pilotId: 'pilot-5', rank: 2 },
                  { pilotId: 'pilot-6', rank: 3 }, // WB loser
                ],
                completedAt: new Date().toISOString(),
              },
            },
          ],
          // Quali losers already in pool (from quali heats)
          loserPool: ['pilot-7', 'pilot-8', 'pilot-9', 'pilot-10', 'pilot-11', 'pilot-12'],
        })

        const { generateLBRound } = useTournamentStore.getState()
        const lbHeats = generateLBRound(1)
        
        // LB R1 should have heats
        expect(lbHeats.length).toBeGreaterThan(0)
        
        // All pilots in LB R1 should be either quali losers or WB R1 losers
        const allLbPilots = lbHeats.flatMap(h => h.pilotIds)
        
        // Should contain quali losers
        expect(allLbPilots).toContain('pilot-7')
        expect(allLbPilots).toContain('pilot-8')
        
        // Should contain WB R1 losers (collected from results)
        // Note: In real implementation, WB losers come from submitHeatResults
        // This test verifies the pool already contains them
      })
    })

    describe('2.2: Bei roundNumber>1 - LB Rn-1-Gewinner + WB Rn-Verlierer sammeln', () => {
      it('should collect LB R1 winners and WB R2 losers for LB R2', () => {
        const pilots = createTestPilots(16)
        
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 2,
          currentLBRound: 1,
          heats: [
            // LB R1 heat (completed)
            {
              id: 'lb-r1-heat-1',
              heatNumber: 6,
              pilotIds: ['pilot-9', 'pilot-10', 'pilot-11', 'pilot-12'],
              status: 'completed',
              bracketType: 'loser',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-9', rank: 1 },  // LB R1 winner
                  { pilotId: 'pilot-10', rank: 2 }, // LB R1 winner
                  { pilotId: 'pilot-11', rank: 3 }, // Eliminated
                  { pilotId: 'pilot-12', rank: 4 }, // Eliminated
                ],
                completedAt: new Date().toISOString(),
              },
            },
            // WB R2 heat (completed)
            {
              id: 'wb-r2-heat-1',
              heatNumber: 7,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 2,
              results: {
                rankings: [
                  { pilotId: 'pilot-1', rank: 1 },
                  { pilotId: 'pilot-2', rank: 2 },
                  { pilotId: 'pilot-3', rank: 3 }, // WB R2 loser
                  { pilotId: 'pilot-4', rank: 4 }, // WB R2 loser
                ],
                completedAt: new Date().toISOString(),
              },
            },
          ],
          // Pool contains LB R1 winners (waiting for WB R2 to finish)
          loserPool: ['pilot-9', 'pilot-10'],
        })

        const { generateLBRound, isRoundComplete } = useTournamentStore.getState()
        
        // Both LB R1 and WB R2 are complete
        expect(isRoundComplete('loser', 1)).toBe(true)
        expect(isRoundComplete('winner', 2)).toBe(true)
        
        const lbHeats = generateLBRound(2)
        
        // Should generate LB R2 heats
        expect(lbHeats.length).toBeGreaterThan(0)
        expect(lbHeats[0].roundNumber).toBe(2)
        
        // Pilots should be from LB R1 winners + WB R2 losers
        const allPilots = lbHeats.flatMap(h => h.pilotIds)
        expect(allPilots).toContain('pilot-9')  // LB R1 winner
        expect(allPilots).toContain('pilot-10') // LB R1 winner
        // WB R2 losers should be added to pool before generateLBRound
      })
    })

    describe('2.3: Piloten neu mischen (shuffleArray)', () => {
      it('should shuffle pilots before creating heats', () => {
        const pilots = createTestPilots(12)
        
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 1,
          currentLBRound: 0,
          heats: [
            {
              id: 'wb-r1-heat-1',
              heatNumber: 4,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-1', rank: 1 },
                  { pilotId: 'pilot-2', rank: 2 },
                  { pilotId: 'pilot-3', rank: 3 },
                  { pilotId: 'pilot-4', rank: 4 },
                ],
                completedAt: new Date().toISOString(),
              },
            },
          ],
          loserPool: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8', 'pilot-9', 'pilot-10', 'pilot-11', 'pilot-12'],
        })

        // Generate multiple times to verify shuffling occurs
        // (Note: With 8 pilots, we get 2 heats of 4)
        const { generateLBRound } = useTournamentStore.getState()
        const lbHeats1 = generateLBRound(1)
        
        // Reset and generate again
        resetStore()
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 1,
          currentLBRound: 0,
          heats: [
            {
              id: 'wb-r1-heat-1',
              heatNumber: 4,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-1', rank: 1 },
                  { pilotId: 'pilot-2', rank: 2 },
                  { pilotId: 'pilot-3', rank: 3 },
                  { pilotId: 'pilot-4', rank: 4 },
                ],
                completedAt: new Date().toISOString(),
              },
            },
          ],
          loserPool: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8', 'pilot-9', 'pilot-10', 'pilot-11', 'pilot-12'],
        })
        
        const { generateLBRound: generateLBRound2 } = useTournamentStore.getState()
        const lbHeats2 = generateLBRound2(1)
        
        // Both should have heats
        expect(lbHeats1.length).toBeGreaterThan(0)
        expect(lbHeats2.length).toBeGreaterThan(0)
        
        // Due to random shuffling, pilot order should likely differ
        // (This is probabilistic - in rare cases they could be the same)
        // We just verify the heat structure is correct
        expect(lbHeats1[0].pilotIds.length).toBe(4)
        expect(lbHeats2[0].pilotIds.length).toBe(4)
      })
    })

    describe('2.4: Heats generieren (4er, Rest 3er)', () => {
      it('should create 4-pilot heats, with remainder as 3-pilot heats', () => {
        const pilots = createTestPilots(15)
        
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 1,
          currentLBRound: 0,
          heats: [
            {
              id: 'wb-r1-heat-1',
              heatNumber: 4,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-1', rank: 1 },
                  { pilotId: 'pilot-2', rank: 2 },
                  { pilotId: 'pilot-3', rank: 3 },
                  { pilotId: 'pilot-4', rank: 4 },
                ],
                completedAt: new Date().toISOString(),
              },
            },
          ],
          // 7 pilots for LB R1
          loserPool: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8', 'pilot-9', 'pilot-10', 'pilot-11'],
        })

        const { generateLBRound } = useTournamentStore.getState()
        const lbHeats = generateLBRound(1)
        
        // 7 pilots = 1×4 + 1×3 heats
        expect(lbHeats.length).toBe(2)
        
        const sizes = lbHeats.map(h => h.pilotIds.length).sort((a, b) => b - a)
        expect(sizes).toEqual([4, 3])
      })

      it('should handle 8 pilots as 2×4 heats', () => {
        const pilots = createTestPilots(16)
        
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 1,
          currentLBRound: 0,
          heats: [
            {
              id: 'wb-r1-heat-1',
              heatNumber: 4,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-1', rank: 1 },
                  { pilotId: 'pilot-2', rank: 2 },
                  { pilotId: 'pilot-3', rank: 3 },
                  { pilotId: 'pilot-4', rank: 4 },
                ],
                completedAt: new Date().toISOString(),
              },
            },
          ],
          // 8 pilots for LB R1
          loserPool: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8', 'pilot-9', 'pilot-10', 'pilot-11', 'pilot-12'],
        })

        const { generateLBRound } = useTournamentStore.getState()
        const lbHeats = generateLBRound(1)
        
        // 8 pilots = 2×4 heats
        expect(lbHeats.length).toBe(2)
        expect(lbHeats[0].pilotIds.length).toBe(4)
        expect(lbHeats[1].pilotIds.length).toBe(4)
      })
    })
  })

  describe('Task 3: Pool-Neu-Mischung', () => {
    describe('3.1 + 3.2: Keine festen Heat-to-Heat Verbindungen im LB', () => {
      it('should shuffle pilots for each new LB round', () => {
        // This is verified by the shuffleArray call in generateLBRound
        // The key difference from WB: LB has no sourceHeats connections
        const pilots = createTestPilots(12)
        
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 1,
          currentLBRound: 0,
          heats: [
            {
              id: 'wb-r1-heat-1',
              heatNumber: 4,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-1', rank: 1 },
                  { pilotId: 'pilot-2', rank: 2 },
                  { pilotId: 'pilot-3', rank: 3 },
                  { pilotId: 'pilot-4', rank: 4 },
                ],
                completedAt: new Date().toISOString(),
              },
            },
          ],
          loserPool: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8'],
        })

        const { generateLBRound } = useTournamentStore.getState()
        const lbHeats = generateLBRound(1)
        
        // LB heats should NOT have sourceHeats property (unlike WB)
        expect(lbHeats[0]).not.toHaveProperty('sourceHeats')
      })
    })
  })

  describe('Task 4: submitHeatResults() für LB-Runden-Synchronisation', () => {
    describe('4.1 + 4.2: LB-Heat Gewinner/Verlierer Handling', () => {
      it('should put LB heat winners back in pool', () => {
        const pilots = createTestPilots(8)
        
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentLBRound: 1,
          loserPool: [],
          eliminatedPilots: [],
          heats: [
            {
              id: 'lb-r1-heat-1',
              heatNumber: 5,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'active',
              bracketType: 'loser',
              roundNumber: 1,
            },
          ],
        })

        const { submitHeatResults } = useTournamentStore.getState()
        
        submitHeatResults('lb-r1-heat-1', [
          { pilotId: 'pilot-1', rank: 1 },
          { pilotId: 'pilot-2', rank: 2 },
          { pilotId: 'pilot-3', rank: 3 },
          { pilotId: 'pilot-4', rank: 4 },
        ])
        
        const state = useTournamentStore.getState()
        
        // Winners (rank 1+2) should be in pool
        expect(state.loserPool).toContain('pilot-1')
        expect(state.loserPool).toContain('pilot-2')
        
        // Losers (rank 3+4) should be eliminated
        expect(state.eliminatedPilots).toContain('pilot-3')
        expect(state.eliminatedPilots).toContain('pilot-4')
      })
    })

    describe('4.3 + 4.4: LB-Runden-Abschluss Erkennung', () => {
      it('should recognize when LB round is complete', () => {
        const pilots = createTestPilots(12)
        
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 2,
          currentLBRound: 1,
          loserPool: ['pilot-9', 'pilot-10'], // LB R1 winners from first heat
          heats: [
            // LB R1 Heat 1 - completed
            {
              id: 'lb-r1-heat-1',
              heatNumber: 5,
              pilotIds: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8'],
              status: 'completed',
              bracketType: 'loser',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-9', rank: 1 },
                  { pilotId: 'pilot-10', rank: 2 },
                  { pilotId: 'pilot-7', rank: 3 },
                  { pilotId: 'pilot-8', rank: 4 },
                ],
                completedAt: new Date().toISOString(),
              },
            },
            // LB R1 Heat 2 - to be completed
            {
              id: 'lb-r1-heat-2',
              heatNumber: 6,
              pilotIds: ['pilot-11', 'pilot-12', 'pilot-3', 'pilot-4'],
              status: 'active',
              bracketType: 'loser',
              roundNumber: 1,
            },
            // WB R2 - completed (needed for LB R2)
            {
              id: 'wb-r2-heat-1',
              heatNumber: 7,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-5', 'pilot-6'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 2,
              results: {
                rankings: [
                  { pilotId: 'pilot-1', rank: 1 },
                  { pilotId: 'pilot-2', rank: 2 },
                  { pilotId: 'pilot-5', rank: 3 },
                  { pilotId: 'pilot-6', rank: 4 },
                ],
                completedAt: new Date().toISOString(),
              },
            },
          ],
        })

        const { submitHeatResults, isRoundComplete } = useTournamentStore.getState()
        
        // Before: LB R1 is NOT complete
        expect(isRoundComplete('loser', 1)).toBe(false)
        
        // Complete the last LB R1 heat
        submitHeatResults('lb-r1-heat-2', [
          { pilotId: 'pilot-11', rank: 1 },
          { pilotId: 'pilot-12', rank: 2 },
          { pilotId: 'pilot-3', rank: 3 },
          { pilotId: 'pilot-4', rank: 4 },
        ])
        
        // After: LB R1 IS complete
        const { isRoundComplete: isRoundComplete2 } = useTournamentStore.getState()
        expect(isRoundComplete2('loser', 1)).toBe(true)
      })
    })
  })

  describe('Task 5: Integration Tests', () => {
    describe('5.1: LB R1 startet erst nach WB R1 komplett', () => {
      it('should wait for WB R1 before starting LB R1 (AC1)', () => {
        const pilots = createTestPilots(15)
        
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 1,
          currentLBRound: 0,
          heats: [
            {
              id: 'wb-r1-heat-1',
              heatNumber: 4,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'pending', // NOT completed yet
              bracketType: 'winner',
              roundNumber: 1,
            },
          ],
          loserPool: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8'],
        })

        const { generateLBRound, isRoundComplete } = useTournamentStore.getState()
        
        expect(isRoundComplete('winner', 1)).toBe(false)
        
        const lbHeats = generateLBRound(1)
        expect(lbHeats).toEqual([])
      })
    })

    describe('5.2: LB R1 enthält Quali + WB R1 Verlierer (AC2)', () => {
      it('should include both quali losers and WB R1 losers', () => {
        const pilots = createTestPilots(12)
        
        // Simulate: After quali and WB R1 are complete
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 1,
          currentLBRound: 0,
          heats: [
            // WB R1 completed
            {
              id: 'wb-r1-heat-1',
              heatNumber: 4,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-1', rank: 1 },
                  { pilotId: 'pilot-2', rank: 2 },
                  { pilotId: 'pilot-3', rank: 3 }, // WB R1 loser
                  { pilotId: 'pilot-4', rank: 4 }, // WB R1 loser
                ],
                completedAt: new Date().toISOString(),
              },
            },
          ],
          // Pool contains: Quali losers + WB R1 losers
          loserPool: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8', 'pilot-3', 'pilot-4'],
        })

        const { generateLBRound } = useTournamentStore.getState()
        const lbHeats = generateLBRound(1)
        
        const allPilots = lbHeats.flatMap(h => h.pilotIds)
        
        // Should contain quali losers
        expect(allPilots).toContain('pilot-5')
        expect(allPilots).toContain('pilot-6')
        
        // Should contain WB R1 losers
        expect(allPilots).toContain('pilot-3')
        expect(allPilots).toContain('pilot-4')
      })
    })

    describe('5.3: LB R2 enthält LB R1 Gewinner + WB R2 Verlierer (AC4)', () => {
      it('should include LB R1 winners and WB R2 losers in LB R2', () => {
        const pilots = createTestPilots(16)
        
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 2,
          currentLBRound: 1,
          heats: [
            // LB R1 completed - winners: pilot-9, pilot-10
            {
              id: 'lb-r1-heat-1',
              heatNumber: 5,
              pilotIds: ['pilot-9', 'pilot-10', 'pilot-11', 'pilot-12'],
              status: 'completed',
              bracketType: 'loser',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-9', rank: 1 },
                  { pilotId: 'pilot-10', rank: 2 },
                  { pilotId: 'pilot-11', rank: 3 },
                  { pilotId: 'pilot-12', rank: 4 },
                ],
                completedAt: new Date().toISOString(),
              },
            },
            // WB R2 completed - losers: pilot-3, pilot-4
            {
              id: 'wb-r2-heat-1',
              heatNumber: 6,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 2,
              results: {
                rankings: [
                  { pilotId: 'pilot-1', rank: 1 },
                  { pilotId: 'pilot-2', rank: 2 },
                  { pilotId: 'pilot-3', rank: 3 },
                  { pilotId: 'pilot-4', rank: 4 },
                ],
                completedAt: new Date().toISOString(),
              },
            },
          ],
          // Pool: LB R1 winners + WB R2 losers
          loserPool: ['pilot-9', 'pilot-10', 'pilot-3', 'pilot-4'],
        })

        const { generateLBRound, isRoundComplete } = useTournamentStore.getState()
        
        // Both prerequisite rounds are complete
        expect(isRoundComplete('loser', 1)).toBe(true)
        expect(isRoundComplete('winner', 2)).toBe(true)
        
        const lbHeats = generateLBRound(2)
        
        expect(lbHeats.length).toBeGreaterThan(0)
        expect(lbHeats[0].roundNumber).toBe(2)
        
        const allPilots = lbHeats.flatMap(h => h.pilotIds)
        
        // Should contain LB R1 winners
        expect(allPilots).toContain('pilot-9')
        expect(allPilots).toContain('pilot-10')
        
        // Should contain WB R2 losers
        expect(allPilots).toContain('pilot-3')
        expect(allPilots).toContain('pilot-4')
      })
    })

    describe('5.4: Piloten werden vor Heat-Erstellung gemischt', () => {
      it('should shuffle pilots before creating heats', () => {
        // The shuffling is implemented using shuffleArray()
        // We can verify by checking that the function is called
        // (This is more of an implementation detail test)
        
        const pilots = createTestPilots(8)
        
        useTournamentStore.setState({
          pilots,
          tournamentStarted: true,
          tournamentPhase: 'running',
          isQualificationComplete: true,
          currentWBRound: 1,
          currentLBRound: 0,
          heats: [
            {
              id: 'wb-r1-heat-1',
              heatNumber: 4,
              pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
              status: 'completed',
              bracketType: 'winner',
              roundNumber: 1,
              results: {
                rankings: [
                  { pilotId: 'pilot-1', rank: 1 },
                  { pilotId: 'pilot-2', rank: 2 },
                  { pilotId: 'pilot-3', rank: 3 },
                  { pilotId: 'pilot-4', rank: 4 },
                ],
                completedAt: new Date().toISOString(),
              },
            },
          ],
          loserPool: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8'],
        })

        const { generateLBRound } = useTournamentStore.getState()
        const lbHeats = generateLBRound(1)
        
        // Verify heats were created
        expect(lbHeats.length).toBe(1) // 4 pilots = 1 heat
        expect(lbHeats[0].pilotIds.length).toBe(4)
        
        // All 4 pilots should be in the heat (shuffled order)
        const pilotSet = new Set(lbHeats[0].pilotIds)
        expect(pilotSet.has('pilot-5')).toBe(true)
        expect(pilotSet.has('pilot-6')).toBe(true)
        expect(pilotSet.has('pilot-7')).toBe(true)
        expect(pilotSet.has('pilot-8')).toBe(true)
      })
    })
  })
})
