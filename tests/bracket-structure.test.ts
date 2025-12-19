import { describe, it, expect, beforeEach } from 'vitest'
import type { Heat, Pilot } from '../src/stores/tournamentStore'
import type { Pilot as PilotSchema } from '../src/lib/schemas'
import { calculateBracketStructure } from '../src/lib/bracket-calculator'

// Mock types for bracket structure
interface BracketRound {
  id: string
  roundNumber: number
  bracketType: 'winner' | 'loser' | 'finale'
  heats: BracketHeat[]
}

interface BracketHeat {
  heatId: string
  position: { x: number; y: number }
  sourceHeats?: string[]
  targetHeat?: string
}

interface BracketStructure {
  winnerRounds: BracketRound[]
  loserRounds: BracketRound[]
  finale?: BracketRound
}

// Test data factory
const createMockPilot = (id: string, name: string): PilotSchema => ({
  id,
  name,
  imageUrl: `https://example.com/${id}.jpg`,
  instagramHandle: `@${name.toLowerCase()}`
})

const createMockHeat = (
  heatNumber: number, 
  pilotIds: string[], 
  status: Heat['status'] = 'pending'
): Heat => ({
  id: `heat-${heatNumber}`,
  heatNumber,
  pilotIds,
  status
})

describe('Bracket Structure Calculation', () => {
  let mockPilots: PilotSchema[]
  let mockHeats: Heat[]

  beforeEach(() => {
    // Setup test data with 8 pilots (2 heats of 4)
    mockPilots = [
      createMockPilot('p1', 'Pilot1'),
      createMockPilot('p2', 'Pilot2'),
      createMockPilot('p3', 'Pilot3'),
      createMockPilot('p4', 'Pilot4'),
      createMockPilot('p5', 'Pilot5'),
      createMockPilot('p6', 'Pilot6'),
      createMockPilot('p7', 'Pilot7'),
      createMockPilot('p8', 'Pilot8'),
    ]

    mockHeats = [
      createMockHeat(1, ['p1', 'p2', 'p3', 'p4'], 'completed'),
      createMockHeat(2, ['p5', 'p6', 'p7', 'p8'], 'active'),
    ]
  })

  it('should calculate winner bracket rounds from completed heats', () => {
    // This test will drive the implementation of bracket calculation
    const bracketStructure = calculateBracketStructure(mockHeats, mockPilots)
    
    // Should have winner bracket rounds
    expect(bracketStructure.winnerRounds).toBeDefined()
    expect(bracketStructure.winnerRounds.length).toBeGreaterThan(0)
    
    // Should have loser bracket rounds
    expect(bracketStructure.loserRounds).toBeDefined()
    expect(bracketStructure.loserRounds.length).toBeGreaterThanOrEqual(0)
  })

  it('should correctly assign pilots to winner/loser brackets based on rankings', () => {
    // Setup heat with results
    const heatsWithResults = [
      {
        ...mockHeats[0],
        results: {
          rankings: [
            { pilotId: 'p1', rank: 1 as const },
            { pilotId: 'p2', rank: 2 as const },
            { pilotId: 'p3', rank: 3 as const },
            { pilotId: 'p4', rank: 4 as const }
          ],
          completedAt: new Date().toISOString()
        }
      }
    ]

    const bracketStructure = calculateBracketStructure(heatsWithResults, mockPilots)
    
    // Should track which pilots go to winner vs loser bracket
    const winnerHeatPilots = bracketStructure.winnerRounds
      .flatMap(round => round.heats)
      .flatMap(heat => heat.sourceHeats || [])
    
    expect(winnerHeatPilots).toContain('p1') // Rank 1 → Winner
    expect(winnerHeatPilots).toContain('p2') // Rank 2 → Winner
  })

  it('should handle empty heats list', () => {
    const bracketStructure = calculateBracketStructure([], mockPilots)
    
    expect(bracketStructure.winnerRounds).toEqual([])
    expect(bracketStructure.loserRounds).toEqual([])
    expect(bracketStructure.finale).toBeUndefined()
  })

  it('should position heats correctly for SVG rendering', () => {
    const bracketStructure = calculateBracketStructure(mockHeats, mockPilots)
    
    // All heats should have x, y positions
    const allHeats = [
      ...bracketStructure.winnerRounds.flatMap(r => r.heats),
      ...bracketStructure.loserRounds.flatMap(r => r.heats)
    ]
    
    allHeats.forEach(heat => {
      expect(heat.position.x).toBeDefined()
      expect(heat.position.y).toBeDefined()
      expect(typeof heat.position.x).toBe('number')
      expect(typeof heat.position.y).toBe('number')
    })
  })
})

