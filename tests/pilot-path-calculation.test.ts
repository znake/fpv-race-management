import { describe, it, expect } from 'vitest'
import { calculatePilotPath, assignPilotColor, isEliminatedInHeat, SYNTHWAVE_COLORS } from '../src/lib/pilot-path-manager'
import type { Heat } from '../src/types/tournament'

function createMockHeat(overrides: Partial<Heat> = {}): Heat {
  return {
    id: 'heat-1',
    heatNumber: 1,
    pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
    status: 'completed',
    bracketType: 'winner',
    ...overrides
  }
}

describe('isEliminatedInHeat', () => {
  it('should return true for LB heat with rank 3', () => {
    const heat = createMockHeat({
      bracketType: 'loser',
      results: {
        rankings: [
          { pilotId: 'pilot-1', rank: 1 },
          { pilotId: 'pilot-2', rank: 2 },
          { pilotId: 'pilot-3', rank: 3 },
          { pilotId: 'pilot-4', rank: 4 }
        ]
      }
    })
    expect(isEliminatedInHeat('pilot-3', heat)).toBe(true)
  })

  it('should return true for LB heat with rank 4', () => {
    const heat = createMockHeat({
      bracketType: 'loser',
      results: {
        rankings: [
          { pilotId: 'pilot-1', rank: 1 },
          { pilotId: 'pilot-2', rank: 2 },
          { pilotId: 'pilot-3', rank: 3 },
          { pilotId: 'pilot-4', rank: 4 }
        ]
      }
    })
    expect(isEliminatedInHeat('pilot-4', heat)).toBe(true)
  })

  it('should return false for LB heat with rank 1 or 2', () => {
    const heat = createMockHeat({
      bracketType: 'loser',
      results: {
        rankings: [
          { pilotId: 'pilot-1', rank: 1 },
          { pilotId: 'pilot-2', rank: 2 },
          { pilotId: 'pilot-3', rank: 3 },
          { pilotId: 'pilot-4', rank: 4 }
        ]
      }
    })
    expect(isEliminatedInHeat('pilot-1', heat)).toBe(false)
    expect(isEliminatedInHeat('pilot-2', heat)).toBe(false)
  })

  it('should return false for non-loser bracket heat', () => {
    const heat = createMockHeat({
      bracketType: 'winner',
      results: {
        rankings: [
          { pilotId: 'pilot-1', rank: 1 },
          { pilotId: 'pilot-2', rank: 2 },
          { pilotId: 'pilot-3', rank: 3 },
          { pilotId: 'pilot-4', rank: 4 }
        ]
      }
    })
    expect(isEliminatedInHeat('pilot-3', heat)).toBe(false)
  })
})

describe('assignPilotColor', () => {
  const allPilots = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']

  it('should return same color for same pilot on repeated calls', () => {
    const color1 = assignPilotColor('p1', allPilots)
    const color2 = assignPilotColor('p1', allPilots)
    expect(color1).toBe(color2)
  })

  it('should rotate through palette (pilot 8 = color 1)', () => {
    const color1 = assignPilotColor('p1', allPilots)
    const color8 = assignPilotColor('p8', allPilots)
    expect(color1).toBe(SYNTHWAVE_COLORS[0])
    expect(color8).toBe(SYNTHWAVE_COLORS[7 % SYNTHWAVE_COLORS.length])
    expect(color1).toBe(color8)
  })

  it('should match SYNTHWAVE_COLORS values from tailwind config', () => {
    expect(SYNTHWAVE_COLORS).toContain('#ff2a6d')
    expect(SYNTHWAVE_COLORS).toContain('#05d9e8')
    expect(SYNTHWAVE_COLORS).toContain('#d300c5')
    expect(SYNTHWAVE_COLORS).toContain('#f9c80e')
    expect(SYNTHWAVE_COLORS).toContain('#39ff14')
    expect(SYNTHWAVE_COLORS).toContain('#ff6b00')
    expect(SYNTHWAVE_COLORS).toContain('#c0c0c0')
  })
})

describe('calculatePilotPath', () => {
  it('should return empty array for pilot with no completed heats', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'h1', status: 'pending', pilotIds: ['p1'] })
    ]
    expect(calculatePilotPath('p1', heats)).toEqual([])
  })

  it('should return correct segments for 3-heat journey', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'h1', heatNumber: 1, pilotIds: ['p1'], status: 'completed' }),
      createMockHeat({ id: 'h2', heatNumber: 2, pilotIds: ['p1'], status: 'completed' }),
      createMockHeat({ id: 'h3', heatNumber: 3, pilotIds: ['p1'], status: 'completed' })
    ]
    const path = calculatePilotPath('p1', heats)
    expect(path).toHaveLength(2)
    expect(path[0]).toEqual({ fromHeatId: 'h1', toHeatId: 'h2', isElimination: false, pilotId: 'p1' })
    expect(path[1]).toEqual({ fromHeatId: 'h2', toHeatId: 'h3', isElimination: false, pilotId: 'p1' })
  })

  it('should mark last segment as elimination for LB rank 3/4', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'h1', heatNumber: 1, pilotIds: ['p1'], status: 'completed', bracketType: 'winner' }),
      createMockHeat({ id: 'h2', heatNumber: 2, pilotIds: ['p1'], status: 'completed', bracketType: 'loser',       results: {
        rankings: [{ pilotId: 'p1', rank: 3 }]
      }})
    ]
    const path = calculatePilotPath('p1', heats)
    expect(path).toHaveLength(1)
    expect(path[0]).toEqual({ fromHeatId: 'h1', toHeatId: 'h2', isElimination: true, pilotId: 'p1' })
  })

  it('should include pilotId in each path segment', () => {
    const heats: Heat[] = [
      createMockHeat({ id: 'h1', heatNumber: 1, pilotIds: ['p1'], status: 'completed' }),
      createMockHeat({ id: 'h2', heatNumber: 2, pilotIds: ['p1'], status: 'completed' })
    ]
    const path = calculatePilotPath('p1', heats)
    expect(path).toHaveLength(1)
    expect(path[0]).toHaveProperty('pilotId', 'p1')
  })
})
