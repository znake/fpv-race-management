/**
 * Tests for Story 11-4: Heat-Status Indikatoren
 * 
 * AC1: Abgeschlossene Heats zeigen Checkmark
 * AC2: Nicht abgeschlossene Heats haben keinen Indikator
 * AC3: Checkmark-Farbe passt zum Bracket-Typ (WB=grün, LB=rot, GF=gold)
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeatCard } from '../src/components/ui/heat-card'
import type { Pilot, HeatResults, RankPosition } from '../src/lib/schemas'

// Test pilots factory
function createTestPilots(): Pilot[] {
  return [
    { id: 'p1', name: 'Pilot 1', imageUrl: '', status: 'active' },
    { id: 'p2', name: 'Pilot 2', imageUrl: '', status: 'active' },
    { id: 'p3', name: 'Pilot 3', imageUrl: '', status: 'active' },
    { id: 'p4', name: 'Pilot 4', imageUrl: '', status: 'active' },
  ]
}

// Helper to create properly typed results
function createResults(): HeatResults {
  return {
    rankings: [
      { pilotId: 'p1', rank: 1 as RankPosition },
      { pilotId: 'p2', rank: 2 as RankPosition },
      { pilotId: 'p3', rank: 3 as RankPosition },
      { pilotId: 'p4', rank: 4 as RankPosition },
    ]
  }
}

describe('Story 11-4: Heat-Status Indikatoren', () => {
  describe('AC1: Abgeschlossene Heats zeigen Checkmark', () => {
    it('should show checkmark (✓) for completed heats', () => {
      const pilots = createTestPilots()
      const results = createResults()

      render(
        <HeatCard
          variant="filled"
          heatNumber={1}
          pilots={pilots}
          pilotIds={['p1', 'p2', 'p3', 'p4']}
          results={results}
          status="completed"
          bracketType="winner"
        />
      )

      const statusIndicator = screen.getByTestId('heat-status-indicator')
      expect(statusIndicator).toBeTruthy()
      expect(statusIndicator.textContent).toBe('✓')
    })

    it('should display checkmark in heat header area', () => {
      const pilots = createTestPilots()
      const results = createResults()

      render(
        <HeatCard
          variant="filled"
          heatNumber={5}
          pilots={pilots}
          pilotIds={['p1', 'p2', 'p3', 'p4']}
          results={results}
          status="completed"
          bracketType="winner"
        />
      )

      // Verify the heat header contains both the heat number and the checkmark
      const statusIndicator = screen.getByTestId('heat-status-indicator')
      expect(statusIndicator.closest('div')).toBeTruthy()
      // The parent div should contain "HEAT 5"
      const header = statusIndicator.parentElement
      expect(header?.textContent).toContain('HEAT 5')
      expect(header?.textContent).toContain('✓')
    })
  })

  describe('AC2: Nicht abgeschlossene Heats haben keinen Indikator', () => {
    it('should NOT show status indicator for pending heats', () => {
      const pilots = createTestPilots()

      render(
        <HeatCard
          variant="filled"
          heatNumber={1}
          pilots={pilots}
          pilotIds={['p1', 'p2', 'p3', 'p4']}
          status="pending"
          bracketType="winner"
        />
      )

      const statusIndicator = screen.queryByTestId('heat-status-indicator')
      expect(statusIndicator).toBeNull()
    })

    it('should NOT show status indicator for active heats', () => {
      const pilots = createTestPilots()

      render(
        <HeatCard
          variant="filled"
          heatNumber={1}
          pilots={pilots}
          pilotIds={['p1', 'p2', 'p3', 'p4']}
          status="active"
          bracketType="winner"
        />
      )

      const statusIndicator = screen.queryByTestId('heat-status-indicator')
      expect(statusIndicator).toBeNull()
    })

    it('should NOT show status indicator for empty heats', () => {
      const pilots = createTestPilots()

      render(
        <HeatCard
          variant="filled"
          heatNumber={1}
          pilots={pilots}
          pilotIds={['p1', 'p2', 'p3', 'p4']}
          status="empty"
          bracketType="winner"
        />
      )

      const statusIndicator = screen.queryByTestId('heat-status-indicator')
      expect(statusIndicator).toBeNull()
    })
  })

  describe('AC3: Checkmark-Farbe passt zum Bracket-Typ', () => {
    it('should have green checkmark for completed WB heat', () => {
      const pilots = createTestPilots()
      const results = createResults()

      render(
        <HeatCard
          variant="filled"
          heatNumber={1}
          pilots={pilots}
          pilotIds={['p1', 'p2', 'p3', 'p4']}
          results={results}
          status="completed"
          bracketType="winner"
        />
      )

      const statusIndicator = screen.getByTestId('heat-status-indicator')
      // Should have base class 'heat-status' (which is green by default)
      expect(statusIndicator.classList.contains('heat-status')).toBe(true)
      // Should NOT have 'lb' or 'gf' modifier
      expect(statusIndicator.classList.contains('lb')).toBe(false)
      expect(statusIndicator.classList.contains('gf')).toBe(false)
    })

    it('should have red checkmark for completed LB heat', () => {
      const pilots = createTestPilots()
      const results = createResults()

      render(
        <HeatCard
          variant="filled"
          heatNumber={1}
          pilots={pilots}
          pilotIds={['p1', 'p2', 'p3', 'p4']}
          results={results}
          status="completed"
          bracketType="loser"
        />
      )

      const statusIndicator = screen.getByTestId('heat-status-indicator')
      // Should have 'heat-status lb' classes
      expect(statusIndicator.classList.contains('heat-status')).toBe(true)
      expect(statusIndicator.classList.contains('lb')).toBe(true)
    })

    it('should have gold checkmark for completed Grand Finale', () => {
      const pilots = createTestPilots()
      const results = createResults()

      render(
        <HeatCard
          variant="filled"
          heatNumber={1}
          pilots={pilots}
          pilotIds={['p1', 'p2', 'p3', 'p4']}
          results={results}
          status="completed"
          bracketType="finale"
        />
      )

      const statusIndicator = screen.getByTestId('heat-status-indicator')
      // Should have 'heat-status gf' classes
      expect(statusIndicator.classList.contains('heat-status')).toBe(true)
      expect(statusIndicator.classList.contains('gf')).toBe(true)
    })
  })

  describe('Integration: Status indicator with different heat states', () => {
    it('should correctly transition from no indicator to checkmark when heat completes', () => {
      const pilots = createTestPilots()
      const results = createResults()

      // First render as pending - no indicator
      const { rerender } = render(
        <HeatCard
          variant="filled"
          heatNumber={1}
          pilots={pilots}
          pilotIds={['p1', 'p2', 'p3', 'p4']}
          status="pending"
          bracketType="winner"
        />
      )

      expect(screen.queryByTestId('heat-status-indicator')).toBeNull()

      // Re-render as completed - should show indicator
      rerender(
        <HeatCard
          variant="filled"
          heatNumber={1}
          pilots={pilots}
          pilotIds={['p1', 'p2', 'p3', 'p4']}
          results={results}
          status="completed"
          bracketType="winner"
        />
      )

      const indicator = screen.getByTestId('heat-status-indicator')
      expect(indicator).toBeTruthy()
      expect(indicator.textContent).toBe('✓')
    })
  })
})
