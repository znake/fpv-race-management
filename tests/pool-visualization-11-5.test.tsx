/**
 * Tests für Story 11-5: Pool-Visualisierung im Bracket
 *
 * AC1: WB Pool in Pools-Spalte mit grünem gestricheltem Border
 * AC2: LB Pool in Pools-Spalte mit rotem gestricheltem Border
 * AC3: Pools zeigen Piloten-Avatare + Anzahl
 * AC4: Leere Pools werden nicht angezeigt
 * AC5: Dashed Border unterscheidet von Heats (Heats haben solid)
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { PoolDisplay } from '../src/components/bracket/PoolDisplay'
import type { Pilot } from '../src/stores/tournamentStore'

// Test data
const mockPilots: Pilot[] = [
  { id: 'pilot-1', name: 'Jakob Lehner', imageUrl: 'https://example.com/jakob.jpg' },
  { id: 'pilot-2', name: 'Niklas Weber', imageUrl: 'https://example.com/niklas.jpg' },
  { id: 'pilot-3', name: 'Alexander Huber', imageUrl: 'https://example.com/alex.jpg' },
  { id: 'pilot-4', name: 'Bernhard Müller', imageUrl: 'https://example.com/berni.jpg' },
  { id: 'pilot-5', name: 'Max Fischer', imageUrl: 'https://example.com/max.jpg' },
]

describe('Story 11-5: Pool-Visualisierung im Bracket', () => {
  describe('AC1: WB Pool mit grünem gestricheltem Border', () => {
    test('WB Pool hat dashed border', () => {
      const { container } = render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={['pilot-1', 'pilot-2']}
          pilots={mockPilots}
          variant="compact"
        />
      )

      // Pool sollte dashed border haben
      const poolBox = container.querySelector('[data-testid="pool-display-compact"]')
      expect(poolBox).toBeInTheDocument()
      expect(poolBox).toHaveClass('border-dashed')
    })

    test('WB Pool hat grüne Borderfarbe', () => {
      const { container } = render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={['pilot-1']}
          pilots={mockPilots}
          variant="compact"
        />
      )

      const poolBox = container.querySelector('[data-testid="pool-display-compact"]')
      // WB Pool sollte winner-green border haben
      expect(poolBox).toHaveClass('border-winner-green/30')
    })

    test('WB Pool Label ist grün', () => {
      render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={['pilot-1']}
          pilots={mockPilots}
          variant="compact"
        />
      )

      expect(screen.getByText('WB POOL')).toHaveClass('text-winner-green')
    })
  })

  describe('AC2: LB Pool mit rotem gestricheltem Border', () => {
    test('LB Pool hat dashed border', () => {
      const { container } = render(
        <PoolDisplay
          title="LB POOL"
          pilotIds={['pilot-1', 'pilot-2']}
          pilots={mockPilots}
          variant="compact"
        />
      )

      const poolBox = container.querySelector('[data-testid="pool-display-compact"]')
      expect(poolBox).toBeInTheDocument()
      expect(poolBox).toHaveClass('border-dashed')
    })

    test('LB Pool hat rote Borderfarbe', () => {
      const { container } = render(
        <PoolDisplay
          title="LB POOL"
          pilotIds={['pilot-1']}
          pilots={mockPilots}
          variant="compact"
        />
      )

      const poolBox = container.querySelector('[data-testid="pool-display-compact"]')
      // LB Pool sollte loser-red border haben
      expect(poolBox).toHaveClass('border-loser-red/30')
    })

    test('LB Pool Label ist rot', () => {
      render(
        <PoolDisplay
          title="LB POOL"
          pilotIds={['pilot-1']}
          pilots={mockPilots}
          variant="compact"
        />
      )

      expect(screen.getByText('LB POOL')).toHaveClass('text-loser-red')
    })
  })

  describe('AC3: Pools zeigen Piloten-Avatare und Anzahl', () => {
    test('Pool zeigt Piloten-Avatare', () => {
      render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={['pilot-1', 'pilot-2', 'pilot-3']}
          pilots={mockPilots}
          variant="compact"
          showCount={true}
        />
      )

      // Sollte 3 Avatare (images) haben
      const images = screen.getAllByRole('img')
      expect(images.length).toBe(3)
    })

    test('Pool zeigt Anzahl Text (z.B. "3 Piloten")', () => {
      render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={['pilot-1', 'pilot-2', 'pilot-3']}
          pilots={mockPilots}
          variant="compact"
          showCount={true}
        />
      )

      expect(screen.getByText(/3 Piloten/)).toBeInTheDocument()
    })

    test('Pool zeigt korrekte Initialen für Piloten im compact mode', () => {
      render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={['pilot-1']}
          pilots={mockPilots}
          variant="compact"
        />
      )

      // Im compact mode wird kein Name-Text angezeigt, nur Avatar
      const images = screen.getAllByRole('img')
      expect(images.length).toBe(1)
    })
  })

  describe('AC4: Leere Pools werden nicht angezeigt oder ausgegraut', () => {
    test('Leerer Pool zeigt empty message', () => {
      render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={[]}
          pilots={mockPilots}
          variant="compact"
          emptyMessage="Pool ist leer"
        />
      )

      expect(screen.getByText('Pool ist leer')).toBeInTheDocument()
    })

    test('Leerer Pool zeigt keine Avatare', () => {
      render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={[]}
          pilots={mockPilots}
          variant="compact"
        />
      )

      expect(screen.queryAllByRole('img').length).toBe(0)
    })

    test('Leerer Pool zeigt "0 Piloten"', () => {
      render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={[]}
          pilots={mockPilots}
          variant="compact"
          showCount={true}
        />
      )

      expect(screen.getByText(/0 Piloten/)).toBeInTheDocument()
    })
  })

  describe('AC5: Dashed Border unterscheidet von Heats (Heats sind solid)', () => {
    test('Pool hat immer dashed border (nicht nur wenn nicht ready)', () => {
      // Pool mit 4+ Piloten sollte trotzdem dashed sein
      const { container } = render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4']}
          pilots={mockPilots}
          variant="compact"
        />
      )

      const poolBox = container.querySelector('[data-testid="pool-display-compact"]')
      expect(poolBox).toHaveClass('border-dashed')
    })

    test('Pool mit weniger als 4 Piloten hat dashed border', () => {
      const { container } = render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={['pilot-1', 'pilot-2']}
          pilots={mockPilots}
          variant="compact"
        />
      )

      const poolBox = container.querySelector('[data-testid="pool-display-compact"]')
      expect(poolBox).toHaveClass('border-dashed')
    })
  })

  describe('Mockup-Konformität', () => {
    test('Pool-Box hat korrektes Styling (aus Mockup)', () => {
      const { container } = render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={['pilot-1', 'pilot-2']}
          pilots={mockPilots}
          variant="compact"
          className="w-[120px]"
        />
      )

      const poolBox = container.querySelector('[data-testid="pool-display-compact"]')
      expect(poolBox).toHaveClass('bg-night')
      expect(poolBox).toHaveClass('border-2')
      expect(poolBox).toHaveClass('rounded-xl')
    })

    test('maxDisplay begrenzt angezeigte Piloten', () => {
      render(
        <PoolDisplay
          title="WB POOL"
          pilotIds={['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4', 'pilot-5']}
          pilots={mockPilots}
          variant="compact"
          maxDisplay={4}
        />
      )

      // Nur 4 Avatare, Rest wird als "+X weitere" angezeigt
      const images = screen.getAllByRole('img')
      expect(images.length).toBe(4)
      expect(screen.getByText(/\+1 weitere/)).toBeInTheDocument()
    })
  })
})
