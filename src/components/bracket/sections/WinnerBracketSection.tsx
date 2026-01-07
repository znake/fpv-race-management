import { BracketHeatBox } from '../heat-boxes/BracketHeatBox'
import { BracketRoundColumn } from '../layout/BracketRoundColumn'
import { PoolDisplay } from '../PoolDisplay'
import type { WinnerBracketSectionProps } from '../types'

/**
 * Winner Bracket Section - tree structure from left to right
 * Task 4: Includes WB Pool Visualization (AC 2)
 * 
 * Story 13-6: winnerPool wird jetzt dynamisch berechnet statt als Prop übergeben
 */
export function WinnerBracketSection({
  fullBracket,
  pilots,
  heats,
  onHeatClick
}: WinnerBracketSectionProps) {
  // Story 13-6: winnerPool wird nicht mehr als Prop übergeben
  // Der Pool wird jetzt im BracketTree.tsx dynamisch berechnet und dort angezeigt
  // Diese Komponente zeigt nur noch die WB-Heats an
  const winnerPool: string[] = [] // Pool-Display wurde nach BracketTree verschoben

  // Show section if there are WB rounds OR if there are pilots in the pool
  const hasWBRounds = fullBracket.winnerBracket.rounds.length > 0
  const hasWBPool = winnerPool.length > 0

  // Also check for dynamically generated WB heats
  const dynamicWBHeats = heats.filter(h =>
    h.bracketType === 'winner' &&
    !fullBracket.winnerBracket.rounds.some(r => r.heats.some(bh => bh.id === h.id))
  )
  const hasDynamicWBHeats = dynamicWBHeats.length > 0

  if (!hasWBRounds && !hasWBPool && !hasDynamicWBHeats) return null

  return (
    <section className="winner-bracket-section bg-void/50 border-2 border-winner-green/30 rounded-2xl p-6 mb-6">
      <h2 className="font-display text-beamer-heat text-winner-green mb-4">
        WINNER BRACKET
      </h2>
      <div className="flex gap-8 overflow-x-auto pb-4 min-w-fit">
        {/* WB Pool Visualization (Task 4, AC 2) */}
        {hasWBPool && (
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-beamer-body text-steel text-center mb-2">
              WB Pool
            </h3>
            <PoolDisplay
              title="WINNER POOL"
              pilotIds={winnerPool}
              pilots={pilots}
              variant="standard"
              maxDisplay={6}
            />
          </div>
        )}

        {/* Dynamic WB Heats */}
        {hasDynamicWBHeats && (
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-beamer-body text-steel text-center mb-2">
              WB Heats
            </h3>
            <div className="space-y-3">
              {dynamicWBHeats.map((heat) => (
                <BracketHeatBox
                  key={heat.id}
                  heat={heat}
                  pilots={pilots}
                  bracketType="winner"
                  onClick={() => onHeatClick(heat.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* WB Rounds from bracket structure */}
        {fullBracket.winnerBracket.rounds.map((round) => (
          <BracketRoundColumn
            key={round.id}
            round={round}
            bracketType="winner"
            pilots={pilots}
            heats={heats}
          />
        ))}
      </div>
    </section>
  )
}
