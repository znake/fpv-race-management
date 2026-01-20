import { useRef, useEffect, useCallback } from 'react'
import { GrandFinaleHeatBox } from './GrandFinaleHeatBox'
import type { GrandFinaleSectionProps } from '../types'

/**
 * US-14.7: Grand Finale Section - visueller Höhepunkt
 * 
 * AC1: Section unterhalb WB+LB, mittig positioniert
 * AC2: GF-Sources Labels (WB TOP 2 / LB TOP 2)
 * AC3: GF-Label "GRAND FINALE" (Bebas Neue 18px, gold, text-shadow)
 * AC7: Dynamische Positionierung (JavaScript Mittelpunkt-Berechnung)
 */
export function GrandFinaleSection({
  grandFinaleHeat,
  pilots,
  heats,
  wbFinaleRef,
  lbFinaleRef,
  onHeatClick
}: GrandFinaleSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  /**
   * AC7: Dynamische Mittelpunkt-Berechnung zwischen WB-Finale und LB-Finale
   * Wird bei Initial-Load und Resize aufgerufen
   */
  const positionGrandFinale = useCallback(() => {
    const wbFinale = wbFinaleRef.current
    const lbFinale = lbFinaleRef.current
    const gfSection = sectionRef.current

    if (!wbFinale || !lbFinale || !gfSection) return

    const wbRect = wbFinale.getBoundingClientRect()
    const lbRect = lbFinale.getBoundingClientRect()
    const containerRect = document.getElementById('bracket-container')?.getBoundingClientRect()

    if (!containerRect) return

    // Mittelpunkt zwischen WB-Finale und LB-Finale
    const wbCenter = wbRect.left + wbRect.width / 2 - containerRect.left
    const lbCenter = lbRect.left + lbRect.width / 2 - containerRect.left
    const midpoint = (wbCenter + lbCenter) / 2

    // GF-Box Breite (180px gemäß AC4)
    const gfWidth = 180

    // Padding-Left setzen für zentrierte Positionierung
    gfSection.style.paddingLeft = `${Math.max(0, midpoint - gfWidth / 2)}px`
  }, [wbFinaleRef, lbFinaleRef])

  // AC7: Position bei Initial-Load und Resize berechnen
  useEffect(() => {
    positionGrandFinale()
    window.addEventListener('resize', positionGrandFinale)
    return () => window.removeEventListener('resize', positionGrandFinale)
  }, [positionGrandFinale])

  // Nichts rendern wenn kein Grand Finale Heat
  if (!grandFinaleHeat) return null

  return (
    <div
      ref={sectionRef}
      className="grand-finale-section positioned"
      data-testid="grand-finale-section"
    >
      <div className="gf-content">
        {/* AC2: GF-Sources Labels */}
        <div className="gf-sources" data-testid="gf-sources">
          <div className="gf-source wb" data-testid="gf-source-wb">
            WB TOP 2
          </div>
          <div className="gf-source lb" data-testid="gf-source-lb">
            LB TOP 2
          </div>
        </div>

        {/* AC3: GF-Label "GRAND FINALE" */}
        <div className="gf-label" data-testid="gf-label">
          GRAND FINALE
        </div>

        {/* AC4, AC5, AC6, AC8: GrandFinaleHeatBox */}
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
