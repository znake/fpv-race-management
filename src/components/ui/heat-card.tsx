import { useMemo } from 'react'
import { cn } from '../../lib/utils'
import { PilotAvatar } from './pilot-avatar'
import { RankBadge } from './rank-badge'
import { sortPilotsByRank, getHeatBorderClasses, getPilotRowClass } from '../../lib/ui-helpers'
import type { Pilot, HeatResults } from '../../lib/schemas'
import type { BracketType } from '../../lib/bracket-structure-generator'

export interface HeatCardProps {
  // Variante bestimmt Layout
  variant: 'bracket' | 'filled' | 'empty' | 'overview' | 'detail'

  // Daten
  heatNumber: number
  pilots: Pilot[]
  pilotIds: string[]
  results?: HeatResults

  // Status
  status: 'empty' | 'pending' | 'active' | 'completed'
  isOnDeck?: boolean
  isBye?: boolean
  isRecommended?: boolean  // Story 9-2 AC7: Highlight recommended heat

  // Bracket-spezifische Props
  bracketType?: BracketType
  displayHeatNumber?: number
  isFinale?: boolean // WB/LB Finale - nur Platz 1 geht weiter

  // Interaktion
  onClick?: () => void
  onEdit?: () => void

  // Swap mode props (für heat-assignment-view)
  swapMode?: boolean
  selectedPilotId?: string | null
  onPilotClick?: (pilotId: string, heatId: string) => void

  // Styling
  className?: string
}

export function HeatCard({
  variant,
  heatNumber,
  pilots,
  pilotIds,
  results,
  status,
  isOnDeck,
  isBye,
  isRecommended,
  bracketType,
  displayHeatNumber,
  isFinale,
  onClick,
  onEdit,
  swapMode = false,
  selectedPilotId = null,
  onPilotClick,
  className,
}: HeatCardProps) {
  // Gemeinsame Logik
  const borderClass = getHeatBorderClasses(status, isOnDeck)

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

  const activePilots = heatPilots.filter(p => !p.droppedOut && p.status !== 'withdrawn')
  const withdrawnPilots = heatPilots.filter(p => p.droppedOut || p.status === 'withdrawn')
  const hasBye = activePilots.length < 4

  // Use displayHeatNumber if provided (from actual heats[]), otherwise fall back to heatNumber
  const displayNumber = displayHeatNumber ?? heatNumber
  const isSelectedHeat = Boolean(selectedPilotId && pilotIds.includes(selectedPilotId))

  // Variant-spezifisches Rendering
  switch (variant) {
    case 'empty':
      return <EmptyVariant heatNumber={displayNumber} bracketType={bracketType} className={className} />
    case 'bracket':
      return (
        <BracketVariant
          heatNumber={displayNumber}
          sortedPilots={sortedPilots}
          results={results}
          status={status}
          bracketType={bracketType}
          isFinale={isFinale}
          onClick={onClick}
          onEdit={onEdit}
          className={className}
        />
      )
    case 'filled':
      return (
        <FilledVariant
          heatNumber={displayNumber}
          sortedPilots={sortedPilots}
          results={results}
          status={status}
          bracketType={bracketType}
          isFinale={isFinale}
          onClick={onClick}
          className={className}
        />
      )
    case 'overview':
      return (
        <OverviewVariant
          heatNumber={displayNumber}
          sortedPilots={sortedPilots}
          results={results}
          status={status}
          borderClass={borderClass}
          onEdit={onEdit}
          isSelectedHeat={isSelectedHeat}
          selectedPilotId={selectedPilotId}
          swapMode={swapMode}
          isRecommended={isRecommended}
          onPilotClick={onPilotClick}
          className={className}
        />
      )
    case 'detail':
      return (
        <DetailVariant
          heatNumber={displayNumber}
          heatPilots={heatPilots}
          activePilots={activePilots}
          withdrawnPilots={withdrawnPilots}
          results={results}
          status={status}
          borderClass={borderClass}
          hasBye={hasBye}
          isBye={isBye}
          onEdit={onEdit}
          className={className}
        />
      )
  }
}

// Variant: Empty (Platzhalter)
function EmptyVariant({
  heatNumber,
  bracketType,
  className,
}: {
  heatNumber: number
  bracketType?: BracketType
  className?: string
}) {
  const bgClass = bracketType === 'finale'
    ? 'bg-void/50'
    : bracketType === 'winner'
    ? 'bg-winner-green/5'
    : bracketType === 'loser'
    ? 'bg-loser-red/5'
    : 'bg-neon-cyan/5'

  const borderClass = bracketType === 'finale'
    ? 'border-gold/30'
    : bracketType === 'winner'
    ? 'border-winner-green/20'
    : bracketType === 'loser'
    ? 'border-loser-red/20'
    : 'border-neon-cyan/20'

  return (
    <div
      className={cn(
        bgClass,
        'border-2 border-dashed',
        borderClass,
        'rounded-xl p-3 min-w-[180px] min-h-[120px] flex flex-col justify-center items-center cursor-default opacity-60',
        className
      )}
    >
      <span className="font-display text-beamer-body text-steel mb-2">
        HEAT {heatNumber}
      </span>
      <span className="text-beamer-caption text-steel/60">
        Wartet...
      </span>
    </div>
  )
}

// Variant: Bracket (Kompakte Ansicht für Bracket)
// Story 11-3: Added placement color coding
// Story 11-4: Added status indicator
function BracketVariant({
  heatNumber,
  sortedPilots,
  results,
  status,
  bracketType,
  isFinale,
  onClick,
  onEdit,
  className,
}: {
  heatNumber: number
  sortedPilots: Pilot[]
  results?: HeatResults
  status: 'empty' | 'pending' | 'active' | 'completed'
  bracketType?: BracketType
  isFinale?: boolean
  onClick?: () => void
  onEdit?: () => void
  className?: string
}) {
  // Border color based on bracket type (not status) - matching mockup
  const getBorderClass = () => {
    // Active status overrides bracket type
    if (status === 'active') return 'border-neon-cyan shadow-glow-cyan'
    
    // Grand Finale always gold
    if (bracketType === 'finale') {
      return 'border-gold shadow-glow-gold'
    }
    
    // Loser bracket = red
    if (bracketType === 'loser') {
      return status === 'completed' || status === 'pending' 
        ? 'border-loser-red shadow-glow-red' 
        : 'border-loser-red/50 border-dashed'
    }
    
    // Winner bracket = green (default)
    return status === 'completed' || status === 'pending'
      ? 'border-winner-green shadow-glow-green'
      : 'border-winner-green/50 border-dashed'
  }

  const bgClass = bracketType === 'finale'
    ? 'bg-void'
    : 'bg-night-light'

  // Status indicator class based on bracket type
  const getStatusIndicatorClass = () => {
    if (bracketType === 'finale') return 'heat-status gf'
    if (bracketType === 'loser') return 'heat-status lb'
    return 'heat-status' // Default: winner (green)
  }

  // Check if grand finale for champion highlighting
  const isGrandFinale = bracketType === 'finale'

  return (
    <div
      className={cn(
        bgClass,
        'border-2',
        getBorderClass(),
        'rounded-xl p-3 min-w-[180px] cursor-pointer hover:scale-105 transition-transform',
        className
      )}
      onClick={onClick}
      data-testid={`bracket-heat-${heatNumber}`}
    >
      {/* Header with status indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-beamer-body text-chrome">
          HEAT {heatNumber}
        </span>
        <div className="flex items-center gap-1">
          {/* Status indicator for completed heats */}
          {status === 'completed' && (
            <span className={getStatusIndicatorClass()} data-testid="heat-status-indicator">
              ✓
            </span>
          )}
          {status === 'completed' && onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-steel hover:text-neon-cyan p-1"
            >
              ✏️
            </button>
          )}
        </div>
      </div>

      {/* Pilots with placement color coding */}
      <div className="space-y-1">
        {sortedPilots.map((pilot) => {
          const ranking = results?.rankings.find((r) => r.pilotId === pilot.id)
          // Get placement class for completed heats
          // isFinale = WB/LB Finale (nur Platz 1 geht weiter)
          const placementClass = ranking 
            ? getPilotRowClass(ranking.rank, status, isGrandFinale, isFinale)
            : ''

          return (
            <div 
              key={pilot.id} 
              className={cn(
                'pilot-row',
                placementClass
              )}
            >
              <PilotAvatar
                imageUrl={pilot.imageUrl}
                name={pilot.name}
                size="md"
              />
              <span className="font-ui text-beamer-caption text-chrome truncate flex-1">
                {pilot.name}
              </span>
              {ranking && (
                <RankBadge rank={ranking.rank as 1 | 2 | 3 | 4} size="sm" />
              )}
            </div>
          )
        })}
      </div>

      {/* Pending State */}
      {status === 'pending' && (
        <div className="text-center py-2 text-steel text-beamer-caption">
          Wartet...
        </div>
      )}
    </div>
  )
}

// Variant: Filled (Mit Ergebnissen für Bracket)
// Story 11-3: Added placement color coding for completed heats
// Story 11-4: Added heat status indicators
function FilledVariant({
  heatNumber,
  sortedPilots,
  results,
  status,
  bracketType,
  isFinale,
  onClick,
  className,
}: {
  heatNumber: number
  sortedPilots: Pilot[]
  results?: HeatResults
  status: 'empty' | 'pending' | 'active' | 'completed'
  bracketType?: BracketType
  isFinale?: boolean
  onClick?: () => void
  className?: string
}) {
  const borderClass = {
    empty: 'border-steel border-dashed',
    pending: 'border-steel',
    active: 'border-neon-cyan shadow-glow-cyan',
    completed: 'border-winner-green shadow-glow-green'
  }[status] || 'border-steel'

  const bgClass = bracketType === 'finale'
    ? 'bg-void border-gold shadow-glow-gold'
    : bracketType === 'winner'
    ? 'bg-night'
    : bracketType === 'loser'
    ? 'bg-night'
    : 'bg-night'

  // Story 11-3 AC4: Grand Finale is identified by bracketType === 'finale'
  const isGrandFinale = bracketType === 'finale'

  // Story 11-4: Get status indicator class based on bracket type
  const getStatusIndicatorClass = () => {
    if (bracketType === 'finale') return 'heat-status gf'
    if (bracketType === 'loser') return 'heat-status lb'
    return 'heat-status' // Default: winner (green)
  }

  return (
    <div
      className={cn(
        bgClass,
        'border-2',
        borderClass,
        'rounded-xl p-3 min-w-[180px] cursor-pointer hover:scale-105 transition-transform',
        className
      )}
      onClick={onClick}
      data-testid={`bracket-heat-${heatNumber}`}
    >
      {/* Header - Story 11-4: Added status indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-beamer-body text-chrome">
          HEAT {heatNumber}
        </span>
        {/* Story 11-4 AC1+AC2: Show checkmark only for completed heats */}
        {status === 'completed' && (
          <span className={getStatusIndicatorClass()} data-testid="heat-status-indicator">
            ✓
          </span>
        )}
      </div>

      {/* Pilots - Story 11-3: With placement color coding */}
      <div className="space-y-1">
        {sortedPilots.map((pilot) => {
          const ranking = results?.rankings.find((r) => r.pilotId === pilot.id)
          // Story 11-3: Get placement class for completed heats
          // isFinale = WB/LB Finale (nur Platz 1 geht weiter)
          const placementClass = ranking 
            ? getPilotRowClass(ranking.rank, status, isGrandFinale, isFinale)
            : ''

          return (
            <div 
              key={pilot.id} 
              className={cn(
                'pilot-row',
                placementClass
              )}
            >
              <PilotAvatar
                imageUrl={pilot.imageUrl}
                name={pilot.name}
                size="md"
              />
              <span className="font-ui text-beamer-caption text-chrome truncate flex-1">
                {pilot.name}
              </span>
              {ranking && (
                <RankBadge rank={ranking.rank as 1 | 2 | 3 | 4} size="sm" />
              )}
            </div>
          )
        })}
      </div>

      {/* Pending State */}
      {status === 'pending' && (
        <div className="text-center py-1 text-steel text-beamer-caption mt-2">
          Wartet auf Start...
        </div>
      )}
    </div>
  )
}

// Variant: Overview (Kompakte Übersicht)
function OverviewVariant({
  heatNumber,
  sortedPilots,
  results,
  status,
  borderClass,
  onEdit,
  isSelectedHeat,
  selectedPilotId,
  swapMode,
  isRecommended,
  onPilotClick,
  className,
}: {
  heatNumber: number
  sortedPilots: Pilot[]
  results?: HeatResults
  status: 'empty' | 'pending' | 'active' | 'completed'
  borderClass: string
  onEdit?: () => void
  isSelectedHeat: boolean
  selectedPilotId: string | null
  swapMode: boolean
  isRecommended?: boolean
  onPilotClick?: (pilotId: string, heatId: string) => void
  className?: string
}) {
  const finalBorderClass = isSelectedHeat
    ? 'border-neon-cyan shadow-glow-cyan'
    : borderClass

  return (
    <div className={cn('bg-night border-2', finalBorderClass, 'rounded-2xl p-5 relative', className)}>
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
          {status === 'completed' && onEdit && (
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
        {sortedPilots.map((pilot) => {
          const isSelected = selectedPilotId === pilot.id
          const isClickable = swapMode
          const canSwapWith = swapMode && selectedPilotId && selectedPilotId !== pilot.id && !isSelectedHeat
          const ranking = results?.rankings.find((r) => r.pilotId === pilot.id)

          return (
            <div
              key={pilot.id}
              onClick={() => isClickable && onPilotClick?.(pilot.id, `heat-${heatNumber}`)}
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
              <PilotAvatar
                imageUrl={pilot.imageUrl}
                name={pilot.name}
                size="md"
                className={isSelected ? "border-neon-cyan" : "border-steel"}
              />
              <div className="flex items-center">
                <div className="font-ui text-base text-chrome font-semibold">{pilot.name}</div>
                {ranking && <RankBadge rank={ranking.rank as 1 | 2 | 3 | 4} size="sm" />}
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

// Variant: Detail (Detailansicht mit Bye-Handling)
function DetailVariant({
  heatNumber,
  heatPilots,
  activePilots,
  withdrawnPilots,
  results,
  status,
  borderClass,
  hasBye,
  isBye,
  onEdit,
  className,
}: {
  heatNumber: number
  heatPilots: Pilot[]
  activePilots: Pilot[]
  withdrawnPilots: Pilot[]
  results?: HeatResults
  status: 'empty' | 'pending' | 'active' | 'completed'
  borderClass: string
  hasBye: boolean
  isBye?: boolean
  onEdit?: () => void
  className?: string
}) {
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

  const getRankDisplay = (pilot: Pilot) => {
    if (!results) return null
    const ranking = results.rankings.find(r => r.pilotId === pilot.id)
    if (!ranking) return null

    return <RankBadge rank={ranking.rank as 1 | 2 | 3 | 4} size="md" />
  }

  return (
    <div className={cn('bg-night border-3 rounded-2xl p-6', borderClass, className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-beamer-heat font-bold text-chrome">
          HEAT {heatNumber}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-ui text-beamer-body text-steel">
            {activePilots.length}/4 Piloten
          </span>
          {hasBye && isBye && (
            <span className="px-2 py-1 bg-orange-500 text-white text-beamer-caption rounded-full font-bold">
              FREILOS
            </span>
          )}
          {status === 'completed' && onEdit && (
            <button
              onClick={() => onEdit()}
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
            <PilotAvatar
              imageUrl={pilot.imageUrl}
              name={pilot.name}
              size="lg"
              className="border-steel"
            />
            <div className="flex-1">
              <div className="font-display text-beamer-body font-bold text-chrome flex items-center">
                {pilot.name}
                {getPilotBadge(pilot)}
                {getRankDisplay(pilot)}
              </div>
              <div className="font-ui text-beamer-caption text-steel">
                {(() => {
                  const ranking = results?.rankings.find(r => r.pilotId === pilot.id)
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

      {/* Withdrawn Pilots */}
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
                <PilotAvatar
                  imageUrl={pilot.imageUrl}
                  name={pilot.name}
                  size="lg"
                  className="border-red-500/50"
                />
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

      {/* Bye System Info */}
      {hasBye && isBye && (
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

      {/* Empty State */}
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
