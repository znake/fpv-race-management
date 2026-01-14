/**
 * Story 13-5: PhaseIndicator Komponente
 * AC3: Visueller Indikator zeigt "WB R1 läuft" / "LB R1 wartet auf WB"
 * 
 * Farben:
 * - Quali: neon-cyan
 * - WB: winner-green (grün)
 * - LB: loser-red/orange
 * - Warten: steel (grau)
 * - Finale: gold
 */

import { useTournamentStore } from '../stores/tournamentStore'

type PhaseType = 'setup' | 'quali' | 'wb' | 'lb' | 'waiting' | 'finale' | 'completed'

function getPhaseType(description: string): PhaseType {
  if (description === 'Setup') return 'setup'
  if (description === 'Turnier beendet') return 'completed'
  if (description.includes('Quali')) return 'quali'
  if (description.includes('WB')) return 'wb'
  if (description.includes('wartet')) return 'waiting'
  if (description.includes('LB')) return 'lb'
  if (description.includes('Finale') || description.includes('Grand')) return 'finale'
  return 'setup'
}

function getPhaseStyles(phaseType: PhaseType): { bg: string; text: string; glow: string } {
  switch (phaseType) {
    case 'setup':
      return { bg: 'bg-steel/30', text: 'text-chrome', glow: '' }
    case 'quali':
      return { bg: 'bg-neon-cyan/20', text: 'text-neon-cyan', glow: 'shadow-glow-cyan' }
    case 'wb':
      return { bg: 'bg-green-500/20', text: 'text-green-400', glow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]' }
    case 'lb':
      return { bg: 'bg-orange-500/20', text: 'text-orange-400', glow: 'shadow-[0_0_10px_rgba(249,115,22,0.5)]' }
    case 'waiting':
      return { bg: 'bg-steel/30', text: 'text-steel', glow: '' }
    case 'finale':
      return { bg: 'bg-gold/20', text: 'text-gold', glow: 'shadow-glow-gold' }
    case 'completed':
      return { bg: 'bg-neon-pink/20', text: 'text-neon-pink', glow: 'shadow-glow-pink' }
    default:
      return { bg: 'bg-steel/30', text: 'text-chrome', glow: '' }
  }
}

interface PhaseIndicatorProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PhaseIndicator({ className = '', size = 'md' }: PhaseIndicatorProps) {
  const getCurrentPhaseDescription = useTournamentStore(state => state.getCurrentPhaseDescription)
  const description = getCurrentPhaseDescription()
  const phaseType = getPhaseType(description)
  const styles = getPhaseStyles(phaseType)

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full font-bold
        ${styles.bg} ${styles.text} ${styles.glow}
        ${sizeClasses[size]}
        ${className}
      `}
      data-testid="phase-indicator"
    >
      {/* Pulsierender Punkt für aktive Phasen */}
      {(phaseType === 'quali' || phaseType === 'wb' || phaseType === 'lb' || phaseType === 'finale') && (
        <span className={`w-2 h-2 rounded-full ${styles.text.replace('text-', 'bg-')} animate-pulse`} />
      )}
      
      {/* Wartend-Icon für wartende Phase */}
      {phaseType === 'waiting' && (
        <span className="text-steel">⏳</span>
      )}
      
      {/* Checkmark für completed */}
      {phaseType === 'completed' && (
        <span>🏆</span>
      )}
      
      <span>{description}</span>
    </div>
  )
}
