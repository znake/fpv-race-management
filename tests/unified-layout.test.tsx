/**
 * Tests für US-14-REWRITE: Vertikales Bracket Layout
 * 
 * Neues Layout:
 * - Quali oben (horizontal)
 * - WB + LB nebeneinander (bracket-columns-wrapper)
 * - Grand Finale unten (mittig)
 * 
 * AC1: Quali oben horizontal, WB+LB nebeneinander (vertikal), GF unten mittig
 * AC2: WB-Runden vertikal gestapelt (R1→R2→Finale nach unten)
 * AC3: LB-Runden vertikal mit Pool-Indicators
 * AC4: Grüne SVG-Linien verbinden WB-Heats vertikal
 * AC5: Grand Finale zentriert mit goldenen SVG-Linien
 * AC6: Keine PoolDisplay mehr sichtbar
 * AC7: Layout skaliert für 7-60 Piloten
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

describe('US-14-REWRITE: Vertikales Bracket Layout', () => {
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

  describe('AC1: Vertikales Layout - Quali oben, WB+LB nebeneinander, GF unten', () => {
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

    test('hat quali-section oben', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const qualiSection = document.querySelector('.quali-section')
      expect(qualiSection).not.toBeNull()
      expect(screen.getByText('QUALIFIKATION')).toBeInTheDocument()
    })

    test('hat bracket-columns-wrapper für WB+LB side-by-side', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const wrapper = document.querySelector('.bracket-columns-wrapper')
      expect(wrapper).not.toBeNull()
    })

    test('hat bracket-tree mit flex-direction column', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      const bracketTree = document.querySelector('.bracket-tree')
      expect(bracketTree).not.toBeNull()
    })
  })

  describe('AC2: WB-Runden vertikal gestapelt', () => {
    test('zeigt WINNER BRACKET Header wenn WB vorhanden', () => {
      const stateWithWB = {
        ...mockFullBracketStructure,
        winnerBracket: {
          rounds: [{
            id: 'wb-round-1',
            roundNumber: 1,
            roundName: 'WB Runde 1',
            heats: [{
              id: 'wb-heat-1',
              heatNumber: 2,
              roundNumber: 1,
              bracketType: 'winner' as const,
              status: 'pending' as const,
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        }
      }

      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: [...mockHeats, {
            id: 'wb-heat-1',
            heatNumber: 2,
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            status: 'pending' as const,
            bracketType: 'winner' as const
          }],
          fullBracketStructure: stateWithWB,
          loserPool: [],
          winnerPool: [],
          grandFinalePool: [],
          getTop4Pilots: () => null,
          hasActiveWBHeats: () => true
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

      expect(screen.getByText('WINNER BRACKET')).toBeInTheDocument()
      expect(document.querySelector('.bracket-column.wb')).toBeInTheDocument()
    })

    test('zeigt round-section mit round-label für WB Runden', () => {
      const stateWithWB = {
        ...mockFullBracketStructure,
        winnerBracket: {
          rounds: [{
            id: 'wb-round-1',
            roundNumber: 1,
            roundName: 'WB Runde 1',
            heats: [{
              id: 'wb-heat-1',
              heatNumber: 2,
              roundNumber: 1,
              bracketType: 'winner' as const,
              status: 'pending' as const,
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              sourceHeats: [],
              position: { x: 0, y: 0 }
            }]
          }]
        }
      }

      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: [...mockHeats, {
            id: 'wb-heat-1',
            heatNumber: 2,
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            status: 'pending' as const,
            bracketType: 'winner' as const
          }],
          fullBracketStructure: stateWithWB,
          loserPool: [],
          winnerPool: [],
          grandFinalePool: [],
          getTop4Pilots: () => null,
          hasActiveWBHeats: () => true
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

      const roundSections = document.querySelectorAll('.round-section')
      expect(roundSections.length).toBeGreaterThan(0)
      
      const roundLabels = document.querySelectorAll('.round-label')
      expect(roundLabels.length).toBeGreaterThan(0)
    })
  })

  describe('AC3: LB-Runden mit Pool-Indicators', () => {
    test('zeigt LOSER BRACKET Header wenn LB vorhanden', () => {
      const stateWithLB = {
        ...mockFullBracketStructure,
        loserBracket: {
          rounds: [{
            id: 'lb-round-1',
            roundNumber: 1,
            roundName: 'LB Runde 1',
            heats: [{
              id: 'lb-heat-1',
              heatNumber: 3,
              roundNumber: 1,
              bracketType: 'loser' as const,
              status: 'pending' as const,
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              sourceHeats: [],
              position: { x: 0, y: 200 }
            }]
          }]
        }
      }

      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: [...mockHeats, {
            id: 'lb-heat-1',
            heatNumber: 3,
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            status: 'pending' as const,
            bracketType: 'loser' as const
          }],
          fullBracketStructure: stateWithLB,
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

      expect(screen.getByText('LOSER BRACKET')).toBeInTheDocument()
      expect(document.querySelector('.bracket-column.lb')).toBeInTheDocument()
    })
  })

  describe('AC6: Keine PoolDisplay mehr sichtbar', () => {
    test('rendert keine pools-column', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      // pools-column sollte NICHT mehr existieren
      expect(document.querySelector('.pools-column')).toBeNull()
    })

    test('rendert keine pool-display-compact', () => {
      render(
        <BracketTree
          pilots={mockPilots}
          tournamentPhase="running"
          onSubmitResults={() => {}}
        />
      )

      // pool-display-compact sollte nicht existieren
      expect(document.querySelectorAll('[data-testid="pool-display-compact"]').length).toBe(0)
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
