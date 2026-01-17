import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Pilot, Ranking } from '../lib/schemas'
import type { Heat, TournamentPhase } from '../types'
import { calculateHeatDistribution } from '../lib/heat-distribution'

// Re-export types for backward compatibility
export type { Heat, TournamentPhase }
import { shuffleArray } from '../lib/utils'
import {
  generateFullBracketStructure,
  type FullBracketStructure
} from '../lib/bracket-structure-generator'
import {
  syncQualiHeatsToStructure,
  rollbackBracketForHeat
} from '../lib/bracket-logic'

// Story 1.1: Initial State als wiederverwendbare Konstante
// Ermöglicht DRY Reset-Funktionen (Story 1.2)
export const INITIAL_TOURNAMENT_STATE = {
  pilots: [] as Pilot[],
  tournamentStarted: false,
  tournamentPhase: 'setup' as TournamentPhase,
  heats: [] as Heat[],
  currentHeatIndex: 0,
  winnerPilots: [] as string[],
  loserPilots: [] as string[],
  eliminatedPilots: [] as string[],
  loserPool: [] as string[],
  grandFinalePool: [] as string[],
  isQualificationComplete: false,
  isWBFinaleComplete: false,
  isLBFinaleComplete: false,
  isGrandFinaleComplete: false,
  fullBracketStructure: null as FullBracketStructure | null,
  lastCompletedBracketType: null as 'winner' | 'loser' | 'qualifier' | null,
  // Story 13-2: LB-Synchronisation States
  currentWBRound: 0,
  currentLBRound: 0,
  lbRoundWaitingForWB: false,
  // Story 13-3 + 13-4: Rematch und Grand Finale States
  pilotBracketStates: {} as Record<string, { bracket: string; roundReached: number; bracketOrigin: 'wb' | 'lb' }>,
  rematchHeats: [] as Heat[],
  grandFinaleRematchPending: false,
}

// Pilot interface export
export type { Pilot } from '../lib/schemas'

// Note: Heat interface is defined at the top of this file (before helper functions)
// to allow usage in createWBHeatFromPool and createLBHeatFromPool

// Story 1.5: Generische Pool Helper-Funktionen
// Eliminieren Code-Duplikation zwischen addToLoserPool/addToWinnerPool und removeFromLoserPool
// removeFromWinnerPool bleibt separat (nutzt count statt pilotIds)
const addToPool = (
  currentPool: string[],
  pilotIds: string[]
): string[] => {
  const existingIds = new Set(currentPool)
  const newPilots = pilotIds.filter(id => !existingIds.has(id))
  return newPilots.length > 0 ? [...currentPool, ...newPilots] : currentPool
}

const removeFromPoolByIds = (
  currentPool: string[],
  pilotIds: string[]
): string[] => {
  const idsToRemove = new Set(pilotIds)
  return currentPool.filter(id => !idsToRemove.has(id))
}

interface TournamentState {
  pilots: Pilot[]
  tournamentStarted: boolean
  tournamentPhase: TournamentPhase
  heats: Heat[]
  currentHeatIndex: number

  // Story 4-2: NEU für Dynamisches Bracket
  grandFinalePool: string[]   // WB-Finale-Gewinner + LB-Finale-Gewinner

  // Status-Flags (Story 4-2)
  isQualificationComplete: boolean
  isWBFinaleComplete: boolean
  isLBFinaleComplete: boolean
  isGrandFinaleComplete: boolean

  // Story 13-2: LB-Synchronisation States
  currentWBRound: number
  currentLBRound: number
  lbRoundWaitingForWB: boolean

  // Story 13-3 + 13-4: Rematch und Grand Finale States
  pilotBracketStates: Record<string, { bracket: string; roundReached: number; bracketOrigin: 'wb' | 'lb' }>
  rematchHeats: Heat[]
  grandFinaleRematchPending: boolean

  // Pilot management actions
  addPilot: (input: { name: string; imageUrl: string; instagramHandle?: string }) => boolean
  updatePilot: (id: string, updates: { name?: string; imageUrl?: string; instagramHandle?: string }) => boolean
  deletePilot: (id: string) => boolean
  markPilotAsDroppedOut: (id: string) => boolean
  clearAllPilots: () => boolean
  
   // Tournament actions
   startTournament: () => void
   confirmTournamentStart: () => boolean
   generateHeats: (seed?: number) => void
   resetTournament: () => void
   deleteAllPilots: () => void
   resetAll: () => void
   // Story 1.2: Interne Helper-Funktion für Reset-Logik
   performReset: (options?: { keepPilots?: boolean; clearLocalStorage?: boolean }) => void
  
  // Heat assignment actions (Story 3.3)
  shuffleHeats: (seed?: number) => void
  movePilotToHeat: (pilotId: string, targetHeatId: string) => void
  confirmHeatAssignment: () => void
  cancelHeatAssignment: () => void
  
   // Heat result actions (Story 4.1)
   submitHeatResults: (heatId: string, rankings: Ranking[]) => void
   getActiveHeat: () => Heat | undefined
   getNextHeat: () => Heat | undefined
  
  // Heat edit actions (Story 4.2)
  reopenHeat: (heatId: string) => void
  
  // Bracket state (Story 4.2)
  winnerPilots: string[]
  loserPilots: string[]
  eliminatedPilots: string[]
  
  // Story 9-1: Loser Pool State
  // Pool sammelt WB-Verlierer bis genug für LB-Heat vorhanden sind
  loserPool: string[]

  // Story 9-1: Loser Pool Actions
  addToLoserPool: (pilotIds: string[]) => void
  removeFromLoserPool: (pilotIds: string[]) => void
  eliminatePilots: (pilotIds: string[]) => void



  // NEW: Full bracket structure with 3 sections (Story 4.3 REDESIGN)
  fullBracketStructure: FullBracketStructure | null
  getFullBracketStructure: () => FullBracketStructure | null
  getPilotJourney: (pilotId: string) => Heat[]
  
  // Story 5.1: Finale & Siegerehrung
  getTop4Pilots: () => { 
    place1: Pilot | undefined
    place2: Pilot | undefined
    place3: Pilot | undefined
    place4: Pilot | undefined 
  } | null
  completeTournament: () => void
  
  // Story 9-2: Dynamic LB Heat Generation
  lastCompletedBracketType: 'winner' | 'loser' | 'qualifier' | null
  canGenerateLBHeat: () => boolean
  generateLBHeat: () => Heat | null
  getNextRecommendedHeat: () => Heat | null
  hasActiveWBHeats: () => boolean

  // Story 9-3: LB Finale & Grand Finale
  checkWBFinaleComplete: () => boolean  // Renamed from isWBFinaleComplete to avoid conflict with state flag
  checkForLBFinale: () => boolean
  generateLBFinale: () => Heat | null
  generateGrandFinale: () => Heat | null
  hasActiveLBHeats: () => boolean

  // Story 13-2: LB-Synchronisation Funktionen
  isRoundComplete: (bracketType: 'winner' | 'loser', roundNumber: number) => boolean
  generateLBRound: (roundNumber: number) => Heat[]

  // Story 13-4: Rematch Logik
  checkAndGenerateRematches: () => Heat[]

  // Story 13-5: Phase-Indikator
  getCurrentPhaseDescription: () => string
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      // Story 1.1: Spread der Initial-State-Konstante für DRY Code
      ...INITIAL_TOURNAMENT_STATE,

      addPilot: (input) => {
        const { pilots } = get()
        if (pilots.length >= 60) return false
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
        if (updates.name && updates.name.trim() !== '') {
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

      confirmTournamentStart: () => {
        const { pilots, generateHeats } = get()
        
        // Validation: 7-60 pilots required
        if (pilots.length < 7 || pilots.length > 60) {
          return false
        }
        
        // Generate heats (US-3.2)
        generateHeats()
        
        // Get generated heats
        const { heats } = get()
        
        // Generate full bracket structure (Story 4.3 REDESIGN)
        const activePilots = pilots.filter((p) => p.status !== 'withdrawn' && !p.droppedOut)
        const fullBracket = generateFullBracketStructure(activePilots.length)
        
        // TASK 8: Sync quali heats to bracket structure
        const syncedBracket = syncQualiHeatsToStructure(heats, fullBracket)
        
        // Set tournament status
        set({ 
          tournamentStarted: true,
          tournamentPhase: 'heat-assignment',  // NOT 'running' - user must confirm first
          fullBracketStructure: syncedBracket
        })
        
        return true
      },

      generateHeats: (seed) => {
        const { pilots } = get()

        const activePilots = pilots.filter((p) => p.status !== 'withdrawn' && !p.droppedOut)
        const { fourPlayerHeats, threePlayerHeats } = calculateHeatDistribution(activePilots.length)

        const shuffled = shuffleArray(activePilots, seed)

        const heats: Heat[] = []
        let cursor = 0
        let heatNumber = 1

        // Maximiere 4er-Heats zuerst
        for (let i = 0; i < fourPlayerHeats; i++) {
          const chunk = shuffled.slice(cursor, cursor + 4)
          cursor += 4

          heats.push({
            id: crypto.randomUUID(),
            heatNumber,
            pilotIds: chunk.map((p) => p.id),
            status: heatNumber === 1 ? 'active' : 'pending',
          })

          heatNumber++
        }

        for (let i = 0; i < threePlayerHeats; i++) {
          const chunk = shuffled.slice(cursor, cursor + 3)
          cursor += 3

          heats.push({
            id: crypto.randomUUID(),
            heatNumber,
            pilotIds: chunk.map((p) => p.id),
            status: heatNumber === 1 ? 'active' : 'pending',
          })

          heatNumber++
        }

        // Safety: muss exakt aufgehen
        if (cursor !== shuffled.length) {
          throw new Error(`Heat-Generierung inkonsistent: ${cursor}/${shuffled.length} Piloten zugewiesen`)
        }

        set({ heats, currentHeatIndex: 0 })
      },

      // Story 1.2: Interne Helper-Funktion für alle Reset-Operationen
      // Konsolidiert 4 nahezu identische Reset-Funktionen
      performReset: (options: {
        keepPilots?: boolean
        clearLocalStorage?: boolean
      } = {}) => {
        const { keepPilots = false, clearLocalStorage = false } = options

        // Klone INITIAL_TOURNAMENT_STATE für neue Array-Referenzen
        // Wichtig weil Tests Arrays direkt manipulieren könnten
        set({
          ...structuredClone(INITIAL_TOURNAMENT_STATE),
          pilots: keepPilots ? get().pilots : [],
        })

        if (clearLocalStorage) {
          localStorage.removeItem('tournament-storage')
        }
      },

      // Story 1.2: Öffentliche Reset-Actions (API-Kompatibilität)
      resetTournament: () => {
        const { performReset } = get()
        performReset({ keepPilots: true })
      },

      deleteAllPilots: () => {
        const { performReset } = get()
        performReset({ keepPilots: false })
      },

      resetAll: () => {
        const { performReset } = get()
        performReset({ keepPilots: false, clearLocalStorage: true })
      },

      // Story 3.3: Heat assignment actions
      shuffleHeats: (seed) => {
        const { heats } = get()
        
        // Get all active pilot IDs from current heats
        const allPilotIds = heats.flatMap(h => h.pilotIds)
        
        // Shuffle all pilot IDs
        const shuffledPilotIds = shuffleArray(allPilotIds, seed)
        
        // Redistribute to heats maintaining original heat sizes
        let pilotIndex = 0
        const newHeats = heats.map(heat => {
          const size = heat.pilotIds.length
          const newPilotIds = shuffledPilotIds.slice(pilotIndex, pilotIndex + size)
          pilotIndex += size
          return {
            ...heat,
            pilotIds: newPilotIds
          }
        })
        
        set({ heats: newHeats })
      },

      movePilotToHeat: (pilotId, targetHeatId) => {
        const { heats } = get()
        
        // Find source heat containing the pilot
        const sourceHeat = heats.find(h => h.pilotIds.includes(pilotId))
        // Find target heat by ID
        const targetHeat = heats.find(h => h.id === targetHeatId)
        
        // Guard: invalid IDs → silent return
        if (!sourceHeat || !targetHeat) return
        
        // Guard: same heat → no action
        if (sourceHeat.id === targetHeat.id) return
        
        // Create new heats array with pilot moved
        const newHeats = heats.map(heat => {
          if (heat.id === sourceHeat.id) {
            // Remove pilot from source heat
            return {
              ...heat,
              pilotIds: heat.pilotIds.filter(id => id !== pilotId)
            }
          }
          if (heat.id === targetHeat.id) {
            // Add pilot to target heat
            return {
              ...heat,
              pilotIds: [...heat.pilotIds, pilotId]
            }
          }
          return heat
        })
        
        set({ heats: newHeats })
      },

      confirmHeatAssignment: () => {
        const { heats } = get()
        
        // Activate first heat
        const updatedHeats = heats.map((heat, index) => ({
          ...heat,
          status: (index === 0 ? 'active' : 'pending') as Heat['status']
        }))
        
        set({ 
          heats: updatedHeats,
          tournamentPhase: 'running',
          currentHeatIndex: 0
        })
      },

      cancelHeatAssignment: () => {
        set({ 
          heats: [],
          tournamentPhase: 'setup',
          tournamentStarted: false,
          currentHeatIndex: 0
        })
      },

      // Story 1.2: Alias für deleteAllPilots (API-Kompatibilität)
      clearAllPilots: () => {
        const { performReset, tournamentStarted } = get()
        if (tournamentStarted) {
          return false
        }
        performReset({ keepPilots: false })
        return true
      },

      // Story 9-1: Loser Pool Actions
      addToLoserPool: (pilotIds) => {
        const { loserPool } = get()
        const newPool = addToPool(loserPool, pilotIds)
        if (newPool !== loserPool) {
          set({ loserPool: newPool })
        }
      },

      removeFromLoserPool: (pilotIds) => {
        set({ loserPool: removeFromPoolByIds(get().loserPool, pilotIds) })
      },

      eliminatePilots: (pilotIds) => {
        const { loserPool, eliminatedPilots } = get()
        const existingEliminated = new Set(eliminatedPilots)

        // Remove from loserPool using generic helper
        const newLoserPool = removeFromPoolByIds(loserPool, pilotIds)

        // Add to eliminatedPilots (avoiding duplicates)
        const newEliminated = pilotIds.filter(id => !existingEliminated.has(id))

        set({
          loserPool: newLoserPool,
          eliminatedPilots: [...eliminatedPilots, ...newEliminated]
        })
      },

      // =======================================================================
      // REFACTORED: 100% Dynamic Pool-Based Heat Generation (2025-12-27)
      // =======================================================================
      // 
      // ARCHITEKTUR:
      // - Quali-Heats: Statisch bei Turnierstart generiert
      // - WB-Heats: Dynamisch aus winnerPilots berechnet (wenn >= 4 Piloten, oder 2-3 für Finale)
      // - LB-Heats: Dynamisch aus loserPool (wenn >= 4 Piloten, oder 2-3 für Finale)
      // - Grand Finale: Automatisch wenn WB+LB Finale abgeschlossen
      //
      // KEINE Abhängigkeit mehr von fullBracketStructure für Heat-Generierung!
      // fullBracketStructure wird NUR noch für Visualisierung verwendet.
      // =======================================================================
      submitHeatResults: (heatId, rankings) => {
        const { heats, winnerPilots, loserPilots, eliminatedPilots, loserPool, rematchHeats, grandFinaleRematchPending } = get()

        const heatIndex = heats.findIndex(h => h.id === heatId)
        if (heatIndex === -1) return

        let updatedHeats = [...heats]
        const heat = updatedHeats[heatIndex]

        // Story 13-4: Check if this is a rematch heat
        const isRematch = heat.isRematch === true

        // Determine bracket type from heat itself or infer from ID
        let bracketType = heat.bracketType
        if (!bracketType) {
          // Infer from heat ID for backward compatibility with tests
          // WICHTIG: Reihenfolge beachten! wb-finale und lb-finale müssen vor allgemeinen checks kommen
          if (heat.id.startsWith('wb-finale-') || heat.id.startsWith('wb-heat-')) {
            bracketType = 'winner'
          } else if (heat.id.startsWith('lb-finale-') || heat.id.startsWith('lb-heat-')) {
            bracketType = 'loser'
          } else if (heat.id.startsWith('grand-finale-') || heat.id.includes('grand_finale')) {
            bracketType = 'grand_finale'
          } else if (heat.id.startsWith('wb-') || heat.id.includes('winner')) {
            bracketType = 'winner'
          } else if (heat.id.startsWith('lb-') || heat.id.includes('loser')) {
            bracketType = 'loser'
          } else if (heat.id.startsWith('finale-') || heat.id === 'finale') {
            // Legacy test compatibility: 'finale-1' etc. treated as grand finale
            bracketType = 'grand_finale'
          } else {
            bracketType = 'qualification'
          }
        }
        // WICHTIG: isGrandFinale nur für bracketType 'grand_finale' oder 'finale'
        // NICHT für heat.isFinale, da WB Finale und LB Finale auch isFinale=true haben!
        const isGrandFinale = bracketType === 'grand_finale' || bracketType === 'finale'


        // Mark heat as completed with results
        updatedHeats[heatIndex] = {
          ...heat,
          status: 'completed',
          results: {
            rankings,
            completedAt: new Date().toISOString()
          }
        }

        // Story 13-4: Handle Rematch completion
        let newRematchHeats = [...rematchHeats]
        let newGrandFinaleRematchPending = grandFinaleRematchPending
        if (isRematch) {
          // Update the rematch in the rematchHeats array
          const rematchIndex = newRematchHeats.findIndex(r => r.id === heatId)
          if (rematchIndex !== -1) {
            newRematchHeats[rematchIndex] = updatedHeats[heatIndex]
          }

          // Check if all rematches are completed
          const allRematchesCompleted = newRematchHeats.every(r => r.status === 'completed')
          if (allRematchesCompleted) {
            newGrandFinaleRematchPending = false
          }
        }
        
        // Initialize tracking sets
        const newWinnerPilots = new Set(winnerPilots)
        const newLoserPilots = new Set(loserPilots)
        const newEliminatedPilots = new Set(eliminatedPilots)
        let newLoserPool = new Set(loserPool)
        
        // Story 13-6: winnerPool wird dynamisch berechnet statt persistiert
        // Verfügbare WB-Piloten = winnerPilots MINUS Piloten in pending/active WB-Heats
        const pilotsInPendingWBHeats = new Set(
          updatedHeats
            .filter(h => h.bracketType === 'winner' && (h.status === 'pending' || h.status === 'active'))
            .flatMap(h => h.pilotIds)
        )
        let newWinnerPool = new Set(
          Array.from(newWinnerPilots).filter(p => !pilotsInPendingWBHeats.has(p))
        )
        
        // Handle re-submission: remove old assignments
        if (heat.results) {
          for (const oldRanking of heat.results.rankings) {
            newWinnerPilots.delete(oldRanking.pilotId)
            newLoserPilots.delete(oldRanking.pilotId)
            newEliminatedPilots.delete(oldRanking.pilotId)
            newWinnerPool.delete(oldRanking.pilotId)
            newLoserPool.delete(oldRanking.pilotId)
          }
        }
        
        let newPhase: TournamentPhase = 'running'
        let newIsQualificationComplete = get().isQualificationComplete
        
        // ===== PROCESS RANKINGS BASED ON BRACKET TYPE =====
        
        if (isGrandFinale) {
          // GRAND FINALE COMPLETED
          newPhase = 'completed'
          
        } else if (bracketType === 'qualification') {
          // QUALIFICATION HEAT
          for (const ranking of rankings) {
            if (ranking.rank === 1 || ranking.rank === 2) {
              // Winners → winnerPool für WB
              newWinnerPilots.add(ranking.pilotId)
              newWinnerPool.add(ranking.pilotId)
            } else {
              // Losers (rank 3+4) → loserPool für LB
              newLoserPilots.add(ranking.pilotId)
              newLoserPool.add(ranking.pilotId)
            }
          }
          
          // Check if all quali heats are completed
          const qualiHeats = updatedHeats.filter(h => !h.bracketType || h.bracketType === 'qualification')
          const allQualiCompleted = qualiHeats.every(h => h.status === 'completed')
          
          if (allQualiCompleted) {
            newIsQualificationComplete = true
          }
          
        } else if (bracketType === 'winner') {
          // WINNER BRACKET HEAT
          for (const ranking of rankings) {
            if (ranking.rank === 1 || ranking.rank === 2) {
              // WB Winners → bleiben in winnerPool
              newWinnerPilots.add(ranking.pilotId)
              newWinnerPool.add(ranking.pilotId)
            } else {
              // WB Losers (rank 3+4) → fallen in loserPool
              newWinnerPilots.delete(ranking.pilotId)
              newLoserPilots.add(ranking.pilotId)
              newLoserPool.add(ranking.pilotId)
            }
          }
          
        } else if (bracketType === 'loser') {
          // LOSER BRACKET HEAT
          for (const ranking of rankings) {
            if (ranking.rank === 1 || ranking.rank === 2) {
              // LB Winners → bleiben in loserPool
              newLoserPilots.add(ranking.pilotId)
              newLoserPool.add(ranking.pilotId)
            } else {
              // LB Losers (rank 3+4) → ELIMINIERT
              newLoserPilots.delete(ranking.pilotId)
              newLoserPool.delete(ranking.pilotId)
              newEliminatedPilots.add(ranking.pilotId)
            }
          }
        }
        
        // ===== DYNAMIC HEAT GENERATION =====
        
        // Check current state of brackets
        const pendingWBHeats = updatedHeats.filter(h => h.bracketType === 'winner' && h.status === 'pending')
        const activeWBHeats = updatedHeats.filter(h => h.bracketType === 'winner' && h.status === 'active')
        
        // WB Finale Detection: winnerPool has 2-3 pilots and no pending/active WB heats
        const wbFinaleExists = updatedHeats.some(h => h.bracketType === 'winner' && h.isFinale)
        const canGenerateWBFinale = !wbFinaleExists && 
                                    newWinnerPool.size >= 2 && 
                                    newWinnerPool.size <= 3 &&
                                    pendingWBHeats.length === 0 &&
                                    activeWBHeats.length === 0 &&
                                    newIsQualificationComplete
        
        // Generate WB Heat from pool (regular 4er heat)
        // IMPORTANT: Only generate after all quali heats are completed
        if (newIsQualificationComplete && newWinnerPool.size >= 4) {
          const pilots = Array.from(newWinnerPool).slice(0, 4)
          const wbHeat: Heat = {
            id: `wb-heat-${crypto.randomUUID()}`,
            heatNumber: updatedHeats.length + 1,
            pilotIds: pilots,
            status: 'pending',
            bracketType: 'winner'
          }
          updatedHeats = [...updatedHeats, wbHeat]
          pilots.forEach(p => newWinnerPool.delete(p))
        } else if (canGenerateWBFinale) {
          // Generate WB Finale (2-3 pilots)
          const pilots = Array.from(newWinnerPool)
          const wbFinale: Heat = {
            id: `wb-finale-${crypto.randomUUID()}`,
            heatNumber: updatedHeats.length + 1,
            pilotIds: pilots,
            status: 'pending',
            bracketType: 'winner',
            isFinale: true,
            roundName: 'WB Finale'
          }
          updatedHeats = [...updatedHeats, wbFinale]
          newWinnerPool.clear()
        }
        
        // LB Heat Generation Logic
        // - Während WB aktiv: Nur 4er-Heats
        // - Nach WB Finale: Auch 2-3er-Heats erlaubt für LB Finale
        const wbFinaleCompleted = updatedHeats.some(h => h.bracketType === 'winner' && h.isFinale && h.status === 'completed')
        const lbFinaleExists = updatedHeats.some(h => h.bracketType === 'loser' && h.isFinale)
        
        if (newLoserPool.size >= 4) {
          // Regular LB Heat (4 pilots)
          const pilots = Array.from(newLoserPool).slice(0, 4)
          const lbHeat: Heat = {
            id: `lb-heat-${crypto.randomUUID()}`,
            heatNumber: updatedHeats.length + 1,
            pilotIds: pilots,
            status: 'pending',
            bracketType: 'loser'
          }
          updatedHeats = [...updatedHeats, lbHeat]
          pilots.forEach(p => newLoserPool.delete(p))
        } else if (wbFinaleCompleted && !lbFinaleExists && newLoserPool.size >= 2 && newLoserPool.size <= 3) {
          // LB Finale (2-3 pilots, nur nach WB Finale)
          const pilots = Array.from(newLoserPool)
          const lbFinale: Heat = {
            id: `lb-finale-${crypto.randomUUID()}`,
            heatNumber: updatedHeats.length + 1,
            pilotIds: pilots,
            status: 'pending',
            bracketType: 'loser',
            isFinale: true,
            roundName: 'LB Finale'
          }
          updatedHeats = [...updatedHeats, lbFinale]
          newLoserPool.clear()
        }
        
        // Grand Finale Generation - Story 13-7: 4 Piloten
        // Bedingung: WB Finale UND LB Finale sind beide completed
        const wbFinaleHeat = updatedHeats.find(h => h.bracketType === 'winner' && h.isFinale)
        const lbFinaleHeat = updatedHeats.find(h => h.bracketType === 'loser' && h.isFinale)
        const grandFinaleExists = updatedHeats.some(h => h.bracketType === 'grand_finale' || h.bracketType === 'finale')
        
        // Story 13-7: Variable für pilotBracketStates Updates
        let newPilotBracketStates = { ...get().pilotBracketStates }
        
        if (!grandFinaleExists && 
            wbFinaleHeat?.status === 'completed' && 
            lbFinaleHeat?.status === 'completed') {
          // Story 13-7: Get TOP 2 from WB Finale (nicht nur Rang 1!)
          const wbRank1 = wbFinaleHeat.results?.rankings.find(r => r.rank === 1)?.pilotId
          const wbRank2 = wbFinaleHeat.results?.rankings.find(r => r.rank === 2)?.pilotId
          
          // Story 13-7: Get TOP 2 from LB Finale (nicht nur Rang 1!)
          const lbRank1 = lbFinaleHeat.results?.rankings.find(r => r.rank === 1)?.pilotId
          const lbRank2 = lbFinaleHeat.results?.rankings.find(r => r.rank === 2)?.pilotId
          
          // Story 13-7: Validate all 4 pilots exist and are unique (Duplikat-Validierung)
          const gfPilots = [wbRank1, wbRank2, lbRank1, lbRank2].filter(Boolean) as string[]
          const uniquePilots = [...new Set(gfPilots)]
          
          if (uniquePilots.length === 4) {
            // Story 13-7: Set bracketOrigin for WB/LB tags
            newPilotBracketStates[wbRank1!] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
            newPilotBracketStates[wbRank2!] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
            newPilotBracketStates[lbRank1!] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' }
            newPilotBracketStates[lbRank2!] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' }
            
            const grandFinale: Heat = {
              id: `grand-finale-${crypto.randomUUID()}`,
              heatNumber: updatedHeats.length + 1,
              pilotIds: [wbRank1!, wbRank2!, lbRank1!, lbRank2!],  // 4 Piloten!
              status: 'pending',
              bracketType: 'grand_finale',
              isFinale: true,
              roundName: 'Grand Finale'
            }
            updatedHeats = [...updatedHeats, grandFinale]
            newPhase = 'finale'
          }
        }
        
        // ===== ACTIVATE NEXT HEAT =====
        
        const hasActiveHeat = updatedHeats.some(h => h.status === 'active')
        if (!hasActiveHeat) {
          const nextPendingIndex = updatedHeats.findIndex(h => h.status === 'pending')
          if (nextPendingIndex !== -1) {
            updatedHeats[nextPendingIndex] = {
              ...updatedHeats[nextPendingIndex],
              status: 'active'
            }
          }
        }
        
        // Determine current heat index
        const activeHeatIndex = updatedHeats.findIndex(h => h.status === 'active')
        const newCurrentHeatIndex = activeHeatIndex !== -1 ? activeHeatIndex : heatIndex
        
        // Check if tournament should end (no more heats to play, no pilots in pools)
        // WICHTIG: Turnier ist nur completed wenn:
        // 1. Alle Heats completed sind (keine active oder pending)
        // 2. ODER: Grand Finale wurde gerade completed (isGrandFinale check oben)
        const allCompleted = updatedHeats.every(h => h.status === 'completed')
        const hasActiveHeats = updatedHeats.some(h => h.status === 'active')
        const hasPendingHeats = updatedHeats.some(h => h.status === 'pending')
        
        // Nur completed wenn WIRKLICH alle Heats durch sind und keine Piloten mehr warten
        // UND kein Grand Finale generiert werden kann (das passiert erst wenn LB Finale fertig ist)
        if (allCompleted && !hasActiveHeats && !hasPendingHeats && newWinnerPool.size === 0 && newLoserPool.size === 0) {
          // Zusätzliche Prüfung: Wurde ein Grand Finale gespielt?
          const grandFinaleCompleted = updatedHeats.some(h => 
            (h.bracketType === 'grand_finale' || h.bracketType === 'finale') && h.status === 'completed'
          )
          if (grandFinaleCompleted) {
            newPhase = 'completed'
          }
          // Wenn kein Grand Finale completed wurde, bleibt die Phase 'running' oder 'finale'
        }
        
        // Track last completed bracket type
        let completedBracketType: 'winner' | 'loser' | 'qualifier' | null = null
        if (bracketType === 'qualification') completedBracketType = 'qualifier'
        else if (bracketType === 'winner') completedBracketType = 'winner'
        else if (bracketType === 'loser') completedBracketType = 'loser'
        
        set({
          heats: updatedHeats,
          currentHeatIndex: newCurrentHeatIndex,
          tournamentPhase: newPhase,
          winnerPilots: Array.from(newWinnerPilots),
          loserPilots: Array.from(newLoserPilots),
          eliminatedPilots: Array.from(newEliminatedPilots),
          loserPool: Array.from(newLoserPool),
          isQualificationComplete: newIsQualificationComplete,
          lastCompletedBracketType: completedBracketType,
          grandFinaleRematchPending: newGrandFinaleRematchPending,
          rematchHeats: newRematchHeats,
          pilotBracketStates: newPilotBracketStates  // Story 13-7: pilotBracketStates mit bracketOrigin
          // NOTE: fullBracketStructure wird NICHT mehr aktualisiert - nur für Visualisierung
          // NOTE: winnerPool wird nicht mehr persistiert - wird dynamisch aus winnerPilots berechnet
        })
      },

      getActiveHeat: () => {
        const { heats } = get()
        return heats.find(h => h.status === 'active')
      },

      getNextHeat: () => {
        const { heats, currentHeatIndex } = get()
        // Find next pending heat after current
        return heats.find((h, i) => i > currentHeatIndex && h.status === 'pending')
      },

      // Story 4.2: Reopen completed heat for editing
      // Task 17-18: Edit-Mode with Pool Rollback
      reopenHeat: (heatId) => {
        const { heats, fullBracketStructure, winnerPilots, loserPilots, eliminatedPilots, loserPool } = get()
        
        const heatIndex = heats.findIndex(h => h.id === heatId)
        if (heatIndex === -1) return
        
        // Only completed heats can be reopened
        if (heats[heatIndex].status !== 'completed') return
        
        const heat = heats[heatIndex]
        const updatedHeats = [...heats]
        
        // Deactivate any currently active heat
        const activeHeatIndex = updatedHeats.findIndex(h => h.status === 'active')
        if (activeHeatIndex !== -1) {
          updatedHeats[activeHeatIndex] = {
            ...updatedHeats[activeHeatIndex],
            status: 'pending'
          }
        }
        
        // Reopen the target heat (keep results for pre-fill)
        updatedHeats[heatIndex] = {
          ...updatedHeats[heatIndex],
          status: 'active'
        }
        
        // ROLLBACK: Remove pilots from winner/loser/eliminated based on old results
        const newWinnerPilots = new Set(winnerPilots)
        const newLoserPilots = new Set(loserPilots)
        const newEliminatedPilots = new Set(eliminatedPilots)
        
        // Task 18: ROLLBACK loserPool - Remove pilots from pools that came from this heat
        // NOTE: winnerPool wird nicht mehr persistiert - wird dynamisch aus winnerPilots berechnet
        const newLoserPool = new Set(loserPool)
        
        // Remove all pilots from this heat from bracket tracking AND pools
        if (heat.results) {
          for (const ranking of heat.results.rankings) {
            // Remove from bracket tracking
            newWinnerPilots.delete(ranking.pilotId)
            newLoserPilots.delete(ranking.pilotId)
            newEliminatedPilots.delete(ranking.pilotId)
            
            // Remove from loser pool
            newLoserPool.delete(ranking.pilotId)
          }
        }
        
        // ROLLBACK: Update bracket structure to remove pilots from WB/LB heats
        let updatedBracketStructure = fullBracketStructure
        if (fullBracketStructure) {
          updatedBracketStructure = rollbackBracketForHeat(heatId, fullBracketStructure)
        }
        
        set({ 
          heats: updatedHeats,
          currentHeatIndex: heatIndex,
          tournamentPhase: 'running',
          winnerPilots: Array.from(newWinnerPilots),
          loserPilots: Array.from(newLoserPilots),
          eliminatedPilots: Array.from(newEliminatedPilots),
          loserPool: Array.from(newLoserPool),
          fullBracketStructure: updatedBracketStructure
        })
      },

      // Story 4.3 REDESIGN: Full bracket structure with 3 sections
      getFullBracketStructure: () => {
        const { fullBracketStructure } = get()
        return fullBracketStructure
      },

      getPilotJourney: (pilotId: string) => {
        const { heats } = get()
        return heats.filter(heat => 
          heat.pilotIds.includes(pilotId) && heat.status === 'completed'
        )
      },

      // Story 5.1: Get Top 4 pilots after tournament completion
      //
      // Double Elimination Placement Logic:
      // - 1st Place: Grand Finale Winner (oder Rematch-Gewinner für Platz 1)
      // - 2nd Place: Grand Finale Loser (oder Rematch-Gewinner für Platz 2)
      // - 3rd Place: LB Finale Loser (oder Rematch-Verlierer für Platz 1)
      // - 4th Place: LB Finale Verlierer (oder Rematch-Verlierer für Platz 2)
      //
      // Story 13-3 + 13-4: Berücksichtigt Rematches und 4-Piloten Grand Finale
      getTop4Pilots: () => {
        const { pilots, heats, rematchHeats, grandFinaleRematchPending } = get()

        // Wenn Rematches pending, return null
        if (grandFinaleRematchPending) {
          // Prüfe ob alle Rematches completed sind
          const allRematchesCompleted = rematchHeats.every(h => h.status === 'completed')
          if (!allRematchesCompleted) {
            return null
          }
        }

        // Find Grand Finale heat
        const grandFinaleHeat = heats.find(h =>
          h.bracketType === 'grand_finale' ||
          h.bracketType === 'finale' ||
          h.id.includes('grand-finale')
        )

        if (!grandFinaleHeat?.results) return null

        // Prüfe ob Rematches existieren
        const hasRematches = rematchHeats.length > 0

        // Prüfe ob 4-Piloten oder 2-Piloten Grand Finale
        const is4PilotGF = grandFinaleHeat.pilotIds.length === 4

        if (is4PilotGF && !hasRematches) {
          // Story 13-3: Grand Finale mit 4 Piloten - Platzierungen direkt aus GF Rankings
          // KEINE Rematches vorhanden
          const place1Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 1)
          const place2Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 2)
          const place3Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 3)
          const place4Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 4)

          return {
            place1: pilots.find(p => p.id === place1Ranking?.pilotId),
            place2: pilots.find(p => p.id === place2Ranking?.pilotId),
            place3: pilots.find(p => p.id === place3Ranking?.pilotId),
            place4: pilots.find(p => p.id === place4Ranking?.pilotId),
          }
        }

        // 2-Piloten Grand Finale mit Rematches (ODER 4-Piloten GF mit Rematches)
        const place1Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 1)
        const place2Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 2)
        const place3Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 3)
        const place4Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 4)

        // Prüfe Rematches und aktualisiere Platzierungen
        let place1Id = place1Ranking?.pilotId
        let place2Id = place2Ranking?.pilotId
        let place3Id = place3Ranking?.pilotId
        let place4Id = place4Ranking?.pilotId

        for (const rematch of rematchHeats) {
          if (!rematch.results || !rematch.rematchForPlace) continue

          const winner = rematch.results.rankings.find(r => r.rank === 1)?.pilotId
          const loser = rematch.results.rankings.find(r => r.rank === 2)?.pilotId

          if (!winner || !loser) continue

          if (rematch.rematchForPlace === 1) {
            // Rematch für Platz 1: Gewinner wird Platz 1, Verlierer wird Platz 3
            place1Id = winner
            place3Id = loser
          } else if (rematch.rematchForPlace === 2) {
            // Rematch für Platz 2: Gewinner wird Platz 2, Verlierer wird Platz 4
            place2Id = winner
            place4Id = loser
          }
        }

        return {
          place1: pilots.find(p => p.id === place1Id),
          place2: pilots.find(p => p.id === place2Id),
          place3: pilots.find(p => p.id === place3Id),
          place4: pilots.find(p => p.id === place4Id),
        }
      },

      // Story 5.1: Mark tournament as completed
      completeTournament: () => {
        const { fullBracketStructure } = get()
        
        // Update grand finale status if exists
        let updatedBracket = fullBracketStructure
        if (fullBracketStructure?.grandFinale) {
          updatedBracket = structuredClone(fullBracketStructure)
          updatedBracket!.grandFinale!.status = 'completed'
        }
        
        set({
          tournamentPhase: 'completed',
          fullBracketStructure: updatedBracket
        })
      },

      // Story 9-2: Check if there are pending/active WB heats
      // REFACTORED: Now uses heats[] directly instead of fullBracketStructure
      hasActiveWBHeats: () => {
        const { heats } = get()
        return heats.some(h => 
          h.bracketType === 'winner' && 
          (h.status === 'pending' || h.status === 'active')
        )
      },

      // Story 9-3: LB Finale & Grand Finale

      // Check if WB Finale is completed
      checkWBFinaleComplete: () => {
        const { fullBracketStructure, heats } = get()
        if (!fullBracketStructure) return false

        // Get WB Finale (last round in WB bracket)
        const wbRounds = fullBracketStructure.winnerBracket.rounds
        if (wbRounds.length === 0) return false

        const wbFinaleRound = wbRounds[wbRounds.length - 1]

        // Check if all heats in WB Finale round are completed
        for (const bracketHeat of wbFinaleRound.heats) {
          const actualHeat = heats.find(h => h.id === bracketHeat.id)
          // Only check heats with pilots assigned (not empty placeholders)
          if (bracketHeat.pilotIds.length > 0) {
            if (!actualHeat || actualHeat.status !== 'completed') {
              return false
            }
          }
        }

        return true
      },

      // Check if there are pending/active LB heats
      hasActiveLBHeats: () => {
        const { heats } = get()
        // Check all heats that are explicitly LB finale heats
        const lbFinaleHeats = heats.filter(h =>
          h.bracketType === 'loser' && h.isFinale === true
        )

        // Check if any LB finale heat is pending or active
        return lbFinaleHeats.some(h => h.status === 'pending' || h.status === 'active')
      },

      // Check if LB Finale can be generated
      checkForLBFinale: () => {
        const { checkWBFinaleComplete, loserPool, hasActiveLBHeats } = get()

        // LB Finale wenn:
        // 1. WB Finale ist abgeschlossen
        // 2. Pool hat noch Piloten (1-4)
        // 3. Kein weiterer LB-Heat (nicht finale) läuft
        return checkWBFinaleComplete() &&
               loserPool.length >= 1 &&
               loserPool.length <= 4 &&
               !hasActiveLBHeats()
      },

      // Generate LB Finale with variable pilot count (1-4)
      generateLBFinale: () => {
        const { checkForLBFinale, loserPool, heats, removeFromLoserPool } = get()

        if (!checkForLBFinale()) {
          return null
        }

        // Take all remaining pool pilots (1-4)
        const pilotsForFinale = [...loserPool]

        // Remove from pool
        removeFromLoserPool(pilotsForFinale)

        // Create LB Finale heat
        const lbFinale: Heat = {
          id: crypto.randomUUID(),
          heatNumber: heats.length + 1,
          pilotIds: pilotsForFinale,
          status: 'pending',
          bracketType: 'loser',
          isFinale: true,
          roundName: 'LB Finale'
        }

        // Add to heats array
        set({ heats: [...heats, lbFinale] })

        return lbFinale
      },

      // Generate Grand Finale (4 pilots: WB Platz 1+2 + LB Platz 1+2)
      // Story 13-3: Grand Finale mit 4 Piloten
      generateGrandFinale: () => {
        const { heats } = get()

        // Find WB and LB Finale heats
        const wbFinaleHeat = heats.find(h => h.bracketType === 'winner' && h.isFinale && h.status === 'completed')
        const lbFinaleHeat = heats.find(h => h.bracketType === 'loser' && h.isFinale && h.status === 'completed')

        if (!wbFinaleHeat?.results || !lbFinaleHeat?.results) return null

        // Get Platz 1+2 from WB Finale
        const wbPlace1 = wbFinaleHeat.results.rankings.find(r => r.rank === 1)?.pilotId
        const wbPlace2 = wbFinaleHeat.results.rankings.find(r => r.rank === 2)?.pilotId

        // Get Platz 1+2 from LB Finale
        const lbPlace1 = lbFinaleHeat.results.rankings.find(r => r.rank === 1)?.pilotId
        const lbPlace2 = lbFinaleHeat.results.rankings.find(r => r.rank === 2)?.pilotId

        if (!wbPlace1 || !wbPlace2 || !lbPlace1 || !lbPlace2) return null

        // Check if Grand Finale already exists
        if (heats.some(h => h.bracketType === 'grand_finale')) return null

        // Update pilotBracketStates with bracketOrigin
        const newPilotBracketStates: Record<string, { bracket: string; roundReached: number; bracketOrigin: 'wb' | 'lb' }> = {}
        newPilotBracketStates[wbPlace1] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
        newPilotBracketStates[wbPlace2] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'wb' }
        newPilotBracketStates[lbPlace1] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' }
        newPilotBracketStates[lbPlace2] = { bracket: 'grand_finale', roundReached: 0, bracketOrigin: 'lb' }

        // Reihenfolge: WB1, WB2, LB1, LB2
        const finaleHeat: Heat = {
          id: `grand-finale-${crypto.randomUUID()}`,
          heatNumber: heats.length + 1,
          pilotIds: [wbPlace1, wbPlace2, lbPlace1, lbPlace2],
          status: 'active',
          bracketType: 'grand_finale',
          isFinale: true,
          roundName: 'Grand Finale'
        }

        set({
          heats: [...heats, finaleHeat],
          pilotBracketStates: { ...get().pilotBracketStates, ...newPilotBracketStates },
          tournamentPhase: 'finale'
        })

        return finaleHeat
      },

      // Story 9-2: Check if LB heat can be generated (AC1, AC5)
      canGenerateLBHeat: () => {
        const { loserPool, hasActiveWBHeats } = get()
        const poolSize = loserPool.length
        
        if (poolSize === 0) return false
        
        const isWBActive = hasActiveWBHeats()
        
        if (isWBActive) {
          // Während WB aktiv: Warte auf volle 4er-Heats
          return poolSize >= 4
        } else {
          // Nach WB: Auch 3er-Heats erlaubt
          return poolSize >= 3
        }
      },

      // Story 9-2: Generate LB heat from pool (AC1, AC2)
      // AC 4: FIFO - erste 4 Piloten aus Pool nehmen (keine Zufallsauswahl)
      generateLBHeat: () => {
        const { loserPool, heats, canGenerateLBHeat, hasActiveWBHeats, removeFromLoserPool } = get()
        
        if (!canGenerateLBHeat()) {
          return null
        }
        
        const isWBActive = hasActiveWBHeats()
        const heatSize = isWBActive ? 4 : Math.min(4, loserPool.length)
        
        // AC 4: FIFO - erste N Piloten aus Pool nehmen (keine Zufallsauswahl)
        const pilotsForHeat = loserPool.slice(0, heatSize)
        
        // Remove from pool
        removeFromLoserPool(pilotsForHeat)
        
        // Create new heat
        const newHeat: Heat = {
          id: `lb-heat-${crypto.randomUUID()}`,
          heatNumber: heats.length + 1,
          pilotIds: pilotsForHeat,
          status: 'pending',
          bracketType: 'loser',
        }
        
        // Add to heats array
        set({ heats: [...heats, newHeat] })
        
        return newHeat
      },

      // Story 13-5: Get next recommended heat with WB/LB alternation
      // AC7: Automatische Abwechslung WB/LB - nach WB empfehle LB, nach LB empfehle WB
      // AC1: WB wird vor LB priorisiert wenn lastCompletedBracketType null ist
      getNextRecommendedHeat: () => {
        const { heats, isQualificationComplete, lastCompletedBracketType } = get()

        // 1. Quali Phase - priorisiere Quali-Heats
        if (!isQualificationComplete) {
          const pendingQuali = heats.find(h =>
            (!h.bracketType || h.bracketType === 'qualification') &&
            h.status === 'pending'
          )
          if (pendingQuali) return pendingQuali
        }

        // 2. Grand Finale - höchste Priorität wenn verfügbar
        const pendingGrandFinale = heats.find(h =>
          (h.bracketType === 'grand_finale' || h.bracketType === 'finale') &&
          h.status === 'pending'
        )
        if (pendingGrandFinale) return pendingGrandFinale

        // 3. Sammle alle pending WB und LB Heats
        const pendingWB = heats.filter(h =>
          h.status === 'pending' &&
          (h.bracketType === 'winner' || h.id.startsWith('wb-'))
        )

        const pendingLB = heats.filter(h =>
          h.status === 'pending' &&
          (h.bracketType === 'loser' || h.id.startsWith('lb-'))
        )

        // Keine Heats mehr
        if (pendingWB.length === 0 && pendingLB.length === 0) return null

        // Nur WB Heats verfügbar
        if (pendingLB.length === 0) return pendingWB[0] ?? null

        // Nur LB Heats verfügbar
        if (pendingWB.length === 0) return pendingLB[0] ?? null

        // AC7: Abwechslung basierend auf lastCompletedBracketType
        // Wenn zuletzt WB completed wurde → empfehle LB (und umgekehrt)
        if (lastCompletedBracketType === 'winner') {
          // Nach WB → empfehle LB
          return pendingLB[0]
        }
        if (lastCompletedBracketType === 'loser') {
          // Nach LB → empfehle WB
          return pendingWB[0]
        }

        // 4. Fallback: WB-vor-LB Logik wenn lastCompletedBracketType null oder 'qualifier'
        // Ermittle aktuelle Runden
        const getMinRound = (heatList: Heat[]): number => {
          const rounds = heatList
            .map(h => h.roundNumber)
            .filter((r): r is number => r !== undefined)
          return rounds.length > 0 ? Math.min(...rounds) : 0
        }

        const minWBRound = getMinRound(pendingWB)
        const minLBRound = getMinRound(pendingLB)

        // Wenn beide Runden gleich oder WB-Runde niedriger → WB zuerst
        // Wenn LB-Runde niedriger → LB muss aufholen
        if (minWBRound <= minLBRound || minLBRound === 0) {
          // Prüfe ob es noch pending WB Heats in der aktuellen Runde gibt
          const wbHeatsCurrentRound = pendingWB.filter(h => 
            h.roundNumber === minWBRound || h.roundNumber === undefined
          )
          
          if (wbHeatsCurrentRound.length > 0) {
            return wbHeatsCurrentRound[0]
          }
        }

        // WB-Runde ist abgeschlossen oder keine WB-Heats mehr → LB kann laufen
        // Aber nur wenn alle WB-Heats der entsprechenden Runde fertig sind
        
        // Prüfe ob alle WB-Heats der aktuellen LB-Runde abgeschlossen sind
        const wbHeatsForLBRound = heats.filter(h =>
          (h.bracketType === 'winner' || h.id.startsWith('wb-')) &&
          (h.roundNumber === minLBRound || h.roundNumber === undefined)
        )
        
        const allWBHeatsForLBRoundComplete = wbHeatsForLBRound.length === 0 || 
          wbHeatsForLBRound.every(h => h.status === 'completed')

        if (allWBHeatsForLBRoundComplete) {
          const lbHeatsCurrentRound = pendingLB.filter(h =>
            h.roundNumber === minLBRound || h.roundNumber === undefined
          )
          if (lbHeatsCurrentRound.length > 0) {
            return lbHeatsCurrentRound[0]
          }
        }

        // Fallback: Wenn WB noch nicht fertig, empfehle WB
        if (pendingWB.length > 0) {
          return pendingWB[0]
        }

        // Letzte Option: LB
        return pendingLB[0] ?? null
      },

      // NOTE: Story 13-6 - generateWBHeatFromPool, canGenerateWBFinale, generateWBFinale wurden entfernt
      // WB-Heats werden jetzt automatisch in submitHeatResults() generiert basierend auf winnerPilots

      // Story 13-2: isRoundComplete - Prüft ob eine Runde komplett ist
      isRoundComplete: (bracketType: 'winner' | 'loser', roundNumber: number) => {
        const { heats } = get()
        const roundHeats = heats.filter(
          h => h.bracketType === bracketType && h.roundNumber === roundNumber
        )
        return roundHeats.length > 0 && roundHeats.every(h => h.status === 'completed')
      },

      // Story 13-2: generateLBRound - Generiert eine Loser Bracket Runde
      generateLBRound: (roundNumber: number) => {
        const { heats, loserPool, isRoundComplete } = get()

        // Prüfen ob die Voraussetzungen erfüllt sind
        // LB R1: Startet nach WB R1
        // LB Rn (n>1): Startet nach WB Rn und LB R(n-1)
        let canGenerate = false
        if (roundNumber === 1) {
          // LB R1 startet nur wenn WB R1 komplett ist
          canGenerate = isRoundComplete('winner', 1)
        } else {
          // LB Rn startet nur wenn WB Rn und LB R(n-1) komplett sind
          const wbComplete = isRoundComplete('winner', roundNumber)
          const lbComplete = isRoundComplete('loser', roundNumber - 1)
          canGenerate = wbComplete && lbComplete
        }

        // Setze lbRoundWaitingForWB State
        if (!canGenerate) {
          set({ lbRoundWaitingForWB: true })
          return []
        } else {
          set({ lbRoundWaitingForWB: false })
        }

        // Piloten aus dem Pool holen und mischen
        const pilots = shuffleArray([...loserPool])

        // Heats erstellen: 4er Heats, Rest 3er oder 2er
        const lbHeats: Heat[] = []
        let heatNumber = heats.length + 1
        let cursor = 0

        // Maximiere 4er-Heats zuerst
        while (cursor + 4 <= pilots.length) {
          const chunk = pilots.slice(cursor, cursor + 4)
          lbHeats.push({
            id: crypto.randomUUID(),
            heatNumber,
            pilotIds: chunk,
            status: 'pending',
            bracketType: 'loser',
            roundNumber
          })
          cursor += 4
          heatNumber++
        }

        // Restliche Piloten in 3er-Heats (wenn >= 3)
        while (cursor + 3 <= pilots.length) {
          const chunk = pilots.slice(cursor, cursor + 3)
          lbHeats.push({
            id: crypto.randomUUID(),
            heatNumber,
            pilotIds: chunk,
            status: 'pending',
            bracketType: 'loser',
            roundNumber
          })
          cursor += 3
          heatNumber++
        }

        // Restliche Piloten in 2er-Heats (wenn >= 2)
        if (cursor + 2 <= pilots.length) {
          const chunk = pilots.slice(cursor, cursor + 2)
          lbHeats.push({
            id: crypto.randomUUID(),
            heatNumber,
            pilotIds: chunk,
            status: 'pending',
            bracketType: 'loser',
            roundNumber
          })
          cursor += 2
          heatNumber++
        }

        // Heats zum Store hinzufügen
        if (lbHeats.length > 0) {
          set({ heats: [...heats, ...lbHeats] })
        }

        return lbHeats
      },

      // Story 13-4: checkAndGenerateRematches - Prüft und generiert Rematches für Grand Finale
      checkAndGenerateRematches: () => {
        const { heats, pilotBracketStates } = get()

        // Finde das Grand Finale
        const grandFinale = heats.find(
          h => h.bracketType === 'grand_finale' && h.status === 'completed'
        )

        if (!grandFinale?.results) {
          return []
        }

        const rankings = grandFinale.results.rankings
        const rematches: Heat[] = []

        // Prüfe Rematch für Platz 1 (LB auf 1 + WB auf 3)
        const place1Pilot = rankings.find(r => r.rank === 1)
        const place3Pilot = rankings.find(r => r.rank === 3)

        if (place1Pilot && place3Pilot) {
          const place1Origin = pilotBracketStates[place1Pilot.pilotId]?.bracketOrigin
          const place3Origin = pilotBracketStates[place3Pilot.pilotId]?.bracketOrigin

          if (place1Origin === 'lb' && place3Origin === 'wb') {
            rematches.push({
              id: crypto.randomUUID(),
              heatNumber: heats.length + rematches.length + 1,
              pilotIds: [place1Pilot.pilotId, place3Pilot.pilotId],
              status: 'pending',
              isRematch: true,
              rematchBetween: [place1Pilot.pilotId, place3Pilot.pilotId],
              rematchForPlace: 1
            })
          }
        }

        // Prüfe Rematch für Platz 2 (LB auf 2 + WB auf 4)
        const place2Pilot = rankings.find(r => r.rank === 2)
        const place4Pilot = rankings.find(r => r.rank === 4)

        if (place2Pilot && place4Pilot) {
          const place2Origin = pilotBracketStates[place2Pilot.pilotId]?.bracketOrigin
          const place4Origin = pilotBracketStates[place4Pilot.pilotId]?.bracketOrigin

          if (place2Origin === 'lb' && place4Origin === 'wb') {
            rematches.push({
              id: crypto.randomUUID(),
              heatNumber: heats.length + rematches.length + 1,
              pilotIds: [place2Pilot.pilotId, place4Pilot.pilotId],
              status: 'pending',
              isRematch: true,
              rematchBetween: [place2Pilot.pilotId, place4Pilot.pilotId],
              rematchForPlace: 2
            })
          }
        }

        // Rematches zum Store hinzufügen wenn welche generiert wurden
        if (rematches.length > 0) {
          set({
            heats: [...heats, ...rematches],
            rematchHeats: rematches,
            grandFinaleRematchPending: true,
            tournamentPhase: 'finale'
          })
        }

        return rematches
      },

      // Story 13-5: getCurrentPhaseDescription - Beschreibt die aktuelle Turnier-Phase
      // AC3: Visueller Indikator zeigt "WB R1 läuft" / "LB R1 wartet auf WB"
      getCurrentPhaseDescription: () => {
        const { heats, tournamentPhase, isQualificationComplete, lbRoundWaitingForWB } = get()

        // Turnier noch nicht gestartet
        if (tournamentPhase === 'setup') {
          return 'Setup'
        }

        // Turnier beendet
        if (tournamentPhase === 'completed') {
          return 'Turnier beendet'
        }

        // Finale Phase
        if (tournamentPhase === 'finale') {
          const grandFinale = heats.find(h => 
            (h.bracketType === 'grand_finale' || h.bracketType === 'finale')
          )
          if (grandFinale?.status === 'pending' || grandFinale?.status === 'active') {
            return 'Grand Finale'
          }
          if (grandFinale?.status === 'completed') {
            return 'Turnier beendet'
          }
        }

        // Quali Phase
        if (!isQualificationComplete) {
          const activeQuali = heats.find(h => 
            (!h.bracketType || h.bracketType === 'qualification') && 
            h.status === 'active'
          )
          const pendingQuali = heats.filter(h => 
            (!h.bracketType || h.bracketType === 'qualification') && 
            h.status === 'pending'
          ).length

          if (activeQuali) {
            return `Quali läuft (${pendingQuali} verbleibend)`
          }
          return 'Quali Phase'
        }

        // WB/LB Phase - finde aktive Runden
        const activeWBHeat = heats.find(h => 
          (h.bracketType === 'winner' || h.id.startsWith('wb-')) && 
          h.status === 'active'
        )
        const activeLBHeat = heats.find(h => 
          (h.bracketType === 'loser' || h.id.startsWith('lb-')) && 
          h.status === 'active'
        )

        // WB Finale
        const wbFinale = heats.find(h => h.bracketType === 'winner' && h.isFinale)
        if (wbFinale?.status === 'active') {
          return 'WB Finale läuft'
        }
        if (wbFinale?.status === 'pending') {
          return 'WB Finale bereit'
        }

        // LB Finale
        const lbFinale = heats.find(h => h.bracketType === 'loser' && h.isFinale)
        if (lbFinale?.status === 'active') {
          return 'LB Finale läuft'
        }
        if (lbFinale?.status === 'pending' && wbFinale?.status === 'completed') {
          return 'LB Finale bereit'
        }

        // Aktiver WB Heat
        if (activeWBHeat) {
          const roundNum = activeWBHeat.roundNumber || 1
          return `WB Runde ${roundNum} läuft`
        }

        // Aktiver LB Heat
        if (activeLBHeat) {
          const roundNum = activeLBHeat.roundNumber || 1
          return `LB Runde ${roundNum} läuft`
        }

        // LB wartet auf WB
        if (lbRoundWaitingForWB) {
          const pendingLB = heats.find(h => 
            (h.bracketType === 'loser' || h.id.startsWith('lb-')) && 
            h.status === 'pending'
          )
          const roundNum = pendingLB?.roundNumber || 1
          return `LB Runde ${roundNum} wartet auf WB`
        }

        // Pending WB Heats vorhanden
        const pendingWB = heats.filter(h => 
          (h.bracketType === 'winner' || h.id.startsWith('wb-')) && 
          h.status === 'pending'
        )
        if (pendingWB.length > 0) {
          const roundNum = pendingWB[0].roundNumber || 1
          return `WB Runde ${roundNum} bereit`
        }

        // Pending LB Heats vorhanden
        const pendingLB = heats.filter(h => 
          (h.bracketType === 'loser' || h.id.startsWith('lb-')) && 
          h.status === 'pending'
        )
        if (pendingLB.length > 0) {
          const roundNum = pendingLB[0].roundNumber || 1
          return `LB Runde ${roundNum} bereit`
        }

        return 'Turnier läuft'
      }
    }),
    {
      name: 'tournament-storage',
    }
  )
)