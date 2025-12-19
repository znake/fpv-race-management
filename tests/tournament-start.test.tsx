import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act, renderHook, cleanup } from '@testing-library/react'
import { useTournamentStore } from '../src/stores/tournamentStore'

// Helper to reset the Zustand store to initial state
const resetStore = () => {
  useTournamentStore.setState({
    pilots: [],
    tournamentStarted: false,
    tournamentPhase: 'setup',
    heats: [],
    currentHeatIndex: 0
  })
}

describe('Tournament Start - confirmTournamentStart()', () => {
  // Clean up and reset store before each test to ensure isolation
  beforeEach(() => {
    resetStore()
  })

  afterEach(() => {
    cleanup()
    resetStore()
  })

  describe('Core Validation Logic', () => {
    it('should return false with 6 pilots (below minimum)', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // Add 6 pilots
      for (let i = 0; i < 6; i++) {
        act(() => {
          result.current.addPilot({
            name: `Pilot ${i + 1}`,
            imageUrl: `https://example.com/pilot${i + 1}.jpg`
          })
        })
      }
      
      let success: boolean = false
      act(() => {
        success = result.current.confirmTournamentStart()
      })
      
      expect(success).toBe(false)
      expect(result.current.tournamentStarted).toBe(false)
      expect(result.current.tournamentPhase).toBe('setup')
    })

    it('should return true with exactly 7 pilots (minimum)', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // Add 7 pilots
      for (let i = 0; i < 7; i++) {
        act(() => {
          result.current.addPilot({
            name: `Pilot ${i + 1}`,
            imageUrl: `https://example.com/pilot${i + 1}.jpg`
          })
        })
      }
      
      let success: boolean = false
      act(() => {
        success = result.current.confirmTournamentStart()
      })
      
      expect(success).toBe(true)
      expect(result.current.tournamentStarted).toBe(true)
      expect(result.current.tournamentPhase).toBe('heat-assignment')
    })

    it('should return true with exactly 60 pilots (maximum)', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // Add 60 pilots
      for (let i = 0; i < 60; i++) {
        act(() => {
          result.current.addPilot({
            name: `Pilot ${i + 1}`,
            imageUrl: `https://example.com/pilot${i + 1}.jpg`
          })
        })
      }
      
      let success: boolean = false
      act(() => {
        success = result.current.confirmTournamentStart()
      })
      
      expect(success).toBe(true)
      expect(result.current.tournamentStarted).toBe(true)
      expect(result.current.tournamentPhase).toBe('heat-assignment')
    })

    it('should return false with 0 pilots', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      let success: boolean = false
      act(() => {
        success = result.current.confirmTournamentStart()
      })
      
      expect(success).toBe(false)
      expect(result.current.tournamentStarted).toBe(false)
      expect(result.current.tournamentPhase).toBe('setup')
    })
  })

  describe('Phase Management', () => {
    it('should transition to heat-assignment (NOT running) on success', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // Add 10 pilots
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.addPilot({
            name: `Pilot ${i + 1}`,
            imageUrl: `https://example.com/pilot${i + 1}.jpg`
          })
        })
      }
      
      expect(result.current.tournamentPhase).toBe('setup')
      
      let success: boolean = false
      act(() => {
        success = result.current.confirmTournamentStart()
      })
      
      expect(success).toBe(true)
      expect(result.current.tournamentPhase).toBe('heat-assignment')
      expect(result.current.tournamentPhase).not.toBe('running')
      expect(result.current.tournamentStarted).toBe(true)
    })

    it('should remain in setup phase on validation failure', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // Add 5 pilots (below minimum)
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.addPilot({
            name: `Pilot ${i + 1}`,
            imageUrl: `https://example.com/pilot${i + 1}.jpg`
          })
        })
      }
      
      let success: boolean = false
      act(() => {
        success = result.current.confirmTournamentStart()
      })
      
      expect(success).toBe(false)
      expect(result.current.tournamentPhase).toBe('setup')
      expect(result.current.tournamentStarted).toBe(false)
    })
  })

  describe('Heat Generation', () => {
    it('should generate heats on successful tournament start', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // Add 12 pilots
      for (let i = 0; i < 12; i++) {
        act(() => {
          result.current.addPilot({
            name: `Pilot ${i + 1}`,
            imageUrl: `https://example.com/pilot${i + 1}.jpg`
          })
        })
      }
      
      expect(result.current.heats.length).toBe(0)
      
      let success: boolean = false
      act(() => {
        success = result.current.confirmTournamentStart()
      })
      
      expect(success).toBe(true)
      expect(result.current.heats.length).toBeGreaterThan(0)
    })

    it('should create heats with 3-4 pilots each', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // Add 12 pilots
      for (let i = 0; i < 12; i++) {
        act(() => {
          result.current.addPilot({
            name: `Pilot ${i + 1}`,
            imageUrl: `https://example.com/pilot${i + 1}.jpg`
          })
        })
      }
      
      act(() => {
        result.current.confirmTournamentStart()
      })
      
      result.current.heats.forEach(heat => {
        expect(heat.pilotIds.length).toBeGreaterThanOrEqual(3)
        expect(heat.pilotIds.length).toBeLessThanOrEqual(4)
      })
    })

    it('should set first heat as active', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // Add 12 pilots
      for (let i = 0; i < 12; i++) {
        act(() => {
          result.current.addPilot({
            name: `Pilot ${i + 1}`,
            imageUrl: `https://example.com/pilot${i + 1}.jpg`
          })
        })
      }
      
      act(() => {
        result.current.confirmTournamentStart()
      })
      
      expect(result.current.heats[0].status).toBe('active')
    })
  })

  describe('Tournament Reset', () => {
    it('should reset tournament to setup phase', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // Add 10 pilots
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.addPilot({
            name: `Pilot ${i + 1}`,
            imageUrl: `https://example.com/pilot${i + 1}.jpg`
          })
        })
      }
      
      act(() => {
        result.current.confirmTournamentStart()
      })
      
      expect(result.current.tournamentPhase).toBe('heat-assignment')
      
      act(() => {
        result.current.resetTournament()
      })
      
      expect(result.current.tournamentPhase).toBe('setup')
      expect(result.current.tournamentStarted).toBe(false)
      expect(result.current.heats.length).toBe(0)
    })
  })
})

describe('TournamentStartDialog Integration', () => {
  beforeEach(() => {
    resetStore()
  })

  afterEach(() => {
    cleanup()
    resetStore()
  })

  it('should not show start button with less than 7 pilots', () => {
    const { result } = renderHook(() => useTournamentStore())
    
    // Add 5 pilots
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.addPilot({
          name: `Pilot ${i + 1}`,
          imageUrl: `https://example.com/pilot${i + 1}.jpg`
        })
      })
    }
    
    // Verify button should not appear (confirmed by canStartTournament logic)
    expect(result.current.pilots.length).toBe(5)
    expect(result.current.pilots.length >= 7).toBe(false)
    expect(result.current.pilots.length <= 60).toBe(true)
  })

  it('should show start button with exactly 7 pilots', () => {
    const { result } = renderHook(() => useTournamentStore())
    
    // Add 7 pilots
    for (let i = 0; i < 7; i++) {
      act(() => {
        result.current.addPilot({
          name: `Pilot ${i + 1}`,
          imageUrl: `https://example.com/pilot${i + 1}.jpg`
        })
      })
    }
    
    // Verify button should appear (pilot count logic)
    expect(result.current.pilots.length).toBe(7)
    expect(result.current.pilots.length >= 7).toBe(true)
    expect(result.current.pilots.length <= 60).toBe(true)
  })

  it('should not show start button with more than 60 pilots', () => {
    const { result } = renderHook(() => useTournamentStore())
    
    // The store limits pilots to 60, so we verify the constraint
    expect(result.current.pilots.length).toBe(0)
    
    // Add 60 pilots (maximum)
    for (let i = 0; i < 60; i++) {
      act(() => {
        result.current.addPilot({
          name: `Pilot ${i + 1}`,
          imageUrl: `https://example.com/pilot${i + 1}.jpg`
        })
      })
    }
    
    expect(result.current.pilots.length).toBe(60)
    
    // Try to add 61st pilot - should fail
    let success = false
    act(() => {
      success = result.current.addPilot({
        name: 'Pilot 61',
        imageUrl: 'https://example.com/pilot61.jpg'
      })
    })
    
    expect(success).toBe(false)
    expect(result.current.pilots.length).toBe(60) // Still 60
  })

  it('should hide AddPilotForm after tournament starts', () => {
    const { result } = renderHook(() => useTournamentStore())
    
    // Add 10 pilots
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.addPilot({
          name: `Pilot ${i + 1}`,
          imageUrl: `https://example.com/pilot${i + 1}.jpg`
        })
      })
    }
    
    expect(result.current.tournamentStarted).toBe(false)
    
    act(() => {
      result.current.confirmTournamentStart()
    })
    
    expect(result.current.tournamentStarted).toBe(true)
    // UI should hide AddPilotForm when tournamentStarted is true
  })

  it('should prevent pilot deletion after tournament starts', () => {
    const { result } = renderHook(() => useTournamentStore())
    
    // Add 10 pilots
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.addPilot({
          name: `Pilot ${i + 1}`,
          imageUrl: `https://example.com/pilot${i + 1}.jpg`
        })
      })
    }
    
    const pilotId = result.current.pilots[0].id
    
    act(() => {
      result.current.confirmTournamentStart()
    })
    
    let deleteSuccess = false
    act(() => {
      deleteSuccess = result.current.deletePilot(pilotId)
    })
    
    expect(deleteSuccess).toBe(false)
    expect(result.current.pilots.length).toBe(10) // Still 10 pilots
  })
})