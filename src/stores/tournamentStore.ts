import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Pilot, Ranking } from '@/lib/schemas'
import type { Heat, TournamentPhase } from '@/types'
import { calculateHeatDistribution } from '@/lib/heat-distribution'

// Re-export types for backward compatibility
export type { Heat, TournamentPhase }
import { shuffleArray } from '@/lib/utils'
// Phase 3: fullBracketStructure komplett entfernt - heats[] ist Single Source of Truth

// Story 1.6: Extrahierte Helper-Funktionen
import { inferBracketType, isGrandFinaleBracketType, calculateAvailableWinnerPool } from '@/lib/bracket-logic'
import {
  processRankingsByBracket,
  generateNextHeats
} from '@/lib/heat-completion'
import { getChannelForPosition } from '@/lib/channel-assignment'

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
  // Phase 3.1: fullBracketStructure entfernt - heats[] ist Single Source of Truth
  lastCompletedBracketType: null as 'winner' | 'loser' | 'qualifier' | null,
  // Story 13-2: LB-Synchronisation States
  currentWBRound: 0,
  currentLBRound: 0,
  lbRoundWaitingForWB: false,
  // Story 13-3: Grand Finale States (pilotBracketStates für WB/LB Origin-Tracking)
  pilotBracketStates: {} as Record<string, { bracket: string; roundReached: number; bracketOrigin?: 'wb' | 'lb' }>,
  showPilotPaths: false,
}

// Pilot interface export
export type { Pilot } from '@/lib/schemas'

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

  // Story 13-3: Grand Finale States (pilotBracketStates für WB/LB Origin-Tracking)
  pilotBracketStates: Record<string, { bracket: string; roundReached: number; bracketOrigin?: 'wb' | 'lb' }>

  // Pilot management actions
  addPilot: (input: { name: string; imageUrl?: string; instagramHandle?: string }) => boolean
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



  // Phase 3.1: fullBracketStructure entfernt - heats[] ist Single Source of Truth
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



  // Story 13-5: Phase-Indikator
  getCurrentPhaseDescription: () => string

  canEditHeat: (heatId: string) => boolean
  showPilotPaths: boolean
  togglePilotPaths: () => void
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
          status: 'withdrawn'
        }
        set({ pilots: updatedPilots })
        return true
      },

      startTournament: () => {
        set({ tournamentStarted: true })
      },

      // Phase 3.2: Vereinfacht - keine Bracket-Struktur-Generierung mehr
      confirmTournamentStart: () => {
        const { pilots, generateHeats } = get()
        
        // Validation: 7-60 pilots required
        if (pilots.length < 7 || pilots.length > 60) {
          return false
        }
        
        // Generate heats (US-3.2) - heats[] ist jetzt Single Source of Truth
        generateHeats()
        
        // Set tournament status
        set({ 
          tournamentStarted: true,
          tournamentPhase: 'heat-assignment'  // NOT 'running' - user must confirm first
        })
        
        return true
      },

      generateHeats: (seed) => {
        const { pilots } = get()

        const activePilots = pilots.filter((p) => p.status !== 'withdrawn')
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
            bracketType: 'qualification',  // Phase 1.1: bracketType für Quali-Heats
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
            bracketType: 'qualification',  // Phase 1.1: bracketType für Quali-Heats
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
        const currentShowPilotPaths = get().showPilotPaths
        set({
          ...structuredClone(INITIAL_TOURNAMENT_STATE),
          pilots: keepPilots ? get().pilots : [],
          showPilotPaths: currentShowPilotPaths,
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
        const { heats, winnerPilots, loserPilots, eliminatedPilots, loserPool } = get()

        const heatIndex = heats.findIndex(h => h.id === heatId)
        if (heatIndex === -1) return

        let updatedHeats = [...heats]
        const heat = updatedHeats[heatIndex]

        const bracketType = inferBracketType(heat)
        const isGrandFinale = isGrandFinaleBracketType(bracketType)

        updatedHeats[heatIndex] = {
          ...heat,
          status: 'completed',
          results: {
            rankings,
            completedAt: new Date().toISOString()
          }
        }

        // Story 1.6: Use extracted calculateAvailableWinnerPool function
        let newWinnerPool = calculateAvailableWinnerPool(winnerPilots, updatedHeats)

        // Initialize tracking sets
        let newWinnerPilots = new Set(winnerPilots)
        let newLoserPilots = new Set(loserPilots)
        let newEliminatedPilots = new Set(eliminatedPilots)
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

        // Auto-complete rankings: If not all pilots have rankings, assign remaining pilots to bottom ranks
        // This ensures all pilots are processed even if user only selected top 1-2 places
        let completeRankings = [...rankings]
        const rankedPilotIds = new Set(rankings.map(r => r.pilotId))
        const unrankedPilots = heat.pilotIds.filter(id => !rankedPilotIds.has(id))
        
        if (unrankedPilots.length > 0) {
          // Find the next available rank (after the highest assigned rank)
          const usedRanks = new Set(rankings.map(r => r.rank))
          const availableRanks = ([3, 4] as const).filter(r => !usedRanks.has(r))
          
          // Assign unranked pilots to bottom ranks
          unrankedPilots.forEach((pilotId, index) => {
            if (index < availableRanks.length) {
              completeRankings.push({ pilotId, rank: availableRanks[index] })
            }
          })
          
          // Update the heat results with complete rankings
          updatedHeats[heatIndex] = {
            ...updatedHeats[heatIndex],
            results: {
              rankings: completeRankings,
              completedAt: new Date().toISOString()
            }
          }
        }

        // Update pilot lastChannel based on their position in the heat
        const updatedPilots = get().pilots.map(pilot => {
          const positionInHeat = heat.pilotIds.indexOf(pilot.id)
          if (positionInHeat !== -1) {
            const channel = getChannelForPosition(positionInHeat, heat.pilotIds.length)
            return { ...pilot, lastChannel: channel as 1 | 3 | 6 | 8 }
          }
          return pilot
        })

        // Story 1.6: Use extracted processRankingsByBracket function
        if (!isGrandFinale) {
          const rankingResult = processRankingsByBracket({
            rankings: completeRankings,
            bracketType,
            winnerPilots: newWinnerPilots,
            loserPilots: newLoserPilots,
            eliminatedPilots: newEliminatedPilots,
            winnerPool: newWinnerPool,
            loserPool: newLoserPool,
            heats: updatedHeats
          })

          newWinnerPilots = rankingResult.winnerPilots
          newLoserPilots = rankingResult.loserPilots
          newEliminatedPilots = rankingResult.eliminatedPilots
          newWinnerPool = rankingResult.winnerPool
          newLoserPool = rankingResult.loserPool

          if (rankingResult.isQualificationComplete) {
            newIsQualificationComplete = true
          }
          if (rankingResult.newPhase) {
            newPhase = rankingResult.newPhase
          }
        } else {
          // GRAND FINALE COMPLETED
          newPhase = 'completed'
        }

        // Story 1.6: Use extracted generateNextHeats function
        const heatGenResult = generateNextHeats({
          heats: updatedHeats,
          winnerPool: newWinnerPool,
          loserPool: newLoserPool,
          isQualificationComplete: newIsQualificationComplete
        })

        // Apply generated heats
        updatedHeats = [...updatedHeats, ...heatGenResult.newHeats]
        newWinnerPool = heatGenResult.updatedWinnerPool
        newLoserPool = heatGenResult.updatedLoserPool

        // Apply pilotBracketStates updates from Grand Finale generation
        let newPilotBracketStates = { ...get().pilotBracketStates }
        if (Object.keys(heatGenResult.pilotBracketStateUpdates).length > 0) {
          newPilotBracketStates = { ...newPilotBracketStates, ...heatGenResult.pilotBracketStateUpdates }
        }

        // Apply phase from heat generation (e.g., 'finale' when Grand Finale is generated)
        if (heatGenResult.newPhase) {
          newPhase = heatGenResult.newPhase
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

        // Check if tournament should end
        const allCompleted = updatedHeats.every(h => h.status === 'completed')
        const hasActiveHeats = updatedHeats.some(h => h.status === 'active')
        const hasPendingHeats = updatedHeats.some(h => h.status === 'pending')

        if (allCompleted && !hasActiveHeats && !hasPendingHeats && newWinnerPool.size === 0 && newLoserPool.size === 0) {
          const grandFinaleCompleted = updatedHeats.some(h =>
            (h.bracketType === 'grand_finale' || h.bracketType === 'finale') && h.status === 'completed'
          )
          if (grandFinaleCompleted) {
            newPhase = 'completed'
          }
        }

        // Track last completed bracket type
        let completedBracketType: 'winner' | 'loser' | 'qualifier' | null = null
        if (bracketType === 'qualification') completedBracketType = 'qualifier'
        else if (bracketType === 'winner') completedBracketType = 'winner'
        else if (bracketType === 'loser') completedBracketType = 'loser'

        set({
          pilots: updatedPilots,
          heats: updatedHeats,
          currentHeatIndex: newCurrentHeatIndex,
          tournamentPhase: newPhase,
          winnerPilots: Array.from(newWinnerPilots),
          loserPilots: Array.from(newLoserPilots),
          eliminatedPilots: Array.from(newEliminatedPilots),
          loserPool: Array.from(newLoserPool),
          isQualificationComplete: newIsQualificationComplete,
          lastCompletedBracketType: completedBracketType,
          pilotBracketStates: newPilotBracketStates
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

      // Phase 3.3: Vereinfacht - kein rollbackBracketForHeat mehr
      // Story 4.2: Reopen completed heat for editing
      reopenHeat: (heatId) => {
        const { heats, winnerPilots, loserPilots, eliminatedPilots, loserPool } = get()
        
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
        const newLoserPool = new Set(loserPool)
        
        // Remove all pilots from this heat from bracket tracking AND pools
        if (heat.results) {
          for (const ranking of heat.results.rankings) {
            newWinnerPilots.delete(ranking.pilotId)
            newLoserPilots.delete(ranking.pilotId)
            newEliminatedPilots.delete(ranking.pilotId)
            newLoserPool.delete(ranking.pilotId)
          }
        }
        
        set({ 
          heats: updatedHeats,
          currentHeatIndex: heatIndex,
          tournamentPhase: 'running',
          winnerPilots: Array.from(newWinnerPilots),
          loserPilots: Array.from(newLoserPilots),
          eliminatedPilots: Array.from(newEliminatedPilots),
          loserPool: Array.from(newLoserPool)
        })
      },

      // Phase 3.4: getFullBracketStructure entfernt

      getPilotJourney: (pilotId: string) => {
        const { heats } = get()
        return heats.filter(heat => 
          heat.pilotIds.includes(pilotId) && heat.status === 'completed'
        )
      },

      getTop4Pilots: () => {
        const { pilots, heats } = get()

        const grandFinaleHeat = heats.find(h =>
          h.bracketType === 'grand_finale' ||
          h.bracketType === 'finale' ||
          h.id.includes('grand-finale')
        )

        if (!grandFinaleHeat?.results) return null

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
      },

      // Phase 3.4: Vereinfacht - keine Bracket-Struktur mehr
      // Story 5.1: Mark tournament as completed
      completeTournament: () => {
        const { heats } = get()
        // Update grand finale heat status to completed
        const updatedHeats = heats.map(h => 
          h.bracketType === 'grand_finale' ? { ...h, status: 'completed' as const } : h
        )
        set({ 
          tournamentPhase: 'completed',
          heats: updatedHeats
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
      // Phase 3.5: Vereinfacht - nutzt nur heats[]
      checkWBFinaleComplete: () => {
        const { heats } = get()
        const wbFinaleHeat = heats.find(h => h.bracketType === 'winner' && h.isFinale)
        return wbFinaleHeat?.status === 'completed'
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
      },

      canEditHeat: (heatId: string) => {
        const { heats, tournamentPhase } = get()
        const heat = heats.find(h => h.id === heatId)

        if (!heat || heat.status !== 'completed') return false

        if (heat.bracketType === 'grand_finale' || heat.bracketType === 'finale') {
          return tournamentPhase !== 'completed'
        }

        if (heat.bracketType === 'qualification' || !heat.bracketType) {
          const wbRound1Exists = heats.some(h => h.bracketType === 'winner')
          return !wbRound1Exists
        }

        const roundNumber = heat.roundNumber ?? 0
        const laterRoundExists = heats.some(h =>
          h.bracketType === heat.bracketType &&
          (h.roundNumber ?? 0) > roundNumber
        )

        return !laterRoundExists
      },

      togglePilotPaths: () => {
        set({ showPilotPaths: !get().showPilotPaths })
      }
    }),
    {
      name: 'tournament-storage',
    }
  )
)
