import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act, renderHook, cleanup } from '@testing-library/react'
import { useTournamentStore } from '../src/stores/tournamentStore'

const resetStore = () => {
  useTournamentStore.setState({
    pilots: [],
    tournamentStarted: false,
    tournamentPhase: 'setup',
    heats: [],
    currentHeatIndex: 0,
  })
}

// Helper to create test pilots
const createTestPilots = (count: number) => {
  const pilots: Array<{ name: string; imageUrl: string }> = []
  for (let i = 0; i < count; i++) {
    pilots.push({
      name: `Pilot ${i + 1}`,
      imageUrl: `https://example.com/pilot${i + 1}.jpg`,
    })
  }
  return pilots
}

describe('Heat Assignment Actions (Story 3.3)', () => {
  beforeEach(() => resetStore())
  afterEach(() => {
    cleanup()
    resetStore()
  })

  describe('shuffleHeats()', () => {
    it('shuffles pilot assignments while maintaining heat sizes', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Add 10 pilots and generate heats
      const pilots = createTestPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42) // Use seed for reproducibility
      })

      // Get initial distribution
      const initialHeats = result.current.heats.map(h => [...h.pilotIds])
      const initialSizes = initialHeats.map(h => h.length)

      // Shuffle
      act(() => {
        result.current.shuffleHeats()
      })

      // Verify heat sizes are preserved
      const newSizes = result.current.heats.map(h => h.pilotIds.length)
      expect(newSizes).toEqual(initialSizes)

      // Verify all pilots are still present
      const allPilotIds = result.current.heats.flatMap(h => h.pilotIds)
      expect(new Set(allPilotIds).size).toBe(10)
    })

    it('produces different results when shuffled (no seed)', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Add pilots and generate heats
      const pilots = createTestPilots(20)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42)
      })

      const initialAssignment = result.current.heats.map(h => [...h.pilotIds])

      // Shuffle multiple times - at least one should be different
      let foundDifferent = false
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.shuffleHeats()
        })
        const newAssignment = result.current.heats.map(h => [...h.pilotIds])
        if (JSON.stringify(initialAssignment) !== JSON.stringify(newAssignment)) {
          foundDifferent = true
          break
        }
      }
      expect(foundDifferent).toBe(true)
    })
  })

  describe('swapPilots()', () => {
    it('swaps two pilots between different heats', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Add pilots and generate heats
      const pilots = createTestPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42)
      })

      // Get two pilots from different heats
      const heat1 = result.current.heats[0]
      const heat2 = result.current.heats[1]
      const pilot1Id = heat1.pilotIds[0]
      const pilot2Id = heat2.pilotIds[0]

      // Swap
      act(() => {
        result.current.swapPilots(pilot1Id, pilot2Id)
      })

      // Verify swap occurred
      expect(result.current.heats[0].pilotIds).toContain(pilot2Id)
      expect(result.current.heats[1].pilotIds).toContain(pilot1Id)
      expect(result.current.heats[0].pilotIds).not.toContain(pilot1Id)
      expect(result.current.heats[1].pilotIds).not.toContain(pilot2Id)
    })

    it('does not swap pilots in the same heat', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Add pilots and generate heats
      const pilots = createTestPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42)
      })

      // Get two pilots from the same heat
      const heat1 = result.current.heats[0]
      const pilot1Id = heat1.pilotIds[0]
      const pilot2Id = heat1.pilotIds[1]
      const originalOrder = [...heat1.pilotIds]

      // Attempt swap
      act(() => {
        result.current.swapPilots(pilot1Id, pilot2Id)
      })

      // Verify no swap occurred
      expect(result.current.heats[0].pilotIds).toEqual(originalOrder)
    })

    it('handles non-existent pilot IDs gracefully', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Add pilots and generate heats
      const pilots = createTestPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42)
      })

      const originalHeats = result.current.heats.map(h => [...h.pilotIds])

      // Attempt swap with invalid ID
      act(() => {
        result.current.swapPilots('invalid-id', result.current.heats[0].pilotIds[0])
      })

      // Verify no change
      expect(result.current.heats.map(h => [...h.pilotIds])).toEqual(originalHeats)
    })
  })

  describe('confirmHeatAssignment()', () => {
    it('sets tournament phase to running', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup tournament in heat-assignment phase
      const pilots = createTestPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.confirmTournamentStart()
      })

      expect(result.current.tournamentPhase).toBe('heat-assignment')

      // Confirm heat assignment
      act(() => {
        result.current.confirmHeatAssignment()
      })

      expect(result.current.tournamentPhase).toBe('running')
    })

    it('activates the first heat', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup tournament
      const pilots = createTestPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.confirmTournamentStart()
      })

      // Confirm heat assignment
      act(() => {
        result.current.confirmHeatAssignment()
      })

      // First heat should be active
      expect(result.current.heats[0].status).toBe('active')
      // Other heats should be pending
      result.current.heats.slice(1).forEach(heat => {
        expect(heat.status).toBe('pending')
      })
    })

    it('sets currentHeatIndex to 0', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup tournament
      const pilots = createTestPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.confirmTournamentStart()
        result.current.confirmHeatAssignment()
      })

      expect(result.current.currentHeatIndex).toBe(0)
    })
  })

  describe('cancelHeatAssignment()', () => {
    it('clears all heats', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup tournament
      const pilots = createTestPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.confirmTournamentStart()
      })

      expect(result.current.heats.length).toBeGreaterThan(0)

      // Cancel
      act(() => {
        result.current.cancelHeatAssignment()
      })

      expect(result.current.heats).toEqual([])
    })

    it('resets tournament phase to setup', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup tournament
      const pilots = createTestPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.confirmTournamentStart()
      })

      expect(result.current.tournamentPhase).toBe('heat-assignment')

      // Cancel
      act(() => {
        result.current.cancelHeatAssignment()
      })

      expect(result.current.tournamentPhase).toBe('setup')
    })

    it('resets tournamentStarted to false', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup tournament
      const pilots = createTestPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.confirmTournamentStart()
      })

      expect(result.current.tournamentStarted).toBe(true)

      // Cancel
      act(() => {
        result.current.cancelHeatAssignment()
      })

      expect(result.current.tournamentStarted).toBe(false)
    })

    it('allows adding pilots again after cancel', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup tournament
      const pilots = createTestPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.confirmTournamentStart()
        result.current.cancelHeatAssignment()
      })

      // Should be able to add a new pilot
      act(() => {
        const success = result.current.addPilot({
          name: 'New Pilot',
          imageUrl: 'https://example.com/new.jpg'
        })
        expect(success).toBe(true)
      })

      expect(result.current.pilots.length).toBe(11)
    })
  })
})
