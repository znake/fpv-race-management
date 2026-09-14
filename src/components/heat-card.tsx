import { useMemo } from 'react'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { PilotAvatar } from './ui/pilot-avatar'
import { sortPilotsByRank } from '@/lib/ui-helpers'
import type { Pilot, HeatResults } from '@/lib/schemas'

export interface HeatCardProps {
  // Einzige produktive Variante: Overview (Heat-Zuweisung)
  variant: 'overview'

  // Daten
  heatNumber: number
  pilots: Pilot[]
  pilotIds: string[]
  results?: HeatResults

  // Status
  status: 'empty' | 'pending' | 'active' | 'completed'
  isRecommended?: boolean  // Story 9-2 AC7: Highlight recommended heat

  // Interaktion
  onEdit?: () => void
  canEdit?: boolean

  // DnD props (für heat-assignment-view)
  heatId?: string  // für DnD Drop-Target
  invalidReason?: 'overfilled' | 'empty' | null  // für > 4 oder 0 Piloten
}

export function HeatCard({
  heatNumber,
  pilots,
  pilotIds,
  results,
  status,
  isRecommended,
  onEdit,
  canEdit = true,
  heatId,
  invalidReason = null,
}: HeatCardProps) {
  // Get pilot objects from pilot IDs
  const heatPilots = pilotIds
    .map((id) => pilots.find((p) => p.id === id))
    .filter(Boolean) as Pilot[]

  // Sort pilots by rank for completed heats
  const sortedPilots = useMemo(() => {
    if (status !== 'completed' || !results?.rankings) {
      return heatPilots
    }
    return sortPilotsByRank(pilotIds, results).map(
      (id) => pilots.find((p) => p.id === id)!
    )
  }, [status, results, pilotIds, pilots, heatPilots])

  return (
    <OverviewVariant
      heatNumber={heatNumber}
      heatId={heatId ?? `heat-${heatNumber}`}
      sortedPilots={sortedPilots}
      status={status}
      invalidReason={invalidReason}
      isRecommended={isRecommended}
      onEdit={onEdit}
      canEdit={canEdit}
    />
  )
}

// Draggable Pilot Row for OverviewVariant
function DraggablePilotRow({ 
  pilot, 
}: { 
  pilot: Pilot
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: pilot.id,
  })
  
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-3 rounded-xl p-3 transition-all cursor-grab active:cursor-grabbing",
        isDragging ? "opacity-50 scale-105" : "bg-void border-2 border-steel",
        "hover:border-neon-cyan/50"
      )}
    >
      <PilotAvatar
        imageUrl={pilot.imageUrl}
        name={pilot.name}
        size="md"
      />
      <div className="font-ui text-base text-chrome font-semibold">
        {pilot.name}
      </div>
    </div>
  )
}

// Variant: Overview (Kompakte Übersicht mit DnD)
function OverviewVariant({
  heatNumber,
  heatId,
  sortedPilots,
  status,
  invalidReason,
  isRecommended,
  onEdit,
  canEdit,
}: {
  heatNumber: number
  heatId: string
  sortedPilots: Pilot[]
  status: 'empty' | 'pending' | 'active' | 'completed'
  invalidReason?: 'overfilled' | 'empty' | null
  isRecommended?: boolean
  onEdit?: () => void
  canEdit?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ 
    id: heatId 
  })

  // Border class based on state - F10 fix: orange for empty, red for overfilled
  const borderClass = invalidReason === 'overfilled'
    ? 'border-loser-red shadow-glow-red'
    : invalidReason === 'empty'
      ? 'border-gold shadow-glow-gold'  // Using gold as "warning orange" in Synthwave theme
      : isOver 
        ? 'border-neon-cyan shadow-glow-cyan' 
        : 'border-steel'

  return (
    <div 
      ref={setNodeRef}
      className={cn('bg-night border-2', borderClass, 'rounded-2xl p-5 relative')}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-2 -right-2 bg-neon-cyan text-void text-xs font-bold px-2 py-1 rounded-full shadow-glow-cyan">
          Empfohlen
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-2xl font-bold text-chrome">HEAT {heatNumber}</h3>
        <div className="flex items-center gap-2">
          <span className="font-ui text-sm text-steel">{sortedPilots.length} Pilot{sortedPilots.length === 1 ? '' : 'en'}</span>
          {status === 'completed' && onEdit && canEdit && (
            <button
              onClick={onEdit}
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
        {sortedPilots.map((pilot) => (
          <DraggablePilotRow 
            key={pilot.id} 
            pilot={pilot}
          />
        ))}
      </div>
    </div>
  )
}
