import { BracketHeatBox } from '../heat-boxes/BracketHeatBox'
import type { Heat, Pilot } from '../../../types'

interface QualiSectionProps {
  qualiHeats: Heat[]
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
  registerHeatRef: (heatId: string, el: HTMLDivElement | null) => void
}

export function QualiSection({
  qualiHeats,
  pilots,
  onHeatClick,
  registerHeatRef
}: QualiSectionProps) {
  if (qualiHeats.length === 0) return null
  
  // AC4: Calculate flow indicator counts
  const totalPilots = qualiHeats.reduce((sum, h) => sum + h.pilotIds.length, 0)
  // For Quali: Top 2 per Heat go to WB, Bottom 2 per Heat go to LB
  const winnersCount = qualiHeats.reduce((sum, h) => sum + Math.min(2, h.pilotIds.length), 0)
  const losersCount = totalPilots - winnersCount
  
  return (
    <div className="quali-section">
      <div className="section-header quali">QUALIFIKATION</div>
      <div className="heats-row">
        {qualiHeats.map((heat) => (
          <div key={heat.id} ref={(el) => registerHeatRef(heat.id, el)}>
            <BracketHeatBox
              heat={heat}
              pilots={pilots}
              bracketType="qualification"
              onClick={() => onHeatClick(heat.id)}
            />
          </div>
        ))}
      </div>
      <div className="flow-indicator">
        <span className="flex items-center gap-2">
          <span className="arrow wb-arrow">↓</span> Platz 1+2 ({winnersCount}) → Winner Bracket
        </span>
        <span className="flex items-center gap-2">
          <span className="arrow lb-arrow">↓</span> Platz 3+4 ({losersCount}) → Loser Bracket
        </span>
      </div>
    </div>
  )
}
