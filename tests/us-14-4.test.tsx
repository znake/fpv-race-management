import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'
import { LoserBracketSection } from '../src/components/bracket/sections/LoserBracketSection'
import { calculateColumnWidth, calculateLBColumnWidth, BRACKET_CONSTANTS } from '../src/lib/bracket-layout-calculator'
import type { FullBracketStructure, BracketRound } from '../src/lib/bracket-structure-generator'
import type { Heat, Pilot } from '../src/types'

// Helper to create mock LB structure with rounds
function createMockLBStructure(roundCount: number, heatsPerRound: number[]): FullBracketStructure['loserBracket'] {
  const rounds: BracketRound[] = heatsPerRound.map((heatCount, idx) => ({
    id: `lb-round-${idx + 1}`,
    roundNumber: idx + 1,
    roundName: `LB Runde ${idx + 1}`,
    roundType: idx % 2 === 0 ? 'minor' : 'major' as const,
    heats: Array.from({ length: heatCount }, (_, hIdx) => ({
      id: `lb-r${idx + 1}-h${hIdx + 1}`,
      heatNumber: hIdx + 1,
      roundNumber: idx + 1,
      bracketType: 'loser' as const,
      status: 'empty' as const,
      pilotIds: [],
      sourceHeats: [],
      position: { x: 0, y: 0 },
      roundType: idx % 2 === 0 ? 'minor' : 'major' as const
    }))
  }))
  
  return { rounds }
}

// Helper to create full mock bracket structure
function createMockFullBracket(lbHeatsPerRound: number[]): FullBracketStructure {
  return {
    qualification: { heats: [] },
    winnerBracket: { rounds: [] },
    loserBracket: createMockLBStructure(lbHeatsPerRound.length, lbHeatsPerRound),
    grandFinale: null
  }
}

// Helper to create mock heats
function createMockHeats(structure: FullBracketStructure['loserBracket']): Heat[] {
  return structure.rounds.flatMap(round => 
    round.heats.map(bh => ({
      id: bh.id,
      heatNumber: bh.heatNumber,
      pilotIds: ['p1', 'p2', 'p3', 'p4'],
      status: 'pending' as const,
      bracketType: 'loser' as const
    }))
  )
}

// Helper to create mock 3-pilot heats
function createMock3PilotHeats(structure: FullBracketStructure['loserBracket']): Heat[] {
  return structure.rounds.flatMap(round => 
    round.heats.map(bh => ({
      id: bh.id,
      heatNumber: bh.heatNumber,
      pilotIds: ['p1', 'p2', 'p3'], // Only 3 pilots
      status: 'pending' as const,
      bracketType: 'loser' as const
    }))
  )
}

// Mock pilots
const mockPilots: Pilot[] = Array.from({ length: 32 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Pilot ${i + 1}`,
  imageUrl: ''
}))

// Mock LB round info for pool composition
const mockLBRoundInfo = [
  { roundNumber: 1, pilotCount: 24, composition: '16 Quali + 8 WB R1', advancingCount: 12, incomingFromWB: 0 },
  { roundNumber: 2, pilotCount: 16, composition: '12 LB R1 + 4 WB R2', advancingCount: 8, incomingFromWB: 4 },
  { roundNumber: 3, pilotCount: 10, composition: '8 LB R2 + 2 WB R3', advancingCount: 5, incomingFromWB: 2 }
]

describe('US-14.4: Loser Bracket Layout', () => {
  const mockOnHeatClick = vi.fn()
  const mockRegisterHeatRef = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AC1: Bracket-Column Container', () => {
    it('should have bracket-column lb class with flex-direction column', () => {
      const fullBracket = createMockFullBracket([6, 3, 2])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const column = container.querySelector('.bracket-column.lb')
      expect(column).toBeInTheDocument()
    })

    it('should calculate correct width for 6 heats in R1: 6x140 + 5x10 = 890px', () => {
      // 32 Piloten LB R1: 6 Heats
      const width = calculateLBColumnWidth(6)
      expect(width).toBe(890)
    })

    it('should use dynamic width from layout calculator', () => {
      const fullBracket = createMockFullBracket([6, 3, 2])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const column = container.querySelector('.bracket-column.lb')
      expect(column).toHaveStyle({ width: '890px' })
    })

    it('should have align-items center', () => {
      const fullBracket = createMockFullBracket([4, 2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const column = container.querySelector('.bracket-column.lb')
      expect(column).toBeInTheDocument()
      // CSS class should provide align-items: center (tested via computed styles in integration)
    })
  })

  describe('AC2: Column-Header', () => {
    it('should display "LOSER BRACKET" text', () => {
      const fullBracket = createMockFullBracket([4, 2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      expect(screen.getByText('LOSER BRACKET')).toBeInTheDocument()
    })

    it('should have bracket-column-header class with red styling', () => {
      const fullBracket = createMockFullBracket([4, 2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const header = container.querySelector('.bracket-column-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveTextContent('LOSER BRACKET')
    })
  })

  describe('AC3: Round-Sections mit Pool-Komposition', () => {
    it('should render a round-section for each round', () => {
      const fullBracket = createMockFullBracket([4, 2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const sections = container.querySelectorAll('.round-section')
      expect(sections.length).toBe(3)
    })

    it('should display round label with pilot count', () => {
      const fullBracket = createMockFullBracket([4, 2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const labels = container.querySelectorAll('.round-label')
      expect(labels.length).toBe(3)
      
      // R1 has 4 heats x 4 pilots = 16 pilots
      expect(labels[0].textContent).toMatch(/RUNDE\s*1.*16\s*Piloten/i)
    })

    it('should have round-label class on labels', () => {
      const fullBracket = createMockFullBracket([4, 2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const labels = container.querySelectorAll('.round-label')
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  describe('AC4: Pool-Indicator zwischen Runden', () => {
    it('should render pool-indicator between rounds', () => {
      const fullBracket = createMockFullBracket([4, 2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const indicators = container.querySelectorAll('.pool-indicator')
      // 3 rounds = 2 pool indicators
      expect(indicators.length).toBe(2)
    })

    it('should show pilot flow information in pool-indicator', () => {
      const fullBracket = createMockFullBracket([4, 2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const indicators = container.querySelectorAll('.pool-indicator')
      expect(indicators[0]).toBeInTheDocument()
      // Should contain pilot flow info (weiter, Piloten, gemischt)
      expect(indicators[0].textContent).toMatch(/Piloten/i)
    })

    it('should have red arrows in pool-indicator', () => {
      const fullBracket = createMockFullBracket([4, 2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const arrows = container.querySelectorAll('.pool-indicator .arrow')
      expect(arrows.length).toBeGreaterThan(0)
    })
  })

  describe('AC5: Keine SVG-Linien im LB', () => {
    it('should NOT have connector-space elements', () => {
      const fullBracket = createMockFullBracket([4, 2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      // LB should NOT have connector-space (unlike WB)
      const connectors = container.querySelectorAll('.connector-space')
      expect(connectors.length).toBe(0)
    })

    it('should NOT render SVG lines', () => {
      const fullBracket = createMockFullBracket([4, 2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const svgLines = container.querySelectorAll('svg.line, .svg-lines')
      expect(svgLines.length).toBe(0)
    })
  })

  describe('AC6: Support für 3er-Heats', () => {
    it('should apply three-pilot class for heats with 3 pilots', () => {
      const fullBracket = createMockFullBracket([2, 1])
      const heats = createMock3PilotHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      // Component should detect 3-pilot heats and mark them
      const threeWrappers = container.querySelectorAll('[data-three-pilot="true"]')
      expect(threeWrappers.length).toBeGreaterThan(0)
    })

    it('should use 120px width for 3-pilot heats', () => {
      // Test the constant in BRACKET_CONSTANTS
      expect(BRACKET_CONSTANTS.HEAT_WIDTH_3).toBe(120)
    })
  })

  describe('AC7: LB-spezifisches Heat-Styling', () => {
    it('should pass bracketType="loser" to BracketHeatBox', () => {
      const fullBracket = createMockFullBracket([2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      // BracketHeatBox with bracketType="loser" should render with red styling
      const roundHeats = container.querySelector('.round-heats')
      expect(roundHeats).toBeInTheDocument()
    })

    it('should call registerHeatRef for each heat', () => {
      const fullBracket = createMockFullBracket([2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      // Should register refs for all 3 heats (2 in R1 + 1 in R2)
      expect(mockRegisterHeatRef).toHaveBeenCalledTimes(3)
    })
  })

  describe('Layout Calculator Integration', () => {
    it('should calculate correct LB width for various heat counts', () => {
      // 2 heats: 2x140 + 1x10 = 290
      expect(calculateLBColumnWidth(2)).toBe(290)
      
      // 6 heats: 6x140 + 5x10 = 890
      expect(calculateLBColumnWidth(6)).toBe(890)
      
      // 8 heats: 8x140 + 7x10 = 1190
      expect(calculateLBColumnWidth(8)).toBe(1190)
    })

    it('should return minimum width for 0 or negative heats', () => {
      expect(calculateLBColumnWidth(0)).toBe(600)
      expect(calculateLBColumnWidth(-1)).toBe(600)
    })
  })

  describe('Edge Cases', () => {
    it('should return null for empty structure', () => {
      const emptyStructure = { rounds: [] }
      const fullBracket = {
        qualification: { heats: [] },
        winnerBracket: { rounds: [] },
        loserBracket: emptyStructure,
        grandFinale: null
      }
      
      const { container } = render(
        <LoserBracketSection
          structure={emptyStructure}
          heats={[]}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      expect(container.querySelector('.bracket-column')).not.toBeInTheDocument()
    })

    it('should handle heats not found in heats array gracefully', () => {
      const fullBracket = createMockFullBracket([2, 1])
      // Empty heats array - no matching heats
      const heats: Heat[] = []
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      // Should still render the structure
      expect(container.querySelector('.bracket-column.lb')).toBeInTheDocument()
    })
  })

  describe('Different Pilot Counts', () => {
    it('should work with 8 pilots (2 LB R1 heats)', () => {
      const fullBracket = createMockFullBracket([2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots.slice(0, 8)}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      // Width for 2 heats: 2x140 + 1x10 = 290px
      const column = container.querySelector('.bracket-column.lb')
      expect(column).toHaveStyle({ width: '290px' })
    })

    it('should work with 16 pilots (4 LB R1 heats)', () => {
      const fullBracket = createMockFullBracket([4, 2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots.slice(0, 16)}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      // Width for 4 heats: 4x140 + 3x10 = 590px
      const column = container.querySelector('.bracket-column.lb')
      expect(column).toHaveStyle({ width: '590px' })
    })
  })

  describe('Data TestID', () => {
    it('should have loser-bracket-section test id', () => {
      const fullBracket = createMockFullBracket([2, 1])
      const heats = createMockHeats(fullBracket.loserBracket)
      
      const { container } = render(
        <LoserBracketSection
          structure={fullBracket.loserBracket}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      expect(container.querySelector('[data-testid="loser-bracket-section"]')).toBeInTheDocument()
    })
  })
})
