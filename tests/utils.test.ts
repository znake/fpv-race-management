import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce, shuffleArray } from '@/lib/utils'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not invoke the function before the wait elapses', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()

    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(99)
    expect(fn).not.toHaveBeenCalled()
  })

  it('invokes the function once after the wait when called repeatedly', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced()
    debounced()
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('forwards the latest arguments to the debounced function', () => {
    const received: number[] = []
    const debounced = debounce((value: number) => received.push(value), 50)

    debounced(1)
    debounced(2)
    vi.advanceTimersByTime(50)

    expect(received).toEqual([2])
  })

  it('never invokes the function when it is not called', () => {
    const fn = vi.fn()
    debounce(fn, 100)

    vi.advanceTimersByTime(1000)

    expect(fn).not.toHaveBeenCalled()
  })
})

describe('shuffleArray', () => {
  it('returns a new array containing the same elements', () => {
    const input = [1, 2, 3, 4, 5]

    const result = shuffleArray(input)

    expect(result).not.toBe(input)
    expect([...result].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
  })

  it('does not mutate the input array', () => {
    const input = [1, 2, 3, 4, 5]
    const snapshot = [...input]

    shuffleArray(input, 7)

    expect(input).toEqual(snapshot)
  })

  it('produces a deterministic permutation for a given seed', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8]

    const first = shuffleArray(input, 42)
    const second = shuffleArray(input, 42)

    expect(first).toEqual(second)
  })

  it('returns an empty array unchanged', () => {
    expect(shuffleArray([], 42)).toEqual([])
  })

  it('returns a single-element array unchanged', () => {
    expect(shuffleArray(['solo'], 42)).toEqual(['solo'])
  })
})
