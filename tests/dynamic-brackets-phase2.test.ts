import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTournamentStore, Heat } from '../src/stores/tournamentStore'

describe('Dynamic Brackets - Phase 2: Dynamische WB-Heat Generierung', () => {
  beforeEach(() => {
    const { resetAll } = useTournamentStore.getState()
    resetAll()

    // Add 8 pilots for testing
    const store = useTournamentStore.getState()
    for (let i = 1; i <= 8; i++) {
      store.addPilot({
        name: `Pilot ${i}`,
        imageUrl: `https://example.com/pilot${i}.jpg`
      })
    }
  })

  describe('Task 7: Nach Quali-Abschluss WB-Heats erstellen', () => {
    it('sollte isQualificationComplete auf true setzen wenn alle Quali-Heats completed sind', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Start tournament with 8 pilots = 2 quali heats (4 + 4)
      act(() => {
        result.current.confirmTournamentStart()
      })

      expect(result.current.isQualificationComplete).toBe(false)

      // Get quali heats from bracket structure (initial heats without bracketType are quali heats)
      const { heats, fullBracketStructure } = useTournamentStore.getState()
      
      // Quali heats are the first N heats that match the bracket structure
      const qualiHeatIds = new Set(fullBracketStructure?.qualification.heats.map(h => h.id) || [])
      const qualiHeats = heats.filter(h => qualiHeatIds.has(h.id))

      qualiHeats.forEach(heat => {
        act(() => {
          const rankings = heat.pilotIds.map((pilotId, idx) => ({
            pilotId,
            rank: (idx + 1) as 1 | 2 | 3 | 4
          }))
          result.current.submitHeatResults(heat.id, rankings)
        })
      })

      // Check flag is set
      expect(result.current.isQualificationComplete).toBe(true)
    })

    it('sollte alle Gewinner (Platz 1+2) in winnerPilots sammeln und WB-Heats generieren', () => {
      const { result } = renderHook(() => useTournamentStore())

      act(() => {
        result.current.confirmTournamentStart()
      })

      // Get quali heats from bracket structure
      const { heats, fullBracketStructure } = useTournamentStore.getState()
      const qualiHeatIds = new Set(fullBracketStructure?.qualification.heats.map(h => h.id) || [])
      const qualiHeats = heats.filter(h => qualiHeatIds.has(h.id))

      qualiHeats.forEach(heat => {
        act(() => {
          const rankings = heat.pilotIds.map((pilotId, idx) => ({
            pilotId,
            rank: (idx + 1) as 1 | 2 | 3 | 4
          }))
          result.current.submitHeatResults(heat.id, rankings)
        })
      })

      // Story 13-6: winnerPool wird dynamisch berechnet, nicht mehr als State
      // Nach Quali sollten 4 Gewinner in winnerPilots sein (2 pro Heat × 2 Heats)
      expect(result.current.winnerPilots.length).toBe(4)
      
      // Es sollte mind. 1 WB-Heat generiert worden sein
      const { heats: updatedHeats } = useTournamentStore.getState()
      const wbHeats = updatedHeats.filter(h => h.bracketType === 'winner')
      expect(wbHeats.length).toBeGreaterThan(0)
    })

    it('sollte WB Heat erstellen wenn genug Gewinner vorhanden sind (>= 4)', () => {
      const { result } = renderHook(() => useTournamentStore())

      act(() => {
        result.current.confirmTournamentStart()
      })

      // Get quali heats from bracket structure
      const { heats, fullBracketStructure } = useTournamentStore.getState()
      const qualiHeatIds = new Set(fullBracketStructure?.qualification.heats.map(h => h.id) || [])
      const qualiHeats = heats.filter(h => qualiHeatIds.has(h.id))

      qualiHeats.forEach(heat => {
        act(() => {
          const rankings = heat.pilotIds.map((pilotId, idx) => ({
            pilotId,
            rank: (idx + 1) as 1 | 2 | 3 | 4
          }))
          result.current.submitHeatResults(heat.id, rankings)
        })
      })

      // AC 2, AC 3: Nach Quali-Abschluss werden WB-Heats dynamisch aus winnerPilots generiert
      const { heats: updatedHeats } = useTournamentStore.getState()
      
      // WB-Heats sollten jetzt im heats-Array sein (dynamisch generiert)
      const wbHeats = updatedHeats.filter(h => h.bracketType === 'winner')
      
      expect(wbHeats.length).toBeGreaterThan(0)
    })
  })

  // Story 13-6: Task 9 und Task 10 wurden entfernt
  // generateWBHeatFromPool, canGenerateWBFinale, generateWBFinale existieren nicht mehr
  // WB-Heats werden jetzt automatisch in submitHeatResults() generiert

  describe('Task 8: Nach WB-Heat Abschluss', () => {
    it('sollte Gewinner (Platz 1+2) in winnerPilots behalten', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup: Pool ist leer, nur 1 WB-Heat
      // Create WB heat with 4 pilots
      act(() => {
        const { heats } = useTournamentStore.getState()
        const newHeat: Heat = {
          id: 'wb-heat-1',
          heatNumber: heats.length + 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'active' as const,
          bracketType: 'winner' as const
        }
        useTournamentStore.setState({ heats: [...heats, newHeat] })
      })

      // Complete WB heat
      act(() => {
        const rankings = [
          { pilotId: 'p1', rank: 1 as const },
          { pilotId: 'p2', rank: 2 as const },
          { pilotId: 'p3', rank: 3 as const },
          { pilotId: 'p4', rank: 4 as const }
        ]
        result.current.submitHeatResults('wb-heat-1', rankings)
      })

      // AC 2, AC 3: Gewinner werden zu winnerPilots hinzugefügt
      expect(result.current.winnerPilots).toContain('p1')
      expect(result.current.winnerPilots).toContain('p2')
    })

    it('sollte Verlierer (Platz 3+4) zu Loser Pool hinzufügen', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup: Create WB heat and complete it
      act(() => {
        const { heats } = useTournamentStore.getState()
        const newHeat: Heat = {
          id: 'wb-heat-1',
          heatNumber: heats.length + 1,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          status: 'active' as const,
          bracketType: 'winner' as const
        }
        useTournamentStore.setState({ heats: [...heats, newHeat] })
      })

      act(() => {
        const rankings = [
          { pilotId: 'p1', rank: 1 as const },
          { pilotId: 'p2', rank: 2 as const },
          { pilotId: 'p3', rank: 3 as const },
          { pilotId: 'p4', rank: 4 as const }
        ]
        result.current.submitHeatResults('wb-heat-1', rankings)
      })

      // Losers (3rd+4th) should be added to loser pool
      expect(result.current.loserPool).toContain('p3')
      expect(result.current.loserPool).toContain('p4')
    })
  })
})
