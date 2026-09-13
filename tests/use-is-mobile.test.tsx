import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useIsMobile } from '@/hooks/useIsMobile'

type ChangeListener = (event: MediaQueryListEvent) => void

describe('useIsMobile', () => {
  const listeners = new Set<ChangeListener>()
  const mediaQuery = {
    matches: false,
    media: '(max-width: 768px)',
    onchange: null,
    addEventListener: (_type: string, listener: ChangeListener) => {
      listeners.add(listener)
    },
    removeEventListener: (_type: string, listener: ChangeListener) => {
      listeners.delete(listener)
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }

  const emitChange = (matches: boolean) => {
    mediaQuery.matches = matches
    const event = { matches } as MediaQueryListEvent
    listeners.forEach(listener => listener(event))
  }

  beforeEach(() => {
    listeners.clear()
    mediaQuery.matches = false
    window.matchMedia = (() => mediaQuery) as unknown as typeof window.matchMedia
  })

  afterEach(() => {
    cleanup()
    listeners.clear()
  })

  it('returns the initial matchMedia value on first render', () => {
    mediaQuery.matches = true

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('returns false when the viewport is above the breakpoint', () => {
    mediaQuery.matches = false

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('updates when the media query change event fires', () => {
    mediaQuery.matches = false
    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    act(() => {
      emitChange(true)
    })

    expect(result.current).toBe(true)

    act(() => {
      emitChange(false)
    })

    expect(result.current).toBe(false)
  })

  it('removes the change listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())

    expect(listeners.size).toBe(1)

    unmount()

    expect(listeners.size).toBe(0)
  })
})
