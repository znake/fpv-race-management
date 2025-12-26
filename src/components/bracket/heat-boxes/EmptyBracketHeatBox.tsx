import type { EmptyBracketHeatBoxProps } from '../types'

/**
 * Empty placeholder heat box for bracket visualization
 * Shows "Wartet..." with dashed border when no pilots assigned
 * Uses displayHeatNumber (from heats[] array) when provided, otherwise bracketHeat.heatNumber
 */
export function EmptyBracketHeatBox({
  bracketHeat,
  bracketType,
  displayHeatNumber
}: EmptyBracketHeatBoxProps) {
  const bgClass = bracketType === 'finale'
    ? 'bg-void/50'
    : bracketType === 'winner'
    ? 'bg-winner-green/5'
    : bracketType === 'loser'
    ? 'bg-loser-red/5'
    : 'bg-neon-cyan/5'

  const borderClass = bracketType === 'finale'
    ? 'border-gold/30'
    : bracketType === 'winner'
    ? 'border-winner-green/20'
    : bracketType === 'loser'
    ? 'border-loser-red/20'
    : 'border-neon-cyan/20'

  // Use displayHeatNumber if provided (from actual heats[]), otherwise fall back to bracket structure number
  const heatNumber = displayHeatNumber ?? bracketHeat.heatNumber

  return (
    <div
      className={`
        ${bgClass} border-2 border-dashed ${borderClass} rounded-xl p-3
        min-w-[180px] min-h-[120px] flex flex-col justify-center items-center
        cursor-default opacity-60
      `}
    >
      <span className="font-display text-beamer-body text-steel mb-2">
        HEAT {heatNumber}
      </span>
      <span className="text-beamer-caption text-steel/60">
        Wartet...
      </span>
    </div>
  )
}
