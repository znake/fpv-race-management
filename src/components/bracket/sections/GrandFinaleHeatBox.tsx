import { FALLBACK_PILOT_IMAGE, getRankBadgeClasses } from '../../../lib/ui-helpers'
import { getPilotBracketOrigin } from '../../../lib/bracket-logic'
import type { GrandFinaleHeatBoxProps } from '../types'

/**
 * Grand Finale Heat Box - Special styling for the finale
 * Shows 2 pilots with "WB Champion" / "LB Champion" labels
 * 
 * Story 11-6: Tags zeigen Herkunft (WB/LB) der Finalisten
 */
export function GrandFinaleHeatBox({
  heat,
  pilots,
  heats = []
}: GrandFinaleHeatBoxProps) {
  const borderClass = {
    pending: 'border-gold border-dashed',
    active: 'border-gold shadow-glow-gold animate-pulse',
    completed: 'border-winner-green shadow-glow-green'
  }[heat.status] || 'border-gold'

  return (
    <div
      className={`
        bg-void/80 border-4 ${borderClass} rounded-2xl p-6 min-w-[300px]
        transition-all duration-300
      `}
      data-testid="grand-finale-heat"
    >
      {/* Pilots Grid - 2 columns for finale */}
      <div className="flex gap-8 justify-center">
        {heat.pilotIds.map((pilotId, index) => {
          const pilot = pilots.find(p => p.id === pilotId)
          const ranking = heat.results?.rankings.find(r => r.pilotId === pilotId)
          const championLabel = index === 0 ? 'WB Champion' : 'LB Champion'
          
          // Story 11-6: Determine bracket origin for tag
          const bracketOrigin = getPilotBracketOrigin(pilotId, heats)

          return (
            <div key={pilotId} className="flex flex-col items-center">
              {/* Champion Label - Beamer-optimiert */}
              <span className="text-gold text-beamer-caption font-ui mb-2 uppercase tracking-wider">
                {championLabel}
              </span>

              {/* Pilot Image */}
              <div className="relative">
                <img
                  src={pilot?.imageUrl || FALLBACK_PILOT_IMAGE}
                  alt={pilot?.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gold"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                  }}
                />

                {/* Rank Badge (when completed) */}
                {ranking && (
                  <span className={`
                    absolute -top-2 -right-2 w-10 h-10 rounded-full
                    flex items-center justify-center text-lg font-bold
                    rank-badge-animate
                    ${getRankBadgeClasses(ranking.rank)}
                  `}>
                    {ranking.rank}
                  </span>
                )}
              </div>

              {/* Pilot Name with Bracket Origin Tag - Story 11-6 */}
              <div className="flex items-center gap-2 mt-2">
                <span className="font-display text-beamer-name text-chrome">
                  {pilot?.name}
                </span>
                {/* AC1/AC2: WB/LB Tag */}
                <span
                  data-testid={`pilot-tag-${pilotId}`}
                  className={`pilot-tag ${bracketOrigin}`}
                >
                  {bracketOrigin.toUpperCase()}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Status Text - Beamer-optimiert */}
      {heat.status === 'pending' && (
        <p className="text-center text-steel text-beamer-body mt-4">
          Wartet auf Finalisten...
        </p>
      )}
      {heat.status === 'active' && (
        <p className="text-center text-gold text-beamer-body mt-4 animate-pulse">
          Finale läuft!
        </p>
      )}
    </div>
  )
}
