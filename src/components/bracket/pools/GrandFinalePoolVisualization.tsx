import { FALLBACK_PILOT_IMAGE } from '../../../lib/ui-helpers'
import type { GrandFinalePoolVisualizationProps } from '../types'

/**
 * Grand Finale Pool Visualization (Story 4.3 Task 9)
 * Shows pilots waiting in the Grand Finale pool
 */
export function GrandFinalePoolVisualization({
  grandFinalePool,
  pilots
}: GrandFinalePoolVisualizationProps) {
  const poolSize = grandFinalePool.length
  const isReady = poolSize >= 2 // GF braucht mindestens 2 Piloten

  if (poolSize === 0) return null

  return (
    <div
      className={`
        bg-night border-2 rounded-xl p-4 min-w-[200px] max-w-[280px]
        ${isReady ? 'border-gold shadow-glow-gold' : 'border-steel border-dashed'}
      `}
      data-testid="grand-finale-pool"
    >
      <h3 className="font-display text-beamer-caption text-gold mb-2 text-center">
        GF POOL
      </h3>

      {/* Pool Pilots */}
      <div className="space-y-2 mb-3">
        {grandFinalePool.map((pilotId, index) => {
          const pilot = pilots.find(p => p.id === pilotId)
          const championLabel = index === 0 ? 'WB Champion' : 'LB Champion'
          return (
            <div key={pilotId} className="flex items-center gap-2">
              <img
                src={pilot?.imageUrl || FALLBACK_PILOT_IMAGE}
                alt={pilot?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gold"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />
              <div className="flex flex-col">
                <span className="font-ui text-xs text-chrome truncate">
                  {pilot?.name}
                </span>
                <span className="font-ui text-xs text-gold/70">
                  {championLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Status */}
      <div className={`
        text-center py-1 px-2 rounded text-xs font-ui
        ${isReady
          ? 'bg-gold/20 text-gold'
          : 'bg-steel/20 text-steel'}
      `}>
        {poolSize}/2+ Piloten
        {isReady ? ' → Grand Finale bereit!' : ' → Warte...'}
      </div>
    </div>
  )
}
