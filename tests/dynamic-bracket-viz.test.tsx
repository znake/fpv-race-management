/**
 * Tests für Story 4.3: Dynamische Bracket-Visualisierung
 * Updated für Story 11-1: Unified Layout Container
 * 
 * Task 11 & 12: Integration Tests für BracketTree mit Pool-System
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

describe('Story 4.3: Dynamische Bracket-Visualisierung', () => {
  let mockPilots: Pilot[]
  let mockHeats: Heat[]
  let mockFullBracketStructure: FullBracketStructure

  beforeEach(() => {
    mockPilots = [
      { id: 'p1', name: 'Jakob', imageUrl: 'https://example.com/p1.jpg' },
      { id: 'p2', name: 'Niklas', imageUrl: 'https://example.com/p2.jpg' },
      { id: 'p3', name: 'Jürgen', imageUrl: 'https://example.com/p3.jpg' },
      { id: 'p4', name: 'Berni', imageUrl: 'https://example.com/p4.jpg' },
      { id: 'p5', name: 'Max', imageUrl: 'https://example.com/p5.jpg' },
      { id: 'p6', name: 'Markus', imageUrl: 'https://example.com/p6.jpg' },
      { id: 'p7', name: 'Simon', imageUrl: 'https://example.com/p7.jpg' },
      { id: 'p8', name: 'Andi', imageUrl: 'https://example.com/p8.jpg' },
    ]

    mockHeats = [
      {
        id: 'heat-1',
        heatNumber: 1,
        pilotIds: ['p1', 'p2', 'p3', 'p4'],
        status: 'completed' as const,
        results: {
          rankings: [
            { pilotId: 'p1', rank: 1 as const },
            { pilotId: 'p2', rank: 2 as const },
            { pilotId: 'p3', rank: 3 as const },
            { pilotId: 'p4', rank: 4 as const }
          ]
        }
      },
      {
        id: 'heat-2',
        heatNumber: 2,
        pilotIds: ['p5', 'p6', 'p7', 'p8'],
        status: 'active' as const
      }
    ]

    mockFullBracketStructure = {
      qualification: {
        heats: [
          {
            id: 'heat-1',
            heatNumber: 1,
            roundNumber: 1,
            bracketType: 'qualification',
            status: 'completed',
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            sourceHeats: [],
            position: { x: 0, y: 0 }
          },
          {
            id: 'heat-2',
            heatNumber: 2,
            roundNumber: 1,
            bracketType: 'qualification',
            status: 'active',
            pilotIds: ['p5', 'p6', 'p7', 'p8'],
            sourceHeats: [],
            position: { x: 200, y: 0 }
          }
        ]
      },
      winnerBracket: {
        rounds: []
      },
      loserBracket: {
        rounds: []
      },
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
  })

  describe('AC 1: Unified Layout Container (Story 11-1)', () => {
    test('zeigt RUNDE 1 Column für Qualifikation/Heats', () => {
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

      render(
        <BracketTree 
          pilots={mockPilots} 
          tournamentPhase="running" 
          onSubmitResults={() => {}} 
        />
      )

      // Story 11-1: "RUNDE 1" ist jetzt der Column Label statt "HEATS" Section
      expect(screen.getByText('RUNDE 1')).toBeInTheDocument()
    })

    test('zeigt WINNER BRACKET Label am linken Rand', () => {
      const stateWithWBHeats = {
        ...mockFullBracketStructure,
        winnerBracket: {
          rounds: [{
            id: 'wb-round-1',
            roundNumber: 1,
            roundName: 'WB Runde 1',
            heats: [{
              id: 'wb-heat-1',
              heatNumber: 3,
              roundNumber: 1,
              bracketType: 'winner' as const,
              status: 'pending' as const,
              pilotIds: ['p1', 'p2'],
              sourceHeats: [],
              position: { x: 300, y: 0 }
            }]
          }]
        }
      }

      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: [...mockHeats, {
            id: 'wb-heat-1',
            heatNumber: 3,
            pilotIds: ['p1', 'p2'],
            status: 'pending' as const,
            bracketType: 'winner' as const
          }],
          fullBracketStructure: stateWithWBHeats,
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

      // Story 11-1: WINNER BRACKET ist jetzt ein vertikales Label
      expect(screen.getByText('WINNER BRACKET')).toBeInTheDocument()
    })

    test('zeigt LOSER BRACKET Label am linken Rand', () => {
      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: mockHeats,
          fullBracketStructure: mockFullBracketStructure,
          loserPool: ['p3', 'p4'], // 2 Piloten im LB Pool
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

      // Story 11-1: LOSER BRACKET ist jetzt ein vertikales Label
      expect(screen.getByText('LOSER BRACKET')).toBeInTheDocument()
    })

    test('zeigt GRAND FINALE Column', () => {
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

      render(
        <BracketTree 
          pilots={mockPilots} 
          tournamentPhase="running" 
          onSubmitResults={() => {}} 
        />
      )

      expect(screen.getByText('GRAND FINALE')).toBeInTheDocument()
    })
  })

  describe('AC 2 & 3: Pool-Visualisierung (Story 11-1: Unified Layout)', () => {
    test('zeigt WB Pool im Pools Column', () => {
      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: mockHeats,
          fullBracketStructure: mockFullBracketStructure,
          loserPool: [],
          winnerPool: ['p1', 'p2', 'p3'], // 3 Piloten im WB Pool
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

      // Story 11-1: Unified Layout zeigt immer beide Pools (WB + LB) im pools-column
      const pools = screen.getAllByTestId('pool-display-compact')
      expect(pools.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('WB POOL')).toBeInTheDocument()
    })

    test('zeigt LB Pool im Pools Column', () => {
      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: mockHeats,
          fullBracketStructure: mockFullBracketStructure,
          loserPool: ['p3', 'p4'], // 2 Piloten im LB Pool
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

      // Story 11-1: LB Pool wird immer im Pools Column angezeigt
      expect(screen.getByText('LB POOL')).toBeInTheDocument()
    })
  })

  describe('AC 5: Keine vorberechnete Struktur', () => {
    test('zeigt KEINE leeren WB Runden-Labels wenn keine Piloten', () => {
      const structureWithEmptyRounds = {
        ...mockFullBracketStructure,
        winnerBracket: {
          rounds: [{
            id: 'wb-round-1',
            roundNumber: 1,
            roundName: 'WB Runde 1',
            heats: [{
              id: 'wb-empty',
              heatNumber: 3,
              roundNumber: 1,
              bracketType: 'winner' as const,
              status: 'empty' as const,
              pilotIds: [], // LEER - sollte nicht angezeigt werden
              sourceHeats: [],
              position: { x: 300, y: 0 }
            }]
          }]
        }
      }

      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: mockHeats,
          fullBracketStructure: structureWithEmptyRounds,
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

      // Der leere WB Runde 1 Text sollte nicht erscheinen
      // (Story 11-1: Das Unified Layout zeigt die Heats direkt in der heats-column)
      expect(screen.queryByText('WB Runde 1')).not.toBeInTheDocument()
    })

    test('zeigt Heats in der heats-column', () => {
      const structureWithMixedHeats = {
        ...mockFullBracketStructure,
        winnerBracket: {
          rounds: [{
            id: 'wb-round-1',
            roundNumber: 1,
            roundName: 'WB Runde 1',
            heats: [
              {
                id: 'wb-filled',
                heatNumber: 3,
                roundNumber: 1,
                bracketType: 'winner' as const,
                status: 'pending' as const,
                pilotIds: ['p1', 'p2'], // GEFÜLLT
                sourceHeats: [],
                position: { x: 300, y: 0 }
              },
              {
                id: 'wb-empty',
                heatNumber: 4,
                roundNumber: 1,
                bracketType: 'winner' as const,
                status: 'empty' as const,
                pilotIds: [], // LEER
                sourceHeats: [],
                position: { x: 300, y: 200 }
              }
            ]
          }]
        }
      }

      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: [...mockHeats, {
            id: 'wb-filled',
            heatNumber: 3,
            pilotIds: ['p1', 'p2'],
            status: 'pending' as const,
            bracketType: 'winner' as const
          }],
          fullBracketStructure: structureWithMixedHeats,
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

      // Story 11-1: Heats werden in heats-column angezeigt
      // Die Quali-Heats (heat-1, heat-2) werden angezeigt
      expect(screen.getByTestId('bracket-heat-1')).toBeInTheDocument()
      expect(screen.getByTestId('bracket-heat-2')).toBeInTheDocument()
    })
  })

  describe('Grand Finale Pool', () => {
    test('zeigt Grand Finale Pool wenn Piloten vorhanden', () => {
      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: mockHeats,
          fullBracketStructure: mockFullBracketStructure,
          loserPool: [],
          winnerPool: [],
          grandFinalePool: ['p1', 'p2'], // WB + LB Champion
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

      expect(screen.getByTestId('pool-display-grandFinale')).toBeInTheDocument()
    })
  })
})
