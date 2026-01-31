import { useTournamentStore } from '../../stores/tournamentStore'

export function PilotPathToggle() {
  const { showPilotPaths, togglePilotPaths } = useTournamentStore()

  return (
    <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 bg-night/90 border border-neon-cyan/30 rounded-lg px-3 py-2 backdrop-blur-sm">
      <span className="text-sm text-steel">Pilot-Pfade</span>
      <button
        onClick={togglePilotPaths}
        data-testid="pilot-path-toggle"
        className={`w-10 h-5 rounded-full transition-colors ${
          showPilotPaths ? 'bg-neon-cyan/50' : 'bg-night-light'
        }`}
      >
        <span
          className={`block w-4 h-4 bg-chrome rounded-full transition-transform ${
            showPilotPaths ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
