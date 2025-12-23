/**
 * Tests for LB Finale & Grand Finale (Story 9-3)
 *
 * AC1: LB Finale (3-4 Piloten) - alle Pool-Piloten im Finale, Platz 1 → Grand Finale
 * AC2: Duell-Heat (2 Piloten) - Gewinner geht ins Grand Finale
 * AC3: Grand Finale - 2 Piloten: WB-Winner + LB-Winner
 * AC4: Edge Case - 1 Pilot im Pool → Wildcard direkt ins Grand Finale
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTournamentStore } from '../src/stores/tournamentStore'

describe('Story 9-3: LB Finale & Grand Finale', () => {
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

  describe('Task 1: isWBFinaleComplete() - Helper', () => {
    it('should return false when bracket structure is null', () => {
      const { isWBFinaleComplete } = useTournamentStore.getState()
      expect(isWBFinaleComplete()).toBe(false)
    })

    it('should return false when WB finale heat is pending', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            id: 'wb-finale',
            roundNumber: 3,
            roundName: 'WB Finale',
            heats: [{
              id: 'wb-finale-heat',
              heatNumber: 10,
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'pending',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [{
          id: 'wb-finale-heat',
          heatNumber: 10,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'pending',
        }],
        fullBracketStructure: bracketStructure as any
      })

      const { isWBFinaleComplete } = useTournamentStore.getState()
      expect(isWBFinaleComplete()).toBe(false)
    })

    it('should return true when WB finale heat is completed', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            id: 'wb-finale',
            roundNumber: 3,
            roundName: 'WB Finale',
            heats: [{
              id: 'wb-finale-heat',
              heatNumber: 10,
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: {
          id: 'grand-finale',
          heatNumber: 11,
          pilotIds: [], // Will be filled
          status: 'pending',
          roundNumber: 99,
          bracketType: 'finale',
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }
      }

      useTournamentStore.setState({
        heats: [{
          id: 'wb-finale-heat',
          heatNumber: 10,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'completed',
          results: {
            rankings: [
              { pilotId: 'p1', rank: 1 },
              { pilotId: 'p2', rank: 2 },
              { pilotId: 'p3', rank: 3 },
              { pilotId: 'p4', rank: 4 },
            ],
            completedAt: new Date().toISOString()
          }
        }],
        fullBracketStructure: bracketStructure as any
      })

      const { isWBFinaleComplete } = useTournamentStore.getState()
      expect(isWBFinaleComplete()).toBe(true)
    })

    it('should return false when WB has multiple rounds and finale is not yet completed', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [
            {
              id: 'wb-round-1',
              roundNumber: 2,
              heats: [{
                id: 'wb-heat-1',
                pilotIds: ['p1', 'p2', 'p3', 'p4'],
                status: 'completed',
                roundNumber: 2,
                bracketType: 'winner',
                sourceHeats: [],
                position: { x: 0, y: 0 }
              }]
            },
            {
              id: 'wb-finale',
              roundNumber: 3,
              heats: [{
                id: 'wb-finale-heat',
                pilotIds: ['p5', 'p6', 'p7', 'p8'],
                status: 'pending',
                roundNumber: 3,
                bracketType: 'winner',
                sourceHeats: [],
                position: { x: 0, y: 0 }
              }]
            }
          ]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [
          { id: 'wb-heat-1', heatNumber: 5, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' },
          { id: 'wb-finale-heat', heatNumber: 6, pilotIds: ['p5', 'p6', 'p7', 'p8'], status: 'pending' }
        ],
        fullBracketStructure: bracketStructure as any
      })

      const { isWBFinaleComplete } = useTournamentStore.getState()
      expect(isWBFinaleComplete()).toBe(false)
    })
  })

  describe('Task 2: checkForLBFinale()', () => {
    it('should return false when WB finale is not complete', () => {
      useTournamentStore.setState({
        loserPool: ['p1', 'p2', 'p3', 'p4'],
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: {
            rounds: [{
              heats: [{
                id: 'wb-finale-heat',
                pilotIds: ['p1', 'p2', 'p3', 'p4'],
                status: 'pending',
                roundNumber: 3,
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

      const { checkForLBFinale } = useTournamentStore.getState()
      expect(checkForLBFinale()).toBe(false)
    })

    it('should return false when pool is empty', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [{ id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }],
        loserPool: [],
        fullBracketStructure: bracketStructure as any
      })

      const { checkForLBFinale } = useTournamentStore.getState()
      expect(checkForLBFinale()).toBe(false)
    })

    it('should return true when WB complete and pool has 3-4 pilots', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [{ id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }],
        loserPool: ['p5', 'p6', 'p7'],
        fullBracketStructure: bracketStructure as any
      })

      const { checkForLBFinale } = useTournamentStore.getState()
      expect(checkForLBFinale()).toBe(true)
    })

    it('should return true when WB complete and pool has 2 pilots (AC2)', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [{ id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }],
        loserPool: ['p5', 'p6'],
        fullBracketStructure: bracketStructure as any
      })

      const { checkForLBFinale } = useTournamentStore.getState()
      expect(checkForLBFinale()).toBe(true)
    })

    it('should return true when WB complete and pool has 1 pilot (AC4)', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [{ id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }],
        loserPool: ['p5'],
        fullBracketStructure: bracketStructure as any
      })

      const { checkForLBFinale } = useTournamentStore.getState()
      expect(checkForLBFinale()).toBe(true)
    })

    it('should return false when an active LB finale heat exists', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [
          { id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' },
          { id: 'lb-finale', heatNumber: 11, pilotIds: ['p5', 'p6'], status: 'pending', bracketType: 'loser', isFinale: true }
        ],
        loserPool: ['p5', 'p6'],
        fullBracketStructure: bracketStructure as any
      })

      const { checkForLBFinale } = useTournamentStore.getState()
      expect(checkForLBFinale()).toBe(false)
    })
  })

  describe('Task 3-4: generateLBFinale() - AC1, AC2', () => {
    it('should generate LB Finale with 3 pilots from pool (AC1)', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [{ id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }],
        loserPool: ['p5', 'p6', 'p7'],
        fullBracketStructure: bracketStructure as any
      })

      const { generateLBFinale } = useTournamentStore.getState()
      const lbFinale = generateLBFinale()

      expect(lbFinale).toBeDefined()
      expect(lbFinale?.pilotIds).toEqual(['p5', 'p6', 'p7'])
      expect(lbFinale?.bracketType).toBe('loser')
      expect(lbFinale?.isFinale).toBe(true)
      expect(lbFinale?.roundName).toBe('LB Finale')
      expect(lbFinale?.status).toBe('pending')
    })

    it('should generate LB Finale with 4 pilots from pool (AC1)', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [{ id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }],
        loserPool: ['p5', 'p6', 'p7', 'p8'],
        fullBracketStructure: bracketStructure as any
      })

      const { generateLBFinale } = useTournamentStore.getState()
      const lbFinale = generateLBFinale()

      expect(lbFinale).toBeDefined()
      expect(lbFinale?.pilotIds).toEqual(['p5', 'p6', 'p7', 'p8'])
      expect(lbFinale?.bracketType).toBe('loser')
      expect(lbFinale?.isFinale).toBe(true)
      expect(lbFinale?.roundName).toBe('LB Finale')
    })

    it('should generate Duell-Heat with 2 pilots (AC2)', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [{ id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }],
        loserPool: ['p5', 'p6'],
        fullBracketStructure: bracketStructure as any
      })

      const { generateLBFinale } = useTournamentStore.getState()
      const lbFinale = generateLBFinale()

      expect(lbFinale).toBeDefined()
      expect(lbFinale?.pilotIds).toEqual(['p5', 'p6'])
      expect(lbFinale?.bracketType).toBe('loser')
      expect(lbFinale?.isFinale).toBe(true)
      expect(lbFinale?.roundName).toBe('LB Finale')
    })

    it('should remove pilots from pool when generating LB Finale', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [{ id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }],
        loserPool: ['p5', 'p6', 'p7'],
        fullBracketStructure: bracketStructure as any
      })

      const { generateLBFinale } = useTournamentStore.getState()
      generateLBFinale()

      const state = useTournamentStore.getState()
      expect(state.loserPool).toEqual([])
    })

    it('should add LB Finale to heats array', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [{ id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }],
        loserPool: ['p5', 'p6', 'p7'],
        fullBracketStructure: bracketStructure as any
      })

      const { generateLBFinale } = useTournamentStore.getState()
      const lbFinale = generateLBFinale()

      const state = useTournamentStore.getState()
      expect(state.heats).toContainEqual(expect.objectContaining({
        id: lbFinale?.id,
        bracketType: 'loser',
        isFinale: true
      }))
    })

    it('should return null when checkForLBFinale is false', () => {
      useTournamentStore.setState({
        loserPool: [],
        fullBracketStructure: null
      })

      const { generateLBFinale } = useTournamentStore.getState()
      const result = generateLBFinale()

      expect(result).toBeNull()
    })
  })

  describe('Task 5: Wildcard Logic - AC4', () => {
    it('should generate 1-pilot "LB Finale" (Wildcard) for 1 pilot in pool', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      }

      useTournamentStore.setState({
        heats: [{ id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }],
        loserPool: ['p5'],
        fullBracketStructure: bracketStructure as any
      })

      const { generateLBFinale } = useTournamentStore.getState()
      const lbFinale = generateLBFinale()

      expect(lbFinale).toBeDefined()
      expect(lbFinale?.pilotIds).toEqual(['p5'])
      expect(lbFinale?.bracketType).toBe('loser')
      expect(lbFinale?.isFinale).toBe(true)
    })
  })

  describe('Task 6: generateGrandFinale() - AC3', () => {
    it('should generate Grand Finale with 2 pilots: WB Winner + LB Winner', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: {
          id: 'grand-finale-placeholder',
          heatNumber: 11,
          pilotIds: ['p1', 'p5'], // WB Winner (p1) + LB Winner (p5)
          status: 'pending',
          roundNumber: 99,
          bracketType: 'finale',
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }
      }

      useTournamentStore.setState({
        heats: [
          { id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }
        ],
        fullBracketStructure: bracketStructure as any
      })

      const { generateGrandFinale } = useTournamentStore.getState()
      const grandFinale = generateGrandFinale()

      expect(grandFinale).toBeDefined()
      expect(grandFinale?.pilotIds).toEqual(['p1', 'p5'])
      expect(grandFinale?.bracketType).toBe('grand_finale')
      expect(grandFinale?.isFinale).toBe(true)
      expect(grandFinale?.roundName).toBe('Grand Finale')
      expect(grandFinale?.status).toBe('active')
    })

    it('should set tournament phase to finale when generating Grand Finale', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: {
          id: 'grand-finale-placeholder',
          heatNumber: 11,
          pilotIds: ['p1', 'p5'],
          status: 'pending',
          roundNumber: 99,
          bracketType: 'finale',
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }
      }

      useTournamentStore.setState({
        heats: [
          { id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }
        ],
        tournamentPhase: 'running',
        fullBracketStructure: bracketStructure as any
      })

      const { generateGrandFinale } = useTournamentStore.getState()
      generateGrandFinale()

      const state = useTournamentStore.getState()
      expect(state.tournamentPhase).toBe('finale')
    })

    it('should return null when grandFinale in bracket structure is null', () => {
      useTournamentStore.setState({
        heats: [],
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: { rounds: [] },
          loserBracket: { rounds: [] },
          grandFinale: null
        } as any
      })

      const { generateGrandFinale } = useTournamentStore.getState()
      const result = generateGrandFinale()

      expect(result).toBeNull()
    })

    it('should return null when Grand Finale already exists in heats', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: {
          id: 'grand-finale-placeholder',
          heatNumber: 11,
          pilotIds: ['p1', 'p5'],
          status: 'pending',
          roundNumber: 99,
          bracketType: 'finale',
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }
      }

      useTournamentStore.setState({
        heats: [
          { id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' },
          { id: 'existing-grand-finale', heatNumber: 11, pilotIds: ['p1', 'p5'], status: 'active', bracketType: 'grand_finale' }
        ],
        fullBracketStructure: bracketStructure as any
      })

      const { generateGrandFinale } = useTournamentStore.getState()
      const result = generateGrandFinale()

      expect(result).toBeNull()
    })
  })

  describe('Task 7: Grand Finale Completion triggers tournament end', () => {
    it('should transition to completed phase when Grand Finale is completed', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: {
          id: 'grand-finale',
          heatNumber: 11,
          pilotIds: ['p1', 'p5'],
          status: 'pending',
          roundNumber: 99,
          bracketType: 'finale',
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }
      }

      useTournamentStore.setState({
        heats: [
          { id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' },
          { id: 'grand-finale', heatNumber: 11, pilotIds: ['p1', 'p5'], status: 'active', bracketType: 'grand_finale', isFinale: true }
        ],
        tournamentPhase: 'finale',
        fullBracketStructure: bracketStructure as any
      })

      const { submitHeatResults } = useTournamentStore.getState()
      submitHeatResults('grand-finale', [
        { pilotId: 'p1', rank: 1 },
        { pilotId: 'p5', rank: 2 },
      ])

      const state = useTournamentStore.getState()
      expect(state.tournamentPhase).toBe('completed')
    })
  })

  describe('Task 9: Integration Tests - Finale Flows', () => {
    it('should correctly identify when LB Finale can be generated after WB Finale', () => {
      // Simulate WB Finale completed
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: {
          id: 'grand-finale',
          pilotIds: ['p1'],
          status: 'pending',
          roundNumber: 99,
          bracketType: 'finale',
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }
      }

      useTournamentStore.setState({
        heats: [{ id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }],
        loserPool: ['p2', 'p3', 'p4', 'p5'],
        fullBracketStructure: bracketStructure as any,
        tournamentPhase: 'running',
      })

      const { isWBFinaleComplete, checkForLBFinale, generateLBFinale, generateGrandFinale } = useTournamentStore.getState()

      expect(isWBFinaleComplete()).toBe(true)
      expect(checkForLBFinale()).toBe(true)

      // Generate LB Finale
      const lbFinale = generateLBFinale()
      expect(lbFinale).toBeDefined()
      expect(lbFinale?.isFinale).toBe(true)

      // Grand Finale should not be ready yet (LB Finale not complete)
      expect(generateGrandFinale()).toBeNull()
    })

    it('should work correctly with 1-pilot Wildcard edge case', () => {
      const bracketStructure = {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            heats: [{
              id: 'wb-finale-heat',
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              status: 'completed',
              roundNumber: 3,
              bracketType: 'winner',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: {
          id: 'grand-finale',
          pilotIds: ['p1'],
          status: 'pending',
          roundNumber: 99,
          bracketType: 'finale',
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }
      }

      useTournamentStore.setState({
        heats: [{ id: 'wb-finale-heat', heatNumber: 10, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed' }],
        loserPool: ['p2'], // Only 1 pilot
        fullBracketStructure: bracketStructure as any,
        tournamentPhase: 'running',
      })

      const { isWBFinaleComplete, checkForLBFinale, generateLBFinale } = useTournamentStore.getState()

      expect(isWBFinaleComplete()).toBe(true)
      expect(checkForLBFinale()).toBe(true)

      // Generate LB Finale (Wildcard)
      const lbFinale = generateLBFinale()
      expect(lbFinale).toBeDefined()
      expect(lbFinale?.pilotIds).toEqual(['p2'])
      expect(lbFinale?.isFinale).toBe(true)
    })
  })
})
