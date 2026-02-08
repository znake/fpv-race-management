import { useTournamentStore } from '@/stores/tournamentStore'

export function PilotPathToggle() {
  const { showPilotPaths, togglePilotPaths } = useTournamentStore()

  return (
    <div className="pilot-path-toggle">
      <span className="pilot-path-toggle-label">Pilot-Pfade</span>
      <button
        onClick={togglePilotPaths}
        data-testid="pilot-path-toggle"
        className="pilot-path-toggle-button"
        data-active={showPilotPaths}
      >
        <span className="pilot-path-toggle-knob" />
      </button>
    </div>
  )
}
