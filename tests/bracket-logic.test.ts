import { describe, it, expect } from 'vitest'

import {
  inferBracketType,
  isGrandFinaleBracketType,
  calculateAvailableWinnerPool,
  getPilotBracketOrigin,
  createWBHeatFromPool,
  createLBHeatFromPool,
} from '@/lib/bracket-logic'

import type { Heat } from '@/types'
import type { Pilot } from '@/lib/schemas'

function makeHeat(partial: Partial<Heat> & Pick<Heat, 'id'>): Heat {
  return {
    heatNumber: 1,
    pilotIds: [],
    status: 'pending',
    ...partial,
  }
}

function makePilot(id: string): Pilot {
  return { id, name: `Pilot ${id}` }
}

describe('inferBracketType', () => {
  it('returns the explicit bracketType when present', () => {
    expect(inferBracketType(makeHeat({ id: 'q1', bracketType: 'loser' }))).toBe('loser')
    expect(inferBracketType(makeHeat({ id: 'wb-heat-1', bracketType: 'grand_finale' }))).toBe('grand_finale')
  })

  it('infers winner for wb-heat- and wb-finale- prefixes', () => {
    expect(inferBracketType(makeHeat({ id: 'wb-heat-1' }))).toBe('winner')
    expect(inferBracketType(makeHeat({ id: 'wb-finale-1' }))).toBe('winner')
  })

  it('infers loser for lb-heat- and lb-finale- prefixes', () => {
    expect(inferBracketType(makeHeat({ id: 'lb-heat-1' }))).toBe('loser')
    expect(inferBracketType(makeHeat({ id: 'lb-finale-1' }))).toBe('loser')
  })

  it('infers grand_finale for the grand-finale prefix and legacy finale ids', () => {
    expect(inferBracketType(makeHeat({ id: 'grand-finale-1' }))).toBe('grand_finale')
    expect(inferBracketType(makeHeat({ id: 'finale-1' }))).toBe('grand_finale')
    expect(inferBracketType(makeHeat({ id: 'finale' }))).toBe('grand_finale')
  })

  it('infers from generic wb-/lb- prefixes and winner/loser substrings (legacy fallback)', () => {
    expect(inferBracketType(makeHeat({ id: 'wb-123' }))).toBe('winner')
    expect(inferBracketType(makeHeat({ id: 'lb-123' }))).toBe('loser')
    expect(inferBracketType(makeHeat({ id: 'some-winner-heat' }))).toBe('winner')
    expect(inferBracketType(makeHeat({ id: 'some-loser-heat' }))).toBe('loser')
  })

  it('defaults to qualification for unknown ids', () => {
    expect(inferBracketType(makeHeat({ id: 'q1' }))).toBe('qualification')
    expect(inferBracketType(makeHeat({ id: 'heat-42' }))).toBe('qualification')
  })
})

describe('isGrandFinaleBracketType', () => {
  it('is true for grand_finale and finale', () => {
    expect(isGrandFinaleBracketType('grand_finale')).toBe(true)
    expect(isGrandFinaleBracketType('finale')).toBe(true)
  })

  it('is false for all other bracket types', () => {
    expect(isGrandFinaleBracketType('winner')).toBe(false)
    expect(isGrandFinaleBracketType('loser')).toBe(false)
    expect(isGrandFinaleBracketType('qualification')).toBe(false)
    expect(isGrandFinaleBracketType(undefined)).toBe(false)
  })
})

describe('calculateAvailableWinnerPool', () => {
  it('returns all winner pilots when there are no heats', () => {
    expect(calculateAvailableWinnerPool(['p1', 'p2'], [])).toEqual(new Set(['p1', 'p2']))
  })

  it('excludes pilots already placed in pending or active winner heats', () => {
    const heats: Heat[] = [
      makeHeat({ id: 'wb-heat-1', bracketType: 'winner', status: 'pending', pilotIds: ['p1', 'p2'] }),
      makeHeat({ id: 'wb-heat-2', bracketType: 'winner', status: 'active', pilotIds: ['p3'] }),
    ]
    expect(calculateAvailableWinnerPool(['p1', 'p2', 'p3', 'p4'], heats)).toEqual(new Set(['p4']))
  })

  it('does not exclude pilots from completed winner heats', () => {
    const heats: Heat[] = [
      makeHeat({ id: 'wb-heat-1', bracketType: 'winner', status: 'completed', pilotIds: ['p1', 'p2'] }),
    ]
    expect(calculateAvailableWinnerPool(['p1', 'p2', 'p3'], heats)).toEqual(new Set(['p1', 'p2', 'p3']))
  })

  it('ignores loser bracket heats', () => {
    const heats: Heat[] = [
      makeHeat({ id: 'lb-heat-1', bracketType: 'loser', status: 'active', pilotIds: ['p1'] }),
    ]
    expect(calculateAvailableWinnerPool(['p1', 'p2'], heats)).toEqual(new Set(['p1', 'p2']))
  })
})

describe('getPilotBracketOrigin', () => {
  it('returns lb when the pilot appears in a loser bracket heat', () => {
    const heats: Heat[] = [makeHeat({ id: 'lb-heat-1', bracketType: 'loser', pilotIds: ['p1'] })]
    expect(getPilotBracketOrigin('p1', heats)).toBe('lb')
  })

  it('returns wb when the pilot never appears in a loser bracket heat', () => {
    const heats: Heat[] = [makeHeat({ id: 'wb-heat-1', bracketType: 'winner', pilotIds: ['p1'] })]
    expect(getPilotBracketOrigin('p1', heats)).toBe('wb')
  })

  it('returns wb when there are no heats at all', () => {
    expect(getPilotBracketOrigin('p1', [])).toBe('wb')
  })
})

describe('createWBHeatFromPool', () => {
  it('returns a null heat and the unchanged pool when fewer than 4 pilots are available', () => {
    const pool = new Set(['p1', 'p2', 'p3'])
    const result = createWBHeatFromPool(pool, [])
    expect(result.heat).toBeNull()
    expect(result.updatedPool).toEqual(pool)
  })

  it('creates a pending winner heat with 4 pilots and removes them from the pool', () => {
    const pool = new Set(['p1', 'p2', 'p3', 'p4'])
    const result = createWBHeatFromPool(pool, [{ heatNumber: 1 }])
    expect(result.heat).not.toBeNull()
    expect(result.heat?.bracketType).toBe('winner')
    expect(result.heat?.status).toBe('pending')
    expect(result.heat?.id.startsWith('wb-heat-')).toBe(true)
    expect(result.heat?.pilotIds).toHaveLength(4)
    expect(new Set(result.heat?.pilotIds)).toEqual(pool)
    expect(result.updatedPool.size).toBe(0)
  })

  it('takes the first 4 pilots in FIFO order and leaves the rest in the pool', () => {
    const pool = new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6'])
    const result = createWBHeatFromPool(pool, [{ heatNumber: 1 }, { heatNumber: 2 }])
    expect(result.heat?.pilotIds).toHaveLength(4)
    expect(result.updatedPool).toEqual(new Set(['p5', 'p6']))
  })

  it('derives the heat number from the current heat count', () => {
    const result = createWBHeatFromPool(
      new Set(['p1', 'p2', 'p3', 'p4']),
      [{ heatNumber: 1 }, { heatNumber: 2 }, { heatNumber: 3 }]
    )
    expect(result.heat?.heatNumber).toBe(4)
  })
})

describe('createLBHeatFromPool', () => {
  it('returns a null heat when the pool is below the default minimum of 4', () => {
    const pool = new Set(['p1', 'p2', 'p3'])
    const result = createLBHeatFromPool(pool, [])
    expect(result.heat).toBeNull()
    expect(result.updatedPool).toEqual(pool)
  })

  it('creates a pending loser heat with 4 pilots by default', () => {
    const pool = new Set(['p1', 'p2', 'p3', 'p4'])
    const result = createLBHeatFromPool(pool, [{ heatNumber: 1 }])
    expect(result.heat).not.toBeNull()
    expect(result.heat?.bracketType).toBe('loser')
    expect(result.heat?.status).toBe('pending')
    expect(result.heat?.id.startsWith('lb-heat-')).toBe(true)
    expect(result.heat?.pilotIds).toHaveLength(4)
    expect(result.updatedPool.size).toBe(0)
  })

  it('accepts a numeric minPilots override for a 3-pilot loser heat', () => {
    const pool = new Set(['p1', 'p2', 'p3'])
    const result = createLBHeatFromPool(pool, [{ heatNumber: 1 }], 3)
    expect(result.heat).not.toBeNull()
    expect(result.heat?.pilotIds).toHaveLength(3)
    expect(result.updatedPool.size).toBe(0)
  })

  it('caps the heat at 4 pilots and leaves the remainder in the pool', () => {
    const pool = new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6'])
    const result = createLBHeatFromPool(pool, [{ heatNumber: 1 }], 4)
    expect(result.heat?.pilotIds).toHaveLength(4)
    expect(result.updatedPool).toEqual(new Set(['p5', 'p6']))
  })

  it('supports the pilots-array overload together with minPilots', () => {
    const pool = new Set(['p1', 'p2', 'p3', 'p4'])
    const result = createLBHeatFromPool(
      pool,
      [{ heatNumber: 1 }],
      [makePilot('p1'), makePilot('p2')],
      4
    )
    expect(result.heat).not.toBeNull()
    expect(result.heat?.pilotIds).toHaveLength(4)
  })
})
