import { BracketHeatBox } from '../heat-boxes/BracketHeatBox'
import { calculateColumnWidth, calculateRoundGap } from '../../../lib/bracket-layout-calculator'
import type { Heat, Pilot } from '../../../types'

// Phase 2.1: structure Prop entfernt - heats[] ist jetzt Single Source of Truth
interface WinnerBracketSectionProps {
  heats: Heat[]
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
  registerHeatRef: (heatId: string, el: HTMLDivElement | null) => void
  columnWidth?: number // Optional prop for overriding calculated width
}

/**
 * US-14.3: Winner Bracket Layout
 * 
 * REFACTORED: Renders ONLY dynamic heats from heats[] array.
 * The fullBracketStructure is used only for layout calculations, not for rendering.
 * This fixes the duplicate heat rendering bug where both structure-based and
 * dynamic heats were shown.
 * 
 * AC1: Bracket-column container with dynamic width
 * AC2: Green "WINNER BRACKET" header
 * AC3: Round sections with pilot count labels
 * AC4: Horizontal heats per round
 * AC5: Larger gaps for R2+ to center under parent pairs
 * AC6: Connector spaces between rounds for SVG lines
 * AC7: Green styling for winner bracket heats
 */
export function WinnerBracketSection({
  heats,
  pilots,
  onHeatClick,
  registerHeatRef,
  columnWidth: propColumnWidth
}: WinnerBracketSectionProps) {
  // Get ALL WB heats from heats[] array (the single source of truth)
  const allWBHeats = heats.filter(h => h.bracketType === 'winner')
  
  // Separate regular heats from finales
  const regularWBHeats = allWBHeats.filter(h => !h.isFinale)
  const finaleHeat = allWBHeats.find(h => h.isFinale)
  
  // Phase 2.1: Return null if no WB heats exist (kein Placeholder mehr nötig)
  if (allWBHeats.length === 0) {
    return null
  }

  // AC1: Calculate column width based on number of regular WB heats
  const columnWidth = propColumnWidth ?? calculateColumnWidth(Math.max(1, regularWBHeats.length))

  // Calculate total pilots in regular heats
  const totalPilots = regularWBHeats.reduce((sum, h) => sum + h.pilotIds.length, 0)

  return (
    <div 
      className="bracket-column wb" 
      style={{ 
        width: `${columnWidth}px`,
        minWidth: `${columnWidth}px` 
      }}
      data-testid="winner-bracket-section"
    >
      {/* AC2: Column Header with green styling */}
      <div className="bracket-column-header">WINNER BRACKET</div>
      
      <div className="bracket-tree" id="wb-tree">
        {/* Render regular WB heats (non-finale) */}
        {regularWBHeats.length > 0 && (
          <div className="round-section">
            <div className="round-label">
              RUNDE 1 ({totalPilots} Piloten)
            </div>
            <div 
              className="round-heats" 
              style={{ gap: `${calculateRoundGap(0)}px` }}
            >
              {regularWBHeats.map((heat) => (
                <div 
                  key={heat.id} 
                  ref={(el) => registerHeatRef(heat.id, el)}
                >
                  <BracketHeatBox
                    heat={heat}
                    pilots={pilots}
                    bracketType="winner"
                    onClick={() => onHeatClick(heat.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Connector space before finale */}
        {regularWBHeats.length > 0 && finaleHeat && (
          <div className="connector-space" id="wb-conn-finale" />
        )}
        
        {/* Render WB Finale (if exists) */}
        {finaleHeat && (
          <div className="round-section">
            <div className="round-label">
              FINALE ({finaleHeat.pilotIds.length} Piloten)
            </div>
            <div className="round-heats">
              <div 
                key={finaleHeat.id} 
                ref={(el) => registerHeatRef(finaleHeat.id, el)}
              >
                <BracketHeatBox
                  heat={finaleHeat}
                  pilots={pilots}
                  bracketType="winner"
                  onClick={() => onHeatClick(finaleHeat.id)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
