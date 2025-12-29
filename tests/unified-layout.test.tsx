/**
 * Tests für Story 11-1: Unified Layout Container
 * 
 * AC1: Keine getrennten Sections mehr
 * AC2: Horizontales Spalten-Layout
 * AC3: WB und LB vertikal getrennt
 * AC4: Horizontales Scrolling bei Bedarf
 * AC5: Beamer-lesbare Mindestgrößen
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BracketTree } from '../src/components/bracket-tree'
import { useTournamentStore } from '../src/stores/tournamentStore'
import type { Pilot } from '../src/lib/schemas'
import type { FullBracketStructure } from '../src/lib/bracket-structure-generator'
import type { Heat } from '../src/stores/tournamentStore'

// Mock the store
vi.mock('../src/stores/tournamentStore', () => ({
  useTournamentStore: vi.fn()
}))

describe('Story 11-1: Unified Layout Container', () => {
  let mockPilots: Pilot[]
  let mockHeats: Heat[]
  let mockFullBracketStructure: FullBracketStructure

  beforeEach(() => {
    mockPilots = [
      { id: 'p1', name: 'Pilot1', imageUrl: 'https://example.com/p1.jpg' },
      { id: 'p2', name: 'Pilot2', imageUrl: 'https://example.com/p2.jpg' },
      { id: 'p3', name: 'Pilot3', imageUrl: 'https://example.com/p3.jpg' },
      { id: 'p4', name: 'Pilot4', imageUrl: 'https://example.com/p4.jpg' },
    ]

    mockHeats = [
      {
        id: 'heat-1',
        heatNumber: 1,
        pilotIds: ['p1', 'p2', 'p3', 'p4'],
        status: 'active' as const
      }
    ]

    mockFullBracketStructure = {
      qualification: {
        heats: [{
          id: 'heat-1',
          heatNumber: 1,
          roundNumber: 1,
          bracketType: 'qualification',
          status: 'active',
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          sourceHeats: [],
          position: { x: 0, y: 0 }
        }]
      },
      winnerBracket: { rounds: [] },
      loserBracket: { rounds: [] },
      grandFinale: {
        id: 'finale',
        heatNumber: 99,
        roundNumber: 99,
        bracketType: 'finale',
        status: 'empty',
        pilotIds: [],
        sourceHeats: [],
        position: { x: 500, y: 100 }
      }
    }

    ;(useTournamentStore as any).mockImplementation((selector: any) => {
      const state = {
        heats: mockHeats,
        fullBracketStructure: mockFullBracketStructure,
        loserPool: [],
        winnerPool: [],
        grandFinalePool: [],
        getTop4Pilots: () => null,
        hasActiveWBHeats: () => false
      }
      return selector(state)
    })
  })

  describe('AC1: Keine getrennten Sections mehr', () => {
    test('hat einen einzigen bracket-container', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const containers = document.querySelectorAll('.bracket-container')
      expect(containers.length).toBe(1)
    })

    test('hat keine getrennten Section-Container für WB/LB/GF', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      // Keine alten separaten Section-Container
      expect(document.querySelector('.winner-bracket-section')).toBeNull()
      expect(document.querySelector('.loser-bracket-section')).toBeNull()
      // grand-finale-section existiert noch als placeholder
    })

    test('Container hat bg-night Hintergrundfarbe', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const container = document.querySelector('.bracket-container')
      expect(container).toHaveClass('bg-night')
    })
  })

  describe('AC2: Horizontales Spalten-Layout', () => {
    test('hat bracket-tree mit flex layout', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const bracketTree = document.querySelector('.bracket-tree')
      expect(bracketTree).not.toBeNull()
      expect(bracketTree).toHaveClass('flex')
    })

    test('hat pools-column', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const poolsColumn = document.querySelector('.pools-column')
      expect(poolsColumn).not.toBeNull()
    })

    test('hat heats-column', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const heatsColumn = document.querySelector('.heats-column')
      expect(heatsColumn).not.toBeNull()
    })

    test('hat connector-columns (2)', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const connectorColumns = document.querySelectorAll('.connector-column')
      expect(connectorColumns.length).toBe(2)
    })

    test('hat finals-column', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const finalsColumn = document.querySelector('.finals-column')
      expect(finalsColumn).not.toBeNull()
    })

    test('hat grand-finale-column', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const gfColumn = document.querySelector('.grand-finale-column')
      expect(gfColumn).not.toBeNull()
    })

    test('zeigt korrekte Column-Labels', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      expect(screen.getByText('POOLS')).toBeInTheDocument()
      expect(screen.getByText('RUNDE 1')).toBeInTheDocument()
      expect(screen.getByText('FINALE')).toBeInTheDocument()
      expect(screen.getByText('GRAND FINALE')).toBeInTheDocument()
    })
  })

  describe('AC3: WB und LB vertikal getrennt', () => {
    test('zeigt WINNER BRACKET Label', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      expect(screen.getByText('WINNER BRACKET')).toBeInTheDocument()
    })

    test('zeigt LOSER BRACKET Label', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      expect(screen.getByText('LOSER BRACKET')).toBeInTheDocument()
    })

    test('hat bracket-spacer zwischen WB und LB', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const spacer = document.querySelector('.bracket-spacer')
      expect(spacer).not.toBeNull()
    })
  })

  describe('AC4: Horizontales Scrolling bei Bedarf', () => {
    test('bracket-container hat overflow-x-auto', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const container = document.querySelector('.bracket-container')
      expect(container).toHaveClass('overflow-x-auto')
    })

    test('bracket-tree hat min-width', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const bracketTree = document.querySelector('.bracket-tree')
      expect(bracketTree).toHaveClass('min-w-[1100px]')
    })
  })

  describe('AC5: Beamer-lesbare Mindestgrößen', () => {
    test('bracket-container hat min-height 600px', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const container = document.querySelector('.bracket-container')
      expect(container).toHaveClass('min-h-[600px]')
    })

    test('Heat-Boxen haben min-width 180px+', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      // Heat boxes sollten min-w-[180px] oder größer haben
      const heatBoxes = document.querySelectorAll('[class*="min-w-"]')
      expect(heatBoxes.length).toBeGreaterThan(0)
    })

    test('Finale Platzhalter haben min-width >= 200px', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const placeholders = document.querySelectorAll('.heat-box-placeholder')
      expect(placeholders.length).toBeGreaterThan(0)
      
      // Alle Platzhalter sollten min-w-[200px] oder größer haben
      placeholders.forEach(placeholder => {
        const hasMinWidth = placeholder.className.includes('min-w-[200px]') ||
                           placeholder.className.includes('min-w-[240px]')
        expect(hasMinWidth).toBe(true)
      })
    })
  })

  describe('Pool Visualisierung im Unified Layout', () => {
    test('zeigt WB Pool und LB Pool nebeneinander vertikal', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      expect(screen.getByText('WB POOL')).toBeInTheDocument()
      expect(screen.getByText('LB POOL')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    test('zeigt Meldung wenn keine Piloten', () => {
      render(
        <BracketTree
          pilots={[]}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      expect(screen.getByText('Keine Piloten für Bracket verfügbar')).toBeInTheDocument()
    })

    test('zeigt Meldung wenn keine Heats', () => {
      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: [],
          fullBracketStructure: null,
          loserPool: [],
          winnerPool: [],
          grandFinalePool: [],
          getTop4Pilots: () => null,
          hasActiveWBHeats: () => false
        }
        return selector(state)
      })

      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      expect(screen.getByText('Noch keine Heats generiert')).toBeInTheDocument()
    })
  })
})
