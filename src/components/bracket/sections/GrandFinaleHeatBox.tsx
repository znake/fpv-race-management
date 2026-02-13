import { getPilotBracketOrigin } from '@/lib/bracket-logic'
import { formatChannel, getChannelForPosition } from '@/lib/channel-assignment'
import { cn } from '@/lib/utils'
import { FALLBACK_PILOT_IMAGE } from '@/lib/ui-helpers'
import type { GrandFinaleHeatBoxProps } from '../types'

/**
 * US-14.7: Grand Finale Heat Box - Special styling for 4-pilot finale
 *
 * AC4: GF Heat-Box (180px, 3px gold border, glow-gold)
 * AC5: 4-Piloten Darstellung aus WB+LB mit Tags
 * AC6: Champion-Row Styling (goldener Tint, gold border-left)
 * AC8: WB/LB Pilot-Tags (6px badges)
 */
export function GrandFinaleHeatBox({
  heat,
  pilots,
  heats = [],
  onClick,
  onPilotHover
}: GrandFinaleHeatBoxProps) {
  // Get pilot data with bracket origin and ranking
  const pilotsWithOrigin = heat.pilotIds.map(pilotId => {
    const pilot = pilots.find(p => p.id === pilotId)
    const origin = getPilotBracketOrigin(pilotId, heats)
    const rank = heat.results?.rankings.find(r => r.pilotId === pilotId)?.rank
    return { pilot, origin, rank }
  }).sort((a, b) => (a.rank || 5) - (b.rank || 5))

  // Check if heat is active (live)
  const isActive = heat.status === 'active'

  return (
    <div
      className={cn(
        'heat-box gf',
        onClick && 'clickable',
        // Live heat styling: clickable with animated pink border
        isActive && 'heat-live-border shadow-glow-pink'
      )}
      id={heat.id}
      data-testid="grand-finale-heat"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* AC3: GF-Label "GRAND FINALE" */}
      <div className="heat-header">
        GRAND FINALE
        <span className="heat-status">
          {heat.status === 'active' ? 'LIVE' : String(heat.pilotIds.length) + 'x'}
        </span>
      </div>

      {/* AC5: 4-Piloten Darstellung */}
      {pilotsWithOrigin.map(({ pilot, origin, rank }) => {
        if (!pilot) return null

        const isChamp = rank === 1
        const rowClass = isChamp ? 'champ' : ''

        const originalIndex = heat.pilotIds.indexOf(pilot.id)
        const channel = getChannelForPosition(originalIndex, heat.pilotIds.length)

        return (
          <div 
            key={pilot.id} 
            className="pilot-row-wrapper"
            onMouseEnter={() => onPilotHover?.(pilot.id)}
            onMouseLeave={() => onPilotHover?.(null)}
          >
            <span id={`channel-badge-${pilot.id}-${heat.id}`} className="channel-badge-outer">
              {formatChannel(channel)}
            </span>
            <div className={cn('pilot-row', rowClass, 'flex-1')}>
              <img
                id={`pilot-avatar-${pilot.id}-${heat.id}`}
                className="pilot-avatar"
                src={pilot.imageUrl || FALLBACK_PILOT_IMAGE}
                alt={pilot.name}
                style={{
                  borderColor: origin === 'wb' ? 'var(--winner-green)' : 'var(--loser-red)'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />

              <span className="pilot-name">
                {isChamp ? <strong>{pilot.name}</strong> : pilot.name}
              </span>

              <span
                data-testid={`pilot-tag-${pilot.id}`}
                className={`pilot-tag ${origin}`}
              >
                {origin.toUpperCase()}
              </span>

              {rank && (
                <span className={`rank-badge r${rank}`}>{rank}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
