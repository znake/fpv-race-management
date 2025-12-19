import { useState } from 'react'

interface ResetConfirmationDialogProps {
  title: string
  description: string
  confirmText: string
  onConfirm: () => void
  onCancel: () => void
  requireTypedConfirmation?: boolean  // For "Alles löschen" - requires typing "LÖSCHEN"
}

export function ResetConfirmationDialog({
  title,
  description,
  confirmText,
  onConfirm,
  onCancel,
  requireTypedConfirmation = false
}: ResetConfirmationDialogProps) {
  const [typedInput, setTypedInput] = useState('')
  
  const isConfirmEnabled = requireTypedConfirmation 
    ? typedInput === 'LÖSCHEN' 
    : true

  return (
    <div 
      className="fixed inset-0 bg-void/90 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-dialog-title"
    >
      <div className="bg-night border-2 border-loser-red rounded-2xl p-8 max-w-md mx-4 shadow-glow-red">
        <h2 
          id="reset-dialog-title"
          className="font-display text-3xl font-bold text-loser-red mb-4 text-center"
        >
          {title}
        </h2>
        
        <p className="font-ui text-steel text-center mb-6">
          {description}
        </p>

        {requireTypedConfirmation && (
          <div className="mb-6">
            <label className="block text-sm text-steel mb-2 text-center">
              Gib <span className="text-loser-red font-bold">LÖSCHEN</span> ein um zu bestätigen:
            </label>
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder="LÖSCHEN"
              className="w-full px-4 py-3 bg-void border-2 border-steel rounded-lg text-chrome text-center font-mono focus:outline-none focus:border-loser-red transition-colors"
              autoFocus
            />
          </div>
        )}
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-night border-2 border-steel text-steel rounded-lg font-bold hover:border-neon-cyan hover:text-neon-cyan transition-all duration-200"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmEnabled}
            className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
              isConfirmEnabled
                ? 'bg-night border-2 border-loser-red text-loser-red hover:bg-loser-red/10 hover:shadow-glow-red'
                : 'bg-night border-2 border-steel/50 text-steel/50 cursor-not-allowed'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
