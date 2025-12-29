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
  winnerPool: [] as string[],
  grandFinalePool: [] as string[],
  isQualificationComplete: false,
  isWBFinaleComplete: false,
  isLBFinaleComplete: false,
  isGrandFinaleComplete: false,
  fullBracketStructure: null as FullBracketStructure | null,
  lastCompletedBracketType: null as 'winner' | 'loser' | 'qualifier' | null,
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
  winnerPool: string[]        // Gewinner für nächsten WB-Heat (FIFO)
  grandFinalePool: string[]   // WB-Finale-Gewinner + LB-Finale-Gewinner

  // Status-Flags (Story 4-2)
  isQualificationComplete: boolean
  isWBFinaleComplete: boolean
  isLBFinaleComplete: boolean
  isGrandFinaleComplete: boolean

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
  swapPilots: (pilotId1: string, pilotId2: string) => void
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

  // Story 4-2: Winner Pool Actions
  addToWinnerPool: (pilotIds: string[]) => void
  removeFromWinnerPool: (count: number) => void
  generateWBHeatFromPool: () => Heat | null
  canGenerateWBFinale: () => boolean
  generateWBFinale: () => Heat | null

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

      swapPilots: (pilotId1, pilotId2) => {
        const { heats } = get()
        
        // Find heats containing each pilot
        const heat1Index = heats.findIndex(h => h.pilotIds.includes(pilotId1))
        const heat2Index = heats.findIndex(h => h.pilotIds.includes(pilotId2))
        
        // Validate both pilots exist in heats
        if (heat1Index === -1 || heat2Index === -1) return
        
        // Don't swap if same heat
        if (heat1Index === heat2Index) return
        
        const newHeats = [...heats]
        
        // Find indices within each heat
        const pilot1Idx = newHeats[heat1Index].pilotIds.indexOf(pilotId1)
        const pilot2Idx = newHeats[heat2Index].pilotIds.indexOf(pilotId2)
        
        // Swap pilot positions
        newHeats[heat1Index] = {
          ...newHeats[heat1Index],
          pilotIds: newHeats[heat1Index].pilotIds.map((id, i) => 
            i === pilot1Idx ? pilotId2 : id
          )
        }
        newHeats[heat2Index] = {
          ...newHeats[heat2Index],
          pilotIds: newHeats[heat2Index].pilotIds.map((id, i) => 
            i === pilot2Idx ? pilotId1 : id
          )
        }
        
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

      // Story 4-2: Winner Pool Actions
      addToWinnerPool: (pilotIds) => {
        const { winnerPool } = get()
        const newPool = addToPool(winnerPool, pilotIds)
        if (newPool !== winnerPool) {
          set({ winnerPool: newPool })
        }
      },

      removeFromWinnerPool: (count) => {
        const { winnerPool } = get()
        // FIFO: Entferne die ersten N Piloten
        const toRemove = winnerPool.slice(0, count)
        const remaining = winnerPool.slice(count)
        set({ winnerPool: remaining })
        return toRemove
      },

      // =======================================================================
      // REFACTORED: 100% Dynamic Pool-Based Heat Generation (2025-12-27)
      // =======================================================================
      // 
      // ARCHITEKTUR:
      // - Quali-Heats: Statisch bei Turnierstart generiert
      // - WB-Heats: Dynamisch aus winnerPool (wenn >= 4 Piloten, oder 2-3 für Finale)
      // - LB-Heats: Dynamisch aus loserPool (wenn >= 4 Piloten, oder 2-3 für Finale)
      // - Grand Finale: Automatisch wenn WB+LB Finale abgeschlossen
      //
      // KEINE Abhängigkeit mehr von fullBracketStructure für Heat-Generierung!
      // fullBracketStructure wird NUR noch für Visualisierung verwendet.
      // =======================================================================
      submitHeatResults: (heatId, rankings) => {
        const { heats, winnerPilots, loserPilots, eliminatedPilots, loserPool, winnerPool } = get()
        
        const heatIndex = heats.findIndex(h => h.id === heatId)
        if (heatIndex === -1) return
        
        let updatedHeats = [...heats]
        const heat = updatedHeats[heatIndex]
        
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
        
        // Initialize tracking sets
        const newWinnerPilots = new Set(winnerPilots)
        const newLoserPilots = new Set(loserPilots)
        const newEliminatedPilots = new Set(eliminatedPilots)
        let newWinnerPool = new Set(winnerPool)
        let newLoserPool = new Set(loserPool)
        
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
        
        // Grand Finale Generation
        // Bedingung: WB Finale UND LB Finale sind beide completed
        const wbFinaleHeat = updatedHeats.find(h => h.bracketType === 'winner' && h.isFinale)
        const lbFinaleHeat = updatedHeats.find(h => h.bracketType === 'loser' && h.isFinale)
        const grandFinaleExists = updatedHeats.some(h => h.bracketType === 'grand_finale' || h.bracketType === 'finale')
        
        if (!grandFinaleExists && 
            wbFinaleHeat?.status === 'completed' && 
            lbFinaleHeat?.status === 'completed') {
          // Get winners from both finales
          const wbWinner = wbFinaleHeat.results?.rankings.find(r => r.rank === 1)?.pilotId
          const lbWinner = lbFinaleHeat.results?.rankings.find(r => r.rank === 1)?.pilotId
          
          if (wbWinner && lbWinner) {
            const grandFinale: Heat = {
              id: `grand-finale-${crypto.randomUUID()}`,
              heatNumber: updatedHeats.length + 1,
              pilotIds: [wbWinner, lbWinner],
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
          winnerPool: Array.from(newWinnerPool),
          isQualificationComplete: newIsQualificationComplete,
          lastCompletedBracketType: completedBracketType
          // NOTE: fullBracketStructure wird NICHT mehr aktualisiert - nur für Visualisierung
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
        const { heats, fullBracketStructure, winnerPilots, loserPilots, eliminatedPilots, winnerPool, loserPool } = get()
        
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
        
        // Task 18: ROLLBACK Pools - Remove pilots from pools that came from this heat
        const newWinnerPool = new Set(winnerPool)
        const newLoserPool = new Set(loserPool)
        
        // Remove all pilots from this heat from bracket tracking AND pools
        if (heat.results) {
          for (const ranking of heat.results.rankings) {
            // Remove from bracket tracking
            newWinnerPilots.delete(ranking.pilotId)
            newLoserPilots.delete(ranking.pilotId)
            newEliminatedPilots.delete(ranking.pilotId)
            
            // Remove from pools
            newWinnerPool.delete(ranking.pilotId)
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
          winnerPool: Array.from(newWinnerPool),
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
      // - 1st Place: Grand Finale Winner
      // - 2nd Place: Grand Finale Loser (came from LB Finale as winner)
      // - 3rd Place: LB Finale Loser (eliminated in LB Finale)
      // - 4th Place: LB Semifinale Loser (eliminated one round before LB Finale)
      //
      // Special case: If LB Finale only has 2 pilots (typical for smaller brackets),
      // the loser of LB Finale is 3rd place.
      getTop4Pilots: () => {
        const { fullBracketStructure, pilots, heats } = get()
        
        if (!fullBracketStructure?.grandFinale) return null
        
        // Find the Grand Finale heat in heats[]
        const grandFinaleHeat = heats.find(h => h.id === fullBracketStructure.grandFinale!.id)
        
        if (!grandFinaleHeat?.results) return null
        
        // Platz 1 + 2 from Grand Finale
        const place1Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 1)
        const place2Ranking = grandFinaleHeat.results.rankings.find(r => r.rank === 2)
        
        // Get pilot IDs that are already placed (1st and 2nd)
        const place1Id = place1Ranking?.pilotId
        const place2Id = place2Ranking?.pilotId
        const alreadyPlaced = new Set([place1Id, place2Id].filter(Boolean))
        
        let place3Id: string | undefined
        let place4Id: string | undefined
        
        // Find LB rounds
        const lbRounds = fullBracketStructure.loserBracket.rounds
        
        if (lbRounds.length > 0) {
          // LB Finale (last LB round)
          const lbFinaleRound = lbRounds[lbRounds.length - 1]
          
          // Find completed heats in LB Finale
          for (const bracketHeat of lbFinaleRound.heats) {
            const lbFinaleHeat = heats.find(h => h.id === bracketHeat.id)
            if (lbFinaleHeat?.results) {
              // Find losers (rank 2, 3, 4) who are not already placed
              const losers = lbFinaleHeat.results.rankings
                .filter(r => r.rank >= 2)
                .sort((a, b) => a.rank - b.rank)
              
              for (const loser of losers) {
                if (!alreadyPlaced.has(loser.pilotId)) {
                  if (!place3Id) {
                    place3Id = loser.pilotId
                    alreadyPlaced.add(loser.pilotId)
                  } else if (!place4Id) {
                    place4Id = loser.pilotId
                    alreadyPlaced.add(loser.pilotId)
                    break
                  }
                }
              }
            }
          }
          
          // If we still don't have place 4, look at LB Semifinale (second-to-last LB round)
          if (!place4Id && lbRounds.length > 1) {
            const lbSemiRound = lbRounds[lbRounds.length - 2]
            
            for (const bracketHeat of lbSemiRound.heats) {
              const lbSemiHeat = heats.find(h => h.id === bracketHeat.id)
              if (lbSemiHeat?.results) {
                // Find losers who are not already placed
                const losers = lbSemiHeat.results.rankings
                  .filter(r => r.rank >= 2)
                  .sort((a, b) => a.rank - b.rank)
                
                for (const loser of losers) {
                  if (!alreadyPlaced.has(loser.pilotId)) {
                    place4Id = loser.pilotId
                    alreadyPlaced.add(loser.pilotId)
                    break
                  }
                }
              }
              if (place4Id) break
            }
          }
          
          // Still no place 4? Look at earlier rounds
          if (!place4Id && lbRounds.length > 2) {
            for (let i = lbRounds.length - 3; i >= 0 && !place4Id; i--) {
              const round = lbRounds[i]
              for (const bracketHeat of round.heats) {
                const heat = heats.find(h => h.id === bracketHeat.id)
                if (heat?.results) {
                  const losers = heat.results.rankings
                    .filter(r => r.rank >= 2)
                    .sort((a, b) => a.rank - b.rank)
                  
                  for (const loser of losers) {
                    if (!alreadyPlaced.has(loser.pilotId)) {
                      place4Id = loser.pilotId
                      alreadyPlaced.add(loser.pilotId)
                      break
                    }
                  }
                }
                if (place4Id) break
              }
            }
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

      // Generate Grand Finale (2 pilots: WB Winner + LB Winner)
      // REFACTORED: Now generates directly from heats[] without fullBracketStructure
      generateGrandFinale: () => {
        const { heats } = get()

        // Find WB and LB Finale heats
        const wbFinaleHeat = heats.find(h => h.bracketType === 'winner' && h.isFinale && h.status === 'completed')
        const lbFinaleHeat = heats.find(h => h.bracketType === 'loser' && h.isFinale && h.status === 'completed')
        
        if (!wbFinaleHeat?.results || !lbFinaleHeat?.results) return null
        
        // Get winners
        const wbWinner = wbFinaleHeat.results.rankings.find(r => r.rank === 1)?.pilotId
        const lbWinner = lbFinaleHeat.results.rankings.find(r => r.rank === 1)?.pilotId
        
        if (!wbWinner || !lbWinner) return null
        
        // Check if Grand Finale already exists
        if (heats.some(h => h.bracketType === 'grand_finale')) return null
        
        const finaleHeat: Heat = {
          id: `grand-finale-${crypto.randomUUID()}`,
          heatNumber: heats.length + 1,
          pilotIds: [wbWinner, lbWinner],
          status: 'active',
          bracketType: 'grand_finale',
          isFinale: true,
          roundName: 'Grand Finale'
        }
        
        set({
          heats: [...heats, finaleHeat],
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

      // Story 9-2: Get next recommended heat based on alternation (AC7)
      // Now includes dynamic LB heats (heats with bracketType='loser' or ID starting with 'lb-heat-')
      getNextRecommendedHeat: () => {
        const { heats, lastCompletedBracketType, fullBracketStructure } = get()

        if (!fullBracketStructure) return null

        // Get pending heats from WB
        const wbHeatIds = new Set<string>()
        for (const round of fullBracketStructure.winnerBracket.rounds) {
          for (const heat of round.heats) {
            wbHeatIds.add(heat.id)
          }
        }

        // Get all LB heat IDs from bracket structure
        const lbHeatIds = new Set<string>()
        for (const round of fullBracketStructure.loserBracket.rounds) {
          for (const heat of round.heats) {
            lbHeatIds.add(heat.id)
          }
        }

        const pendingWB = heats.filter(h =>
          h.status === 'pending' && wbHeatIds.has(h.id)
        )

        // Include BOTH bracket structure LB heats AND dynamic LB heats
        // Dynamic LB heats are those with bracketType='loser' OR ID starting with 'lb-heat-'
        const pendingLB = heats.filter(h =>
          h.status === 'pending' &&
          (lbHeatIds.has(h.id) || h.bracketType === 'loser' || h.id.startsWith('lb-heat-'))
        )

        // If only one bracket has heats, return from that
        if (pendingWB.length === 0 && pendingLB.length === 0) return null
        if (pendingWB.length === 0) return pendingLB[0] ?? null
        if (pendingLB.length === 0) return pendingWB[0] ?? null

        // Both have heats → alternate
        if (lastCompletedBracketType === 'winner' || lastCompletedBracketType === 'qualifier') {
          return pendingLB[0] // LB is next
        } else {
          return pendingWB[0] // WB is next
        }
      },

      // Story 4-2 Task 9: Generate WB heat from winner pool (FIFO)
      // Takes the first 4 pilots from winnerPool and creates a new WB heat
      generateWBHeatFromPool: () => {
        const { heats, winnerPool } = get()

        // Check if pool has >= 4 pilots (minimum for a heat)
        if (winnerPool.length >= 4) {
          // FIFO: Take first 4 pilots from pool
          const pilotsForWBHeat = winnerPool.slice(0, 4)
          
          // Create new WB heat
          const wbHeat: Heat = {
            id: `wb-heat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            heatNumber: heats.length + 1,
            pilotIds: pilotsForWBHeat,
            status: 'pending',
            bracketType: 'winner'
          }
          
          // Remove pilots from pool (FIFO: remove first 4)
          const remainingPool = winnerPool.slice(4)
          
          // Update state
          set({ 
            heats: [...heats, wbHeat],
            winnerPool: remainingPool
          })
          
          return wbHeat
        }
        return null
      },

      // Story 4-2 Task 10: Check if WB Finale can be generated
      // WB Finale when pool has exactly 2-3 pilots (not enough for regular 4er heat)
      canGenerateWBFinale: () => {
        const { winnerPool, isQualificationComplete } = get()
        // WB Finale only after qualification is complete
        // And when we have 2-3 pilots (not enough for regular heat, but enough for finale)
        return isQualificationComplete && 
               winnerPool.length >= 2 && 
               winnerPool.length < 4
      },

      // Story 4-2 Task 10: Generate WB Finale heat
      generateWBFinale: () => {
        const { heats, winnerPool, canGenerateWBFinale } = get()

        if (!canGenerateWBFinale()) {
          return null
        }

        // Take all remaining pilots from pool (2-3 pilots)
        const pilotsForFinale = [...winnerPool]
        
        // Create WB Finale heat
        const wbFinale: Heat = {
          id: `wb-finale-${Date.now()}`,
          heatNumber: heats.length + 1,
          pilotIds: pilotsForFinale,
          status: 'pending',
          bracketType: 'winner',
          isFinale: true,
          roundName: 'WB Finale'
        }
        
        // Clear the winner pool
        set({ 
          heats: [...heats, wbFinale],
          winnerPool: []
        })
        
        return wbFinale
      },
    }),
    {
      name: 'tournament-storage',
    }
  )
)