import { useState, useEffect, useCallback, useRef } from 'react'
import type { Heat } from '../types'
import type { Pilot } from '../lib/schemas'
import { Modal } from './ui/modal'
import { getRankBadgeClasses, getRankBorderClasses, FALLBACK_PILOT_IMAGE } from '../lib/ui-helpers'

type PlacementEntryModalProps = {
  heat: Heat
  pilots: Pilot[]
  isOpen: boolean
  onClose: () => void
  onSubmitResults: (heatId: string, rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]) => void
}

/**
 * Modal for entering placement results for a heat in the bracket view.
 * Reuses ranking logic from ActiveHeatView but in a compact modal format.
 * 
 * Features:
 * - Click-to-rank pilot cards
 * - Keyboard shortcuts (1-4 for direct rank, Escape to reset)
 * - Pre-fills existing rankings if heat.results exists
 * - Grid layout adapts to 3 or 4 pilots
 */
export function PlacementEntryModal({
  heat,
  pilots,
  isOpen,
  onClose,
  onSubmitResults
}: PlacementEntryModalProps) {
  // Local state for rankings during input
  const [rankings, setRankings] = useState<Map<string, number>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])
  
  // Ref for stable rankings.size in keyboard handler (prevents event listener churn)
  const rankingsSizeRef = useRef<number>(0)
  useEffect(() => {
    rankingsSizeRef.current = rankings.size
  }, [rankings.size])

  // Get pilots in this heat
  const heatPilots = heat.pilotIds
    .map((id) => pilots.find((p) => p.id === id))
    .filter(Boolean) as Pilot[]

  // Min rankings required: Math.min(2, pilotCount)
  const minRankingsRequired = Math.min(2, heatPilots.length)
  const isFinishEnabled = rankings.size >= minRankingsRequired

  // Initialize rankings from existing results (pre-fill for edit/reopen)
  useEffect(() => {
    if (isOpen && heat.results?.rankings) {
      const existingRankings = new Map<string, number>()
      heat.results.rankings.forEach((r) => {
        existingRankings.set(r.pilotId, r.rank)
      })
      setRankings(existingRankings)
    } else if (isOpen) {
      setRankings(new Map())
    }
  }, [isOpen, heat.id, heat.results])

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

  // Handle submit with double-click protection
  const handleSubmit = () => {
    if (!isFinishEnabled || isSubmitting) return

    setIsSubmitting(true)

    const rankingsArray = Array.from(rankings.entries())
      .map(([pilotId, rank]) => ({ pilotId, rank: rank as 1 | 2 | 3 | 4 }))
      .sort((a, b) => a.rank - b.rank)

    onSubmitResults(heat.id, rankingsArray)
    // onClose is called by parent after submit
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if focus is on a pilot card
      const focusedPilotId = document.activeElement?.getAttribute('data-pilot-id')

      if (focusedPilotId && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault()
        assignDirectRank(focusedPilotId, parseInt(e.key) as 1 | 2 | 3 | 4)
      }

      // Escape always resets rankings (no-op if empty)
      // Only stopPropagation when rankings exist to prevent modal close
      if (e.key === 'Escape') {
        if (rankingsSizeRef.current > 0) {
          e.preventDefault()
          e.stopPropagation()
        }
        resetRankings()
        // When no rankings, let event bubble to Modal for normal close
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, assignDirectRank, resetRankings]) // Removed rankings.size - using ref instead

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

  // Grid columns: always horizontal - 3 or 4 columns based on pilot count
  const gridCols = heatPilots.length === 3 ? 'grid-cols-3' : 'grid-cols-4'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      closeOnEscape={rankings.size === 0} // Only close on Escape if no rankings (otherwise reset)
      data-testid="placement-entry-modal"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="font-display text-5xl text-chrome tracking-wider mb-3">
          {getHeatName()}
        </h2>
        <p className="font-ui text-2xl text-steel">
          Klicke auf die Piloten um Platzierungen zu vergeben
        </p>
      </div>

      {/* Pilot Cards Grid */}
      <div className={`grid ${gridCols} gap-6 mb-8`}>
        {heatPilots.map((pilot, index) => {
          const rank = rankings.get(pilot.id)
          const hasRank = rank !== undefined

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
                border-2 rounded-xl p-6
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-neon-cyan/50
                hover:-translate-y-0.5
                ${hasRank 
                  ? getRankBorderClasses(rank!)
                  : 'border-steel hover:border-neon-cyan'
                }
              `}
            >
              {/* Rank Badge */}
              {hasRank && (
                <div className={`
                  absolute -top-4 -right-4 w-16 h-16 rounded-full
                  flex items-center justify-center font-display text-3xl text-void
                  rank-badge-animate
                  ${getRankBadgeClass(rank)}
                `}>
                  {rank}
                </div>
              )}

              {/* Pilot Photo - 220px (larger for beamer visibility) */}
              <div className="relative mb-6 mx-auto w-[220px] h-[220px]">
                <div className="w-[220px] h-[220px] rounded-full overflow-hidden bg-gradient-to-br from-neon-pink to-neon-magenta">
                  <img
                    src={pilot.imageUrl || FALLBACK_PILOT_IMAGE}
                    alt={pilot.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                    }}
                  />
                </div>
              </div>

              {/* Pilot Name */}
              <div className="font-display text-3xl font-bold text-chrome mb-2 truncate">
                {pilot.name}
              </div>

              {/* Instagram Handle */}
              {pilot.instagramHandle && (
                <div className="font-ui text-xl text-steel truncate">
                  {pilot.instagramHandle}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Action Area */}
      <div className="flex flex-col items-center gap-5 mt-10">
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isFinishEnabled || isSubmitting}
          data-testid="submit-placement-btn"
          className="btn-primary text-3xl px-16 py-5"
        >
          Fertig
        </button>

        {/* Reset Link */}
        {rankings.size > 0 && (
          <button
            onClick={resetRankings}
            data-testid="reset-rankings-btn"
            className="font-ui text-xl text-steel hover:text-neon-cyan transition-colors"
          >
            Zurücksetzen
          </button>
        )}

        {/* Status Text */}
        <p className="font-ui text-xl text-steel">
          {rankings.size === 0 && 'Klicke auf einen Piloten für Rang 1'}
          {rankings.size === 1 && minRankingsRequired === 2 && 'Mindestens 2 Ränge für Fertig'}
          {rankings.size >= minRankingsRequired && rankings.size < heatPilots.length && `${rankings.size}/${heatPilots.length} Ränge vergeben`}
          {rankings.size === heatPilots.length && 'Alle Ränge vergeben!'}
        </p>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-8 text-center">
        <p className="font-ui text-lg text-steel/60">
          1-4 = Direkter Rang | Escape = Reset
        </p>
      </div>
    </Modal>
  )
}
