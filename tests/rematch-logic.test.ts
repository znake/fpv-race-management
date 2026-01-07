/**
 * Rematch Logic Tests
 *
 * Story 13-4: Grand Finale Rematch-Regel
 *
 * Die Rematch-Regel existiert, weil im Double-Elimination-Format WB-Piloten 
 * eine faire zweite Chance verdienen. Wenn ein LB-Pilot (der schon einmal 
 * verloren hat) einen WB-Pilot (der noch nie verloren hat) im Grand Finale 
 * schlägt, haben beide Piloten genau 1x verloren - daher ein entscheidendes Rematch.
 *
 * AC1: Nach GF: Prüfe ob Platz 1 = LB-Pilot UND Platz 3 = WB-Pilot → Rematch für Platz 1
 * AC2: Nach GF: Prüfe ob Platz 2 = LB-Pilot UND Platz 4 = WB-Pilot → Rematch für Platz 2
 * AC3: Rematch ist 1v1 Heat (2 Piloten)
 * AC4: Rematch-Gewinner bekommt höheren Platz, Verlierer niedrigeren
 * AC5: UI zeigt Rematch-Status und -Ergebnis
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTournamentStore, INITIAL_TOURNAMENT_STATE } from '../src/stores/tournamentStore'
import type { Heat, PilotBracketState } from '../src/types/tournament'
import type { Pilot } from '../src/lib/schemas'

// Reset store before each test
beforeEach(() => {
  useTournamentStore.setState({
    ...structuredClone(INITIAL_TOURNAMENT_STATE),
    pilots: [],
    heats: [],
    pilotBracketStates: {},
    rematchHeats: [],
    grandFinaleRematchPending: false
  })
})

// ============================================================================
// TASK 1: Heat-Interface erweitern (AC: #3)
// ============================================================================

describe('Task 1: Heat-Interface Erweiterung', () => {
  describe('Task 1.1: isRematch Property', () => {
    it('Heat kann isRematch=true haben', () => {
      const rematchHeat: Heat = {
        id: 'rematch-1',
        heatNumber: 100,
        pilotIds: ['pilot-1', 'pilot-2'],
        status: 'pending',
        isRematch: true
      }
      
      expect(rematchHeat.isRematch).toBe(true)
    })

    it('Heat kann isRematch=undefined haben (normaler Heat)', () => {
      const normalHeat: Heat = {
        id: 'normal-1',
        heatNumber: 1,
        pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
        status: 'pending'
      }
      
      expect(normalHeat.isRematch).toBeUndefined()
    })
  })

  describe('Task 1.2: rematchBetween Property', () => {
    it('Rematch-Heat hat rematchBetween mit 2 Pilot IDs', () => {
      const rematchHeat: Heat = {
        id: 'rematch-1',
        heatNumber: 100,
        pilotIds: ['pilot-lb', 'pilot-wb'],
        status: 'pending',
        isRematch: true,
        rematchBetween: ['pilot-lb', 'pilot-wb']
      }
      
      expect(rematchHeat.rematchBetween).toHaveLength(2)
      expect(rematchHeat.rematchBetween).toContain('pilot-lb')
      expect(rematchHeat.rematchBetween).toContain('pilot-wb')
    })
  })

  describe('Task 1.3: rematchForPlace Property', () => {
    it('Rematch für Platz 1', () => {
      const rematchHeat: Heat = {
        id: 'rematch-place-1',
        heatNumber: 100,
        pilotIds: ['pilot-lb', 'pilot-wb'],
        status: 'pending',
        isRematch: true,
        rematchBetween: ['pilot-lb', 'pilot-wb'],
        rematchForPlace: 1
      }
      
      expect(rematchHeat.rematchForPlace).toBe(1)
    })

    it('Rematch für Platz 2', () => {
      const rematchHeat: Heat = {
        id: 'rematch-place-2',
        heatNumber: 101,
        pilotIds: ['pilot-lb-2', 'pilot-wb-2'],
        status: 'pending',
        isRematch: true,
        rematchBetween: ['pilot-lb-2', 'pilot-wb-2'],
        rematchForPlace: 2
      }
      
      expect(rematchHeat.rematchForPlace).toBe(2)
    })
  })
})

// ============================================================================
// TASK 2: checkAndGenerateRematches() implementieren (AC: #1, #2)
// ============================================================================

describe('Task 2: checkAndGenerateRematches()', () => {
  // Helper: Create pilots with specific IDs
  const createPilots = (ids: string[]): Pilot[] =>
    ids.map(id => ({
      id,
      name: `Pilot ${id}`,
      imageUrl: `/images/${id}.jpg`
    }))

  // Helper: Setup Grand Finale with specific results and bracket origins
  const setupCompletedGrandFinale = (
    rankings: { pilotId: string; rank: number }[],
    bracketOrigins: Record<string, 'wb' | 'lb'>
  ): Heat => {
    // Setup pilot bracket states
    const pilotBracketStates: Record<string, PilotBracketState> = {}
    for (const [pilotId, origin] of Object.entries(bracketOrigins)) {
      pilotBracketStates[pilotId] = {
        bracket: 'grand_finale',
        roundReached: 0,
        bracketOrigin: origin
      }
    }
    useTournamentStore.setState({ pilotBracketStates })

    return {
      id: 'grand-finale-test',
      heatNumber: 99,
      pilotIds: rankings.map(r => r.pilotId),
      status: 'completed',
      bracketType: 'grand_finale',
      isFinale: true,
      roundName: 'Grand Finale',
      results: {
        rankings,
        completedAt: new Date().toISOString()
      }
    }
  }

  describe('Task 2.1: Funktion nimmt Grand Finale Rankings', () => {
    it('checkAndGenerateRematches existiert und ist aufrufbar', () => {
      const store = useTournamentStore.getState()
      expect(typeof store.checkAndGenerateRematches).toBe('function')
    })
  })

  describe('Task 2.2: Platz 1 vs 3 Rematch-Bedingung (AC1)', () => {
    it('Rematch für Platz 1 wenn: Platz 1 = LB-Pilot UND Platz 3 = WB-Pilot', () => {
      const pilots = createPilots(['lb-1', 'wb-1', 'wb-2', 'lb-2'])
      
      // Setup: LB-Pilot auf Platz 1, WB-Pilot auf Platz 3
      const grandFinale = setupCompletedGrandFinale(
        [
          { pilotId: 'lb-1', rank: 1 },  // LB-Pilot gewinnt
          { pilotId: 'lb-2', rank: 2 },
          { pilotId: 'wb-1', rank: 3 },  // WB-Pilot auf Platz 3 - braucht Rematch!
          { pilotId: 'wb-2', rank: 4 }
        ],
        { 'lb-1': 'lb', 'lb-2': 'lb', 'wb-1': 'wb', 'wb-2': 'wb' }
      )

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale],
        tournamentPhase: 'completed'
      })

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      
      expect(rematches.length).toBeGreaterThanOrEqual(1)
      const place1Rematch = rematches.find(r => r.rematchForPlace === 1)
      expect(place1Rematch).toBeDefined()
      expect(place1Rematch?.rematchBetween).toContain('lb-1')
      expect(place1Rematch?.rematchBetween).toContain('wb-1')
    })

    it('KEIN Rematch für Platz 1 wenn: Platz 1 = WB-Pilot', () => {
      const pilots = createPilots(['wb-1', 'wb-2', 'lb-1', 'lb-2'])
      
      // WB-Pilot auf Platz 1 - kein Rematch nötig
      const grandFinale = setupCompletedGrandFinale(
        [
          { pilotId: 'wb-1', rank: 1 },  // WB-Pilot gewinnt - kein Rematch
          { pilotId: 'wb-2', rank: 2 },
          { pilotId: 'lb-1', rank: 3 },
          { pilotId: 'lb-2', rank: 4 }
        ],
        { 'wb-1': 'wb', 'wb-2': 'wb', 'lb-1': 'lb', 'lb-2': 'lb' }
      )

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale],
        tournamentPhase: 'completed'
      })

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      
      const place1Rematch = rematches.find(r => r.rematchForPlace === 1)
      expect(place1Rematch).toBeUndefined()
    })

    it('KEIN Rematch für Platz 1 wenn: Platz 3 = LB-Pilot', () => {
      const pilots = createPilots(['lb-1', 'wb-1', 'lb-2', 'wb-2'])
      
      // LB-Pilot auf Platz 1, aber auch LB-Pilot auf Platz 3 - kein Rematch
      const grandFinale = setupCompletedGrandFinale(
        [
          { pilotId: 'lb-1', rank: 1 },  
          { pilotId: 'wb-1', rank: 2 },
          { pilotId: 'lb-2', rank: 3 },  // LB auf Platz 3 - kein Rematch nötig
          { pilotId: 'wb-2', rank: 4 }
        ],
        { 'lb-1': 'lb', 'wb-1': 'wb', 'lb-2': 'lb', 'wb-2': 'wb' }
      )

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale],
        tournamentPhase: 'completed'
      })

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      
      const place1Rematch = rematches.find(r => r.rematchForPlace === 1)
      expect(place1Rematch).toBeUndefined()
    })
  })

  describe('Task 2.3: Platz 2 vs 4 Rematch-Bedingung (AC2)', () => {
    it('Rematch für Platz 2 wenn: Platz 2 = LB-Pilot UND Platz 4 = WB-Pilot', () => {
      const pilots = createPilots(['wb-1', 'lb-1', 'lb-2', 'wb-2'])
      
      // Setup: LB-Pilot auf Platz 2, WB-Pilot auf Platz 4
      const grandFinale = setupCompletedGrandFinale(
        [
          { pilotId: 'wb-1', rank: 1 },
          { pilotId: 'lb-1', rank: 2 },  // LB-Pilot auf Platz 2
          { pilotId: 'lb-2', rank: 3 },
          { pilotId: 'wb-2', rank: 4 }   // WB-Pilot auf Platz 4 - braucht Rematch!
        ],
        { 'wb-1': 'wb', 'lb-1': 'lb', 'lb-2': 'lb', 'wb-2': 'wb' }
      )

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale],
        tournamentPhase: 'completed'
      })

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      
      const place2Rematch = rematches.find(r => r.rematchForPlace === 2)
      expect(place2Rematch).toBeDefined()
      expect(place2Rematch?.rematchBetween).toContain('lb-1')
      expect(place2Rematch?.rematchBetween).toContain('wb-2')
    })

    it('KEIN Rematch für Platz 2 wenn: Platz 2 = WB-Pilot', () => {
      const pilots = createPilots(['lb-1', 'wb-1', 'wb-2', 'lb-2'])
      
      const grandFinale = setupCompletedGrandFinale(
        [
          { pilotId: 'lb-1', rank: 1 },
          { pilotId: 'wb-1', rank: 2 },  // WB auf Platz 2 - kein Rematch
          { pilotId: 'wb-2', rank: 3 },
          { pilotId: 'lb-2', rank: 4 }
        ],
        { 'lb-1': 'lb', 'wb-1': 'wb', 'wb-2': 'wb', 'lb-2': 'lb' }
      )

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale],
        tournamentPhase: 'completed'
      })

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      
      const place2Rematch = rematches.find(r => r.rematchForPlace === 2)
      expect(place2Rematch).toBeUndefined()
    })
  })

  describe('Task 2.4: Generiert 0, 1 oder 2 Rematch-Heats', () => {
    it('0 Rematches wenn alle WB-Piloten oben (normaler Fall)', () => {
      const pilots = createPilots(['wb-1', 'wb-2', 'lb-1', 'lb-2'])
      
      // WB-Piloten auf 1+2, LB-Piloten auf 3+4 - perfekt, kein Rematch
      const grandFinale = setupCompletedGrandFinale(
        [
          { pilotId: 'wb-1', rank: 1 },
          { pilotId: 'wb-2', rank: 2 },
          { pilotId: 'lb-1', rank: 3 },
          { pilotId: 'lb-2', rank: 4 }
        ],
        { 'wb-1': 'wb', 'wb-2': 'wb', 'lb-1': 'lb', 'lb-2': 'lb' }
      )

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale],
        tournamentPhase: 'completed'
      })

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      
      expect(rematches).toHaveLength(0)
    })

    it('1 Rematch nur für Platz 1', () => {
      const pilots = createPilots(['lb-1', 'wb-2', 'wb-1', 'lb-2'])
      
      // Nur Platz 1/3 Bedingung erfüllt
      const grandFinale = setupCompletedGrandFinale(
        [
          { pilotId: 'lb-1', rank: 1 },  // LB
          { pilotId: 'wb-2', rank: 2 },  // WB auf 2 - kein Rematch
          { pilotId: 'wb-1', rank: 3 },  // WB auf 3 - Rematch mit lb-1!
          { pilotId: 'lb-2', rank: 4 }   // LB auf 4 - kein Rematch
        ],
        { 'lb-1': 'lb', 'wb-2': 'wb', 'wb-1': 'wb', 'lb-2': 'lb' }
      )

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale],
        tournamentPhase: 'completed'
      })

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      
      expect(rematches).toHaveLength(1)
      expect(rematches[0].rematchForPlace).toBe(1)
    })

    it('1 Rematch nur für Platz 2', () => {
      const pilots = createPilots(['wb-1', 'lb-1', 'lb-2', 'wb-2'])
      
      // Nur Platz 2/4 Bedingung erfüllt
      const grandFinale = setupCompletedGrandFinale(
        [
          { pilotId: 'wb-1', rank: 1 },  // WB auf 1 - kein Rematch
          { pilotId: 'lb-1', rank: 2 },  // LB
          { pilotId: 'lb-2', rank: 3 },  // LB auf 3 - kein Rematch
          { pilotId: 'wb-2', rank: 4 }   // WB auf 4 - Rematch mit lb-1!
        ],
        { 'wb-1': 'wb', 'lb-1': 'lb', 'lb-2': 'lb', 'wb-2': 'wb' }
      )

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale],
        tournamentPhase: 'completed'
      })

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      
      expect(rematches).toHaveLength(1)
      expect(rematches[0].rematchForPlace).toBe(2)
    })

    it('2 Rematches (seltener Fall - beide WB-Piloten verlieren)', () => {
      const pilots = createPilots(['lb-1', 'lb-2', 'wb-1', 'wb-2'])
      
      // Beide LB-Piloten schlagen beide WB-Piloten
      const grandFinale = setupCompletedGrandFinale(
        [
          { pilotId: 'lb-1', rank: 1 },  // LB
          { pilotId: 'lb-2', rank: 2 },  // LB
          { pilotId: 'wb-1', rank: 3 },  // WB - Rematch für Platz 1
          { pilotId: 'wb-2', rank: 4 }   // WB - Rematch für Platz 2
        ],
        { 'lb-1': 'lb', 'lb-2': 'lb', 'wb-1': 'wb', 'wb-2': 'wb' }
      )

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale],
        tournamentPhase: 'completed'
      })

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      
      expect(rematches).toHaveLength(2)
      expect(rematches.find(r => r.rematchForPlace === 1)).toBeDefined()
      expect(rematches.find(r => r.rematchForPlace === 2)).toBeDefined()
    })

    it('AC3: Rematch-Heats haben genau 2 Piloten', () => {
      const pilots = createPilots(['lb-1', 'lb-2', 'wb-1', 'wb-2'])
      
      const grandFinale = setupCompletedGrandFinale(
        [
          { pilotId: 'lb-1', rank: 1 },
          { pilotId: 'lb-2', rank: 2 },
          { pilotId: 'wb-1', rank: 3 },
          { pilotId: 'wb-2', rank: 4 }
        ],
        { 'lb-1': 'lb', 'lb-2': 'lb', 'wb-1': 'wb', 'wb-2': 'wb' }
      )

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale],
        tournamentPhase: 'completed'
      })

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      
      for (const rematch of rematches) {
        expect(rematch.pilotIds).toHaveLength(2)
        expect(rematch.isRematch).toBe(true)
      }
    })
  })
})

// ============================================================================
// TASK 3: State-Erweiterung (AC: #5)
// ============================================================================

describe('Task 3: State-Erweiterung', () => {
  describe('Task 3.1: grandFinaleRematchPending State', () => {
    it('grandFinaleRematchPending ist initial false', () => {
      const state = useTournamentStore.getState()
      expect(state.grandFinaleRematchPending).toBe(false)
    })

    it('grandFinaleRematchPending wird true wenn Rematches generiert', () => {
      const pilots: Pilot[] = [
        { id: 'lb-1', name: 'LB 1', imageUrl: '/lb1.jpg' },
        { id: 'lb-2', name: 'LB 2', imageUrl: '/lb2.jpg' },
        { id: 'wb-1', name: 'WB 1', imageUrl: '/wb1.jpg' },
        { id: 'wb-2', name: 'WB 2', imageUrl: '/wb2.jpg' }
      ]
      
      const grandFinale: Heat = {
        id: 'grand-finale-test',
        heatNumber: 99,
        pilotIds: ['lb-1', 'lb-2', 'wb-1', 'wb-2'],
        status: 'completed',
        bracketType: 'grand_finale',
        isFinale: true,
        results: {
          rankings: [
            { pilotId: 'lb-1', rank: 1 },
            { pilotId: 'lb-2', rank: 2 },
            { pilotId: 'wb-1', rank: 3 },
            { pilotId: 'wb-2', rank: 4 }
          ],
          completedAt: new Date().toISOString()
        }
      }

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale],
        pilotBracketStates: {
          'lb-1': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' },
          'lb-2': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' },
          'wb-1': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' },
          'wb-2': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
        },
        tournamentPhase: 'completed'
      })

      useTournamentStore.getState().checkAndGenerateRematches()
      
      expect(useTournamentStore.getState().grandFinaleRematchPending).toBe(true)
    })
  })

  describe('Task 3.2: rematchHeats Array', () => {
    it('rematchHeats ist initial leer', () => {
      const state = useTournamentStore.getState()
      expect(state.rematchHeats).toEqual([])
    })

    it('checkAndGenerateRematches fügt Heats zu rematchHeats hinzu', () => {
      const pilots: Pilot[] = [
        { id: 'lb-1', name: 'LB 1', imageUrl: '/lb1.jpg' },
        { id: 'lb-2', name: 'LB 2', imageUrl: '/lb2.jpg' },
        { id: 'wb-1', name: 'WB 1', imageUrl: '/wb1.jpg' },
        { id: 'wb-2', name: 'WB 2', imageUrl: '/wb2.jpg' }
      ]
      
      const grandFinale: Heat = {
        id: 'grand-finale-test',
        heatNumber: 99,
        pilotIds: ['lb-1', 'lb-2', 'wb-1', 'wb-2'],
        status: 'completed',
        bracketType: 'grand_finale',
        isFinale: true,
        results: {
          rankings: [
            { pilotId: 'lb-1', rank: 1 },
            { pilotId: 'lb-2', rank: 2 },
            { pilotId: 'wb-1', rank: 3 },
            { pilotId: 'wb-2', rank: 4 }
          ],
          completedAt: new Date().toISOString()
        }
      }

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale],
        pilotBracketStates: {
          'lb-1': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' },
          'lb-2': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' },
          'wb-1': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' },
          'wb-2': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
        },
        tournamentPhase: 'completed'
      })

      useTournamentStore.getState().checkAndGenerateRematches()
      
      const { rematchHeats } = useTournamentStore.getState()
      expect(rematchHeats.length).toBeGreaterThan(0)
      expect(rematchHeats.every(h => h.isRematch === true)).toBe(true)
    })
  })
})

// ============================================================================
// TASK 4: submitHeatResults() für Rematch anpassen (AC: #4)
// ============================================================================

describe('Task 4: submitHeatResults für Rematch', () => {
  describe('Task 4.1: Erkennung von Rematch-Heats', () => {
    it('submitHeatResults erkennt Rematch-Heat an isRematch=true', () => {
      const pilots: Pilot[] = [
        { id: 'lb-1', name: 'LB 1', imageUrl: '/lb1.jpg' },
        { id: 'wb-1', name: 'WB 1', imageUrl: '/wb1.jpg' }
      ]
      
      const rematchHeat: Heat = {
        id: 'rematch-place-1',
        heatNumber: 100,
        pilotIds: ['lb-1', 'wb-1'],
        status: 'active',
        isRematch: true,
        rematchBetween: ['lb-1', 'wb-1'],
        rematchForPlace: 1
      }

      useTournamentStore.setState({
        pilots,
        heats: [rematchHeat],
        rematchHeats: [rematchHeat],
        grandFinaleRematchPending: true
      })

      // Submit: WB-Pilot gewinnt das Rematch
      useTournamentStore.getState().submitHeatResults('rematch-place-1', [
        { pilotId: 'wb-1', rank: 1 },
        { pilotId: 'lb-1', rank: 2 }
      ])

      const updatedHeat = useTournamentStore.getState().heats.find(h => h.id === 'rematch-place-1')
      expect(updatedHeat?.status).toBe('completed')
    })
  })

  describe('Task 4.2: Rematch-Ergebnis Logik (AC4)', () => {
    it('Rematch für Platz 1: Gewinner bekommt Platz 1, Verlierer Platz 3', () => {
      const pilots: Pilot[] = [
        { id: 'lb-1', name: 'LB 1', imageUrl: '/lb1.jpg' },
        { id: 'wb-1', name: 'WB 1', imageUrl: '/wb1.jpg' },
        { id: 'pilot-3', name: 'Pilot 3', imageUrl: '/p3.jpg' },
        { id: 'pilot-4', name: 'Pilot 4', imageUrl: '/p4.jpg' }
      ]
      
      // Completed Grand Finale
      const grandFinale: Heat = {
        id: 'grand-finale',
        heatNumber: 99,
        pilotIds: ['lb-1', 'pilot-3', 'wb-1', 'pilot-4'],
        status: 'completed',
        bracketType: 'grand_finale',
        isFinale: true,
        results: {
          rankings: [
            { pilotId: 'lb-1', rank: 1 },
            { pilotId: 'pilot-3', rank: 2 },
            { pilotId: 'wb-1', rank: 3 },
            { pilotId: 'pilot-4', rank: 4 }
          ],
          completedAt: new Date().toISOString()
        }
      }
      
      const rematchHeat: Heat = {
        id: 'rematch-place-1',
        heatNumber: 100,
        pilotIds: ['lb-1', 'wb-1'],
        status: 'active',
        isRematch: true,
        rematchBetween: ['lb-1', 'wb-1'],
        rematchForPlace: 1
      }

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale, rematchHeat],
        rematchHeats: [rematchHeat],
        grandFinaleRematchPending: true,
        pilotBracketStates: {
          'lb-1': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' },
          'wb-1': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
        }
      })

      // WB-Pilot gewinnt Rematch - er bekommt Platz 1, LB-Pilot fällt auf Platz 3
      useTournamentStore.getState().submitHeatResults('rematch-place-1', [
        { pilotId: 'wb-1', rank: 1 },
        { pilotId: 'lb-1', rank: 2 }
      ])

      const top4 = useTournamentStore.getState().getTop4Pilots()
      expect(top4?.place1?.id).toBe('wb-1')  // Rematch-Gewinner
      expect(top4?.place3?.id).toBe('lb-1')  // Rematch-Verlierer auf +2
    })

    it('Rematch für Platz 2: Gewinner bekommt Platz 2, Verlierer Platz 4', () => {
      const pilots: Pilot[] = [
        { id: 'pilot-1', name: 'Pilot 1', imageUrl: '/p1.jpg' },
        { id: 'lb-2', name: 'LB 2', imageUrl: '/lb2.jpg' },
        { id: 'pilot-3', name: 'Pilot 3', imageUrl: '/p3.jpg' },
        { id: 'wb-2', name: 'WB 2', imageUrl: '/wb2.jpg' }
      ]
      
      // Completed Grand Finale
      const grandFinale: Heat = {
        id: 'grand-finale',
        heatNumber: 99,
        pilotIds: ['pilot-1', 'lb-2', 'pilot-3', 'wb-2'],
        status: 'completed',
        bracketType: 'grand_finale',
        isFinale: true,
        results: {
          rankings: [
            { pilotId: 'pilot-1', rank: 1 },
            { pilotId: 'lb-2', rank: 2 },
            { pilotId: 'pilot-3', rank: 3 },
            { pilotId: 'wb-2', rank: 4 }
          ],
          completedAt: new Date().toISOString()
        }
      }
      
      const rematchHeat: Heat = {
        id: 'rematch-place-2',
        heatNumber: 101,
        pilotIds: ['lb-2', 'wb-2'],
        status: 'active',
        isRematch: true,
        rematchBetween: ['lb-2', 'wb-2'],
        rematchForPlace: 2
      }

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale, rematchHeat],
        rematchHeats: [rematchHeat],
        grandFinaleRematchPending: true,
        pilotBracketStates: {
          'lb-2': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' },
          'wb-2': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
        }
      })

      // WB-Pilot gewinnt Rematch
      useTournamentStore.getState().submitHeatResults('rematch-place-2', [
        { pilotId: 'wb-2', rank: 1 },
        { pilotId: 'lb-2', rank: 2 }
      ])

      const top4 = useTournamentStore.getState().getTop4Pilots()
      expect(top4?.place2?.id).toBe('wb-2')  // Rematch-Gewinner
      expect(top4?.place4?.id).toBe('lb-2')  // Rematch-Verlierer auf +2
    })
  })
})

// ============================================================================
// TASK 5: Finale-Platzierungen nach Rematch (AC: #4)
// ============================================================================

describe('Task 5: Finale-Platzierungen nach Rematch', () => {
  describe('Task 5.1: getTop4Pilots berücksichtigt Rematch', () => {
    it('Platzierungen berücksichtigen Rematch-Ergebnisse', () => {
      const pilots: Pilot[] = [
        { id: 'lb-1', name: 'LB Winner', imageUrl: '/lb1.jpg' },
        { id: 'lb-2', name: 'LB Second', imageUrl: '/lb2.jpg' },
        { id: 'wb-1', name: 'WB Third', imageUrl: '/wb1.jpg' },
        { id: 'wb-2', name: 'WB Fourth', imageUrl: '/wb2.jpg' }
      ]
      
      // Grand Finale Results (vor Rematches)
      const grandFinale: Heat = {
        id: 'grand-finale',
        heatNumber: 99,
        pilotIds: ['lb-1', 'lb-2', 'wb-1', 'wb-2'],
        status: 'completed',
        bracketType: 'grand_finale',
        isFinale: true,
        results: {
          rankings: [
            { pilotId: 'lb-1', rank: 1 },  // LB
            { pilotId: 'lb-2', rank: 2 },  // LB  
            { pilotId: 'wb-1', rank: 3 },  // WB - braucht Rematch
            { pilotId: 'wb-2', rank: 4 }   // WB - braucht Rematch
          ],
          completedAt: new Date().toISOString()
        }
      }

      // Rematch 1: WB-1 vs LB-1 für Platz 1
      const rematch1: Heat = {
        id: 'rematch-1',
        heatNumber: 100,
        pilotIds: ['lb-1', 'wb-1'],
        status: 'completed',
        isRematch: true,
        rematchBetween: ['lb-1', 'wb-1'],
        rematchForPlace: 1,
        results: {
          rankings: [
            { pilotId: 'wb-1', rank: 1 },  // WB gewinnt Rematch → neuer Platz 1
            { pilotId: 'lb-1', rank: 2 }   // LB verliert → Platz 3
          ],
          completedAt: new Date().toISOString()
        }
      }

      // Rematch 2: WB-2 vs LB-2 für Platz 2
      const rematch2: Heat = {
        id: 'rematch-2',
        heatNumber: 101,
        pilotIds: ['lb-2', 'wb-2'],
        status: 'completed',
        isRematch: true,
        rematchBetween: ['lb-2', 'wb-2'],
        rematchForPlace: 2,
        results: {
          rankings: [
            { pilotId: 'wb-2', rank: 1 },  // WB gewinnt Rematch → neuer Platz 2
            { pilotId: 'lb-2', rank: 2 }   // LB verliert → Platz 4
          ],
          completedAt: new Date().toISOString()
        }
      }

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale, rematch1, rematch2],
        rematchHeats: [rematch1, rematch2],
        grandFinaleRematchPending: false,
        tournamentPhase: 'completed',
        pilotBracketStates: {
          'lb-1': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' },
          'lb-2': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' },
          'wb-1': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' },
          'wb-2': { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
        }
      })

      const top4 = useTournamentStore.getState().getTop4Pilots()
      
      // Nach beiden Rematches: WB-Piloten haben beide gewonnen
      expect(top4?.place1?.id).toBe('wb-1')  // Rematch 1 Gewinner
      expect(top4?.place2?.id).toBe('wb-2')  // Rematch 2 Gewinner
      expect(top4?.place3?.id).toBe('lb-1')  // Rematch 1 Verlierer
      expect(top4?.place4?.id).toBe('lb-2')  // Rematch 2 Verlierer
    })
  })

  describe('Task 5.2: Platzierungen erst final wenn alle Rematches completed', () => {
    it('getTop4Pilots gibt null zurück wenn Rematches pending', () => {
      const pilots: Pilot[] = [
        { id: 'lb-1', name: 'LB 1', imageUrl: '/lb1.jpg' },
        { id: 'lb-2', name: 'LB 2', imageUrl: '/lb2.jpg' },
        { id: 'wb-1', name: 'WB 1', imageUrl: '/wb1.jpg' },
        { id: 'wb-2', name: 'WB 2', imageUrl: '/wb2.jpg' }
      ]
      
      const grandFinale: Heat = {
        id: 'grand-finale',
        heatNumber: 99,
        pilotIds: ['lb-1', 'lb-2', 'wb-1', 'wb-2'],
        status: 'completed',
        bracketType: 'grand_finale',
        isFinale: true,
        results: {
          rankings: [
            { pilotId: 'lb-1', rank: 1 },
            { pilotId: 'lb-2', rank: 2 },
            { pilotId: 'wb-1', rank: 3 },
            { pilotId: 'wb-2', rank: 4 }
          ],
          completedAt: new Date().toISOString()
        }
      }

      // Rematch ist noch PENDING
      const rematch: Heat = {
        id: 'rematch-1',
        heatNumber: 100,
        pilotIds: ['lb-1', 'wb-1'],
        status: 'pending',  // NOT COMPLETED
        isRematch: true,
        rematchBetween: ['lb-1', 'wb-1'],
        rematchForPlace: 1
      }

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale, rematch],
        rematchHeats: [rematch],
        grandFinaleRematchPending: true,  // Still pending!
        tournamentPhase: 'finale'
      })

      const top4 = useTournamentStore.getState().getTop4Pilots()
      
      // Platzierungen sollten null sein solange Rematches pending
      expect(top4).toBeNull()
    })

    it('Tournament bleibt in finale Phase bis alle Rematches completed', () => {
      const pilots: Pilot[] = [
        { id: 'lb-1', name: 'LB 1', imageUrl: '/lb1.jpg' },
        { id: 'wb-1', name: 'WB 1', imageUrl: '/wb1.jpg' }
      ]

      const grandFinale: Heat = {
        id: 'grand-finale',
        heatNumber: 99,
        pilotIds: ['lb-1', 'lb-2', 'wb-1', 'wb-2'],
        status: 'completed',
        bracketType: 'grand_finale',
        isFinale: true,
        results: {
          rankings: [
            { pilotId: 'lb-1', rank: 1 },
            { pilotId: 'lb-2', rank: 2 },
            { pilotId: 'wb-1', rank: 3 },
            { pilotId: 'wb-2', rank: 4 }
          ],
          completedAt: new Date().toISOString()
        }
      }
      
      const rematchHeat: Heat = {
        id: 'rematch-1',
        heatNumber: 100,
        pilotIds: ['lb-1', 'wb-1'],
        status: 'active',  // ACTIVE - nicht completed
        isRematch: true,
        rematchBetween: ['lb-1', 'wb-1'],
        rematchForPlace: 1
      }

      useTournamentStore.setState({
        pilots,
        heats: [grandFinale, rematchHeat],
        rematchHeats: [rematchHeat],
        grandFinaleRematchPending: true,
        tournamentPhase: 'finale'
      })

      // Phase sollte finale sein (nicht completed)
      expect(useTournamentStore.getState().tournamentPhase).toBe('finale')
    })
  })
})

// ============================================================================
// TASK 7: Unit Tests (Zusammenfassung)
// ============================================================================

describe('Task 7: Unit Tests Zusammenfassung', () => {
  // Helper: Create complete tournament state for rematch scenario
  const setupRematchScenario = (gfResults: { pilotId: string; rank: number; origin: 'wb' | 'lb' }[]) => {
    const pilots: Pilot[] = gfResults.map(r => ({
      id: r.pilotId,
      name: `Pilot ${r.pilotId}`,
      imageUrl: `/${r.pilotId}.jpg`
    }))

    const pilotBracketStates: Record<string, PilotBracketState> = {}
    gfResults.forEach(r => {
      pilotBracketStates[r.pilotId] = {
        bracket: 'grand_finale',
        roundReached: 0,
        bracketOrigin: r.origin
      }
    })

    const grandFinale: Heat = {
      id: 'grand-finale',
      heatNumber: 99,
      pilotIds: gfResults.map(r => r.pilotId),
      status: 'completed',
      bracketType: 'grand_finale',
      isFinale: true,
      results: {
        rankings: gfResults.map(r => ({ pilotId: r.pilotId, rank: r.rank })),
        completedAt: new Date().toISOString()
      }
    }

    useTournamentStore.setState({
      pilots,
      heats: [grandFinale],
      pilotBracketStates,
      tournamentPhase: 'completed'
    })
  }

  describe('Task 7.1: Kein Rematch wenn alle WB-Piloten oben', () => {
    it('WB auf 1+2, LB auf 3+4 → 0 Rematches', () => {
      setupRematchScenario([
        { pilotId: 'wb-1', rank: 1, origin: 'wb' },
        { pilotId: 'wb-2', rank: 2, origin: 'wb' },
        { pilotId: 'lb-1', rank: 3, origin: 'lb' },
        { pilotId: 'lb-2', rank: 4, origin: 'lb' }
      ])

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      expect(rematches).toHaveLength(0)
    })
  })

  describe('Task 7.2: Ein Rematch für Platz 1', () => {
    it('LB auf 1, WB auf 3 → 1 Rematch für Platz 1', () => {
      setupRematchScenario([
        { pilotId: 'lb-1', rank: 1, origin: 'lb' },
        { pilotId: 'wb-2', rank: 2, origin: 'wb' },
        { pilotId: 'wb-1', rank: 3, origin: 'wb' },
        { pilotId: 'lb-2', rank: 4, origin: 'lb' }
      ])

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      expect(rematches).toHaveLength(1)
      expect(rematches[0].rematchForPlace).toBe(1)
    })
  })

  describe('Task 7.3: Ein Rematch für Platz 2', () => {
    it('LB auf 2, WB auf 4 → 1 Rematch für Platz 2', () => {
      setupRematchScenario([
        { pilotId: 'wb-1', rank: 1, origin: 'wb' },
        { pilotId: 'lb-1', rank: 2, origin: 'lb' },
        { pilotId: 'lb-2', rank: 3, origin: 'lb' },
        { pilotId: 'wb-2', rank: 4, origin: 'wb' }
      ])

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      expect(rematches).toHaveLength(1)
      expect(rematches[0].rematchForPlace).toBe(2)
    })
  })

  describe('Task 7.4: Zwei Rematches (seltener Fall)', () => {
    it('LB auf 1+2, WB auf 3+4 → 2 Rematches', () => {
      setupRematchScenario([
        { pilotId: 'lb-1', rank: 1, origin: 'lb' },
        { pilotId: 'lb-2', rank: 2, origin: 'lb' },
        { pilotId: 'wb-1', rank: 3, origin: 'wb' },
        { pilotId: 'wb-2', rank: 4, origin: 'wb' }
      ])

      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      expect(rematches).toHaveLength(2)
    })
  })

  describe('Task 7.5: Finale Platzierungen nach Rematch', () => {
    it('Platzierungen werden nach Rematch-Ergebnissen aktualisiert', () => {
      // Setup: Grand Finale wo LB-Pilot gewinnt
      setupRematchScenario([
        { pilotId: 'lb-1', rank: 1, origin: 'lb' },
        { pilotId: 'wb-2', rank: 2, origin: 'wb' },
        { pilotId: 'wb-1', rank: 3, origin: 'wb' },
        { pilotId: 'lb-2', rank: 4, origin: 'lb' }
      ])

      // Generate rematch
      const rematches = useTournamentStore.getState().checkAndGenerateRematches()
      expect(rematches).toHaveLength(1)
      
      // Get the generated rematch heat
      const state = useTournamentStore.getState()
      const rematchHeat = state.rematchHeats[0]
      
      // Submit rematch result: WB-Pilot gewinnt
      useTournamentStore.getState().submitHeatResults(rematchHeat.id, [
        { pilotId: 'wb-1', rank: 1 },
        { pilotId: 'lb-1', rank: 2 }
      ])

      // Check final placements
      const top4 = useTournamentStore.getState().getTop4Pilots()
      expect(top4?.place1?.id).toBe('wb-1')  // Rematch-Gewinner → Platz 1
      expect(top4?.place3?.id).toBe('lb-1')  // Rematch-Verlierer → Platz 3
    })
  })
})
