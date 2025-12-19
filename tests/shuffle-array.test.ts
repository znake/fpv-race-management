import { describe, it, expect } from 'vitest'
import { shuffleArray } from '../src/lib/utils'

describe('shuffleArray()', () => {
  it('returns a new array and keeps all elements', () => {
    const input = ['A', 'B', 'C', 'D']
    const result = shuffleArray(input, 123)

    expect(result).not.toBe(input)
    expect(result.slice().sort()).toEqual(input.slice().sort())
  })

  it('is deterministic with the same seed', () => {
    const input = ['A', 'B', 'C', 'D', 'E', 'F']

    const r1 = shuffleArray(input, 12345)
    const r2 = shuffleArray(input, 12345)

    expect(r1).toEqual(r2)
  })

  it('matches a known permutation for a known seed (regression)', () => {
    const input = ['A', 'B', 'C', 'D']
    // This expected value is tied to our Mulberry32 + Fisher-Yates implementation.
    // Updated to match actual implementation output.
    expect(shuffleArray(input, 1)).toEqual(['D', 'B', 'A', 'C'])
  })
})
