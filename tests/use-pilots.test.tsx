import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, renderHook, cleanup } from '@testing-library/react'
import { usePilots } from '@/hooks/usePilots'
import type { PilotActionResult } from '@/hooks/usePilots'
import { getStoreState, resetTournamentStore } from './helpers'

const emptyResult: PilotActionResult = { success: false, errors: [] }

type PilotsHook = ReturnType<typeof usePilots>

function addViaHook(
  result: { current: PilotsHook },
  input: { name: string; imageUrl?: string; instagramHandle?: string },
): PilotActionResult {
  let outcome = emptyResult
  act(() => {
    outcome = result.current.addPilot(input)
  })
  return outcome
}

describe('usePilots', () => {
  beforeEach(() => {
    resetTournamentStore()
    vi.mocked(window.confirm).mockReturnValue(true)
  })

  afterEach(() => {
    cleanup()
    resetTournamentStore()
  })

  describe('addPilot', () => {
    it('adds a valid pilot and returns the unified success result', () => {
      const { result } = renderHook(() => usePilots())

      const outcome = addViaHook(result, {
        name: 'Valid Racer',
        imageUrl: 'https://example.com/valid.jpg',
      })

      expect(outcome).toEqual({ success: true, errors: [] })
      expect(result.current.pilots).toHaveLength(1)
      expect(result.current.pilots[0].name).toBe('Valid Racer')
    })

    it('rejects an invalid pilot with field errors and adds nothing', () => {
      const { result } = renderHook(() => usePilots())

      const outcome = addViaHook(result, { name: 'ab', imageUrl: 'not-a-url' })

      expect(outcome.success).toBe(false)
      expect(outcome.errors.length).toBeGreaterThan(0)
      expect(outcome.errors.map((error) => error.field)).toContain('name')
      expect(result.current.pilots).toHaveLength(0)
    })

    it('detects a case-insensitive, trimmed duplicate and blocks when confirm is declined', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'Max Racer', imageUrl: 'https://example.com/max.jpg' })
      vi.mocked(window.confirm).mockReturnValue(false)

      const outcome = addViaHook(result, {
        name: '  MAX RACER  ',
        imageUrl: 'https://example.com/max2.jpg',
      })

      expect(outcome.success).toBe(false)
      expect(outcome.errors).toContainEqual({
        field: 'name',
        message: 'Pilot mit diesem Namen existiert bereits',
      })
      expect(result.current.pilots).toHaveLength(1)
    })

    it('detects a Unicode-normalized duplicate across NFC/NFD forms', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'José Racer', imageUrl: 'https://example.com/jose.jpg' })
      vi.mocked(window.confirm).mockReturnValue(false)

      const outcome = addViaHook(result, {
        name: 'Jose\u0301 Racer',
        imageUrl: 'https://example.com/jose2.jpg',
      })

      expect(outcome.success).toBe(false)
      expect(result.current.pilots).toHaveLength(1)
    })

    it('allows a duplicate when confirm is accepted', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'Max Racer', imageUrl: 'https://example.com/max.jpg' })
      vi.mocked(window.confirm).mockReturnValue(true)

      const outcome = addViaHook(result, {
        name: 'max racer',
        imageUrl: 'https://example.com/max2.jpg',
      })

      expect(outcome.success).toBe(true)
      expect(result.current.pilots).toHaveLength(2)
      expect(window.alert).not.toHaveBeenCalled()
    })
  })

  describe('importPilots', () => {
    it('imports valid rows and reports invalid and duplicate rows as errors', async () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'Existing Pilot', imageUrl: 'https://example.com/existing.jpg' })

      let outcome = emptyResult
      await act(async () => {
        outcome = await result.current.importPilots([
          { name: 'Csv One', imageUrl: 'https://example.com/csv1.jpg' },
          { name: 'ab', imageUrl: 'https://example.com/invalid.jpg' },
          { name: 'existing pilot', imageUrl: 'https://example.com/dup.jpg' },
          { name: 'csv one', imageUrl: 'https://example.com/dup2.jpg' },
        ])
      })

      expect(outcome.success).toBe(true)
      expect(outcome.successCount).toBe(1)
      expect(outcome.errorCount).toBe(3)
      expect(outcome.errors).toHaveLength(3)
      expect(outcome.duration).toBeGreaterThanOrEqual(0)
      expect(result.current.pilots).toHaveLength(2)
      expect(window.alert).not.toHaveBeenCalled()
    })

    it('returns a failure result when every row is invalid', async () => {
      const { result } = renderHook(() => usePilots())

      let outcome = emptyResult
      await act(async () => {
        outcome = await result.current.importPilots([
          { name: 'x', imageUrl: 'https://example.com/a.jpg' },
        ])
      })

      expect(outcome.success).toBe(false)
      expect(outcome.successCount).toBe(0)
      expect(outcome.errorCount).toBe(1)
      expect(result.current.pilots).toHaveLength(0)
    })
  })

  describe('updatePilot', () => {
    it('updates an existing pilot and returns the unified success result', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'Before Name', imageUrl: 'https://example.com/before.jpg' })
      const id = result.current.pilots[0].id

      let outcome = emptyResult
      act(() => {
        outcome = result.current.updatePilot(id, { name: 'After Name' })
      })

      expect(outcome).toEqual({ success: true, errors: [] })
      expect(result.current.pilots[0].name).toBe('After Name')
    })

    it('fails for a missing pilot', () => {
      const { result } = renderHook(() => usePilots())

      let outcome = emptyResult
      act(() => {
        outcome = result.current.updatePilot('does-not-exist', { name: 'Ghost Pilot' })
      })

      expect(outcome.success).toBe(false)
      expect(outcome.errors).toContainEqual({ field: 'general', message: 'Pilot nicht gefunden' })
    })

    it('fails validation with field errors', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'Valid Name', imageUrl: 'https://example.com/valid.jpg' })
      const id = result.current.pilots[0].id

      let outcome = emptyResult
      act(() => {
        outcome = result.current.updatePilot(id, { name: 'ab' })
      })

      expect(outcome.success).toBe(false)
      expect(outcome.errors.map((error) => error.field)).toContain('name')
      expect(result.current.pilots[0].name).toBe('Valid Name')
    })

    it('blocks a normalized duplicate name without alerting', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'Alice Racer', imageUrl: 'https://example.com/alice.jpg' })
      addViaHook(result, { name: 'Bob Racer', imageUrl: 'https://example.com/bob.jpg' })
      const bobId = result.current.pilots.find((pilot) => pilot.name === 'Bob Racer')?.id

      let outcome = emptyResult
      act(() => {
        outcome = result.current.updatePilot(bobId ?? '', { name: '  alice racer ' })
      })

      expect(outcome.success).toBe(false)
      expect(outcome.errors).toContainEqual({
        field: 'name',
        message: 'Pilot mit diesem Namen existiert bereits',
      })
      expect(result.current.pilots.map((pilot) => pilot.name)).toEqual([
        'Alice Racer',
        'Bob Racer',
      ])
      expect(window.alert).not.toHaveBeenCalled()
    })
  })

  describe('deletePilot', () => {
    it('deletes an existing pilot before tournament start', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'To Delete', imageUrl: 'https://example.com/del.jpg' })
      const id = result.current.pilots[0].id

      let outcome = emptyResult
      act(() => {
        outcome = result.current.deletePilot(id)
      })

      expect(outcome).toEqual({ success: true, errors: [] })
      expect(result.current.pilots).toHaveLength(0)
    })

    it('fails for a missing pilot', () => {
      const { result } = renderHook(() => usePilots())

      let outcome = emptyResult
      act(() => {
        outcome = result.current.deletePilot('does-not-exist')
      })

      expect(outcome.success).toBe(false)
      expect(outcome.errors.length).toBeGreaterThan(0)
    })
  })

  describe('markPilotAsDroppedOut', () => {
    it('marks a pilot as withdrawn after the tournament starts', () => {
      const { result } = renderHook(() => usePilots())
      for (let i = 0; i < 7; i++) {
        addViaHook(result, { name: `Pilot ${i + 1}`, imageUrl: `https://example.com/p${i + 1}.jpg` })
      }
      act(() => {
        getStoreState().confirmTournamentStart()
      })
      const id = getStoreState().pilots[0].id

      let outcome = emptyResult
      act(() => {
        outcome = result.current.markPilotAsDroppedOut(id)
      })

      expect(outcome).toEqual({ success: true, errors: [] })
      expect(getStoreState().pilots[0].status).toBe('withdrawn')
    })

    it('fails for a missing pilot after the tournament starts', () => {
      const { result } = renderHook(() => usePilots())
      for (let i = 0; i < 7; i++) {
        addViaHook(result, { name: `Pilot ${i + 1}`, imageUrl: `https://example.com/p${i + 1}.jpg` })
      }
      act(() => {
        getStoreState().confirmTournamentStart()
      })

      let outcome = emptyResult
      act(() => {
        outcome = result.current.markPilotAsDroppedOut('does-not-exist')
      })

      expect(outcome.success).toBe(false)
      expect(outcome.errors.length).toBeGreaterThan(0)
    })
  })
})
