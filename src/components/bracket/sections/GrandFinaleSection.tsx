import { EmptyBracketHeatBox } from '../heat-boxes/EmptyBracketHeatBox'
import { GrandFinaleHeatBox } from './GrandFinaleHeatBox'
import { PoolDisplay } from '../PoolDisplay'
import type { GrandFinaleSectionProps } from '../types'

/**
 * Grand Finale Section - centered between Winner and Loser
 * Story 4.3 Task 9 & 10: Shows Grand Finale Pool and Heat
 */
export function GrandFinaleSection({
  fullBracket,
  pilots,
  heats,
  grandFinalePool
}: GrandFinaleSectionProps) {
  // Find actual Grand Finale heat from heats array (dynamically created)
  // WICHTIG: Nur grand_finale oder finale bracketType matchen, NICHT isFinale
  // da WB Finale und LB Finale auch isFinale=true haben
  const grandFinaleHeat = heats.find(h =>
    h.bracketType === 'grand_finale' ||
    h.bracketType === 'finale'
  )

  // Show section if there's a GF heat OR pilots in GF pool OR bracket structure has GF
  const hasGFContent = grandFinaleHeat || grandFinalePool.length > 0 || fullBracket.grandFinale

  if (!hasGFContent) return null

  // Show filled heat box if we have a Grand Finale heat with pilots
  const hasPilots = grandFinaleHeat && grandFinaleHeat.pilotIds.length > 0

  return (
    <section
      className="grand-finale-section bg-void border-4 border-gold rounded-2xl p-8 mb-6 shadow-glow-gold finale-glow"
      data-testid="grand-finale-section"
    >
      <h2 className="font-display text-beamer-display text-gold text-center mb-6">
        GRAND FINALE
      </h2>

      <div className="flex justify-center items-start gap-8 overflow-x-auto">
        {/* GF Pool Visualization (Task 9) */}
        {grandFinalePool.length > 0 && !hasPilots && (
          <PoolDisplay
            title="GF POOL"
            pilotIds={grandFinalePool}
            pilots={pilots}
            variant="grandFinale"
          />
        )}

        {/* Grand Finale Heat (Task 10) */}
        {hasPilots && grandFinaleHeat ? (
          <GrandFinaleHeatBox
            heat={grandFinaleHeat}
            pilots={pilots}
          />
        ) : !grandFinalePool.length && fullBracket.grandFinale ? (
          <EmptyBracketHeatBox
            bracketHeat={fullBracket.grandFinale}
            bracketType="finale"
          />
        ) : null}
      </div>
    </section>
  )
}
