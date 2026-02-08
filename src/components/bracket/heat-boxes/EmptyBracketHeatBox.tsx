import { cn } from '@/lib/utils'
import type { EmptyBracketHeatBoxProps } from '../types'

/**
 * US-14.5: Empty placeholder heat box for bracket visualization
 * Shows "Wartet..." with dashed border when no pilots assigned
 * Uses displayHeatNumber (from heats[] array) when provided, otherwise bracketHeat.heatNumber
 * 
 * Follows same mockup styling as BracketHeatBox:
 * - Standard width: 140px
 * - 3-pilot width: 120px
 * - Grand Finale width: 180px
 * - Dashed border in bracket-specific color
 */
export function EmptyBracketHeatBox({
  bracketHeat,
  bracketType,
  displayHeatNumber
}: EmptyBracketHeatBoxProps) {
  const heatNumber = displayHeatNumber ?? bracketHeat.heatNumber
  const pilotCount = bracketHeat.pilotIds.length || 4
  const isThreePilot = pilotCount === 3
  const isGrandFinale = bracketType === 'finale'

  // Build heat-box classes with dashed border for empty state
  const boxClasses = cn(
    'heat-box',
    'border-dashed opacity-60',
    bracketType === 'loser' && 'lb',
    bracketType === 'qualification' && 'quali',
    isGrandFinale && 'gf',
    isThreePilot && 'three-pilot'
  )

  // Heat name based on bracket type
  const getHeatName = () => {
    const prefix = bracketType === 'qualification' ? 'QUALI' 
                 : bracketType === 'loser' ? 'LB' 
                 : bracketType === 'finale' ? 'GRAND FINALE'
                 : 'WB'
    
    if (bracketType === 'finale') return 'GRAND FINALE'
    return `${prefix} H${heatNumber}`
  }

  return (
    <div 
      id={bracketHeat.id}
      className={boxClasses} 
      data-testid={`bracket-heat-empty-${heatNumber}`}
    >
      {/* Heat-Header with Status-Badge */}
      <div className="heat-header">
        <span>{getHeatName()}</span>
        <span className="heat-status">{pilotCount}x</span>
      </div>
      
      {/* Empty state placeholder */}
      <div className="flex flex-col items-center justify-center py-4">
        <span className="text-steel text-xs">Wartet...</span>
      </div>
    </div>
  )
}
