import type { Heat } from '../types'
import type { Pilot } from '../lib/schemas'
import { getRankBadgeClasses, FALLBACK_PILOT_IMAGE } from '../lib/ui-helpers'
import { Modal } from './ui/modal'
import { useIsMobile } from '../hooks/useIsMobile'

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
  const isMobile = useIsMobile()
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnBackdropClick data-testid="modal-backdrop">
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-6'}`}>
        <h2 className={`font-display text-neon-cyan ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          HEAT {heat.heatNumber}
        </h2>
      </div>

      {/* Heat Status */}
      <div className={`text-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
        <span className={`inline-block px-3 py-1 rounded-full font-bold ${isMobile ? 'text-xs' : 'text-sm'} ${
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
      <div className={`space-y-3 ${isMobile ? 'mb-4' : 'mb-6'}`}>
        {heat.pilotIds.map((pilotId) => {
          const pilot = pilots.find(p => p.id === pilotId)
          const ranking = heat.results?.rankings.find(r => r.pilotId === pilotId)

          return (
            <div key={pilotId} className={`flex items-center bg-void rounded-xl ${isMobile ? 'gap-3 p-2' : 'gap-4 p-3'}`}>
              {/* Pilot Image */}
              <img
                src={pilot?.imageUrl || FALLBACK_PILOT_IMAGE}
                alt={pilot?.name}
                className={`rounded-full object-cover border-2 border-steel ${isMobile ? 'w-10 h-10' : 'w-16 h-16'}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />

              {/* Pilot Info */}
              <div className="flex-1 min-w-0">
                <div className={`font-display font-bold text-chrome truncate ${isMobile ? 'text-sm' : 'text-lg'}`}>
                  {pilot?.name || 'Unknown Pilot'}
                </div>
                <div className={`font-ui text-steel truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {pilot?.instagramHandle}
                </div>
              </div>

              {/* Ranking Badge */}
              {ranking && (
                <div className={`
                  rounded-full flex items-center justify-center font-bold
                  ${isMobile ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'}
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
        <div className={`bg-void/50 rounded-xl ${isMobile ? 'mb-4 p-2' : 'mb-6 p-3'}`}>
          <div className={`font-ui text-steel mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Abgeschlossen am:
          </div>
          <div className={`font-ui text-chrome ${isMobile ? 'text-sm' : ''}`}>
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
            className={`bg-neon-cyan text-void rounded-lg font-bold hover:shadow-[0_0_20px_rgba(5,217,232,0.5)] transition-all duration-200 ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'}`}
          >
            Bearbeiten
          </button>
        )}
        <button
          onClick={onClose}
          className={`bg-steel text-chrome rounded-lg font-bold hover:bg-steel/80 transition-colors ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'}`}
        >
          Schließen
        </button>
      </Modal.Footer>
    </Modal>
  )
}
