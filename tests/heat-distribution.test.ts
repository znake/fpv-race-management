import { describe, it, expect } from 'vitest'
import { calculateHeatDistribution } from '../src/lib/heat-distribution'

// Erwartete Werte basieren auf Maximierung von 4er-Heats
// Formel: N = 4a + 3b, maximiere a
const expectedExamples: Array<[number, { four: number; three: number }]> = [
  [7, { four: 1, three: 1 }],   // 4+3=7
  [8, { four: 2, three: 0 }],   // 8=8
  [9, { four: 0, three: 3 }],   // 9=9
  [10, { four: 1, three: 2 }],  // 4+6=10
  [11, { four: 2, three: 1 }],  // 8+3=11
  [12, { four: 3, three: 0 }],  // 12=12
  [13, { four: 1, three: 3 }],  // 4+9=13
  [14, { four: 2, three: 2 }],  // 8+6=14
  [15, { four: 3, three: 1 }],  // 12+3=15
  [16, { four: 4, three: 0 }],  // 16=16
  [17, { four: 2, three: 3 }],  // 8+9=17
  [18, { four: 3, three: 2 }],  // 12+6=18 (NICHT 0+6×3, da 4er-Heats maximiert werden!)
  [19, { four: 4, three: 1 }],  // 16+3=19 (maximiere 4er!)
  [20, { four: 5, three: 0 }],  // 20=20
  [35, { four: 8, three: 1 }],  // 32+3=35
  [50, { four: 11, three: 2 }], // 44+6=50
  [60, { four: 15, three: 0 }], // 60=60
]

describe('calculateHeatDistribution()', () => {
  it('throws for <7 and >60', () => {
    expect(() => calculateHeatDistribution(6)).toThrow()
    expect(() => calculateHeatDistribution(61)).toThrow()
  })

  it('matches documented examples', () => {
    for (const [n, exp] of expectedExamples) {
      const result = calculateHeatDistribution(n)
      expect(result).toEqual({
        fourPlayerHeats: exp.four,
        threePlayerHeats: exp.three,
      })
    }
  })

  it('is valid and maximizes 4er-Heats for all 7-60', () => {
    for (let n = 7; n <= 60; n++) {
      const { fourPlayerHeats: a, threePlayerHeats: b } = calculateHeatDistribution(n)

      // Validity
      expect(a).toBeGreaterThanOrEqual(0)
      expect(b).toBeGreaterThanOrEqual(0)
      expect(4 * a + 3 * b).toBe(n)

      // Each heat is 3 or 4 by construction; ensure no "leftover" (implicit)
      expect(n - 4 * a).toBe(3 * b)

      // Optimality: there is no solution with more 4er-Heats.
      for (let a2 = a + 1; a2 <= Math.floor(n / 4); a2++) {
        const remaining = n - 4 * a2
        const valid = remaining >= 0 && remaining % 3 === 0
        expect(valid).toBe(false)
      }
    }
  })
})
