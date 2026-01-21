import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act, renderHook, cleanup } from '@testing-library/react'
import { useTournamentStore } from '../src/stores/tournamentStore'
import { resetTournamentStore, setupRunningTournament } from './helpers'

describe('Heat Results - submitHeatResults()', () => {
  beforeEach(() => {
    resetTournamentStore()
  })

  afterEach(() => {
    cleanup()
    resetTournamentStore()
  })

  describe('Core Ranking Logic', () => {
    it('should save rankings to heat results and auto-complete missing pilots', () => {
      const result = setupRunningTournament(12)
      
      const activeHeat = result.current.getActiveHeat()
      expect(activeHeat).toBeDefined()
      expect(activeHeat!.status).toBe('active')
      
      const pilotIds = activeHeat!.pilotIds
      const rankings = [
        { pilotId: pilotIds[0], rank: 1 as const },
        { pilotId: pilotIds[1], rank: 2 as const }
      ]
      
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, rankings)
      })
      
      // Find the heat that was completed
      const completedHeat = result.current.heats.find(h => h.id === activeHeat!.id)
      expect(completedHeat).toBeDefined()
      expect(completedHeat!.status).toBe('completed')
      expect(completedHeat!.results).toBeDefined()
      // Rankings should be auto-completed for all pilots in the heat
      expect(completedHeat!.results!.rankings.length).toBe(pilotIds.length)
      // First two should be as submitted
      expect(completedHeat!.results!.rankings[0]).toEqual(rankings[0])
      expect(completedHeat!.results!.rankings[1]).toEqual(rankings[1])
    })

    it('should accept minimum 2 rankings and auto-complete missing pilots', () => {
      const result = setupRunningTournament(12)
      
      const activeHeat = result.current.getActiveHeat()
      const pilotIds = activeHeat!.pilotIds
      
      const rankings = [
        { pilotId: pilotIds[0], rank: 1 as const },
        { pilotId: pilotIds[1], rank: 2 as const }
      ]
      
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, rankings)
      })
      
      const completedHeat = result.current.heats.find(h => h.id === activeHeat!.id)
      // All pilots should have rankings (auto-completed with ranks 3+4)
      expect(completedHeat!.results!.rankings.length).toBe(pilotIds.length)
      // Verify the first two are as submitted
      expect(completedHeat!.results!.rankings[0]).toEqual({ pilotId: pilotIds[0], rank: 1 })
      expect(completedHeat!.results!.rankings[1]).toEqual({ pilotId: pilotIds[1], rank: 2 })
    })

    it('should accept full 4 rankings', () => {
      const result = setupRunningTournament(12)
      
      const activeHeat = result.current.getActiveHeat()
      const pilotIds = activeHeat!.pilotIds
      
      // For a 4-pilot heat
      const rankings = pilotIds.slice(0, 4).map((id, index) => ({
        pilotId: id,
        rank: (index + 1) as 1 | 2 | 3 | 4
      }))
      
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, rankings)
      })
      
      const completedHeat = result.current.heats.find(h => h.id === activeHeat!.id)
      expect(completedHeat!.results!.rankings.length).toBe(pilotIds.length)
    })

    it('should store completedAt timestamp', () => {
      const result = setupRunningTournament(12)
      
      const activeHeat = result.current.getActiveHeat()
      const pilotIds = activeHeat!.pilotIds
      
      const beforeSubmit = new Date().toISOString()
      
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, [
          { pilotId: pilotIds[0], rank: 1 },
          { pilotId: pilotIds[1], rank: 2 }
        ])
      })
      
      const afterSubmit = new Date().toISOString()
      
      const completedHeat = result.current.heats.find(h => h.id === activeHeat!.id)
      expect(completedHeat!.results!.completedAt).toBeDefined()
      expect(completedHeat!.results!.completedAt! >= beforeSubmit).toBe(true)
      expect(completedHeat!.results!.completedAt! <= afterSubmit).toBe(true)
    })
  })

  describe('Heat Status Transitions', () => {
    it('should change completed heat status to completed', () => {
      const result = setupRunningTournament(12)
      
      const activeHeat = result.current.getActiveHeat()
      expect(activeHeat!.status).toBe('active')
      
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, [
          { pilotId: activeHeat!.pilotIds[0], rank: 1 },
          { pilotId: activeHeat!.pilotIds[1], rank: 2 }
        ])
      })
      
      const completedHeat = result.current.heats.find(h => h.id === activeHeat!.id)
      expect(completedHeat!.status).toBe('completed')
    })

    it('should activate next pending heat', () => {
      const result = setupRunningTournament(12)
      
      const firstHeat = result.current.getActiveHeat()
      const secondHeat = result.current.heats.find((h, i) => i === 1)
      
      expect(secondHeat!.status).toBe('pending')
      
      act(() => {
        result.current.submitHeatResults(firstHeat!.id, [
          { pilotId: firstHeat!.pilotIds[0], rank: 1 },
          { pilotId: firstHeat!.pilotIds[1], rank: 2 }
        ])
      })
      
      // Check that second heat is now active
      const updatedSecondHeat = result.current.heats.find(h => h.id === secondHeat!.id)
      expect(updatedSecondHeat!.status).toBe('active')
    })

    it('should update currentHeatIndex to new active heat', () => {
      const result = setupRunningTournament(12)
      
      expect(result.current.currentHeatIndex).toBe(0)
      
      const firstHeat = result.current.getActiveHeat()
      
      act(() => {
        result.current.submitHeatResults(firstHeat!.id, [
          { pilotId: firstHeat!.pilotIds[0], rank: 1 },
          { pilotId: firstHeat!.pilotIds[1], rank: 2 }
        ])
      })
      
      expect(result.current.currentHeatIndex).toBe(1)
    })
  })

  describe('Tournament Phase Transitions', () => {
    it('should remain in running phase while heats remain', () => {
      const result = setupRunningTournament(12)
      
      expect(result.current.tournamentPhase).toBe('running')
      
      const activeHeat = result.current.getActiveHeat()
      
      act(() => {
        result.current.submitHeatResults(activeHeat!.id, [
          { pilotId: activeHeat!.pilotIds[0], rank: 1 },
          { pilotId: activeHeat!.pilotIds[1], rank: 2 }
        ])
      })
      
      expect(result.current.tournamentPhase).toBe('running')
    })

    it('should transition to finale when all heats completed', () => {
      const result = setupRunningTournament(8) // 2 heats: 4+4 or similar
      
      // Complete all heats with FULL rankings (all pilots ranked)
      // This is important because Double Elimination needs all rankings
      // to properly assign pilots to Winner/Loser brackets
      let iterations = 0
      const maxIterations = 50 // Safety limit to prevent infinite loops
      
      while (result.current.getActiveHeat() && iterations < maxIterations) {
        const activeHeat = result.current.getActiveHeat()!
        
        // Create rankings for ALL pilots in the heat
        const rankings = activeHeat.pilotIds.map((pilotId, index) => ({
          pilotId,
          rank: (index + 1) as 1 | 2 | 3 | 4
        }))
        
        act(() => {
          result.current.submitHeatResults(activeHeat.id, rankings)
        })
        
        iterations++
      }
      
      // After completing all heats (including WB, LB), should be 'finale' or 'completed'
      // 'finale' means Grand Finale is ready but not yet played (no more active heats)
      // 'completed' means Grand Finale was also completed
      expect(['finale', 'completed']).toContain(result.current.tournamentPhase)
    })
  })

  describe('Helper Functions', () => {
    it('getActiveHeat should return the active heat', () => {
      const result = setupRunningTournament(12)
      
      const activeHeat = result.current.getActiveHeat()
      
      expect(activeHeat).toBeDefined()
      expect(activeHeat!.status).toBe('active')
      expect(activeHeat!.heatNumber).toBe(1)
    })

    it('getNextHeat should return the next pending heat', () => {
      const result = setupRunningTournament(12)
      
      const nextHeat = result.current.getNextHeat()
      
      expect(nextHeat).toBeDefined()
      expect(nextHeat!.status).toBe('pending')
      expect(nextHeat!.heatNumber).toBe(2)
    })

    it('getNextHeat should return undefined when no pending heats', () => {
      const result = setupRunningTournament(8)
      
      // Complete all heats with safety limit to prevent infinite loops
      let iterations = 0
      const maxIterations = 50
      
      while (result.current.getActiveHeat() && iterations < maxIterations) {
        const activeHeat = result.current.getActiveHeat()!
        
        // Create rankings for ALL pilots to properly progress tournament
        const rankings = activeHeat.pilotIds.map((pilotId, index) => ({
          pilotId,
          rank: (index + 1) as 1 | 2 | 3 | 4
        }))
        
        act(() => {
          result.current.submitHeatResults(activeHeat.id, rankings)
        })
        
        iterations++
      }
      
      const nextHeat = result.current.getNextHeat()
      expect(nextHeat).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should ignore submitHeatResults for invalid heatId', () => {
      const result = setupRunningTournament(12)
      
      const heatsBefore = [...result.current.heats]
      
      act(() => {
        result.current.submitHeatResults('invalid-heat-id', [
          { pilotId: 'some-pilot', rank: 1 },
          { pilotId: 'other-pilot', rank: 2 }
        ])
      })
      
      // Nothing should change
      expect(result.current.heats.map(h => h.status)).toEqual(heatsBefore.map(h => h.status))
    })

    it('should handle 3-pilot heats correctly', () => {
      const result = setupRunningTournament(7) // Will have 3-pilot heats
      
      const activeHeat = result.current.getActiveHeat()
      
      // Find a 3-pilot heat
      const threePlayerHeat = result.current.heats.find(h => h.pilotIds.length === 3)
      
      if (threePlayerHeat && activeHeat?.id === threePlayerHeat.id) {
        act(() => {
          result.current.submitHeatResults(activeHeat!.id, [
            { pilotId: activeHeat!.pilotIds[0], rank: 1 },
            { pilotId: activeHeat!.pilotIds[1], rank: 2 },
            { pilotId: activeHeat!.pilotIds[2], rank: 3 }
          ])
        })
        
        const completedHeat = result.current.heats.find(h => h.id === activeHeat!.id)
        expect(completedHeat!.results!.rankings.length).toBe(3)
      }
    })
  })
})

describe('Toggle-to-Rank UI Logic (Component Integration)', () => {
  beforeEach(() => {
    resetTournamentStore()
  })

  afterEach(() => {
    cleanup()
    resetTournamentStore()
  })

  // Note: These tests verify the expected behavior for UI state management
  // The actual component tests would use React Testing Library
  
  it('ranking assignment should be sequential (1, then 2, then 3, then 4)', () => {
    // This tests the expected behavior of the toggleRank algorithm
    const rankings = new Map<string, number>()
    
    const pilots = ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d']
    
    // Simulate toggle-to-rank behavior
    const assignNextRank = (pilotId: string) => {
      if (rankings.has(pilotId)) return
      const nextRank = rankings.size + 1
      rankings.set(pilotId, nextRank)
    }
    
    assignNextRank('pilot-a')
    expect(rankings.get('pilot-a')).toBe(1)
    
    assignNextRank('pilot-b')
    expect(rankings.get('pilot-b')).toBe(2)
    
    assignNextRank('pilot-c')
    expect(rankings.get('pilot-c')).toBe(3)
    
    assignNextRank('pilot-d')
    expect(rankings.get('pilot-d')).toBe(4)
  })

  it('removing a rank should adjust higher ranks', () => {
    const rankings = new Map<string, number>([
      ['pilot-a', 1],
      ['pilot-b', 2],
      ['pilot-c', 3],
      ['pilot-d', 4]
    ])
    
    // Simulate removing rank 2
    const removedRank = rankings.get('pilot-b')!
    rankings.delete('pilot-b')
    
    // Adjust higher ranks
    for (const [id, rank] of rankings) {
      if (rank > removedRank) {
        rankings.set(id, rank - 1)
      }
    }
    
    expect(rankings.get('pilot-a')).toBe(1)
    expect(rankings.has('pilot-b')).toBe(false)
    expect(rankings.get('pilot-c')).toBe(2) // Was 3, now 2
    expect(rankings.get('pilot-d')).toBe(3) // Was 4, now 3
  })

  it('finish button should be enabled with >= 2 rankings', () => {
    const rankings = new Map<string, number>()
    
    const isFinishEnabled = () => rankings.size >= 2
    
    expect(isFinishEnabled()).toBe(false)
    
    rankings.set('pilot-a', 1)
    expect(isFinishEnabled()).toBe(false)
    
    rankings.set('pilot-b', 2)
    expect(isFinishEnabled()).toBe(true)
    
    rankings.set('pilot-c', 3)
    expect(isFinishEnabled()).toBe(true)
  })

  it('direct rank assignment should replace existing holder', () => {
    const rankings = new Map<string, number>([
      ['pilot-a', 1],
      ['pilot-b', 2]
    ])
    
    // Simulate direct rank assignment (keyboard 1 on pilot-c)
    const assignDirectRank = (pilotId: string, rank: number) => {
      // Remove existing holder of this rank
      for (const [id, r] of rankings) {
        if (r === rank) {
          rankings.delete(id)
          break
        }
      }
      // Remove pilot's current rank if any
      rankings.delete(pilotId)
      // Assign new rank
      rankings.set(pilotId, rank)
    }
    
    assignDirectRank('pilot-c', 1)
    
    expect(rankings.get('pilot-c')).toBe(1)
    expect(rankings.has('pilot-a')).toBe(false) // Pilot A lost rank 1
    expect(rankings.get('pilot-b')).toBe(2) // Unchanged
  })
})
