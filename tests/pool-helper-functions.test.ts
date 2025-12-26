/**
 * Tests for Pool Helper Functions (Story 1.4)
 *
 * AC1: Beide Funktionen sind in `bracket-logic.ts` exportiert
 * AC4: Rückgabetyp verwendet `Heat` statt `HeatForHelper`
 *
 * Diese Funktionen wurden aus tournamentStore.ts nach bracket-logic.ts verschoben,
 * da sie Pure Functions sind und nicht im Store gehören.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createWBHeatFromPool, createLBHeatFromPool } from '../src/lib/bracket-logic'
import type { Heat } from '../src/stores/tournamentStore'

describe('createWBHeatFromPool', () => {
  describe('with enough pilots (>= 4)', () => {
    it('should create WB heat with first 4 pilots from pool (FIFO)', () => {
      const winnerPool = new Set(['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4', 'pilot-5'])
      const currentHeats: Heat[] = []

      const result = createWBHeatFromPool(winnerPool, currentHeats)

      expect(result.heat).not.toBeNull()
      expect(result.heat?.pilotIds).toEqual(['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'])
      expect(result.heat?.bracketType).toBe('winner')
      expect(result.heat?.status).toBe('pending')
      expect(result.heat?.heatNumber).toBe(1)
    })

    it('should remove used pilots from pool', () => {
      const winnerPool = new Set(['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4', 'pilot-5'])
      const currentHeats: Heat[] = []

      const result = createWBHeatFromPool(winnerPool, currentHeats)

      expect(result.updatedPool).toEqual(new Set(['pilot-5']))
    })

    it('should calculate correct heatNumber based on existing heats', () => {
      const winnerPool = new Set(['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'])
      const currentHeats: Heat[] = [
        { id: 'heat-1', heatNumber: 1, pilotIds: [], status: 'pending' },
        { id: 'heat-2', heatNumber: 2, pilotIds: [], status: 'completed' },
      ]

      const result = createWBHeatFromPool(winnerPool, currentHeats)

      expect(result.heat?.heatNumber).toBe(3)
    })
  })

  describe('with insufficient pilots (< 4)', () => {
    it('should return null heat when pool has 3 pilots', () => {
      const winnerPool = new Set(['pilot-1', 'pilot-2', 'pilot-3'])
      const currentHeats: Heat[] = []

      const result = createWBHeatFromPool(winnerPool, currentHeats)

      expect(result.heat).toBeNull()
      expect(result.updatedPool).toEqual(winnerPool)
    })

    it('should return null heat when pool is empty', () => {
      const winnerPool = new Set<string>()
      const currentHeats: Heat[] = []

      const result = createWBHeatFromPool(winnerPool, currentHeats)

      expect(result.heat).toBeNull()
      expect(result.updatedPool).toEqual(winnerPool)
    })

    it('should return null heat when pool has 1 pilot', () => {
      const winnerPool = new Set(['pilot-1'])
      const currentHeats: Heat[] = []

      const result = createWBHeatFromPool(winnerPool, currentHeats)

      expect(result.heat).toBeNull()
      expect(result.updatedPool).toEqual(winnerPool)
    })
  })

  describe('multiple calls (FIFO behavior)', () => {
    it('should take pilots in correct order across multiple calls', () => {
      const pool = new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'])
      let currentHeats: Heat[] = []

      // First call
      const result1 = createWBHeatFromPool(pool, currentHeats)
      expect(result1.heat?.pilotIds).toEqual(['p1', 'p2', 'p3', 'p4'])

      // Second call with updated pool and heats
      currentHeats = [...currentHeats, result1.heat!]
      const result2 = createWBHeatFromPool(result1.updatedPool, currentHeats)
      expect(result2.heat?.pilotIds).toEqual(['p5', 'p6', 'p7', 'p8'])

      // Third call should return null (no pilots left)
      currentHeats = [...currentHeats, result2.heat!]
      const result3 = createWBHeatFromPool(result2.updatedPool, currentHeats)
      expect(result3.heat).toBeNull()
    })
  })
})

describe('createLBHeatFromPool', () => {
  describe('with default minPilots=4', () => {
    it('should create LB heat with 4 pilots when WB active', () => {
      const loserPool = new Set(['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'])
      const currentHeats: Heat[] = []

      const result = createLBHeatFromPool(loserPool, currentHeats, 4)

      expect(result.heat).not.toBeNull()
      expect(result.heat?.pilotIds).toEqual(['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'])
      expect(result.heat?.bracketType).toBe('loser')
      expect(result.heat?.status).toBe('pending')
    })

    it('should return null when pool has < 4 pilots', () => {
      const loserPool = new Set(['pilot-1', 'pilot-2', 'pilot-3'])
      const currentHeats: Heat[] = []

      const result = createLBHeatFromPool(loserPool, currentHeats, 4)

      expect(result.heat).toBeNull()
      expect(result.updatedPool).toEqual(loserPool)
    })
  })

  describe('with minPilots=3', () => {
    it('should create LB heat with 3 pilots when WB not active', () => {
      const loserPool = new Set(['pilot-1', 'pilot-2', 'pilot-3'])
      const currentHeats: Heat[] = []

      const result = createLBHeatFromPool(loserPool, currentHeats, 3)

      expect(result.heat).not.toBeNull()
      expect(result.heat?.pilotIds).toEqual(['pilot-1', 'pilot-2', 'pilot-3'])
      expect(result.heat?.bracketType).toBe('loser')
    })

    it('should return null when pool has < 3 pilots', () => {
      const loserPool = new Set(['pilot-1', 'pilot-2'])
      const currentHeats: Heat[] = []

      const result = createLBHeatFromPool(loserPool, currentHeats, 3)

      expect(result.heat).toBeNull()
    })

    it('should create 4-pilot heat when pool has >=4 pilots', () => {
      const loserPool = new Set(['p1', 'p2', 'p3', 'p4', 'p5'])
      const currentHeats: Heat[] = []

      const result = createLBHeatFromPool(loserPool, currentHeats, 3)

      expect(result.heat?.pilotIds).toEqual(['p1', 'p2', 'p3', 'p4']) // Takes first 4
      expect(result.updatedPool).toEqual(new Set(['p5']))
    })
  })

  describe('FIFO behavior', () => {
    it('should take first N pilots in order', () => {
      const pool = new Set(['p5', 'p1', 'p3', 'p2', 'p4'])
      const currentHeats: Heat[] = []

      const result = createLBHeatFromPool(pool, currentHeats, 4)

      // Set iteration order is insertion order in modern JS
      const poolArray = Array.from(pool)
      expect(result.heat?.pilotIds).toEqual(poolArray.slice(0, 4))
    })
  })

  describe('edge cases', () => {
    it('should handle empty pool', () => {
      const pool = new Set<string>()
      const currentHeats: Heat[] = []

      const result = createLBHeatFromPool(pool, currentHeats, 3)

      expect(result.heat).toBeNull()
      expect(result.updatedPool).toEqual(pool)
    })

    it('should handle pool with exactly minPilots', () => {
      const pool = new Set(['p1', 'p2', 'p3'])
      const currentHeats: Heat[] = []

      const result = createLBHeatFromPool(pool, currentHeats, 3)

      expect(result.heat).not.toBeNull()
      expect(result.heat?.pilotIds).toEqual(['p1', 'p2', 'p3'])
      expect(result.updatedPool.size).toBe(0)
    })

    it('should create heat with up to 4 pilots when minPilots=1', () => {
      const pool = new Set(['p1', 'p2', 'p3'])
      const currentHeats: Heat[] = []

      const result = createLBHeatFromPool(pool, currentHeats, 1)

      // Heat is created (pool >= minPilots)
      expect(result.heat).not.toBeNull()
      // But heatSize is min(4, pool.length) = 3
      expect(result.heat?.pilotIds).toEqual(['p1', 'p2', 'p3'])
      expect(result.updatedPool).toEqual(new Set([]))
    })
  })

  describe('heatNumber calculation', () => {
    it('should calculate correct heatNumber based on existing heats', () => {
      const pool = new Set(['p1', 'p2', 'p3', 'p4'])
      const currentHeats: Heat[] = [
        { id: 'heat-1', heatNumber: 1, pilotIds: [], status: 'pending' },
        { id: 'heat-2', heatNumber: 2, pilotIds: [], status: 'completed' },
        { id: 'heat-3', heatNumber: 3, pilotIds: [], status: 'active' },
      ]

      const result = createLBHeatFromPool(pool, currentHeats, 4)

      expect(result.heat?.heatNumber).toBe(4)
    })
  })

  describe('multiple calls integration', () => {
    it('should work correctly in sequence like submitHeatResults', () => {
      const pool = new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'])
      let currentHeats: Heat[] = []

      // Generate heats until pool is exhausted
      let result = createLBHeatFromPool(pool, currentHeats, 4)
      const heats: Heat[] = []
      let currentPool = pool

      while (result.heat) {
        heats.push(result.heat)
        currentHeats = [...currentHeats, result.heat]
        currentPool = result.updatedPool
        result = createLBHeatFromPool(currentPool, currentHeats, 4)
      }

      expect(heats.length).toBe(2)
      expect(heats[0].pilotIds).toEqual(['p1', 'p2', 'p3', 'p4'])
      expect(heats[1].pilotIds).toEqual(['p5', 'p6', 'p7', 'p8'])
      expect(currentPool.size).toBe(0)
    })
  })
})
