import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTournamentStore } from '../src/stores/tournamentStore'

describe('Dynamic Brackets - Phase 1: Store Erweiterung', () => {
  beforeEach(() => {
    // Reset store before each test
    const { resetAll } = useTournamentStore.getState()
    resetAll()
  })

  // Story 13-6: Task 1 (winnerPool State) wurde entfernt
  // winnerPool wird jetzt dynamisch aus winnerPilots berechnet, nicht mehr als State persistiert

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
    // Story 13-6: addToWinnerPool und removeFromWinnerPool wurden entfernt
    // winnerPool wird jetzt dynamisch aus winnerPilots berechnet

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
