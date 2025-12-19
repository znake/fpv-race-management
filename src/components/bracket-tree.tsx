import { useState } from 'react'
import { useTournamentStore, type Heat } from '../stores/tournamentStore'
import type { Pilot } from '../lib/schemas'
import { HeatDetailModal } from './heat-detail-modal'
import { getRankBadgeClasses, FALLBACK_PILOT_IMAGE } from '../lib/utils'
import type { 
  BracketHeat as FullBracketHeat,
  BracketRound,
  FullBracketStructure,
  BracketType
} from '../lib/bracket-structure-generator'

interface BracketTreeProps {
  pilots: Pilot[]
}

/**
 * Empty placeholder heat box for bracket visualization
 * Shows "Wartet..." with dashed border when no pilots assigned
 */
function EmptyBracketHeatBox({
  bracketHeat,
  bracketType
}: {
  bracketHeat: FullBracketHeat
  bracketType: BracketType
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
    
  return (
    <div 
      className={`
        ${bgClass} border-2 border-dashed ${borderClass} rounded-xl p-3 
        min-w-[180px] min-h-[120px] flex flex-col justify-center items-center
        cursor-default opacity-60
      `}
    >
      <span className="font-display text-sm text-steel mb-2">
        HEAT {bracketHeat.heatNumber}
      </span>
      <span className="text-xs text-steel/60">
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
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-sm text-chrome">
          HEAT {heat.heatNumber}
        </span>
        {heat.status === 'completed' && onEdit && (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-steel hover:text-neon-cyan"
          >
            ✏️
          </button>
        )}
      </div>
      
      {/* Pilots */}
      <div className="space-y-1">
        {heat.pilotIds.map((pilotId: string) => {
          const pilot = pilots.find(p => p.id === pilotId)
          const ranking = heat.results?.rankings.find((r) => r.pilotId === pilotId)
          
          return (
            <div key={pilotId} className="flex items-center gap-2">
              <img 
                src={pilot?.imageUrl} 
                alt={pilot?.name}
                className="w-8 h-8 rounded-full object-cover border border-steel"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />
              <span className="font-ui text-xs text-chrome truncate flex-1">
                {pilot?.name}
              </span>
              {ranking && (
                <span className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                  ${getRankBadgeClasses(ranking.rank)}
                `}>
                  {ranking.rank}
                </span>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Pending State */}
      {heat.status === 'pending' && (
        <div className="text-center py-2 text-steel text-xs">
          Wartet...
        </div>
      )}
    </div>
  )
}

/**
 * Qualification Section - horizontal row of initial heats
 */
function QualificationSection({
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
  
  return (
    <section className="qualification-section bg-void/50 border-2 border-neon-cyan/30 rounded-2xl p-6 mb-6">
      <h2 className="font-display text-2xl text-neon-cyan mb-4">
        QUALIFIKATION
      </h2>
      <p className="text-steel text-sm mb-4">
        Platz 1+2 → Winner Bracket | Platz 3+4 → Loser Bracket
      </p>
      <div className="flex flex-wrap gap-4">
        {heats.map((heat) => (
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
 */
function FilledBracketHeatBox({
  bracketHeat,
  pilots,
  bracketType,
  onClick
}: {
  bracketHeat: FullBracketHeat
  pilots: Pilot[]
  bracketType: BracketType
  onClick?: () => void
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
    
  return (
    <div 
      className={`
        ${bgClass} border-2 ${borderClass} rounded-xl p-3 
        min-w-[180px] cursor-pointer hover:scale-105 transition-transform
      `}
      onClick={onClick}
      data-testid={`bracket-heat-${bracketHeat.heatNumber}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-sm text-chrome">
          HEAT {bracketHeat.heatNumber}
        </span>
      </div>
      
      {/* Pilots */}
      <div className="space-y-1">
        {bracketHeat.pilotIds.map((pilotId: string) => {
          const pilot = pilots.find(p => p.id === pilotId)
          
          return (
            <div key={pilotId} className="flex items-center gap-2">
              <img 
                src={pilot?.imageUrl} 
                alt={pilot?.name}
                className="w-8 h-8 rounded-full object-cover border border-steel"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />
              <span className="font-ui text-xs text-chrome truncate flex-1">
                {pilot?.name}
              </span>
            </div>
          )
        })}
      </div>
      
      {/* Pending State */}
      {bracketHeat.status === 'pending' && (
        <div className="text-center py-1 text-steel text-xs mt-2">
          Wartet auf Start...
        </div>
      )}
    </div>
  )
}

/**
 * Bracket Round Column for Winner/Loser Bracket
 * Shows FilledBracketHeatBox when pilots are assigned, otherwise EmptyBracketHeatBox
 */
function BracketRoundColumn({
  round,
  bracketType,
  pilots
}: {
  round: BracketRound
  bracketType: 'winner' | 'loser'
  pilots: Pilot[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-sm text-steel text-center mb-2">
        {round.roundName}
      </h3>
      {round.heats.map((bracketHeat) => (
        // Show filled box if pilots assigned, otherwise empty placeholder
        bracketHeat.pilotIds.length > 0 ? (
          <FilledBracketHeatBox
            key={bracketHeat.id}
            bracketHeat={bracketHeat}
            pilots={pilots}
            bracketType={bracketType}
          />
        ) : (
          <EmptyBracketHeatBox
            key={bracketHeat.id}
            bracketHeat={bracketHeat}
            bracketType={bracketType}
          />
        )
      ))}
    </div>
  )
}

/**
 * Winner Bracket Section - tree structure from left to right
 */
function WinnerBracketSection({
  fullBracket,
  pilots
}: {
  fullBracket: FullBracketStructure
  pilots: Pilot[]
}) {
  if (!fullBracket.winnerBracket.rounds.length) return null
  
  return (
    <section className="winner-bracket-section bg-void/50 border-2 border-winner-green/30 rounded-2xl p-6 mb-6">
      <h2 className="font-display text-2xl text-winner-green mb-4">
        WINNER BRACKET
      </h2>
      <div className="flex gap-8 overflow-x-auto pb-4">
        {fullBracket.winnerBracket.rounds.map((round) => (
          <BracketRoundColumn
            key={round.id}
            round={round}
            bracketType="winner"
            pilots={pilots}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Grand Finale Section - centered between Winner and Loser
 */
function GrandFinaleSection({
  fullBracket
}: {
  fullBracket: FullBracketStructure
}) {
  if (!fullBracket.grandFinale) return null
  
  const bracketHeat = fullBracket.grandFinale
  
  return (
    <section className="grand-finale-section bg-void border-4 border-gold rounded-2xl p-8 mb-6 shadow-glow-gold">
      <h2 className="font-display text-3xl text-gold text-center mb-6">
        GRAND FINALE
      </h2>
      <div className="flex justify-center">
        <EmptyBracketHeatBox
          bracketHeat={bracketHeat}
          bracketType="finale"
        />
      </div>
    </section>
  )
}

/**
 * Loser Bracket Section - tree structure from left to right
 */
function LoserBracketSection({
  fullBracket,
  pilots
}: {
  fullBracket: FullBracketStructure
  pilots: Pilot[]
}) {
  if (!fullBracket.loserBracket.rounds.length) return null
  
  return (
    <section className="loser-bracket-section bg-void/50 border-2 border-loser-red/30 rounded-2xl p-6">
      <h2 className="font-display text-2xl text-loser-red mb-4">
        LOSER BRACKET
      </h2>
      <div className="flex gap-8 overflow-x-auto pb-4">
        {fullBracket.loserBracket.rounds.map((round) => (
          <BracketRoundColumn
            key={round.id}
            round={round}
            bracketType="loser"
            pilots={pilots}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Main BracketTree Component with 3-Section Layout
 * 
 * Layout:
 * 1. QUALIFICATION (top) - Horizontal row of initial heats
 * 2. WINNER BRACKET (middle) - Tree structure for quali winners
 * 3. GRAND FINALE (center) - Between Winner and Loser
 * 4. LOSER BRACKET (bottom) - Tree structure for quali losers
 */
export function BracketTree({ 
  pilots 
}: BracketTreeProps) {
  const heats = useTournamentStore(state => state.heats)
  const fullBracketStructure = useTournamentStore(state => state.fullBracketStructure)
  
  // Modal state
  const [selectedHeat, setSelectedHeat] = useState<string | null>(null)
  
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

  // Empty state: No pilots
  if (pilots.length === 0) {
    return (
      <div className="bg-night border-3 border-steel rounded-2xl p-8 text-center">
        <p className="font-ui text-steel">Keine Piloten für Bracket verfügbar</p>
      </div>
    )
  }

  // Empty state: No heats generated yet
  if (heats.length === 0) {
    return (
      <div className="bg-night border-3 border-steel rounded-2xl p-8 text-center">
        <p className="font-ui text-steel">Noch keine Heats generiert</p>
        <p className="font-ui text-steel/60 text-sm mt-2">
          Starte ein Turnier um das Bracket zu sehen
        </p>
      </div>
    )
  }

  // No full bracket structure yet (legacy state)
  if (!fullBracketStructure) {
    return (
      <div className="bg-night border-3 border-steel rounded-2xl p-8 text-center">
        <p className="font-ui text-steel">Bracket-Struktur wird generiert...</p>
      </div>
    )
  }

  return (
    <div className="bracket-container relative overflow-x-auto min-h-[600px]">
      {/* 1. QUALIFICATION Section */}
      <QualificationSection
        fullBracket={fullBracketStructure}
        heats={heats}
        pilots={pilots}
        onHeatClick={handleHeatClick}
      />
      
      {/* 2. WINNER BRACKET Section */}
      <WinnerBracketSection
        fullBracket={fullBracketStructure}
        pilots={pilots}
      />
      
      {/* 3. GRAND FINALE Section */}
      <GrandFinaleSection
        fullBracket={fullBracketStructure}
      />
      
      {/* 4. LOSER BRACKET Section */}
      <LoserBracketSection
        fullBracket={fullBracketStructure}
        pilots={pilots}
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
