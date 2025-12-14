import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePilots } from '../src/hooks/usePilots'
import { useTournamentStore } from '../src/stores/tournamentStore'

// Mock the store
vi.mock('../src/stores/tournamentStore')

describe('usePilots - Edit/Delete Functionality', () => {
  const mockPilots = [
    { id: 'pilot-1', name: 'Pilot One', imageUrl: 'https://example.com/1.jpg' },
    { id: 'pilot-2', name: 'Pilot Two', imageUrl: 'https://example.com/2.jpg' }
  ]

  const mockStore = {
    pilots: mockPilots,
    tournamentStarted: false,
    addPilot: vi.fn(),
    updatePilot: vi.fn(),
    deletePilot: vi.fn(),
    markPilotAsDroppedOut: vi.fn(),
    startTournament: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useTournamentStore as any).mockImplementation((selector) => selector(mockStore))
  })

  it('provides all required functions', () => {
    const { result } = renderHook(() => usePilots())

    expect(result.current.pilots).toEqual(mockPilots)
    expect(result.current.tournamentStarted).toBe(false)
    expect(typeof result.current.updatePilot).toBe('function')
    expect(typeof result.current.deletePilot).toBe('function')
    expect(typeof result.current.markPilotAsDroppedOut).toBe('function')
    expect(typeof result.current.startTournament).toBe('function')
  })

  it('calls updatePilot with correct parameters', () => {
    const { result } = renderHook(() => usePilots())
    
    mockStore.updatePilot.mockReturnValue(true)

    act(() => {
      result.current.updatePilot('pilot-1', { name: 'Updated Pilot' })
    })

    expect(mockStore.updatePilot).toHaveBeenCalledWith('pilot-1', { name: 'Updated Pilot' })
  })

  it('validates pilot data before updating', () => {
    const { result } = renderHook(() => usePilots())
    
    mockStore.updatePilot.mockReturnValue(true)

    act(() => {
      result.current.updatePilot('pilot-1', { name: 'AB' }) // Too short name
    })

    expect(mockStore.updatePilot).not.toHaveBeenCalled()
  })

  it('calls deletePilot with correct parameters', () => {
    const { result } = renderHook(() => usePilots())
    
    mockStore.deletePilot.mockReturnValue(true)

    act(() => {
      result.current.deletePilot('pilot-1')
    })

    expect(mockStore.deletePilot).toHaveBeenCalledWith('pilot-1')
  })

  it('calls markPilotAsDroppedOut with correct parameters', () => {
    const { result } = renderHook(() => usePilots())
    
    mockStore.markPilotAsDroppedOut.mockReturnValue(true)

    act(() => {
      result.current.markPilotAsDroppedOut('pilot-1')
    })

    expect(mockStore.markPilotAsDroppedOut).toHaveBeenCalledWith('pilot-1')
  })

  it('calls startTournament when called', () => {
    const { result } = renderHook(() => usePilots())

    act(() => {
      result.current.startTournament()
    })

    expect(mockStore.startTournament).toHaveBeenCalled()
  })

  it('returns tournament status from store', () => {
    mockStore.tournamentStarted = true
    ;(useTournamentStore as any).mockImplementation((selector) => selector(mockStore))

    const { result } = renderHook(() => usePilots())

    expect(result.current.tournamentStarted).toBe(true)
  })

  it('handles partial updates correctly', () => {
    const { result } = renderHook(() => usePilots())
    
    mockStore.updatePilot.mockReturnValue(true)

    act(() => {
      result.current.updatePilot('pilot-1', { imageUrl: 'https://new-url.com' })
    })

    expect(mockStore.updatePilot).toHaveBeenCalledWith('pilot-1', { 
      imageUrl: 'https://new-url.com',
      name: undefined 
    })
  })

  it('validates image URL before updating', () => {
    const { result } = renderHook(() => usePilots())
    
    mockStore.updatePilot.mockReturnValue(true)

    act(() => {
      result.current.updatePilot('pilot-1', { imageUrl: 'invalid-url' })
    })

    expect(mockStore.updatePilot).not.toHaveBeenCalled()
  })
})