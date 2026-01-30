import { describe, it, expect, vi } from 'vitest'

import {
  formatChannel,
  getChannelForPosition,
  getChannelsForHeat,
  optimizePilotOrder,
} from '../src/lib/channel-assignment'

import type { Pilot } from '../src/lib/schemas'

describe('getChannelsForHeat', () => {
  it('should return correct channels for 4 pilots', () => {
    expect(getChannelsForHeat(4)).toEqual([1, 4, 6, 8])
  })

  it('should return correct channels for 3 pilots', () => {
    expect(getChannelsForHeat(3)).toEqual([1, 4, 8])
  })

  it('should return correct channels for 2 pilots', () => {
    expect(getChannelsForHeat(2)).toEqual([1, 8])
  })

  it('should return correct channels for 1 pilot', () => {
    expect(getChannelsForHeat(1)).toEqual([1])
  })

  it('should return empty list for 0 pilots', () => {
    expect(getChannelsForHeat(0)).toEqual([])
  })
})

describe('getChannelForPosition', () => {
  it('should return correct channels for 4 pilots positions', () => {
    expect(getChannelForPosition(0, 4)).toBe(1)
    expect(getChannelForPosition(1, 4)).toBe(4)
    expect(getChannelForPosition(2, 4)).toBe(6)
    expect(getChannelForPosition(3, 4)).toBe(8)
  })

  it('should return correct channels for 3 pilots positions', () => {
    expect(getChannelForPosition(0, 3)).toBe(1)
    expect(getChannelForPosition(1, 3)).toBe(4)
    expect(getChannelForPosition(2, 3)).toBe(8)
  })

  it('should throw for out-of-range positions', () => {
    expect(() => getChannelForPosition(3, 3)).toThrow()
    expect(() => getChannelForPosition(-1, 3)).toThrow()
  })
})

describe('formatChannel', () => {
  it('should format channels as raceband strings', () => {
    expect(formatChannel(1)).toBe('R1')
    expect(formatChannel(4)).toBe('R4')
    expect(formatChannel(8)).toBe('R8')
  })
})

describe('optimizePilotOrder', () => {
  it('should keep original order if no pilots have lastChannel (cold start)', () => {
    const pilotIds = ['p1', 'p2', 'p3', 'p4']
    const pilots: Pilot[] = [
      { id: 'p1', name: 'P1' },
      { id: 'p2', name: 'P2' },
      { id: 'p3', name: 'P3' },
      { id: 'p4', name: 'P4' },
    ]

    expect(optimizePilotOrder(pilotIds, pilots)).toEqual(pilotIds)
  })

  it('should maximize lastChannel matches when all pilots have matching lastChannel', () => {
    const pilotIds = ['p1', 'p2', 'p3', 'p4']
    const pilots: Pilot[] = [
      { id: 'p1', name: 'P1', lastChannel: 1 },
      { id: 'p2', name: 'P2', lastChannel: 4 },
      { id: 'p3', name: 'P3', lastChannel: 6 },
      { id: 'p4', name: 'P4', lastChannel: 8 },
    ]

    // For 4 pilots channels are [1,4,6,8]
    expect(optimizePilotOrder(pilotIds, pilots)).toEqual(['p1', 'p2', 'p3', 'p4'])
  })

  it('should resolve conflicts with random tie-breaker when multiple pilots want same channel', () => {
    const pilotIds = ['p1', 'p2', 'p3', 'p4']
    const pilots: Pilot[] = [
      { id: 'p1', name: 'P1', lastChannel: 1 },
      { id: 'p2', name: 'P2', lastChannel: 1 },
      { id: 'p3', name: 'P3', lastChannel: 6 },
      { id: 'p4', name: 'P4', lastChannel: 8 },
    ]

    // Force random to pick index 1 when there are two candidates.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.9)
    const result = optimizePilotOrder(pilotIds, pilots)
    randomSpy.mockRestore()

    // Channel order: [1,4,6,8]
    // For channel 1 we should have picked p2 (because random forced selection of second candidate)
    expect(result[0]).toBe('p2')
    // Remaining should be some permutation of remaining pilots
    expect(new Set(result)).toEqual(new Set(pilotIds))
  })
})
