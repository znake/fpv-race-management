import type { Heat } from '../types'
import type { Pilot } from '../lib/schemas'
import { HeatCard } from './ui/heat-card'
import { useTournamentStore } from '../stores/tournamentStore'

type HeatOverviewProps = {
  heats: Heat[]
  pilots: Pilot[]
}

export function HeatOverview({ heats, pilots }: HeatOverviewProps) {
  const reopenHeat = useTournamentStore((state) => state.reopenHeat)

  // Story 9-2 AC7: Get next recommended heat
  const nextRecommendedHeat = useTournamentStore((state) => state.getNextRecommendedHeat())

  if (heats.length === 0) {
    return (
      <div className="bg-night border-2 border-steel rounded-2xl p-10 text-center text-steel">
        Keine Heats generiert.
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Story 9-2 AC7: Show recommended heat indicator */}
      {nextRecommendedHeat && (
        <div className="mb-4 p-4 bg-void/50 border-2 border-neon-cyan rounded-xl text-center">
          <p className="font-display text-beamer-body text-neon-cyan">
            Empfohlener Heat: HEAT {nextRecommendedHeat.heatNumber}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {heats
          .slice()
          .sort((a, b) => a.heatNumber - b.heatNumber)
          .map((heat) => (
            <HeatCard
              key={heat.id}
              variant="overview"
              heatNumber={heat.heatNumber}
              pilots={pilots}
              pilotIds={heat.pilotIds}
              results={heat.results}
              status={heat.status}
              onEdit={heat.status === 'completed' ? () => reopenHeat(heat.id) : undefined}
              // Story 9-2 AC7: Highlight recommended heat
              isRecommended={nextRecommendedHeat?.id === heat.id}
            />
          ))}
      </div>
    </div>
  )
}
