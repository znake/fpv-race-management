import { describe, it, expect, beforeEach } from 'vitest'
import { calculateSvgPaths } from '../src/lib/svg-connections'
import type { BracketStructure } from '../src/lib/bracket-calculator'

describe('SVG Connection Lines', () => {
  let mockBracketStructure: BracketStructure

  beforeEach(() => {
    // Mock bracket structure with winner and loser rounds
    mockBracketStructure = {
      winnerRounds: [
        {
          id: 'winner-round-1',
          roundNumber: 1,
          bracketType: 'winner',
          heats: [
            {
              heatId: 'heat-1',
              position: { x: 100, y: 50 },
              sourceHeats: ['p1', 'p2', 'p3', 'p4'],
              targetHeat: 'winner-semi-final'
            },
            {
              heatId: 'heat-2',
              position: { x: 100, y: 170 },
              sourceHeats: ['p5', 'p6', 'p7', 'p8'],
              targetHeat: 'winner-semi-final'
            }
          ]
        },
        {
          id: 'winner-semi-final',
          roundNumber: 2,
          bracketType: 'winner',
          heats: [
            {
              heatId: 'winner-semi-final',
              position: { x: 250, y: 110 },
              sourceHeats: ['heat-1', 'heat-2'],
              targetHeat: 'finale'
            }
          ]
        }
      ],
      loserRounds: [
        {
          id: 'loser-round-1',
          roundNumber: 1,
          bracketType: 'loser',
          heats: [
            {
              heatId: 'loser-heat-1',
              position: { x: 100, y: 290 },
              sourceHeats: ['p3', 'p4'],
              targetHeat: 'loser-semi-final'
            }
          ]
        },
        {
          id: 'loser-semi-final',
          roundNumber: 2,
          bracketType: 'loser',
          heats: [
            {
              heatId: 'loser-semi-final',
              position: { x: 250, y: 290 },
              sourceHeats: ['loser-heat-1'],
              targetHeat: undefined
            }
          ]
        }
      ],
      finale: {
        id: 'finale',
        roundNumber: 99,
        bracketType: 'finale',
        heats: [
          {
            heatId: 'grand-finale',
            position: { x: 400, y: 110 },
            sourceHeats: ['winner-semi-final']
          }
        ]
      }
    }
  })

  it('should generate SVG paths for winner bracket connections', () => {
    const svgPaths = calculateSvgPaths(mockBracketStructure)
    
    const winnerPaths = svgPaths.filter(path => path.type === 'winner')
    expect(winnerPaths.length).toBeGreaterThan(0)
    
    // Should have paths from heat-1 to winner-semi-final
    expect(winnerPaths.some(path => 
      path.from === 'heat-1' && path.to === 'winner-semi-final'
    )).toBe(true)
    
    // Should have paths from heat-2 to winner-semi-final
    expect(winnerPaths.some(path => 
      path.from === 'heat-2' && path.to === 'winner-semi-final'
    )).toBe(true)
  })

  it('should generate SVG paths for loser bracket connections', () => {
    const svgPaths = calculateSvgPaths(mockBracketStructure)
    
    const loserPaths = svgPaths.filter(path => path.type === 'loser')
    
    // Should have loser path if loser-heat-1 has targetHeat
    if (mockBracketStructure.loserRounds[0].heats[0].targetHeat) {
      expect(loserPaths.length).toBeGreaterThan(0)
    }
  })

  it('should calculate correct SVG path coordinates', () => {
    const svgPaths = calculateSvgPaths(mockBracketStructure)
    
    const testPath = svgPaths.find(path => 
      path.from === 'heat-1' && path.to === 'winner-semi-final'
    )
    
    expect(testPath).toBeDefined()
    expect(testPath?.d).toMatch(/^M/) // SVG path should start with Move command
    expect(testPath?.stroke).toBe('var(--winner-green)')
  })

  it('should handle empty bracket structure', () => {
    const emptyBracket: BracketStructure = {
      winnerRounds: [],
      loserRounds: []
    }
    
    const svgPaths = calculateSvgPaths(emptyBracket)
    expect(svgPaths).toEqual([])
  })

  it('should handle bracket without finale', () => {
    const bracketWithoutFinale: BracketStructure = {
      winnerRounds: mockBracketStructure.winnerRounds,
      loserRounds: []
    }
    
    const svgPaths = calculateSvgPaths(bracketWithoutFinale)
    expect(svgPaths.length).toBeGreaterThan(0) // Should still have winner bracket paths
  })

  it('should apply correct colors based on bracket type', () => {
    const svgPaths = calculateSvgPaths(mockBracketStructure)
    
    svgPaths.forEach(path => {
      if (path.type === 'winner') {
        expect(path.stroke).toBe('var(--winner-green)')
      } else if (path.type === 'loser') {
        expect(path.stroke).toBe('var(--loser-red)')
      }
    })
  })
})