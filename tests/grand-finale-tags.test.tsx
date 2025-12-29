/**
 * Grand Finale Herkunfts-Tags Tests
 *
 * Story 11-6: Tags zeigen ob Finalist via WB oder LB kam
 *
 * AC1: WB-Finalisten haben grünes "WB" Tag
 * AC2: LB-Finalisten haben rotes "LB" Tag
 * AC3: Tags nur im Grand Finale (nicht in regulären Heats)
 * AC4: Herkunft wird aus Pilot-Historie ermittelt
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { getPilotBracketOrigin } from '../src/lib/bracket-logic'
import { GrandFinaleHeatBox } from '../src/components/bracket/sections/GrandFinaleHeatBox'
import type { Heat } from '../src/types/tournament'
import type { Pilot } from '../src/lib/schemas'

describe('getPilotBracketOrigin', () => {
  const createHeat = (overrides: Partial<Heat> = {}): Heat => ({
    id: `heat-${Math.random()}`,
    heatNumber: 1,
    pilotIds: [],
    status: 'completed',
    ...overrides
  })

  describe('AC4: Herkunft aus Pilot-Historie ermitteln', () => {
    it('returns "wb" for pilot who was never in loser bracket', () => {
      const heats: Heat[] = [
        createHeat({ pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'], bracketType: 'qualification' }),
        createHeat({ pilotIds: ['pilot-1', 'pilot-2'], bracketType: 'winner' }),
      ]

      const origin = getPilotBracketOrigin('pilot-1', heats)
      expect(origin).toBe('wb')
    })

    it('returns "lb" for pilot who was in loser bracket', () => {
      const heats: Heat[] = [
        createHeat({ pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'], bracketType: 'qualification' }),
        createHeat({ pilotIds: ['pilot-3', 'pilot-4'], bracketType: 'loser' }),
      ]

      const origin = getPilotBracketOrigin('pilot-3', heats)
      expect(origin).toBe('lb')
    })

    it('returns "wb" for pilot not found in any heat', () => {
      const heats: Heat[] = [
        createHeat({ pilotIds: ['pilot-1', 'pilot-2'], bracketType: 'winner' }),
      ]

      const origin = getPilotBracketOrigin('unknown-pilot', heats)
      expect(origin).toBe('wb')
    })

    it('returns "lb" even if pilot is also in winner bracket (lost once, came back)', () => {
      const heats: Heat[] = [
        createHeat({ pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'], bracketType: 'qualification' }),
        createHeat({ pilotIds: ['pilot-1', 'pilot-2'], bracketType: 'winner' }),
        createHeat({ pilotIds: ['pilot-3', 'pilot-4'], bracketType: 'loser' }),
        // pilot-3 fought back through LB
      ]

      const origin = getPilotBracketOrigin('pilot-3', heats)
      expect(origin).toBe('lb')
    })
  })
})

describe('GrandFinaleHeatBox with Tags', () => {
  const createPilot = (id: string, name: string): Pilot => ({
    id,
    name,
    imageUrl: `/images/${id}.jpg`
  })

  const wbChampion = createPilot('wb-pilot', 'WB Champion')
  const lbChampion = createPilot('lb-pilot', 'LB Champion')
  const pilots = [wbChampion, lbChampion]

  // Heat history showing wb-pilot came from WB, lb-pilot came from LB
  const heatsHistory: Heat[] = [
    {
      id: 'quali-1',
      heatNumber: 1,
      pilotIds: ['wb-pilot', 'lb-pilot', 'p3', 'p4'],
      status: 'completed',
      bracketType: 'qualification'
    },
    {
      id: 'wb-1',
      heatNumber: 2,
      pilotIds: ['wb-pilot', 'p3'],
      status: 'completed',
      bracketType: 'winner'
    },
    {
      id: 'lb-1',
      heatNumber: 3,
      pilotIds: ['lb-pilot', 'p4'],
      status: 'completed',
      bracketType: 'loser'
    }
  ]

  const grandFinaleHeat: Heat = {
    id: 'grand-finale',
    heatNumber: 99,
    pilotIds: ['wb-pilot', 'lb-pilot'],
    status: 'active',
    bracketType: 'grand_finale',
    isFinale: true
  }

  beforeEach(() => {
    // Reset any mocks if needed
  })

  describe('AC1: WB-Finalisten haben grünes Tag', () => {
    it('shows "WB" tag for pilot from Winner Bracket', () => {
      render(
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={heatsHistory}
        />
      )

      const wbTag = screen.getByTestId('pilot-tag-wb-pilot')
      expect(wbTag).toBeInTheDocument()
      expect(wbTag).toHaveTextContent('WB')
      expect(wbTag).toHaveClass('wb')
    })
  })

  describe('AC2: LB-Finalisten haben rotes Tag', () => {
    it('shows "LB" tag for pilot from Loser Bracket', () => {
      render(
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={heatsHistory}
        />
      )

      const lbTag = screen.getByTestId('pilot-tag-lb-pilot')
      expect(lbTag).toBeInTheDocument()
      expect(lbTag).toHaveTextContent('LB')
      expect(lbTag).toHaveClass('lb')
    })
  })

  describe('AC3: Tags nur im Grand Finale', () => {
    it('renders both WB and LB tags in Grand Finale', () => {
      render(
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={heatsHistory}
        />
      )

      expect(screen.getByTestId('pilot-tag-wb-pilot')).toBeInTheDocument()
      expect(screen.getByTestId('pilot-tag-lb-pilot')).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('handles pending Grand Finale (waiting for finalists)', () => {
      const pendingFinale: Heat = {
        ...grandFinaleHeat,
        status: 'pending',
        pilotIds: []
      }

      render(
        <GrandFinaleHeatBox
          heat={pendingFinale}
          pilots={pilots}
          heats={[]}
        />
      )

      // Should not crash, should show waiting message
      expect(screen.getByText('Wartet auf Finalisten...')).toBeInTheDocument()
    })

    it('handles completed Grand Finale with rankings', () => {
      const completedFinale: Heat = {
        ...grandFinaleHeat,
        status: 'completed',
        results: {
          rankings: [
            { pilotId: 'wb-pilot', rank: 1 },
            { pilotId: 'lb-pilot', rank: 2 }
          ],
          completedAt: '2025-12-28T12:00:00Z'
        }
      }

      render(
        <GrandFinaleHeatBox
          heat={completedFinale}
          pilots={pilots}
          heats={heatsHistory}
        />
      )

      // Tags should still be visible
      expect(screen.getByTestId('pilot-tag-wb-pilot')).toBeInTheDocument()
      expect(screen.getByTestId('pilot-tag-lb-pilot')).toBeInTheDocument()
    })
  })
})
