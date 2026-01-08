import React from 'react'
import { BracketHeatBox } from '../heat-boxes/BracketHeatBox'
import { EmptyBracketHeatBox } from '../heat-boxes/EmptyBracketHeatBox'
import { calculateColumnWidth, calculateRoundGap } from '../../../lib/bracket-layout-calculator'
import type { Heat, Pilot, FullBracketStructure } from '../../../types'

interface WinnerBracketSectionProps {
  structure: FullBracketStructure['winnerBracket']
  heats: Heat[]
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
  registerHeatRef: (heatId: string, el: HTMLDivElement | null) => void
}

/**
 * US-14.3: Winner Bracket Layout
 * 
 * Renders the Winner Bracket as a vertical column with rounds.
 * Each round displays heats horizontally with connector spaces for SVG lines.
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
  structure,
  heats,
  pilots,
  onHeatClick,
  registerHeatRef
}: WinnerBracketSectionProps) {
  // Return null for empty structure
  if (!structure || structure.rounds.length === 0) return null

  // AC1: Calculate column width based on first round heats
  const firstRoundHeats = structure.rounds[0].heats.length
  const columnWidth = calculateColumnWidth(firstRoundHeats)

  /**
   * Calculate pilot count for a round
   * Each heat has 4 pilots (standard FPV racing format)
   */
  const getPilotCount = (heatCount: number): number => {
    return heatCount * 4
  }

  return (
    <div 
      className="bracket-column wb" 
      style={{ width: `${columnWidth}px` }}
      data-testid="winner-bracket-section"
    >
      {/* AC2: Column Header with green styling */}
      <div className="bracket-column-header">WINNER BRACKET</div>
      
      <div className="bracket-tree" id="wb-tree">
        {structure.rounds.map((round, idx) => {
          // AC3: Calculate pilot count for this round
          const pilotCount = getPilotCount(round.heats.length)
          // Use 1-based round numbering for display (Round 1, 2, 3...)
          const displayRoundNumber = idx + 1
          
          return (
            <React.Fragment key={round.id}>
              {/* AC3: Round Section with label */}
              <div className="round-section">
                <div className="round-label">
                  RUNDE {displayRoundNumber} ({pilotCount} Piloten)
                </div>
                
                {/* AC4: Heats layout - horizontal with dynamic gap */}
                {/* AC5: Larger gap for R2+ to center under parent pairs */}
                <div 
                  className="round-heats" 
                  style={{ gap: `${calculateRoundGap(idx)}px` }}
                >
                  {round.heats.map((bracketHeat) => {
                    const heat = heats.find(h => h.id === bracketHeat.id)
                    
                    // AC7: Render empty placeholder if heat not found
                    if (!heat) {
                      return (
                        <div 
                          key={bracketHeat.id} 
                          ref={(el) => registerHeatRef(bracketHeat.id, el)}
                        >
                          <EmptyBracketHeatBox
                            bracketHeat={bracketHeat}
                            bracketType="winner"
                          />
                        </div>
                      )
                    }
                    
                    // AC7: Render filled heat with winner bracket styling
                    return (
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
                    )
                  })}
                </div>
              </div>
              
              {/* AC6: Connector space between rounds for SVG lines */}
              {idx < structure.rounds.length - 1 && (
                <div 
                  className="connector-space" 
                  id={`wb-conn-r${displayRoundNumber}-r${displayRoundNumber + 1}`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
