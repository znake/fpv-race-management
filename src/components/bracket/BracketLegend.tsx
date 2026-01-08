/**
 * US-14.9: Legende im Mockup-Design
 *
 * Zeigt eine Legende am unteren Rand des Brackets mit:
 * - Line-Items für Bracket-Typen (Quali, WB, LB, GF)
 * - Color-Items für Platzierungen (Platz 1+2, Platz 3+4)
 * - Spezial-Item "3x" für 3-Pilot Heat
 *
 * AC1: Legende Container (night bg, 8px radius, 25px margin-top, 10px 14px padding, 10px font-size)
 * AC2: Flex-Layout (20px gap, flex-wrap: wrap)
 * AC3: Line-Items (20px × 2px Linie, 6px gap zum Text)
 * AC4: Line-Farben (Cyan, Grün, Rot, Gold)
 * AC5: Color-Items (14px × 14px Quadrat, 3px radius)
 * AC6: Color-Varianten (bg-winner/grüner border, bg-loser/roter border)
 * AC7: Spezial-Item "3x" (font-weight 600, neon-cyan)
 * AC8: Item-Styling (flex, center, 6px gap, steel Text)
 */

interface LegendLineItem {
  color: string
  label: string
}

interface LegendColorItem {
  bgColor: string
  borderColor: string
  label: string
}

const lineItems: LegendLineItem[] = [
  { color: 'var(--quali-blue)', label: 'Qualifikation' },
  { color: 'var(--winner-green)', label: 'Winner Bracket' },
  { color: 'var(--loser-red)', label: 'Loser Bracket' },
  { color: 'var(--gold)', label: 'Grand Finale' }
]

const colorItems: LegendColorItem[] = [
  {
    bgColor: 'var(--bg-winner)',
    borderColor: 'var(--winner-green)',
    label: 'Platz 1+2 (weiter)'
  },
  {
    bgColor: 'var(--bg-loser)',
    borderColor: 'var(--loser-red)',
    label: 'Platz 3+4 (raus/LB)'
  }
]

export function BracketLegend() {
  return (
    <div className="legend">
      {/* Line Items - Bracket-Typen */}
      {lineItems.map((item) => (
        <div key={item.label} className="legend-item">
          <div
            className="legend-line"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </div>
      ))}

      {/* Color Items - Platzierungen */}
      {colorItems.map((item) => (
        <div key={item.label} className="legend-item">
          <div
            className="legend-color"
            style={{
              backgroundColor: item.bgColor,
              borderColor: item.borderColor
            }}
          />
          {item.label}
        </div>
      ))}

      {/* Special Item - 3-Pilot Heat */}
      <div className="legend-item">
        <span style={{ color: 'var(--neon-cyan)', fontWeight: '600' }}>3x</span>
        3-Pilot Heat
      </div>
    </div>
  )
}
