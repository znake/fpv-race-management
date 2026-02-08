import { useState } from 'react'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import type { Heat } from '@/types'
import type { Pilot } from '@/lib/schemas'
import { useTournamentStore } from '@/stores/tournamentStore'
import { cn } from '@/lib/utils'
import { HeatCard } from './ui/heat-card'
import { Modal } from './ui/modal'

type HeatAssignmentViewProps = {
  heats: Heat[]
  pilots: Pilot[]
  onConfirm: () => void
  onCancel: () => void
}

export function HeatAssignmentView({ heats, pilots, onConfirm, onCancel }: HeatAssignmentViewProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const shuffleHeats = useTournamentStore((state) => state.shuffleHeats)
  const movePilotToHeat = useTournamentStore((state) => state.movePilotToHeat)

  // DnD sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  )

  // Calculate heat distribution summary
  const fourPlayerHeats = heats.filter(h => h.pilotIds.length === 4).length
  const threePlayerHeats = heats.filter(h => h.pilotIds.length === 3).length
  const totalPilots = heats.reduce((sum, h) => sum + h.pilotIds.length, 0)

  // Validation: check for invalid heats
  const hasOverfilledHeats = heats.some(h => h.pilotIds.length > 4)
  const hasEmptyHeats = heats.some(h => h.pilotIds.length === 0)
  const hasInvalidHeats = hasOverfilledHeats || hasEmptyHeats
  const overfilledHeatNumbers = heats.filter(h => h.pilotIds.length > 4).map(h => h.heatNumber)
  const emptyHeatNumbers = heats.filter(h => h.pilotIds.length === 0).map(h => h.heatNumber)

  // DnD handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const pilotId = active.id as string
    const targetHeatId = over.id as string
    movePilotToHeat(pilotId, targetHeatId)
  }

  const handleShuffle = () => {
    shuffleHeats()
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
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <button
          onClick={handleShuffle}
          className="bg-night border-2 border-neon-cyan text-neon-cyan px-6 py-3 rounded-lg font-semibold hover:bg-neon-cyan/10 transition-colors"
        >
          🔀 Neu mischen
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCancelDialog(true)}
            className="text-steel hover:text-chrome transition-colors px-6 py-3 font-ui"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            disabled={hasInvalidHeats}
            className={cn(
              "bg-neon-pink text-void px-8 py-4 rounded-xl font-bold text-lg transition-all",
              hasInvalidHeats
                ? "opacity-50 cursor-not-allowed"
                : "shadow-glow-pink hover:shadow-[0_0_30px_rgba(255,42,109,0.7)]"
            )}
          >
            Aufteilung bestätigen
          </button>
        </div>
      </div>

      {/* Validation Warnings */}
      {hasOverfilledHeats && (
        <div className="mb-6 p-4 rounded-xl border-2 bg-loser-red/10 border-loser-red text-loser-red">
          <p className="font-ui text-lg font-semibold">
            Heat {overfilledHeatNumbers.join(', ')} hat mehr als 4 Piloten. 
            Bitte Piloten verschieben, um das Turnier zu starten.
          </p>
        </div>
      )}
      {hasEmptyHeats && (
        <div className="mb-6 p-4 rounded-xl border-2 bg-gold/10 border-gold text-gold">
          <p className="font-ui text-lg font-semibold">
            Heat {emptyHeatNumbers.join(', ')} hat keine Piloten. 
            Bitte Piloten hinzufügen oder neu mischen.
          </p>
        </div>
      )}

      {/* Heat Grid with DnD */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {heats
            .slice()
            .sort((a, b) => a.heatNumber - b.heatNumber)
            .map((heat) => (
              <HeatCard
                key={heat.id}
                variant="overview"
                heatId={heat.id}
                heatNumber={heat.heatNumber}
                pilots={pilots}
                pilotIds={heat.pilotIds}
                results={heat.results}
                status={heat.status}
                invalidReason={heat.pilotIds.length > 4 ? 'overfilled' : heat.pilotIds.length === 0 ? 'empty' : null}
              />
            ))}
        </div>
      </DndContext>



      {/* Cancel Confirmation Dialog */}
      <Modal
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        title="Heat-Zuweisung abbrechen?"
        size="sm"
      >
        <p className="font-ui text-steel mb-6">
          Die aktuelle Heat-Aufteilung wird verworfen und du kannst wieder Piloten hinzufügen oder entfernen.
        </p>
        <Modal.Footer>
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
        </Modal.Footer>
      </Modal>
    </div>
  )
}
