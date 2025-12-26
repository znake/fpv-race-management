import { useState } from 'react'
import type { Heat } from '../stores/tournamentStore'
import type { Pilot } from '../lib/schemas'
import { useTournamentStore } from '../stores/tournamentStore'
import { cn } from '../lib/utils'
import { HeatCard } from './heat-card'

type HeatAssignmentViewProps = {
  heats: Heat[]
  pilots: Pilot[]
  onConfirm: () => void
  onCancel: () => void
}

export function HeatAssignmentView({ heats, pilots, onConfirm, onCancel }: HeatAssignmentViewProps) {
  const [swapMode, setSwapMode] = useState(false)
  const [selectedPilotId, setSelectedPilotId] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  
  const shuffleHeats = useTournamentStore((state) => state.shuffleHeats)
  const swapPilots = useTournamentStore((state) => state.swapPilots)
  
  const pilotsById = new Map(pilots.map((p) => [p.id, p]))
  
  // Calculate heat distribution summary
  const fourPlayerHeats = heats.filter(h => h.pilotIds.length === 4).length
  const threePlayerHeats = heats.filter(h => h.pilotIds.length === 3).length
  const totalPilots = heats.reduce((sum, h) => sum + h.pilotIds.length, 0)
  
  const handlePilotClick = (pilotId: string, heatId: string) => {
    if (!swapMode) return
    
    if (!selectedPilotId) {
      // First pilot selected
      setSelectedPilotId(pilotId)
    } else {
      // Second pilot selected
      const selectedHeat = heats.find(h => h.pilotIds.includes(selectedPilotId))
      const clickedHeat = heats.find(h => h.id === heatId)
      
      if (selectedHeat?.id === clickedHeat?.id) {
        // Same heat - just switch selection
        setSelectedPilotId(pilotId)
      } else {
        // Different heats - perform swap
        swapPilots(selectedPilotId, pilotId)
        setSelectedPilotId(null)
        setSwapMode(false)
      }
    }
  }
  
  const handleCancelSwapMode = () => {
    setSwapMode(false)
    setSelectedPilotId(null)
  }
  
  const handleShuffle = () => {
    shuffleHeats()
    // Reset swap mode if active
    handleCancelSwapMode()
  }
  
  const handleConfirmCancel = () => {
    setShowCancelDialog(false)
    onCancel()
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-chrome mb-2">
          HEAT-AUFTEILUNG BESTÄTIGEN
        </h2>
        <p className="font-ui text-lg text-steel">
          {totalPilots} Piloten in {heats.length} Heats 
          <span className="text-chrome ml-2">
            ({fourPlayerHeats > 0 && `${fourPlayerHeats}× 4er`}
            {fourPlayerHeats > 0 && threePlayerHeats > 0 && ', '}
            {threePlayerHeats > 0 && `${threePlayerHeats}× 3er`})
          </span>
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={handleShuffle}
          className="bg-night border-2 border-neon-cyan text-neon-cyan px-6 py-3 rounded-lg font-semibold hover:bg-neon-cyan/10 transition-colors"
        >
          🔀 Neu mischen
        </button>
        
        {!swapMode ? (
          <button
            onClick={() => setSwapMode(true)}
            className="bg-night border-2 border-steel text-steel px-6 py-3 rounded-lg font-semibold hover:border-neon-pink hover:text-neon-pink transition-colors"
          >
            ↔️ Piloten tauschen
          </button>
        ) : (
          <button
            onClick={handleCancelSwapMode}
            className="bg-night border-2 border-loser-red text-loser-red px-6 py-3 rounded-lg font-semibold hover:bg-loser-red/10 transition-colors"
          >
            ✕ Tausch abbrechen
          </button>
        )}
      </div>
      
      {/* Swap Mode Hint */}
      {swapMode && (
        <div className={cn(
          "mb-6 p-4 rounded-xl border-2 text-center",
          selectedPilotId 
            ? "bg-neon-cyan/10 border-neon-cyan text-neon-cyan"
            : "bg-neon-pink/10 border-neon-pink text-neon-pink"
        )}>
          <p className="font-ui text-lg font-semibold">
            {selectedPilotId 
              ? "Wähle zweiten Piloten zum Tauschen"
              : "Wähle ersten Piloten zum Tauschen"}
          </p>
        </div>
      )}
      
      {/* Heat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {heats
          .slice()
          .sort((a, b) => a.heatNumber - b.heatNumber)
          .map((heat) => (
            <HeatCard
              key={heat.id}
              heat={heat}
              pilotsById={pilotsById}
              swapMode={swapMode}
              selectedPilotId={selectedPilotId}
              onPilotClick={handlePilotClick}
            />
          ))}
      </div>
      
      {/* Footer Actions */}
      <div className="flex justify-center gap-4 pt-6 border-t border-steel/30">
        <button
          onClick={() => setShowCancelDialog(true)}
          className="text-steel hover:text-chrome transition-colors px-6 py-3 font-ui"
        >
          Abbrechen
        </button>
        <button
          onClick={onConfirm}
          disabled={swapMode}
          className={cn(
            "bg-neon-pink text-void px-8 py-4 rounded-xl font-bold text-lg transition-all",
            swapMode 
              ? "opacity-50 cursor-not-allowed"
              : "shadow-glow-pink hover:shadow-[0_0_30px_rgba(255,42,109,0.7)]"
          )}
        >
          Aufteilung bestätigen
        </button>
      </div>
      
      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-void/80 flex items-center justify-center z-50">
          <div className="bg-night border-2 border-steel rounded-2xl p-6 max-w-md mx-4">
            <h3 className="font-display text-2xl font-bold text-chrome mb-4">
              Heat-Zuweisung abbrechen?
            </h3>
            <p className="font-ui text-steel mb-6">
              Die aktuelle Heat-Aufteilung wird verworfen und du kannst wieder Piloten hinzufügen oder entfernen.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 bg-night border border-steel text-steel rounded font-semibold hover:border-neon-cyan hover:text-neon-cyan transition-colors"
              >
                Zurück
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-loser-red text-white rounded font-bold hover:shadow-glow-red transition-all duration-200"
              >
                Ja, abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
