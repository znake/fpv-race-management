interface PilotPathToggleProps {
  showPilotPaths: boolean
  onToggle: () => void
}

export function PilotPathToggle({ showPilotPaths, onToggle }: PilotPathToggleProps) {
  return (
    <div className="pilot-path-toggle">
      <span className="pilot-path-toggle-label">Pilot-Pfade</span>
      <button
        onClick={onToggle}
        data-testid="pilot-path-toggle"
        className="pilot-path-toggle-button"
        data-active={showPilotPaths}
      >
        <span className="pilot-path-toggle-knob" />
      </button>
    </div>
  )
}
