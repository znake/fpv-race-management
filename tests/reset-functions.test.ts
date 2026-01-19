import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act, renderHook, cleanup } from '@testing-library/react'
import { useTournamentStore } from '../src/stores/tournamentStore'
import { resetTournamentStore, setupTournamentWithPilots, setupRunningTournament } from './helpers'

describe('Story 7.1: Reset-Funktionen', () => {
  beforeEach(() => {
    resetTournamentStore()
    // Clear localStorage before each test
    localStorage.removeItem('tournament-storage')
  })

  afterEach(() => {
    cleanup()
    localStorage.removeItem('tournament-storage')
  })

  describe('resetTournament()', () => {
    it('should reset tournament but keep pilots', () => {
      // Setup: Running tournament with 12 pilots
      const result = setupRunningTournament(12)
      
      expect(result.current.pilots.length).toBe(12)
      expect(result.current.tournamentPhase).toBe('running')
      expect(result.current.tournamentStarted).toBe(true)
      expect(result.current.heats.length).toBeGreaterThan(0)
      
      // Execute: Reset tournament
      act(() => {
        result.current.resetTournament()
      })
      
      // Verify: Pilots still there, tournament reset
      expect(result.current.pilots.length).toBe(12)
      expect(result.current.tournamentPhase).toBe('setup')
      expect(result.current.tournamentStarted).toBe(false)
      expect(result.current.heats.length).toBe(0)
      expect(result.current.currentHeatIndex).toBe(0)
      expect(result.current.winnerPilots.length).toBe(0)
      expect(result.current.loserPilots.length).toBe(0)
      expect(result.current.eliminatedPilots.length).toBe(0)
    })

    it('should allow starting new tournament after reset', () => {
      // Setup: Running tournament with 12 pilots
      const result = setupRunningTournament(12)
      
      // Reset tournament
      act(() => {
        result.current.resetTournament()
      })
      
      // Verify: Can start new tournament
      expect(result.current.tournamentPhase).toBe('setup')
      expect(result.current.pilots.length).toBe(12)
      
      // Start new tournament
      act(() => {
        const success = result.current.confirmTournamentStart()
        expect(success).toBe(true)
      })
      
      expect(result.current.tournamentPhase).toBe('heat-assignment')
      expect(result.current.heats.length).toBeGreaterThan(0)
    })

    it('should reset bracket progression state', () => {
      // Setup: Running tournament
      const result = setupRunningTournament(12)
      
      // Complete a heat to populate bracket state
      const activeHeat = result.current.getActiveHeat()
      if (activeHeat) {
        act(() => {
          result.current.submitHeatResults(activeHeat.id, [
            { pilotId: activeHeat.pilotIds[0], rank: 1 },
            { pilotId: activeHeat.pilotIds[1], rank: 2 },
            { pilotId: activeHeat.pilotIds[2], rank: 3 },
            { pilotId: activeHeat.pilotIds[3], rank: 4 }
          ])
        })
      }
      
      // Verify bracket state is populated
      expect(result.current.winnerPilots.length).toBeGreaterThan(0)
      expect(result.current.loserPilots.length).toBeGreaterThan(0)
      
      // Reset tournament
      act(() => {
        result.current.resetTournament()
      })
      
      // Verify bracket state is cleared
      expect(result.current.winnerPilots.length).toBe(0)
      expect(result.current.loserPilots.length).toBe(0)
      expect(result.current.eliminatedPilots.length).toBe(0)
    })
  })

  describe('deleteAllPilots()', () => {
    it('should delete all pilots and reset tournament', () => {
      // Setup: Running tournament with 12 pilots
      const result = setupRunningTournament(12)
      
      expect(result.current.pilots.length).toBe(12)
      expect(result.current.tournamentPhase).toBe('running')
      
      // Execute: Delete all pilots
      act(() => {
        result.current.deleteAllPilots()
      })
      
      // Verify: Everything is cleared
      expect(result.current.pilots.length).toBe(0)
      expect(result.current.heats.length).toBe(0)
      expect(result.current.tournamentPhase).toBe('setup')
      expect(result.current.tournamentStarted).toBe(false)
      expect(result.current.currentHeatIndex).toBe(0)
    })

    it('should work when only pilots exist (no tournament)', () => {
      // Setup: Just add pilots, no tournament
      const result = setupTournamentWithPilots(8)
      
      expect(result.current.pilots.length).toBe(8)
      expect(result.current.tournamentPhase).toBe('setup')
      expect(result.current.tournamentStarted).toBe(false)
      
      // Execute: Delete all pilots
      act(() => {
        result.current.deleteAllPilots()
      })
      
      // Verify: Pilots cleared
      expect(result.current.pilots.length).toBe(0)
      expect(result.current.tournamentPhase).toBe('setup')
    })

    it('should allow adding new pilots after delete', () => {
      // Setup: Pilots exist
      const result = setupTournamentWithPilots(5)
      
      // Delete all
      act(() => {
        result.current.deleteAllPilots()
      })
      
      expect(result.current.pilots.length).toBe(0)
      
      // Add new pilot
      act(() => {
        result.current.addPilot({
          name: 'New Pilot',
          imageUrl: 'https://example.com/new.jpg'
        })
      })
      
      expect(result.current.pilots.length).toBe(1)
      expect(result.current.pilots[0].name).toBe('New Pilot')
    })
  })

  describe('resetAll()', () => {
    it('should reset everything to initial state', () => {
      // Setup: Running tournament with 12 pilots and some results
      const result = setupRunningTournament(12)
      
      // Complete a heat
      const activeHeat = result.current.getActiveHeat()
      if (activeHeat) {
        act(() => {
          result.current.submitHeatResults(activeHeat.id, [
            { pilotId: activeHeat.pilotIds[0], rank: 1 },
            { pilotId: activeHeat.pilotIds[1], rank: 2 },
            { pilotId: activeHeat.pilotIds[2], rank: 3 },
            { pilotId: activeHeat.pilotIds[3], rank: 4 }
          ])
        })
      }
      
      // Verify state has data
      expect(result.current.pilots.length).toBe(12)
      expect(result.current.heats.length).toBeGreaterThan(0)
      
      // Execute: Reset all
      act(() => {
        result.current.resetAll()
      })
      
      // Verify: Complete reset
      expect(result.current.pilots.length).toBe(0)
      expect(result.current.heats.length).toBe(0)
      expect(result.current.tournamentPhase).toBe('setup')
      expect(result.current.tournamentStarted).toBe(false)
      expect(result.current.currentHeatIndex).toBe(0)
      expect(result.current.winnerPilots.length).toBe(0)
      expect(result.current.loserPilots.length).toBe(0)
      expect(result.current.eliminatedPilots.length).toBe(0)
    })

    it('should clear localStorage', () => {
      // Setup: Running tournament
      const result = setupRunningTournament(12)
      
      // Force persist to localStorage (Zustand persist middleware)
      // Note: In tests, persist might be disabled, so we test the localStorage.removeItem call
      localStorage.setItem('tournament-storage', JSON.stringify({ state: { pilots: [] } }))
      
      // Execute: Reset all
      act(() => {
        result.current.resetAll()
      })
      
      // Verify: localStorage is cleared
      expect(localStorage.getItem('tournament-storage')).toBeNull()
    })

    it('should work from empty state', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // State is already empty
      expect(result.current.pilots.length).toBe(0)
      
      // Execute: Reset all (should not throw)
      act(() => {
        result.current.resetAll()
      })
      
      // Verify: Still in initial state
      expect(result.current.pilots.length).toBe(0)
      expect(result.current.tournamentPhase).toBe('setup')
    })
  })

  describe('Edge Cases', () => {
    it('resetTournament during heat-assignment phase', () => {
      const result = setupTournamentWithPilots(12)
      
      // Start tournament (goes to heat-assignment)
      act(() => {
        result.current.confirmTournamentStart()
      })
      
      expect(result.current.tournamentPhase).toBe('heat-assignment')
      
      // Reset during heat-assignment
      act(() => {
        result.current.resetTournament()
      })
      
      expect(result.current.tournamentPhase).toBe('setup')
      expect(result.current.pilots.length).toBe(12)
      expect(result.current.heats.length).toBe(0)
    })

    it('multiple resets should be idempotent', () => {
      const result = setupRunningTournament(12)
      
      // Reset multiple times
      act(() => {
        result.current.resetTournament()
        result.current.resetTournament()
        result.current.resetTournament()
      })
      
      // State should be consistent
      expect(result.current.pilots.length).toBe(12)
      expect(result.current.tournamentPhase).toBe('setup')
      expect(result.current.heats.length).toBe(0)
    })

    it('deleteAllPilots then resetAll should work', () => {
      const result = setupRunningTournament(12)
      
      // First delete pilots
      act(() => {
        result.current.deleteAllPilots()
      })
      
      expect(result.current.pilots.length).toBe(0)
      
      // Then reset all
      act(() => {
        result.current.resetAll()
      })
      
      // Should still be in clean state
      expect(result.current.pilots.length).toBe(0)
      expect(result.current.tournamentPhase).toBe('setup')
    })
  })
})
