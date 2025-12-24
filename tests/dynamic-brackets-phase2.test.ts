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

    it('sollte alle Gewinner (Platz 1+2) in WB Pool sammeln und WB-Heats generieren', () => {
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

      // AC 2, AC 3: Gewinner werden zu WB Pool gesammelt und sofort zu WB-Heats verarbeitet
      // Pool sollte 0 sein wenn genau 4 Gewinner vorhanden waren (= 1 WB Heat generiert)
      // Mit 8 Piloten: 2 Quali-Heats × 2 Gewinner = 4 Gewinner → 1 WB Heat → Pool leer
      expect(result.current.winnerPool.length).toBe(0)
      
      // Es sollte mind. 1 WB-Heat generiert worden sein
      const { heats: updatedHeats } = useTournamentStore.getState()
      const wbHeats = updatedHeats.filter(h => h.bracketType === 'winner')
      expect(wbHeats.length).toBeGreaterThan(0)
    })

    it('sollte WB Heat erstellen wenn Pool >= 4 Piloten hat', () => {
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

      // AC 2, AC 3: Nach Quali-Abschluss werden WB-Heats dynamisch aus Pool generiert
      const { heats: updatedHeats } = useTournamentStore.getState()
      
      // WB-Heats sollten jetzt im heats-Array sein (dynamisch generiert)
      const wbHeats = updatedHeats.filter(h => h.bracketType === 'winner')
      
      expect(wbHeats.length).toBeGreaterThan(0)
      // winnerPool sollte leer sein (alle Gewinner wurden zu WB-Heats verarbeitet)
      expect(result.current.winnerPool.length).toBe(0)
    })
  })

  describe('Task 9: generateWBHeat() aus Pool (FIFO)', () => {
    it('sollte WB Heat aus Pool erstellen wenn Pool >= 4 Piloten hat', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup: Add 4 pilots to winner pool
      act(() => {
        result.current.addToWinnerPool(['p1', 'p2', 'p3', 'p4'])
      })

      expect(result.current.winnerPool.length).toBe(4)

      // Generate WB heat
      let wbHeat: Heat | null = null
      act(() => {
        wbHeat = result.current.generateWBHeatFromPool()
      })

      // Should have created a heat
      expect(wbHeat).not.toBeNull()
      expect(wbHeat!.bracketType).toBe('winner')
      expect(wbHeat!.pilotIds).toEqual(['p1', 'p2', 'p3', 'p4'])

      // Pool should be empty
      expect(result.current.winnerPool.length).toBe(0)
    })

    it('sollte FIFO verwenden - erste Piloten zuerst', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup: Add 6 pilots to winner pool
      act(() => {
        result.current.addToWinnerPool(['p1', 'p2', 'p3', 'p4', 'p5', 'p6'])
      })

      expect(result.current.winnerPool.length).toBe(6)

      // Generate WB heat
      let wbHeat: Heat | null = null
      act(() => {
        wbHeat = result.current.generateWBHeatFromPool()
      })

      // Should take first 4 pilots (FIFO)
      expect(wbHeat!.pilotIds).toEqual(['p1', 'p2', 'p3', 'p4'])

      // Remaining pilots should be p5, p6
      expect(result.current.winnerPool).toEqual(['p5', 'p6'])
    })

    it('sollte null zurückgeben wenn Pool < 4 Piloten hat', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup: Add only 3 pilots to winner pool
      act(() => {
        result.current.addToWinnerPool(['p1', 'p2', 'p3'])
      })

      // Try to generate WB heat
      let wbHeat: Heat | null = null
      act(() => {
        wbHeat = result.current.generateWBHeatFromPool()
      })

      // Should return null
      expect(wbHeat).toBeNull()

      // Pool should remain unchanged
      expect(result.current.winnerPool).toEqual(['p1', 'p2', 'p3'])
    })
  })

  describe('Task 10: WB Finale Erkennung & Generierung', () => {
    it('sollte WB Finale erkennen wenn Pool nur 2 Piloten hat', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup: Simulate qualification complete and add 2 pilots to winner pool
      act(() => {
        // Manually set isQualificationComplete for unit test
        useTournamentStore.setState({ isQualificationComplete: true })
        result.current.addToWinnerPool(['p1', 'p2'])
      })

      expect(result.current.winnerPool.length).toBe(2)
      expect(result.current.isQualificationComplete).toBe(true)

      // generateWBHeatFromPool should return null (not enough for regular heat)
      let regularHeat: Heat | null = null
      act(() => {
        regularHeat = result.current.generateWBHeatFromPool()
      })

      expect(regularHeat).toBeNull()

      // canGenerateWBFinale should return true
      expect(result.current.canGenerateWBFinale()).toBe(true)
    })

    it('sollte WB Finale Heat generieren mit 2 Piloten', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup: Simulate qualification complete and add 2 pilots to winner pool
      act(() => {
        useTournamentStore.setState({ isQualificationComplete: true })
        result.current.addToWinnerPool(['p1', 'p2'])
      })

      // Generate WB finale
      let wbFinale: Heat | null = null
      act(() => {
        wbFinale = result.current.generateWBFinale()
      })

      expect(wbFinale).not.toBeNull()
      expect(wbFinale!.bracketType).toBe('winner')
      expect(wbFinale!.isFinale).toBe(true)
      expect(wbFinale!.pilotIds).toEqual(['p1', 'p2'])

      // Pool should be empty
      expect(result.current.winnerPool.length).toBe(0)
    })

    it('sollte kein WB Finale generieren wenn Pool >= 4 Piloten hat', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup: Simulate qualification complete and add 4 pilots
      act(() => {
        useTournamentStore.setState({ isQualificationComplete: true })
        result.current.addToWinnerPool(['p1', 'p2', 'p3', 'p4'])
      })

      // canGenerateWBFinale should return false (should generate regular heat instead)
      expect(result.current.canGenerateWBFinale()).toBe(false)
    })

    it('sollte kein WB Finale generieren wenn Qualification nicht abgeschlossen', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup: Add 2 pilots but qualification NOT complete
      act(() => {
        result.current.addToWinnerPool(['p1', 'p2'])
      })

      expect(result.current.isQualificationComplete).toBe(false)

      // canGenerateWBFinale should return false
      expect(result.current.canGenerateWBFinale()).toBe(false)
    })
  })

  describe('Task 8: Nach WB-Heat Abschluss Pool füllen', () => {
    it('sollte Gewinner (Platz 1+2) zu WB Pool hinzufügen oder zu neuem WB-Heat verarbeiten', () => {
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

      // AC 2, AC 3: Gewinner werden zu Pool hinzugefügt
      // Da nur 2 Gewinner (< 4), sollten sie im Pool bleiben (kein neuer WB-Heat generiert)
      expect(result.current.winnerPool).toContain('p1')
      expect(result.current.winnerPool).toContain('p2')
      expect(result.current.winnerPool.length).toBe(2)
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
