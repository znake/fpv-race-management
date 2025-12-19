import type { Heat } from '../stores/tournamentStore'
import type { Pilot } from '../lib/schemas'
import { HeatCard } from './heat-card'
import { useTournamentStore } from '../stores/tournamentStore'

type HeatOverviewProps = {
  heats: Heat[]
  pilots: Pilot[]
}

export function HeatOverview({ heats, pilots }: HeatOverviewProps) {
  const pilotsById = new Map(pilots.map((p) => [p.id, p]))
  const reopenHeat = useTournamentStore((state) => state.reopenHeat)

  if (heats.length === 0) {
    return (
      <div className="bg-night border-2 border-steel rounded-2xl p-10 text-center text-steel">
        Keine Heats generiert.
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {heats
          .slice()
          .sort((a, b) => a.heatNumber - b.heatNumber)
          .map((heat) => (
            <HeatCard 
              key={heat.id} 
              heat={heat} 
              pilotsById={pilotsById} 
              onEdit={heat.status === 'completed' ? reopenHeat : undefined}
            />
          ))}
      </div>
    </div>
  )
}
