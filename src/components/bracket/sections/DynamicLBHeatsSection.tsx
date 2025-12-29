import { BracketHeatBox } from '../heat-boxes/BracketHeatBox'
import type { DynamicLBHeatsSectionProps } from '../types'

/**
 * Dynamic LB Heats Section - shows dynamically generated LB heats
 * These are heats that exist in heats[] but are NOT in the bracket structure
 * Includes both regular LB heats AND LB Finale
 */
export function DynamicLBHeatsSection({
  heats,
  fullBracket,
  pilots,
  onHeatClick
}: DynamicLBHeatsSectionProps) {
  // Get all LB heat IDs from bracket structure
  const bracketLBHeatIds = new Set<string>()
  for (const round of fullBracket.loserBracket.rounds) {
    for (const heat of round.heats) {
      bracketLBHeatIds.add(heat.id)
    }
  }

  // Filter heats that are dynamic LB heats (regular, not finale):
  // - Not in bracket structure
  // - Have bracketType === 'loser' OR have ID starting with 'lb-heat-'
  const dynamicLBHeats = heats.filter(h =>
    !bracketLBHeatIds.has(h.id) &&
    (h.bracketType === 'loser' || h.id.startsWith('lb-heat-')) &&
    !h.isFinale
  )

  // Find LB Finale (dynamically generated, not in bracket structure)
  const lbFinale = heats.find(h =>
    h.bracketType === 'loser' &&
    h.isFinale &&
    !bracketLBHeatIds.has(h.id)
  )

  if (dynamicLBHeats.length === 0 && !lbFinale) return null

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-beamer-body text-loser-red text-center mb-2">
        Dynamische LB-Heats
      </h3>
      <div className="space-y-3">
        {dynamicLBHeats.map((heat) => (
          <BracketHeatBox
            key={heat.id}
            heat={heat}
            pilots={pilots}
            bracketType="loser"
            onClick={() => onHeatClick(heat.id)}
          />
        ))}
        
        {/* LB Finale - special styling */}
        {lbFinale && (
          <div className="mt-4 pt-4 border-t-2 border-loser-red/30">
            <h4 className="font-display text-beamer-caption text-gold text-center mb-2">
              LB FINALE
            </h4>
            <BracketHeatBox
              heat={lbFinale}
              pilots={pilots}
              bracketType="loser"
              onClick={() => onHeatClick(lbFinale.id)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
