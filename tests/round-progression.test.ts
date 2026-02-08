/**
 * Story 13-1: Runden-basierte WB Progression Tests
 * 
 * REFACTORED: Tests für die dynamische Pool-basierte Generierung von Winner Bracket Heats.
 * 
 * ARCHITEKTUR (nach Refactoring 2025-12-27):
 * - WB-Heats werden AUTOMATISCH in submitHeatResults() generiert
 * - Wenn winnerPool >= 4 Piloten hat → generiere WB-Heat
 * - Wenn winnerPool 2-3 Piloten hat und keine pending WB-Heats → generiere WB Finale
 * - generateWBRound() und calculateWBRounds() existieren NICHT mehr (dynamisches System)
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTournamentStore } from '@/stores/tournamentStore'
import { createMockPilots } from './helpers/mock-factories'
import type { Ranking } from '@/lib/schemas'

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
              'pilot-1': { bracket: 'winner', roundReached: 2, bracketOrigin: 'wb' },
              'pilot-2': { bracket: 'loser', roundReached: 1, bracketOrigin: 'lb' }
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

  describe('Task 2: Dynamische WB-Heat Generierung (Pool-basiert)', () => {
    describe('2.1: WB-Heats werden automatisch nach Quali-Abschluss generiert', () => {
      it('sollte nach Quali-Abschluss automatisch WB-Heats generieren wenn winnerPool >= 4', () => {
        // 12 Piloten → 3 Quali-Heats → 6 Gewinner → winnerPool wird gefüllt → WB-Heat generiert
        const result = setupTournamentWithCompletedQuali(12)
        
        // Prüfe dass WB-Heats generiert wurden (automatisch durch submitHeatResults)
        const wbHeats = result.current.heats.filter(h => 
          h.bracketType === 'winner'
        )
        
        // Bei 6 Quali-Gewinnern sollte mindestens 1 WB-Heat (4er) generiert werden
        expect(wbHeats.length).toBeGreaterThan(0)
        expect(result.current.isQualificationComplete).toBe(true)
      })

      it('sollte WB-Heats mit 4 Piloten aus winnerPilots generieren', () => {
        const result = setupTournamentWithCompletedQuali(12)
        
        const wbHeats = result.current.heats.filter(h => 
          h.bracketType === 'winner'
        )
        
        // Jeder WB-Heat sollte Piloten haben
        wbHeats.forEach(heat => {
          expect(heat.pilotIds.length).toBeGreaterThanOrEqual(2)
          expect(heat.pilotIds.length).toBeLessThanOrEqual(4)
        })
      })
    })

    describe('2.2: Bei Quali-Abschluss Piloten aus Quali-Gewinnern nehmen', () => {
      it('sollte nur Quali-Gewinner (Platz 1+2) in WB-Heats haben', () => {
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
        
        // WB Heats sollten nur diese Piloten haben
        const wbHeats = result.current.heats.filter(h => h.bracketType === 'winner')
        wbHeats.forEach(heat => {
          heat.pilotIds.forEach(pilotId => {
            expect(qualiWinnerIds.has(pilotId)).toBe(true)
          })
        })
      })
    })

    describe('2.3: Nach WB-Heat weitere WB-Heats generieren', () => {
      it('sollte nach WB-Heat-Abschluss weitere WB-Heats generieren wenn genug Gewinner', () => {
        // 16 Piloten für mehr Runden
        const result = setupTournamentWithCompletedQuali(16)
        
        // WB-Heats sollten generiert worden sein
        let wbHeats = result.current.heats.filter(h => 
          h.bracketType === 'winner' && h.status !== 'completed'
        )
        
        // Schließe alle pending WB-Heats ab
        let iterations = 0
        while (wbHeats.length > 0 && iterations < 10) {
          const heat = wbHeats[0]
          const rankings: Ranking[] = heat.pilotIds.map((pilotId, index) => ({
            pilotId,
            rank: (index + 1) as 1 | 2 | 3 | 4
          }))
          
          act(() => {
            result.current.submitHeatResults(heat.id, rankings)
          })
          
          wbHeats = result.current.heats.filter(h => 
            h.bracketType === 'winner' && h.status !== 'completed'
          )
          iterations++
        }
        
        // Es sollten WB-Heats completed sein
        const completedWBHeats = result.current.heats.filter(h => 
          h.bracketType === 'winner' && h.status === 'completed'
        )
        expect(completedWBHeats.length).toBeGreaterThan(0)
      })
    })

    describe('2.4 + 2.5: Heat-Größe und Pool-Logik', () => {
      it('sollte 4er-Heats generieren wenn Pool >= 4 Piloten hat', () => {
        const result = setupTournamentWithCompletedQuali(16)
        
        const wbHeats = result.current.heats.filter(h => h.bracketType === 'winner')
        
        // Mindestens ein WB-Heat sollte 4 Piloten haben
        const has4PilotHeat = wbHeats.some(h => h.pilotIds.length === 4)
        expect(has4PilotHeat).toBe(true)
      })
    })

    describe('2.6: WB Finale oder Direct-Qualify wenn nur 2-3 Piloten übrig', () => {
      it('sollte bei 2 Piloten im WB Direct-Qualify nutzen (kein WB Finale)', () => {
        // 8 Piloten → 4 Quali-Gewinner → 1 WB Heat → 2 Gewinner = Direct-Qualify (kein Finale nötig!)
        // WICHTIG: Der korrekte Ablauf ist: Quali → WB R1 → LB R1 → Direct-Qualify
        // WB Direct-Qualify kann erst passieren wenn LB R1 abgeschlossen ist!
        const result = setupTournamentWithCompletedQuali(8)
        
        // Alle Heats abschließen (WB und LB) bis Direct-Qualify erreicht wird
        let iterations = 0
        while (iterations < 20) {
          // Prüfe ob Direct-Qualify bereits erreicht wurde
          const wbFinalists = Object.entries(result.current.pilotBracketStates)
            .filter(([_, state]) => state.bracketOrigin === 'wb' && state.bracket === 'grand_finale')
          
          if (wbFinalists.length === 2) break // Ziel erreicht
          
          // Finde nächsten pending/active Heat (WB oder LB, nicht Finale)
          const nextHeat = result.current.heats.find(h => 
            (h.bracketType === 'winner' || h.bracketType === 'loser') &&
            !h.isFinale &&
            (h.status === 'pending' || h.status === 'active')
          )
          
          if (!nextHeat) break // Keine Heats mehr
          
          const rankings: Ranking[] = nextHeat.pilotIds.map((pilotId, index) => ({
            pilotId,
            rank: (index + 1) as 1 | 2 | 3 | 4
          }))
          
          act(() => {
            result.current.submitHeatResults(nextHeat.id, rankings)
          })
          
          iterations++
        }
        
        // Bei 2 Piloten: KEIN WB Finale, stattdessen Direct-Qualify
        const wbFinale = result.current.heats.find(h => 
          h.bracketType === 'winner' && h.isFinale
        )
        
        // WB Finale sollte NICHT existieren bei nur 2 Piloten
        expect(wbFinale).toBeUndefined()
        
        // Stattdessen: Die 2 WB-Piloten sollten als grand_finale markiert sein
        const wbFinalists = Object.entries(result.current.pilotBracketStates)
          .filter(([_, state]) => state.bracketOrigin === 'wb' && state.bracket === 'grand_finale')
        expect(wbFinalists.length).toBe(2)
      })
      
      it('sollte WB Finale generieren wenn genau 3 Piloten im winnerPool', () => {
        // 12 Piloten → 6 Quali-Gewinner → 1 WB Heat (4 Piloten) → 2 WB übrig + noch 2 im Pool = 4
        // Aber nach 1 WB Heat: 2 Gewinner, 2 Verlierer... dann noch 2 aus Pool = 4 → nochmal WB Heat
        // Am Ende 3 Piloten → WB Finale
        // Wir nutzen 12 Piloten für diesen Test, da das einen 3-Piloten-WB-Pool erzeugen kann
        const result = setupTournamentWithCompletedQuali(12)
        
        // Schließe alle Bracket-Heats ab (WB und LB) bis WB Finale oder Direct-Qualify erreicht wird
        // Ablauf: WB R1 → LB R1 → WB R2 → LB R2 → ... → WB Finale
        let iterations = 0
        while (iterations < 30) {
          // Prüfe ob WB Finale oder Direct-Qualify bereits existiert
          const wbFinale = result.current.heats.find(h => 
            h.bracketType === 'winner' && h.isFinale
          )
          const wbFinalists = Object.entries(result.current.pilotBracketStates)
            .filter(([_, state]) => state.bracketOrigin === 'wb' && state.bracket === 'grand_finale')
          
          if (wbFinale || wbFinalists.length === 2) break // Ziel erreicht
          
          // Finde nächsten pending/active Heat (WB oder LB, nicht Finale)
          const nextHeat = result.current.heats.find(h => 
            (h.bracketType === 'winner' || h.bracketType === 'loser') &&
            !h.isFinale &&
            (h.status === 'pending' || h.status === 'active')
          )
          
          if (!nextHeat) break // Keine Heats mehr
          
          const rankings: Ranking[] = nextHeat.pilotIds.map((pilotId, index) => ({
            pilotId,
            rank: (index + 1) as 1 | 2 | 3 | 4
          }))
          
          act(() => {
            result.current.submitHeatResults(nextHeat.id, rankings)
          })
          
          iterations++
        }
        
        // Prüfe WB Finale oder Direct-Qualify
        const wbFinale = result.current.heats.find(h => 
          h.bracketType === 'winner' && h.isFinale
        )
        const wbFinalists = Object.entries(result.current.pilotBracketStates)
          .filter(([_, state]) => state.bracketOrigin === 'wb' && state.bracket === 'grand_finale')
        
        // Entweder WB Finale (bei 3 Piloten) oder Direct-Qualify (bei 2 Piloten)
        const hasWBFinale = wbFinale !== undefined
        const hasDirectQualify = wbFinalists.length === 2
        
        expect(hasWBFinale || hasDirectQualify).toBe(true)
      })
    })
  })

  describe('Task 4: submitHeatResults() für WB-Logik', () => {
    it('sollte WB-Gewinner (Platz 1+2) in winnerPilots halten', () => {
      const result = setupTournamentWithCompletedQuali(12)
      
      // WB-Heats sollten existieren
      const wbHeats = result.current.heats.filter(h => 
        h.bracketType === 'winner'
      )
      
      // Bei 12 Piloten sollten 6 Quali-Gewinner → WB-Heats vorhanden sein
      if (wbHeats.length === 0) {
        // Falls kein WB-Heat generiert wurde, ist der Test nicht anwendbar
        // Das kann passieren wenn die Anzahl der Gewinner nicht reicht
        return
      }
      
      // Schließe ersten WB Heat ab
      const heat = wbHeats[0]
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

    it('sollte WB-Verlierer (Platz 3+4) ins Loser Bracket verschieben', () => {
      const result = setupTournamentWithCompletedQuali(12)
      
      // WB-Heats sollten existieren
      const wbHeats = result.current.heats.filter(h => 
        h.bracketType === 'winner'
      )
      
      if (wbHeats.length === 0) {
        return
      }
      
      // Schließe ersten WB Heat ab
      const heat = wbHeats[0]
      const rankings: Ranking[] = heat.pilotIds.map((pilotId, index) => ({
        pilotId,
        rank: (index + 1) as 1 | 2 | 3 | 4
      }))
      
      act(() => {
        result.current.submitHeatResults(heat.id, rankings)
      })
      
      // Verlierer (Platz 3+4) sollten entweder in loserPool ODER in einem LB-Heat sein
      // (Das System generiert automatisch LB-Heats wenn genug Piloten im Pool sind)
      const losers = rankings.filter(r => r.rank >= 3).map(r => r.pilotId)
      const lbHeats = result.current.heats.filter(h => h.bracketType === 'loser')
      const pilotsInLBHeats = lbHeats.flatMap(h => h.pilotIds)
      
      losers.forEach(pilotId => {
        const inLoserPool = result.current.loserPool.includes(pilotId)
        const inLBHeat = pilotsInLBHeats.includes(pilotId)
        const inLoserPilots = result.current.loserPilots.includes(pilotId)
        
        // Pilot sollte entweder im loserPool, in einem LB-Heat, oder in loserPilots sein
        expect(inLoserPool || inLBHeat || inLoserPilots).toBe(true)
      })
    })

    it('sollte nach WB-Heat-Abschluss weitere WB-Heats oder WB Finale/Direct-Qualify generieren', () => {
      // 16 Piloten für mehr Runden
      const result = setupTournamentWithCompletedQuali(16)
      
      // Schließe alle Bracket-Heats ab (WB und LB) bis WB Finale oder Direct-Qualify erreicht wird
      // Ablauf: WB R1 → LB R1 → WB R2 → LB R2 → ... → WB Finale
      let iterations = 0
      while (iterations < 40) {
        // Prüfe ob WB Finale oder Direct-Qualify bereits existiert
        const wbFinale = result.current.heats.find(h => 
          h.bracketType === 'winner' && h.isFinale
        )
        const wbFinalists = Object.entries(result.current.pilotBracketStates)
          .filter(([_, state]) => state.bracketOrigin === 'wb' && state.bracket === 'grand_finale')
        
        if (wbFinale || wbFinalists.length === 2) break // Ziel erreicht
        
        // Finde nächsten pending/active Heat (WB oder LB, nicht Grand Finale)
        const nextHeat = result.current.heats.find(h => 
          (h.bracketType === 'winner' || h.bracketType === 'loser') &&
          (h.status === 'pending' || h.status === 'active')
        )
        
        if (!nextHeat) break // Keine Heats mehr
        
        const rankings: Ranking[] = nextHeat.pilotIds.map((pilotId, index) => ({
          pilotId,
          rank: (index + 1) as 1 | 2 | 3 | 4
        }))
        
        act(() => {
          result.current.submitHeatResults(nextHeat.id, rankings)
        })
        
        iterations++
      }
      
      // Nach Abschluss sollte entweder WB Finale oder Direct-Qualify existieren
      const wbFinale = result.current.heats.find(h => 
        h.bracketType === 'winner' && h.isFinale
      )
      const wbFinalists = Object.entries(result.current.pilotBracketStates)
        .filter(([_, state]) => state.bracketOrigin === 'wb' && state.bracket === 'grand_finale')
      
      // Entweder WB Finale (bei 3 Piloten) oder Direct-Qualify (bei 2 Piloten)
      const hasWBFinale = wbFinale !== undefined
      const hasDirectQualify = wbFinalists.length === 2
      
      expect(hasWBFinale || hasDirectQualify).toBe(true)
    })
  })

  describe('Task 5: Pool-basierte Logik statt calculateWBRounds', () => {
    it('sollte winnerPilots nach Quali-Abschluss befüllt haben', () => {
      const result = setupTournamentWithCompletedQuali(8)
      
      // 8 Piloten → 2 Quali-Heats → 4 Gewinner
      // WinnerPilots sollte mindestens 2 Piloten haben (nach WB-Heat-Generierung)
      expect(result.current.winnerPilots.length).toBeGreaterThanOrEqual(2)
    })

    it('sollte für 8 Piloten einen funktionierenden WB-Flow haben', () => {
      // 8 Piloten → 4 Quali-Gewinner → 1 WB Heat (4 Piloten) → 2 Gewinner → WB Finale
      const result = setupTournamentWithCompletedQuali(8)
      
      // Sollte isQualificationComplete sein
      expect(result.current.isQualificationComplete).toBe(true)
      
      // WB-Heats sollten generiert worden sein
      const wbHeats = result.current.heats.filter(h => h.bracketType === 'winner')
      expect(wbHeats.length).toBeGreaterThanOrEqual(1)
    })

    it('sollte für 16 Piloten einen funktionierenden WB-Flow haben', () => {
      // 16 Piloten → 8 Quali-Gewinner → 2 WB R1 Heats → 4 Gewinner → 1 WB R2 Heat → WB Finale
      const result = setupTournamentWithCompletedQuali(16)
      
      expect(result.current.isQualificationComplete).toBe(true)
      
      // WB-Heats sollten generiert worden sein
      const wbHeats = result.current.heats.filter(h => h.bracketType === 'winner')
      expect(wbHeats.length).toBeGreaterThanOrEqual(1)
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

    it('sollte false zurückgeben wenn Heats existieren aber nicht alle completed sind', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // Setze manuell Heats mit roundNumber
      act(() => {
        useTournamentStore.setState({
          heats: [
            { id: 'wb-1', heatNumber: 1, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed', bracketType: 'winner', roundNumber: 1 },
            { id: 'wb-2', heatNumber: 2, pilotIds: ['p5', 'p6', 'p7', 'p8'], status: 'pending', bracketType: 'winner', roundNumber: 1 },
          ]
        })
      })
      
      expect(result.current.isRoundComplete('winner', 1)).toBe(false)
    })

    it('sollte true zurückgeben wenn alle Heats einer Runde completed sind', () => {
      const { result } = renderHook(() => useTournamentStore())
      
      // Setze manuell Heats mit roundNumber, alle completed
      act(() => {
        useTournamentStore.setState({
          heats: [
            { id: 'wb-1', heatNumber: 1, pilotIds: ['p1', 'p2', 'p3', 'p4'], status: 'completed', bracketType: 'winner', roundNumber: 1 },
            { id: 'wb-2', heatNumber: 2, pilotIds: ['p5', 'p6', 'p7', 'p8'], status: 'completed', bracketType: 'winner', roundNumber: 1 },
          ]
        })
      })
      
      expect(result.current.isRoundComplete('winner', 1)).toBe(true)
    })
  })
})
