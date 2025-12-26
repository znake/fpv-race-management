import { HeatCard } from '../../ui/heat-card'
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
  return (
    <HeatCard
      variant="filled"
      heatNumber={bracketHeat.heatNumber}
      pilots={pilots}
      pilotIds={bracketHeat.pilotIds}
      results={actualHeat?.results}
      status={bracketHeat.status}
      bracketType={bracketType}
      displayHeatNumber={displayHeatNumber}
      onClick={onClick}
      className="min-w-[180px] cursor-pointer hover:scale-105 transition-transform"
    />
  )
}
