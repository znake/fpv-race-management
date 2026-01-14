import { getPilotBracketOrigin } from '../../../lib/bracket-logic'
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
  heats = []
}: GrandFinaleHeatBoxProps) {
  // Get pilot data with bracket origin and ranking
  const pilotsWithOrigin = heat.pilotIds.map(pilotId => {
    const pilot = pilots.find(p => p.id === pilotId)
    const origin = getPilotBracketOrigin(pilotId, heats)
    const rank = heat.results?.rankings.find(r => r.pilotId === pilotId)?.rank
    return { pilot, origin, rank }
  }).sort((a, b) => (a.rank || 5) - (b.rank || 5))

  return (
    <div
      className="heat-box gf"
      id="grand-finale"
      data-testid="grand-finale-heat"
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

        return (
          <div key={pilot.id} className={`pilot-row ${rowClass}`}>
            {/* AC9: Pilot-Avatar */}
            <img
              className="pilot-avatar"
              src={pilot.imageUrl || `https://i.pravatar.cc/150?u=${pilot.id}`}
              alt={pilot.name}
              style={{
                borderColor: origin === 'wb' ? 'var(--winner-green)' : 'var(--loser-red)'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${pilot.id}`
              }}
            />

            {/* AC10: Pilot-Name */}
            <span className="pilot-name">
              {isChamp ? <strong>{pilot.name}</strong> : pilot.name}
            </span>

            {/* AC8: WB/LB Pilot-Tags */}
            <span
              data-testid={`pilot-tag-${pilot.id}`}
              className={`pilot-tag ${origin}`}
            >
              {origin.toUpperCase()}
            </span>

            {/* AC11: Rank-Badge */}
            {rank && (
              <span className={`rank-badge r${rank}`}>{rank}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
