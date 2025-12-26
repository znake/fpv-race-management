import { HeatCard } from '../../ui/heat-card'
import type { EmptyBracketHeatBoxProps } from '../types'

/**
 * Empty placeholder heat box for bracket visualization
 * Shows "Wartet..." with dashed border when no pilots assigned
 * Uses displayHeatNumber (from heats[] array) when provided, otherwise bracketHeat.heatNumber
 */
export function EmptyBracketHeatBox({
  bracketHeat,
  bracketType,
  displayHeatNumber
}: EmptyBracketHeatBoxProps) {
  return (
    <HeatCard
      variant="empty"
      heatNumber={bracketHeat.heatNumber}
      pilots={[]}
      pilotIds={[]}
      status="empty"
      bracketType={bracketType}
      displayHeatNumber={displayHeatNumber}
      className="min-w-[180px] min-h-[120px] cursor-default opacity-60"
    />
  )
}
