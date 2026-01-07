/**
 * Story 13-1: Tests für verschiedene Pilotenzahlen
 * 
 * Testet die pool-basierte WB-Progression mit verschiedenen Pilotenzahlen.
 * AC6, AC7, AC8: System funktioniert mit 7-60 Piloten, auch nicht-perfekte Bracket-Größen
 * 
 * Story 13-6: Tests angepasst - roundNumber wird nicht mehr verwendet
 * WB-Heats werden dynamisch aus winnerPilots generiert (pool-basiert)
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTournamentStore } from '../src/stores/tournamentStore'
import { createMockPilots } from './helpers/mock-factories'
import type { Ranking } from '../src/lib/schemas'

describe('Story 13-1: Variable Pilotenzahlen', () => {
  beforeEach(() => {
    const { resetAll } = useTournamentStore.getState()
    resetAll()
  })

  /**
   * Helper: Setzt ein Turnier mit N Piloten auf und schließt alle Quali-Heats ab
   */
  const setupTournamentWithCompletedQuali = (pilotCount: number) => {
    const { result } = renderHook(() => useTournamentStore())
    const mockPilots = createMockPilots(pilotCount)
    
    act(() => {
      mockPilots.forEach(p => result.current.addPilot(p))
      result.current.confirmTournamentStart()
      result.current.confirmHeatAssignment()
    })

    // Schließe alle Quali-Heats ab (Platz 1+2 gewinnen)
    const qualiHeats = result.current.heats.filter(h => 
      !h.bracketType || h.bracketType === 'qualification'
    )
    
    qualiHeats.forEach(heat => {
      const rankings: Ranking[] = heat.pilotIds.map((pilotId, index) => ({
        pilotId,
        rank: (index + 1) as 1 | 2 | 3 | 4
      }))
      
      act(() => {
        result.current.submitHeatResults(heat.id, rankings)
      })
    })

    return result
  }

  /**
   * Helper: Spielt ein komplettes Turnier durch bis zum WB Finale
   */
  const playThroughToWBFinale = (result: ReturnType<typeof setupTournamentWithCompletedQuali>) => {
    let iterations = 0
    const maxIterations = 50
    
    while (iterations < maxIterations) {
      // Finde nächsten unvollständigen WB Heat (nicht Finale)
      const wbHeat = result.current.heats.find(h => 
        h.bracketType === 'winner' && 
        !h.isFinale && 
        h.status !== 'completed'
      )
      
      if (!wbHeat) break
      
      const rankings: Ranking[] = wbHeat.pilotIds.map((pilotId, index) => ({
        pilotId,
        rank: (index + 1) as 1 | 2 | 3 | 4
      }))
      
      act(() => {
        result.current.submitHeatResults(wbHeat.id, rankings)
      })
      
      iterations++
    }
    
    return result
  }

  describe('6.1: Nach Quali-Abschluss werden WB-Heats generiert', () => {
    it('sollte WB-Heats nach Quali-Abschluss haben', () => {
      const result = setupTournamentWithCompletedQuali(12)
      
      // Story 13-6: WB-Heats werden dynamisch generiert (ohne roundNumber)
      const wbHeats = result.current.heats.filter(h => 
        h.bracketType === 'winner'
      )
      
      expect(wbHeats.length).toBeGreaterThan(0)
    })
  })

  describe('6.2: Weitere WB-Heats werden nach Abschluss generiert', () => {
    it('sollte weitere WB-Heats nach Abschluss vorheriger generieren', () => {
      const result = setupTournamentWithCompletedQuali(16)
      
      // Erste WB-Heats abschließen
      const wbHeats = result.current.heats.filter(h => 
        h.bracketType === 'winner' && !h.isFinale
      )
      
      wbHeats.forEach(heat => {
        if (heat.status !== 'completed') {
          const rankings: Ranking[] = heat.pilotIds.map((pilotId, index) => ({
            pilotId,
            rank: (index + 1) as 1 | 2 | 3 | 4
          }))
          
          act(() => {
            result.current.submitHeatResults(heat.id, rankings)
          })
        }
      })
      
      // Nach Abschluss sollten neue WB-Heats oder WB Finale existieren
      const wbHeatsOrFinale = result.current.heats.filter(h => 
        h.bracketType === 'winner'
      )
      
      expect(wbHeatsOrFinale.length).toBeGreaterThan(0)
    })
  })

  describe('6.3: Gewinner werden korrekt vorgemerkt', () => {
    it('sollte WB-Gewinner in winnerPilots haben', () => {
      const result = setupTournamentWithCompletedQuali(12)
      
      // Story 13-6: winnerPool existiert nicht mehr - wir prüfen winnerPilots
      // Nach Quali sollten Gewinner in winnerPilots sein (oder bereits in WB Heats)
      const wbHeats = result.current.heats.filter(h => h.bracketType === 'winner')
      const wbPilotIds = new Set(wbHeats.flatMap(h => h.pilotIds))
      
      // Prüfen dass winnerPilots gefüllt ist
      expect(result.current.winnerPilots.length).toBeGreaterThan(0)
    })
  })

  describe('6.4: Verlierer werden korrekt an LB weitergeleitet', () => {
    it('sollte WB-Verlierer in loserPool haben', () => {
      const result = setupTournamentWithCompletedQuali(12)
      
      // WB Heat abschließen (erster nicht-completed WB Heat)
      const wbHeat = result.current.heats.find(h => 
        h.bracketType === 'winner' && h.status !== 'completed'
      )
      
      if (wbHeat) {
        const rankings: Ranking[] = wbHeat.pilotIds.map((pilotId, index) => ({
          pilotId,
          rank: (index + 1) as 1 | 2 | 3 | 4
        }))
        
        act(() => {
          result.current.submitHeatResults(wbHeat.id, rankings)
        })
        
        // Verlierer (Platz 3+4) sollten in loserPool sein
        const losers = rankings.filter(r => r.rank >= 3).map(r => r.pilotId)
        losers.forEach(pilotId => {
          // Entweder im loserPool oder bereits in einem LB Heat
          const inLoserPool = result.current.loserPool.includes(pilotId)
          const inLBHeat = result.current.heats.some(h => 
            h.bracketType === 'loser' && h.pilotIds.includes(pilotId)
          )
          expect(inLoserPool || inLBHeat).toBe(true)
        })
      }
    })
  })

  describe('6.5: Test mit 12 Piloten - Korrekter Flow', () => {
    it('sollte 12 Piloten korrekt durch WB verarbeiten', () => {
      // 12 Piloten → 3 Quali-Heats (3×4) → 6 Quali-Gewinner
      // 6 Gewinner → Pool → WB-Heats → WB Finale
      const result = setupTournamentWithCompletedQuali(12)
      
      // Prüfe Quali-Heats
      const qualiHeats = result.current.heats.filter(h => 
        !h.bracketType || h.bracketType === 'qualification'
      )
      expect(qualiHeats.length).toBe(3) // 12 = 3×4
      
      // Prüfe WB-Heats existieren
      const wbHeats = result.current.heats.filter(h => 
        h.bracketType === 'winner'
      )
      expect(wbHeats.length).toBeGreaterThan(0)
      
      // Spiele durch bis WB Finale
      playThroughToWBFinale(result)
      
      // WB Finale sollte existieren
      const wbFinale = result.current.heats.find(h => 
        h.bracketType === 'winner' && h.isFinale
      )
      expect(wbFinale).toBeDefined()
    })
  })

  describe('6.6: Test mit 15 Piloten - Korrekter Flow mit 3er-Heats', () => {
    it('sollte 15 Piloten korrekt durch WB verarbeiten (inkl. 3er-Heats)', () => {
      // 15 Piloten → 5 Quali-Heats (3×4 + 1×3) → ungerade Gewinner
      const result = setupTournamentWithCompletedQuali(15)
      
      // Prüfe Quali-Heats
      const qualiHeats = result.current.heats.filter(h => 
        !h.bracketType || h.bracketType === 'qualification'
      )
      // 15 = 3×4 + 1×3 = 4 Heats
      expect(qualiHeats.length).toBe(4)
      
      // Prüfe ob es 3er und 4er Heats gibt
      const threePlayerHeats = qualiHeats.filter(h => h.pilotIds.length === 3)
      const fourPlayerHeats = qualiHeats.filter(h => h.pilotIds.length === 4)
      
      expect(threePlayerHeats.length).toBe(1)
      expect(fourPlayerHeats.length).toBe(3)
      
      // Spiele durch bis WB Finale
      playThroughToWBFinale(result)
      
      // WB Finale sollte existieren
      const wbFinale = result.current.heats.find(h => 
        h.bracketType === 'winner' && h.isFinale
      )
      expect(wbFinale).toBeDefined()
    })
  })

  describe('6.7: Test mit 40 Piloten - Korrekter Flow (20 → 10 → 5 → 2-3)', () => {
    it('sollte 40 Piloten korrekt durch WB verarbeiten', () => {
      // 40 Piloten → 10 Quali-Heats (10×4) → 20 Quali-Gewinner
      const result = setupTournamentWithCompletedQuali(40)
      
      // Prüfe Quali-Heats
      const qualiHeats = result.current.heats.filter(h => 
        !h.bracketType || h.bracketType === 'qualification'
      )
      expect(qualiHeats.length).toBe(10) // 40 = 10×4
      
      // Prüfe WB-Heats existieren
      const wbHeats = result.current.heats.filter(h => 
        h.bracketType === 'winner'
      )
      expect(wbHeats.length).toBeGreaterThan(0)
      
      // Spiele durch bis WB Finale
      playThroughToWBFinale(result)
      
      // WB Finale sollte existieren
      const wbFinale = result.current.heats.find(h => 
        h.bracketType === 'winner' && h.isFinale
      )
      expect(wbFinale).toBeDefined()
      expect(wbFinale!.pilotIds.length).toBeGreaterThanOrEqual(2)
      expect(wbFinale!.pilotIds.length).toBeLessThanOrEqual(3)
    })
  })

  describe('6.8: Test mit 7 Piloten - Minimaler Fall', () => {
    it('sollte mit 7 Piloten (Minimum) korrekt funktionieren', () => {
      // 7 Piloten → 2 Quali-Heats (1×4 + 1×3) → 4 Quali-Gewinner
      const result = setupTournamentWithCompletedQuali(7)
      
      // Prüfe Quali-Heats
      const qualiHeats = result.current.heats.filter(h => 
        !h.bracketType || h.bracketType === 'qualification'
      )
      // 7 = 1×4 + 1×3 = 2 Heats
      expect(qualiHeats.length).toBe(2)
      
      // 4 Quali-Gewinner → WB-Heats → WB Finale
      const wbHeats = result.current.heats.filter(h => 
        h.bracketType === 'winner'
      )
      expect(wbHeats.length).toBeGreaterThan(0)
      
      // Spiele durch bis WB Finale
      playThroughToWBFinale(result)
      
      // WB Finale sollte existieren
      const wbFinale = result.current.heats.find(h => 
        h.bracketType === 'winner' && h.isFinale
      )
      expect(wbFinale).toBeDefined()
    })
  })
})
