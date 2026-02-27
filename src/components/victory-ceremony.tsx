/**
 * Victory Ceremony Component
 * 
 * Displays the final podium with Top 4 placements after tournament completion.
 * Features:
 * - Podium layout with size gradients (180px → 100px)
 * - Gold/Silver/Bronze/Cyan styling
 * - Animated glow effects
 * - Confetti celebration effect
 * - "Neues Turnier" button
 * 
 * Story 5-1: Finale & Siegerehrung
 */

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import type { Pilot, Top4Pilots } from '@/types'
import { FALLBACK_PILOT_IMAGE } from '@/lib/ui-helpers'
import { useIsMobile } from '@/hooks/useIsMobile'

interface VictoryCeremonyProps {
  top4: Top4Pilots
  onNewTournament: () => void
  onExportCSV?: () => void
}

/**
 * Podium Place Card with size and color based on rank
 */
function PodiumCard({ 
  pilot, 
  place,
  isMobile
}: { 
  pilot: Pilot | undefined
  place: 1 | 2 | 3 | 4
  isMobile: boolean
}) {
  // Responsive sizes: smaller on mobile
  const sizeConfig = isMobile ? {
    1: { imageSize: 'w-24 h-24', cardPadding: 'p-3', fontSize: 'text-base' },
    2: { imageSize: 'w-20 h-20', cardPadding: 'p-2', fontSize: 'text-sm' },
    3: { imageSize: 'w-16 h-16', cardPadding: 'p-2', fontSize: 'text-sm' },
    4: { imageSize: 'w-14 h-14', cardPadding: 'p-2', fontSize: 'text-xs' },
  }[place] : {
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
      border: 'border-rank-4',
      bg: 'bg-rank-4/20',
      glow: 'shadow-glow-rank-4',
      badge: 'bg-rank-4 text-void',
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
          {pilot.instagramHandle}
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
export function VictoryCeremony({ top4, onNewTournament, onExportCSV }: VictoryCeremonyProps) {
  const isMobile = useIsMobile()
  const hasTriggeredConfetti = useRef(false)
  
  useEffect(() => {
    if (hasTriggeredConfetti.current) return
    hasTriggeredConfetti.current = true
    
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#00CED1', '#FF69B4', '#9B59B6']
    const duration = 6000
    const end = Date.now() + duration

    // Initial big burst from center
    confetti({
      particleCount: 150,
      spread: 360,
      origin: { x: 0.5, y: 0.4 },
      colors,
      startVelocity: 45,
      gravity: 0.8,
      ticks: 300,
      scalar: 1.2,
    })
    
    // Continuous stream from multiple origins across the screen
    const frame = () => {
      // Left side
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.5 },
        colors,
        startVelocity: 35,
        gravity: 0.7,
        ticks: 250,
      })
      // Right side
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.5 },
        colors,
        startVelocity: 35,
        gravity: 0.7,
        ticks: 250,
      })
      // Top center rain
      confetti({
        particleCount: 3,
        angle: 270,
        spread: 160,
        origin: { x: 0.5, y: -0.1 },
        colors,
        startVelocity: 20,
        gravity: 1.2,
        ticks: 200,
      })
      // Random bursts across screen
      if (Math.random() < 0.3) {
        confetti({
          particleCount: 30,
          spread: 100,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
          colors,
          startVelocity: 25,
          gravity: 0.9,
          ticks: 200,
          scalar: 1.1,
        })
      }
      
      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    
    frame()
  }, [])
  
  return (
    <section 
      className={`victory-ceremony bg-void border-4 border-gold rounded-3xl shadow-glow-gold ${isMobile ? 'p-4' : 'p-8'}`}
      data-testid="victory-ceremony"
    >
      {/* Header */}
      <h2 className={`font-display text-gold text-center tracking-wider ${isMobile ? 'text-2xl mb-4' : 'text-4xl mb-6'}`}>
        SIEGEREHRUNG
      </h2>
      
      {/* Action Buttons */}
      <div className={`flex justify-center ${isMobile ? 'mb-4 gap-2 flex-col items-center' : 'mb-8 gap-4'}`}>
        {onExportCSV && (
          <button
            onClick={onExportCSV}
            className={`bg-neon-cyan text-void font-ui rounded-xl hover:scale-105 transition-transform ${isMobile ? 'text-sm px-4 py-2' : 'text-lg px-8 py-4'}`}
            data-testid="export-csv-button"
          >
            Export CSV
          </button>
        )}
        <button
          onClick={onNewTournament}
          className={`btn-primary bg-neon-pink text-void font-ui rounded-xl hover:scale-105 transition-transform ${isMobile ? 'text-sm px-4 py-2' : 'text-lg px-8 py-4'}`}
          data-testid="new-tournament-button"
        >
          Neues Turnier starten
        </button>
      </div>
      
      {/* Podium Layout */}
      <div className={`podium-grid flex flex-col items-center ${isMobile ? 'gap-3' : 'gap-6'}`}>
        {/* First Place - Top Center */}
        <div className="first-place">
          <PodiumCard pilot={top4.place1} place={1} isMobile={isMobile} />
        </div>
        
        {/* Second and Third Place - Side by Side */}
        <div className={`second-third-place flex justify-center ${isMobile ? 'gap-3' : 'gap-8'}`}>
          <PodiumCard pilot={top4.place2} place={2} isMobile={isMobile} />
          <PodiumCard pilot={top4.place3} place={3} isMobile={isMobile} />
        </div>
        
        {/* Fourth Place - Bottom Center */}
        <div className="fourth-place">
          <PodiumCard pilot={top4.place4} place={4} isMobile={isMobile} />
        </div>
      </div>
    </section>
  )
}
