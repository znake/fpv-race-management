import { HeatCard } from '../../ui/heat-card'
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
  // Story 4.3 Task 6: Animation class für neue Heats (AC: 4)
  const animationClass = isNew ? 'heat-appear' : ''

  return (
    <HeatCard
      variant="bracket"
      heatNumber={heat.heatNumber}
      pilots={pilots}
      pilotIds={heat.pilotIds}
      results={heat.results}
      status={heat.status}
      bracketType={bracketType}
      onClick={onClick}
      onEdit={onEdit}
      className={`min-w-[180px] cursor-pointer hover:scale-105 transition-transform ${animationClass}`}
    />
  )
}
