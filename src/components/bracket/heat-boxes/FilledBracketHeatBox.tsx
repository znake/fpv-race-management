import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { FALLBACK_PILOT_IMAGE, formatLapTime } from '@/lib/ui-helpers'
import { formatChannel, getChannelForPosition } from '@/lib/channel-assignment'
import type { FilledBracketHeatBoxProps } from '../types'

/**
 * US-14.5: Filled Bracket Heat Box with Mockup Design
 * Used when bracketHeat.pilotIds.length > 0
 * Uses displayHeatNumber (from heats[] array) when provided, otherwise bracketHeat.heatNumber
 * 
 * Follows same styling as BracketHeatBox:
 * AC1: Standard Heat-Box (140px, night-light bg, 8px radius)
 * AC2: 3er-Heat Box (120px)
 * AC3: Grand Finale Box (180px, 3px gold border)
 * AC4-AC11: Header, Status, Pilot rows with styling
 */
export function FilledBracketHeatBox({
  bracketHeat,
  pilots,
  bracketType,
  onClick,
  displayHeatNumber,
  actualHeat
}: FilledBracketHeatBoxProps) {
  // Use displayHeatNumber if provided, otherwise fall back to bracketHeat.heatNumber
  const heatNumber = displayHeatNumber ?? bracketHeat.heatNumber
  
  // Get pilot count for 3-pilot detection
  const pilotCount = bracketHeat.pilotIds.length
  const isThreePilot = pilotCount === 3
  const isGrandFinale = bracketType === 'finale'
  
  // Get results from actualHeat if available
  const results = actualHeat?.results
  const status = actualHeat?.status ?? bracketHeat.status
  
  // Sort pilots by rank for completed heats
  const sortedPilots = useMemo(() => {
    const heatPilots = bracketHeat.pilotIds
      .map(id => pilots.find(p => p.id === id))
      .filter(Boolean) as typeof pilots
    
    if (status !== 'completed' || !results?.rankings) {
      return heatPilots
    }
    
    // Sort by rank
    return [...heatPilots].sort((a, b) => {
      const rankA = results.rankings.find(r => r.pilotId === a.id)?.rank ?? 99
      const rankB = results.rankings.find(r => r.pilotId === b.id)?.rank ?? 99
      return rankA - rankB
    })
  }, [bracketHeat.pilotIds, pilots, status, results])

  // Check if heat is active (live)
  const isActive = status === 'active'

  // Build heat-box classes
  const boxClasses = cn(
    'heat-box',
    bracketType === 'loser' && 'lb',
    bracketType === 'qualification' && 'quali',
    isGrandFinale && 'gf',
    isThreePilot && 'three-pilot',
    // Live heat styling: clickable with animated border (cyan for LB, pink otherwise)
    isActive && bracketType === 'loser' && 'cursor-pointer heat-live-border-cyan shadow-glow-cyan-live',
    isActive && bracketType !== 'loser' && 'cursor-pointer heat-live-border shadow-glow-pink'
  )

  // Get pilot row class based on rank
  const getPilotRowClass = (rank: number | undefined) => {
    if (!rank || status !== 'completed') return ''
    
    // Grand Finale: Platz 1 = Champion (gold)
    if (isGrandFinale && rank === 1) return 'champ'
    
    // Platz 1+2 = Top (green)
    if (rank <= 2) return 'top'
    
    // Platz 3+4 = Bottom (red)
    return 'bottom'
  }

  // AC5: Status-Badge text - "LIVE" for active heats, "Nx" for pilot count
  const getStatusText = () => {
    if (status === 'active') return 'LIVE'
    return `${pilotCount}x`
  }

  // AC4: Heat name - use bracket-specific prefix
  const getHeatName = () => {
    const prefix = bracketType === 'qualification' ? 'QUALI' 
                 : bracketType === 'loser' ? 'LB' 
                 : bracketType === 'finale' ? 'GRAND FINALE'
                 : 'WB'
    
    if (bracketType === 'finale') return 'GRAND FINALE'
    return `${prefix} H${heatNumber}`
  }

  return (
    <div className={boxClasses} onClick={onClick} data-testid={`bracket-heat-${heatNumber}`}>
      {/* Heat-Header with Status-Badge */}
      <div className="heat-header">
        <span>{getHeatName()}</span>
        <span className="heat-status">{getStatusText()}</span>
      </div>
      
      {/* Pilot Rows */}
      <div>
        {sortedPilots.map((pilot) => {
          const ranking = results?.rankings.find(r => r.pilotId === pilot.id)
          const rank = ranking?.rank
          const rowClass = getPilotRowClass(rank)
          
          const originalIndex = bracketHeat.pilotIds.indexOf(pilot.id)
          const channel = getChannelForPosition(originalIndex, pilotCount)
          
          return (
            <div key={pilot.id} className="pilot-row-wrapper">
              <span className="channel-badge-outer">
                {formatChannel(channel)}
              </span>
              <div className={cn('pilot-row', rowClass, 'flex-1')}>
                <img 
                  id={`pilot-avatar-${pilot.id}-${bracketHeat.id}`}
                  className="pilot-avatar"
                  src={pilot.imageUrl || FALLBACK_PILOT_IMAGE}
                  alt={pilot.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                  }}
                />
                <span className="pilot-name">{pilot.name}</span>
                {/* Rank-Badge */}
                {rank && (
                  <span className={cn('rank-badge', `r${rank}`)}>
                    {rank}
                  </span>
                )}
                {ranking?.lapTimeMs && (
                  <span className="text-xs text-steel ml-1">
                    {formatLapTime(ranking.lapTimeMs)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Pending State */}
      {status === 'pending' && sortedPilots.length === 0 && (
        <div className="text-center py-2 text-steel text-xs">
          Wartet...
        </div>
      )}
    </div>
  )
}
