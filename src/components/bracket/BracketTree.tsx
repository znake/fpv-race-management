import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTournamentStore } from '../../stores/tournamentStore'
import type { Pilot, Heat, TournamentPhase } from '../../types'
import { HeatDetailModal } from '../heat-detail-modal'
import { PlacementEntryModal } from '../placement-entry-modal'
import { VictoryCeremony } from '../victory-ceremony'
import { cn } from '../../lib/utils'

// US-14.8: Zoom & Pan
import { useZoomPan } from '../../hooks/useZoomPan'
import { useIsMobile } from '../../hooks/useIsMobile'
import { ZoomIndicator } from './ZoomIndicator'

// US-14.10: Layout Calculator
import { calculateBracketDimensions } from '../../lib/bracket-layout-calculator'

// Import heat box components
import { GrandFinaleSection } from './sections/GrandFinaleSection'
import { SVGConnectorLines } from './SVGConnectorLines'

import { QualiSection } from './sections/QualiSection'
import { WinnerBracketSection } from './sections/WinnerBracketSection'
import { LoserBracketSection } from './sections/LoserBracketSection'

interface BracketTreeProps {
  pilots: Pilot[]
  tournamentPhase: TournamentPhase
  onSubmitResults: (heatId: string, rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]) => void
  onNewTournament?: () => void
  onExportCSV?: () => void
}

/**
 * US-14-REWRITE: Bracket Layout nach Mockup
 * 
 * Neues Layout (vertikal):
 * 1. QUALIFIKATION (oben, horizontal)
 *    - Flow-Indicator: Platz 1+2 → WB, Platz 3+4 → LB
 * 
 * 2. WB + LB side-by-side (bracket-layout)
 *    - WB links mit Column-Header "WINNER BRACKET"
 *    - LB rechts mit Column-Header "LOSER BRACKET"
 *    - gap: 40px zwischen beiden
 * 
 * 3. GRAND FINALE (unten, mittig)
 *    - GF-Sources Labels (WB TOP 2 / LB TOP 2)
 *    - GF-Label "GRAND FINALE" in Gold
 * 
 * 4. LEGENDE (ganz unten)
 */
export function BracketTree({
  pilots,
  tournamentPhase,
  onSubmitResults,
  onNewTournament,
  onExportCSV
}: BracketTreeProps) {
  const heats = useTournamentStore(state => state.heats || [])
  // Phase 2: fullBracketStructure entfernt - heats[] ist jetzt Single Source of Truth
  const getTop4Pilots = useTournamentStore(state => state.getTop4Pilots)

  // US-14.8: Zoom & Pan Hook
  const {
    state: zoomState,
    containerRef: zoomContainerRef,
    wrapperRef: zoomWrapperRef,
    isPanning,
    isDragging,
    isAnimating,
    zoomIn,
    zoomOut,
    reset,
    centerOnElement
  } = useZoomPan()
  
  // Mobile detection for reduced zoom on auto-center
  const isMobile = useIsMobile()
  // Mobile gets 20% less zoom (2.4 instead of 3.0) for better overview
  const autoFocusZoomScale = isMobile ? 2.4 : 3.0
  // Mobile gets slower, smoother animation (800ms vs 500ms) - synced with CSS
  const autoFocusDuration = isMobile ? 800 : 500
  
  // Get store action for finding next active heat
  const getActiveHeat = useTournamentStore(state => state.getActiveHeat)

  // Refs for SVG connector lines - maps heat IDs to their DOM elements
  const heatRefsMap = useRef<Map<string, HTMLDivElement | null>>(new Map())

  // Refs for WB and LB Finals - used for SVG connector lines to Grand Finale
  const wbFinaleRef = useRef<HTMLDivElement | null>(null)
  const lbFinaleRef = useRef<HTMLDivElement | null>(null)
  
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
  // Placement Modal state (for active heats in bracket)
  const [placementHeat, setPlacementHeat] = useState<Heat | null>(null)
  
  // Track if initial auto-focus on tournament start has been performed
  const hasInitialFocused = useRef(false)

  // Auto-focus on first active heat when tournament starts
  // This runs once when heats become available and centers on the first active heat
  useEffect(() => {
    // Only run once per tournament
    if (hasInitialFocused.current) return
    
    // Wait for heats to be generated
    if (heats.length === 0) return
    
    // Find the first active heat
    const activeHeat = getActiveHeat()
    if (!activeHeat) return
    
    // Small delay to ensure DOM elements are rendered and refs are registered
    const timer = setTimeout(() => {
      const element = heatRefsMap.current.get(activeHeat.id)
      if (element) {
        centerOnElement(element, { targetScale: autoFocusZoomScale, duration: autoFocusDuration })
        hasInitialFocused.current = true
      }
    }, 200)
    
    return () => clearTimeout(timer)
  }, [heats, getActiveHeat, centerOnElement, autoFocusZoomScale, autoFocusDuration])

  // Lifecycle: Close placement modal if heat no longer exists
  // Note: Allow editing of both 'active' and 'completed' heats
  useEffect(() => {
    if (placementHeat) {
      const currentHeat = heats.find(h => h.id === placementHeat.id)
      if (!currentHeat) {
        setPlacementHeat(null)
      }
    }
  }, [heats, placementHeat])

  const handleHeatClick = (heatId: string) => {
    const heat = heats.find(h => h.id === heatId)
    if (heat?.status === 'active') {
      // Active heat: open Placement Modal (mutual exclusivity)
      setSelectedHeat(null)
      setPlacementHeat(heat)
    } else {
      // Non-active heat: open Detail Modal
      setPlacementHeat(null)
      setSelectedHeat(heatId)
    }
  }

  const handleCloseModal = () => {
    setSelectedHeat(null)
  }

  const handleEditHeat = (heatId: string) => {
    setSelectedHeat(null)
    const heat = heats.find(h => h.id === heatId)
    if (heat) setPlacementHeat(heat)
  }

  const selectedHeatData = heats.find(h => h.id === selectedHeat)

  // Empty state: No pilots - Beamer-optimiert
  if (pilots.length === 0) {
    return (
      <div className="bracket-container">
        <p className="font-ui text-beamer-body text-steel text-center">Keine Piloten für Bracket verfügbar</p>
      </div>
    )
  }

  // Empty state: No heats generated yet - Beamer-optimiert
  if (heats.length === 0) {
    return (
      <div className="bracket-container">
        <p className="font-ui text-beamer-body text-steel text-center">Noch keine Heats generiert</p>
        <p className="font-ui text-steel/60 text-beamer-caption mt-2 text-center">
          Starte ein Turnier um das Bracket zu sehen
        </p>
      </div>
    )
  }

  // Phase 1.3: Loading-State basiert jetzt auf tournamentStarted statt fullBracketStructure
  // (fullBracketStructure Check bleibt vorerst für Backward-Compatibility)

  // Get Top 4 for Victory Ceremony
  const top4 = tournamentPhase === 'completed' ? getTop4Pilots() : null

  // Helper: Get heats for different brackets
  // Phase 1.2: Verwendet bracketType statt fullBracketStructure
  const getQualiHeats = () => {
    return heats.filter(h => !h.bracketType || h.bracketType === 'qualification')
  }

  const getWBHeats = () => {
    // Refactored: Verwendet nur heats[] mit bracketType
    return heats.filter(h => h.bracketType === 'winner')
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
  // Note: wbHeats not used directly - WinnerBracketSection handles WB heats
  void getWBHeats() // Keep function available for future use
  const lbHeats = getLBHeats()
  const wbFinale = getWBFinale()
  const lbFinale = getLBFinale()
  const grandFinale = getGrandFinale()

  // LB heats are now handled by LoserBracketSection using fullBracketStructure.loserBracket
  void lbHeats

  // Calculate dimensions using new calculator
  const { containerWidth, wbColumnWidth, lbColumnWidth } = useMemo(() => 
    calculateBracketDimensions(pilots.length),
    [pilots.length]
  )

  /**
   * Unified Canvas: Alles in einem zoom/pan-baren Container
   * 
   * Layout (vertikal):
   * 1. QualiSection oben (horizontal)
   * 2. WB + LB side-by-side (bracket-columns-wrapper)
   * 3. Grand Finale unten (mittig)
   * 
   * @param disableConnectors - If true, skip SVG connector line updates (used during victory ceremony)
   */
  const renderBracketColumnsWrapper = (disableConnectors = false) => (
    <div
      ref={zoomWrapperRef}
      className={cn(
        'zoom-wrapper',
        isPanning && 'panning',
        isDragging && 'dragging'
      )}
      onDoubleClick={(e) => {
        // Reset on Double Click + Ctrl/Cmd
        if (e.ctrlKey || e.metaKey) {
          reset()
        }
      }}
    >
      <div
        ref={zoomContainerRef}
        id="bracket-container"
        className={cn(
          'bracket-tree',
          'zoom-container',
          isAnimating && 'animating'
        )}
        style={{
          transform: `translate(${zoomState.translateX}px, ${zoomState.translateY}px) scale(${zoomState.scale})`,
          transformOrigin: '0 0',
          width: `${containerWidth}px`
        }}
      >
        {/* SVG Overlay für Verbindungslinien */}
        <SVGConnectorLines
          heats={heats}
          containerRef={zoomContainerRef}
          heatRefs={heatRefsMap.current}
          scale={zoomState.scale}
          disabled={disableConnectors}
        />
        
        {/* 1. QUALIFICATION SECTION (horizontal, oben) */}
        <QualiSection
          qualiHeats={qualiHeats}
          pilots={pilots}
          onHeatClick={handleHeatClick}
          registerHeatRef={registerHeatRef}
        />
        
        {/* 2. WB + LB side-by-side */}
        <div className="bracket-columns-wrapper">
          {/* WB Column (links) */}
          <WinnerBracketSection
            heats={heats}
            pilots={pilots}
            onHeatClick={handleHeatClick}
            registerHeatRef={(id, el) => {
              registerHeatRef(id, el)
              // Track WB Finale ref for GF positioning
              if (wbFinale && id === wbFinale.id) {
                wbFinaleRef.current = el
              }
            }}
            columnWidth={wbColumnWidth}
          />
          
          {/* LB Column (rechts) */}
          <LoserBracketSection
            heats={heats}
            pilots={pilots}
            onHeatClick={handleHeatClick}
            registerHeatRef={(id, el) => {
              registerHeatRef(id, el)
              // Track LB Finale ref for GF positioning
              if (lbFinale && id === lbFinale.id) {
                lbFinaleRef.current = el
              }
            }}
            columnWidth={lbColumnWidth}
          />
        </div>
        
        {/* 3. GRAND FINALE SECTION (unten, mittig) */}
        <GrandFinaleSection
          grandFinaleHeat={grandFinale || null}
          pilots={pilots}
          heats={heats}
          onHeatClick={handleHeatClick}
          registerHeatRef={registerHeatRef}
        />
      </div>
    </div>
  )

  // Tournament Completed State - Show Victory Ceremony
  if (tournamentPhase === 'completed' && top4 && onNewTournament) {
    return (
      <div className="bracket-container victory-mode">
        <VictoryCeremony
          top4={top4}
          onNewTournament={onNewTournament}
          onExportCSV={onExportCSV}
        />
      </div>
    )
  }

  return (
    <div className="bracket-container">
      {/* Unified Canvas: Quali + WB/LB + Grand Finale - alles zoombar/panbar */}
      {renderBracketColumnsWrapper()}

      {/* US-14.8: Zoom Indicator */}
      <ZoomIndicator
        scale={zoomState.scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
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

      {/* Placement Entry Modal for active heats */}
      {placementHeat && (
        <PlacementEntryModal
          heat={placementHeat}
          pilots={pilots}
          isOpen={!!placementHeat}
          onClose={() => setPlacementHeat(null)}
          onSubmitResults={(heatId, rankings) => {
            onSubmitResults(heatId, rankings)
            setPlacementHeat(null)
            
            // Auto-center on next active heat after a short delay
            // (wait for state update and DOM render)
            setTimeout(() => {
              const nextActiveHeat = getActiveHeat()
              if (nextActiveHeat) {
                const element = heatRefsMap.current.get(nextActiveHeat.id)
                if (element) {
                  centerOnElement(element, { targetScale: autoFocusZoomScale, duration: autoFocusDuration })
                }
              }
            }, 150)
          }}
        />
      )}
    </div>
  )
}
