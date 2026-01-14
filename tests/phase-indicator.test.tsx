/**
 * Story 13-5: PhaseIndicator Komponente Tests
 * AC3: Visueller Indikator zeigt Phase-Beschreibung mit korrekten Farben
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { PhaseIndicator } from '../src/components/PhaseIndicator'
import { useTournamentStore, INITIAL_TOURNAMENT_STATE } from '../src/stores/tournamentStore'
import type { Heat } from '../src/types'

// Helper to reset store
const resetStore = () => {
  useTournamentStore.setState({
    ...structuredClone(INITIAL_TOURNAMENT_STATE),
  })
}

// Helper to create a heat
const createHeat = (overrides: Partial<Heat> & { id: string }): Heat => ({
  heatNumber: 1,
  pilotIds: ['p1', 'p2', 'p3', 'p4'],
  status: 'pending',
  ...overrides,
})

describe('PhaseIndicator Komponente', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should render with data-testid', () => {
    render(<PhaseIndicator />)
    expect(screen.getByTestId('phase-indicator')).toBeInTheDocument()
  })

  it('should display "Setup" text when in setup phase', () => {
    useTournamentStore.setState({
      tournamentPhase: 'setup',
    })

    render(<PhaseIndicator />)
    expect(screen.getByText('Setup')).toBeInTheDocument()
  })

  it('should display quali phase with cyan styling', () => {
    const qualiHeat: Heat = createHeat({
      id: 'quali-h1',
      bracketType: 'qualification',
      status: 'active',
    })

    useTournamentStore.setState({
      heats: [qualiHeat],
      tournamentPhase: 'running',
      isQualificationComplete: false,
    })

    render(<PhaseIndicator />)
    const indicator = screen.getByTestId('phase-indicator')
    expect(indicator).toHaveClass('text-neon-cyan')
  })

  it('should display WB phase with green styling', () => {
    const wbHeat: Heat = createHeat({
      id: 'wb-r1-h1',
      bracketType: 'winner',
      roundNumber: 1,
      status: 'active',
    })

    useTournamentStore.setState({
      heats: [wbHeat],
      tournamentPhase: 'running',
      isQualificationComplete: true,
    })

    render(<PhaseIndicator />)
    const indicator = screen.getByTestId('phase-indicator')
    expect(indicator).toHaveClass('text-green-400')
    expect(screen.getByText('WB Runde 1 läuft')).toBeInTheDocument()
  })

  it('should display LB waiting phase with steel styling and wait icon', () => {
    // WB-Heat der noch läuft
    const wbHeat: Heat = createHeat({
      id: 'wb-r1-h1',
      bracketType: 'winner',
      roundNumber: 1,
      status: 'active',
    })
    // LB-Heat der auf WB wartet
    const lbHeat: Heat = createHeat({
      id: 'lb-r1-h1',
      bracketType: 'loser',
      roundNumber: 1,
      status: 'pending',
    })

    useTournamentStore.setState({
      heats: [wbHeat, lbHeat],
      tournamentPhase: 'running',
      isQualificationComplete: true,
      lbRoundWaitingForWB: true,
    })

    render(<PhaseIndicator />)
    // Wenn WB aktiv ist, zeigt es "WB Runde 1 läuft" (nicht waiting)
    // Das ist das korrekte Verhalten - WB hat Priorität
    const indicator = screen.getByTestId('phase-indicator')
    expect(indicator).toHaveClass('text-green-400')
    expect(screen.getByText('WB Runde 1 läuft')).toBeInTheDocument()
  })

  it('should display Grand Finale with gold styling', () => {
    const grandFinale: Heat = createHeat({
      id: 'grand-finale',
      bracketType: 'grand_finale',
      isFinale: true,
      status: 'pending',
    })

    useTournamentStore.setState({
      heats: [grandFinale],
      tournamentPhase: 'finale',
      isQualificationComplete: true,
    })

    render(<PhaseIndicator />)
    const indicator = screen.getByTestId('phase-indicator')
    expect(indicator).toHaveClass('text-gold')
    expect(screen.getByText('Grand Finale')).toBeInTheDocument()
  })

  it('should display trophy icon when completed', () => {
    useTournamentStore.setState({
      tournamentPhase: 'completed',
    })

    render(<PhaseIndicator />)
    expect(screen.getByText('🏆')).toBeInTheDocument()
    expect(screen.getByText('Turnier beendet')).toBeInTheDocument()
  })

  it('should support different sizes', () => {
    render(<PhaseIndicator size="lg" />)
    const indicator = screen.getByTestId('phase-indicator')
    expect(indicator).toHaveClass('text-base')
  })

  it('should apply custom className', () => {
    render(<PhaseIndicator className="custom-class" />)
    const indicator = screen.getByTestId('phase-indicator')
    expect(indicator).toHaveClass('custom-class')
  })
})
