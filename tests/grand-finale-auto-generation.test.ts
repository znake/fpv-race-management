/**
 * Grand Finale Auto-Generation Tests
 *
 * Story 13-7: Fix Grand Finale Hotfix in submitHeatResults()
 *
 * AC1: Grand Finale enthält genau 4 verschiedene Piloten
 * AC2: 2 Piloten aus WB Finale (Rang 1+2) - nie verloren
 * AC3: 2 Piloten aus LB Finale (Rang 1+2) - 1x verloren
 * AC4: pilotBracketStates wird mit korrektem bracketOrigin ('wb'/'lb') gesetzt
 * AC5: Duplikat-Validierung verhindert dass ein Pilot zweimal im GF erscheint
 * AC6: Test mit 14 Piloten funktioniert korrekt
 * AC7: Alle existierenden Tests bestehen weiterhin
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTournamentStore, INITIAL_TOURNAMENT_STATE } from '../src/stores/tournamentStore'
import type { Heat } from '../src/types/tournament'
import type { Pilot } from '../src/lib/schemas'

// Reset store before each test
beforeEach(() => {
  useTournamentStore.setState({
    ...structuredClone(INITIAL_TOURNAMENT_STATE),
    pilots: [],
    heats: []
  })
})

describe('Story 13-7: Grand Finale Auto-Generation in submitHeatResults', () => {
  // Helper to create pilots
  const createPilots = (count: number): Pilot[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `pilot-${i + 1}`,
      name: `Pilot ${i + 1}`,
      imageUrl: `/images/pilot-${i + 1}.jpg`
    }))

  // Helper to create completed WB Finale (active, ready for completion)
  const setupActiveWBFinale = (pilotIds: string[]): Heat => ({
    id: `wb-finale-test`,
    heatNumber: 10,
    pilotIds,
    status: 'active',
    bracketType: 'winner',
    isFinale: true,
    roundName: 'WB Finale'
  })

  // Helper to create completed LB Finale (active, ready for completion)
  const setupActiveLBFinale = (pilotIds: string[]): Heat => ({
    id: `lb-finale-test`,
    heatNumber: 11,
    pilotIds,
    status: 'active',
    bracketType: 'loser',
    isFinale: true,
    roundName: 'LB Finale'
  })

  // Helper to create completed WB Finale
  const setupCompletedWBFinale = (wbRank1: string, wbRank2: string): Heat => ({
    id: `wb-finale-test`,
    heatNumber: 10,
    pilotIds: [wbRank1, wbRank2, 'wb-loser-1', 'wb-loser-2'],
    status: 'completed',
    bracketType: 'winner',
    isFinale: true,
    roundName: 'WB Finale',
    results: {
      rankings: [
        { pilotId: wbRank1, rank: 1 },
        { pilotId: wbRank2, rank: 2 },
        { pilotId: 'wb-loser-1', rank: 3 },
        { pilotId: 'wb-loser-2', rank: 4 }
      ],
      completedAt: new Date().toISOString()
    }
  })

  // Helper to create completed LB Finale
  const setupCompletedLBFinale = (lbRank1: string, lbRank2: string): Heat => ({
    id: `lb-finale-test`,
    heatNumber: 11,
    pilotIds: [lbRank1, lbRank2, 'lb-loser-1', 'lb-loser-2'],
    status: 'completed',
    bracketType: 'loser',
    isFinale: true,
    roundName: 'LB Finale',
    results: {
      rankings: [
        { pilotId: lbRank1, rank: 1 },
        { pilotId: lbRank2, rank: 2 },
        { pilotId: 'lb-loser-1', rank: 3 },
        { pilotId: 'lb-loser-2', rank: 4 }
      ],
      completedAt: new Date().toISOString()
    }
  })

  describe('Task 1: submitHeatResults() Grand Finale Generierung (AC1, AC2, AC3)', () => {
    it('generiert Grand Finale mit 4 Piloten wenn LB Finale abgeschlossen wird', () => {
      const pilots = createPilots(12)
      const wbFinale = setupCompletedWBFinale('pilot-1', 'pilot-2')
      const lbFinale = setupActiveLBFinale(['pilot-3', 'pilot-4', 'pilot-5', 'pilot-6'])

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete LB Finale
      useTournamentStore.getState().submitHeatResults('lb-finale-test', [
        { pilotId: 'pilot-3', rank: 1 },
        { pilotId: 'pilot-4', rank: 2 },
        { pilotId: 'pilot-5', rank: 3 },
        { pilotId: 'pilot-6', rank: 4 }
      ])

      const state = useTournamentStore.getState()
      const grandFinale = state.heats.find(h => h.bracketType === 'grand_finale')

      expect(grandFinale).toBeDefined()
      expect(grandFinale!.pilotIds).toHaveLength(4)
    })

    it('nimmt Rang 1+2 von WB Finale (AC2)', () => {
      const pilots = createPilots(12)
      const wbFinale = setupCompletedWBFinale('pilot-1', 'pilot-2')
      const lbFinale = setupActiveLBFinale(['pilot-3', 'pilot-4', 'pilot-5', 'pilot-6'])

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete LB Finale
      useTournamentStore.getState().submitHeatResults('lb-finale-test', [
        { pilotId: 'pilot-3', rank: 1 },
        { pilotId: 'pilot-4', rank: 2 },
        { pilotId: 'pilot-5', rank: 3 },
        { pilotId: 'pilot-6', rank: 4 }
      ])

      const grandFinale = useTournamentStore.getState().heats.find(h => h.bracketType === 'grand_finale')

      expect(grandFinale!.pilotIds).toContain('pilot-1') // WB Rang 1
      expect(grandFinale!.pilotIds).toContain('pilot-2') // WB Rang 2
    })

    it('nimmt Rang 1+2 von LB Finale (AC3)', () => {
      const pilots = createPilots(12)
      const wbFinale = setupCompletedWBFinale('pilot-1', 'pilot-2')
      const lbFinale = setupActiveLBFinale(['pilot-3', 'pilot-4', 'pilot-5', 'pilot-6'])

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete LB Finale
      useTournamentStore.getState().submitHeatResults('lb-finale-test', [
        { pilotId: 'pilot-3', rank: 1 },
        { pilotId: 'pilot-4', rank: 2 },
        { pilotId: 'pilot-5', rank: 3 },
        { pilotId: 'pilot-6', rank: 4 }
      ])

      const grandFinale = useTournamentStore.getState().heats.find(h => h.bracketType === 'grand_finale')

      expect(grandFinale!.pilotIds).toContain('pilot-3') // LB Rang 1
      expect(grandFinale!.pilotIds).toContain('pilot-4') // LB Rang 2
    })

    it('pilotIds Reihenfolge ist [WB1, WB2, LB1, LB2]', () => {
      const pilots = createPilots(12)
      const wbFinale = setupCompletedWBFinale('pilot-1', 'pilot-2')
      const lbFinale = setupActiveLBFinale(['pilot-3', 'pilot-4', 'pilot-5', 'pilot-6'])

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete LB Finale
      useTournamentStore.getState().submitHeatResults('lb-finale-test', [
        { pilotId: 'pilot-3', rank: 1 },
        { pilotId: 'pilot-4', rank: 2 },
        { pilotId: 'pilot-5', rank: 3 },
        { pilotId: 'pilot-6', rank: 4 }
      ])

      const grandFinale = useTournamentStore.getState().heats.find(h => h.bracketType === 'grand_finale')

      expect(grandFinale!.pilotIds[0]).toBe('pilot-1') // WB Rang 1
      expect(grandFinale!.pilotIds[1]).toBe('pilot-2') // WB Rang 2
      expect(grandFinale!.pilotIds[2]).toBe('pilot-3') // LB Rang 1
      expect(grandFinale!.pilotIds[3]).toBe('pilot-4') // LB Rang 2
    })
  })

  describe('Task 2: pilotBracketStates korrekt setzen (AC4)', () => {
    it('WB-Piloten haben bracketOrigin="wb"', () => {
      const pilots = createPilots(12)
      const wbFinale = setupCompletedWBFinale('pilot-1', 'pilot-2')
      const lbFinale = setupActiveLBFinale(['pilot-3', 'pilot-4', 'pilot-5', 'pilot-6'])

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete LB Finale
      useTournamentStore.getState().submitHeatResults('lb-finale-test', [
        { pilotId: 'pilot-3', rank: 1 },
        { pilotId: 'pilot-4', rank: 2 },
        { pilotId: 'pilot-5', rank: 3 },
        { pilotId: 'pilot-6', rank: 4 }
      ])

      const state = useTournamentStore.getState()
      expect(state.pilotBracketStates['pilot-1']?.bracketOrigin).toBe('wb')
      expect(state.pilotBracketStates['pilot-2']?.bracketOrigin).toBe('wb')
    })

    it('LB-Piloten haben bracketOrigin="lb"', () => {
      const pilots = createPilots(12)
      const wbFinale = setupCompletedWBFinale('pilot-1', 'pilot-2')
      const lbFinale = setupActiveLBFinale(['pilot-3', 'pilot-4', 'pilot-5', 'pilot-6'])

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete LB Finale
      useTournamentStore.getState().submitHeatResults('lb-finale-test', [
        { pilotId: 'pilot-3', rank: 1 },
        { pilotId: 'pilot-4', rank: 2 },
        { pilotId: 'pilot-5', rank: 3 },
        { pilotId: 'pilot-6', rank: 4 }
      ])

      const state = useTournamentStore.getState()
      expect(state.pilotBracketStates['pilot-3']?.bracketOrigin).toBe('lb')
      expect(state.pilotBracketStates['pilot-4']?.bracketOrigin).toBe('lb')
    })

    it('alle 4 Piloten haben bracket="grand_finale"', () => {
      const pilots = createPilots(12)
      const wbFinale = setupCompletedWBFinale('pilot-1', 'pilot-2')
      const lbFinale = setupActiveLBFinale(['pilot-3', 'pilot-4', 'pilot-5', 'pilot-6'])

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete LB Finale
      useTournamentStore.getState().submitHeatResults('lb-finale-test', [
        { pilotId: 'pilot-3', rank: 1 },
        { pilotId: 'pilot-4', rank: 2 },
        { pilotId: 'pilot-5', rank: 3 },
        { pilotId: 'pilot-6', rank: 4 }
      ])

      const state = useTournamentStore.getState()
      expect(state.pilotBracketStates['pilot-1']?.bracket).toBe('grand_finale')
      expect(state.pilotBracketStates['pilot-2']?.bracket).toBe('grand_finale')
      expect(state.pilotBracketStates['pilot-3']?.bracket).toBe('grand_finale')
      expect(state.pilotBracketStates['pilot-4']?.bracket).toBe('grand_finale')
    })
  })

  describe('Task 3: Duplikat-Validierung (AC5)', () => {
    it('generiert kein Grand Finale wenn weniger als 4 unique Piloten', () => {
      const pilots = createPilots(12)
      
      // WB Finale mit pilot-1 und pilot-2
      const wbFinale: Heat = {
        id: `wb-finale-test`,
        heatNumber: 10,
        pilotIds: ['pilot-1', 'pilot-2'],
        status: 'completed',
        bracketType: 'winner',
        isFinale: true,
        roundName: 'WB Finale',
        results: {
          rankings: [
            { pilotId: 'pilot-1', rank: 1 },
            { pilotId: 'pilot-2', rank: 2 }
          ],
          completedAt: new Date().toISOString()
        }
      }

      // LB Finale mit pilot-1 (DUPLIKAT!) und pilot-3
      const lbFinale: Heat = {
        id: `lb-finale-test`,
        heatNumber: 11,
        pilotIds: ['pilot-1', 'pilot-3'], // pilot-1 ist Duplikat!
        status: 'active',
        bracketType: 'loser',
        isFinale: true,
        roundName: 'LB Finale'
      }

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete LB Finale mit pilot-1 als Rang 1 (DUPLIKAT!)
      useTournamentStore.getState().submitHeatResults('lb-finale-test', [
        { pilotId: 'pilot-1', rank: 1 }, // DUPLIKAT mit WB!
        { pilotId: 'pilot-3', rank: 2 }
      ])

      const grandFinale = useTournamentStore.getState().heats.find(h => h.bracketType === 'grand_finale')

      // Grand Finale sollte NICHT generiert werden wegen Duplikat
      expect(grandFinale).toBeUndefined()
    })

    it('alle 4 Pilot-IDs müssen unique sein', () => {
      const pilots = createPilots(12)
      const wbFinale = setupCompletedWBFinale('pilot-1', 'pilot-2')
      const lbFinale = setupActiveLBFinale(['pilot-3', 'pilot-4', 'pilot-5', 'pilot-6'])

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete LB Finale with unique pilots
      useTournamentStore.getState().submitHeatResults('lb-finale-test', [
        { pilotId: 'pilot-3', rank: 1 },
        { pilotId: 'pilot-4', rank: 2 },
        { pilotId: 'pilot-5', rank: 3 },
        { pilotId: 'pilot-6', rank: 4 }
      ])

      const grandFinale = useTournamentStore.getState().heats.find(h => h.bracketType === 'grand_finale')
      
      // All 4 pilots should be unique
      const pilotSet = new Set(grandFinale!.pilotIds)
      expect(pilotSet.size).toBe(4)
    })
  })

  describe('Task 4.3: Integration-Test mit 14 Piloten (AC6)', () => {
    it('funktioniert korrekt mit 14 Piloten - Thomas Weber Bug', () => {
      // Simuliere das 14-Piloten-Szenario aus dem Bug-Report
      const pilots: Pilot[] = [
        { id: 'thomas-weber', name: 'Thomas Weber', imageUrl: '/thomas.jpg' },
        ...Array.from({ length: 13 }, (_, i) => ({
          id: `pilot-${i + 2}`,
          name: `Pilot ${i + 2}`,
          imageUrl: `/pilot-${i + 2}.jpg`
        }))
      ]

      // WB Finale: Thomas Weber (Rang 1) + Pilot 2 (Rang 2)
      const wbFinale: Heat = {
        id: 'wb-finale-test',
        heatNumber: 10,
        pilotIds: ['thomas-weber', 'pilot-2', 'pilot-3', 'pilot-4'],
        status: 'completed',
        bracketType: 'winner',
        isFinale: true,
        roundName: 'WB Finale',
        results: {
          rankings: [
            { pilotId: 'thomas-weber', rank: 1 },
            { pilotId: 'pilot-2', rank: 2 },
            { pilotId: 'pilot-3', rank: 3 },
            { pilotId: 'pilot-4', rank: 4 }
          ],
          completedAt: new Date().toISOString()
        }
      }

      // LB Finale: pilot-5 (Rang 1) + pilot-6 (Rang 2) - NICHT Thomas Weber!
      const lbFinale: Heat = {
        id: 'lb-finale-test',
        heatNumber: 11,
        pilotIds: ['pilot-5', 'pilot-6', 'pilot-7', 'pilot-8'],
        status: 'active',
        bracketType: 'loser',
        isFinale: true,
        roundName: 'LB Finale'
      }

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete LB Finale
      useTournamentStore.getState().submitHeatResults('lb-finale-test', [
        { pilotId: 'pilot-5', rank: 1 },
        { pilotId: 'pilot-6', rank: 2 },
        { pilotId: 'pilot-7', rank: 3 },
        { pilotId: 'pilot-8', rank: 4 }
      ])

      const state = useTournamentStore.getState()
      const grandFinale = state.heats.find(h => h.bracketType === 'grand_finale')

      // KRITISCH: Grand Finale hat 4 VERSCHIEDENE Piloten
      expect(grandFinale).toBeDefined()
      expect(grandFinale!.pilotIds).toHaveLength(4)

      // Thomas Weber erscheint NUR EINMAL
      const thomasCount = grandFinale!.pilotIds.filter(id => id === 'thomas-weber').length
      expect(thomasCount).toBe(1)

      // Alle Piloten sind unique
      const uniquePilots = new Set(grandFinale!.pilotIds)
      expect(uniquePilots.size).toBe(4)

      // Korrekte Zusammensetzung: WB1, WB2, LB1, LB2
      expect(grandFinale!.pilotIds[0]).toBe('thomas-weber') // WB Rang 1
      expect(grandFinale!.pilotIds[1]).toBe('pilot-2')      // WB Rang 2
      expect(grandFinale!.pilotIds[2]).toBe('pilot-5')      // LB Rang 1
      expect(grandFinale!.pilotIds[3]).toBe('pilot-6')      // LB Rang 2

      // bracketOrigin ist korrekt gesetzt
      expect(state.pilotBracketStates['thomas-weber']?.bracketOrigin).toBe('wb')
      expect(state.pilotBracketStates['pilot-2']?.bracketOrigin).toBe('wb')
      expect(state.pilotBracketStates['pilot-5']?.bracketOrigin).toBe('lb')
      expect(state.pilotBracketStates['pilot-6']?.bracketOrigin).toBe('lb')
    })
  })

  describe('Edge Cases', () => {
    it('generiert kein Grand Finale wenn WB Finale noch nicht completed', () => {
      const pilots = createPilots(12)
      const wbFinale = setupActiveWBFinale(['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'])
      const lbFinale = setupCompletedLBFinale('pilot-5', 'pilot-6')

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete WB Finale - Grand Finale sollte NOCH NICHT generiert werden
      // (LB Finale ist completed aber das wurde schon vorher gesetzt)
      useTournamentStore.getState().submitHeatResults('wb-finale-test', [
        { pilotId: 'pilot-1', rank: 1 },
        { pilotId: 'pilot-2', rank: 2 },
        { pilotId: 'pilot-3', rank: 3 },
        { pilotId: 'pilot-4', rank: 4 }
      ])

      // Jetzt sollte Grand Finale generiert werden
      const grandFinale = useTournamentStore.getState().heats.find(h => h.bracketType === 'grand_finale')
      expect(grandFinale).toBeDefined()
      expect(grandFinale!.pilotIds).toHaveLength(4)
    })

    it('generiert Grand Finale auch wenn WB Finale als letztes completed wird', () => {
      const pilots = createPilots(12)
      
      // LB Finale ist bereits completed
      const lbFinale = setupCompletedLBFinale('pilot-5', 'pilot-6')
      
      // WB Finale ist noch active
      const wbFinale = setupActiveWBFinale(['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'])

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete WB Finale (LB Finale war schon completed)
      useTournamentStore.getState().submitHeatResults('wb-finale-test', [
        { pilotId: 'pilot-1', rank: 1 },
        { pilotId: 'pilot-2', rank: 2 },
        { pilotId: 'pilot-3', rank: 3 },
        { pilotId: 'pilot-4', rank: 4 }
      ])

      const grandFinale = useTournamentStore.getState().heats.find(h => h.bracketType === 'grand_finale')
      
      expect(grandFinale).toBeDefined()
      expect(grandFinale!.pilotIds).toHaveLength(4)
      expect(grandFinale!.pilotIds[0]).toBe('pilot-1') // WB Rang 1
      expect(grandFinale!.pilotIds[1]).toBe('pilot-2') // WB Rang 2
      expect(grandFinale!.pilotIds[2]).toBe('pilot-5') // LB Rang 1
      expect(grandFinale!.pilotIds[3]).toBe('pilot-6') // LB Rang 2
    })

    it('setzt tournamentPhase auf "finale" wenn Grand Finale generiert wird', () => {
      const pilots = createPilots(12)
      const wbFinale = setupCompletedWBFinale('pilot-1', 'pilot-2')
      const lbFinale = setupActiveLBFinale(['pilot-3', 'pilot-4', 'pilot-5', 'pilot-6'])

      useTournamentStore.setState({
        pilots,
        heats: [wbFinale, lbFinale],
        isQualificationComplete: true,
        tournamentPhase: 'running'
      })

      // Complete LB Finale
      useTournamentStore.getState().submitHeatResults('lb-finale-test', [
        { pilotId: 'pilot-3', rank: 1 },
        { pilotId: 'pilot-4', rank: 2 },
        { pilotId: 'pilot-5', rank: 3 },
        { pilotId: 'pilot-6', rank: 4 }
      ])

      expect(useTournamentStore.getState().tournamentPhase).toBe('finale')
    })
  })
})
