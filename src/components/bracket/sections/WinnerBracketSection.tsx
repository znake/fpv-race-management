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
 * REFACTORED: Renders heats grouped by roundNumber.
 * Each round is rendered as a separate round-section with proper vertical stacking.
 * This fixes the bug where all heats were shown on the same level.
 * 
 * AC1: Bracket-column container with dynamic width
 * AC2: Green "WINNER BRACKET" header
 * AC3: Round sections with pilot count labels - GROUPED BY roundNumber
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

  // Group heats by roundNumber
  const heatsByRound = new Map<number, Heat[]>()
  regularWBHeats.forEach(heat => {
    const round = heat.roundNumber ?? 1
    const existing = heatsByRound.get(round) || []
    existing.push(heat)
    heatsByRound.set(round, existing)
  })
  
  // Sort rounds ascending
  const sortedRounds = Array.from(heatsByRound.entries()).sort(([a], [b]) => a - b)
  
  // Calculate max heats in any round for column width
  const maxHeatsPerRound = Math.max(...Array.from(heatsByRound.values()).map(h => h.length), 1)
  
  // AC1: Calculate column width based on maximum heats in any round
  const columnWidth = propColumnWidth ?? calculateColumnWidth(maxHeatsPerRound)

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
        {/* Render each round as a separate section */}
        {sortedRounds.map(([roundNumber, roundHeats], roundIndex) => {
          const totalPilotsInRound = roundHeats.reduce((sum, h) => sum + h.pilotIds.length, 0)
          const isLastRound = roundIndex === sortedRounds.length - 1
          
          return (
            <div key={`round-${roundNumber}`}>
              <div className="round-section">
                <div className="round-label">
                  RUNDE {roundNumber} ({totalPilotsInRound} Piloten)
                </div>
                <div 
                  className="round-heats" 
                  style={{ gap: `${calculateRoundGap(roundIndex)}px` }}
                >
                  {roundHeats.map((heat) => (
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
              
              {/* Connector space between rounds (not after the last regular round if no finale) */}
              {(!isLastRound || finaleHeat) && (
                <div className="connector-space" id={`wb-conn-r${roundNumber}-r${roundNumber + 1}`} />
              )}
            </div>
          )
        })}
        
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
