import { FALLBACK_PILOT_IMAGE } from '../../../lib/ui-helpers'
import type { PoolVisualizationProps } from '../types'

/**
 * Generic Pool Visualization Component
 * Consolidates Winner and Loser pool visualizations
 * Used in both WB and LB sections
 */
export function PoolVisualization({
  type,
  pilotIds,
  pilots,
  threshold = 4,
  title
}: PoolVisualizationProps) {
  const poolSize = pilotIds.length
  const isReady = poolSize >= threshold

  if (poolSize === 0) return null

  // Type-specific styling
  const colorClasses = type === 'winner'
    ? {
        border: 'border-winner-green',
        shadow: 'shadow-glow-green',
        text: 'text-winner-green',
        bg: 'bg-winner-green/20',
        readyText: 'WB Heat bereit!'
      }
    : {
        border: 'border-loser-red',
        shadow: 'shadow-glow-red',
        text: 'text-loser-red',
        bg: 'bg-loser-red/20',
        readyText: 'Heat bereit!'
      }

  const testId = type === 'winner' ? 'winner-pool-visualization' : 'loser-pool-visualization'

  return (
    <div
      className={`
        bg-night border-2 rounded-xl p-4 min-w-[180px] max-w-[220px]
        ${isReady ? `${colorClasses.border} ${colorClasses.shadow}` : 'border-steel border-dashed'}
      `}
      data-testid={testId}
    >
      <h3 className={`font-display text-beamer-caption ${colorClasses.text} mb-2 text-center`}>
        {title}
      </h3>

      {/* Pool Pilots (FIFO: erste zuerst) */}
      <div className="space-y-2 mb-3">
        {pilotIds.slice(0, 6).map((pilotId) => {
          const pilot = pilots.find(p => p.id === pilotId)
          return (
            <div key={pilotId} className="flex items-center gap-2">
              <img
                src={pilot?.imageUrl || FALLBACK_PILOT_IMAGE}
                alt={pilot?.name}
                className="w-8 h-8 rounded-full object-cover border border-steel"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />
              <span className="font-ui text-xs text-chrome truncate">
                {pilot?.name}
              </span>
            </div>
          )
        })}
        {pilotIds.length > 6 && (
          <div className="text-center text-steel text-xs">
            +{pilotIds.length - 6} weitere
          </div>
        )}
      </div>

      {/* Status */}
      <div className={`
        text-center py-1 px-2 rounded text-xs font-ui
        ${isReady
          ? `${colorClasses.bg} ${colorClasses.text}`
          : 'bg-steel/20 text-steel'}
      `}>
        {poolSize}/{threshold} Piloten
        {isReady ? ` → ${colorClasses.readyText}` : ' → Warte...'}
      </div>
    </div>
  )
}
