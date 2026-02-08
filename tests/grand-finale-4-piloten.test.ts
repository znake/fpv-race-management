/**
 * Grand Finale mit 4 Piloten Tests
 *
 * Story 13-3: Grand Finale enthält 4 Piloten (2 WB + 2 LB)
 *
 * AC1: Grand Finale enthält 2 WB-Finale-Piloten (Platz 1+2 - nie verloren)
 * AC2: Grand Finale enthält 2 LB-Finale-Piloten (Platz 1+2 - 1x verloren)
 * AC3: Alle 4 Piloten fliegen zusammen in einem Heat
 * AC4: Ergebnis bestimmt Platz 1-4 des Turniers (direkt, ohne Rematch)
 * AC5: WB/LB Tags zeigen Herkunft jedes Piloten im Grand Finale UI
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTournamentStore, INITIAL_TOURNAMENT_STATE } from '@/stores/tournamentStore'
import type { Heat, PilotBracketState } from '@/types/tournament'
import type { Pilot } from '@/lib/schemas'

// Reset store before each test
beforeEach(() => {
  useTournamentStore.setState({
    ...structuredClone(INITIAL_TOURNAMENT_STATE),
    pilots: [],
    heats: []
  })
})

describe('Story 13-3: Grand Finale mit 4 Piloten', () => {
  // Helper to create pilots
  const createPilots = (count: number): Pilot[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `pilot-${i + 1}`,
      name: `Pilot ${i + 1}`,
      imageUrl: `/images/pilot-${i + 1}.jpg`
    }))

  // Helper to create completed WB Finale with 4 pilots
  const setupWBFinale = (wbRank1: string, wbRank2: string) => {
    const wbFinale: Heat = {
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
    }
    return wbFinale
  }

  // Helper to create completed LB Finale with 4 pilots
  const setupLBFinale = (lbRank1: string, lbRank2: string) => {
    const lbFinale: Heat = {
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
    }
    return lbFinale
  }

  describe('Task 1: generateGrandFinale() für 4 Piloten', () => {
    describe('Task 1.1 + 1.2: WB und LB Finale Piloten sammeln', () => {
      it('sammelt WB-Finale-Gewinner Platz 1+2', () => {
        const pilots = createPilots(8)
        const wbFinale = setupWBFinale('pilot-1', 'pilot-2')
        const lbFinale = setupLBFinale('pilot-3', 'pilot-4')

        useTournamentStore.setState({
          pilots,
          heats: [wbFinale, lbFinale],
          isQualificationComplete: true
        })

        const grandFinale = useTournamentStore.getState().generateGrandFinale()

        expect(grandFinale).not.toBeNull()
        expect(grandFinale!.pilotIds).toContain('pilot-1') // WB Rang 1
        expect(grandFinale!.pilotIds).toContain('pilot-2') // WB Rang 2
      })

      it('sammelt LB-Finale-Gewinner Platz 1+2', () => {
        const pilots = createPilots(8)
        const wbFinale = setupWBFinale('pilot-1', 'pilot-2')
        const lbFinale = setupLBFinale('pilot-3', 'pilot-4')

        useTournamentStore.setState({
          pilots,
          heats: [wbFinale, lbFinale],
          isQualificationComplete: true
        })

        const grandFinale = useTournamentStore.getState().generateGrandFinale()

        expect(grandFinale).not.toBeNull()
        expect(grandFinale!.pilotIds).toContain('pilot-3') // LB Rang 1
        expect(grandFinale!.pilotIds).toContain('pilot-4') // LB Rang 2
      })
    })

    describe('Task 1.3: AC3 - Heat mit 4 Piloten erstellen', () => {
      it('Grand Finale hat genau 4 Piloten', () => {
        const pilots = createPilots(8)
        const wbFinale = setupWBFinale('pilot-1', 'pilot-2')
        const lbFinale = setupLBFinale('pilot-3', 'pilot-4')

        useTournamentStore.setState({
          pilots,
          heats: [wbFinale, lbFinale],
          isQualificationComplete: true
        })

        const grandFinale = useTournamentStore.getState().generateGrandFinale()

        expect(grandFinale).not.toBeNull()
        expect(grandFinale!.pilotIds).toHaveLength(4)
      })
    })

    describe('Task 1.4: pilotIds Reihenfolge [WB1, WB2, LB1, LB2]', () => {
      it('Piloten sind in korrekter Reihenfolge: WB1, WB2, LB1, LB2', () => {
        const pilots = createPilots(8)
        const wbFinale = setupWBFinale('pilot-1', 'pilot-2')
        const lbFinale = setupLBFinale('pilot-3', 'pilot-4')

        useTournamentStore.setState({
          pilots,
          heats: [wbFinale, lbFinale],
          isQualificationComplete: true
        })

        const grandFinale = useTournamentStore.getState().generateGrandFinale()

        expect(grandFinale).not.toBeNull()
        expect(grandFinale!.pilotIds[0]).toBe('pilot-1') // WB Rang 1
        expect(grandFinale!.pilotIds[1]).toBe('pilot-2') // WB Rang 2
        expect(grandFinale!.pilotIds[2]).toBe('pilot-3') // LB Rang 1
        expect(grandFinale!.pilotIds[3]).toBe('pilot-4') // LB Rang 2
      })
    })

    describe('Edge Cases', () => {
      it('gibt null zurück wenn WB Finale nicht existiert', () => {
        const pilots = createPilots(4)
        const lbFinale = setupLBFinale('pilot-3', 'pilot-4')

        useTournamentStore.setState({
          pilots,
          heats: [lbFinale],
          isQualificationComplete: true
        })

        const grandFinale = useTournamentStore.getState().generateGrandFinale()
        expect(grandFinale).toBeNull()
      })

      it('gibt null zurück wenn LB Finale nicht existiert', () => {
        const pilots = createPilots(4)
        const wbFinale = setupWBFinale('pilot-1', 'pilot-2')

        useTournamentStore.setState({
          pilots,
          heats: [wbFinale],
          isQualificationComplete: true
        })

        const grandFinale = useTournamentStore.getState().generateGrandFinale()
        expect(grandFinale).toBeNull()
      })

      it('gibt null zurück wenn Grand Finale bereits existiert', () => {
        const pilots = createPilots(8)
        const wbFinale = setupWBFinale('pilot-1', 'pilot-2')
        const lbFinale = setupLBFinale('pilot-3', 'pilot-4')
        const existingGrandFinale: Heat = {
          id: 'grand-finale-existing',
          heatNumber: 99,
          pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
          status: 'pending',
          bracketType: 'grand_finale',
          isFinale: true
        }

        useTournamentStore.setState({
          pilots,
          heats: [wbFinale, lbFinale, existingGrandFinale],
          isQualificationComplete: true
        })

        const grandFinale = useTournamentStore.getState().generateGrandFinale()
        expect(grandFinale).toBeNull()
      })
    })
  })

  describe('Task 2: Grand Finale Results für 4 Piloten', () => {
    describe('Task 2.1 + 2.2: AC4 - submitHeatResults akzeptiert 4 Rankings', () => {
      it('submitHeatResults akzeptiert 4 Rankings für Grand Finale', () => {
        const pilots = createPilots(8)
        const grandFinaleHeat: Heat = {
          id: 'grand-finale-test',
          heatNumber: 99,
          pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
          status: 'active',
          bracketType: 'grand_finale',
          isFinale: true
        }

        useTournamentStore.setState({
          pilots,
          heats: [grandFinaleHeat],
          tournamentPhase: 'finale'
        })

        // Submit 4 rankings
        useTournamentStore.getState().submitHeatResults('grand-finale-test', [
          { pilotId: 'pilot-1', rank: 1 },
          { pilotId: 'pilot-3', rank: 2 },
          { pilotId: 'pilot-2', rank: 3 },
          { pilotId: 'pilot-4', rank: 4 }
        ])

        const updatedHeat = useTournamentStore.getState().heats.find(h => h.id === 'grand-finale-test')
        expect(updatedHeat?.results?.rankings).toHaveLength(4)
        expect(updatedHeat?.status).toBe('completed')
      })

      it('Platzierungen 1-4 werden direkt aus Rankings übernommen', () => {
        const pilots = createPilots(8)
        const grandFinaleHeat: Heat = {
          id: 'grand-finale-test',
          heatNumber: 99,
          pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
          status: 'active',
          bracketType: 'grand_finale',
          isFinale: true
        }

        useTournamentStore.setState({
          pilots,
          heats: [grandFinaleHeat],
          tournamentPhase: 'finale'
        })

        useTournamentStore.getState().submitHeatResults('grand-finale-test', [
          { pilotId: 'pilot-3', rank: 1 }, // Champion
          { pilotId: 'pilot-1', rank: 2 }, // 2nd
          { pilotId: 'pilot-4', rank: 3 }, // 3rd
          { pilotId: 'pilot-2', rank: 4 }  // 4th
        ])

        const updatedHeat = useTournamentStore.getState().heats.find(h => h.id === 'grand-finale-test')
        expect(updatedHeat?.results?.rankings.find(r => r.rank === 1)?.pilotId).toBe('pilot-3')
        expect(updatedHeat?.results?.rankings.find(r => r.rank === 2)?.pilotId).toBe('pilot-1')
        expect(updatedHeat?.results?.rankings.find(r => r.rank === 3)?.pilotId).toBe('pilot-4')
        expect(updatedHeat?.results?.rankings.find(r => r.rank === 4)?.pilotId).toBe('pilot-2')
      })
    })

    describe('Task 2.3: Tournament wird auf completed gesetzt', () => {
      it('tournamentPhase wird auf completed gesetzt nach Grand Finale', () => {
        const pilots = createPilots(8)
        const grandFinaleHeat: Heat = {
          id: 'grand-finale-test',
          heatNumber: 99,
          pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
          status: 'active',
          bracketType: 'grand_finale',
          isFinale: true
        }

        useTournamentStore.setState({
          pilots,
          heats: [grandFinaleHeat],
          tournamentPhase: 'finale'
        })

        useTournamentStore.getState().submitHeatResults('grand-finale-test', [
          { pilotId: 'pilot-1', rank: 1 },
          { pilotId: 'pilot-2', rank: 2 },
          { pilotId: 'pilot-3', rank: 3 },
          { pilotId: 'pilot-4', rank: 4 }
        ])

        expect(useTournamentStore.getState().tournamentPhase).toBe('completed')
      })
    })
  })

  describe('Task 3: getTop4Pilots() anpassen', () => {
    describe('Task 3.1 + 3.2: AC4 - Liest Platz 1-4 direkt aus Grand Finale Rankings', () => {
      it('gibt alle 4 Platzierungen aus Grand Finale zurück', () => {
        const pilots: Pilot[] = [
          { id: 'p1', name: 'Champion', imageUrl: '/p1.jpg' },
          { id: 'p2', name: 'Second', imageUrl: '/p2.jpg' },
          { id: 'p3', name: 'Third', imageUrl: '/p3.jpg' },
          { id: 'p4', name: 'Fourth', imageUrl: '/p4.jpg' }
        ]
        
        const grandFinaleHeat: Heat = {
          id: 'grand-finale-test',
          heatNumber: 99,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'completed',
          bracketType: 'grand_finale',
          isFinale: true,
          results: {
            rankings: [
              { pilotId: 'p1', rank: 1 },
              { pilotId: 'p2', rank: 2 },
              { pilotId: 'p3', rank: 3 },
              { pilotId: 'p4', rank: 4 }
            ],
            completedAt: new Date().toISOString()
          }
        }

        useTournamentStore.setState({
          pilots,
          heats: [grandFinaleHeat],
          tournamentPhase: 'completed'
        })

        const top4 = useTournamentStore.getState().getTop4Pilots()
        
        expect(top4).not.toBeNull()
        expect(top4?.place1?.name).toBe('Champion')
        expect(top4?.place2?.name).toBe('Second')
        expect(top4?.place3?.name).toBe('Third')
        expect(top4?.place4?.name).toBe('Fourth')
      })

      it('keine komplizierte Logik mehr - nur Grand Finale Rankings', () => {
        const pilots: Pilot[] = [
          { id: 'p1', name: 'GF Winner', imageUrl: '/p1.jpg' },
          { id: 'p2', name: 'GF Second', imageUrl: '/p2.jpg' },
          { id: 'p3', name: 'GF Third', imageUrl: '/p3.jpg' },
          { id: 'p4', name: 'GF Fourth', imageUrl: '/p4.jpg' },
          { id: 'p5', name: 'WB Finale Loser', imageUrl: '/p5.jpg' }, // Not in GF
          { id: 'p6', name: 'LB Finale Loser', imageUrl: '/p6.jpg' }  // Not in GF
        ]
        
        // WB Finale - p5 ist Rang 2 (würde früher Platz 3 sein)
        const wbFinale: Heat = {
          id: 'wb-finale',
          heatNumber: 10,
          pilotIds: ['p1', 'p5'],
          status: 'completed',
          bracketType: 'winner',
          isFinale: true,
          results: {
            rankings: [
              { pilotId: 'p1', rank: 1 },
              { pilotId: 'p5', rank: 2 }
            ],
            completedAt: new Date().toISOString()
          }
        }
        
        // LB Finale - p6 ist Rang 2 (würde früher Platz 4 sein)
        const lbFinale: Heat = {
          id: 'lb-finale',
          heatNumber: 11,
          pilotIds: ['p2', 'p6'],
          status: 'completed',
          bracketType: 'loser',
          isFinale: true,
          results: {
            rankings: [
              { pilotId: 'p2', rank: 1 },
              { pilotId: 'p6', rank: 2 }
            ],
            completedAt: new Date().toISOString()
          }
        }

        // Grand Finale mit 4 Piloten (NEUER STYLE)
        const grandFinaleHeat: Heat = {
          id: 'grand-finale-test',
          heatNumber: 99,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'completed',
          bracketType: 'grand_finale',
          isFinale: true,
          results: {
            rankings: [
              { pilotId: 'p1', rank: 1 },
              { pilotId: 'p2', rank: 2 },
              { pilotId: 'p3', rank: 3 },
              { pilotId: 'p4', rank: 4 }
            ],
            completedAt: new Date().toISOString()
          }
        }

        useTournamentStore.setState({
          pilots,
          heats: [wbFinale, lbFinale, grandFinaleHeat],
          tournamentPhase: 'completed'
        })

        const top4 = useTournamentStore.getState().getTop4Pilots()
        
        // Alle 4 Plätze kommen NUR aus Grand Finale
        expect(top4?.place1?.name).toBe('GF Winner')
        expect(top4?.place2?.name).toBe('GF Second')
        expect(top4?.place3?.name).toBe('GF Third')
        expect(top4?.place4?.name).toBe('GF Fourth')
        
        // p5 und p6 sind NICHT in den Top 4 (obwohl sie WB/LB Finale Loser waren)
        expect(top4?.place3?.name).not.toBe('WB Finale Loser')
        expect(top4?.place4?.name).not.toBe('LB Finale Loser')
      })
    })
  })

  describe('Task 4: pilotBracketStates mit bracketOrigin erweitern', () => {
    describe('Task 4.1 + 4.2: AC5 - bracketOrigin Feld', () => {
      it('WB-Piloten haben bracketOrigin="wb"', () => {
        const pilots = createPilots(8)
        const wbFinale = setupWBFinale('pilot-1', 'pilot-2')
        const lbFinale = setupLBFinale('pilot-3', 'pilot-4')

        useTournamentStore.setState({
          pilots,
          heats: [wbFinale, lbFinale],
          isQualificationComplete: true
        })

        useTournamentStore.getState().generateGrandFinale()
        
        const state = useTournamentStore.getState()
        expect(state.pilotBracketStates['pilot-1']?.bracketOrigin).toBe('wb')
        expect(state.pilotBracketStates['pilot-2']?.bracketOrigin).toBe('wb')
      })

      it('LB-Piloten haben bracketOrigin="lb"', () => {
        const pilots = createPilots(8)
        const wbFinale = setupWBFinale('pilot-1', 'pilot-2')
        const lbFinale = setupLBFinale('pilot-3', 'pilot-4')

        useTournamentStore.setState({
          pilots,
          heats: [wbFinale, lbFinale],
          isQualificationComplete: true
        })

        useTournamentStore.getState().generateGrandFinale()
        
        const state = useTournamentStore.getState()
        expect(state.pilotBracketStates['pilot-3']?.bracketOrigin).toBe('lb')
        expect(state.pilotBracketStates['pilot-4']?.bracketOrigin).toBe('lb')
      })
    })
  })
})
