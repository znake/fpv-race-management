import { FALLBACK_PILOT_IMAGE, getRankBadgeClasses } from '../../../lib/ui-helpers'
import type { Heat, Pilot } from '../../../types'

/**
 * Story 13-4: Rematch Section Props
 */
export interface RematchSectionProps {
  rematchHeats: Heat[]
  pilots: Pilot[]
  grandFinaleRematchPending: boolean
}

/**
 * Story 13-4 Task 6: Rematch Section Component
 * 
 * Zeigt Rematch-Heats nach dem Grand Finale an.
 * 
 * AC3: Rematch ist 1v1 Heat (2 Piloten)
 * AC5: UI zeigt Rematch-Status und -Ergebnis
 * 
 * Status-Indikator:
 * - pending: Gestrichelte goldene Border
 * - active: Goldene Border mit Glow + Pulse Animation
 * - completed: Grüne Border mit Glow
 */
export function RematchSection({
  rematchHeats,
  pilots,
  grandFinaleRematchPending
}: RematchSectionProps) {
  // Don't render if no rematches needed
  if (!grandFinaleRematchPending && rematchHeats.length === 0) {
    return null
  }

  // If rematches exist but none pending, still show completed rematches
  if (rematchHeats.length === 0) {
    return null
  }

  return (
    <section
      className="rematch-section bg-void border-4 border-gold rounded-2xl p-8 mb-6 shadow-glow-gold"
      data-testid="rematch-section"
    >
      <h2 className="font-display text-beamer-display text-gold text-center mb-6">
        REMATCH
      </h2>

      {/* Info Text */}
      <p className="text-center text-steel text-beamer-caption mb-6 max-w-lg mx-auto">
        WB-Piloten bekommen eine faire zweite Chance, wenn sie von LB-Piloten geschlagen wurden.
      </p>

      {/* Rematch Heats */}
      <div className="flex justify-center items-start gap-8 flex-wrap">
        {rematchHeats.map((heat) => (
          <RematchHeatBox
            key={heat.id}
            heat={heat}
            pilots={pilots}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Story 13-4 Task 6.3: 1v1 Heat-Box mit beiden Piloten
 */
interface RematchHeatBoxProps {
  heat: Heat
  pilots: Pilot[]
}

function RematchHeatBox({ heat, pilots }: RematchHeatBoxProps) {
  // Task 6.4: Status-Indikator (pending/active/completed)
  const borderClass = {
    pending: 'border-gold border-dashed',
    active: 'border-gold shadow-glow-gold animate-pulse',
    completed: 'border-winner-green shadow-glow-green'
  }[heat.status] || 'border-gold'

  const statusText = {
    pending: 'Wartet...',
    active: 'Rematch läuft!',
    completed: 'Abgeschlossen'
  }[heat.status]

  const statusColor = {
    pending: 'text-steel',
    active: 'text-gold animate-pulse',
    completed: 'text-winner-green'
  }[heat.status]

  // Get the two pilots
  const pilot1 = pilots.find(p => p.id === heat.pilotIds[0])
  const pilot2 = pilots.find(p => p.id === heat.pilotIds[1])

  // Get rankings if completed
  const pilot1Ranking = heat.results?.rankings.find(r => r.pilotId === heat.pilotIds[0])
  const pilot2Ranking = heat.results?.rankings.find(r => r.pilotId === heat.pilotIds[1])

  // Determine winner/loser for styling
  const isCompleted = heat.status === 'completed'
  const winnerId = isCompleted ? heat.results?.rankings.find(r => r.rank === 1)?.pilotId : null

  return (
    <div
      className={`
        bg-void/80 border-4 ${borderClass} rounded-2xl p-6 min-w-[300px]
        transition-all duration-300
      `}
      data-testid={`rematch-heat-${heat.rematchForPlace}`}
    >
      {/* Task 6.2: "Rematch um Platz X" Titel */}
      <h3 className="font-display text-beamer-subheading text-gold text-center mb-4">
        Rematch um Platz {heat.rematchForPlace}
      </h3>

      {/* 1v1 Display */}
      <div className="flex items-center justify-center gap-6">
        {/* Pilot 1 */}
        <RematchPilotCard
          pilot={pilot1}
          ranking={pilot1Ranking}
          isWinner={winnerId === pilot1?.id}
          isCompleted={isCompleted}
        />

        {/* VS Divider */}
        <span className="font-display text-beamer-name text-gold">VS</span>

        {/* Pilot 2 */}
        <RematchPilotCard
          pilot={pilot2}
          ranking={pilot2Ranking}
          isWinner={winnerId === pilot2?.id}
          isCompleted={isCompleted}
        />
      </div>

      {/* Status Text */}
      <p className={`text-center ${statusColor} text-beamer-body mt-4`}>
        {statusText}
      </p>
    </div>
  )
}

/**
 * Individual pilot card for rematch display
 */
interface RematchPilotCardProps {
  pilot: Pilot | undefined
  ranking: { pilotId: string; rank: number } | undefined
  isWinner: boolean
  isCompleted: boolean
}

function RematchPilotCard({ pilot, ranking, isWinner, isCompleted }: RematchPilotCardProps) {
  if (!pilot) return null

  // Winner gets green border, loser gets dimmed style
  const containerClass = isCompleted
    ? isWinner
      ? 'border-winner-green shadow-glow-green scale-110'
      : 'border-steel opacity-60'
    : 'border-gold'

  return (
    <div className={`flex flex-col items-center gap-2 transition-all duration-300`}>
      {/* Pilot Image */}
      <div className={`relative border-2 rounded-full ${containerClass}`}>
        <img
          src={pilot.imageUrl || FALLBACK_PILOT_IMAGE}
          alt={pilot.name}
          className="w-20 h-20 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
          }}
        />

        {/* Rank Badge (when completed) */}
        {ranking && (
          <span className={`
            absolute -top-1 -right-1 w-7 h-7 rounded-full
            flex items-center justify-center text-sm font-bold
            rank-badge-animate
            ${getRankBadgeClasses(ranking.rank)}
          `}>
            {ranking.rank}
          </span>
        )}
      </div>

      {/* Pilot Name */}
      <span className={`font-display text-beamer-name ${isWinner ? 'text-gold' : 'text-chrome'}`}>
        {pilot.name}
      </span>

      {/* Winner Label */}
      {isCompleted && isWinner && (
        <span className="text-winner-green text-beamer-caption font-ui uppercase tracking-wider">
          Gewinner
        </span>
      )}
    </div>
  )
}
