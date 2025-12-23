import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Pilot } from '../lib/schemas'
import { calculateHeatDistribution } from '../lib/heat-distribution'
import { shuffleArray } from '../lib/utils'
import { 
  generateFullBracketStructure, 
  type FullBracketStructure
} from '../lib/bracket-structure-generator'
import {
  syncQualiHeatsToStructure,
  updateBracketAfterHeatCompletion,
  areAllQualiHeatsCompleted,
  areAllHeatsInRoundCompleted,
  generateNextRoundHeats,
  generateHeatsForNextRound,
  rollbackBracketForHeat,
  updateBracketAfterWBLBHeatCompletion,
  findBracketHeatWithLocation,
  isGrandFinaleReady,
  generateGrandFinaleHeat
} from '../lib/bracket-logic'

// Tournament phase types for granular control
export type TournamentPhase = 'setup' | 'heat-assignment' | 'running' | 'finale' | 'completed'

// Pilot interface export
export type { Pilot } from '../lib/schemas'

// Heat interface for tournament structure (Story 3.2)
export interface Heat {
  id: string
  heatNumber: number
  pilotIds: string[]
  status: 'pending' | 'active' | 'completed'
  results?: {
    rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]
    completedAt?: string
  }
}

interface TournamentState {
  pilots: Pilot[]
  tournamentStarted: boolean
  tournamentPhase: TournamentPhase
  heats: Heat[]
  currentHeatIndex: number
  
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
  
  // Heat assignment actions (Story 3.3)
  shuffleHeats: (seed?: number) => void
  swapPilots: (pilotId1: string, pilotId2: string) => void
  confirmHeatAssignment: () => void
  cancelHeatAssignment: () => void
  
  // Heat result actions (Story 4.1)
  submitHeatResults: (heatId: string, rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[]) => void
  getActiveHeat: () => Heat | undefined
  getNextHeat: () => Heat | undefined
  
  // Heat edit actions (Story 4.2)
  reopenHeat: (heatId: string) => void
  
  // Bracket state (Story 4.2)
  winnerPilots: string[]
  loserPilots: string[]
  eliminatedPilots: string[]
  
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
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      pilots: [],
      tournamentStarted: false,
      tournamentPhase: 'setup' as TournamentPhase,
      heats: [],
      currentHeatIndex: 0,
      winnerPilots: [],
      loserPilots: [],
      eliminatedPilots: [],
      fullBracketStructure: null,
      
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

      resetTournament: () => {
        set({
          tournamentStarted: false,
          tournamentPhase: 'setup',
          heats: [],
          currentHeatIndex: 0,
          winnerPilots: [],
          loserPilots: [],
          eliminatedPilots: [],
          fullBracketStructure: null
          // pilots bleiben unverändert!
        })
      },

      deleteAllPilots: () => {
        set({
          pilots: [],
          heats: [],
          tournamentPhase: 'setup',
          tournamentStarted: false,
          currentHeatIndex: 0,
          winnerPilots: [],
          loserPilots: [],
          eliminatedPilots: [],
          fullBracketStructure: null
        })
      },

      resetAll: () => {
        // Kompletter Reset auf Initial State
        set({
          pilots: [],
          tournamentStarted: false,
          tournamentPhase: 'setup',
          heats: [],
          currentHeatIndex: 0,
          winnerPilots: [],
          loserPilots: [],
          eliminatedPilots: [],
          fullBracketStructure: null
        })
        // localStorage komplett leeren für sauberen Neustart
        localStorage.removeItem('tournament-storage')
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

      clearAllPilots: () => {
        const { tournamentStarted } = get()
        if (tournamentStarted) {
          return false
        }
        set({ 
          pilots: [], 
          tournamentStarted: false,
          tournamentPhase: 'setup',
          heats: [],
          currentHeatIndex: 0,
          winnerPilots: [],
          loserPilots: [],
          eliminatedPilots: [],
          fullBracketStructure: null
        })
        return true
      },

      // Story 4.1 + 4.2: Heat result actions with bracket progression
      // Tasks 7-18: Full bracket progression from Quali to Grand Finale
      submitHeatResults: (heatId, rankings) => {
        const { heats, winnerPilots, loserPilots, eliminatedPilots, fullBracketStructure } = get()
        
        const heatIndex = heats.findIndex(h => h.id === heatId)
        if (heatIndex === -1) return
        
        let updatedHeats = [...heats]
        
        // Update the completed heat with results
        updatedHeats[heatIndex] = {
          ...updatedHeats[heatIndex],
          status: 'completed',
          results: {
            rankings,
            completedAt: new Date().toISOString()
          }
        }
        
        // Bracket Progression Logic (AC 2, 3)
        // Determine which pilots go to winner/loser bracket based on rankings
        const newWinnerPilots = new Set(winnerPilots)
        const newLoserPilots = new Set(loserPilots)
        const newEliminatedPilots = new Set(eliminatedPilots)
        
        // First, check if this is a re-submission (edit mode)
        // If so, we need to remove old bracket assignments from this heat
        const originalHeat = heats[heatIndex]
        if (originalHeat.results) {
          for (const oldRanking of originalHeat.results.rankings) {
            newWinnerPilots.delete(oldRanking.pilotId)
            newLoserPilots.delete(oldRanking.pilotId)
            newEliminatedPilots.delete(oldRanking.pilotId)
          }
        }
        
        const isResubmission = !!originalHeat.results
        let updatedBracketStructure = fullBracketStructure
        let newPhase: TournamentPhase = 'running'
        
        // Find the bracket heat location to determine bracket type
        const heatLocation = fullBracketStructure 
          ? findBracketHeatWithLocation(fullBracketStructure, heatId)
          : undefined
        
        const bracketType = heatLocation?.bracketType || 'qualification'
        const completedRoundNumber = heatLocation?.heat.roundNumber || 1
        
        // Handle based on bracket type
        if (bracketType === 'qualification') {
          // QUALIFICATION HEAT COMPLETED
          // Apply bracket assignments for quali heats
          for (const ranking of rankings) {
            if (ranking.rank === 1 || ranking.rank === 2) {
              newWinnerPilots.add(ranking.pilotId)
            } else if (ranking.rank === 3 || ranking.rank === 4) {
              // Double Elimination: Check if pilot was already in loser bracket
              if (loserPilots.includes(ranking.pilotId)) {
                // Second loss → eliminated
                newLoserPilots.delete(ranking.pilotId)
                newEliminatedPilots.add(ranking.pilotId)
              } else {
                // First loss → loser bracket
                newLoserPilots.add(ranking.pilotId)
              }
            }
          }
          
          // Update bracket structure
          if (fullBracketStructure) {
            updatedBracketStructure = updateBracketAfterHeatCompletion(
              heatId,
              rankings,
              fullBracketStructure,
              isResubmission
            )
          }
          
          // TASK 11: Check if all quali heats are completed → generate WB/LB round 1
          if (updatedBracketStructure && areAllQualiHeatsCompleted(updatedBracketStructure)) {
            const existingNonQualiHeats = updatedHeats.filter(h => 
              !updatedBracketStructure!.qualification.heats.some(qh => qh.id === h.id)
            )
            
            if (existingNonQualiHeats.length === 0) {
              const newRoundHeats = generateNextRoundHeats(updatedBracketStructure, updatedHeats)
              
              if (newRoundHeats.length > 0) {
                updatedHeats = updatedHeats.map(h => ({
                  ...h,
                  status: h.status === 'active' 
                    ? (h.results ? 'completed' : 'pending') 
                    : h.status
                } as Heat))
                
                updatedHeats = [...updatedHeats, ...newRoundHeats]
              }
            }
          }
        } else if (bracketType === 'winner' || bracketType === 'loser') {
          // WB/LB HEAT COMPLETED (Tasks 13-16)
          
          if (fullBracketStructure) {
            const result = updateBracketAfterWBLBHeatCompletion(
              heatId,
              rankings,
              fullBracketStructure,
              isResubmission
            )
            updatedBracketStructure = result.structure
            
            // Add eliminated pilots from LB
            for (const eliminatedId of result.eliminatedPilotIds) {
              newLoserPilots.delete(eliminatedId)
              newEliminatedPilots.add(eliminatedId)
            }
            
            // Update winner/loser tracking for WB/LB heats
            for (const ranking of rankings) {
              if (ranking.rank === 1 || ranking.rank === 2) {
                // Winners stay in their current bracket (or advance to finale)
                if (bracketType === 'winner') {
                  newWinnerPilots.add(ranking.pilotId)
                } else {
                  // LB winners continue in LB
                  newLoserPilots.add(ranking.pilotId)
                }
              } else if (ranking.rank === 3 || ranking.rank === 4) {
                if (bracketType === 'winner') {
                  // WB losers drop to LB
                  newWinnerPilots.delete(ranking.pilotId)
                  newLoserPilots.add(ranking.pilotId)
                }
                // LB losers already handled via eliminatedPilotIds
              }
            }
            
            // Task 14: Check if round is complete → generate next round heats
            if (areAllHeatsInRoundCompleted(updatedBracketStructure, completedRoundNumber, bracketType)) {
              const newRoundHeats = generateHeatsForNextRound(
                updatedBracketStructure,
                completedRoundNumber,
                bracketType,
                updatedHeats
              )
              
              if (newRoundHeats.length > 0) {
                updatedHeats = [...updatedHeats, ...newRoundHeats]
              }
            }
            
            // Task 17: Check if Grand Finale is ready
            if (isGrandFinaleReady(updatedBracketStructure)) {
              const finaleHeat = generateGrandFinaleHeat(updatedBracketStructure, updatedHeats)
              if (finaleHeat) {
                // Deactivate any active heat first
                updatedHeats = updatedHeats.map(h => ({
                  ...h,
                  status: h.status === 'active' && h.results 
                    ? 'completed' 
                    : h.status
                } as Heat))
                
                updatedHeats = [...updatedHeats, finaleHeat]
                newPhase = 'finale'
              }
            }
          }
        } else if (bracketType === 'finale') {
          // GRAND FINALE COMPLETED
          newPhase = 'completed'
          
          // Update grand finale status in bracket structure
          if (updatedBracketStructure?.grandFinale) {
            updatedBracketStructure = structuredClone(updatedBracketStructure)
            updatedBracketStructure.grandFinale!.status = 'completed'
          }
        }
        
        // Find and activate next pending heat
        let nextPendingIndex = updatedHeats.findIndex((h, i) => i > heatIndex && h.status === 'pending')
        
        if (nextPendingIndex !== -1) {
          updatedHeats[nextPendingIndex] = {
            ...updatedHeats[nextPendingIndex],
            status: 'active'
          }
        }
        
        // If no active heat yet, find any pending heat
        const hasActiveHeat = updatedHeats.some(h => h.status === 'active')
        if (!hasActiveHeat) {
          nextPendingIndex = updatedHeats.findIndex(h => h.status === 'pending')
          if (nextPendingIndex !== -1) {
            updatedHeats[nextPendingIndex] = {
              ...updatedHeats[nextPendingIndex],
              status: 'active'
            }
          }
        }
        
        // Determine new current heat index
        const activeHeatIndex = updatedHeats.findIndex(h => h.status === 'active')
        const newCurrentHeatIndex = activeHeatIndex !== -1 ? activeHeatIndex : heatIndex
        
        // Check if all heats are completed
        // If all heats are done and no more pending, transition to finale
        // 'completed' phase is only set when Grand Finale is done (bracketType === 'finale')
        const allCompleted = updatedHeats.every(h => h.status === 'completed')
        const hasPendingHeats = updatedHeats.some(h => h.status === 'pending')
        
        if (allCompleted && !hasPendingHeats && newPhase === 'running') {
          // All heats done, no new ones generated → finale phase
          newPhase = 'finale'
        }
        
        set({ 
          heats: updatedHeats,
          currentHeatIndex: newCurrentHeatIndex,
          tournamentPhase: newPhase,
          winnerPilots: Array.from(newWinnerPilots),
          loserPilots: Array.from(newLoserPilots),
          eliminatedPilots: Array.from(newEliminatedPilots),
          fullBracketStructure: updatedBracketStructure
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
      reopenHeat: (heatId) => {
        const { heats, fullBracketStructure, winnerPilots, loserPilots, eliminatedPilots } = get()
        
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
        
        // Remove all pilots from this heat from bracket tracking
        if (heat.results) {
          for (const ranking of heat.results.rankings) {
            newWinnerPilots.delete(ranking.pilotId)
            newLoserPilots.delete(ranking.pilotId)
            newEliminatedPilots.delete(ranking.pilotId)
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
    }),
    {
      name: 'tournament-storage',
    }
  )
)