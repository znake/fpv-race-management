import { PilotAvatar } from '../ui/pilot-avatar'
import { cn } from '../../lib/utils'
import type { Pilot } from '../../stores/tournamentStore'

export interface PoolDisplayProps {
  title: string
  pilotIds: string[]
  pilots: Pilot[]
  variant?: 'standard' | 'grandFinale' | 'compact'
  emptyMessage?: string
  maxDisplay?: number
  showCount?: boolean
  className?: string
}

/**
 * Consolidated Pool Visualization Component
 * Replaces PoolVisualization, GrandFinalePoolVisualization, and pool-display.tsx
 *
 * Variants:
 * - standard: Vertical layout for WB/LB pools
 * - grandFinale: Horizontal layout for GF pool with larger avatars
 * - compact: Compact layout for space-constrained areas
 */
export function PoolDisplay({
  title,
  pilotIds,
  pilots,
  variant = 'standard',
  emptyMessage = 'Pool ist leer',
  maxDisplay,
  showCount = true,
  className,
}: PoolDisplayProps) {
  const displayPilots = pilotIds
    .map(id => pilots.find(p => p.id === id))
    .filter((p): p is Pilot => p !== undefined)
    .slice(0, maxDisplay)

  const hasMore = maxDisplay && pilotIds.length > maxDisplay

  // Determine styling based on variant
  const layoutClass = {
    standard: 'flex flex-col gap-2',
    grandFinale: 'flex flex-col gap-2',
    compact: 'flex flex-wrap gap-1',
  }[variant]

  const avatarSize = variant === 'grandFinale' ? 'lg' : 'md'

  // Determine pool type for colors
  const isWB = title.toLowerCase().includes('winner') || title.toLowerCase().includes('wb')
  const isGF = title.toLowerCase().includes('finale') || title.toLowerCase().includes('gf')

  const borderClass = isGF
    ? 'border-gold'
    : isWB
      ? 'border-winner-green/30'
      : 'border-loser-red/30'

  const titleColorClass = isGF
    ? 'text-gold'
    : isWB
      ? 'text-winner-green'
      : 'text-loser-red'

  // Ready state and threshold
  const threshold = isGF ? 2 : 4
  const isReady = pilotIds.length >= threshold
  const glowClass = isReady && isGF ? 'shadow-glow-gold' : isReady ? 'shadow-glow-green' : ''

  return (
    <div
      className={cn(
        'bg-night border-2 rounded-xl p-4 min-w-[180px]',
        borderClass,
        glowClass,
        !isReady && 'border-dashed',
        className
      )}
      data-testid={`pool-display-${variant}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className={cn('font-display text-beamer-caption', titleColorClass)}>
          {title}
        </h3>
        {showCount && (
          <span className="text-cyber-cyan text-sm">
            {pilotIds.length} Piloten
          </span>
        )}
      </div>

      {/* Empty state */}
      {pilotIds.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-2">{emptyMessage}</p>
      ) : (
        <>
          {/* Pilots */}
          <div className={cn('mb-3', layoutClass)}>
            {displayPilots.map((pilot, index) => (
              <div key={pilot.id} className="flex items-center gap-2">
                <PilotAvatar
                  imageUrl={pilot.imageUrl}
                  name={pilot.name}
                  size={avatarSize}
                />
                <div className="flex flex-col">
                  {variant !== 'compact' && (
                    <span className="text-white text-sm truncate">{pilot.name}</span>
                  )}
                  {/* Champion label for Grand Finale */}
                  {variant === 'grandFinale' && (
                    <span className="text-gold/70 text-xs">
                      {index === 0 ? 'WB Champion' : 'LB Champion'}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {hasMore && (
              <span className="text-gray-400 text-sm">
                +{pilotIds.length - maxDisplay} weitere
              </span>
            )}
          </div>

          {/* Status indicator */}
          {showCount && (
            <div
              className={cn(
                'text-center py-1 px-2 rounded text-xs font-ui',
                isReady
                  ? isGF
                    ? 'bg-gold/20 text-gold'
                    : 'bg-winner-green/20 text-winner-green'
                  : 'bg-steel/20 text-steel'
              )}
            >
              {pilotIds.length}/{threshold}+ Piloten
              {isReady
                ? isGF
                  ? ' → Grand Finale bereit!'
                  : ' → Heat bereit!'
                : ' → Warte...'}
            </div>
          )}
        </>
      )}
    </div>
  )
}
