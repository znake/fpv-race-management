import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BracketTree } from '@/components/bracket/bracket-tree'
import { useTournamentStore } from '@/stores/tournamentStore'
import type { Pilot, Heat } from '@/types'

vi.mock('@/stores/tournamentStore', () => ({
  useTournamentStore: vi.fn()
}))

vi.mock('@/components/bracket/svg-pilot-paths', () => ({
  SVGPilotPaths: ({ visible }: { visible: boolean }) => (
    visible ? <div data-testid="svg-pilot-paths" /> : null
  )
}))

vi.mock('@/components/bracket/pilot-path-toggle', () => ({
  PilotPathToggle: () => <div data-testid="pilot-path-toggle" />
}))

vi.mock('@/components/bracket/svg-connector-lines', () => ({
  SVGConnectorLines: () => <div data-testid="svg-connector-lines" />
}))

vi.mock('@/components/bracket/sections/quali-section', () => ({
  QualiSection: () => <div data-testid="quali-section" />
}))

vi.mock('@/components/bracket/sections/WinnerBracketSection', () => ({
  WinnerBracketSection: () => <div data-testid="wb-section" />
}))

vi.mock('@/components/bracket/sections/LoserBracketSection', () => ({
  LoserBracketSection: () => <div data-testid="lb-section" />
}))

vi.mock('@/components/bracket/sections/grand-finale-section', () => ({
  GrandFinaleSection: () => <div data-testid="gf-section" />
}))

vi.mock('@/components/bracket/zoom-indicator', () => ({
  ZoomIndicator: () => <div data-testid="zoom-indicator" />
}))

describe('BracketTree Integration - Pilot Paths', () => {
  const mockPilots: Pilot[] = [{ id: 'p1', name: 'Pilot 1', imageUrl: '' }]
  const mockHeats: Heat[] = [{
    id: 'h1',
    heatNumber: 1,
    roundNumber: 1,
    bracketType: 'qualification',
    status: 'active',
    pilotIds: ['p1']
  }]
  const mockUseTournamentStore = vi.mocked(useTournamentStore)

  const mockStore = {
    heats: mockHeats,
    getTop4Pilots: vi.fn(),
    canEditHeat: vi.fn().mockReturnValue(true),
    getActiveHeat: vi.fn(),
    showPilotPaths: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTournamentStore.mockImplementation((selector) => selector(mockStore as ReturnType<typeof useTournamentStore.getState>))
  })

  it('renders PilotPathToggle', () => {
    render(
      <BracketTree
        pilots={mockPilots}
        tournamentPhase="running"
        onSubmitResults={() => {}}
      />
    )
    expect(screen.getByTestId('pilot-path-toggle')).toBeInTheDocument()
  })

  it('renders SVGPilotPaths when showPilotPaths is true', () => {
    mockStore.showPilotPaths = true
    render(
      <BracketTree
        pilots={mockPilots}
        tournamentPhase="running"
        onSubmitResults={() => {}}
      />
    )
    expect(screen.getByTestId('svg-pilot-paths')).toBeInTheDocument()
  })

  it('hides SVGPilotPaths when showPilotPaths is false', () => {
    mockStore.showPilotPaths = false
    render(
      <BracketTree
        pilots={mockPilots}
        tournamentPhase="running"
        onSubmitResults={() => {}}
      />
    )
    expect(screen.queryByTestId('svg-pilot-paths')).not.toBeInTheDocument()
  })
})
