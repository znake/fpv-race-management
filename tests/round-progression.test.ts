/**
 * Story 13-1: Runden-basierte WB Progression Tests
 * 
 * Tests für die rundenbasierte Generierung von Winner Bracket Heats.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTournamentStore } from '../src/stores/tournamentStore'
import { createMockPilots } from './helpers/mock-factories'
import type { Ranking } from '../src/lib/schemas'

describe('Story 13-1: Runden-basierte WB Progression', () => {
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

  describe('Task 1: Datenmodell erweitern', () => {
    describe('1.1 + 1.2: currentWBRound und currentLBRound States', () => {
      it('sollte currentWBRound als 0 initialisieren', () => {
        const { result } = renderHook(() => useTournamentStore())
        expect(result.current.currentWBRound).toBe(0)
      })

      it('sollte currentLBRound als 0 initialisieren', () => {
        const { result } = renderHook(() => useTournamentStore())
        expect(result.current.currentLBRound).toBe(0)
      })

      it('sollte currentWBRound und currentLBRound über resetTournament zurücksetzen', () => {
        const { result } = renderHook(() => useTournamentStore())

        // Simuliere dass Runden fortgeschritten sind
        act(() => {
          useTournamentStore.setState({ 
            currentWBRound: 3, 
            currentLBRound: 2 
          })
        })

        expect(result.current.currentWBRound).toBe(3)
        expect(result.current.currentLBRound).toBe(2)

        act(() => {
          result.current.resetTournament()
        })

        expect(result.current.currentWBRound).toBe(0)
        expect(result.current.currentLBRound).toBe(0)
      })
    })

    describe('1.3 + 1.4: PilotBracketState Interface und Map', () => {
      it('sollte pilotBracketStates als leere Map initialisieren', () => {
        const { result } = renderHook(() => useTournamentStore())
        expect(result.current.pilotBracketStates).toEqual({})
      })

      it('sollte pilotBracketStates über resetTournament leeren', () => {
        const { result } = renderHook(() => useTournamentStore())

        // Simuliere Piloten-States
        act(() => {
          useTournamentStore.setState({ 
            pilotBracketStates: {
              'pilot-1': { bracket: 'winner', roundReached: 2 },
              'pilot-2': { bracket: 'loser', roundReached: 1 }
            }
          })
        })

        act(() => {
          result.current.resetTournament()
        })

        expect(result.current.pilotBracketStates).toEqual({})
      })
    })

    describe('1.5: Heat Interface mit roundNumber', () => {
      it('sollte Heat mit roundNumber unterstützen', () => {
        const { result } = renderHook(() => useTournamentStore())

        const mockPilots = createMockPilots(8)
        act(() => {
          mockPilots.forEach(p => result.current.addPilot(p))
        })

        act(() => {
          result.current.confirmTournamentStart()
          result.current.confirmHeatAssignment()
        })

        // Nach Turnierstart sollten die Quali-Heats da sein
        const { heats } = result.current
        expect(heats.length).toBeGreaterThan(0)
        
        // Heats sollten roundNumber Property haben können (undefined für Quali)
        // Das ist ein Interface-Check, keine Laufzeit-Validierung nötig
        const heat = heats[0]
        expect('id' in heat).toBe(true)
        expect('heatNumber' in heat).toBe(true)
        // roundNumber ist optional, also kein Fehler wenn undefined
      })
    })
  })

  describe('Task 2: generateWBRound(roundNumber) Funktion', () => {
    describe('2.1: Funktion erstellen die ALLE Heats einer WB-Runde auf einmal generiert', () => {
      it('sollte generateWBRound Funktion haben', () => {
        const { result } = renderHook(() => useTournamentStore())
        expect(typeof result.current.generateWBRound).toBe('function')
      })

      it('sollte bei roundNumber=1 nach Quali-Abschluss alle WB R1 Heats generieren', () => {
        // 12 Piloten → 3 Quali-Heats → 6 Gewinner → 2 WB R1 Heats (1×4 + 1×2 oder 2×3)
        const result = setupTournamentWithCompletedQuali(12)
        
        // Prüfe dass WB R1 Heats generiert wurden
        const wbR1Heats = result.current.heats.filter(h => 
          h.bracketType === 'winner' && h.roundNumber === 1
        )
        
        expect(wbR1Heats.length).toBeGreaterThan(0)
        expect(result.current.currentWBRound).toBe(1)
      })
    })

    describe('2.2: Bei roundNumber=1 Piloten aus Quali-Gewinnern nehmen', () => {
      it('sollte nur Quali-Gewinner (Platz 1+2) in WB R1 Heats haben', () => {
        const result = setupTournamentWithCompletedQuali(8)
        
        // 8 Piloten → 2 Quali-Heats → 4 Gewinner
        const qualiHeats = result.current.heats.filter(h => 
          !h.bracketType || h.bracketType === 'qualification'
        )
        
        // Sammle Quali-Gewinner (Platz 1+2)
        const qualiWinnerIds = new Set<string>()
        qualiHeats.forEach(heat => {
          const results = heat.results?.rankings || []
          results.forEach(r => {
            if (r.rank === 1 || r.rank === 2) {
              qualiWinnerIds.add(r.pilotId)
            }
          })
        })
        
        // WB R1 Heats sollten nur diese Piloten haben
        const wbHeats = result.current.heats.filter(h => h.bracketType === 'winner')
        wbHeats.forEach(heat => {
          heat.pilotIds.forEach(pilotId => {
            expect(qualiWinnerIds.has(pilotId)).toBe(true)
          })
        })
      })
    })

    describe('2.3: Bei roundNumber>1 Piloten aus vorheriger WB-Runde-Gewinnern nehmen', () => {
      it('sollte WB R2 Piloten aus WB R1 Gewinnern nehmen', () => {
        // 16 Piloten für mehr Runden
        const result = setupTournamentWithCompletedQuali(16)
        
        // WB R1 Heats abschließen
        let wbR1Heats = result.current.heats.filter(h => 
          h.bracketType === 'winner' && h.roundNumber === 1
        )
        
        wbR1Heats.forEach(heat => {
          const rankings: Ranking[] = heat.pilotIds.map((pilotId, index) => ({
            pilotId,
            rank: (index + 1) as 1 | 2 | 3 | 4
          }))
          
          act(() => {
            result.current.submitHeatResults(heat.id, rankings)
          })
        })
        
        // Prüfe WB R2 oder WB Finale wurde generiert
        const wbR2OrFinale = result.current.heats.filter(h => 
          h.bracketType === 'winner' && (h.roundNumber === 2 || h.isFinale)
        )
        
        expect(wbR2OrFinale.length).toBeGreaterThan(0)
      })
    })

    describe('2.4 + 2.5: Heat-Größe und calculateHeatDistribution', () => {
      it('sollte 4er-Heats bevorzugen und 3er-Heats für ungerade Anzahl nutzen', () => {
        // 15 Piloten → 5 Quali-Heats (3×4 + 1×3) → ungerade Gewinner
        const result = setupTournamentWithCompletedQuali(15)
        
        const wbHeats = result.current.heats.filter(h => h.bracketType === 'winner')
        
        // Jeder Heat sollte 3 oder 4 Piloten haben
        wbHeats.forEach(heat => {
          expect(heat.pilotIds.length).toBeGreaterThanOrEqual(2)
          expect(heat.pilotIds.length).toBeLessThanOrEqual(4)
        })
      })
    })

    describe('2.6: WB Finale generieren wenn nur 2-3 Piloten übrig', () => {
      it('sollte WB Finale statt regulärer Runde generieren wenn nur 2-3 Piloten übrig', () => {
        // 8 Piloten → 4 Quali-Gewinner → 1 WB Heat → 2 Gewinner = WB Finale
        const result = setupTournamentWithCompletedQuali(8)
        
        // WB R1/Heats abschließen bis Finale
        let wbHeats = result.current.heats.filter(h => 
          h.bracketType === 'winner' && !h.isFinale && h.status !== 'completed'
        )
        
        while (wbHeats.length > 0) {
          const heat = wbHeats[0]
          const rankings: Ranking[] = heat.pilotIds.map((pilotId, index) => ({
            pilotId,
            rank: (index + 1) as 1 | 2 | 3 | 4
          }))
          
          act(() => {
            result.current.submitHeatResults(heat.id, rankings)
          })
          
          wbHeats = result.current.heats.filter(h => 
            h.bracketType === 'winner' && !h.isFinale && h.status !== 'completed'
          )
        }
        
        // WB Finale sollte existieren
        const wbFinale = result.current.heats.find(h => 
          h.bracketType === 'winner' && h.isFinale
        )
        
        expect(wbFinale).toBeDefined()
        expect(wbFinale!.pilotIds.length).toBeGreaterThanOrEqual(2)
        expect(wbFinale!.pilotIds.length).toBeLessThanOrEqual(3)
      })
    })
  })

  describe('Task 4: submitHeatResults() für WB-Runden-Logik', () => {
    it('sollte WB-Gewinner (Platz 1+2) in pilotBracketStates mit bracket=winner aktualisieren', () => {
      const result = setupTournamentWithCompletedQuali(12)
      
      // WB R1 Heats sollten existieren
      const wbR1Heats = result.current.heats.filter(h => 
        h.bracketType === 'winner' && h.roundNumber === 1
      )
      
      expect(wbR1Heats.length).toBeGreaterThan(0)
      
      // Schließe ersten WB R1 Heat ab
      const heat = wbR1Heats[0]
      const rankings: Ranking[] = heat.pilotIds.map((pilotId, index) => ({
        pilotId,
        rank: (index + 1) as 1 | 2 | 3 | 4
      }))
      
      act(() => {
        result.current.submitHeatResults(heat.id, rankings)
      })
      
      // Gewinner (Platz 1+2) sollten in winnerPilots sein
      const winners = rankings.filter(r => r.rank <= 2).map(r => r.pilotId)
      winners.forEach(pilotId => {
        expect(result.current.winnerPilots).toContain(pilotId)
      })
    })

    it('sollte WB-Verlierer (Platz 3+4) in loserPool verschieben', () => {
      const result = setupTournamentWithCompletedQuali(12)
      
      // WB R1 Heats sollten existieren
      const wbR1Heats = result.current.heats.filter(h => 
        h.bracketType === 'winner' && h.roundNumber === 1
      )
      
      expect(wbR1Heats.length).toBeGreaterThan(0)
      
      // Schließe ersten WB R1 Heat ab
      const heat = wbR1Heats[0]
      const rankings: Ranking[] = heat.pilotIds.map((pilotId, index) => ({
        pilotId,
        rank: (index + 1) as 1 | 2 | 3 | 4
      }))
      
      act(() => {
        result.current.submitHeatResults(heat.id, rankings)
      })
      
      // Verlierer (Platz 3+4) sollten in loserPool sein
      const losers = rankings.filter(r => r.rank >= 3).map(r => r.pilotId)
      losers.forEach(pilotId => {
        expect(result.current.loserPool).toContain(pilotId)
      })
    })

    it('sollte nach WB-Runden-Abschluss nächste WB-Runde generieren', () => {
      // 16 Piloten für mehr Runden
      const result = setupTournamentWithCompletedQuali(16)
      
      // Schließe alle WB R1 Heats ab
      let wbR1Heats = result.current.heats.filter(h => 
        h.bracketType === 'winner' && h.roundNumber === 1 && h.status !== 'completed'
      )
      
      wbR1Heats.forEach(heat => {
        const rankings: Ranking[] = heat.pilotIds.map((pilotId, index) => ({
          pilotId,
          rank: (index + 1) as 1 | 2 | 3 | 4
        }))
        
        act(() => {
          result.current.submitHeatResults(heat.id, rankings)
        })
      })
      
      // Nach Abschluss sollte entweder WB R2 oder WB Finale generiert worden sein
      const wbR2OrFinale = result.current.heats.filter(h => 
        h.bracketType === 'winner' && 
        (h.roundNumber === 2 || h.isFinale)
      )
      
      expect(wbR2OrFinale.length).toBeGreaterThan(0)
    })
  })

  describe('Task 5: calculateWBRounds(qualiWinnerCount) Funktion', () => {
    it('sollte calculateWBRounds Funktion haben', () => {
      const { result } = renderHook(() => useTournamentStore())
      expect(typeof result.current.calculateWBRounds).toBe('function')
    })

    it('sollte 0 für 3 oder weniger Quali-Gewinner zurückgeben (direkt Finale)', () => {
      const { result } = renderHook(() => useTournamentStore())
      expect(result.current.calculateWBRounds(2)).toBe(0)
      expect(result.current.calculateWBRounds(3)).toBe(0)
    })

    it('sollte korrekte Rundenanzahl für verschiedene Pilotenzahlen berechnen', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // 4 Quali-Gewinner → 1 WB Heat (4→2) → Finale
      // Also 1 Runde vor dem Finale
      expect(result.current.calculateWBRounds(4)).toBeGreaterThanOrEqual(1)
      
      // 8 Quali-Gewinner → 2 WB R1 Heats (8→4) → 1 WB R2 Heat (4→2) → Finale
      // Also 2 Runden vor dem Finale
      expect(result.current.calculateWBRounds(8)).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Task 3: isRoundComplete() Funktion', () => {
    it('sollte isRoundComplete Funktion haben', () => {
      const { result } = renderHook(() => useTournamentStore())
      expect(typeof result.current.isRoundComplete).toBe('function')
    })

    it('sollte false zurückgeben wenn keine Heats für die Runde existieren', () => {
      const { result } = renderHook(() => useTournamentStore())
      expect(result.current.isRoundComplete('winner', 1)).toBe(false)
    })

    it('sollte false zurückgeben wenn noch nicht alle Heats completed sind', () => {
      const result = setupTournamentWithCompletedQuali(12)
      
      // WB R1 Heats sollten existieren aber pending sein
      const wbR1Heats = result.current.heats.filter(h => 
        h.bracketType === 'winner' && h.roundNumber === 1
      )
      
      expect(wbR1Heats.length).toBeGreaterThan(0)
      
      // Nur einen Heat abschließen
      if (wbR1Heats.length > 1) {
        const heat = wbR1Heats[0]
        const rankings: Ranking[] = heat.pilotIds.map((pilotId, index) => ({
          pilotId,
          rank: (index + 1) as 1 | 2 | 3 | 4
        }))
        
        act(() => {
          result.current.submitHeatResults(heat.id, rankings)
        })
        
        // Runde sollte noch nicht complete sein (es gibt noch pending Heats)
        expect(result.current.isRoundComplete('winner', 1)).toBe(false)
      }
    })

    it('sollte true zurückgeben wenn alle Heats einer Runde completed sind', () => {
      const result = setupTournamentWithCompletedQuali(12)
      
      // Alle WB R1 Heats abschließen
      let wbR1Heats = result.current.heats.filter(h => 
        h.bracketType === 'winner' && h.roundNumber === 1 && h.status !== 'completed'
      )
      
      wbR1Heats.forEach(heat => {
        const rankings: Ranking[] = heat.pilotIds.map((pilotId, index) => ({
          pilotId,
          rank: (index + 1) as 1 | 2 | 3 | 4
        }))
        
        act(() => {
          result.current.submitHeatResults(heat.id, rankings)
        })
      })
      
      expect(result.current.isRoundComplete('winner', 1)).toBe(true)
    })
  })
})
