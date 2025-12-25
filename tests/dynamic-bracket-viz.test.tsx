/**
 * Tests für Story 4.3: Dynamische Bracket-Visualisierung
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

  describe('AC 1: Drei-Sektionen-Layout', () => {
    test('zeigt HEATS Section für Qualifikation', () => {
      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: mockHeats,
          fullBracketStructure: mockFullBracketStructure,
          loserPool: [],
          winnerPool: [],
          grandFinalePool: [],
          getTop4Pilots: () => null
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

      expect(screen.getByText('HEATS')).toBeInTheDocument()
    })

    test('zeigt WINNER BRACKET Section wenn WB-Heats vorhanden', () => {
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
          getTop4Pilots: () => null
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
    })

    test('zeigt LOSER BRACKET Section wenn LB-Pool vorhanden', () => {
      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: mockHeats,
          fullBracketStructure: mockFullBracketStructure,
          loserPool: ['p3', 'p4'], // 2 Piloten im LB Pool
          winnerPool: [],
          grandFinalePool: [],
          getTop4Pilots: () => null
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
    })

    test('zeigt GRAND FINALE Section', () => {
      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: mockHeats,
          fullBracketStructure: mockFullBracketStructure,
          loserPool: [],
          winnerPool: [],
          grandFinalePool: [],
          getTop4Pilots: () => null
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

  describe('AC 2 & 3: Pool-Visualisierung', () => {
    test('zeigt Winner Pool wenn Piloten vorhanden', () => {
      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: mockHeats,
          fullBracketStructure: mockFullBracketStructure,
          loserPool: [],
          winnerPool: ['p1', 'p2', 'p3'], // 3 Piloten im WB Pool
          grandFinalePool: [],
          getTop4Pilots: () => null
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

      expect(screen.getByTestId('winner-pool-visualization')).toBeInTheDocument()
      expect(screen.getByText('WINNER POOL')).toBeInTheDocument()
    })

    test('zeigt Loser Pool wenn Piloten vorhanden', () => {
      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: mockHeats,
          fullBracketStructure: mockFullBracketStructure,
          loserPool: ['p3', 'p4'], // 2 Piloten im LB Pool
          winnerPool: [],
          grandFinalePool: [],
          getTop4Pilots: () => null
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

      expect(screen.getByTestId('loser-pool-visualization')).toBeInTheDocument()
    })
  })

  describe('AC 5: Keine vorberechnete Struktur', () => {
    test('zeigt KEINE leeren Platzhalter in WB/LB Rounds', () => {
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
          getTop4Pilots: () => null
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

      // Kein leerer Platzhalter für "WB Runde 1" sichtbar
      // (der Rundentitel sollte auch nicht erscheinen, wenn keine Heats mit Piloten)
      expect(screen.queryByText('WB Runde 1')).not.toBeInTheDocument()
    })

    test('zeigt nur Heats MIT Piloten', () => {
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
          getTop4Pilots: () => null
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

      // Gefüllter Heat sollte angezeigt werden
      expect(screen.getByTestId('bracket-heat-3')).toBeInTheDocument()
      // Leerer Heat sollte NICHT angezeigt werden
      expect(screen.queryByTestId('bracket-heat-4')).not.toBeInTheDocument()
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
          getTop4Pilots: () => null
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

      expect(screen.getByTestId('grand-finale-pool')).toBeInTheDocument()
    })
  })
})
