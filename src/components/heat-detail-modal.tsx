import { useRef, useState } from 'react'
import type { Heat } from '../types'
import type { Pilot } from '../lib/schemas'
import { Clock, X } from 'lucide-react'
import { useTournamentStore } from '../stores/tournamentStore'
import { getRankBadgeClasses, FALLBACK_PILOT_IMAGE, formatLapTime, parseLapTimeDigits } from '../lib/ui-helpers'
import { Modal } from './ui/modal'
import { useIsMobile } from '../hooks/useIsMobile'

interface HeatDetailModalProps {
  heat: Heat
  pilots: Pilot[]
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  canEdit?: boolean
}

export function HeatDetailModal({
  heat,
  pilots,
  isOpen,
  onClose,
  onEdit,
  canEdit = true
}: HeatDetailModalProps) {
  const isMobile = useIsMobile()

  const [editingTimeForPilot, setEditingTimeForPilot] = useState<string | null>(null)
  const [timeInputValue, setTimeInputValue] = useState<string>('')
  const isDeleteClickRef = useRef(false) // Prevents blur-vs-delete race condition
  const submitHeatResults = useTournamentStore(state => state.submitHeatResults)

  const msToDigits = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    if (minutes === 0) return String(seconds)
    return `${minutes}${String(seconds).padStart(2, '0')}`
  }

  const handleOpenTimeEdit = (pilotId: string, currentMs?: number) => {
    setEditingTimeForPilot(pilotId)
    setTimeInputValue(currentMs ? msToDigits(currentMs) : '')
  }

  const handleSaveTime = (pilotId: string) => {
    if (!heat.results?.rankings) return

    const parsedMs = parseLapTimeDigits(timeInputValue)
    if (timeInputValue && parsedMs === null) {
      setEditingTimeForPilot(null)
      return
    }

    const updatedRankings = heat.results.rankings.map(r =>
      r.pilotId === pilotId ? { ...r, lapTimeMs: parsedMs ?? undefined } : r
    )

    submitHeatResults(heat.id, updatedRankings)
    setEditingTimeForPilot(null)
  }

  const handleDeleteTime = (pilotId: string) => {
    if (!heat.results?.rankings) return

    const updatedRankings = heat.results.rankings.map(r =>
      r.pilotId === pilotId ? { ...r, lapTimeMs: undefined } : r
    )

    submitHeatResults(heat.id, updatedRankings)
    setEditingTimeForPilot(null)
  }
  
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
                <>
                  <div className={`
                    rounded-full flex items-center justify-center font-bold
                    ${isMobile ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'}
                    ${getRankBadgeClasses(ranking.rank)}
                  `}>
                    {ranking.rank}
                  </div>

                  {heat.status === 'completed' && canEdit && ranking && (
                    <>
                      {editingTimeForPilot === pilotId ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={3}
                            value={timeInputValue}
                            onChange={(e) => setTimeInputValue(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveTime(pilotId)
                              } else if (e.key === 'Escape') {
                                setEditingTimeForPilot(null)
                              }
                            }}
                            onBlur={() => {
                              if (!isDeleteClickRef.current) handleSaveTime(pilotId)
                              isDeleteClickRef.current = false
                            }}
                            className="w-12 px-1 text-center text-sm bg-void border border-steel rounded"
                            autoFocus
                          />
                          {ranking?.lapTimeMs && (
                            <button
                              onMouseDown={() => {
                                isDeleteClickRef.current = true
                              }}
                              onClick={() => handleDeleteTime(pilotId)}
                            >
                              <X className="w-4 h-4 text-steel hover:text-neon-pink" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button onClick={() => handleOpenTimeEdit(pilotId, ranking?.lapTimeMs)}>
                          <Clock className="w-4 h-4 text-steel hover:text-neon-cyan" />
                        </button>
                      )}
                      {ranking?.lapTimeMs && editingTimeForPilot !== pilotId && (
                        <span className="text-xs text-steel ml-1">{formatLapTime(ranking.lapTimeMs)}</span>
                      )}
                    </>
                  )}
                </>
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
        {heat.status === 'completed' && canEdit && (
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
