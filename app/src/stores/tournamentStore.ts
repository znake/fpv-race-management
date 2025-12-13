import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Pilot } from '../lib/schemas'

interface TournamentState {
  pilots: Pilot[]
  tournamentStarted: boolean
  addPilot: (input: { name: string; imageUrl: string; instagramHandle?: string }) => boolean
  updatePilot: (id: string, updates: { name?: string; imageUrl?: string; instagramHandle?: string }) => boolean
  deletePilot: (id: string) => boolean
  markPilotAsDroppedOut: (id: string) => boolean
  startTournament: () => void
  clearAllPilots: () => boolean
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      pilots: [],
      tournamentStarted: false,
      
      addPilot: (input) => {
        const { pilots } = get()
        if (pilots.length >= 35) return false
        const lowerNames = pilots.map((p) => p.name.toLowerCase())
        if (lowerNames.includes(input.name.toLowerCase())) {
          alert('Pilot mit diesem Namen existiert bereits!')
          return false
        }
        const pilot: Pilot = {
          id: crypto.randomUUID(),
          ...input,
        }
        set({ pilots: [...pilots, pilot] })
        return true
      },

      updatePilot: (id, updates) => {
        const { pilots } = get()
        const pilotIndex = pilots.findIndex(p => p.id === id)
        if (pilotIndex === -1) return false

        // Check for duplicate names if name is being updated
        if (updates.name) {
          const otherPilotsWithSameName = pilots.filter((p) => 
            p.id !== id && p.name.toLowerCase() === updates.name!.toLowerCase()
          )
          if (otherPilotsWithSameName.length > 0) {
            alert('Pilot mit diesem Namen existiert bereits!')
            return false
          }
        }

        const updatedPilots = [...pilots]
        updatedPilots[pilotIndex] = { ...updatedPilots[pilotIndex], ...updates }
        set({ pilots: updatedPilots })
        return true
      },

      deletePilot: (id) => {
        const { pilots, tournamentStarted } = get()
        if (tournamentStarted) {
          alert('Piloten können nach Turnierstart nicht mehr gelöscht werden. Bitte als "ausgefallen" markieren.')
          return false
        }
        
        const pilotExists = pilots.some(p => p.id === id)
        if (!pilotExists) return false

        set({ pilots: pilots.filter(p => p.id !== id) })
        return true
      },

      markPilotAsDroppedOut: (id) => {
        const { pilots, tournamentStarted } = get()
        if (!tournamentStarted) {
          // Before tournament, just delete the pilot
          const confirmed = confirm('Möchten Sie diesen Piloten wirklich löschen?')
          if (!confirmed) return false
          
          set({ pilots: pilots.filter(p => p.id !== id) })
          return true
        }

        const pilotIndex = pilots.findIndex(p => p.id === id)
        if (pilotIndex === -1) return false

        const updatedPilots = [...pilots]
        updatedPilots[pilotIndex] = { 
          ...updatedPilots[pilotIndex], 
          droppedOut: true,
          status: 'withdrawn'
        }
        set({ pilots: updatedPilots })
        return true
      },

      startTournament: () => {
        set({ tournamentStarted: true })
      },

      clearAllPilots: () => {
        const { tournamentStarted } = get()
        if (tournamentStarted) {
          return false
        }
        set({ pilots: [], tournamentStarted: false })
        return true
      },
    }),
    {
      name: 'tournament-storage',
    }
  )
)