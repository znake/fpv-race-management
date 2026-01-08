/**
 * US-14.7: Grand Finale Section UI Tests
 *
 * AC1: Section unterhalb WB+LB, mittig positioniert
 * AC2: GF-Sources Labels (WB TOP 2 / LB TOP 2)
 * AC3: GF-Label "GRAND FINALE" (Bebas Neue 18px, gold, text-shadow)
 * AC4: GF Heat-Box (180px, 3px gold border, glow-gold)
 * AC5: 4-Piloten aus WB+LB mit Tags
 * AC6: Champion-Row Styling (goldener Tint, gold border-left)
 * AC7: Dynamische Positionierung (JavaScript Mittelpunkt-Berechnung)
 * AC8: WB/LB Pilot-Tags (6px badges)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GrandFinaleSection } from '../src/components/bracket/sections/GrandFinaleSection'
import { GrandFinaleHeatBox } from '../src/components/bracket/sections/GrandFinaleHeatBox'
import type { Heat } from '../src/types/tournament'
import type { Pilot } from '../src/lib/schemas'

// Mock for refs
const createMockRef = () => ({ current: null as HTMLDivElement | null })

describe('US-14.7: Grand Finale Section', () => {
  const createPilots = (count: number): Pilot[] =>
    Array.from({ length: count }, (_, i) => ({
      id: 'pilot-' + String(i + 1),
      name: 'Pilot ' + String(i + 1),
      imageUrl: '/images/pilot-' + String(i + 1) + '.jpg'
    }))

  const createGrandFinaleHeat = (): Heat => ({
    id: 'grand-finale-test',
    heatNumber: 99,
    pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
    status: 'pending',
    bracketType: 'grand_finale',
    isFinale: true,
    results: {
      rankings: [
        { pilotId: 'pilot-1', rank: 1 },
        { pilotId: 'pilot-2', rank: 2 },
        { pilotId: 'pilot-3', rank: 3 },
        { pilotId: 'pilot-4', rank: 4 }
      ],
      completedAt: new Date().toISOString()
    }
  })

  describe('AC1: Section-Positionierung', () => {
    it('rendert nichts wenn kein Grand Finale Heat existiert', () => {
      const pilots = createPilots(4)
      render(
        <GrandFinaleSection
          grandFinaleHeat={null}
          pilots={pilots}
          heats={[]}
          wbFinaleRef={createMockRef()}
          lbFinaleRef={createMockRef()}
        />
      )

      expect(screen.queryByTestId('grand-finale-section')).not.toBeInTheDocument()
    })

    it('rendert Section wenn Grand Finale Heat existiert', () => {
      const pilots = createPilots(4)
      const grandFinaleHeat = createGrandFinaleHeat()

      render(
        <GrandFinaleSection
          grandFinaleHeat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat]}
          wbFinaleRef={createMockRef()}
          lbFinaleRef={createMockRef()}
        />
      )

      expect(screen.getByTestId('grand-finale-section')).toBeInTheDocument()
    })

    it('Section hat Klasse "grand-finale-section positioned"', () => {
      const pilots = createPilots(4)
      const grandFinaleHeat = createGrandFinaleHeat()

      render(
        <GrandFinaleSection
          grandFinaleHeat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat]}
          wbFinaleRef={createMockRef()}
          lbFinaleRef={createMockRef()}
        />
      )

      const section = screen.getByTestId('grand-finale-section')
      expect(section).toHaveClass('grand-finale-section')
      expect(section).toHaveClass('positioned')
    })
  })

  describe('AC2: GF-Sources Anzeige', () => {
    it('zeigt "WB TOP 2" Label', () => {
      const pilots = createPilots(4)
      const grandFinaleHeat = createGrandFinaleHeat()

      render(
        <GrandFinaleSection
          grandFinaleHeat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat]}
          wbFinaleRef={createMockRef()}
          lbFinaleRef={createMockRef()}
        />
      )

      const wbSource = screen.getByTestId('gf-source-wb')
      expect(wbSource).toBeInTheDocument()
      expect(wbSource).toHaveTextContent('WB TOP 2')
      expect(wbSource).toHaveClass('gf-source', 'wb')
    })

    it('zeigt "LB TOP 2" Label', () => {
      const pilots = createPilots(4)
      const grandFinaleHeat = createGrandFinaleHeat()

      render(
        <GrandFinaleSection
          grandFinaleHeat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat]}
          wbFinaleRef={createMockRef()}
          lbFinaleRef={createMockRef()}
        />
      )

      const lbSource = screen.getByTestId('gf-source-lb')
      expect(lbSource).toBeInTheDocument()
      expect(lbSource).toHaveTextContent('LB TOP 2')
      expect(lbSource).toHaveClass('gf-source', 'lb')
    })
  })

  describe('AC3: GF-Label', () => {
    it('zeigt "GRAND FINALE" Label', () => {
      const pilots = createPilots(4)
      const grandFinaleHeat = createGrandFinaleHeat()

      render(
        <GrandFinaleSection
          grandFinaleHeat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat]}
          wbFinaleRef={createMockRef()}
          lbFinaleRef={createMockRef()}
        />
      )

      const gfLabel = screen.getByTestId('gf-label')
      expect(gfLabel).toBeInTheDocument()
      expect(gfLabel).toHaveTextContent('GRAND FINALE')
      expect(gfLabel).toHaveClass('gf-label')
    })
  })
})

describe('US-14.7: Grand Finale Heat Box', () => {
  const createPilots = (count: number): Pilot[] =>
    Array.from({ length: count }, (_, i) => ({
      id: 'pilot-' + String(i + 1),
      name: 'Pilot ' + String(i + 1),
      imageUrl: '/images/pilot-' + String(i + 1) + '.jpg'
    }))

  const createGrandFinaleHeat = (): Heat => ({
    id: 'grand-finale-test',
    heatNumber: 99,
    pilotIds: ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4'],
    status: 'completed',
    bracketType: 'grand_finale',
    isFinale: true,
    results: {
      rankings: [
        { pilotId: 'pilot-1', rank: 1 },
        { pilotId: 'pilot-2', rank: 2 },
        { pilotId: 'pilot-3', rank: 3 },
        { pilotId: 'pilot-4', rank: 4 }
      ],
      completedAt: new Date().toISOString()
    }
  })

  const createWBFinaleHeat = (): Heat => ({
    id: 'wb-finale-test',
    heatNumber: 10,
    pilotIds: ['pilot-1', 'pilot-2', 'pilot-5', 'pilot-6'],
    status: 'completed',
    bracketType: 'winner',
    isFinale: true,
    results: {
      rankings: [
        { pilotId: 'pilot-1', rank: 1 },
        { pilotId: 'pilot-2', rank: 2 },
        { pilotId: 'pilot-5', rank: 3 },
        { pilotId: 'pilot-6', rank: 4 }
      ],
      completedAt: new Date().toISOString()
    }
  })

  const createLBFinaleHeat = (): Heat => ({
    id: 'lb-finale-test',
    heatNumber: 11,
    pilotIds: ['pilot-3', 'pilot-4', 'pilot-7', 'pilot-8'],
    status: 'completed',
    bracketType: 'loser',
    isFinale: true,
    results: {
      rankings: [
        { pilotId: 'pilot-3', rank: 1 },
        { pilotId: 'pilot-4', rank: 2 },
        { pilotId: 'pilot-7', rank: 3 },
        { pilotId: 'pilot-8', rank: 4 }
      ],
      completedAt: new Date().toISOString()
    }
  })

  describe('AC4: GF Heat-Box Styling', () => {
    it('hat Klasse "heat-box gf"', () => {
      const pilots = createPilots(8)
      const grandFinaleHeat = createGrandFinaleHeat()
      const wbFinale = createWBFinaleHeat()
      const lbFinale = createLBFinaleHeat()

      render(
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat, wbFinale, lbFinale]}
        />
      )

      const heatBox = screen.getByTestId('grand-finale-heat')
      expect(heatBox).toHaveClass('heat-box', 'gf')
    })

    it('hat ID "grand-finale"', () => {
      const pilots = createPilots(8)
      const grandFinaleHeat = createGrandFinaleHeat()
      const wbFinale = createWBFinaleHeat()
      const lbFinale = createLBFinaleHeat()

      render(
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat, wbFinale, lbFinale]}
        />
      )

      const heatBox = screen.getByTestId('grand-finale-heat')
      expect(heatBox).toHaveAttribute('id', 'grand-finale')
    })
  })

  describe('AC5: 4-Piloten Darstellung', () => {
    it('zeigt alle 4 Piloten', () => {
      const pilots = createPilots(8)
      const grandFinaleHeat = createGrandFinaleHeat()
      const wbFinale = createWBFinaleHeat()
      const lbFinale = createLBFinaleHeat()

      render(
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat, wbFinale, lbFinale]}
        />
      )

      expect(screen.getByText('Pilot 1')).toBeInTheDocument()
      expect(screen.getByText('Pilot 2')).toBeInTheDocument()
      expect(screen.getByText('Pilot 3')).toBeInTheDocument()
      expect(screen.getByText('Pilot 4')).toBeInTheDocument()
    })
  })

  describe('AC6: Champion-Row Styling', () => {
    it('Champion-Row hat Klasse "champ"', () => {
      const pilots = createPilots(8)
      const grandFinaleHeat = createGrandFinaleHeat()
      const wbFinale = createWBFinaleHeat()
      const lbFinale = createLBFinaleHeat()

      render(
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat, wbFinale, lbFinale]}
        />
      )

      const pilot1Text = screen.getByText('Pilot 1')
      const pilotRow = pilot1Text.closest('.pilot-row')
      expect(pilotRow).toHaveClass('champ')
    })
  })

  describe('AC8: WB/LB Pilot-Tags', () => {
    it('zeigt WB/LB Tags für Piloten', () => {
      const pilots = createPilots(8)
      const grandFinaleHeat = createGrandFinaleHeat()
      const wbFinale = createWBFinaleHeat()
      const lbFinale = createLBFinaleHeat()

      render(
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat, wbFinale, lbFinale]}
        />
      )

      const tags = screen.getAllByTestId(/pilot-tag-pilot-\d+/)
      expect(tags.length).toBeGreaterThan(0)
    })

    it('Tags haben Klasse "pilot-tag"', () => {
      const pilots = createPilots(8)
      const grandFinaleHeat = createGrandFinaleHeat()
      const wbFinale = createWBFinaleHeat()
      const lbFinale = createLBFinaleHeat()

      render(
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat, wbFinale, lbFinale]}
        />
      )

      const tags = screen.getAllByTestId(/pilot-tag-pilot-\d+/)
      tags.forEach(tag => {
        expect(tag).toHaveClass('pilot-tag')
      })
    })

    it('WB-Tags haben Klasse "wb"', () => {
      const pilots = createPilots(8)
      const grandFinaleHeat = createGrandFinaleHeat()
      const wbFinale = createWBFinaleHeat()
      const lbFinale = createLBFinaleHeat()

      render(
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat, wbFinale, lbFinale]}
        />
      )

      const tags = screen.getAllByTestId(/pilot-tag-pilot-\d+/)
      const wbTag = tags.find(tag => tag.textContent === 'WB')
      expect(wbTag).toHaveClass('wb')
    })

    it('LB-Tags haben Klasse "lb"', () => {
      const pilots = createPilots(8)
      const grandFinaleHeat = createGrandFinaleHeat()
      const wbFinale = createWBFinaleHeat()
      const lbFinale = createLBFinaleHeat()

      render(
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={[grandFinaleHeat, wbFinale, lbFinale]}
        />
      )

      const tags = screen.getAllByTestId(/pilot-tag-pilot-\d+/)
      const lbTag = tags.find(tag => tag.textContent === 'LB')
      expect(lbTag).toHaveClass('lb')
    })
  })
})
