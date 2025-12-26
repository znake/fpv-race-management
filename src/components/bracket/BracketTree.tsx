import { useState, useRef, useEffect, useCallback } from 'react'
import { useTournamentStore, type TournamentPhase } from '../../stores/tournamentStore'
import type { Pilot } from '../../lib/schemas'
import { HeatDetailModal } from '../heat-detail-modal'
import { ActiveHeatView } from '../active-heat-view'
import { VictoryCeremony } from '../victory-ceremony'

// Import all section components
import { HeatsSection } from './layout/HeatsSection'
import { WinnerBracketSection } from './sections/WinnerBracketSection'
import { LoserBracketSection } from './sections/LoserBracketSection'
import { GrandFinaleSection } from './sections/GrandFinaleSection'

interface BracketTreeProps {
  pilots: Pilot[]
  tournamentPhase: TournamentPhase
  activeHeat?: import('../../stores/tournamentStore').Heat
  nextHeat?: import('../../stores/tournamentStore').Heat
  onSubmitResults: (heatId: string, rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]) => void
  onHeatComplete?: () => void
  onNewTournament?: () => void
}

/**
 * Main BracketTree Component with integrated ActiveHeatView
 *
 * Layout (TURNIER tab):
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
  const winnerPool = useTournamentStore(state => state.winnerPool)
  const grandFinalePool = useTournamentStore(state => state.grandFinalePool)

  // Story 10-2: Check if WB has pending/active heats using Store method
  // This replaces the local useMemo with a call to the unified Store method
  const hasActiveWBHeats = useTournamentStore(state => state.hasActiveWBHeats())

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
            winnerPool={winnerPool}
            onHeatClick={handleHeatClick}
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
            grandFinalePool={grandFinalePool}
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
        winnerPool={winnerPool}
        onHeatClick={handleHeatClick}
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
        grandFinalePool={grandFinalePool}
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
