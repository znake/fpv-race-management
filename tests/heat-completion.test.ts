/**
 * Tests für heat-completion.ts - Pure Functions
 *
 * Story 1.6: submitHeatResults() aufteilen
 */

import { describe, it, expect } from 'vitest'
import {
  processQualiHeatCompletion,
  processWBHeatCompletion,
  processLBHeatCompletion,
  processFinaleCompletion,
  activateNextPendingHeat,
  autoGenerateLBHeat,
  determineNextPhase,
  determineCurrentHeatIndex,
  type HeatCompletionState
} from '../src/lib/heat-completion'
import type { Heat } from '../src/types'
import type { FullBracketStructure } from '../src/lib/bracket-structure-generator'
import type { Ranking } from '../src/lib/schemas'

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

// Helper to create mock rankings
function createMockRankings(): Ranking[] {
  return [
    { pilotId: 'pilot-1', rank: 1 },
    { pilotId: 'pilot-2', rank: 2 },
    { pilotId: 'pilot-3', rank: 3 },
    { pilotId: 'pilot-4', rank: 4 }
  ]
}

// Helper to create a mock state
function createMockState(overrides: Partial<HeatCompletionState> = {}): HeatCompletionState {
  return {
    heats: [createMockHeat()],
    fullBracketStructure: null,
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

describe('processQualiHeatCompletion', () => {
  it('should assign winners to winnerPilots and losers to loserPilots', () => {
    const heat = createMockHeat({ bracketType: 'qualification' })
    const rankings = createMockRankings()
    const state = createMockState()

    const result = processQualiHeatCompletion(heat, rankings, state, 0, false)

    expect(result.updatedWinnerPilots).toEqual(['pilot-1', 'pilot-2'])
    expect(result.updatedLoserPilots).toEqual(['pilot-3', 'pilot-4'])
    expect(result.updatedEliminatedPilots).toEqual([])
  })

  it('should eliminate pilot on second loss', () => {
    const heat = createMockHeat({ bracketType: 'qualification' })
    const rankings = createMockRankings()
    const state = createMockState({
      loserPilots: ['pilot-3'] // pilot-3 already lost once
    })

    const result = processQualiHeatCompletion(heat, rankings, state, 0, false)

    expect(result.updatedLoserPilots).not.toContain('pilot-3')
    expect(result.updatedEliminatedPilots).toContain('pilot-3')
  })

  it('should mark heat as completed with results', () => {
    const heat = createMockHeat({ bracketType: 'qualification' })
    const rankings = createMockRankings()
    const state = createMockState()

    const result = processQualiHeatCompletion(heat, rankings, state, 0, false)

    expect(result.updatedHeats[0].status).toBe('completed')
    expect(result.updatedHeats[0].results).toBeDefined()
    expect(result.updatedHeats[0].results?.rankings).toEqual(rankings)
  })

  it('should set completedBracketType to qualifier', () => {
    const heat = createMockHeat({ bracketType: 'qualification' })
    const rankings = createMockRankings()
    const state = createMockState()

    const result = processQualiHeatCompletion(heat, rankings, state, 0, false)

    expect(result.completedBracketType).toBe('qualifier')
  })
})

describe('processWBHeatCompletion', () => {
  it('should add WB winners to winnerPool', () => {
    const heat = createMockHeat({ bracketType: 'winner', id: 'wb-heat-1' })
    const rankings = createMockRankings()
    const state = createMockState({
      heats: [heat],
      winnerPool: []
    })

    const result = processWBHeatCompletion(heat, rankings, state, 0, 'winner', false)

    expect(result.updatedWinnerPool).toContain('pilot-1')
    expect(result.updatedWinnerPool).toContain('pilot-2')
  })

  it('should move WB losers to loserPool', () => {
    const heat = createMockHeat({ bracketType: 'winner', id: 'wb-heat-1' })
    const rankings = createMockRankings()
    const state = createMockState({
      heats: [heat],
      loserPool: []
    })

    const result = processWBHeatCompletion(heat, rankings, state, 0, 'winner', false)

    expect(result.updatedLoserPool).toContain('pilot-3')
    expect(result.updatedLoserPool).toContain('pilot-4')
  })

  it('should eliminate LB losers', () => {
    const heat = createMockHeat({ bracketType: 'loser', id: 'lb-heat-1' })
    const rankings = createMockRankings()
    const state = createMockState({
      heats: [heat],
      loserPilots: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
      loserPool: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4']
    })

    const result = processWBHeatCompletion(heat, rankings, state, 0, 'loser', false)

    expect(result.updatedEliminatedPilots).toContain('pilot-3')
    expect(result.updatedEliminatedPilots).toContain('pilot-4')
    expect(result.updatedLoserPool).not.toContain('pilot-3')
    expect(result.updatedLoserPool).not.toContain('pilot-4')
  })

  it('should keep LB winners in loserPool', () => {
    const heat = createMockHeat({ bracketType: 'loser', id: 'lb-heat-1' })
    const rankings = createMockRankings()
    const state = createMockState({
      heats: [heat],
      loserPool: ['pilot-1', 'pilot-2']
    })

    const result = processWBHeatCompletion(heat, rankings, state, 0, 'loser', false)

    expect(result.updatedLoserPool).toContain('pilot-1')
    expect(result.updatedLoserPool).toContain('pilot-2')
  })

  it('should set completedBracketType correctly', () => {
    const wbHeat = createMockHeat({ bracketType: 'winner', id: 'wb-heat-1' })
    const rankings = createMockRankings()
    const state = createMockState({ heats: [wbHeat] })

    const wbResult = processWBHeatCompletion(wbHeat, rankings, state, 0, 'winner', false)
    expect(wbResult.completedBracketType).toBe('winner')

    const lbHeat = createMockHeat({ bracketType: 'loser', id: 'lb-heat-1' })
    const lbState = createMockState({ heats: [lbHeat] })
    const lbResult = processWBHeatCompletion(lbHeat, rankings, lbState, 0, 'loser', false)
    expect(lbResult.completedBracketType).toBe('loser')
  })
})

describe('processLBHeatCompletion', () => {
  it('should add LB winners back to pool', () => {
    const rankings = createMockRankings()
    const heat = createMockHeat()
    const state = createMockState({
      heats: [heat],
      loserPool: []
    })

    const result = processLBHeatCompletion(heat, rankings, state, 0, false)

    expect(result.updatedLoserPool).toContain('pilot-1')
    expect(result.updatedLoserPool).toContain('pilot-2')
  })

  it('should remove LB losers from pool and eliminate them', () => {
    const rankings = createMockRankings()
    const heat = createMockHeat()
    const state = createMockState({
      heats: [heat],
      loserPool: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4']
    })

    const result = processLBHeatCompletion(heat, rankings, state, 0, false)

    expect(result.updatedLoserPool).not.toContain('pilot-3')
    expect(result.updatedLoserPool).not.toContain('pilot-4')
    expect(result.updatedEliminatedPilots).toContain('pilot-3')
    expect(result.updatedEliminatedPilots).toContain('pilot-4')
  })
})

describe('processFinaleCompletion', () => {
  it('should set phase to completed', () => {
    const rankings = createMockRankings()
    const heat = createMockHeat({ bracketType: 'grand_finale', id: 'finale-1' })
    const state = createMockState({
      heats: [heat],
      fullBracketStructure: {
        qualification: { heats: [] },
        winnerBracket: { rounds: [] },
        loserBracket: { rounds: [] },
        grandFinale: {
          id: 'finale-1',
          heatNumber: 1,
          roundNumber: 1,
          bracketType: 'finale',
          pilotIds: [],
          status: 'active',
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }
      }
    })

    const result = processFinaleCompletion(rankings, state, 0)

    expect(result.newPhase).toBe('completed')
    expect(result.isComplete).toBe(true)
  })

  it('should mark finale as completed in bracket structure', () => {
    const rankings = createMockRankings()
    const heat = createMockHeat({ bracketType: 'grand_finale', id: 'finale-1' })
    const bracketStructure: FullBracketStructure = {
      qualification: { heats: [] },
      winnerBracket: { rounds: [] },
      loserBracket: { rounds: [] },
      grandFinale: {
        id: 'finale-1',
        heatNumber: 1,
        roundNumber: 1,
        bracketType: 'finale',
        pilotIds: [],
        status: 'active',
        sourceHeats: [],
        position: { x: 0, y: 0 }
      }
    }
    const state = createMockState({
      heats: [heat],
      fullBracketStructure: bracketStructure
    })

    const result = processFinaleCompletion(rankings, state, 0)

    expect(result.updatedStructure?.grandFinale?.status).toBe('completed')
  })
})

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

describe('autoGenerateLBHeat', () => {
  it('should not generate LB heat if pool is too small', () => {
    const state = createMockState({
      loserPool: [],
      fullBracketStructure: null
    })
    const pool = new Set<string>()

    const result = autoGenerateLBHeat(state, pool, [])

    expect(result.heat).toBeNull()
  })

  it('should generate LB heat if pool has 4 pilots', () => {
    const state = createMockState({
      loserPool: [],
      fullBracketStructure: null,
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
      fullBracketStructure: {
        qualification: { heats: [] },
        winnerBracket: {
          rounds: [{
            id: 'wb-round-1',
            roundNumber: 1,
            roundName: 'WB Round 1',
            heats: [{
              id: 'wb-1',
              heatNumber: 1,
              roundNumber: 1,
              bracketType: 'winner',
              pilotIds: ['p1', 'p2'],
              status: 'active',
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        },
        loserBracket: { rounds: [] },
        grandFinale: null
      },
      tournamentPhase: 'running'
    })

    // 3 pilots - should NOT generate when WB is active
    const pool3 = new Set(['pilot-1', 'pilot-2', 'pilot-3'])
    const result3 = autoGenerateLBHeat(state, pool3, [])
    expect(result3.heat).toBeNull()

    // 4 pilots - should generate when WB is active
    const pool4 = new Set(['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'])
    const result4 = autoGenerateLBHeat(state, pool4, [])
    expect(result4.heat).not.toBeNull()
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
