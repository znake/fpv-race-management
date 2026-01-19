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
 * REFACTORED: Renders ONLY dynamic heats from heats[] array.
 * The fullBracketStructure is used only for layout calculations, not for rendering.
 * This fixes the duplicate heat rendering bug where both structure-based and
 * dynamic heats were shown.
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

  // AC1: Calculate column width based on number of regular LB heats
  const columnWidth = providedColumnWidth ?? calculateLBColumnWidth(Math.max(1, regularLBHeats.length))

  // Calculate total pilots in regular heats
  const totalPilots = regularLBHeats.reduce((sum, h) => sum + h.pilotIds.length, 0)

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
        {/* Render regular LB heats (non-finale) */}
        {regularLBHeats.length > 0 && (
          <div className="round-section">
            <div className="round-label">
              RUNDE 1 ({totalPilots} Piloten)
            </div>
            <div className="round-heats" style={{ gap: '10px' }}>
              {regularLBHeats.map((heat) => {
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
        )}
        
        {/* Pool indicator before finale */}
        {regularLBHeats.length > 0 && finaleHeat && (
          <div className="pool-indicator">
            <span className="arrow">↓</span>
            {' '}Top Piloten{' '}
            <span className="arrow">→</span>
            {' '}Finale
          </div>
        )}
        
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
