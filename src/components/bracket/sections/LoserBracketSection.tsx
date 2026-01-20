import { BracketHeatBox } from '../heat-boxes/BracketHeatBox'
import { calculateLBColumnWidth } from '../../../lib/bracket-layout-calculator'
import type { Heat, Pilot } from '../../../types'

// Phase 2.2: Neues Interface ohne structure Prop
interface LoserBracketSectionProps {
  heats: Heat[]
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
  registerHeatRef: (heatId: string, el: HTMLDivElement | null) => void
  columnWidth?: number
}

/**
 * US-14.4: Loser Bracket Layout
 * 
 * REFACTORED: Renders heats grouped by roundNumber.
 * Each round is rendered as a separate round-section with proper vertical stacking.
 * This fixes the bug where all heats were shown on the same level.
 * 
 * AC1: Bracket-column container with dynamic width (40px gap from WB)
 * AC2: Red "LOSER BRACKET" header with Bebas Neue, glow-red
 * AC3: Round sections with pool composition labels - GROUPED BY roundNumber
 * AC4: Pool-Indicator between rounds showing pilot flow
 * AC5: NO SVG lines in LB (pool-based system)
 * AC6: Support for 3-pilot heats (120px width)
 * AC7: Red border and glow for LB heats
 */
export function LoserBracketSection({
  heats,
  pilots,
  onHeatClick,
  registerHeatRef,
  columnWidth: providedColumnWidth
}: LoserBracketSectionProps) {
  // Get ALL LB heats from heats[] array (the single source of truth)
  const allLBHeats = heats.filter(h => h.bracketType === 'loser')

  // Separate regular heats from finales
  const regularLBHeats = allLBHeats.filter(h => !h.isFinale)
  const finaleHeat = allLBHeats.find(h => h.isFinale)
  
  // Phase 2.2: Return null if no LB heats exist (kein Placeholder mehr nötig)
  if (allLBHeats.length === 0) {
    return null
  }

  // Group heats by roundNumber
  const heatsByRound = new Map<number, Heat[]>()
  regularLBHeats.forEach(heat => {
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
  const columnWidth = providedColumnWidth ?? calculateLBColumnWidth(maxHeatsPerRound)

  return (
    <div 
      className="bracket-column lb" 
      style={{ 
        width: `${columnWidth}px`,
        minWidth: `${columnWidth}px` 
      }}
      data-testid="loser-bracket-section"
    >
      {/* AC2: Column Header with red styling */}
      <div className="bracket-column-header">LOSER BRACKET</div>
      
      <div className="bracket-tree" id="lb-tree">
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
                <div className="round-heats" style={{ gap: '10px' }}>
                  {roundHeats.map((heat) => {
                    const isThreePilot = heat.pilotIds.length === 3
                    return (
                      <div 
                        key={heat.id} 
                        ref={(el) => registerHeatRef(heat.id, el)}
                        data-three-pilot={isThreePilot ? 'true' : 'false'}
                      >
                        <BracketHeatBox
                          heat={heat}
                          pilots={pilots}
                          bracketType="loser"
                          onClick={() => onHeatClick(heat.id)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Pool indicator between rounds */}
              {(!isLastRound || finaleHeat) && (
                <div className="pool-indicator">
                  <span className="arrow">↓</span>
                  {' '}Top Piloten{' '}
                  <span className="arrow">→</span>
                  {' '}Neu gemischt
                </div>
              )}
            </div>
          )
        })}
        
        {/* Render LB Finale (if exists) */}
        {finaleHeat && (
          <div className="round-section">
            <div className="round-label">
              FINALE ({finaleHeat.pilotIds.length} Piloten)
            </div>
            <div className="round-heats" style={{ gap: '10px' }}>
              <div 
                key={finaleHeat.id} 
                ref={(el) => registerHeatRef(finaleHeat.id, el)}
                data-three-pilot={finaleHeat.pilotIds.length === 3 ? 'true' : 'false'}
              >
                <BracketHeatBox
                  heat={finaleHeat}
                  pilots={pilots}
                  bracketType="loser"
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
