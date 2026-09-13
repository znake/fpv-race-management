import { Modal } from './ui/modal'

interface TournamentStartDialogProps {
  pilotCount: number
  onConfirm: () => void
  onCancel: () => void
}

export function TournamentStartDialog({ pilotCount, onConfirm, onCancel }: TournamentStartDialogProps) {
  return (
    <Modal isOpen={true} onClose={onCancel} title="Turnier starten?" closeOnBackdropClick>
      <div className="text-center mb-8">
        <p className="font-ui text-xl text-chrome mb-2">
          <span className="text-neon-cyan font-bold">{pilotCount}</span> Piloten werden in Heats aufgeteilt
        </p>
        <p className="font-ui text-sm text-steel">
          Nach dem Start können keine neuen Piloten mehr hinzugefügt werden.
        </p>
      </div>

      <Modal.Footer>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-night border-2 border-steel text-steel rounded-lg font-bold hover:border-neon-cyan hover:text-neon-cyan transition-all duration-200"
        >
          Abbrechen
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-3 bg-neon-pink text-void rounded-lg font-bold shadow-glow-pink hover:shadow-glow-pink-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          Bestätigen
        </button>
      </Modal.Footer>
    </Modal>
  )
}
