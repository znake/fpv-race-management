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

describe('generateHeats()', () => {
  beforeEach(() => resetStore())
  afterEach(() => {
    cleanup()
    resetStore()
  })

  it('creates an optimal 10-pilot distribution (1×4, 2×3) and assigns everyone exactly once', () => {
    const { result } = renderHook(() => useTournamentStore())

    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.addPilot({
          name: `Pilot ${i + 1}`,
          imageUrl: `https://example.com/pilot${i + 1}.jpg`,
        })
      })
    }

    act(() => {
      result.current.generateHeats(42)
    })

    expect(result.current.heats).toHaveLength(3)
    expect(result.current.heats.map((h) => h.pilotIds).flat()).toHaveLength(10)

    // Heat sizes are 3 or 4
    result.current.heats.forEach((h) => {
      expect([3, 4]).toContain(h.pilotIds.length)
    })

    // Everyone exactly once
    const all = result.current.heats.flatMap((h) => h.pilotIds)
    expect(new Set(all).size).toBe(10)

    // First heat active
    expect(result.current.heats[0].status).toBe('active')
  })
})
