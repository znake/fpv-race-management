import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, cleanup, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BracketTree } from '@/components/bracket/bracket-tree'
import { useTournamentStore } from '@/stores/tournamentStore'
import { resetTournamentStore } from './helpers'

vi.mock('@/components/bracket/svg-pilot-paths', () => ({
  SVGPilotPaths: () => null,
}))

vi.mock('@/components/bracket/svg-connector-lines', () => ({
  SVGConnectorLines: () => null,
}))

vi.mock('@/components/bracket/pilot-path-toggle', () => ({
  PilotPathToggle: () => <div data-testid="pilot-path-toggle" />,
}))

vi.mock('@/components/bracket/zoom-indicator', () => ({
  ZoomIndicator: () => null,
}))

vi.mock('@/components/bracket/sections/quali-section', () => ({
  QualiSection: () => null,
}))

vi.mock('@/components/bracket/sections/bracket-section', () => ({
  BracketSection: () => null,
}))

vi.mock('@/components/bracket/sections/grand-finale-section', () => ({
  GrandFinaleSection: () => null,
}))

describe('BracketTree hook ordering', () => {
  beforeEach(() => {
    cleanup()
    resetTournamentStore()
  })

  afterEach(() => {
    cleanup()
    resetTournamentStore()
  })

  it('keeps a stable hook order when the bracket transitions from empty to populated', () => {
    const onSubmit = () => {}

    const { rerender } = render(
      <BracketTree pilots={[]} tournamentPhase="setup" onSubmitResults={onSubmit} />
    )
    expect(screen.getByText('Keine Piloten für Bracket verfügbar')).toBeInTheDocument()

    act(() => {
      for (let i = 0; i < 8; i += 1) {
        useTournamentStore.getState().addPilot({
          name: `Pilot ${i + 1}`,
          imageUrl: `https://example.com/pilot${i + 1}.jpg`,
        })
      }
      useTournamentStore.getState().confirmTournamentStart()
      useTournamentStore.getState().confirmHeatAssignment()
    })

    const pilots = useTournamentStore.getState().pilots
    const heats = useTournamentStore.getState().heats
    expect(pilots.length).toBe(8)
    expect(heats.length).toBeGreaterThan(0)

    // Before the fix the dimension useMemo sat after the early returns, so this
    // transition threw "Rendered more hooks than during the previous render".
    rerender(
      <BracketTree pilots={pilots} tournamentPhase="running" onSubmitResults={onSubmit} />
    )

    expect(screen.getByTestId('pilot-path-toggle')).toBeInTheDocument()
  })
})
