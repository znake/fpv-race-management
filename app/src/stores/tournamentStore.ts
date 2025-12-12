import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Pilot } from '../lib/schemas'

interface TournamentState {
  pilots: Pilot[]
  addPilot: (input: { name: string; imageUrl: string }) => boolean
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      pilots: [],
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
    }),
    {
      name: 'tournament-storage',
    }
  )
)