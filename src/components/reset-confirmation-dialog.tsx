import { useState } from 'react'

interface ResetConfirmationDialogProps {
  title: string
  description: string
  confirmText: string
  onConfirm: () => void
  onCancel: () => void
  requireCheckboxConfirmation?: boolean  // For "Alles löschen" - requires checkbox confirmation
}

export function ResetConfirmationDialog({
  title,
  description,
  confirmText,
  onConfirm,
  onCancel,
  requireCheckboxConfirmation = false
}: ResetConfirmationDialogProps) {
  const [isChecked, setIsChecked] = useState(false)
  
  const isConfirmEnabled = requireCheckboxConfirmation 
    ? isChecked 
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

        {requireCheckboxConfirmation && (
          <div className="mb-6">
            <label className="flex items-center justify-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-steel bg-void text-loser-red focus:ring-loser-red focus:ring-offset-0 cursor-pointer accent-loser-red"
              />
              <span className="text-steel group-hover:text-chrome transition-colors select-none">
                Ja, ich möchte wirklich alles löschen
              </span>
            </label>
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
