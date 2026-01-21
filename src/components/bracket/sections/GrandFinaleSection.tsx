import { GrandFinaleHeatBox } from './GrandFinaleHeatBox'
import type { Heat, Pilot } from '../../../types'

/**
 * Grand Finale Section - visueller Höhepunkt
 * 
 * Jetzt im Canvas integriert mit CSS-Zentrierung statt JS-Positionierung.
 * Wird unterhalb der WB/LB Brackets angezeigt.
 */

export interface GrandFinaleSectionProps {
  grandFinaleHeat: Heat | null
  pilots: Pilot[]
  heats: Heat[]
  onHeatClick: (heatId: string) => void
  registerHeatRef?: (heatId: string, element: HTMLDivElement | null) => void
}

export function GrandFinaleSection({
  grandFinaleHeat,
  pilots,
  heats,
  onHeatClick,
  registerHeatRef
}: GrandFinaleSectionProps) {
  // Nichts rendern wenn kein Grand Finale Heat
  if (!grandFinaleHeat) return null

  return (
    <div
      className="grand-finale-section"
      data-testid="grand-finale-section"
    >
      <div 
        className="gf-content"
        ref={(el) => registerHeatRef?.(grandFinaleHeat.id, el)}
      >
        {/* GF-Sources Labels */}
        <div className="gf-sources" data-testid="gf-sources">
          <div className="gf-source wb" data-testid="gf-source-wb">
            WB TOP 2
          </div>
          <div className="gf-source lb" data-testid="gf-source-lb">
            LB TOP 2
          </div>
        </div>

        {/* GF-Label "GRAND FINALE" */}
        <div className="gf-label" data-testid="gf-label">
          GRAND FINALE
        </div>

        {/* GrandFinaleHeatBox */}
        <GrandFinaleHeatBox
          heat={grandFinaleHeat}
          pilots={pilots}
          heats={heats}
          onClick={() => onHeatClick(grandFinaleHeat.id)}
        />
      </div>
    </div>
  )
}
