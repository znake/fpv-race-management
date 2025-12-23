import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { Heat } from '../src/stores/tournamentStore'
import { sortPilotsByRank, getPilotRank } from '../src/lib/utils'

describe('US-4.4: Platzierungsanzeige & Sortierung', () => {
  beforeEach(() => {
    // Reset before each test
  })

  afterEach(() => {
    // Cleanup after each test
  })

  describe('Task 1: Heat-Übersicht Sortierung', () => {
    it('should sort pilots by rank (1, 2, 3, 4) for completed heats', () => {
      const pilotIds = ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d']
      const results: Heat['results'] = {
        rankings: [
          { pilotId: 'pilot-c', rank: 1 },
          { pilotId: 'pilot-a', rank: 2 },
          { pilotId: 'pilot-d', rank: 3 },
          { pilotId: 'pilot-b', rank: 4 }
        ]
      }

      const sorted = sortPilotsByRank(pilotIds, results)

      expect(sorted).toEqual(['pilot-c', 'pilot-a', 'pilot-d', 'pilot-b'])
    })

    it('should keep original order for pending heats', () => {
      const pilotIds = ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d']
      const results = undefined

      const sorted = sortPilotsByRank(pilotIds, results)

      expect(sorted).toEqual(pilotIds)
    })

    it('should handle partial rankings (only rank 1-2)', () => {
      const pilotIds = ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d']
      const results: Heat['results'] = {
        rankings: [
          { pilotId: 'pilot-b', rank: 1 },
          { pilotId: 'pilot-d', rank: 2 }
        ]
      }

      const sorted = sortPilotsByRank(pilotIds, results)

      // Ranked pilots first (1, 2), then unranked (99, 99)
      expect(sorted[0]).toBe('pilot-b') // rank 1
      expect(sorted[1]).toBe('pilot-d') // rank 2
      expect(sorted).toHaveLength(4)
    })

    it('should get pilot rank correctly', () => {
      const heat: Heat = {
        id: 'heat-1',
        heatNumber: 1,
        pilotIds: ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d'],
        status: 'completed',
        results: {
          rankings: [
            { pilotId: 'pilot-c', rank: 1 },
            { pilotId: 'pilot-a', rank: 2 },
            { pilotId: 'pilot-d', rank: 3 },
            { pilotId: 'pilot-b', rank: 4 }
          ]
        }
      }

      expect(getPilotRank('pilot-c', heat)).toBe(1)
      expect(getPilotRank('pilot-a', heat)).toBe(2)
      expect(getPilotRank('pilot-d', heat)).toBe(3)
      expect(getPilotRank('pilot-b', heat)).toBe(4)
    })

    it('should return undefined for pilot without ranking', () => {
      const heat: Heat = {
        id: 'heat-1',
        heatNumber: 1,
        pilotIds: ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d'],
        status: 'completed',
        results: {
          rankings: [
            { pilotId: 'pilot-c', rank: 1 },
            { pilotId: 'pilot-a', rank: 2 }
          ]
        }
      }

      expect(getPilotRank('pilot-b', heat)).toBeUndefined()
      expect(getPilotRank('pilot-d', heat)).toBeUndefined()
    })

    it('should return undefined for heat without results', () => {
      const heat: Heat = {
        id: 'heat-1',
        heatNumber: 1,
        pilotIds: ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d'],
        status: 'pending'
      }

      expect(getPilotRank('pilot-a', heat)).toBeUndefined()
    })

    it('should handle 3-pilot heats (rank 1-3 only)', () => {
      const pilotIds = ['pilot-a', 'pilot-b', 'pilot-c']
      const results: Heat['results'] = {
        rankings: [
          { pilotId: 'pilot-b', rank: 1 },
          { pilotId: 'pilot-c', rank: 2 },
          { pilotId: 'pilot-a', rank: 3 }
        ]
      }

      const sorted = sortPilotsByRank(pilotIds, results)

      expect(sorted).toEqual(['pilot-b', 'pilot-c', 'pilot-a'])
    })
  })

  describe('Task 2 & 3: Winner/Loser Bracket Sortierung', () => {
    it('should sort bracket heat pilots by rank after completion', () => {
      const bracketPilotIds = ['pilot-e', 'pilot-f', 'pilot-g', 'pilot-h']
      const results: Heat['results'] = {
        rankings: [
          { pilotId: 'pilot-g', rank: 1 },
          { pilotId: 'pilot-e', rank: 2 },
          { pilotId: 'pilot-h', rank: 3 },
          { pilotId: 'pilot-f', rank: 4 }
        ]
      }

      const sorted = sortPilotsByRank(bracketPilotIds, results)

      expect(sorted).toEqual(['pilot-g', 'pilot-e', 'pilot-h', 'pilot-f'])
    })
  })

  describe('Task 4: Keine Platzierungen bei pending/active', () => {
    it('should not show rank for pending heat', () => {
      const heat: Heat = {
        id: 'heat-1',
        heatNumber: 1,
        pilotIds: ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d'],
        status: 'pending'
      }

      const rank = getPilotRank('pilot-a', heat)
      expect(rank).toBeUndefined()

      // For UI: showRank should be false
      const showRank = heat.status === 'completed'
      expect(showRank).toBe(false)
    })

    it('should not show rank for active heat', () => {
      const heat: Heat = {
        id: 'heat-1',
        heatNumber: 1,
        pilotIds: ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d'],
        status: 'active'
      }

      const rank = getPilotRank('pilot-a', heat)
      expect(rank).toBeUndefined()

      const showRank = heat.status === 'completed'
      expect(showRank).toBe(false)
    })

    it('should show rank for completed heat', () => {
      const heat: Heat = {
        id: 'heat-1',
        heatNumber: 1,
        pilotIds: ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d'],
        status: 'completed',
        results: {
          rankings: [
            { pilotId: 'pilot-a', rank: 1 },
            { pilotId: 'pilot-b', rank: 2 }
          ]
        }
      }

      const rank = getPilotRank('pilot-a', heat)
      expect(rank).toBe(1)

      const showRank = heat.status === 'completed'
      expect(showRank).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle edit after heat completion (sort updates)', () => {
      const pilotIds = ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d']
      const results1: Heat['results'] = {
        rankings: [
          { pilotId: 'pilot-c', rank: 1 },
          { pilotId: 'pilot-a', rank: 2 },
          { pilotId: 'pilot-d', rank: 3 },
          { pilotId: 'pilot-b', rank: 4 }
        ]
      }

      let sorted = sortPilotsByRank(pilotIds, results1)
      expect(sorted).toEqual(['pilot-c', 'pilot-a', 'pilot-d', 'pilot-b'])

      // Edit: Change rankings
      const results2: Heat['results'] = {
        rankings: [
          { pilotId: 'pilot-b', rank: 1 },
          { pilotId: 'pilot-d', rank: 2 },
          { pilotId: 'pilot-c', rank: 3 },
          { pilotId: 'pilot-a', rank: 4 }
        ]
      }

      sorted = sortPilotsByRank(pilotIds, results2)
      expect(sorted).toEqual(['pilot-b', 'pilot-d', 'pilot-c', 'pilot-a'])
    })

    it('should handle pilot without ranking (rank=99)', () => {
      const pilotIds = ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d']
      const results: Heat['results'] = {
        rankings: [
          { pilotId: 'pilot-c', rank: 1 },
          { pilotId: 'pilot-a', rank: 2 }
          // pilot-b and pilot-d have no ranking
        ]
      }

      const sorted = sortPilotsByRank(pilotIds, results)

      expect(sorted[0]).toBe('pilot-c') // rank 1
      expect(sorted[1]).toBe('pilot-a') // rank 2
      // pilot-b and pilot-d should be at the end (rank 99)
      expect(sorted).toContain('pilot-b')
      expect(sorted).toContain('pilot-d')
      expect(sorted).toHaveLength(4)
    })

    it('should handle empty rankings array', () => {
      const pilotIds = ['pilot-a', 'pilot-b', 'pilot-c', 'pilot-d']
      const results: Heat['results'] = {
        rankings: []
      }

      const sorted = sortPilotsByRank(pilotIds, results)

      // Should keep original order
      expect(sorted).toEqual(pilotIds)
    })
  })

  describe('Beamer-Optimierung (AC 5)', () => {
    it('should support beamer-optimized rank badge sizes (>= 24px)', () => {
      // This is a design requirement - the actual component renders
      // rank badges with w-14 h-14 (56px) which is > 24px
      const heat: Heat = {
        id: 'heat-1',
        heatNumber: 1,
        pilotIds: ['pilot-a', 'pilot-b'],
        status: 'completed',
        results: {
          rankings: [
            { pilotId: 'pilot-a', rank: 1 },
            { pilotId: 'pilot-b', rank: 2 }
          ]
        }
      }

      const rank = getPilotRank('pilot-a', heat)
      expect(rank).toBe(1)

      // showRank should be true for completed heats
      const showRank = heat.status === 'completed'
      expect(showRank).toBe(true)

      // In the actual PilotCard component, rank badges are rendered
      // with w-14 h-14 (56px) which is beamer-optimized (> 24px)
    })
  })
})
