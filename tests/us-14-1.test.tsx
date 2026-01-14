import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BracketTree } from '../src/components/bracket/BracketTree'
import { useTournamentStore } from '../src/stores/tournamentStore'
import React from 'react'
import '@testing-library/jest-dom'

// Mock the store
vi.mock('../src/stores/tournamentStore', () => ({
  useTournamentStore: vi.fn()
}))

describe('US-14.1: Synthwave Bracket Container', () => {
  it('should have a bracket-container with correct class', () => {
    const mockPilots = [{ id: '1', name: 'Pilot 1', country: 'DE', imageUrl: '' }]
    const mockHeats = [{ id: 'h1', pilotIds: ['1'], status: 'pending', bracketType: 'winner' }]
    
    // @ts-ignore
    useTournamentStore.mockImplementation((selector) => {
      const state = {
        heats: mockHeats,
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: { rounds: [] },
          loserBracket: { rounds: [] }
        },
        getTop4Pilots: () => [],
        loserPool: [],
        grandFinalePool: [],
        winnerPilots: [],
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

    const container = document.querySelector('.bracket-container')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('bracket-container')
  })

  it('should contain an SVG element for connector lines', () => {
    const mockPilots = [{ id: '1', name: 'Pilot 1', country: 'DE', imageUrl: '' }]
    const mockHeats = [{ id: 'h1', pilotIds: ['1'], status: 'pending', bracketType: 'winner' }]
    
    // @ts-ignore
    useTournamentStore.mockImplementation((selector) => {
      const state = {
        heats: mockHeats,
        fullBracketStructure: {
          qualification: { heats: [] },
          winnerBracket: { rounds: [] },
          loserBracket: { rounds: [] }
        },
        getTop4Pilots: () => [],
        loserPool: [],
        grandFinalePool: [],
        winnerPilots: [],
        hasActiveWBHeats: () => false
      }
      return selector(state)
    })

    const { container } = render(
      <BracketTree 
        pilots={mockPilots} 
        tournamentPhase="running" 
        onSubmitResults={() => {}} 
      />
    )

    const svg = container.querySelector('svg#connector-svg')
    expect(svg).toBeInTheDocument()
    // SVGConnectorLines uses inline styles instead of Tailwind classes
    expect(svg).toHaveStyle({ pointerEvents: 'none' })
    expect(svg).toHaveStyle({ zIndex: '1' })
  })
})
