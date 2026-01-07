import { useState, useRef, useEffect, useCallback } from 'react'
import { useTournamentStore } from '../../stores/tournamentStore'
import type { Pilot, Heat, TournamentPhase } from '../../types'
import { HeatDetailModal } from '../heat-detail-modal'
import { ActiveHeatView } from '../active-heat-view'
import { VictoryCeremony } from '../victory-ceremony'

// Import heat box components
import { BracketHeatBox } from './heat-boxes/BracketHeatBox'
import { GrandFinaleHeatBox } from './sections/GrandFinaleHeatBox'
import { PoolDisplay } from './PoolDisplay'
import { SVGConnectorLines } from './SVGConnectorLines'
import { BracketLegend } from './BracketLegend'

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
 * Story 11-1: Unified Layout Container
 * 
 * Layout nach Mockup (horizontal):
 * Spalte 1: Pools (WB Pool oben, LB Pool unten)
 * Spalte 2: Runde 1 Heats (WB Heats oben, LB Heats unten)
 * Spalte 3: Connector Space (Platzhalter für SVG-Linien)
 * Spalte 4: Finals (WB Finale oben, LB Finale unten)
 * Spalte 5: Connector Space (Platzhalter für SVG-Linien)
 * Spalte 6: Grand Finale (vertikal zentriert)
 * 
 * AC1: Keine getrennten Sections/Borders mehr
 * AC2: Horizontales Spalten-Layout
 * AC3: WB oben, LB unten mit Spacer dazwischen
 * AC4: Horizontales Scrolling bei Bedarf
 * AC5: Beamer-lesbare Mindestgrößen (Heat-Boxen 200px, Text 12px+, Container 600px)
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
  const grandFinalePool = useTournamentStore(state => state.grandFinalePool)
  const winnerPilots = useTournamentStore(state => state.winnerPilots)
  
  // Story 13-6: winnerPool wird dynamisch berechnet statt persistiert
  // Verfügbare WB-Piloten = winnerPilots MINUS Piloten in pending/active WB-Heats
  const pilotsInPendingWBHeats = new Set(
    heats
      .filter(h => h.bracketType === 'winner' && (h.status === 'pending' || h.status === 'active'))
      .flatMap(h => h.pilotIds)
  )
  const winnerPool = winnerPilots.filter(p => !pilotsInPendingWBHeats.has(p))

  // Story 10-2: Check if WB has pending/active heats using Store method
  // Note: hasActiveWBHeats wird in späteren Stories (z.B. für LB-Steuerung) verwendet
  void useTournamentStore(state => state.hasActiveWBHeats())

  // Ref for auto-scroll to active heat
  const activeHeatRef = useRef<HTMLDivElement>(null)
  
  // Story 11-2: Refs for SVG connector lines
  const bracketContainerRef = useRef<HTMLDivElement>(null)
  const heatRefsMap = useRef<Map<string, HTMLDivElement | null>>(new Map())
  
  // Callback to register heat refs
  const registerHeatRef = useCallback((heatId: string, element: HTMLDivElement | null) => {
    if (element) {
      heatRefsMap.current.set(heatId, element)
    } else {
      heatRefsMap.current.delete(heatId)
    }
  }, [])

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
      <div className="bracket-container bg-night rounded-2xl p-8 text-center min-h-[600px] overflow-x-auto">
        <p className="font-ui text-beamer-body text-steel">Keine Piloten für Bracket verfügbar</p>
      </div>
    )
  }

  // Empty state: No heats generated yet - Beamer-optimiert
  if (heats.length === 0) {
    return (
      <div className="bracket-container bg-night rounded-2xl p-8 text-center min-h-[600px] overflow-x-auto">
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
      <div className="bracket-container bg-night rounded-2xl p-8 text-center min-h-[600px] overflow-x-auto">
        <p className="font-ui text-beamer-body text-steel">Bracket-Struktur wird generiert...</p>
      </div>
    )
  }

  // Get Top 4 for Victory Ceremony
  const top4 = tournamentPhase === 'completed' ? getTop4Pilots() : null

  // Helper: Get heats for different brackets
  const getQualiHeats = () => {
    const qualiHeatIds = new Set(fullBracketStructure.qualification.heats.map(h => h.id))
    return heats.filter(h => qualiHeatIds.has(h.id))
  }

  const getWBHeats = () => {
    // Get WB heats from rounds + dynamic WB heats
    const wbFromRounds = fullBracketStructure.winnerBracket.rounds.flatMap(r => r.heats)
    const wbHeatIds = new Set(wbFromRounds.map(h => h.id))
    
    // Also get dynamically generated WB heats not in structure
    const dynamicWBHeats = heats.filter(h => 
      h.bracketType === 'winner' && 
      !wbHeatIds.has(h.id)
    )
    
    return [...heats.filter(h => wbHeatIds.has(h.id)), ...dynamicWBHeats]
  }

  const getLBHeats = () => {
    // Get LB heats (dynamic + from rounds)
    return heats.filter(h => 
      (h.bracketType === 'loser' || h.id.startsWith('lb-heat-')) && 
      !h.isFinale
    )
  }

  const getWBFinale = () => {
    return heats.find(h => h.bracketType === 'winner' && h.isFinale)
  }

  const getLBFinale = () => {
    return heats.find(h => h.bracketType === 'loser' && h.isFinale)
  }

  const getGrandFinale = () => {
    return heats.find(h => 
      h.bracketType === 'grand_finale' || 
      h.bracketType === 'finale'
    )
  }

  // Collect data for rendering
  const qualiHeats = getQualiHeats()
  const wbHeats = getWBHeats()
  const lbHeats = getLBHeats()
  const wbFinale = getWBFinale()
  const lbFinale = getLBFinale()
  const grandFinale = getGrandFinale()

  // Get intermediate WB heats (between quali and WB finale)
  const getIntermediateWBHeats = () => {
    return wbHeats.filter(h => !h.isFinale)
  }

  // Get intermediate LB heats (between quali losers and LB finale)
  const getIntermediateLBHeats = () => {
    return lbHeats.filter(h => !h.isFinale)
  }

  const intermediateWBHeats = getIntermediateWBHeats()
  const intermediateLBHeats = getIntermediateLBHeats()

  // Render Qualification Section (separate, horizontal)
  const renderQualificationSection = () => {
    if (qualiHeats.length === 0) return null
    
    return (
      <div className="qualification-section mb-8">
        <div className="font-display text-lg text-neon-cyan tracking-widest mb-4">
          QUALIFIKATION
        </div>
        <p className="text-steel text-sm mb-4">
          Platz 1+2 → Winner Bracket | Platz 3+4 → Loser Bracket
        </p>
        <div className="flex flex-wrap gap-4">
          {qualiHeats.map((heat) => (
            <div key={heat.id} ref={(el) => registerHeatRef(heat.id, el)}>
              <BracketHeatBox
                heat={heat}
                pilots={pilots}
                bracketType="qualification"
                onClick={() => handleHeatClick(heat.id)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render the WB/LB bracket tree (without qualification)
  const renderBracketTree = () => (
    <div ref={bracketContainerRef} className="bracket-tree flex items-stretch gap-0 min-w-[900px] relative">
      {/* Story 11-2: SVG Connector Lines Layer */}
      <SVGConnectorLines
        heats={heats}
        containerRef={bracketContainerRef}
        heatRefs={heatRefsMap.current}
      />
      
      {/* Bracket Labels am linken Rand */}
      <div className="bracket-label wb font-display text-sm text-winner-green tracking-widest absolute -left-8 top-8" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
        WINNER BRACKET
      </div>
      <div className="bracket-label lb font-display text-sm text-loser-red tracking-widest absolute -left-8 bottom-8" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
        LOSER BRACKET
      </div>

      {/* Column 1: Pools */}
      <div className="pools-column w-[160px] shrink-0 flex flex-col justify-start pt-8 gap-0">
        <div className="column-label font-display text-xs text-steel tracking-widest text-center mb-3">
          POOLS
        </div>
        
        {/* WB Pool */}
        <div className="mt-8">
          <PoolDisplay
            title="WB POOL"
            pilotIds={winnerPool}
            pilots={pilots}
            variant="compact"
            maxDisplay={4}
            showCount={true}
            className="w-[140px] min-w-0"
          />
        </div>
        
        {/* LB Pool - positioned lower */}
        <div className="mt-24">
          <PoolDisplay
            title="LB POOL"
            pilotIds={loserPool}
            pilots={pilots}
            variant="compact"
            maxDisplay={4}
            showCount={true}
            className="w-[140px] min-w-0"
          />
        </div>
      </div>

      {/* Column 2: WB/LB Heats (nach Quali) */}
      <div className="heats-column w-[230px] shrink-0 flex flex-col justify-between pt-8">
        <div className="column-label font-display text-xs text-steel tracking-widest text-center mb-3">
          BRACKET HEATS
        </div>
        
        {/* WB heats (upper half) */}
        <div className="heat-group flex flex-col gap-4">
          {intermediateWBHeats.length > 0 ? (
            intermediateWBHeats.map((heat) => (
              <div key={heat.id} ref={(el) => registerHeatRef(heat.id, el)}>
                <BracketHeatBox
                  heat={heat}
                  pilots={pilots}
                  bracketType="winner"
                  onClick={() => handleHeatClick(heat.id)}
                />
              </div>
            ))
          ) : (
            <div className="heat-box-placeholder bg-night-light border-2 border-dashed border-winner-green/30 rounded-lg p-4 min-w-[200px] min-h-[100px] flex items-center justify-center">
              <span className="text-steel text-xs text-center">WB Heats<br />warten auf Quali</span>
            </div>
          )}
        </div>

        {/* Bracket Spacer mit Trennlinie (AC3) */}
        <div className="bracket-spacer h-12 flex items-center">
          <div className="w-full border-t-2 border-dashed border-steel/30" />
        </div>

        {/* LB heats (lower half) */}
        <div className="heat-group flex flex-col gap-4">
          {intermediateLBHeats.length > 0 ? (
            intermediateLBHeats.map((heat) => (
              <div key={heat.id} ref={(el) => registerHeatRef(heat.id, el)}>
                <BracketHeatBox
                  heat={heat}
                  pilots={pilots}
                  bracketType="loser"
                  onClick={() => handleHeatClick(heat.id)}
                />
              </div>
            ))
          ) : (
            <div className="heat-box-placeholder bg-night-light border-2 border-dashed border-loser-red/30 rounded-lg p-4 min-w-[200px] min-h-[100px] flex items-center justify-center">
              <span className="text-steel text-xs text-center">LB Heats<br />warten auf Quali</span>
            </div>
          )}
        </div>
      </div>

      {/* Column 3: Connector Space */}
      <div className="connector-column w-12 shrink-0 relative" />

      {/* Column 4: Finals (WB Finale + LB Finale) */}
      <div className="finals-column w-[230px] shrink-0 flex flex-col justify-between py-12">
        <div className="column-label font-display text-xs text-steel tracking-widest text-center mb-3">
          FINALE
        </div>
        
        {/* WB Finale (upper) */}
        <div className="mb-8">
          {wbFinale ? (
            <div ref={(el) => registerHeatRef(wbFinale.id, el)}>
              <BracketHeatBox
                heat={wbFinale}
                pilots={pilots}
                bracketType="winner"
                onClick={() => handleHeatClick(wbFinale.id)}
              />
            </div>
          ) : (
            <div className="heat-box-placeholder bg-night-light border-2 border-dashed border-winner-green/30 rounded-lg p-4 min-w-[200px] min-h-[100px] flex items-center justify-center">
              <span className="text-steel text-sm">WB Finale</span>
            </div>
          )}
        </div>

        {/* LB Finale (lower) */}
        <div>
          {lbFinale ? (
            <div ref={(el) => registerHeatRef(lbFinale.id, el)}>
              <BracketHeatBox
                heat={lbFinale}
                pilots={pilots}
                bracketType="loser"
                onClick={() => handleHeatClick(lbFinale.id)}
              />
            </div>
          ) : (
            <div className="heat-box-placeholder bg-night-light border-2 border-dashed border-loser-red/30 rounded-lg p-4 min-w-[200px] min-h-[100px] flex items-center justify-center">
              <span className="text-steel text-sm">LB Finale</span>
            </div>
          )}
        </div>
      </div>

      {/* Column 5: Connector to Grand Finale */}
      <div className="connector-column w-12 shrink-0 relative" />

      {/* Column 6: Grand Finale */}
      <div className="grand-finale-column w-[260px] shrink-0 flex items-center justify-center pl-5">
        <div className="relative">
          <div className="column-label font-display text-xs text-gold tracking-widest text-center mb-3">
            GRAND FINALE
          </div>
          
          {grandFinale && grandFinale.pilotIds.length > 0 ? (
            <div ref={(el) => registerHeatRef(grandFinale.id, el)}>
              <GrandFinaleHeatBox
                heat={grandFinale}
                pilots={pilots}
                heats={heats}
              />
            </div>
          ) : grandFinalePool.length > 0 ? (
            <PoolDisplay
              title="GF POOL"
              pilotIds={grandFinalePool}
              pilots={pilots}
              variant="grandFinale"
              showCount={true}
            />
          ) : (
            <div className="heat-box-placeholder bg-void border-3 border-dashed border-gold/30 rounded-2xl p-6 min-w-[240px] min-h-[160px] flex items-center justify-center shadow-glow-gold/20">
              <span className="text-gold/50 text-sm text-center">
                Grand Finale<br />
                <span className="text-xs">Wartet auf Finalisten</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Tournament Completed State - Show Victory Ceremony
  if (tournamentPhase === 'completed' && top4 && onNewTournament) {
    return (
      <div className="bracket-container bg-night rounded-2xl p-8 relative overflow-x-auto min-h-[600px]">
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
          {renderQualificationSection()}
          {renderBracketTree()}
          
          {/* Story 11-7: Bracket Legend */}
          <BracketLegend />
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
    <div className="bracket-container bg-night rounded-2xl p-8 relative overflow-x-auto min-h-[600px]">
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

      {/* 2. QUALIFICATION SECTION (separate, horizontal) */}
      {renderQualificationSection()}

      {/* 3. WB/LB BRACKET TREE */}
      {renderBracketTree()}

      {/* 3. BRACKET LEGEND (Story 11-7) */}
      <BracketLegend />

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
