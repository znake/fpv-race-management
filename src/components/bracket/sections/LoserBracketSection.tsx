import React from 'react'
import { BracketHeatBox } from '../heat-boxes/BracketHeatBox'
import { EmptyBracketHeatBox } from '../heat-boxes/EmptyBracketHeatBox'
import { calculateLBColumnWidth } from '../../../lib/bracket-layout-calculator'
import type { LoserBracketSectionProps } from '../types'

/**
 * US-14.4: Loser Bracket Layout
 * 
 * Renders the Loser Bracket as a pool-based vertical column with rounds.
 * Unlike WB, LB uses Pool-Indicators instead of SVG connector lines
 * because pilots are "reshuffled" between rounds (pool-based system).
 * 
 * AC1: Bracket-column container with dynamic width (40px gap from WB)
 * AC2: Red "LOSER BRACKET" header with Bebas Neue, glow-red
 * AC3: Round sections with pool composition labels
 * AC4: Pool-Indicator between rounds showing pilot flow
 * AC5: NO SVG lines in LB (pool-based system)
 * AC6: Support for 3-pilot heats (120px width)
 * AC7: Red border and glow for LB heats
 */
export function LoserBracketSection({
  structure,
  heats,
  pilots,
  onHeatClick,
  registerHeatRef,
  columnWidth: providedColumnWidth
}: LoserBracketSectionProps) {
  // Return null for empty structure
  if (!structure || structure.rounds.length === 0) return null

  // AC1: Calculate column width based on max heats in any round
  const maxHeatsInRound = Math.max(...structure.rounds.map(r => r.heats.length))
  const columnWidth = providedColumnWidth ?? calculateLBColumnWidth(maxHeatsInRound)

  /**
   * Calculate pilot count for a round
   * Standard: 4 pilots per heat, but supports 3-pilot heats
   */
  const getPilotCount = (roundIndex: number): number => {
    const round = structure.rounds[roundIndex]
    let totalPilots = 0
    
    round.heats.forEach(bracketHeat => {
      const heat = heats.find(h => h.id === bracketHeat.id)
      if (heat) {
        totalPilots += heat.pilotIds.length
      } else {
        // Empty bracket heat placeholder - assume 4 pilots
        totalPilots += 4
      }
    })
    
    return totalPilots
  }

  /**
   * AC3: Get pool composition text for a round
   * Shows where pilots come from (e.g., "16 Quali + 8 WB R1")
   */
  const getPoolComposition = (roundIndex: number): string => {
    const currentPilotCount = getPilotCount(roundIndex)
    
    if (roundIndex === 0) {
      // First LB round - receives losers from Quali
      return `${currentPilotCount} Piloten`
    }
    
    // Later rounds - show combination of LB winners and WB losers
    const prevRound = structure.rounds[roundIndex - 1]
    const advancingFromPrevious = prevRound.heats.length * 2 // 2 winners per heat
    const fromWB = currentPilotCount - advancingFromPrevious
    
    if (fromWB > 0) {
      return `${advancingFromPrevious} LB + ${fromWB} WB`
    }
    return `${currentPilotCount} Piloten`
  }

  /**
   * AC4: Calculate pilot flow info for pool indicator
   */
  const getPoolIndicatorInfo = (currentRoundIndex: number): {
    advancingCount: number
    incomingFromWB: number
    totalNext: number
  } | null => {
    if (currentRoundIndex >= structure.rounds.length - 1) return null
    
    const currentRound = structure.rounds[currentRoundIndex]
    
    const advancingCount = currentRound.heats.length * 2 // 2 winners per heat
    const nextPilotCount = getPilotCount(currentRoundIndex + 1)
    const incomingFromWB = Math.max(0, nextPilotCount - advancingCount)
    
    return {
      advancingCount,
      incomingFromWB,
      totalNext: nextPilotCount
    }
  }

  /**
   * AC6: Check if heat is a 3-pilot heat
   */
  const isThreePilotHeat = (heatId: string): boolean => {
    const heat = heats.find(h => h.id === heatId)
    return heat ? heat.pilotIds.length === 3 : false
  }

  return (
    <div 
      className="bracket-column lb" 
      style={{ width: `${columnWidth}px` }}
      data-testid="loser-bracket-section"
    >
      {/* AC2: Column Header with red styling */}
      <div className="bracket-column-header">LOSER BRACKET</div>
      
      <div className="bracket-tree" id="lb-tree">
        {structure.rounds.map((round, idx) => {
          // AC3: Get pool composition text for this round
          const composition = getPoolComposition(idx)
          // Use 1-based round numbering for display (Round 1, 2, 3...)
          const displayRoundNumber = idx + 1
          
          // AC4: Get pool indicator info (null for last round)
          const poolInfo = getPoolIndicatorInfo(idx)
          
          return (
            <React.Fragment key={round.id}>
              {/* AC3: Round Section with pool composition label */}
              <div className="round-section">
                <div className="round-label">
                  RUNDE {displayRoundNumber} ({composition})
                </div>
                
                {/* AC4/AC5: Heats layout - horizontal, NO connector spaces */}
                <div className="round-heats" style={{ gap: '10px' }}>
                  {round.heats.map((bracketHeat) => {
                    const heat = heats.find(h => h.id === bracketHeat.id)
                    const isThreePilot = isThreePilotHeat(bracketHeat.id)
                    
                    // AC7: Render empty placeholder if heat not found
                    if (!heat) {
                      return (
                        <div 
                          key={bracketHeat.id} 
                          ref={(el) => registerHeatRef(bracketHeat.id, el)}
                          data-three-pilot={isThreePilot ? 'true' : 'false'}
                        >
                          <EmptyBracketHeatBox
                            bracketHeat={bracketHeat}
                            bracketType="loser"
                          />
                        </div>
                      )
                    }
                    
                    // AC6 + AC7: Render filled heat with loser bracket styling
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
              
              {/* AC4: Pool-Indicator between rounds (NOT connector-space!) */}
              {/* AC5: No SVG lines in LB - using pool indicator instead */}
              {poolInfo && (
                <div className="pool-indicator">
                  <span className="arrow">↓</span>
                  {' '}{poolInfo.advancingCount} Piloten weiter
                  {poolInfo.incomingFromWB > 0 && (
                    <> + {poolInfo.incomingFromWB} WB Verlierer</>
                  )}
                  {' = '}{poolInfo.totalNext} Piloten{' '}
                  <span className="arrow">→</span>
                  {' '}Neu gemischt
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
