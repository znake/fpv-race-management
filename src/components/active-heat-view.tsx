import { useState, useEffect, useCallback, useRef } from 'react'
import type { Heat } from '../stores/tournamentStore'
import type { Pilot } from '../lib/schemas'
import { OnDeckPreview } from './on-deck-preview'
import { getRankBadgeClasses, getRankBorderClasses } from '../lib/utils'

// Constants
const SUBMIT_ANIMATION_DELAY = 300 // ms - Zeit für Success-Pulse Animation
const FALLBACK_PILOT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150"%3E%3Crect fill="%23ff2a6d" width="150" height="150"/%3E%3Ctext x="75" y="85" text-anchor="middle" fill="%230d0221" font-size="48" font-family="sans-serif"%3EP%3C/text%3E%3C/svg%3E'

type ActiveHeatViewProps = {
  heat: Heat
  nextHeat?: Heat
  pilots: Pilot[]
  onSubmitResults: (heatId: string, rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]) => void
  onHeatComplete?: () => void // Callback after heat results are submitted
}

export function ActiveHeatView({ heat, nextHeat, pilots, onSubmitResults, onHeatComplete }: ActiveHeatViewProps) {
  // Local state for rankings during input
  const [rankings, setRankings] = useState<Map<string, number>>(new Map())
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [showSuccessPulse, setShowSuccessPulse] = useState(false)
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Ref for stable focus index in keyboard handler (prevents memory leak from rapid re-subscriptions)
  const focusedIndexRef = useRef<number | null>(null)
  useEffect(() => {
    focusedIndexRef.current = focusedIndex
  }, [focusedIndex])

  // Get pilots in this heat
  const heatPilots = heat.pilotIds
    .map((id) => pilots.find((p) => p.id === id))
    .filter(Boolean) as Pilot[]

  // Compute if finish button should be enabled (at least 2 rankings)
  const isFinishEnabled = rankings.size >= 2

  // Toggle rank for a pilot
  const toggleRank = useCallback((pilotId: string) => {
    setRankings((prev) => {
      const currentRank = prev.get(pilotId)

      if (currentRank !== undefined) {
        // REMOVE: Pilot hat bereits Rang → entfernen
        const newRankings = new Map(prev)
        newRankings.delete(pilotId)

        // Alle höheren Ränge um 1 reduzieren
        for (const [id, rank] of newRankings) {
          if (rank > currentRank) {
            newRankings.set(id, rank - 1)
          }
        }
        return newRankings
      } else {
        // ASSIGN: Nächsten freien Rang vergeben
        const nextRank = prev.size + 1
        if (nextRank <= heatPilots.length) {
          return new Map(prev).set(pilotId, nextRank)
        }
        return prev
      }
    })
  }, [heatPilots.length])

  // Assign a direct rank (for keyboard shortcuts)
  const assignDirectRank = useCallback((pilotId: string, rank: 1 | 2 | 3 | 4) => {
    if (rank > heatPilots.length) return
    
    setRankings((prev) => {
      const newRankings = new Map(prev)
      
      // Remove any existing pilot with this rank
      for (const [id, r] of newRankings) {
        if (r === rank) {
          newRankings.delete(id)
          break
        }
      }
      
      // Remove the pilot's current rank if they have one
      const currentRank = newRankings.get(pilotId)
      if (currentRank !== undefined) {
        newRankings.delete(pilotId)
      }
      
      // Assign the new rank
      newRankings.set(pilotId, rank)
      
      return newRankings
    })
  }, [heatPilots.length])

  // Reset all rankings
  const resetRankings = useCallback(() => {
    setRankings(new Map())
  }, [])

  // Handle submit with success pulse animation
  const handleSubmit = () => {
    if (!isFinishEnabled) return

    // Trigger success pulse animation
    setShowSuccessPulse(true)
    
    const rankingsArray = Array.from(rankings.entries())
      .map(([pilotId, rank]) => ({ pilotId, rank: rank as 1 | 2 | 3 | 4 }))
      .sort((a, b) => a.rank - b.rank)

    // Delay for visual feedback before transitioning
    setTimeout(() => {
      onSubmitResults(heat.id, rankingsArray)
      setRankings(new Map())
      setShowSuccessPulse(false)
      
      // Notify parent that heat is complete (for auto tab switch)
      onHeatComplete?.()
    }, SUBMIT_ANIMATION_DELAY)
  }

  // Keyboard navigation - using refs for stable handlers (prevents memory leak from rapid re-subscriptions)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is on a pilot card
      const focusedPilotId = document.activeElement?.getAttribute('data-pilot-id')

      if (focusedPilotId && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault()
        assignDirectRank(focusedPilotId, parseInt(e.key) as 1 | 2 | 3 | 4)
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        resetRankings()
      }

      // Arrow key navigation - use ref for stable reference
      const currentFocusedIndex = focusedIndexRef.current
      if (['ArrowLeft', 'ArrowRight'].includes(e.key) && currentFocusedIndex !== null) {
        e.preventDefault()
        const maxIndex = heatPilots.length - 1
        let newIndex = currentFocusedIndex
        
        if (e.key === 'ArrowLeft') {
          newIndex = currentFocusedIndex > 0 ? currentFocusedIndex - 1 : maxIndex
        } else if (e.key === 'ArrowRight') {
          newIndex = currentFocusedIndex < maxIndex ? currentFocusedIndex + 1 : 0
        }
        
        setFocusedIndex(newIndex)
        cardRefs.current[newIndex]?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [assignDirectRank, resetRankings, heatPilots.length]) // Removed focusedIndex - using ref instead

  // Get rank badge styling based on rank (uses centralized function)
  const getRankBadgeClass = (rank: number) => {
    // Remove text-void from the centralized function since we're adding it separately
    return getRankBadgeClasses(rank).replace(' text-void', '')
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

  return (
    <div ref={containerRef} data-testid="heat-container" className={`max-w-6xl mx-auto ${showSuccessPulse ? 'success-pulse' : ''}`}>
      {/* Heat Header - Beamer-optimiert */}
      <div className="text-center mb-8">
        <h1 className="font-display text-beamer-display md:text-7xl text-chrome tracking-wider mb-2">
          HEAT {heat.heatNumber}
        </h1>
        <p className="font-ui text-beamer-ui text-steel">
          Wähle die Platzierungen durch Klicken
        </p>
      </div>

      {/* Pilot Cards Grid - 4 columns on large screens */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {heatPilots.map((pilot, index) => {
          const rank = rankings.get(pilot.id)
          const hasRank = rank !== undefined

          return (
            <button
              key={pilot.id}
              ref={(el) => { cardRefs.current[index] = el }}
              data-pilot-id={pilot.id}
              aria-label={getAriaLabel(pilot, rank)}
              aria-pressed={hasRank}
              onClick={() => toggleRank(pilot.id)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              className={`
                relative bg-night text-center cursor-pointer
                border-[3px] rounded-[16px] p-6
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-4 focus:ring-neon-cyan/50
                hover:-translate-y-1
                ${hasRank 
                  ? getRankBorderClasses(rank!)
                  : 'border-steel hover:border-neon-cyan'
                }
              `}
            >
              {/* Rank Badge - Beamer-optimiert (min 32px) */}
              {hasRank && (
                <div className={`
                  absolute -top-3 -right-3 w-14 h-14 rounded-full
                  flex items-center justify-center font-display text-beamer-rank text-void
                  rank-badge-animate
                  ${getRankBadgeClass(rank)}
                `}>
                  {rank}
                </div>
              )}

              {/* Pilot Photo - 120px */}
              <div className="relative mb-4 mx-auto w-[120px] h-[120px]">
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-gradient-to-br from-neon-pink to-neon-magenta">
                  <img
                    src={pilot.imageUrl}
                    alt={pilot.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                    }}
                  />
                </div>
              </div>

              {/* Pilot Name - Beamer-optimiert (min 24px) */}
              <div className="font-display text-beamer-name font-bold text-chrome mb-1">
                {pilot.name}
              </div>

              {/* Instagram Handle - Beamer-optimiert (min 16px caption) */}
              {pilot.instagramHandle && (
                <div className="font-ui text-beamer-caption text-steel">
                  {pilot.instagramHandle}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Action Area */}
      <div className="flex flex-col items-center gap-4 mb-8">
        {/* Finish Button */}
        <button
          onClick={handleSubmit}
          disabled={!isFinishEnabled}
          className="btn-primary text-2xl px-12 py-5"
        >
          Fertig ✓
        </button>

        {/* Reset Link */}
        {rankings.size > 0 && (
          <button
            onClick={resetRankings}
            className="font-ui text-sm text-steel hover:text-neon-cyan transition-colors"
          >
            Zurücksetzen (Escape)
          </button>
        )}

        {/* Status Text - Beamer-optimiert (min 16px) */}
        <p className="font-ui text-beamer-caption text-steel">
          {rankings.size === 0 && 'Klicke auf einen Piloten für Rang 1'}
          {rankings.size === 1 && 'Mindestens 2 Ränge für Fertig'}
          {rankings.size >= 2 && rankings.size < heatPilots.length && `${rankings.size}/${heatPilots.length} Ränge vergeben`}
          {rankings.size === heatPilots.length && 'Alle Ränge vergeben!'}
        </p>
      </div>

      {/* On-Deck Preview */}
      {nextHeat && (
        <OnDeckPreview heat={nextHeat} pilots={pilots} />
      )}

      {/* Keyboard Shortcuts Help - Beamer-optimiert (min 16px) */}
      <div className="mt-8 text-center">
        <p className="font-ui text-beamer-caption text-steel/60">
          Shortcuts: Tab = Navigation | 1-4 = Direkter Rang | Escape = Reset
        </p>
      </div>
    </div>
  )
}
