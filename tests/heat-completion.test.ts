/**
 * Tests für heat-completion.ts - Pure Functions
 *
 * Phase 4 REFACTORED: fullBracketStructure entfernt
 * Story 1.6: submitHeatResults() aufteilen
 */

import { describe, it, expect } from 'vitest'
import {
  activateNextPendingHeat,
  autoGenerateLBHeat,
  determineNextPhase,
  determineCurrentHeatIndex,
  checkHasActiveWBHeats,
  type HeatCompletionState
} from '../src/lib/heat-completion'
import type { Heat } from '../src/types'

// Helper to create a mock heat
function createMockHeat(overrides: Partial<Heat> = {}): Heat {
  return {
    id: 'heat-1',
    heatNumber: 1,
    pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
    status: 'active',
    bracketType: 'qualification',
    ...overrides
  }
}

// Helper to create a mock state (ohne fullBracketStructure)
function createMockState(overrides: Partial<HeatCompletionState> = {}): HeatCompletionState {
  return {
    heats: [createMockHeat()],
    winnerPilots: [],
    loserPilots: [],
    eliminatedPilots: [],
    winnerPool: [],
    loserPool: [],
    isQualificationComplete: false,
    tournamentPhase: 'running',
    ...overrides
  }
}

describe('activateNextPendingHeat', () => {
  it('should activate next pending heat after current', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'heat-1', status: 'completed' }),
      createMockHeat({ id: 'heat-2', status: 'pending' }),
      createMockHeat({ id: 'heat-3', status: 'pending' })
    ]

    const result = activateNextPendingHeat(heats, 0)

    expect(result[1].status).toBe('active')
  })

  it('should activate first pending heat if no next pending', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'heat-1', status: 'pending' }),
      createMockHeat({ id: 'heat-2', status: 'pending' })
    ]

    const result = activateNextPendingHeat(heats, -1)

    expect(result[0].status).toBe('active')
  })

  it('should not change anything if no pending heats', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'heat-1', status: 'completed' }),
      createMockHeat({ id: 'heat-2', status: 'completed' })
    ]

    const result = activateNextPendingHeat(heats, 0)

    expect(result.every((h: Heat) => h.status !== 'active')).toBe(true)
  })
})

describe('checkHasActiveWBHeats', () => {
  it('should return true if there are pending WB heats', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'wb-1', bracketType: 'winner', status: 'pending' })
    ]

    expect(checkHasActiveWBHeats(heats)).toBe(true)
  })

  it('should return true if there are active WB heats', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'wb-1', bracketType: 'winner', status: 'active' })
    ]

    expect(checkHasActiveWBHeats(heats)).toBe(true)
  })

  it('should return false if all WB heats are completed', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'wb-1', bracketType: 'winner', status: 'completed' })
    ]

    expect(checkHasActiveWBHeats(heats)).toBe(false)
  })

  it('should return false if no WB heats exist', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'quali-1', bracketType: 'qualification', status: 'completed' })
    ]

    expect(checkHasActiveWBHeats(heats)).toBe(false)
  })
})

describe('autoGenerateLBHeat', () => {
  it('should not generate LB heat if pool is too small', () => {
    const state = createMockState({
      loserPool: []
    })
    const pool = new Set<string>()

    const result = autoGenerateLBHeat(state, pool, [])

    expect(result.heat).toBeNull()
  })

  it('should generate LB heat if pool has 4 pilots', () => {
    const state = createMockState({
      loserPool: [],
      tournamentPhase: 'running'
    })
    const pool = new Set(['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'])

    const result = autoGenerateLBHeat(state, pool, [])

    expect(result.heat).not.toBeNull()
    expect(result.heat?.bracketType).toBe('loser')
    expect(result.updatedPool.size).toBe(0) // All pilots removed from pool
  })

  it('should require 4 pilots when WB is active', () => {
    const state = createMockState({
      loserPool: [],
      tournamentPhase: 'running'
    })

    // WB heat is active
    const heats: Heat[] = [
      createMockHeat({ id: 'wb-1', bracketType: 'winner', status: 'active' })
    ]

    // 3 pilots - should NOT generate when WB is active
    const pool3 = new Set(['pilot-1', 'pilot-2', 'pilot-3'])
    const result3 = autoGenerateLBHeat(state, pool3, heats)
    expect(result3.heat).toBeNull()

    // 4 pilots - should generate when WB is active
    const pool4 = new Set(['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'])
    const result4 = autoGenerateLBHeat(state, pool4, heats)
    expect(result4.heat).not.toBeNull()
  })

  it('should allow 3 pilots when WB is complete', () => {
    const state = createMockState({
      loserPool: [],
      tournamentPhase: 'running'
    })

    // All WB heats are completed
    const heats: Heat[] = [
      createMockHeat({ id: 'wb-1', bracketType: 'winner', status: 'completed' })
    ]

    // 3 pilots - should generate when WB is complete
    const pool3 = new Set(['pilot-1', 'pilot-2', 'pilot-3'])
    const result3 = autoGenerateLBHeat(state, pool3, heats)
    expect(result3.heat).not.toBeNull()
    expect(result3.heat?.pilotIds.length).toBe(3)
  })
})

describe('determineNextPhase', () => {
  it('should return completed for finale', () => {
    const heats: Heat[] = [createMockHeat()]
    const result = determineNextPhase(heats, 'running', 'finale')

    expect(result).toBe('completed')
  })

  it('should return completed for grand_finale', () => {
    const heats: Heat[] = [createMockHeat()]
    const result = determineNextPhase(heats, 'running', 'grand_finale')

    expect(result).toBe('completed')
  })

  it('should return finale when all heats are completed', () => {
    const heats: Heat[] = [
      createMockHeat({ status: 'completed' }),
      createMockHeat({ status: 'completed' })
    ]
    const result = determineNextPhase(heats, 'running', 'winner')

    expect(result).toBe('finale')
  })

  it('should keep current phase when heats are pending', () => {
    const heats: Heat[] = [
      createMockHeat({ status: 'completed' }),
      createMockHeat({ status: 'pending' })
    ]
    const result = determineNextPhase(heats, 'running', 'winner')

    expect(result).toBe('running')
  })

  it('should keep completed phase', () => {
    const heats: Heat[] = [createMockHeat()]
    const result = determineNextPhase(heats, 'completed', 'winner')

    expect(result).toBe('completed')
  })

  it('should keep finale phase', () => {
    const heats: Heat[] = [createMockHeat()]
    const result = determineNextPhase(heats, 'finale', 'winner')

    expect(result).toBe('finale')
  })
})

describe('determineCurrentHeatIndex', () => {
  it('should return index of active heat', () => {
    const heats: Heat[] = [
      createMockHeat({ status: 'completed' }),
      createMockHeat({ status: 'active' }),
      createMockHeat({ status: 'pending' })
    ]

    const result = determineCurrentHeatIndex(heats)

    expect(result).toBe(1)
  })

  it('should return last index when no active heat', () => {
    const heats: Heat[] = [
      createMockHeat({ status: 'completed' }),
      createMockHeat({ status: 'completed' })
    ]

    const result = determineCurrentHeatIndex(heats)

    expect(result).toBe(1)
  })

  it('should return 0 for single heat array', () => {
    const heats: Heat[] = [createMockHeat({ status: 'active' })]

    const result = determineCurrentHeatIndex(heats)

    expect(result).toBe(0)
  })
})
