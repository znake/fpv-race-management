import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, renderHook, cleanup } from '@testing-library/react'
import { usePilots } from '@/hooks/usePilots'
import type { PilotActionResult } from '@/hooks/usePilots'
import { getStoreState, resetTournamentStore } from './helpers'
import { useTournamentStore } from '@/stores/tournamentStore'

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
    vi.restoreAllMocks()
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

    it('blocks a duplicate added in the same tick using fresh store state', () => {
      const { result } = renderHook(() => usePilots())

      let first = emptyResult
      let second = emptyResult
      act(() => {
        first = result.current.addPilot({
          name: 'Same Tick Pilot',
          imageUrl: 'https://example.com/tick1.jpg',
        })
        vi.mocked(window.confirm).mockReturnValue(false)
        second = result.current.addPilot({
          name: 'same tick pilot',
          imageUrl: 'https://example.com/tick2.jpg',
        })
      })

      expect(first.success).toBe(true)
      expect(second.success).toBe(false)
      expect(getStoreState().pilots).toHaveLength(1)
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

    it('counts a single row invalid in two fields as one failed row', async () => {
      const { result } = renderHook(() => usePilots())

      let outcome = emptyResult
      await act(async () => {
        outcome = await result.current.importPilots([
          { name: 'ab', imageUrl: 'not-a-url' },
        ])
      })

      expect(outcome.success).toBe(false)
      expect(outcome.errorCount).toBe(1)
      expect(outcome.errors.length).toBeGreaterThanOrEqual(2)
    })

    it('resolves with a failure result when the store action throws', async () => {
      const addPilotSpy = vi
        .spyOn(useTournamentStore.getState(), 'addPilot')
        .mockImplementation(() => {
          throw new Error('store unavailable')
        })
      const { result } = renderHook(() => usePilots())

      let outcome = emptyResult
      let rejection: unknown = null
      await act(async () => {
        try {
          outcome = await result.current.importPilots([
            { name: 'Throwing Pilot', imageUrl: 'https://example.com/throw.jpg' },
          ])
        } catch (error) {
          rejection = error
        }
      })
      addPilotSpy.mockRestore()

      expect(rejection).toBeNull()
      expect(outcome.success).toBe(false)
      expect(outcome.successCount).toBe(0)
      expect(outcome.errorCount).toBe(1)
      expect(outcome.errors.length).toBeGreaterThanOrEqual(1)
    })

    it('counts a mixed valid, invalid, and duplicate batch as failed rows', async () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'Mixed Existing', imageUrl: 'https://example.com/mixed.jpg' })

      let outcome = emptyResult
      await act(async () => {
        outcome = await result.current.importPilots([
          { name: 'Mixed New', imageUrl: 'https://example.com/new.jpg' },
          { name: 'ab', imageUrl: 'https://example.com/bad.jpg' },
          { name: 'mixed existing', imageUrl: 'https://example.com/dup.jpg' },
        ])
      })

      expect(outcome.success).toBe(true)
      expect(outcome.successCount).toBe(1)
      expect(outcome.errorCount).toBe(2)
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

    it('rejects an empty name instead of persisting the fallback', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'Keep Me', imageUrl: 'https://example.com/keep.jpg' })
      const id = result.current.pilots[0].id

      let outcome = emptyResult
      act(() => {
        outcome = result.current.updatePilot(id, { name: '' })
      })

      expect(outcome.success).toBe(false)
      expect(getStoreState().pilots[0].name).toBe('Keep Me')
    })

    it('rejects an invalid image url', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'Url Pilot', imageUrl: 'https://example.com/url.jpg' })
      const id = result.current.pilots[0].id

      let outcome = emptyResult
      act(() => {
        outcome = result.current.updatePilot(id, { imageUrl: 'not-a-url' })
      })

      expect(outcome.success).toBe(false)
      expect(getStoreState().pilots[0].imageUrl).toBe('https://example.com/url.jpg')
    })

    it('persists a valid instagram handle update', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'Insta Pilot', imageUrl: 'https://example.com/insta.jpg' })
      const id = result.current.pilots[0].id

      let outcome = emptyResult
      act(() => {
        outcome = result.current.updatePilot(id, { instagramHandle: '@insta_pilot' })
      })

      expect(outcome.success).toBe(true)
      expect(getStoreState().pilots[0].instagramHandle).toBe('@insta_pilot')
    })

    it('clears an existing instagram handle when explicitly set to undefined', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, {
        name: 'Clearable Pilot',
        imageUrl: 'https://example.com/clearable.jpg',
        instagramHandle: '@clearable',
      })
      const id = result.current.pilots[0].id
      expect(getStoreState().pilots[0].instagramHandle).toBe('@clearable')

      let outcome = emptyResult
      act(() => {
        outcome = result.current.updatePilot(id, { instagramHandle: undefined })
      })

      expect(outcome.success).toBe(true)
      expect(getStoreState().pilots[0].instagramHandle).toBeUndefined()
    })

    it('preserves an existing instagram handle when the update omits the key', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, {
        name: 'Keep Handle Pilot',
        imageUrl: 'https://example.com/keephandle.jpg',
        instagramHandle: '@keephandle',
      })
      const id = result.current.pilots[0].id

      let outcome = emptyResult
      act(() => {
        outcome = result.current.updatePilot(id, { name: 'Renamed Handle Pilot' })
      })

      expect(outcome.success).toBe(true)
      expect(getStoreState().pilots[0].name).toBe('Renamed Handle Pilot')
      expect(getStoreState().pilots[0].instagramHandle).toBe('@keephandle')
    })

    it('rejects an invalid instagram handle', () => {
      const { result } = renderHook(() => usePilots())
      addViaHook(result, { name: 'Bad Insta', imageUrl: 'https://example.com/badinsta.jpg' })
      const id = result.current.pilots[0].id

      let outcome = emptyResult
      act(() => {
        outcome = result.current.updatePilot(id, { instagramHandle: 'no-at-sign' })
      })

      expect(outcome.success).toBe(false)
      expect(getStoreState().pilots[0].instagramHandle).toBeUndefined()
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
