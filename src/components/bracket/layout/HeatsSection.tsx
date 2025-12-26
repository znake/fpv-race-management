import { BracketHeatBox } from '../heat-boxes/BracketHeatBox'
import type { HeatsSectionProps } from '../types'

/**
 * Heats Section - horizontal row of initial qualification heats ONLY
 * Shows only the quali heats (not WB/LB heats)
 */
export function HeatsSection({
  fullBracket,
  heats,
  pilots,
  onHeatClick
}: HeatsSectionProps) {
  if (!fullBracket.qualification.heats.length) return null

  // Get qualification heat IDs from bracket structure
  const qualiHeatIds = new Set(fullBracket.qualification.heats.map(h => h.id))

  // Filter to only show qualification heats from heats[] array
  const qualiHeats = heats.filter(h => qualiHeatIds.has(h.id))

  if (qualiHeats.length === 0) return null

  return (
    <section className="heats-section bg-void/50 border-2 border-neon-cyan/30 rounded-2xl p-6 mb-6">
      <h2 className="font-display text-beamer-heat text-neon-cyan mb-4">
        HEATS
      </h2>
      <p className="text-steel text-beamer-body mb-4">
        Platz 1+2 → Winner Bracket | Platz 3+4 → Loser Bracket
      </p>
      <div className="flex flex-wrap gap-4">
        {qualiHeats.map((heat) => (
          <BracketHeatBox
            key={heat.id}
            heat={heat}
            pilots={pilots}
            bracketType="qualification"
            onClick={() => onHeatClick(heat.id)}
          />
        ))}
      </div>
    </section>
  )
}
