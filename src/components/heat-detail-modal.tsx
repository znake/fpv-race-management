import type { Heat } from '../types'
import type { Pilot } from '../lib/schemas'
import { getRankBadgeClasses, FALLBACK_PILOT_IMAGE } from '../lib/ui-helpers'
import { Modal } from './ui/modal'

interface HeatDetailModalProps {
  heat: Heat
  pilots: Pilot[]
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
}

export function HeatDetailModal({
  heat,
  pilots,
  isOpen,
  onClose,
  onEdit
}: HeatDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnBackdropClick data-testid="modal-backdrop">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-neon-cyan">
          HEAT {heat.heatNumber}
        </h2>
      </div>

      {/* Heat Status */}
      <div className="mb-6 text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
          heat.status === 'completed'
            ? 'bg-winner-green text-void'
            : heat.status === 'active'
            ? 'bg-neon-cyan text-void'
            : 'bg-steel text-chrome'
        }`}>
          {heat.status === 'completed' ? 'ABGESCHLOSSEN' :
           heat.status === 'active' ? 'AKTIV' : 'WARTET'}
        </span>
      </div>

      {/* Pilots List */}
      <div className="space-y-4 mb-6">
        {heat.pilotIds.map((pilotId) => {
          const pilot = pilots.find(p => p.id === pilotId)
          const ranking = heat.results?.rankings.find(r => r.pilotId === pilotId)

          return (
            <div key={pilotId} className="flex items-center gap-4 p-3 bg-void rounded-xl">
              {/* Pilot Image */}
              <img
                src={pilot?.imageUrl || FALLBACK_PILOT_IMAGE}
                alt={pilot?.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-steel"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />

              {/* Pilot Info */}
              <div className="flex-1">
                <div className="font-display text-lg font-bold text-chrome">
                  {pilot?.name || 'Unknown Pilot'}
                </div>
                <div className="font-ui text-sm text-steel">
                  {pilot?.instagramHandle}
                </div>
              </div>

              {/* Ranking Badge */}
              {ranking && (
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                  ${getRankBadgeClasses(ranking.rank)}
                `}>
                  {ranking.rank}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Completion Info */}
      {heat.status === 'completed' && heat.results && (
        <div className="mb-6 p-3 bg-void/50 rounded-xl">
          <div className="font-ui text-sm text-steel mb-2">
            Abgeschlossen am:
          </div>
          <div className="font-ui text-chrome">
            {new Date(heat.results.completedAt!).toLocaleString('de-DE', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <Modal.Footer>
        {heat.status === 'completed' && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-neon-cyan text-void rounded-lg font-bold hover:shadow-[0_0_20px_rgba(5,217,232,0.5)] transition-all duration-200"
          >
            ✏️ Ergebnisse bearbeiten
          </button>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2 bg-steel text-chrome rounded-lg font-bold hover:bg-steel/80 transition-colors"
        >
          Schließen
        </button>
      </Modal.Footer>
    </Modal>
  )
}
