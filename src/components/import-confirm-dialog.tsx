/**
 * Import Confirmation Dialog
 * 
 * Tech-Spec: export-import-turnier-state
 * Story 2: Dialog for confirming JSON import with summary preview
 */

import { Modal } from './ui/modal'

export interface ImportSummary {
  pilotCount: number
  heatCount: number
  phase: string
}

interface ImportConfirmDialogProps {
  isOpen: boolean
  importData: ImportSummary
  onConfirm: () => void
  onCancel: () => void
}

export function ImportConfirmDialog({
  isOpen,
  importData,
  onConfirm,
  onCancel
}: ImportConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onCancel} 
      title="Turnier-Stand importieren?" 
      closeOnBackdropClick
    >
      {/* Import Summary */}
      <div className="mb-6 p-4 bg-night rounded-lg border border-steel/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-display text-neon-cyan">
              {importData.pilotCount}
            </div>
            <div className="text-sm text-steel">Piloten</div>
          </div>
          <div>
            <div className="text-2xl font-display text-neon-cyan">
              {importData.heatCount}
            </div>
            <div className="text-sm text-steel">Heats</div>
          </div>
          <div>
            <div className="text-lg font-display text-neon-cyan">
              {importData.phase}
            </div>
            <div className="text-sm text-steel">Phase</div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <p className="font-ui text-loser-red text-center mb-6">
        Der aktuelle Stand wird unwiderruflich überschrieben.
      </p>

      <Modal.Footer>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-night border-2 border-steel text-steel rounded-lg font-bold hover:border-neon-cyan hover:text-neon-cyan transition-all duration-200"
        >
          Abbrechen
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-3 bg-night border-2 border-neon-pink text-neon-pink rounded-lg font-bold hover:bg-neon-pink/10 hover:shadow-glow-pink transition-all duration-200"
        >
          Importieren
        </button>
      </Modal.Footer>
    </Modal>
  )
}
