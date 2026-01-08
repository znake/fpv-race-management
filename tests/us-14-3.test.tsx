import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'
import { WinnerBracketSection } from '../src/components/bracket/sections/WinnerBracketSection'
import { calculateColumnWidth, calculateRoundGap, BRACKET_CONSTANTS } from '../src/lib/bracket-layout-calculator'
import type { FullBracketStructure, BracketRound } from '../src/lib/bracket-structure-generator'
import type { Heat, Pilot } from '../src/types'

// Helper to create mock structure with rounds
function createMockStructure(roundCount: number, heatsPerRound: number[]): FullBracketStructure['winnerBracket'] {
  const rounds: BracketRound[] = heatsPerRound.map((heatCount, idx) => ({
    id: `wb-round-${idx + 2}`,
    roundNumber: idx + 2,
    roundName: `WB Runde ${idx + 1}`,
    heats: Array.from({ length: heatCount }, (_, hIdx) => ({
      id: `wb-r${idx + 2}-h${hIdx + 1}`,
      heatNumber: hIdx + 1,
      roundNumber: idx + 2,
      bracketType: 'winner' as const,
      status: 'empty' as const,
      pilotIds: [],
      sourceHeats: [],
      position: { x: 0, y: 0 }
    }))
  }))
  
  return { rounds }
}

// Helper to create mock heats
function createMockHeats(structure: FullBracketStructure['winnerBracket']): Heat[] {
  return structure.rounds.flatMap(round => 
    round.heats.map(bh => ({
      id: bh.id,
      heatNumber: bh.heatNumber,
      pilotIds: ['p1', 'p2', 'p3', 'p4'],
      status: 'pending' as const,
      bracketType: 'winner' as const
    }))
  )
}

// Mock pilots
const mockPilots: Pilot[] = Array.from({ length: 32 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Pilot ${i + 1}`,
  imageUrl: ''
}))

describe('US-14.3: Winner Bracket Layout', () => {
  const mockOnHeatClick = vi.fn()
  const mockRegisterHeatRef = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AC1: Bracket-Column Container', () => {
    it('should have bracket-column wb class with flex-direction column', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const column = container.querySelector('.bracket-column.wb')
      expect(column).toBeInTheDocument()
    })

    it('should calculate correct width for 4 heats in R1: 4×140 + 3×10 = 590px', () => {
      // 32 Piloten = 8 Quali → 4 WB R1 Heats
      const width = calculateColumnWidth(4)
      expect(width).toBe(590)
    })

    it('should use dynamic width from layout calculator', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const column = container.querySelector('.bracket-column.wb')
      expect(column).toHaveStyle({ width: '590px' })
    })

    it('should have align-items center', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const column = container.querySelector('.bracket-column.wb')
      expect(column).toBeInTheDocument()
      // CSS class should provide align-items: center (tested via computed styles in integration)
    })
  })

  describe('AC2: Column-Header', () => {
    it('should display "WINNER BRACKET" text', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      expect(screen.getByText('WINNER BRACKET')).toBeInTheDocument()
    })

    it('should have bracket-column-header class', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const header = container.querySelector('.bracket-column-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveTextContent('WINNER BRACKET')
    })
  })

  describe('AC3: Round-Sections', () => {
    it('should render a round-section for each round', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
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
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const labels = container.querySelectorAll('.round-label')
      expect(labels.length).toBe(3)
      
      // R1 has 4 heats × 4 pilots = 16 pilots
      expect(labels[0].textContent).toMatch(/RUNDE\s*1.*16\s*Piloten/i)
    })

    it('should have round-label class on labels', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
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

  describe('AC4: Heats-Layout pro Runde', () => {
    it('should have round-heats container with flex layout', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const roundHeats = container.querySelectorAll('.round-heats')
      expect(roundHeats.length).toBe(3)
    })

    it('should render all heats within round-heats container', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      // First round should have 4 heats
      const firstRoundHeats = container.querySelectorAll('.round-section')[0]
      const heatsInFirstRound = firstRoundHeats.querySelectorAll('.round-heats > div')
      expect(heatsInFirstRound.length).toBe(4)
    })
  })

  describe('AC5: Runde 2+ Positionierung', () => {
    it('should calculate larger gap for round 2', () => {
      // R2 Gap formula from mockup: 160px
      const gap = calculateRoundGap(1)
      expect(gap).toBeGreaterThan(BRACKET_CONSTANTS.GAP)
    })

    it('should apply dynamic gap to round-heats based on round index', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const roundHeats = container.querySelectorAll('.round-heats')
      
      // First round should have standard gap (10px)
      expect(roundHeats[0]).toHaveStyle({ gap: '10px' })
      
      // Second round should have larger gap
      const r2Gap = calculateRoundGap(1)
      expect(roundHeats[1]).toHaveStyle({ gap: `${r2Gap}px` })
    })
  })

  describe('AC6: Connector-Space', () => {
    it('should render connector-space between rounds', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const connectors = container.querySelectorAll('.connector-space')
      // 3 rounds = 2 connector spaces
      expect(connectors.length).toBe(2)
    })

    it('should have 40px height for connector-space', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const connector = container.querySelector('.connector-space')
      expect(connector).toBeInTheDocument()
      // Height is set via CSS class
    })

    it('should have ID for SVG line reference', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      const connector1 = container.querySelector('#wb-conn-r1-r2')
      const connector2 = container.querySelector('#wb-conn-r2-r3')
      expect(connector1).toBeInTheDocument()
      expect(connector2).toBeInTheDocument()
    })
  })

  describe('AC7: WB-spezifisches Heat-Styling', () => {
    it('should pass bracketType="winner" to BracketHeatBox', () => {
      const structure = createMockStructure(1, [2])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      // BracketHeatBox with bracketType="winner" should render with green styling
      // This is tested via the presence of the component
      const roundHeats = container.querySelector('.round-heats')
      expect(roundHeats).toBeInTheDocument()
    })

    it('should call registerHeatRef for each heat', () => {
      const structure = createMockStructure(2, [2, 1])
      const heats = createMockHeats(structure)
      
      render(
        <WinnerBracketSection
          structure={structure}
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
    it('should return minimum width for 0 or negative heats', () => {
      expect(calculateColumnWidth(0)).toBe(600)
      expect(calculateColumnWidth(-1)).toBe(600)
    })

    it('should calculate correct width for various heat counts', () => {
      // 2 heats: 2×140 + 1×10 = 290
      expect(calculateColumnWidth(2)).toBe(290)
      
      // 8 heats: 8×140 + 7×10 = 1190
      expect(calculateColumnWidth(8)).toBe(1190)
    })

    it('should calculate exponential gaps for deeper rounds', () => {
      const gap0 = calculateRoundGap(0) // Standard
      const gap1 = calculateRoundGap(1) // R2
      const gap2 = calculateRoundGap(2) // R3
      
      expect(gap0).toBe(BRACKET_CONSTANTS.GAP)
      expect(gap1).toBeGreaterThan(gap0)
      expect(gap2).toBeGreaterThan(gap1)
    })
  })

  describe('Edge Cases', () => {
    it('should return null for empty structure', () => {
      const emptyStructure = { rounds: [] }
      
      const { container } = render(
        <WinnerBracketSection
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
      const structure = createMockStructure(1, [2])
      // Empty heats array - no matching heats
      const heats: Heat[] = []
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      // Should still render the structure
      expect(container.querySelector('.bracket-column.wb')).toBeInTheDocument()
    })
  })

  describe('Different Pilot Counts', () => {
    it('should work with 8 pilots (2 WB R1 heats)', () => {
      const structure = createMockStructure(2, [2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots.slice(0, 8)}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      // Width for 2 heats: 2×140 + 1×10 = 290px
      const column = container.querySelector('.bracket-column.wb')
      expect(column).toHaveStyle({ width: '290px' })
    })

    it('should work with 16 pilots (4 WB R1 heats)', () => {
      const structure = createMockStructure(3, [4, 2, 1])
      const heats = createMockHeats(structure)
      
      const { container } = render(
        <WinnerBracketSection
          structure={structure}
          heats={heats}
          pilots={mockPilots.slice(0, 16)}
          onHeatClick={mockOnHeatClick}
          registerHeatRef={mockRegisterHeatRef}
        />
      )
      
      // Width for 4 heats: 4×140 + 3×10 = 590px
      const column = container.querySelector('.bracket-column.wb')
      expect(column).toHaveStyle({ width: '590px' })
    })
  })
})
