import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act, renderHook, cleanup } from '@testing-library/react'
import { useTournamentStore } from '@/stores/tournamentStore'
import { resetTournamentStore, createMockPilots, resetMockPilotCounter } from './helpers'

describe('Heat Assignment Actions (Story 3.3)', () => {
  beforeEach(() => {
    resetMockPilotCounter()
    resetTournamentStore()
  })
  afterEach(() => {
    cleanup()
    resetTournamentStore()
  })

  describe('shuffleHeats()', () => {
    it('shuffles pilot assignments while maintaining heat sizes', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Add 10 pilots and generate heats
      const pilots = createMockPilots(10)
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
      const pilots = createMockPilots(20)
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

  describe('movePilotToHeat()', () => {
    it('moves pilot from source heat to target heat', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Add pilots and generate heats
      const pilots = createMockPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42)
      })

      // Get pilot from heat 1 and heat 2
      const heat1 = result.current.heats[0]
      const heat2 = result.current.heats[1]
      const pilotToMove = heat1.pilotIds[0]

      // Move pilot from heat 1 to heat 2
      act(() => {
        result.current.movePilotToHeat(pilotToMove, heat2.id)
      })

      // Assert: pilot is in heat2.pilotIds, not in heat1.pilotIds
      expect(result.current.heats[1].pilotIds).toContain(pilotToMove)
      expect(result.current.heats[0].pilotIds).not.toContain(pilotToMove)
    })

    it('removes pilot from source heat pilotIds', () => {
      const { result } = renderHook(() => useTournamentStore())

      const pilots = createMockPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42)
      })

      const heat1 = result.current.heats[0]
      const heat2 = result.current.heats[1]
      const originalHeat1Size = heat1.pilotIds.length
      const pilotToMove = heat1.pilotIds[0]

      act(() => {
        result.current.movePilotToHeat(pilotToMove, heat2.id)
      })

      // Assert: source heat's pilotIds array is shorter by 1
      expect(result.current.heats[0].pilotIds.length).toBe(originalHeat1Size - 1)
    })

    it('adds pilot to target heat pilotIds', () => {
      const { result } = renderHook(() => useTournamentStore())

      const pilots = createMockPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42)
      })

      const heat1 = result.current.heats[0]
      const heat2 = result.current.heats[1]
      const originalHeat2Size = heat2.pilotIds.length
      const pilotToMove = heat1.pilotIds[0]

      act(() => {
        result.current.movePilotToHeat(pilotToMove, heat2.id)
      })

      // Assert: target heat's pilotIds array is longer by 1
      expect(result.current.heats[1].pilotIds.length).toBe(originalHeat2Size + 1)
    })

    it('does nothing when source and target are the same heat', () => {
      const { result } = renderHook(() => useTournamentStore())

      const pilots = createMockPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42)
      })

      const heat1 = result.current.heats[0]
      const pilotToMove = heat1.pilotIds[0]
      const originalHeats = result.current.heats.map(h => [...h.pilotIds])

      // Try to move pilot to same heat
      act(() => {
        result.current.movePilotToHeat(pilotToMove, heat1.id)
      })

      // Assert: heats unchanged
      expect(result.current.heats.map(h => [...h.pilotIds])).toEqual(originalHeats)
    })

    it('does nothing when pilotId does not exist', () => {
      const { result } = renderHook(() => useTournamentStore())

      const pilots = createMockPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42)
      })

      const heat2 = result.current.heats[1]
      const originalHeats = result.current.heats.map(h => [...h.pilotIds])

      // Try to move non-existent pilot
      act(() => {
        result.current.movePilotToHeat('invalid-id', heat2.id)
      })

      // Assert: heats unchanged
      expect(result.current.heats.map(h => [...h.pilotIds])).toEqual(originalHeats)
    })

    it('does nothing when targetHeatId does not exist', () => {
      const { result } = renderHook(() => useTournamentStore())

      const pilots = createMockPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42)
      })

      const heat1 = result.current.heats[0]
      const pilotToMove = heat1.pilotIds[0]
      const originalHeats = result.current.heats.map(h => [...h.pilotIds])

      // Try to move to non-existent heat
      act(() => {
        result.current.movePilotToHeat(pilotToMove, 'invalid-heat-id')
      })

      // Assert: heats unchanged
      expect(result.current.heats.map(h => [...h.pilotIds])).toEqual(originalHeats)
    })

    it('allows more than 4 pilots in target heat', () => {
      const { result } = renderHook(() => useTournamentStore())

      const pilots = createMockPilots(10)
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42)
      })

      // Heat 0 should have 4 pilots, let's move pilots from other heats to it
      const heat0 = result.current.heats[0]
      const heat1 = result.current.heats[1]
      const pilotToMove = heat1.pilotIds[0]

      act(() => {
        result.current.movePilotToHeat(pilotToMove, heat0.id)
      })

      // Assert: heat now has 5 pilots (no error)
      expect(result.current.heats[0].pilotIds.length).toBe(5)
    })

    it('allows source heat to become empty', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Create a scenario with a small heat (3 pilots)
      const pilots = createMockPilots(7) // Creates 1x4 + 1x3 heats
      act(() => {
        pilots.forEach(p => result.current.addPilot(p))
        result.current.generateHeats(42)
      })

      // Find the 3-pilot heat and move all pilots away
      const smallHeat = result.current.heats.find(h => h.pilotIds.length === 3)!
      const largeHeat = result.current.heats.find(h => h.pilotIds.length === 4)!
      const pilotsToMove = [...smallHeat.pilotIds]

      act(() => {
        pilotsToMove.forEach(pilotId => {
          result.current.movePilotToHeat(pilotId, largeHeat.id)
        })
      })

      // Assert: source heat has 0 pilots, still exists
      const emptyHeat = result.current.heats.find(h => h.id === smallHeat.id)
      expect(emptyHeat).toBeDefined()
      expect(emptyHeat!.pilotIds.length).toBe(0)
    })
  })

  describe('confirmHeatAssignment()', () => {
    it('sets tournament phase to running', () => {
      const { result } = renderHook(() => useTournamentStore())

      // Setup tournament in heat-assignment phase
      const pilots = createMockPilots(10)
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
      const pilots = createMockPilots(10)
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
      const pilots = createMockPilots(10)
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
      const pilots = createMockPilots(10)
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
      const pilots = createMockPilots(10)
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
      const pilots = createMockPilots(10)
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
      const pilots = createMockPilots(10)
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
