import { useMemo } from 'react'
import { cn } from '../../../lib/utils'
import { FALLBACK_PILOT_IMAGE } from '../../../lib/ui-helpers'
import type { BracketHeatBoxProps } from '../types'

/**
 * US-14.5: Heat-Box Design 1:1 Mockup
 * Compact Heat Box for bracket visualization with exact mockup styling
 * 
 * AC1: Standard Heat-Box (140px, night-light bg, 8px radius)
 * AC2: 3er-Heat Box (120px, .three-pilot class)
 * AC3: Grand Finale Box (180px, 3px gold border)
 * AC4: Heat-Header (Bebas Neue 10px, space-between)
 * AC5: Status-Badge (7px, bracket-specific color)
 * AC6: Pilot-Row (flex, 5px gap)
 * AC7: Pilot-Row Top (green bg, green border-left)
 * AC8: Pilot-Row Bottom (red bg, red border-left)
 * AC9: Pilot-Avatar (18px, round)
 * AC10: Pilot-Name (9px, ellipsis)
 * AC11: Rank-Badge (14px, Gold/Silver/Bronze/Cyan)
 */
export function BracketHeatBox({
  heat,
  pilots,
  bracketType,
  onClick,
  onEdit,
  isNew = false
}: BracketHeatBoxProps) {
  // Get pilot count for 3-pilot detection
  const pilotCount = heat.pilotIds.length
  const isThreePilot = pilotCount === 3
  const isGrandFinale = bracketType === 'finale'
  
  // Sort pilots by rank for completed heats
  const sortedPilots = useMemo(() => {
    const heatPilots = heat.pilotIds
      .map(id => pilots.find(p => p.id === id))
      .filter(Boolean) as typeof pilots
    
    if (heat.status !== 'completed' || !heat.results?.rankings) {
      return heatPilots
    }
    
    // Sort by rank
    return [...heatPilots].sort((a, b) => {
      const rankA = heat.results?.rankings.find(r => r.pilotId === a.id)?.rank ?? 99
      const rankB = heat.results?.rankings.find(r => r.pilotId === b.id)?.rank ?? 99
      return rankA - rankB
    })
  }, [heat, pilots])

  // Check if heat is active (live)
  const isActive = heat.status === 'active'

  // AC1-AC3: Build heat-box classes
  // AC7 (Tech-Spec): Active heats get cursor-pointer, animate-pulse, and glow effect
  const boxClasses = cn(
    'heat-box',
    bracketType === 'loser' && 'lb',
    bracketType === 'qualification' && 'quali',
    isGrandFinale && 'gf',
    isThreePilot && 'three-pilot',
    isNew && 'heat-appear',
    // Live heat styling: clickable with animated pink border
    isActive && 'cursor-pointer heat-live-border shadow-glow-pink'
  )

  // Get pilot row class based on rank
  const getPilotRowClass = (rank: number | undefined) => {
    if (!rank || heat.status !== 'completed') return ''
    
    // Grand Finale: Platz 1 = Champion (gold)
    if (isGrandFinale && rank === 1) return 'champ'
    
    // AC7: Platz 1+2 = Top (green)
    if (rank <= 2) return 'top'
    
    // AC8: Platz 3+4 = Bottom (red)
    return 'bottom'
  }

  // AC5: Status-Badge text - "LIVE" for active heats, "Nx" for pilot count
  const getStatusText = () => {
    if (heat.status === 'active') return 'LIVE'
    return `${pilotCount}x`
  }

  // AC4: Heat name - use roundName if available, otherwise "HEAT X"
  const getHeatName = () => {
    // Use bracket-specific prefix based on bracketType
    const prefix = bracketType === 'qualification' ? 'QUALI' 
                 : bracketType === 'loser' ? 'LB' 
                 : bracketType === 'finale' ? 'GRAND FINALE'
                 : 'WB'
    
    // Grand Finale has no number
    if (bracketType === 'finale') return 'GRAND FINALE'
    
    return `${prefix} H${heat.heatNumber}`
  }

  return (
    <div 
      id={heat.id} 
      className={boxClasses} 
      onClick={onClick} 
      data-testid={isGrandFinale ? 'grand-finale-heat' : `bracket-heat-${heat.heatNumber}`}
    >
      {/* AC4: Heat-Header with AC5: Status-Badge */}
      <div className="heat-header">
        <span>{getHeatName()}</span>
        <span className="heat-status">{getStatusText()}</span>
      </div>
      
      {/* Pilot Rows */}
      <div>
        {sortedPilots.map((pilot) => {
          const ranking = heat.results?.rankings.find(r => r.pilotId === pilot.id)
          const rank = ranking?.rank
          const rowClass = getPilotRowClass(rank)
          
          return (
            <div key={pilot.id} className={cn('pilot-row', rowClass)}>
              {/* AC9: Pilot-Avatar */}
              <img 
                className="pilot-avatar"
                src={pilot.imageUrl || FALLBACK_PILOT_IMAGE}
                alt={pilot.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />
              {/* AC10: Pilot-Name */}
              <span className="pilot-name">{pilot.name}</span>
              {/* AC11: Rank-Badge */}
              {rank && (
                <span className={cn('rank-badge', `r${rank}`)}>
                  {rank}
                </span>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Edit button for completed heats */}
      {heat.status === 'completed' && onEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="absolute top-1 right-1 text-steel hover:text-neon-cyan p-1 text-xs"
          aria-label="Heat bearbeiten"
        >
          ✏️
        </button>
      )}
    </div>
  )
}
