import { useMemo } from 'react'
import { getRankBadgeClasses, FALLBACK_PILOT_IMAGE, sortPilotsByRank } from '../../../lib/ui-helpers'
import type { BracketHeatBoxProps } from '../types'

/**
 * Compact Heat Box for bracket visualization
 * Shows pilots with rankings when heat is active/completed
 * US-4.4: Sorts pilots by rank for completed heats
 * Story 4.3 Task 6: Animation beim Erstellen (AC: 4)
 */
export function BracketHeatBox({
  heat,
  pilots,
  bracketType,
  onClick,
  onEdit,
  isNew = false
}: BracketHeatBoxProps) {
  // US-4.4 Task 2 & 3: Sort pilots by rank for completed heats
  const sortedPilotIds = useMemo(() => {
    if (heat.status !== 'completed' || !heat.results?.rankings) {
      return heat.pilotIds // Ursprüngliche Reihenfolge für pending/active
    }
    return sortPilotsByRank(heat.pilotIds, heat.results)
  }, [heat.status, heat.results, heat.pilotIds])

  const borderClass = {
    pending: 'border-steel border-dashed',
    active: 'border-neon-cyan shadow-glow-cyan',
    completed: 'border-winner-green shadow-glow-green'
  }[heat.status as string] || 'border-steel'

  const bgClass = bracketType === 'finale'
    ? 'bg-void border-gold shadow-glow-gold'
    : bracketType === 'winner'
    ? 'bg-night'
    : bracketType === 'loser'
    ? 'bg-night'
    : 'bg-night' // qualification

  // Story 4.3 Task 6: Animation class für neue Heats (AC: 4)
  const animationClass = isNew ? 'heat-appear' : ''

  return (
    <div
      className={`
        ${bgClass} border-2 ${borderClass} rounded-xl p-3
        min-w-[180px] cursor-pointer hover:scale-105 transition-transform
        ${animationClass}
      `}
      onClick={onClick}
      data-testid={`bracket-heat-${heat.heatNumber}`}
    >
      {/* Header - Beamer-optimiert */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-beamer-body text-chrome">
          HEAT {heat.heatNumber}
        </span>
        {heat.status === 'completed' && onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-steel hover:text-neon-cyan p-1"
          >
            ✏️
          </button>
        )}
      </div>

      {/* Pilots - Beamer-optimiert (min 40px Foto) */}
      <div className="space-y-2">
        {sortedPilotIds.map((pilotId: string) => {
          const pilot = pilots.find(p => p.id === pilotId)
          const ranking = heat.results?.rankings.find((r) => r.pilotId === pilotId)

          return (
            <div key={pilotId} className="flex items-center gap-2">
              <img
                src={pilot?.imageUrl}
                alt={pilot?.name}
                className="w-10 h-10 rounded-full object-cover border border-steel"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />
              <span className="font-ui text-beamer-caption text-chrome truncate flex-1">
                {pilot?.name}
              </span>
              {/* US-4.4: Show rank badge for completed heats */}
              {ranking && (
                <span className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-beamer-caption font-bold
                  ${getRankBadgeClasses(ranking.rank)}
                `}>
                  {ranking.rank}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Pending State - Beamer-optimiert */}
      {heat.status === 'pending' && (
        <div className="text-center py-2 text-steel text-beamer-caption">
          Wartet...
        </div>
      )}
    </div>
  )
}
