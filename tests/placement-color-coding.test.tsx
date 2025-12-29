/**
 * Tests for Story 11-3: Platzierungs-Farbcodierung in Heats
 * 
 * AC1: Weiterkommer sind grün markiert (Platz 1+2)
 * AC2: Eliminierte sind rot markiert (Platz 3+4)
 * AC3: Nicht abgeschlossene Heats haben keine Markierung
 * AC4: Champion im Grand Finale hat goldene Markierung
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HeatCard } from '../src/components/ui/heat-card'
import { getPilotRowClass } from '../src/lib/ui-helpers'
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

describe('Story 11-3: Platzierungs-Farbcodierung', () => {
  describe('getPilotRowClass Helper Function', () => {
    it('should return empty string for non-completed heats', () => {
      expect(getPilotRowClass(1, 'pending', false)).toBe('')
      expect(getPilotRowClass(2, 'active', false)).toBe('')
      expect(getPilotRowClass(3, 'empty', false)).toBe('')
    })

    it('should return "top" for rank 1 and 2 in completed heat', () => {
      expect(getPilotRowClass(1, 'completed', false)).toBe('top')
      expect(getPilotRowClass(2, 'completed', false)).toBe('top')
    })

    it('should return "bottom" for rank 3 and 4 in completed heat', () => {
      expect(getPilotRowClass(3, 'completed', false)).toBe('bottom')
      expect(getPilotRowClass(4, 'completed', false)).toBe('bottom')
    })

    it('should return "champ" for rank 1 in grand finale', () => {
      expect(getPilotRowClass(1, 'completed', true)).toBe('champ')
    })

    it('should return "top" for rank 2 in grand finale', () => {
      expect(getPilotRowClass(2, 'completed', true)).toBe('top')
    })

    it('should return "bottom" for rank 3 and 4 in grand finale', () => {
      expect(getPilotRowClass(3, 'completed', true)).toBe('bottom')
      expect(getPilotRowClass(4, 'completed', true)).toBe('bottom')
    })
  })

  describe('AC1: Weiterkommer sind grün markiert', () => {
    it('should apply green background and border to rank 1 and 2 in completed heat', () => {
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

      // Get all pilot rows
      const pilotRows = document.querySelectorAll('.pilot-row')
      expect(pilotRows.length).toBe(4)

      // First two (rank 1 and 2) should have 'top' class
      expect(pilotRows[0].classList.contains('top')).toBe(true)
      expect(pilotRows[1].classList.contains('top')).toBe(true)
    })
  })

  describe('AC2: Eliminierte sind rot markiert', () => {
    it('should apply red background and border to rank 3 and 4 in completed heat', () => {
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

      // Get all pilot rows
      const pilotRows = document.querySelectorAll('.pilot-row')
      
      // Rank 3 and 4 should have 'bottom' class
      expect(pilotRows[2].classList.contains('bottom')).toBe(true)
      expect(pilotRows[3].classList.contains('bottom')).toBe(true)
    })
  })

  describe('AC3: Nicht abgeschlossene Heats haben keine Markierung', () => {
    it('should not apply color classes to pending heats', () => {
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

      // Get all pilot rows
      const pilotRows = document.querySelectorAll('.pilot-row')
      
      // No pilot rows should have top or bottom class
      pilotRows.forEach(row => {
        expect(row.classList.contains('top')).toBe(false)
        expect(row.classList.contains('bottom')).toBe(false)
        expect(row.classList.contains('champ')).toBe(false)
      })
    })

    it('should not apply color classes to active heats', () => {
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

      const pilotRows = document.querySelectorAll('.pilot-row')
      
      pilotRows.forEach(row => {
        expect(row.classList.contains('top')).toBe(false)
        expect(row.classList.contains('bottom')).toBe(false)
      })
    })
  })

  describe('AC4: Champion hat goldene Markierung im Grand Finale', () => {
    it('should apply gold/champ class to rank 1 in completed grand finale', () => {
      const pilots = createTestPilots()
      const results = createResults()

      // Grand Finale is indicated by bracketType="finale" 
      // and we need to add isGrandFinale prop
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

      const pilotRows = document.querySelectorAll('.pilot-row')
      
      // Champion (rank 1) should have 'champ' class in finale
      expect(pilotRows[0].classList.contains('champ')).toBe(true)
      
      // Others should have 'top' or 'bottom' depending on rank
      expect(pilotRows[1].classList.contains('top')).toBe(true)
      expect(pilotRows[2].classList.contains('bottom')).toBe(true)
      expect(pilotRows[3].classList.contains('bottom')).toBe(true)
    })

    it('should not apply champ class if grand finale is not completed', () => {
      const pilots = createTestPilots()

      render(
        <HeatCard
          variant="filled"
          heatNumber={1}
          pilots={pilots}
          pilotIds={['p1', 'p2', 'p3', 'p4']}
          status="pending"
          bracketType="finale"
        />
      )

      const pilotRows = document.querySelectorAll('.pilot-row')
      
      pilotRows.forEach(row => {
        expect(row.classList.contains('champ')).toBe(false)
      })
    })
  })
})
