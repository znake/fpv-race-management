import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act, renderHook, cleanup } from '@testing-library/react'
import { useTournamentStore } from '../src/stores/tournamentStore'

// Helper to reset the Zustand store to initial state
const resetStore = () => {
  useTournamentStore.setState({
    pilots: [],
    tournamentStarted: false,
    tournamentPhase: 'setup',
    heats: [],
    currentHeatIndex: 0,
    winnerPilots: [],
    loserPilots: [],
    eliminatedPilots: []
  })
}

// Helper to setup tournament with heats in running phase
const setupRunningTournament = (pilotCount = 12) => {
  const { result } = renderHook(() => useTournamentStore())
  
  // Add pilots
  for (let i = 0; i < pilotCount; i++) {
    act(() => {
      result.current.addPilot({
        name: `Pilot ${i + 1}`,
        imageUrl: `https://example.com/pilot${i + 1}.jpg`
      })
    })
  }
  
  // Start tournament (generates heats, goes to heat-assignment)
  act(() => {
    result.current.confirmTournamentStart()
  })
  
  // Confirm heat assignment (goes to running, activates first heat)
  act(() => {
    result.current.confirmHeatAssignment()
  })
  
  return result
}

describe('Story 4.2: Heat abschließen & Bracket-Progression', () => {
  beforeEach(() => {
    resetStore()
  })

  afterEach(() => {
    cleanup()
    resetStore()
  })

  describe('Bracket Progression Logic', () => {
    it('should assign rank 1+2 to winner bracket', () => {
      const result = setupRunningTournament(8)
      
      const activeHeat = result.current.getActiveHeat()
      const pilotIds = activeHeat!.pilotIds
      
      const rankings = [
        { pilotId: pilotIds[0], rank: 1 as const },
        { pilotId: pilotIds[1], rank: 2 as const },
        { pilotId: pilotIds[2], rank: 3 as const },
        { pilotId: pilotIds[3], rank: 4 as const }
      ]
      
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, rankings)
      })
      
      expect(result.current.winnerPilots).toContain(pilotIds[0])
      expect(result.current.winnerPilots).toContain(pilotIds[1])
      expect(result.current.winnerPilots).not.toContain(pilotIds[2])
      expect(result.current.winnerPilots).not.toContain(pilotIds[3])
    })

    it('should assign rank 3+4 to loser bracket (first loss)', () => {
      const result = setupRunningTournament(8)
      
      const activeHeat = result.current.getActiveHeat()
      const pilotIds = activeHeat!.pilotIds
      
      const rankings = [
        { pilotId: pilotIds[0], rank: 1 as const },
        { pilotId: pilotIds[1], rank: 2 as const },
        { pilotId: pilotIds[2], rank: 3 as const },
        { pilotId: pilotIds[3], rank: 4 as const }
      ]
      
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, rankings)
      })
      
      expect(result.current.loserPilots).toContain(pilotIds[2])
      expect(result.current.loserPilots).toContain(pilotIds[3])
      expect(result.current.loserPilots).not.toContain(pilotIds[0])
      expect(result.current.loserPilots).not.toContain(pilotIds[1])
    })

    it('should eliminate pilots on second loss (already in loser bracket)', () => {
      const result = setupRunningTournament(8)
      
      // Simulate pilot losing first time (goes to loser bracket)
      const pilotId = result.current.heats[0].pilotIds[2]
      act(() => {
        // Add to loser bracket manually to simulate previous loss
        useTournamentStore.setState({ loserPilots: [pilotId] })
      })
      
      const activeHeat = result.current.getActiveHeat()
      const pilotIds = activeHeat!.pilotIds
      
      const rankings = [
        { pilotId: pilotIds[0], rank: 1 as const },
        { pilotId: pilotIds[1], rank: 2 as const },
        { pilotId: pilotId, rank: 3 as const }, // Second loss
        { pilotId: pilotIds[3], rank: 4 as const }
      ]
      
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, rankings)
      })
      
      expect(result.current.eliminatedPilots).toContain(pilotId)
      expect(result.current.loserPilots).not.toContain(pilotId)
    })

    it('should handle 3-pilot heats correctly', () => {
      const result = setupRunningTournament(7) // Will have 3-pilot heats
      
      const threePlayerHeat = result.current.heats.find(h => h.pilotIds.length === 3)
      if (!threePlayerHeat) return
      
      const pilotIds = threePlayerHeat.pilotIds
      
      const rankings = [
        { pilotId: pilotIds[0], rank: 1 as const },
        { pilotId: pilotIds[1], rank: 2 as const },
        { pilotId: pilotIds[2], rank: 3 as const }
      ]
      
      act(() => {
        result.current.submitHeatResults(threePlayerHeat.id, rankings)
      })
      
      // Rang 1+2 → Winner
      expect(result.current.winnerPilots).toContain(pilotIds[0])
      expect(result.current.winnerPilots).toContain(pilotIds[1])
      
      // Rang 3 → Loser
      expect(result.current.loserPilots).toContain(pilotIds[2])
      expect(result.current.winnerPilots).not.toContain(pilotIds[2])
    })

    it('should correctly update bracket on resubmission (edit mode)', () => {
      const result = setupRunningTournament(8)
      
      const activeHeat = result.current.getActiveHeat()
      const pilotIds = activeHeat!.pilotIds
      
      // First submission
      const firstRankings = [
        { pilotId: pilotIds[0], rank: 1 as const },
        { pilotId: pilotIds[1], rank: 2 as const }
      ]
      
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, firstRankings)
      })
      
      expect(result.current.winnerPilots).toContain(pilotIds[0])
      expect(result.current.winnerPilots).toContain(pilotIds[1])
      
      // Edit mode: different rankings
      const updatedRankings = [
        { pilotId: pilotIds[1], rank: 1 as const },
        { pilotId: pilotIds[2], rank: 2 as const }
      ]
      
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, updatedRankings)
      })
      
      // Should only contain new winners
      expect(result.current.winnerPilots).toContain(pilotIds[1])
      expect(result.current.winnerPilots).toContain(pilotIds[2])
      expect(result.current.winnerPilots).not.toContain(pilotIds[0])
    })
  })

  describe('reopenHeat Action', () => {
    it('should reopen completed heat to active status', () => {
      const result = setupRunningTournament(8)
      
      const activeHeat = result.current.getActiveHeat()
      
      // Complete the heat first
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, [
          { pilotId: activeHeat!.pilotIds[0], rank: 1 },
          { pilotId: activeHeat!.pilotIds[1], rank: 2 }
        ])
      })
      
      const completedHeat = result.current.heats.find(h => h.id === activeHeat!.id)
      expect(completedHeat!.status).toBe('completed')
      
      // Reopen the heat
      act(() => {
        result.current.reopenHeat(completedHeat!.id)
      })
      
      const reopenedHeat = result.current.heats.find(h => h.id === completedHeat!.id)
      expect(reopenedHeat!.status).toBe('active')
      expect(result.current.currentHeatIndex).toBe(result.current.heats.findIndex(h => h.id === completedHeat!.id))
    })

    it('should deactivate current active heat when reopening', () => {
      const result = setupRunningTournament(8)
      
      const firstHeat = result.current.getActiveHeat()
      
      // Complete first heat
      act(() => {
        result.current.submitHeatResults(firstHeat!.id, [
          { pilotId: firstHeat!.pilotIds[0], rank: 1 },
          { pilotId: firstHeat!.pilotIds[1], rank: 2 }
        ])
      })
      
      const secondHeat = result.current.getActiveHeat()
      expect(secondHeat!.status).toBe('active')
      
      // Reopen the first heat
      act(() => {
        result.current.reopenHeat(firstHeat!.id)
      })
      
      // First heat should be active again
      const reopenedFirst = result.current.heats.find(h => h.id === firstHeat!.id)
      expect(reopenedFirst!.status).toBe('active')
      
      // Second heat should be pending again
      const updatedSecond = result.current.heats.find(h => h.id === secondHeat!.id)
      expect(updatedSecond!.status).toBe('pending')
    })

    it('should ignore reopen for non-completed heats', () => {
      const result = setupRunningTournament(8)
      
      const activeHeat = result.current.getActiveHeat()
      const originalStatus = activeHeat!.status
      const originalIndex = result.current.currentHeatIndex
      
      // Try to reopen an active heat (should be ignored)
      act(() => {
        result.current.reopenHeat(activeHeat!.id)
      })
      
      const unchangedHeat = result.current.heats.find(h => h.id === activeHeat!.id)
      expect(unchangedHeat!.status).toBe(originalStatus)
      expect(result.current.currentHeatIndex).toBe(originalIndex)
    })

    it('should ignore reopen for invalid heat ID', () => {
      const result = setupRunningTournament(8)
      
      const originalHeats = [...result.current.heats]
      const originalIndex = result.current.currentHeatIndex
      
      act(() => {
        result.current.reopenHeat('invalid-heat-id')
      })
      
      expect(result.current.heats.map(h => h.status)).toEqual(originalHeats.map(h => h.status))
      expect(result.current.currentHeatIndex).toBe(originalIndex)
    })
  })

  describe('Tournament State Transitions', () => {
    it('should remain in running phase when reopening completed heat', () => {
      const result = setupRunningTournament(8)
      
      const activeHeat = result.current.getActiveHeat()
      
      // Complete the heat first
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, [
          { pilotId: activeHeat!.pilotIds[0], rank: 1 },
          { pilotId: activeHeat!.pilotIds[1], rank: 2 }
        ])
      })
      
      expect(result.current.tournamentPhase).toBe('running')
      
      // Reopen the heat
      act(() => {
        result.current.reopenHeat(activeHeat!.id)
      })
      
      expect(result.current.tournamentPhase).toBe('running')
    })

    it('should not transition to finale when reopening heat in otherwise completed tournament', () => {
      const result = setupRunningTournament(8)
      
      // Complete all heats
      while (result.current.getActiveHeat()) {
        const activeHeat = result.current.getActiveHeat()!
        act(() => {
          result.current.submitHeatResults(activeHeat.id, [
            { pilotId: activeHeat.pilotIds[0], rank: 1 },
            { pilotId: activeHeat.pilotIds[1], rank: 2 }
          ])
        })
      }
      
      expect(result.current.tournamentPhase).toBe('finale')
      
      // Reopen the first completed heat
      const firstCompleted = result.current.heats.find(h => h.status === 'completed')
      act(() => {
        result.current.reopenHeat(firstCompleted!.id)
      })
      
      // Should go back to running since not all heats are completed anymore
      expect(result.current.tournamentPhase).toBe('running')
    })
  })

  describe('Store Reset and Clear Operations', () => {
    it('should reset bracket states when resetting tournament', () => {
      const result = setupRunningTournament(8)
      
      const activeHeat = result.current.getActiveHeat()
      
      // Complete heat and populate bracket states
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, [
          { pilotId: activeHeat!.pilotIds[0], rank: 1 },
          { pilotId: activeHeat!.pilotIds[1], rank: 2 },
          { pilotId: activeHeat!.pilotIds[2], rank: 3 },
          { pilotId: activeHeat!.pilotIds[3], rank: 4 }
        ])
      })
      
      expect(result.current.winnerPilots.length).toBeGreaterThan(0)
      expect(result.current.loserPilots.length).toBeGreaterThan(0)
      
      // Reset tournament
      act(() => {
        result.current.resetTournament()
      })
      
      expect(result.current.winnerPilots).toEqual([])
      expect(result.current.loserPilots).toEqual([])
      expect(result.current.eliminatedPilots).toEqual([])
    })

    it('should reset bracket states when clearing all pilots (before tournament)', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // Add pilots
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.addPilot({
            name: `Pilot ${i + 1}`,
            imageUrl: `https://example.com/pilot${i + 1}.jpg`
          })
        }
      })
      
      // Start and complete a heat
      act(() => {
        result.current.confirmTournamentStart()
        result.current.confirmHeatAssignment()
      })
      
      const activeHeat = result.current.getActiveHeat()
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, [
          { pilotId: activeHeat!.pilotIds[0], rank: 1 },
          { pilotId: activeHeat!.pilotIds[1], rank: 2 }
        ])
      })
      
      expect(result.current.winnerPilots.length).toBeGreaterThan(0)
      
      // Reset tournament first (to enable clearing pilots)
      act(() => {
        result.current.resetTournament()
      })
      
      // Clear all pilots
      act(() => {
        result.current.clearAllPilots()
      })
      
      expect(result.current.winnerPilots).toEqual([])
      expect(result.current.loserPilots).toEqual([])
      expect(result.current.eliminatedPilots).toEqual([])
    })
  })
})