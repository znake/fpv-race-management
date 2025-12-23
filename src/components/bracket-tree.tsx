import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTournamentStore, type Heat, type TournamentPhase } from '../stores/tournamentStore'
import type { Pilot } from '../lib/schemas'
import { HeatDetailModal } from './heat-detail-modal'
import { ActiveHeatView } from './active-heat-view'
import { VictoryCeremony } from './victory-ceremony'
import { getRankBadgeClasses, FALLBACK_PILOT_IMAGE } from '../lib/utils'
import type { 
  BracketHeat as FullBracketHeat,
  BracketRound,
  FullBracketStructure,
  BracketType
} from '../lib/bracket-structure-generator'

interface BracketTreeProps {
  pilots: Pilot[]
  tournamentPhase: TournamentPhase
  activeHeat?: Heat
  nextHeat?: Heat
  onSubmitResults: (heatId: string, rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]) => void
  onHeatComplete?: () => void
  onNewTournament?: () => void
}

/**
 * Empty placeholder heat box for bracket visualization
 * Shows "Wartet..." with dashed border when no pilots assigned
 * Uses displayHeatNumber (from heats[] array) when provided, otherwise bracketHeat.heatNumber
 */
function EmptyBracketHeatBox({
  bracketHeat,
  bracketType,
  displayHeatNumber
}: {
  bracketHeat: FullBracketHeat
  bracketType: BracketType
  displayHeatNumber?: number
}) {
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

/**
 * Compact Heat Box for bracket visualization
 * Shows pilots with rankings when heat is active/completed
 */
function BracketHeatBox({ 
  heat,
  pilots, 
  bracketType,
  onClick,
  onEdit 
}: {
  heat: Heat
  pilots: Pilot[]
  bracketType: BracketType
  onClick?: () => void
  onEdit?: () => void
}) {
  const borderClass = {
    pending: 'border-steel border-dashed',
    active: 'border-neon-cyan shadow-glow-cyan',
    completed: 'border-winner-green shadow-glow-green'
  }[heat.status as string] || 'border-steel'
  
  const bgClass = bracketType === 'finale' 
    ? 'bg-void border-gold shadow-glow-gold' 
    : bracketType === 'winner'
    ? 'bg-night'
    : bracketType === 'loser'
    ? 'bg-night'
    : 'bg-night' // qualification
    
  return (
    <div 
      className={`
        ${bgClass} border-2 ${borderClass} rounded-xl p-3 
        min-w-[180px] cursor-pointer hover:scale-105 transition-transform
      `}
      onClick={onClick}
      data-testid={`bracket-heat-${heat.heatNumber}`}
    >
      {/* Header - Beamer-optimiert */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-beamer-body text-chrome">
          HEAT {heat.heatNumber}
        </span>
        {heat.status === 'completed' && onEdit && (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-steel hover:text-neon-cyan p-1"
          >
            ✏️
          </button>
        )}
      </div>
      
      {/* Pilots - Beamer-optimiert (min 40px Foto) */}
      <div className="space-y-2">
        {heat.pilotIds.map((pilotId: string) => {
          const pilot = pilots.find(p => p.id === pilotId)
          const ranking = heat.results?.rankings.find((r) => r.pilotId === pilotId)
          
          return (
            <div key={pilotId} className="flex items-center gap-2">
              <img 
                src={pilot?.imageUrl} 
                alt={pilot?.name}
                className="w-10 h-10 rounded-full object-cover border border-steel"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />
              <span className="font-ui text-beamer-caption text-chrome truncate flex-1">
                {pilot?.name}
              </span>
              {ranking && (
                <span className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-beamer-caption font-bold
                  ${getRankBadgeClasses(ranking.rank)}
                `}>
                  {ranking.rank}
                </span>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Pending State - Beamer-optimiert */}
      {heat.status === 'pending' && (
        <div className="text-center py-2 text-steel text-beamer-caption">
          Wartet...
        </div>
      )}
    </div>
  )
}

/**
 * Heats Section - horizontal row of initial qualification heats ONLY
 * Shows only the quali heats (not WB/LB heats)
 */
function HeatsSection({
  fullBracket,
  heats,
  pilots,
  onHeatClick
}: {
  fullBracket: FullBracketStructure
  heats: Heat[]
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
}) {
  if (!fullBracket.qualification.heats.length) return null
  
  // Get qualification heat IDs from bracket structure
  const qualiHeatIds = new Set(fullBracket.qualification.heats.map(h => h.id))
  
  // Filter to only show qualification heats from heats[] array
  const qualiHeats = heats.filter(h => qualiHeatIds.has(h.id))
  
  if (qualiHeats.length === 0) return null
  
  return (
    <section className="heats-section bg-void/50 border-2 border-neon-cyan/30 rounded-2xl p-6 mb-6">
      <h2 className="font-display text-beamer-heat text-neon-cyan mb-4">
        HEATS
      </h2>
      <p className="text-steel text-beamer-body mb-4">
        Platz 1+2 → Winner Bracket | Platz 3+4 → Loser Bracket
      </p>
      <div className="flex flex-wrap gap-4">
        {qualiHeats.map((heat) => (
          <BracketHeatBox
            key={heat.id}
            heat={heat}
            pilots={pilots}
            bracketType="qualification"
            onClick={() => onHeatClick(heat.id)}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Filled Bracket Heat Box - shows pilots with their names/images
 * Used when bracketHeat.pilotIds.length > 0
 * Uses displayHeatNumber (from heats[] array) when provided, otherwise bracketHeat.heatNumber
 */
function FilledBracketHeatBox({
  bracketHeat,
  pilots,
  bracketType,
  onClick,
  displayHeatNumber
}: {
  bracketHeat: FullBracketHeat
  pilots: Pilot[]
  bracketType: BracketType
  onClick?: () => void
  displayHeatNumber?: number
}) {
  const borderClass = {
    empty: 'border-steel border-dashed',
    pending: 'border-steel',
    active: 'border-neon-cyan shadow-glow-cyan',
    completed: 'border-winner-green shadow-glow-green'
  }[bracketHeat.status] || 'border-steel'
  
  const bgClass = bracketType === 'finale' 
    ? 'bg-void border-gold shadow-glow-gold' 
    : bracketType === 'winner'
    ? 'bg-night'
    : bracketType === 'loser'
    ? 'bg-night'
    : 'bg-night' // qualification
  
  // Use displayHeatNumber if provided (from actual heats[]), otherwise fall back to bracket structure number
  const heatNumber = displayHeatNumber ?? bracketHeat.heatNumber
    
  return (
    <div 
      className={`
        ${bgClass} border-2 ${borderClass} rounded-xl p-3 
        min-w-[180px] cursor-pointer hover:scale-105 transition-transform
      `}
      onClick={onClick}
      data-testid={`bracket-heat-${heatNumber}`}
    >
      {/* Header - Beamer-optimiert */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-beamer-body text-chrome">
          HEAT {heatNumber}
        </span>
      </div>
      
      {/* Pilots - Beamer-optimiert (min 40px Foto) */}
      <div className="space-y-2">
        {bracketHeat.pilotIds.map((pilotId: string) => {
          const pilot = pilots.find(p => p.id === pilotId)
          
          return (
            <div key={pilotId} className="flex items-center gap-2">
              <img 
                src={pilot?.imageUrl} 
                alt={pilot?.name}
                className="w-10 h-10 rounded-full object-cover border border-steel"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />
              <span className="font-ui text-beamer-caption text-chrome truncate flex-1">
                {pilot?.name}
              </span>
            </div>
          )
        })}
      </div>
      
      {/* Pending State - Beamer-optimiert */}
      {bracketHeat.status === 'pending' && (
        <div className="text-center py-1 text-steel text-beamer-caption mt-2">
          Wartet auf Start...
        </div>
      )}
    </div>
  )
}

/**
 * Bracket Round Column for Winner/Loser Bracket
 * Shows FilledBracketHeatBox when pilots are assigned, otherwise EmptyBracketHeatBox
 * Uses heat numbers from heats[] array when available for correct display
 */
function BracketRoundColumn({
  round,
  bracketType,
  pilots,
  heats
}: {
  round: BracketRound
  bracketType: 'winner' | 'loser'
  pilots: Pilot[]
  heats: Heat[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-beamer-body text-steel text-center mb-2">
        {round.roundName}
      </h3>
      {round.heats.map((bracketHeat) => {
        // Find the actual heat in heats[] to get correct heatNumber
        const actualHeat = heats.find(h => h.id === bracketHeat.id)
        const displayHeatNumber = actualHeat?.heatNumber ?? bracketHeat.heatNumber
        
        // Show filled box if pilots assigned, otherwise empty placeholder
        return bracketHeat.pilotIds.length > 0 ? (
          <FilledBracketHeatBox
            key={bracketHeat.id}
            bracketHeat={bracketHeat}
            pilots={pilots}
            bracketType={bracketType}
            displayHeatNumber={displayHeatNumber}
          />
        ) : (
          <EmptyBracketHeatBox
            key={bracketHeat.id}
            bracketHeat={bracketHeat}
            bracketType={bracketType}
            displayHeatNumber={displayHeatNumber}
          />
        )
      })}
    </div>
  )
}

/**
 * Winner Bracket Section - tree structure from left to right
 */
function WinnerBracketSection({
  fullBracket,
  pilots,
  heats
}: {
  fullBracket: FullBracketStructure
  pilots: Pilot[]
  heats: Heat[]
}) {
  if (!fullBracket.winnerBracket.rounds.length) return null
  
  return (
    <section className="winner-bracket-section bg-void/50 border-2 border-winner-green/30 rounded-2xl p-6 mb-6">
      <h2 className="font-display text-beamer-heat text-winner-green mb-4">
        WINNER BRACKET
      </h2>
      <div className="flex gap-8 overflow-x-auto pb-4 min-w-fit">
        {fullBracket.winnerBracket.rounds.map((round) => (
          <BracketRoundColumn
            key={round.id}
            round={round}
            bracketType="winner"
            pilots={pilots}
            heats={heats}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Grand Finale Section - centered between Winner and Loser
 * Shows either the Grand Finale heat (with pilots) or empty placeholder
 */
function GrandFinaleSection({
  fullBracket,
  pilots,
  heats
}: {
  fullBracket: FullBracketStructure
  pilots: Pilot[]
  heats: Heat[]
}) {
  if (!fullBracket.grandFinale) return null
  
  const bracketHeat = fullBracket.grandFinale
  
  // Find the actual heat in heats[] to get current status and results
  const actualHeat = heats.find(h => h.id === bracketHeat.id)
  
  // Show filled heat box if we have pilots assigned
  const hasPilots = bracketHeat.pilotIds.length > 0 || actualHeat?.pilotIds?.length
  
  return (
    <section 
      className="grand-finale-section bg-void border-4 border-gold rounded-2xl p-8 mb-6 shadow-glow-gold finale-glow"
      data-testid="grand-finale-section"
    >
      <h2 className="font-display text-beamer-display text-gold text-center mb-6">
        GRAND FINALE
      </h2>
      
      {hasPilots && actualHeat ? (
        <div className="flex justify-center overflow-x-auto">
          <GrandFinaleHeatBox
            heat={actualHeat}
            pilots={pilots}
          />
        </div>
      ) : (
        <div className="flex justify-center">
          <EmptyBracketHeatBox
            bracketHeat={bracketHeat}
            bracketType="finale"
          />
        </div>
      )}
    </section>
  )
}

/**
 * Grand Finale Heat Box - Special styling for the finale
 * Shows 2 pilots with "WB Champion" / "LB Champion" labels
 */
function GrandFinaleHeatBox({
  heat,
  pilots
}: {
  heat: Heat
  pilots: Pilot[]
}) {
  const borderClass = {
    pending: 'border-gold border-dashed',
    active: 'border-gold shadow-glow-gold animate-pulse',
    completed: 'border-winner-green shadow-glow-green'
  }[heat.status] || 'border-gold'
  
  return (
    <div 
      className={`
        bg-void/80 border-4 ${borderClass} rounded-2xl p-6 min-w-[300px]
        transition-all duration-300
      `}
      data-testid="grand-finale-heat"
    >
      {/* Pilots Grid - 2 columns for finale */}
      <div className="flex gap-8 justify-center">
        {heat.pilotIds.map((pilotId, index) => {
          const pilot = pilots.find(p => p.id === pilotId)
          const ranking = heat.results?.rankings.find(r => r.pilotId === pilotId)
          const championLabel = index === 0 ? 'WB Champion' : 'LB Champion'
          
          return (
            <div key={pilotId} className="flex flex-col items-center">
              {/* Champion Label - Beamer-optimiert */}
              <span className="text-gold text-beamer-caption font-ui mb-2 uppercase tracking-wider">
                {championLabel}
              </span>
              
              {/* Pilot Image */}
              <div className="relative">
                <img 
                  src={pilot?.imageUrl || FALLBACK_PILOT_IMAGE}
                  alt={pilot?.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gold"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                  }}
                />
                
                {/* Rank Badge (when completed) */}
                {ranking && (
                  <span className={`
                    absolute -top-2 -right-2 w-10 h-10 rounded-full 
                    flex items-center justify-center text-lg font-bold
                    rank-badge-animate
                    ${getRankBadgeClasses(ranking.rank)}
                  `}>
                    {ranking.rank}
                  </span>
                )}
              </div>
              
              {/* Pilot Name - Beamer-optimiert */}
              <span className="font-display text-beamer-name text-chrome mt-2">
                {pilot?.name}
              </span>
            </div>
          )
        })}
      </div>
      
      {/* Status Text - Beamer-optimiert */}
      {heat.status === 'pending' && (
        <p className="text-center text-steel text-beamer-body mt-4">
          Wartet auf Finalisten...
        </p>
      )}
      {heat.status === 'active' && (
        <p className="text-center text-gold text-beamer-body mt-4 animate-pulse">
          Finale läuft!
        </p>
      )}
    </div>
  )
}

/**
 * Dynamic LB Heats Section - shows dynamically generated LB heats
 * These are heats that exist in heats[] but are NOT in the bracket structure
 */
function DynamicLBHeatsSection({
  heats,
  fullBracket,
  pilots,
  onHeatClick
}: {
  heats: Heat[]
  fullBracket: FullBracketStructure
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
}) {
  // Get all LB heat IDs from bracket structure
  const bracketLBHeatIds = new Set<string>()
  for (const round of fullBracket.loserBracket.rounds) {
    for (const heat of round.heats) {
      bracketLBHeatIds.add(heat.id)
    }
  }

  // Filter heats that are dynamic LB heats:
  // - Not in bracket structure
  // - Have bracketType === 'loser' OR have ID starting with 'lb-heat-'
  const dynamicLBHeats = heats.filter(h =>
    !bracketLBHeatIds.has(h.id) &&
    (h.bracketType === 'loser' || h.id.startsWith('lb-heat-')) &&
    !h.isFinale // Exclude LB Finale
  )

  if (dynamicLBHeats.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-beamer-body text-loser-red text-center mb-2">
        Dynamische LB-Heats
      </h3>
      <div className="space-y-3">
        {dynamicLBHeats.map((heat) => (
          <BracketHeatBox
            key={heat.id}
            heat={heat}
            pilots={pilots}
            bracketType="loser"
            onClick={() => onHeatClick(heat.id)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Loser Pool Visualization Component (Story 9-2 AC6)
 * Shows pilots waiting in the pool for the next LB heat
 */
function LoserPoolVisualization({
  loserPool,
  pilots,
  hasActiveWBHeats
}: {
  loserPool: string[]
  pilots: Pilot[]
  hasActiveWBHeats: boolean
}) {
  const minPilotsNeeded = hasActiveWBHeats ? 4 : 3
  const poolSize = loserPool.length
  const isReady = poolSize >= minPilotsNeeded

  if (poolSize === 0) return null

  return (
    <div
      className={`
        bg-night border-2 rounded-xl p-4 min-w-[180px] max-w-[220px]
        ${isReady ? 'border-loser-red shadow-glow-red' : 'border-steel border-dashed'}
      `}
      data-testid="loser-pool-visualization"
    >
      <h3 className="font-display text-beamer-caption text-loser-red mb-2 text-center">
        LOSER POOL
      </h3>

      {/* Pool Pilots */}
      <div className="space-y-2 mb-3">
        {loserPool.slice(0, 6).map((pilotId) => {
          const pilot = pilots.find(p => p.id === pilotId)
          return (
            <div key={pilotId} className="flex items-center gap-2">
              <img
                src={pilot?.imageUrl || FALLBACK_PILOT_IMAGE}
                alt={pilot?.name}
                className="w-8 h-8 rounded-full object-cover border border-steel"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />
              <span className="font-ui text-xs text-chrome truncate">
                {pilot?.name}
              </span>
            </div>
          )
        })}
        {loserPool.length > 6 && (
          <div className="text-center text-steel text-xs">
            +{loserPool.length - 6} weitere
          </div>
        )}
      </div>

      {/* Status */}
      <div className={`
        text-center py-1 px-2 rounded text-xs font-ui
        ${isReady
          ? 'bg-loser-red/20 text-loser-red'
          : 'bg-steel/20 text-steel'}
      `}>
        {poolSize}/{minPilotsNeeded} Piloten
        {isReady ? ' → Heat bereit!' : ' → Warte...'}
      </div>
    </div>
  )
}

/**
 * Loser Bracket Section - tree structure from left to right
 * Includes Pool Visualization and Dynamic LB Heats (Story 9-2)
 */
function LoserBracketSection({
  fullBracket,
  pilots,
  heats,
  loserPool,
  hasActiveWBHeats,
  onHeatClick
}: {
  fullBracket: FullBracketStructure
  pilots: Pilot[]
  heats: Heat[]
  loserPool: string[]
  hasActiveWBHeats: boolean
  onHeatClick: (heatId: string) => void
}) {
  // Show section if there are LB rounds OR if there are pilots in the pool OR dynamic LB heats exist
  const hasDynamicLBHeats = heats.some(h =>
    (h.bracketType === 'loser' || h.id.startsWith('lb-heat-')) &&
    !h.isFinale
  )

  if (!fullBracket.loserBracket.rounds.length && loserPool.length === 0 && !hasDynamicLBHeats) return null

  return (
    <section className="loser-bracket-section bg-void/50 border-2 border-loser-red/30 rounded-2xl p-6">
      <h2 className="font-display text-beamer-heat text-loser-red mb-4">
        LOSER BRACKET
      </h2>
      <div className="flex gap-8 overflow-x-auto pb-4 min-w-fit">
        {/* Pool Visualization (Story 9-2 AC6) */}
        <div className="flex flex-col gap-4">
          <h3 className="font-display text-beamer-body text-steel text-center mb-2">
            Pool
          </h3>
          <LoserPoolVisualization
            loserPool={loserPool}
            pilots={pilots}
            hasActiveWBHeats={hasActiveWBHeats}
          />
        </div>

        {/* Dynamic LB Heats Section */}
        <DynamicLBHeatsSection
          heats={heats}
          fullBracket={fullBracket}
          pilots={pilots}
          onHeatClick={onHeatClick}
        />

        {/* LB Rounds */}
        {fullBracket.loserBracket.rounds.map((round) => (
          <BracketRoundColumn
            key={round.id}
            round={round}
            bracketType="loser"
            pilots={pilots}
            heats={heats}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Main BracketTree Component with integrated ActiveHeatView
 * 
 * Layout (TURNIER Tab):
 * 1. ACTIVE HEAT (top) - Current heat with rank input (when running)
 * 2. ON-DECK PREVIEW - Next heat preview (integrated in ActiveHeatView)
 * 3. HEATS - Horizontal row of initial heats
 * 4. WINNER BRACKET - Tree structure for quali winners
 * 5. LOSER BRACKET - Tree structure for quali losers
 * 6. GRAND FINALE (bottom) - Final heat
 */
export function BracketTree({ 
  pilots,
  tournamentPhase,
  activeHeat,
  nextHeat,
  onSubmitResults,
  onHeatComplete,
  onNewTournament
}: BracketTreeProps) {
  const heats = useTournamentStore(state => state.heats)
  const fullBracketStructure = useTournamentStore(state => state.fullBracketStructure)
  const getTop4Pilots = useTournamentStore(state => state.getTop4Pilots)
  const loserPool = useTournamentStore(state => state.loserPool)
  
  // Check if WB has pending/active heats locally (for pool visualization)
  const hasActiveWBHeats = useMemo(() => {
    if (!fullBracketStructure) return false
    for (const round of fullBracketStructure.winnerBracket.rounds) {
      for (const bracketHeat of round.heats) {
        const actualHeat = heats.find(h => h.id === bracketHeat.id)
        if (actualHeat) {
          if (actualHeat.status === 'pending' || actualHeat.status === 'active') {
            return true
          }
        } else if (bracketHeat.pilotIds.length > 0 && bracketHeat.status !== 'completed') {
          return true
        }
      }
    }
    return false
  }, [fullBracketStructure, heats])
  
  // Ref for auto-scroll to active heat
  const activeHeatRef = useRef<HTMLDivElement>(null)
  
  // Modal state
  const [selectedHeat, setSelectedHeat] = useState<string | null>(null)
  
  // Auto-scroll to active heat after heat completion
  const scrollToActiveHeat = useCallback(() => {
    activeHeatRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }, [])
  
  // Handle heat completion: scroll to active heat
  const handleHeatCompleteInternal = useCallback(() => {
    // Small delay to allow state update before scrolling
    setTimeout(() => {
      scrollToActiveHeat()
    }, 100)
    onHeatComplete?.()
  }, [scrollToActiveHeat, onHeatComplete])
  
  // Scroll to active heat when it changes
  useEffect(() => {
    if (activeHeat && tournamentPhase === 'running') {
      scrollToActiveHeat()
    }
  }, [activeHeat?.id, tournamentPhase, scrollToActiveHeat])
  
  const handleHeatClick = (heatId: string) => {
    setSelectedHeat(heatId)
  }
  
  const handleCloseModal = () => {
    setSelectedHeat(null)
  }
  
  const handleEditHeat = (heatId: string) => {
    setSelectedHeat(null)
    console.log('Edit heat:', heatId)
  }
  
  const selectedHeatData = heats.find(h => h.id === selectedHeat)

  // Empty state: No pilots - Beamer-optimiert
  if (pilots.length === 0) {
    return (
      <div className="bg-night border-3 border-steel rounded-2xl p-8 text-center">
        <p className="font-ui text-beamer-body text-steel">Keine Piloten für Bracket verfügbar</p>
      </div>
    )
  }

  // Empty state: No heats generated yet - Beamer-optimiert
  if (heats.length === 0) {
    return (
      <div className="bg-night border-3 border-steel rounded-2xl p-8 text-center">
        <p className="font-ui text-beamer-body text-steel">Noch keine Heats generiert</p>
        <p className="font-ui text-steel/60 text-beamer-caption mt-2">
          Starte ein Turnier um das Bracket zu sehen
        </p>
      </div>
    )
  }

  // No full bracket structure yet (legacy state) - Beamer-optimiert
  if (!fullBracketStructure) {
    return (
      <div className="bg-night border-3 border-steel rounded-2xl p-8 text-center">
        <p className="font-ui text-beamer-body text-steel">Bracket-Struktur wird generiert...</p>
      </div>
    )
  }

  // Get Top 4 for Victory Ceremony
  const top4 = tournamentPhase === 'completed' ? getTop4Pilots() : null

  // Tournament Completed State - Show Victory Ceremony
  if (tournamentPhase === 'completed' && top4 && onNewTournament) {
    return (
      <div className="bracket-container relative overflow-x-auto min-h-[600px]">
        {/* Victory Ceremony */}
        <VictoryCeremony 
          top4={top4} 
          onNewTournament={onNewTournament}
        />
        
        {/* Still show bracket below for reference - Beamer-optimiert */}
        <div className="mt-8 opacity-75">
          <h3 className="font-display text-beamer-name text-steel text-center mb-4">
            Turnierverlauf
          </h3>
          
          {/* 2. HEATS Section (formerly QUALIFIKATION) */}
          <HeatsSection
            fullBracket={fullBracketStructure}
            heats={heats}
            pilots={pilots}
            onHeatClick={handleHeatClick}
          />
          
          {/* 3. WINNER BRACKET Section */}
          <WinnerBracketSection
            fullBracket={fullBracketStructure}
            pilots={pilots}
            heats={heats}
          />
          
          {/* 4. LOSER BRACKET Section */}
          <LoserBracketSection
            fullBracket={fullBracketStructure}
            pilots={pilots}
            heats={heats}
            loserPool={loserPool}
            hasActiveWBHeats={hasActiveWBHeats}
            onHeatClick={handleHeatClick}
          />
          
          {/* 5. GRAND FINALE Section */}
          <GrandFinaleSection
            fullBracket={fullBracketStructure}
            pilots={pilots}
            heats={heats}
          />
        </div>
        
        {/* Heat Detail Modal */}
        {selectedHeatData && (
          <HeatDetailModal
            heat={selectedHeatData}
            pilots={pilots}
            isOpen={!!selectedHeat}
            onClose={handleCloseModal}
            onEdit={() => handleEditHeat(selectedHeatData.id)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="bracket-container bracket-beamer-container relative overflow-x-auto min-h-[600px]">
      {/* 1. ACTIVE HEAT Section - when tournament is running OR in finale phase */}
      {(tournamentPhase === 'running' || tournamentPhase === 'finale') && activeHeat && (
        <div ref={activeHeatRef} className="mb-8">
          <ActiveHeatView
            heat={activeHeat}
            nextHeat={nextHeat}
            pilots={pilots}
            onSubmitResults={onSubmitResults}
            onHeatComplete={handleHeatCompleteInternal}
          />
        </div>
      )}
      
      {/* 2. HEATS Section - Beamer-optimiert Container */}
      <div className="bracket-beamer-container mb-6">
        <HeatsSection
          fullBracket={fullBracketStructure}
          heats={heats}
          pilots={pilots}
          onHeatClick={handleHeatClick}
        />
      </div>
      
      {/* 3. WINNER BRACKET Section */}
      <WinnerBracketSection
        fullBracket={fullBracketStructure}
        pilots={pilots}
        heats={heats}
      />
      
      {/* 4. LOSER BRACKET Section */}
      <LoserBracketSection
        fullBracket={fullBracketStructure}
        pilots={pilots}
        heats={heats}
        loserPool={loserPool}
        hasActiveWBHeats={hasActiveWBHeats}
        onHeatClick={handleHeatClick}
      />
      
      {/* 5. GRAND FINALE Section - at the very bottom */}
      <GrandFinaleSection
        fullBracket={fullBracketStructure}
        pilots={pilots}
        heats={heats}
      />
      
      {/* Heat Detail Modal */}
      {selectedHeatData && (
        <HeatDetailModal
          heat={selectedHeatData}
          pilots={pilots}
          isOpen={!!selectedHeat}
          onClose={handleCloseModal}
          onEdit={() => handleEditHeat(selectedHeatData.id)}
        />
      )}
    </div>
  )
}
