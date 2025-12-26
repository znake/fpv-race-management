/**
 * Victory Ceremony Component
 * 
 * Displays the final podium with Top 4 placements after tournament completion.
 * Features:
 * - Podium layout with size gradients (180px → 100px)
 * - Gold/Silver/Bronze/Cyan styling
 * - Animated glow effects
 * - "Neues Turnier" button
 * 
 * Story 5-1: Finale & Siegerehrung
 */

import type { Pilot } from '../lib/schemas'
import { FALLBACK_PILOT_IMAGE } from '../lib/ui-helpers'

interface Top4Pilots {
  place1: Pilot | undefined
  place2: Pilot | undefined
  place3: Pilot | undefined
  place4: Pilot | undefined
}

interface VictoryCeremonyProps {
  top4: Top4Pilots
  onNewTournament: () => void
}

/**
 * Podium Place Card with size and color based on rank
 */
function PodiumCard({ 
  pilot, 
  place 
}: { 
  pilot: Pilot | undefined
  place: 1 | 2 | 3 | 4 
}) {
  const sizeConfig = {
    1: { imageSize: 'w-44 h-44', cardPadding: 'p-6', fontSize: 'text-2xl' },
    2: { imageSize: 'w-36 h-36', cardPadding: 'p-5', fontSize: 'text-xl' },
    3: { imageSize: 'w-28 h-28', cardPadding: 'p-4', fontSize: 'text-lg' },
    4: { imageSize: 'w-24 h-24', cardPadding: 'p-3', fontSize: 'text-base' },
  }[place]

  const colorConfig = {
    1: {
      border: 'border-gold',
      bg: 'bg-gold/20',
      glow: 'shadow-glow-gold animate-pulse',
      badge: 'bg-gold text-void',
      label: 'CHAMPION'
    },
    2: {
      border: 'border-gray-300',
      bg: 'bg-gray-400/20',
      glow: 'shadow-glow-silver',
      badge: 'bg-gray-300 text-void',
      label: '2. PLATZ'
    },
    3: {
      border: 'border-amber-600',
      bg: 'bg-amber-700/20',
      glow: 'shadow-glow-bronze',
      badge: 'bg-amber-600 text-void',
      label: '3. PLATZ'
    },
    4: {
      border: 'border-neon-cyan',
      bg: 'bg-neon-cyan/20',
      glow: 'shadow-glow-cyan',
      badge: 'bg-neon-cyan text-void',
      label: '4. PLATZ'
    },
  }[place]

  if (!pilot) {
    return (
      <div className={`
        ${colorConfig.bg} border-4 border-dashed ${colorConfig.border}/30 
        rounded-2xl ${sizeConfig.cardPadding} opacity-50
        flex flex-col items-center justify-center
      `}>
        <span className="text-steel font-ui">Kein Pilot</span>
      </div>
    )
  }

  return (
    <div 
      className={`
        ${colorConfig.bg} border-4 ${colorConfig.border} rounded-2xl 
        ${sizeConfig.cardPadding} ${colorConfig.glow}
        flex flex-col items-center transition-transform hover:scale-105
      `}
      data-testid={`podium-place-${place}`}
    >
      {/* Placement Badge */}
      <div className={`
        ${colorConfig.badge} px-3 py-1 rounded-full font-display text-sm mb-3
      `}>
        {colorConfig.label}
      </div>
      
      {/* Pilot Image */}
      <img 
        src={pilot.imageUrl || FALLBACK_PILOT_IMAGE}
        alt={pilot.name}
        className={`${sizeConfig.imageSize} rounded-full object-cover border-4 ${colorConfig.border} mb-3`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
        }}
      />
      
      {/* Pilot Name */}
      <span className={`font-display ${sizeConfig.fontSize} text-chrome text-center`}>
        {pilot.name}
      </span>
      
      {/* Instagram Handle */}
      {pilot.instagramHandle && (
        <span className="text-steel text-sm mt-1">
          @{pilot.instagramHandle}
        </span>
      )}
    </div>
  )
}

/**
 * Main Victory Ceremony Component
 * 
 * Layout:
 *        [1. PLATZ]      (center, top, largest)
 *   [2. PLATZ]  [3. PLATZ]  (left, right)
 *        [4. PLATZ]      (center, bottom, smallest)
 */
export function VictoryCeremony({ top4, onNewTournament }: VictoryCeremonyProps) {
  return (
    <section 
      className="victory-ceremony bg-void border-4 border-gold rounded-3xl p-8 shadow-glow-gold"
      data-testid="victory-ceremony"
    >
      {/* Header */}
      <h2 className="font-display text-4xl text-gold text-center mb-8 tracking-wider">
        SIEGEREHRUNG
      </h2>
      
      {/* Podium Layout */}
      <div className="podium-grid flex flex-col items-center gap-6">
        {/* First Place - Top Center */}
        <div className="first-place">
          <PodiumCard pilot={top4.place1} place={1} />
        </div>
        
        {/* Second and Third Place - Side by Side */}
        <div className="second-third-place flex gap-8 justify-center">
          <PodiumCard pilot={top4.place2} place={2} />
          <PodiumCard pilot={top4.place3} place={3} />
        </div>
        
        {/* Fourth Place - Bottom Center */}
        <div className="fourth-place">
          <PodiumCard pilot={top4.place4} place={4} />
        </div>
      </div>
      
      {/* New Tournament Button */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={onNewTournament}
          className="btn-primary bg-neon-pink text-void font-ui text-lg px-8 py-4 rounded-xl hover:scale-105 transition-transform"
          data-testid="new-tournament-button"
        >
          Neues Turnier starten
        </button>
      </div>
    </section>
  )
}
