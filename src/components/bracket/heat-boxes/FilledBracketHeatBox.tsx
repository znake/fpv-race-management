import { useMemo } from 'react'
import { getRankBadgeClasses, FALLBACK_PILOT_IMAGE, sortPilotsByRank } from '../../../lib/ui-helpers'
import type { FilledBracketHeatBoxProps } from '../types'

/**
 * Filled Bracket Heat Box - shows pilots with their names/images
 * Used when bracketHeat.pilotIds.length > 0
 * Uses displayHeatNumber (from heats[] array) when provided, otherwise bracketHeat.heatNumber
 * US-4.4: Sorts pilots by rank for completed heats
 */
export function FilledBracketHeatBox({
  bracketHeat,
  pilots,
  bracketType,
  onClick,
  displayHeatNumber,
  actualHeat  // US-4.4: Pass actual heat for results
}: FilledBracketHeatBoxProps) {
  // US-4.4 Task 2 & 3: Sort pilots by rank for completed heats
  const sortedPilotIds = useMemo(() => {
    if (bracketHeat.status !== 'completed' || !actualHeat?.results?.rankings) {
      return bracketHeat.pilotIds // Ursprüngliche Reihenfolge für pending/active
    }
    return sortPilotsByRank(bracketHeat.pilotIds, actualHeat.results)
  }, [bracketHeat.status, bracketHeat.pilotIds, actualHeat?.results])

  const borderClass = {
    empty: 'border-steel border-dashed',
    pending: 'border-steel',
    active: 'border-neon-cyan shadow-glow-cyan',
    completed: 'border-winner-green shadow-glow-green'
  }[bracketHeat.status] || 'border-steel'

  const bgClass = bracketType === 'finale'
    ? 'bg-void border-gold shadow-glow-gold'
    : bracketType === 'winner'
    ? 'bg-night'
    : bracketType === 'loser'
    ? 'bg-night'
    : 'bg-night' // qualification

  // Use displayHeatNumber if provided (from actual heats[]), otherwise fall back to bracket structure number
  const heatNumber = displayHeatNumber ?? bracketHeat.heatNumber

  return (
    <div
      className={`
        ${bgClass} border-2 ${borderClass} rounded-xl p-3
        min-w-[180px] cursor-pointer hover:scale-105 transition-transform
      `}
      onClick={onClick}
      data-testid={`bracket-heat-${heatNumber}`}
    >
      {/* Header - Beamer-optimiert */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-beamer-body text-chrome">
          HEAT {heatNumber}
        </span>
      </div>

      {/* Pilots - Beamer-optimiert (min 40px Foto) */}
      <div className="space-y-2">
        {sortedPilotIds.map((pilotId: string) => {
          const pilot = pilots.find(p => p.id === pilotId)
          const ranking = actualHeat?.results?.rankings.find((r) => r.pilotId === pilotId)

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
      {bracketHeat.status === 'pending' && (
        <div className="text-center py-1 text-steel text-beamer-caption mt-2">
          Wartet auf Start...
        </div>
      )}
    </div>
  )
}
