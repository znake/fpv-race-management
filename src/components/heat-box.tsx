import type { Pilot } from '../lib/schemas'
import type { Heat } from '../stores/tournamentStore'
import { FALLBACK_PILOT_IMAGE, sortPilotsByRank, getRankBadgeClasses, getHeatBorderClasses } from '../lib/utils'
import { useMemo } from 'react'

type HeatBoxProps = {
  heat: Heat
  pilots: Pilot[]
  onEdit?: (heatId: string) => void
  showByeHandling?: boolean
}

export function HeatBox({ heat, pilots, onEdit, showByeHandling = true }: HeatBoxProps) {
  // US-4.4 Task 1: Sort pilots by rank for completed heats
  const sortedPilotIds = useMemo(() => {
    if (heat.status !== 'completed' || !heat.results?.rankings) {
      return heat.pilotIds // Ursprüngliche Reihenfolge für pending/active
    }
    return sortPilotsByRank(heat.pilotIds, heat.results)
  }, [heat.status, heat.results, heat.pilotIds])

  // Get pilot objects from sorted pilot IDs
  const heatPilots = sortedPilotIds
    .map((id) => pilots.find((p) => p.id === id))
    .filter(Boolean) as Pilot[]
    
  const activePilots = heatPilots.filter(p => !p.droppedOut && p.status !== 'withdrawn')
  const withdrawnPilots = heatPilots.filter(p => p.droppedOut || p.status === 'withdrawn')
  const hasBye = activePilots.length < 4 // Assuming 4 pilots per heat

  const getPilotStyling = (pilot: Pilot) => {
    if (pilot.droppedOut || pilot.status === 'withdrawn') {
      return 'opacity-60 line-through'
    }
    return ''
  }

  const getPilotBadge = (pilot: Pilot) => {
    if (pilot.droppedOut || pilot.status === 'withdrawn') {
      return (
        <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
          AUSGEFALLEN
        </span>
      )
    }
    return null
  }

  const getRankDisplay = (pilotId: string) => {
    if (!heat.results) return null
    const ranking = heat.results.rankings.find(r => r.pilotId === pilotId)
    if (!ranking) return null
    
    return (
      <span className={`
        ml-2 px-2 py-1 rounded-full text-beamer-caption font-bold
        ${getRankBadgeClasses(ranking.rank)}
      `}>
        {ranking.rank}
      </span>
    )
  }

  return (
    <div className={`bg-night border-3 rounded-2xl p-6 ${getHeatBorderClasses(heat.status)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-beamer-heat font-bold text-chrome">
          HEAT {heat.heatNumber}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-ui text-beamer-body text-steel">
            {activePilots.length}/4 Piloten
          </span>
          {hasBye && showByeHandling && (
            <span className="px-2 py-1 bg-orange-500 text-white text-beamer-caption rounded-full font-bold">
              FREILOS
            </span>
          )}
          {heat.status === 'completed' && onEdit && (
            <button
              onClick={() => onEdit(heat.id)}
              className="p-1 text-steel hover:text-neon-cyan transition-colors"
              title="Heat bearbeiten"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Active Pilots */}
      <div className="space-y-3 mb-4">
        {activePilots.map((pilot, index) => (
          <div
            key={pilot.id}
            className={`
              bg-void border-2 border-steel rounded-xl p-3 
              flex items-center gap-3 transition-all duration-200
              hover:border-neon-cyan hover:shadow-glow-cyan
              ${getPilotStyling(pilot)}
            `}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-steel">
              <img
                src={pilot.imageUrl}
                alt={pilot.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />
            </div>
            <div className="flex-1">
              <div className="font-display text-beamer-body font-bold text-chrome flex items-center">
                {pilot.name}
                {getPilotBadge(pilot)}
                {getRankDisplay(pilot.id)}
              </div>
              <div className="font-ui text-beamer-caption text-steel">
                {/* US-4.4: Show rank for completed heats, otherwise position */}
                {(() => {
                  const ranking = heat.results?.rankings.find(r => r.pilotId === pilot.id)
                  return ranking ? `Platz ${ranking.rank}` : `Position ${index + 1}`
                })()}
              </div>
            </div>
            <div className="font-ui text-beamer-body text-neon-cyan">
              Aktiv
            </div>
          </div>
        ))}
      </div>

      {/* Withdrawn Pilots - Beamer-optimiert */}
      {withdrawnPilots.length > 0 && (
        <div className="border-t-2 border-steel pt-4">
          <h4 className="font-display text-beamer-body font-bold text-red-500 mb-3">
            Ausgefallene Piloten
          </h4>
          <div className="space-y-2">
            {withdrawnPilots.map((pilot) => (
              <div
                key={pilot.id}
                className={`
                  bg-void/50 border-2 border-red-500/30 rounded-xl p-3 
                  flex items-center gap-3 opacity-60
                `}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500/50">
                  <img
                    src={pilot.imageUrl}
                    alt={pilot.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-display text-beamer-body font-bold text-chrome flex items-center">
                    {pilot.name}
                    {getPilotBadge(pilot)}
                  </div>
                  <div className="font-ui text-beamer-caption text-red-500">
                    Erhält Freilos im nächsten Heat
                  </div>
                </div>
                <div className="font-ui text-beamer-body text-red-500">
                    Ausgefallen
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bye System Info - Beamer-optimiert */}
      {hasBye && showByeHandling && (
        <div className="mt-4 p-3 bg-orange-500/10 border-2 border-orange-500/30 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-xl">⚠️</span>
            <div>
              <div className="font-display text-beamer-body font-bold text-orange-500">
                Freilos-System aktiv
              </div>
              <div className="font-ui text-beamer-caption text-orange-400">
                {4 - activePilots.length} Pilot(en) erhalten ein Freilos
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Beamer-optimiert */}
      {heatPilots.length === 0 && (
        <div className="text-center py-8">
          <div className="font-ui text-beamer-body text-steel">
            Keine Piloten in diesem Heat
          </div>
        </div>
      )}
    </div>
  )
}