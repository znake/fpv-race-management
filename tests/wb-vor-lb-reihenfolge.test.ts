/**
 * Story 13-5: WB-vor-LB Reihenfolge Tests
 * 
 * AC1: getNextRecommendedHeat() priorisiert WB vor LB innerhalb derselben Runde
 * AC2: LB-Heats einer Runde werden erst empfohlen wenn alle WB-Heats der Runde abgeschlossen sind
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTournamentStore, INITIAL_TOURNAMENT_STATE } from '../src/stores/tournamentStore'
import type { Heat } from '../src/types'

// Helper to reset store
const resetStore = () => {
  useTournamentStore.setState({
    ...structuredClone(INITIAL_TOURNAMENT_STATE),
  })
}

// Helper to create a heat
const createHeat = (overrides: Partial<Heat> & { id: string }): Heat => ({
  heatNumber: 1,
  pilotIds: ['p1', 'p2', 'p3', 'p4'],
  status: 'pending',
  ...overrides,
})

describe('Story 13-5: WB-vor-LB Reihenfolge', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('AC3: getCurrentPhaseDescription - Visueller Indikator', () => {
    it('should return "Setup" when tournament not started', () => {
      useTournamentStore.setState({
        tournamentPhase: 'setup',
      })

      const { getCurrentPhaseDescription } = useTournamentStore.getState()
      expect(getCurrentPhaseDescription()).toBe('Setup')
    })

    it('should return "Turnier beendet" when completed', () => {
      useTournamentStore.setState({
        tournamentPhase: 'completed',
      })

      const { getCurrentPhaseDescription } = useTournamentStore.getState()
      expect(getCurrentPhaseDescription()).toBe('Turnier beendet')
    })

    it('should return "Quali läuft" during qualification', () => {
      const qualiHeat: Heat = createHeat({
        id: 'quali-h1',
        bracketType: 'qualification',
        status: 'active',
      })

      useTournamentStore.setState({
        heats: [qualiHeat],
        tournamentPhase: 'running',
        isQualificationComplete: false,
      })

      const { getCurrentPhaseDescription } = useTournamentStore.getState()
      expect(getCurrentPhaseDescription()).toContain('Quali läuft')
    })

    it('should return "WB Runde X läuft" when WB heat is active', () => {
      const wbHeat: Heat = createHeat({
        id: 'wb-r1-h1',
        bracketType: 'winner',
        roundNumber: 1,
        status: 'active',
      })

      useTournamentStore.setState({
        heats: [wbHeat],
        tournamentPhase: 'running',
        isQualificationComplete: true,
      })

      const { getCurrentPhaseDescription } = useTournamentStore.getState()
      expect(getCurrentPhaseDescription()).toBe('WB Runde 1 läuft')
    })

    it('should return "LB Runde X wartet auf WB" when LB is waiting', () => {
      const lbHeat: Heat = createHeat({
        id: 'lb-r1-h1',
        bracketType: 'loser',
        roundNumber: 1,
        status: 'pending',
      })

      useTournamentStore.setState({
        heats: [lbHeat],
        tournamentPhase: 'running',
        isQualificationComplete: true,
        lbRoundWaitingForWB: true,
      })

      const { getCurrentPhaseDescription } = useTournamentStore.getState()
      expect(getCurrentPhaseDescription()).toBe('LB Runde 1 wartet auf WB')
    })

    it('should return "Grand Finale" when grand finale is pending', () => {
      const grandFinale: Heat = createHeat({
        id: 'grand-finale',
        bracketType: 'grand_finale',
        isFinale: true,
        status: 'pending',
      })

      useTournamentStore.setState({
        heats: [grandFinale],
        tournamentPhase: 'finale',
        isQualificationComplete: true,
      })

      const { getCurrentPhaseDescription } = useTournamentStore.getState()
      expect(getCurrentPhaseDescription()).toBe('Grand Finale')
    })
  })

  describe('AC1: WB wird vor LB priorisiert innerhalb derselben Runde', () => {
    it('should recommend WB heat when both WB and LB heats of same round are pending', () => {
      // Setup: WB R1 und LB R1 beide pending
      const wbHeat: Heat = createHeat({
        id: 'wb-r1-h1',
        bracketType: 'winner',
        roundNumber: 1,
        status: 'pending',
      })
      const lbHeat: Heat = createHeat({
        id: 'lb-r1-h1',
        bracketType: 'loser',
        roundNumber: 1,
        status: 'pending',
      })

      useTournamentStore.setState({
        heats: [wbHeat, lbHeat],
        isQualificationComplete: true,
        currentWBRound: 1,
        currentLBRound: 1,
      })

      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()

      // WB sollte vor LB empfohlen werden
      expect(recommended?.id).toBe('wb-r1-h1')
      expect(recommended?.bracketType).toBe('winner')
    })

    it('should recommend WB heat even if LB heat was added first', () => {
      // LB zuerst im Array, aber WB sollte trotzdem priorisiert werden
      const lbHeat: Heat = createHeat({
        id: 'lb-r1-h1',
        bracketType: 'loser',
        roundNumber: 1,
        status: 'pending',
      })
      const wbHeat: Heat = createHeat({
        id: 'wb-r1-h1',
        bracketType: 'winner',
        roundNumber: 1,
        status: 'pending',
      })

      useTournamentStore.setState({
        heats: [lbHeat, wbHeat], // LB zuerst im Array
        isQualificationComplete: true,
        currentWBRound: 1,
        currentLBRound: 1,
      })

      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()

      expect(recommended?.id).toBe('wb-r1-h1')
    })
  })

  describe('AC2: LB blockiert bis WB abgeschlossen', () => {
    it('should not recommend LB heat when WB heats of same round are still pending', () => {
      const wbHeat1: Heat = createHeat({
        id: 'wb-r1-h1',
        bracketType: 'winner',
        roundNumber: 1,
        status: 'completed',
      })
      const wbHeat2: Heat = createHeat({
        id: 'wb-r1-h2',
        bracketType: 'winner',
        roundNumber: 1,
        status: 'pending', // Noch nicht fertig!
      })
      const lbHeat: Heat = createHeat({
        id: 'lb-r1-h1',
        bracketType: 'loser',
        roundNumber: 1,
        status: 'pending',
      })

      useTournamentStore.setState({
        heats: [wbHeat1, wbHeat2, lbHeat],
        isQualificationComplete: true,
        currentWBRound: 1,
        currentLBRound: 1,
      })

      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()

      // Sollte den verbleibenden WB Heat empfehlen, nicht LB
      expect(recommended?.id).toBe('wb-r1-h2')
      expect(recommended?.bracketType).toBe('winner')
    })

    it('should recommend LB heat when all WB heats of same round are completed', () => {
      const wbHeat1: Heat = createHeat({
        id: 'wb-r1-h1',
        bracketType: 'winner',
        roundNumber: 1,
        status: 'completed',
      })
      const wbHeat2: Heat = createHeat({
        id: 'wb-r1-h2',
        bracketType: 'winner',
        roundNumber: 1,
        status: 'completed',
      })
      const lbHeat: Heat = createHeat({
        id: 'lb-r1-h1',
        bracketType: 'loser',
        roundNumber: 1,
        status: 'pending',
      })

      useTournamentStore.setState({
        heats: [wbHeat1, wbHeat2, lbHeat],
        isQualificationComplete: true,
        currentWBRound: 1,
        currentLBRound: 1,
      })

      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()

      // Jetzt sollte LB empfohlen werden
      expect(recommended?.id).toBe('lb-r1-h1')
      expect(recommended?.bracketType).toBe('loser')
    })
  })

  describe('Quali-Phase', () => {
    it('should recommend quali heat when quali is not complete', () => {
      const qualiHeat: Heat = createHeat({
        id: 'quali-h1',
        bracketType: 'qualification',
        status: 'pending',
      })
      const wbHeat: Heat = createHeat({
        id: 'wb-r1-h1',
        bracketType: 'winner',
        roundNumber: 1,
        status: 'pending',
      })

      useTournamentStore.setState({
        heats: [qualiHeat, wbHeat],
        isQualificationComplete: false,
        currentWBRound: 0,
        currentLBRound: 0,
      })

      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()

      expect(recommended?.id).toBe('quali-h1')
      expect(recommended?.bracketType).toBe('qualification')
    })
  })

  describe('Runden-Übergang', () => {
    it('should recommend WB R2 after WB R1 and LB R1 are both complete', () => {
      const wbR1: Heat = createHeat({
        id: 'wb-r1-h1',
        bracketType: 'winner',
        roundNumber: 1,
        status: 'completed',
      })
      const lbR1: Heat = createHeat({
        id: 'lb-r1-h1',
        bracketType: 'loser',
        roundNumber: 1,
        status: 'completed',
      })
      const wbR2: Heat = createHeat({
        id: 'wb-r2-h1',
        bracketType: 'winner',
        roundNumber: 2,
        status: 'pending',
      })
      const lbR2: Heat = createHeat({
        id: 'lb-r2-h1',
        bracketType: 'loser',
        roundNumber: 2,
        status: 'pending',
      })

      useTournamentStore.setState({
        heats: [wbR1, lbR1, wbR2, lbR2],
        isQualificationComplete: true,
        currentWBRound: 2,
        currentLBRound: 2,
      })

      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()

      // WB R2 vor LB R2
      expect(recommended?.id).toBe('wb-r2-h1')
      expect(recommended?.roundNumber).toBe(2)
    })
  })

  describe('Grand Finale', () => {
    it('should recommend Grand Finale when available', () => {
      const wbFinale: Heat = createHeat({
        id: 'wb-finale',
        bracketType: 'winner',
        isFinale: true,
        status: 'completed',
      })
      const lbFinale: Heat = createHeat({
        id: 'lb-finale',
        bracketType: 'loser',
        isFinale: true,
        status: 'completed',
      })
      const grandFinale: Heat = createHeat({
        id: 'grand-finale',
        bracketType: 'grand_finale',
        isFinale: true,
        status: 'pending',
      })

      useTournamentStore.setState({
        heats: [wbFinale, lbFinale, grandFinale],
        isQualificationComplete: true,
        isWBFinaleComplete: true,
        isLBFinaleComplete: true,
      })

      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()

      expect(recommended?.id).toBe('grand-finale')
      expect(recommended?.bracketType).toBe('grand_finale')
    })
  })

  describe('Edge Cases', () => {
    it('should return null when no heats are pending', () => {
      const wbHeat: Heat = createHeat({
        id: 'wb-r1-h1',
        bracketType: 'winner',
        roundNumber: 1,
        status: 'completed',
      })

      useTournamentStore.setState({
        heats: [wbHeat],
        isQualificationComplete: true,
      })

      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()

      expect(recommended).toBeNull()
    })

    it('should handle heats without roundNumber (dynamic heats)', () => {
      // Dynamic heats haben oft keine roundNumber
      const dynamicWB: Heat = createHeat({
        id: 'wb-heat-dynamic',
        bracketType: 'winner',
        status: 'pending',
        // keine roundNumber!
      })
      const dynamicLB: Heat = createHeat({
        id: 'lb-heat-dynamic',
        bracketType: 'loser',
        status: 'pending',
      })

      useTournamentStore.setState({
        heats: [dynamicLB, dynamicWB],
        isQualificationComplete: true,
      })

      const { getNextRecommendedHeat } = useTournamentStore.getState()
      const recommended = getNextRecommendedHeat()

      // WB sollte trotzdem vor LB kommen
      expect(recommended?.bracketType).toBe('winner')
    })
  })
})
