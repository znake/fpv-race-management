/**
 * Story 11-7: Bracket Legend Component
 * 
 * Zeigt eine Legende am unteren Rand des Brackets, die erklärt:
 * - Linien-Bedeutung (WB grün, LB rot, GF gold)
 * - Platzierungs-Bedeutung (Platz 1+2 weiter, Platz 3+4 raus)
 * 
 * AC1: Legende zeigt Linien-Bedeutung
 * AC2: Legende zeigt Platzierungs-Bedeutung
 * AC3: Legende ist am unteren Rand mit margin-top
 * AC4: Legende ist auf Beamer lesbar (min 13px Text)
 */

interface BracketLegendProps {
  className?: string
}

export function BracketLegend({ className = '' }: BracketLegendProps) {
  return (
    <div className={`legend ${className}`}>
      {/* AC1: Linien-Bedeutung */}
      <div className="legend-item">
        <div className="legend-line green" />
        Winner Bracket
      </div>
      <div className="legend-item">
        <div className="legend-line red" />
        Loser Bracket
      </div>
      <div className="legend-item">
        <div className="legend-line gold" />
        → Grand Finale
      </div>
      
      {/* AC2: Platzierungs-Bedeutung */}
      <div className="legend-item">
        <div className="legend-color winner" />
        Platz 1+2 (weiter)
      </div>
      <div className="legend-item">
        <div className="legend-color loser" />
        Platz 3+4 (raus)
      </div>
    </div>
  )
}
