import { useTournamentStore } from '../stores/tournamentStore'
import { pilotSchema, type PilotInput } from '../lib/schemas'

export function usePilots() {
  const pilots = useTournamentStore((state) => state.pilots)
  const addPilotToStore = useTournamentStore((state) => state.addPilot)

  const addPilot = (input: PilotInput) => {
    const result = pilotSchema.safeParse(input)
    if (!result.success) {
      console.error('Validierungsfehler:', result.error.errors)
      return false
    }
    return addPilotToStore(result.data)
  }

  return {
    pilots,
    addPilot,
  }
}