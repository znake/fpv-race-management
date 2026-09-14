import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, cleanup, screen, fireEvent, act } from '@testing-library/react'
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
  PilotPathToggle: () => null,
}))

vi.mock('@/components/bracket/zoom-indicator', () => ({
  ZoomIndicator: () => null,
}))

function seedRunningTournament(pilotCount: number): void {
  act(() => {
    const store = useTournamentStore.getState()
    for (let i = 0; i < pilotCount; i += 1) {
      store.addPilot({
        name: `Pilot ${i + 1}`,
        imageUrl: `https://example.com/pilot${i + 1}.jpg`,
      })
    }
    useTournamentStore.getState().confirmTournamentStart()
    useTournamentStore.getState().confirmHeatAssignment()
  })
}

describe('BracketTree placement submit click-through guard', () => {
  let now: number

  beforeEach(() => {
    cleanup()
    resetTournamentStore()
    now = 1000
    vi.useFakeTimers()
    vi.spyOn(performance, 'now').mockImplementation(() => now)
  })

  afterEach(() => {
    cleanup()
    resetTournamentStore()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('ignores a heat click that lands during the placement submit guard window', () => {
    seedRunningTournament(8)

    const activeHeat = useTournamentStore
      .getState()
      .heats.find((heat) => heat.status === 'active')
    expect(activeHeat).toBeDefined()
    const heatTestId = `bracket-heat-${activeHeat!.heatNumber}`

    render(
      <BracketTree
        pilots={useTournamentStore.getState().pilots}
        tournamentPhase="running"
        onSubmitResults={(heatId, rankings) => {
          useTournamentStore.getState().submitHeatResults(heatId, rankings)
        }}
      />
    )

    // Given: the active heat's placement modal is open
    fireEvent.click(screen.getByTestId(heatTestId))
    expect(screen.getByTestId('placement-entry-modal')).toBeInTheDocument()

    // When: two pilots are ranked and results are submitted
    const [firstPilotId, secondPilotId] = activeHeat!.pilotIds
    fireEvent.click(screen.getByTestId(`pilot-card-${firstPilotId}`))
    fireEvent.click(screen.getByTestId(`pilot-card-${secondPilotId}`))
    fireEvent.click(screen.getByTestId('submit-placement-btn'))

    // Then: the placement modal closes and the heat is now completed
    expect(screen.queryByTestId('placement-entry-modal')).not.toBeInTheDocument()
    expect(
      useTournamentStore.getState().heats.find((heat) => heat.id === activeHeat!.id)?.status
    ).toBe('completed')

    // And: the second click of a double-click is ignored (no detail modal)
    fireEvent.click(screen.getByTestId(heatTestId))
    expect(screen.queryByTestId('modal-backdrop')).not.toBeInTheDocument()

    // But: a click after the guard window opens the detail modal again
    now += 1000
    fireEvent.click(screen.getByTestId(heatTestId))
    expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument()
  })
})
