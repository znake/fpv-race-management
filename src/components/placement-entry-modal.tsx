import { useState, useEffect, useCallback, useRef } from 'react'
import type { Heat } from '@/types'
import type { Pilot } from '@/lib/schemas'
import { Modal } from './ui/modal'
import {
  getRankBadgeClasses,
  getRankBorderClasses,
  FALLBACK_PILOT_IMAGE,
  parseLapTimeDigits,
  formatPartialTimeEntry
} from '@/lib/ui-helpers'
import { formatChannel, getChannelForPosition } from '@/lib/channel-assignment'
import { useIsMobile } from '@/hooks/useIsMobile'

type PlacementEntryModalProps = {
  heat: Heat
  pilots: Pilot[]
  nextHeat?: Heat
  isOpen: boolean
  onClose: () => void
  onSubmitResults: (
    heatId: string,
    rankings: { pilotId: string; rank: 1 | 2 | 3 | 4; lapTimeMs?: number }[]
  ) => void
}

/**
 * Modal for entering placement results for a heat in the bracket view.
 * Reuses ranking logic from ActiveHeatView but in a compact modal format.
 * 
 * Features:
 * - Click-to-rank pilot cards
 * - Keyboard shortcuts (Escape to reset)
 * - Pre-fills existing rankings if heat.results exists
 * - Grid layout adapts to 3 or 4 pilots
 */
export function PlacementEntryModal({
  heat,
  pilots,
  nextHeat,
  isOpen,
  onClose,
  onSubmitResults
}: PlacementEntryModalProps) {
  const [rankings, setRankings] = useState<Map<string, number>>(new Map())
  const [lapTimes, setLapTimes] = useState<Map<string, number>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [displayedTimeDigits, setDisplayedTimeDigits] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [shakeOverlay, setShakeOverlay] = useState(false)
  const [editingPilotId, setEditingPilotId] = useState<string | null>(null)
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Refs for keyboard-based lap time digit accumulation
  const lastClickedPilotIdRef = useRef<string | null>(null)
  const timeDigitBufferRef = useRef<string>('')
  
  // Mobile detection for responsive layout
  const isMobile = useIsMobile()
  
  // Ref for stable rankings.size in keyboard handler (prevents event listener churn)
  const rankingsSizeRef = useRef<number>(0)
  useEffect(() => {
    rankingsSizeRef.current = rankings.size
  }, [rankings.size])

  // Get pilots in this heat
  const heatPilots = heat.pilotIds
    .map((id) => pilots.find((p) => p.id === id))
    .filter(Boolean) as Pilot[]

  const nextHeatPilots = nextHeat?.pilotIds?.length
    ? nextHeat.pilotIds
        .map((id, index) => ({
          pilot: pilots.find((p) => p.id === id),
          channel: getChannelForPosition(index, nextHeat.pilotIds.length)
        }))
        .filter((entry): entry is { pilot: Pilot; channel: ReturnType<typeof getChannelForPosition> } => 
          entry.pilot !== undefined
        )
    : []

  // Min rankings required: Math.min(2, pilotCount)
  const minRankingsRequired = Math.min(2, heatPilots.length)
  const isFinishEnabled = rankings.size >= minRankingsRequired

  // Initialize rankings from existing results (pre-fill for edit/reopen)
  useEffect(() => {
    if (isOpen && heat.results?.rankings) {
      const existingRankings = new Map<string, number>()
      const existingLapTimes = new Map<string, number>()
      heat.results.rankings.forEach((r) => {
        existingRankings.set(r.pilotId, r.rank)
        if (r.lapTimeMs !== undefined) {
          existingLapTimes.set(r.pilotId, r.lapTimeMs)
        }
      })
      setRankings(existingRankings)
      setLapTimes(existingLapTimes)
    } else if (isOpen) {
      setRankings(new Map())
      setLapTimes(new Map())
    }
  }, [isOpen, heat.id, heat.results])

  const finalizeTimeEntry = useCallback(() => {
    const pilotId = lastClickedPilotIdRef.current
    const buffer = timeDigitBufferRef.current

    if (pilotId && buffer) {
      let seconds = 0
      if (buffer.length <= 2) {
        seconds = parseInt(buffer, 10)
      } else {
        seconds = parseInt(buffer.slice(1), 10)
      }
      
      if (seconds > 59) {
        setValidationError('Sekunden max. 59')
        setShakeOverlay(true)
        setTimeout(() => setShakeOverlay(false), 400)
        return
      }
      
      const parsedMs = parseLapTimeDigits(buffer)
      if (parsedMs === null) {
        setValidationError('Ungültige Zeit (20s - 9:59)')
        setShakeOverlay(true)
        setTimeout(() => setShakeOverlay(false), 400)
        return
      }
      
      setLapTimes((prev) => new Map(prev).set(pilotId, parsedMs))
    }

    lastClickedPilotIdRef.current = null
    timeDigitBufferRef.current = ''
    setDisplayedTimeDigits('')
    setValidationError(null)
    setEditingPilotId(null)
  }, [])

  const openTimeEntryWindow = useCallback(
    (pilotId: string) => {
      timeDigitBufferRef.current = ''
      lastClickedPilotIdRef.current = pilotId
      setEditingPilotId(pilotId)
      setDisplayedTimeDigits('')
      setValidationError(null)
    },
    []
  )
  
  const currentEditingPilot = editingPilotId 
    ? heatPilots.find(p => p.id === editingPilotId)
    : null

  // Focus first pilot button when modal opens
  useEffect(() => {
    if (isOpen && cardRefs.current[0]) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        cardRefs.current[0]?.focus()
      }, 50)
    }
  }, [isOpen])

  // Toggle rank for a pilot
  const toggleRank = useCallback((pilotId: string) => {
    const currentRank = rankings.get(pilotId)
    const willAssignRank =
      currentRank === undefined && rankings.size + 1 <= heatPilots.length

    setRankings((prev) => {
      const currentRank = prev.get(pilotId)

      if (currentRank !== undefined) {
        // REMOVE: Pilot already has rank -> remove it
        const newRankings = new Map(prev)
        newRankings.delete(pilotId)

        // Shift higher ranks down by 1
        for (const [id, rank] of newRankings) {
          if (rank > currentRank) {
            newRankings.set(id, rank - 1)
          }
        }
        return newRankings
      } else {
        // ASSIGN: Give next free rank
        const nextRank = prev.size + 1
        if (nextRank <= heatPilots.length) {
          return new Map(prev).set(pilotId, nextRank)
        }
        return prev
      }
    })

    if (willAssignRank) {
      openTimeEntryWindow(pilotId)
    }
  }, [rankings, heatPilots.length, openTimeEntryWindow])



  const resetRankings = useCallback(() => {
    setRankings(new Map())
    setLapTimes(new Map())
    lastClickedPilotIdRef.current = null
    timeDigitBufferRef.current = ''
    setDisplayedTimeDigits('')
  }, [])

  // Handle submit with double-click protection
  const handleSubmit = () => {
    if (!isFinishEnabled || isSubmitting) return

    setIsSubmitting(true)

    const rankingsArray = Array.from(rankings.entries())
      .map(([pilotId, rank]) => ({
        pilotId,
        rank: rank as 1 | 2 | 3 | 4,
        lapTimeMs: lapTimes.get(pilotId)
      }))
      .sort((a, b) => a.rank - b.rank)

    onSubmitResults(heat.id, rankingsArray)
    // onClose is called by parent after submit
  }

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isTimeEntryActive = lastClickedPilotIdRef.current !== null
      // PRIORITY 1: Time entry mode active + Enter → finalize time entry
      if (isTimeEntryActive && e.key === 'Enter') {
        e.preventDefault()
        finalizeTimeEntry()
        return
      }

      // PRIORITY 2: Time entry mode active + digit → capture ALL 0-9 (max 3 digits)
      if (isTimeEntryActive && /^[0-9]$/.test(e.key)) {
        e.preventDefault()

        if (timeDigitBufferRef.current.length >= 3) {
          setValidationError('Max. 3 Ziffern')
          setShakeOverlay(true)
          setTimeout(() => setShakeOverlay(false), 400)
          return
        }

        const newBuffer = timeDigitBufferRef.current + e.key
        timeDigitBufferRef.current = newBuffer
        setDisplayedTimeDigits(newBuffer)

        return
      }

      // PRIORITY 3: Time entry mode active + Backspace → delete last digit
      if (isTimeEntryActive && e.key === 'Backspace') {
        e.preventDefault()

        const newBuffer = timeDigitBufferRef.current.slice(0, -1)
        timeDigitBufferRef.current = newBuffer
        setDisplayedTimeDigits(newBuffer)
        setValidationError(null)

        return
      }

      // PRIORITY 4: Time entry mode active + Escape → clear time entry only
      if (isTimeEntryActive && e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()

        lastClickedPilotIdRef.current = null
        timeDigitBufferRef.current = ''
        setDisplayedTimeDigits('')
        setValidationError(null)
        setEditingPilotId(null)

        return
      }

      // PRIORITY 5: Escape (no time entry) → reset rankings or close modal
      if (e.key === 'Escape') {
        if (rankingsSizeRef.current > 0) {
          e.preventDefault()
          e.stopPropagation()
        }
        resetRankings()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, resetRankings, finalizeTimeEntry])

  useEffect(() => {
    if (!isOpen) {
      lastClickedPilotIdRef.current = null
      timeDigitBufferRef.current = ''
      setDisplayedTimeDigits('')
      setValidationError(null)
      setEditingPilotId(null)
    }
  }, [isOpen])

  // Get rank badge styling
  const getRankBadgeClass = (rank: number) => {
    return getRankBadgeClasses(rank).replace(' text-void', '')
  }

  // Generate heat name (same logic as BracketHeatBox)
  const getHeatName = () => {
    const bracketType = heat.bracketType
    const prefix = bracketType === 'qualification' ? 'QUALI' 
                 : bracketType === 'loser' ? 'LB' 
                 : bracketType === 'finale' || bracketType === 'grand_finale' ? 'GRAND FINALE'
                 : 'WB'
    
    if (bracketType === 'finale' || bracketType === 'grand_finale') return 'GRAND FINALE'
    
    return `${prefix} H${heat.heatNumber}`
  }

  // Generate accessible label for pilot card
  const getAriaLabel = (pilot: Pilot, rank: number | undefined) => {
    const hasRank = rank !== undefined
    const nextRank = rankings.size + 1
    const actionHint = hasRank 
      ? `Rang ${rank} entfernen` 
      : `Rang ${nextRank} vergeben`
    return `${pilot.name}${hasRank ? `, aktuell Rang ${rank}` : ''}, klicken um ${actionHint}`
  }

  // Grid columns: responsive - 2 columns on mobile, 3-4 on desktop
  const gridCols = isMobile
    ? 'grid-cols-2'  // Mobile: 2x2 grid for better visibility
    : heatPilots.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
  
  // Responsive avatar size
  const avatarSize = isMobile ? 'w-[100px] h-[100px]' : 'w-[220px] h-[220px]'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      closeOnEscape={rankings.size === 0} // Only close on Escape if no rankings (otherwise reset)
      data-testid="placement-entry-modal"
    >
      {/* Header */}
      <div className={`text-center ${isMobile ? 'mb-4' : 'mb-10'}`}>
        <h2 className={`font-display text-chrome tracking-wider ${isMobile ? 'text-2xl mb-1' : 'text-5xl mb-3'}`}>
          {getHeatName()}
        </h2>
        <p className={`font-ui text-steel/60 ${isMobile ? 'text-xs' : 'text-base'}`}>
          Pilot anklicken für Platzierung, danach 3 Ziffern für Zeit eingeben
        </p>
      </div>

      {/* Pilot Cards Grid */}
      <div className={`grid ${gridCols} ${isMobile ? 'gap-3 mb-4' : 'gap-6 mb-8'}`}>
        {heatPilots.map((pilot, index) => {
          const rank = rankings.get(pilot.id)
          const hasRank = rank !== undefined
          
          // Calculate channel based on original position in heat
          const originalIndex = heat.pilotIds.indexOf(pilot.id)
          const channel = getChannelForPosition(originalIndex, heat.pilotIds.length)

          return (
            <button
              key={pilot.id}
              ref={(el) => { cardRefs.current[index] = el }}
              data-pilot-id={pilot.id}
              data-testid={`pilot-card-${pilot.id}`}
              aria-label={getAriaLabel(pilot, rank)}
              aria-pressed={hasRank}
              onClick={() => toggleRank(pilot.id)}

              className={`
                                relative bg-night text-center cursor-pointer
                                border-2 rounded-xl select-none
                                transition-all duration-200 ease-out
                                focus:outline-none focus:ring-2 focus:ring-neon-cyan/50
                                hover:-translate-y-0.5
                                ${isMobile ? 'p-3' : 'p-6'}
                                ${hasRank 
                                  ? getRankBorderClasses(rank!)
                                  : 'border-steel hover:border-neon-cyan'
                                }
                              `}
                              style={{ touchAction: 'manipulation' }}
            >
              {/* Rank Badge */}
              {hasRank && (
                <div className={`
                  absolute rounded-full
                  flex items-center justify-center font-display text-void
                  rank-badge-animate
                  ${isMobile ? '-top-2 -right-2 w-10 h-10 text-xl' : '-top-4 -right-4 w-16 h-16 text-3xl'}
                  ${getRankBadgeClass(rank)}
                `}>
                  {rank}
                </div>
              )}

              {/* Pilot Photo - responsive size */}
              <div className={`relative mx-auto ${isMobile ? 'mb-3' : 'mb-6'} ${avatarSize}`}>
                <div className={`${avatarSize} rounded-full overflow-hidden bg-gradient-to-br from-neon-pink to-neon-magenta`}>
              <img
                                    src={pilot.imageUrl || FALLBACK_PILOT_IMAGE}
                                    alt={pilot.name}
                                    className="w-full h-full object-cover pointer-events-none"
                                    loading="lazy"
                                    draggable={false}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                                    }}
                                  />
                </div>
              </div>

              {/* Pilot Name with Channel Badge */}
              <div className={`flex items-center justify-center w-full ${isMobile ? 'mb-1' : 'mb-2'}`}>
                <span className="channel-badge bg-zinc-800 text-xs px-1 rounded font-mono text-zinc-300 mr-2 flex-shrink-0">
                  {formatChannel(channel)}
                </span>
                <div className={`font-display font-bold text-chrome truncate ${isMobile ? 'text-base' : 'text-3xl'}`}>
                  {pilot.name}
                </div>
              </div>

              {/* Instagram Handle - always render to maintain consistent card height */}
              <div className={`font-ui text-steel truncate ${isMobile ? 'text-sm' : 'text-xl'}`}>
                {pilot.instagramHandle || '\u00A0'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Action Area */}
      <div className={`flex flex-col items-center ${isMobile ? 'gap-3 mt-4' : 'gap-5 mt-10'}`}>
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isFinishEnabled || isSubmitting}
          data-testid="submit-placement-btn"
          className={`btn-primary ${isMobile ? 'text-lg px-10 py-3' : 'text-3xl px-16 py-5'}`}
        >
          Fertig
        </button>

        {/* Reset Link */}
        {rankings.size > 0 && (
          <button
            onClick={resetRankings}
            data-testid="reset-rankings-btn"
            className={`font-ui text-steel hover:text-neon-cyan transition-colors ${isMobile ? 'text-sm' : 'text-xl'}`}
          >
            Zurücksetzen
          </button>
        )}

        {/* Status Text */}
        <p className={`font-ui text-steel ${isMobile ? 'text-sm' : 'text-xl'}`}>
          {rankings.size === 0 && 'Klicke auf einen Piloten für Rang 1'}
          {rankings.size === 1 && minRankingsRequired === 2 && 'Mindestens 2 Ränge für Fertig'}
          {rankings.size >= minRankingsRequired && rankings.size < heatPilots.length && `${rankings.size}/${heatPilots.length} Ränge vergeben`}
          {rankings.size === heatPilots.length && 'Alle Ränge vergeben!'}
        </p>

        {rankings.size >= minRankingsRequired && rankings.size < heatPilots.length && (
          <p className={`font-ui text-steel/60 italic ${isMobile ? 'text-xs' : 'text-base'}`}>
            Nicht vergebene Plätze werden automatisch hinten aufgefüllt.
          </p>
        )}
      </div>



      {nextHeatPilots.length > 0 && (
        <div className={`${isMobile ? 'mt-4' : 'mt-6'} text-center border-t border-steel/20 pt-4`}>
          <p className={`font-ui text-chrome ${isMobile ? 'text-sm mb-2' : 'text-xl mb-3'}`}>
            Nächster Heat – bitte bereit machen:
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {nextHeatPilots.map(({ pilot, channel }) => (
              <div key={pilot.id} className="flex items-center gap-2">
                <span className="channel-badge bg-zinc-800 text-xs px-1.5 py-0.5 rounded font-mono text-zinc-300">
                  {formatChannel(channel)}
                </span>
                <span className={`font-display text-chrome ${isMobile ? 'text-lg' : 'text-3xl'}`}>
                  {pilot.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(displayedTimeDigits || validationError) && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          aria-live="polite"
          aria-atomic="true"
          data-testid="time-entry-overlay"
        >
          <div className={`bg-void/90 px-12 py-8 rounded-2xl border-2 shadow-glow-cyan pointer-events-auto ${
            shakeOverlay ? 'shake-error' : 'border-neon-cyan'
          }`}>
            {currentEditingPilot && (
              <div className="text-center mb-4">
                <div className="text-steel text-lg">Zeit für</div>
                <div className="font-display text-3xl text-chrome">{currentEditingPilot.name}</div>
              </div>
            )}
            <div className="font-display text-8xl text-chrome tracking-wider text-center">
              {formatPartialTimeEntry(displayedTimeDigits)}
            </div>
            {validationError ? (
              <div className="text-center text-loser-red mt-4 text-xl font-bold animate-pulse">
                {validationError}
              </div>
            ) : (
              <div 
                className="text-center text-steel mt-2 text-xl cursor-pointer hover:text-chrome transition-colors"
                onClick={finalizeTimeEntry}
              >
                Enter zum Bestätigen
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
