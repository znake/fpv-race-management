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

  describe('AC 1: Unified Layout Container (US-14-REWRITE)', () => {
    test('zeigt QUALIFIKATION Section für Quali-Heats', () => {
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

      // US-14-REWRITE: QUALIFIKATION ist eine separate Section oben
      expect(screen.getByText('QUALIFIKATION')).toBeInTheDocument()
      // bracket-columns-wrapper enthält WB und LB side-by-side
      expect(document.querySelector('.bracket-columns-wrapper')).toBeInTheDocument()
    })

    test('zeigt WINNER BRACKET Header im bracket-column', () => {
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

      // US-14-REWRITE: WINNER BRACKET als Column-Header
      expect(screen.getByText('WINNER BRACKET')).toBeInTheDocument()
      expect(document.querySelector('.bracket-column.wb')).toBeInTheDocument()
    })

    test('zeigt LOSER BRACKET Header im bracket-column', () => {
      const stateWithLB = {
        ...mockFullBracketStructure,
        loserBracket: {
          rounds: [{
            id: 'lb-round-1',
            roundNumber: 1,
            roundName: 'LB Runde 1',
            heats: [{
              id: 'lb-heat-1',
              heatNumber: 4,
              roundNumber: 1,
              bracketType: 'loser' as const,
              status: 'pending' as const,
              pilotIds: ['p3', 'p4', 'p5', 'p6'],
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
            heatNumber: 4,
            pilotIds: ['p3', 'p4', 'p5', 'p6'],
            status: 'pending' as const,
            bracketType: 'loser' as const
          }],
          fullBracketStructure: stateWithLB,
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

      // US-14-REWRITE: LOSER BRACKET als Column-Header
      expect(screen.getByText('LOSER BRACKET')).toBeInTheDocument()
      expect(document.querySelector('.bracket-column.lb')).toBeInTheDocument()
    })

    test('zeigt GRAND FINALE Section unterhalb WB+LB', () => {
      const stateWithGF = {
        ...mockFullBracketStructure,
        grandFinale: {
          id: 'gf-heat-1',
          heatNumber: 99,
          roundNumber: 99,
          bracketType: 'grand_finale' as const,
          status: 'pending' as const,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          sourceHeats: [],
          position: { x: 500, y: 100 }
        }
      }

      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: [...mockHeats, {
            id: 'gf-heat-1',
            heatNumber: 99,
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            status: 'pending' as const,
            bracketType: 'grand_finale' as const
          }],
          fullBracketStructure: stateWithGF,
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

      // US-14-REWRITE: GRAND FINALE Section unterhalb bracket-columns-wrapper
      const gfLabels = screen.getAllByText('GRAND FINALE')
      expect(gfLabels.length).toBeGreaterThan(0)
      expect(document.querySelector('.grand-finale-section')).toBeInTheDocument()
    })
  })

  describe('AC 2 & 3: Bracket Structure (US-14-REWRITE)', () => {
    test('zeigt bracket-columns-wrapper mit WB und LB side-by-side', () => {
      const stateWithBrackets = {
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
              pilotIds: ['p1', 'p2', 'p3', 'p4'],
              sourceHeats: [],
              position: { x: 300, y: 0 }
            }]
          }]
        },
        loserBracket: {
          rounds: [{
            id: 'lb-round-1',
            roundNumber: 1,
            roundName: 'LB Runde 1',
            heats: [{
              id: 'lb-heat-1',
              heatNumber: 4,
              roundNumber: 1,
              bracketType: 'loser' as const,
              status: 'pending' as const,
              pilotIds: ['p5', 'p6', 'p7', 'p8'],
              sourceHeats: [],
              position: { x: 0, y: 200 }
            }]
          }]
        }
      }

      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: [...mockHeats, 
            { id: 'wb-heat-1', heatNumber: 3, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'pending' as const, bracketType: 'winner' as const },
            { id: 'lb-heat-1', heatNumber: 4, pilotIds: ['p5', 'p6', 'p7', 'p8'], status: 'pending' as const, bracketType: 'loser' as const }
          ],
          fullBracketStructure: stateWithBrackets,
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

      // US-14-REWRITE: WB und LB nebeneinander im bracket-columns-wrapper
      const wrapper = document.querySelector('.bracket-columns-wrapper')
      expect(wrapper).toBeInTheDocument()
      
      // WB links
      expect(document.querySelector('.bracket-column.wb')).toBeInTheDocument()
      // LB rechts
      expect(document.querySelector('.bracket-column.lb')).toBeInTheDocument()
    })

    test('zeigt round-heats horizontal innerhalb jeder Runde', () => {
      const stateWithRounds = {
        ...mockFullBracketStructure,
        winnerBracket: {
          rounds: [{
            id: 'wb-round-1',
            roundNumber: 1,
            roundName: 'WB Runde 1',
            heats: [
              { id: 'wb-r1-h1', heatNumber: 3, roundNumber: 1, bracketType: 'winner' as const, status: 'pending' as const, pilotIds: ['p1', 'p2', 'p3', 'p4'], sourceHeats: [], position: { x: 0, y: 0 } },
              { id: 'wb-r1-h2', heatNumber: 4, roundNumber: 1, bracketType: 'winner' as const, status: 'pending' as const, pilotIds: ['p5', 'p6', 'p7', 'p8'], sourceHeats: [], position: { x: 150, y: 0 } }
            ]
          }]
        }
      }

      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: [...mockHeats,
            { id: 'wb-r1-h1', heatNumber: 3, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'pending' as const, bracketType: 'winner' as const },
            { id: 'wb-r1-h2', heatNumber: 4, pilotIds: ['p5', 'p6', 'p7', 'p8'], status: 'pending' as const, bracketType: 'winner' as const }
          ],
          fullBracketStructure: stateWithRounds,
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

      // US-14-REWRITE: Heats pro Runde sind horizontal angeordnet
      const roundHeats = document.querySelectorAll('.round-heats')
      expect(roundHeats.length).toBeGreaterThan(0)
    })
  })

  describe('AC 5: Empty Bracket Handling', () => {
    test('zeigt EmptyBracketHeatBox für leere Heats', () => {
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
              pilotIds: [], // LEER
              sourceHeats: [],
              position: { x: 300, y: 0 }
            }]
          }]
        }
      }

      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: mockHeats, // Note: wb-empty not in heats array = EmptyBracketHeatBox
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

      // US-14-REWRITE: WB Section wird gerendert mit leeren Platzhaltern
      const wbSection = document.querySelector('.bracket-column.wb')
      expect(wbSection).toBeInTheDocument()
    })

    test('zeigt gefüllte Heats in round-heats', () => {
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
                pilotIds: ['p1', 'p2', 'p3', 'p4'], // GEFÜLLT
                sourceHeats: [],
                position: { x: 300, y: 0 }
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
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
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

      // US-14-REWRITE: Die Quali-Heats (heat-1, heat-2) werden in quali-section angezeigt
      expect(screen.getByTestId('bracket-heat-1')).toBeInTheDocument()
      expect(screen.getByTestId('bracket-heat-2')).toBeInTheDocument()
    })
  })

  describe('Grand Finale Section', () => {
    test('zeigt Grand Finale Section wenn GF Heat vorhanden', () => {
      const stateWithGF = {
        ...mockFullBracketStructure,
        grandFinale: {
          id: 'gf-heat-1',
          heatNumber: 99,
          roundNumber: 99,
          bracketType: 'grand_finale' as const,
          status: 'pending' as const,
          pilotIds: ['p1', 'p2', 'p3', 'p4'],
          sourceHeats: [],
          position: { x: 500, y: 100 }
        }
      }

      ;(useTournamentStore as any).mockImplementation((selector: any) => {
        const state = {
          heats: [...mockHeats, {
            id: 'gf-heat-1',
            heatNumber: 99,
            pilotIds: ['p1', 'p2', 'p3', 'p4'],
            status: 'pending' as const,
            bracketType: 'grand_finale' as const
          }],
          fullBracketStructure: stateWithGF,
          loserPool: [],
          winnerPool: [],
          grandFinalePool: ['p1', 'p2', 'p3', 'p4'],
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

      // US-14-REWRITE: grand-finale-section wird unterhalb des bracket-columns-wrapper angezeigt
      expect(document.querySelector('.grand-finale-section')).toBeInTheDocument()
      // Multiple "GRAND FINALE" texts possible (label + heat header)
      const gfLabels = screen.getAllByText('GRAND FINALE')
      expect(gfLabels.length).toBeGreaterThan(0)
    })
  })
})
