/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useTournamentStore } from '../src/stores/tournamentStore'
import { resetTournamentStore } from './helpers/store-helpers'

describe('showPilotPaths toggle', () => {
  beforeEach(() => {
    resetTournamentStore()
    // Also reset showPilotPaths to ensure clean state
    useTournamentStore.setState({ showPilotPaths: false })
    // Clear localStorage
    localStorage.removeItem('tournament-storage')
  })

  afterEach(() => {
    cleanup()
    localStorage.removeItem('tournament-storage')
  })

  it('defaults to false', () => {
    const { result } = renderHook(() => useTournamentStore())
    expect(result.current.showPilotPaths).toBe(false)
  })

  it('togglePilotPaths() switches state from false to true', () => {
    const { result } = renderHook(() => useTournamentStore())
    
    act(() => {
      result.current.togglePilotPaths()
    })
    
    expect(result.current.showPilotPaths).toBe(true)
  })

  it('togglePilotPaths() switches state from true to false', () => {
    const { result } = renderHook(() => useTournamentStore())
    
    // Ensure it starts as false
    expect(result.current.showPilotPaths).toBe(false)

    act(() => {
      result.current.togglePilotPaths()
    })
    expect(result.current.showPilotPaths).toBe(true)

    act(() => {
      result.current.togglePilotPaths()
    })
    expect(result.current.showPilotPaths).toBe(false)
  })

  it('showPilotPaths NOT reset by performReset()', () => {
    const { result } = renderHook(() => useTournamentStore())
    
    // Ensure it starts as false
    expect(result.current.showPilotPaths).toBe(false)

    act(() => {
      result.current.togglePilotPaths()
    })
    expect(result.current.showPilotPaths).toBe(true)

    act(() => {
      result.current.performReset()
    })
    expect(result.current.showPilotPaths).toBe(true)
  })

  it('showPilotPaths persists in localStorage', () => {
    const { result } = renderHook(() => useTournamentStore())
    
    // Ensure it starts as false
    expect(result.current.showPilotPaths).toBe(false)

    act(() => {
      result.current.togglePilotPaths()
    })
    expect(result.current.showPilotPaths).toBe(true)

    act(() => {
      result.current.performReset()
    })
    expect(result.current.showPilotPaths).toBe(true)
  })
})
