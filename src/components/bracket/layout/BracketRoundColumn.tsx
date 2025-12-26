import { FilledBracketHeatBox } from '../heat-boxes/FilledBracketHeatBox'
import type { BracketRoundColumnProps } from '../types'

/**
 * Bracket Round Column for Winner/Loser Bracket
 * Story 4.3 Task 7: KEINE vorberechneten Platzhalter mehr (AC 5)
 * Zeigt NUR Heats mit tatsächlichen Piloten (dynamisches Bracket)
 * Uses heat numbers from heats[] array when available for correct display
 */
export function BracketRoundColumn({
  round,
  bracketType,
  pilots,
  heats
}: BracketRoundColumnProps) {
  // AC 5: Filter nur Heats MIT Piloten (keine leeren Platzhalter)
  const heatsWithPilots = round.heats.filter(bh => bh.pilotIds.length > 0)

  // Wenn keine Heats mit Piloten, zeige nichts für diese Runde
  if (heatsWithPilots.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-beamer-body text-steel text-center mb-2">
        {round.roundName}
      </h3>
      {heatsWithPilots.map((bracketHeat) => {
        // Find the actual heat in heats[] to get correct heatNumber and results
        const actualHeat = heats.find(h => h.id === bracketHeat.id)
        const displayHeatNumber = actualHeat?.heatNumber ?? bracketHeat.heatNumber

        // AC 5: Nur gefüllte Heats werden angezeigt (keine leeren Platzhalter mehr)
        return (
          <FilledBracketHeatBox
            key={bracketHeat.id}
            bracketHeat={bracketHeat}
            pilots={pilots}
            bracketType={bracketType}
            displayHeatNumber={displayHeatNumber}
            actualHeat={actualHeat}  // US-4.4: Pass for results
          />
        )
      })}
    </div>
  )
}
