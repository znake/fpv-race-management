import { BracketRoundColumn } from '../layout/BracketRoundColumn'
import { PoolDisplay } from '../PoolDisplay'
import { DynamicLBHeatsSection } from './DynamicLBHeatsSection'
import type { LoserBracketSectionProps } from '../types'

/**
 * Loser Bracket Section - tree structure from left to right
 * Includes Pool Visualization and Dynamic LB Heats (Story 9-2)
 */
export function LoserBracketSection({
  fullBracket,
  pilots,
  heats,
  loserPool,
  hasActiveWBHeats: _hasActiveWBHeats,
  onHeatClick
}: LoserBracketSectionProps) {
  // Show section if there are LB rounds OR if there are pilots in the pool OR dynamic LB heats exist
  const hasDynamicLBHeats = heats.some(h =>
    (h.bracketType === 'loser' || h.id.startsWith('lb-heat-')) &&
    !h.isFinale
  )

  if (!fullBracket.loserBracket.rounds.length && loserPool.length === 0 && !hasDynamicLBHeats) return null

  return (
    <section className="loser-bracket-section bg-void/50 border-2 border-loser-red/30 rounded-2xl p-6">
      <h2 className="font-display text-beamer-heat text-loser-red mb-4">
        LOSER BRACKET
      </h2>
      <div className="flex gap-8 overflow-x-auto pb-4 min-w-fit">
        {/* Pool Visualization (Story 9-2 AC6) */}
        <div className="flex flex-col gap-4">
          <h3 className="font-display text-beamer-body text-steel text-center mb-2">
            Pool
          </h3>
          <PoolDisplay
            title="LOSER POOL"
            pilotIds={loserPool}
            pilots={pilots}
            variant="standard"
            maxDisplay={6}
          />
        </div>

        {/* Dynamic LB Heats Section */}
        <DynamicLBHeatsSection
          heats={heats}
          fullBracket={fullBracket}
          pilots={pilots}
          onHeatClick={onHeatClick}
        />

        {/* LB Rounds */}
        {fullBracket.loserBracket.rounds.map((round) => (
          <BracketRoundColumn
            key={round.id}
            round={round}
            bracketType="loser"
            pilots={pilots}
            heats={heats}
          />
        ))}
      </div>
    </section>
  )
}
