import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTournamentStore } from '../src/stores/tournamentStore'

describe('Dynamic Brackets - Phase 1: Store Erweiterung', () => {
  beforeEach(() => {
    // Reset store before each test
    const { resetAll } = useTournamentStore.getState()
    resetAll()
  })

  describe('Task 1: winnerPool State', () => {
    it('sollte winnerPool als leeres Array initialisieren', () => {
      const { result } = renderHook(() => useTournamentStore())
      expect(result.current.winnerPool).toEqual([])
    })

    it('sollte winnerPool über resetTournament leeren', () => {
      const { result } = renderHook(() => useTournamentStore())

      act(() => {
        // Simulieren dass piloten im Pool sind (indem wir die state manipulieren)
        result.current.winnerPool.push('pilot-1', 'pilot-2')
      })

      expect(result.current.winnerPool.length).toBeGreaterThan(0)

      act(() => {
        result.current.resetTournament()
      })

      expect(result.current.winnerPool).toEqual([])
    })
  })

  describe('Task 2: loserPool State (bereits vorhanden)', () => {
    it('sollte loserPool als leeres Array initialisieren', () => {
      const { result } = renderHook(() => useTournamentStore())
      expect(result.current.loserPool).toEqual([])
    })
  })

  describe('Task 3: grandFinalePool State', () => {
    it('sollte grandFinalePool als leeres Array initialisieren', () => {
      const { result } = renderHook(() => useTournamentStore())
      expect(result.current.grandFinalePool).toEqual([])
    })

    it('sollte grandFinalePool über resetTournament leeren', () => {
      const { result } = renderHook(() => useTournamentStore())

      act(() => {
        result.current.grandFinalePool.push('pilot-1', 'pilot-2')
      })

      expect(result.current.grandFinalePool.length).toBeGreaterThan(0)

      act(() => {
        result.current.resetTournament()
      })

      expect(result.current.grandFinalePool).toEqual([])
    })
  })

  describe('Task 4: eliminatedPilots State (bereits vorhanden)', () => {
    it('sollte eliminatedPilots als leeres Array initialisieren', () => {
      const { result } = renderHook(() => useTournamentStore())
      expect(result.current.eliminatedPilots).toEqual([])
    })
  })

  describe('Task 5: Status-Flags', () => {
    it('sollte isQualificationComplete als false initialisieren', () => {
      const { result } = renderHook(() => useTournamentStore())
      expect(result.current.isQualificationComplete).toBe(false)
    })

    it('sollte isWBFinaleComplete als false initialisieren', () => {
      const { result } = renderHook(() => useTournamentStore())
      expect(result.current.isWBFinaleComplete).toBe(false)
    })

    it('sollte isLBFinaleComplete als false initialisieren', () => {
      const { result } = renderHook(() => useTournamentStore())
      expect(result.current.isLBFinaleComplete).toBe(false)
    })

    it('sollte isGrandFinaleComplete als false initialisieren', () => {
      const { result } = renderHook(() => useTournamentStore())
      expect(result.current.isGrandFinaleComplete).toBe(false)
    })

    it('sollte Status-Flags über resetTournament leeren', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Simulieren dass Flags true sind
      act(() => {
        const store = useTournamentStore.getState()
        store.isQualificationComplete = true
        store.isWBFinaleComplete = true
        store.isLBFinaleComplete = true
        store.isGrandFinaleComplete = true
      })

      act(() => {
        result.current.resetTournament()
      })

      expect(result.current.isQualificationComplete).toBe(false)
      expect(result.current.isWBFinaleComplete).toBe(false)
      expect(result.current.isLBFinaleComplete).toBe(false)
      expect(result.current.isGrandFinaleComplete).toBe(false)
    })
  })

  describe('Task 6: Pool Actions', () => {
    describe('addToWinnerPool', () => {
      it('sollte Piloten am Ende des winnerPool anfügen (FIFO)', () => {
        const { result } = renderHook(() => useTournamentStore())

        act(() => {
          result.current.addToWinnerPool(['pilot-1', 'pilot-2'])
          result.current.addToWinnerPool(['pilot-3'])
        })

        expect(result.current.winnerPool).toEqual(['pilot-1', 'pilot-2', 'pilot-3'])
      })

      it('sollte keine Duplikate hinzufügen', () => {
        const { result } = renderHook(() => useTournamentStore())

        act(() => {
          result.current.addToWinnerPool(['pilot-1'])
          result.current.addToWinnerPool(['pilot-1', 'pilot-2'])
        })

        expect(result.current.winnerPool).toEqual(['pilot-1', 'pilot-2'])
      })
    })

    describe('removeFromWinnerPool', () => {
      it('sollte die ersten N Piloten aus dem Pool nehmen (FIFO)', () => {
        const { result } = renderHook(() => useTournamentStore())

        act(() => {
          result.current.addToWinnerPool(['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4', 'pilot-5'])
          result.current.removeFromWinnerPool(2)
        })

        expect(result.current.winnerPool).toEqual(['pilot-3', 'pilot-4', 'pilot-5'])
      })

      it('sollte keine Fehler werfen wenn Pool kleiner als count', () => {
        const { result } = renderHook(() => useTournamentStore())

        act(() => {
          result.current.addToWinnerPool(['pilot-1', 'pilot-2'])
          // Versuche mehr zu entfernen als vorhanden
          result.current.removeFromWinnerPool(5)
        })

        expect(result.current.winnerPool).toEqual([])
      })
    })

    describe('eliminatePilots', () => {
      it('sollte Piloten zu eliminatedPilots hinzufügen', () => {
        const { result } = renderHook(() => useTournamentStore())

        act(() => {
          result.current.eliminatePilots(['pilot-1', 'pilot-2'])
        })

        expect(result.current.eliminatedPilots).toContain('pilot-1')
        expect(result.current.eliminatedPilots).toContain('pilot-2')
      })

      it('sollte eliminierte Piloten aus loserPool entfernen', () => {
        const { result } = renderHook(() => useTournamentStore())

        act(() => {
          result.current.addToLoserPool(['pilot-1', 'pilot-2', 'pilot-3'])
          result.current.eliminatePilots(['pilot-2'])
        })

        expect(result.current.loserPool).toEqual(['pilot-1', 'pilot-3'])
        expect(result.current.eliminatedPilots).toContain('pilot-2')
      })
    })
  })
})
