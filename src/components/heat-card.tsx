import type { Heat } from '../stores/tournamentStore'
import type { Pilot } from '../lib/schemas'
import { getRankBadgeClasses, getHeatBorderClasses } from '../lib/ui-helpers'
import { cn } from '../lib/utils'

type HeatCardProps = {
  heat: Heat
  pilotsById: Map<string, Pilot>
  onEdit?: (heatId: string) => void
  isRecommended?: boolean  // Story 9-2 AC7: Highlight recommended heat
  // Swap mode props for heat-assignment-view
  swapMode?: boolean
  selectedPilotId?: string | null
  onPilotClick?: (pilotId: string, heatId: string) => void
}

export function HeatCard({ 
  heat, 
  pilotsById, 
  onEdit, 
  isRecommended,
  swapMode = false,
  selectedPilotId = null,
  onPilotClick
}: HeatCardProps) {
  const pilots = heat.pilotIds
    .map((id) => pilotsById.get(id))
    .filter(Boolean) as Pilot[]
  
  const count = pilots.length
  const isSelectedHeat = selectedPilotId && heat.pilotIds.includes(selectedPilotId)
  
  const getRankDisplay = (pilotId: string) => {
    if (!heat.results) return null
    const ranking = heat.results.rankings.find(r => r.pilotId === pilotId)
    if (!ranking) return null
    
    return (
      <span className={`
        ml-2 px-2 py-1 rounded-full text-xs font-bold
        ${getRankBadgeClasses(ranking.rank)}
      `}>
        {ranking.rank}
      </span>
    )
  }
  
  // Use centralized border styling, with special handling for selected heat in swap mode
  const borderClass = isSelectedHeat 
    ? 'border-neon-cyan shadow-glow-cyan' 
    : getHeatBorderClasses(heat.status, isRecommended)
  
  return (
    <div className={`bg-night border-2 ${borderClass} rounded-2xl p-5 relative`}>
      {/* Story 9-2 AC7: Recommended badge */}
      {isRecommended && (
        <div className="absolute -top-2 -right-2 bg-neon-cyan text-void text-xs font-bold px-2 py-1 rounded-full shadow-glow-cyan">
          Empfohlen
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-2xl font-bold text-chrome">HEAT {heat.heatNumber}</h3>
        <div className="flex items-center gap-2">
          <span className="font-ui text-sm text-steel">{count} Pilot{count === 1 ? '' : 'en'}</span>
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
      
      <div className="space-y-3">
        {pilots.map((pilot) => {
          const isSelected = selectedPilotId === pilot.id
          const isClickable = swapMode
          const canSwapWith = swapMode && selectedPilotId && selectedPilotId !== pilot.id && !isSelectedHeat
          
          return (
            <div
              key={pilot.id}
              onClick={() => isClickable && onPilotClick?.(pilot.id, heat.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl p-3 transition-all",
                isClickable && "cursor-pointer",
                isSelected 
                  ? "bg-neon-cyan/20 border-2 border-neon-cyan shadow-glow-cyan"
                  : canSwapWith
                    ? "bg-void border-2 border-neon-pink hover:bg-neon-pink/10"
                    : "bg-void border-2 border-steel",
                isClickable && !isSelected && !canSwapWith && "hover:border-neon-cyan/50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full overflow-hidden border-2",
                isSelected ? "border-neon-cyan" : "border-steel"
              )}>
                <img
                  src={pilot.imageUrl}
                  alt={pilot.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center">
                <div className="font-ui text-base text-chrome font-semibold">{pilot.name}</div>
                {getRankDisplay(pilot.id)}
              </div>
              {isSelected && (
                <span className="ml-auto text-neon-cyan text-sm font-semibold">AUSGEWÄHLT</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
