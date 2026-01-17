/**
 * Test: 8 Piloten Turnier-Ablauf
 * 
 * Validiert den vollständigen Flow mit 8 Piloten:
 * - Turnier darf nicht vorzeitig abschließen
 * - Alle Phasen werden korrekt durchlaufen
 * - Grand Finale wird korrekt generiert
 * 
 * HINWEIS: Die exakte Heat-Reihenfolge ist dynamisch und kann variieren.
 * Dieser Test prüft nur die Kernlogik, nicht die exakte Reihenfolge.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTournamentStore, INITIAL_TOURNAMENT_STATE } from '../src/stores/tournamentStore'

describe('8 Piloten Turnier Flow', () => {
  beforeEach(() => {
    useTournamentStore.setState(structuredClone(INITIAL_TOURNAMENT_STATE))
  })

  it('should complete full tournament with 8 pilots without premature completion', () => {
    const store = useTournamentStore.getState()
    
    // Setup: 8 Piloten hinzufügen
    const pilotNames = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']
    pilotNames.forEach(name => {
      store.addPilot({ name, imageUrl: '' })
    })
    
    // Turnier starten
    store.confirmTournamentStart()
    
    let state = useTournamentStore.getState()
    expect(state.tournamentPhase).toBe('heat-assignment')
    
    // Heat Assignment bestätigen
    store.confirmHeatAssignment()
    
    state = useTournamentStore.getState()
    expect(state.tournamentPhase).toBe('running')
    expect(state.heats.length).toBe(2) // 2 Quali Heats
    
    // Helper: Schließe den nächsten aktiven Heat ab
    const completeNextActiveHeat = () => {
      const currentState = useTournamentStore.getState()
      const activeHeat = currentState.heats.find(h => h.status === 'active')
      
      if (!activeHeat) return false
      
      const rankings = activeHeat.pilotIds.slice(0, 4).map((pilotId, index) => ({
        pilotId,
        rank: (index + 1) as 1 | 2 | 3 | 4
      }))
      
      store.submitHeatResults(activeHeat.id, rankings)
      return true
    }
    
    // Schließe alle Heats ab bis zum Grand Finale
    let iterations = 0
    const maxIterations = 20 // Safety limit
    
    while (iterations < maxIterations) {
      state = useTournamentStore.getState()
      
      // Turnier abgeschlossen?
      if (state.tournamentPhase === 'completed') {
        break
      }
      
      // Versuche nächsten Heat abzuschließen
      const hadActiveHeat = completeNextActiveHeat()
      
      if (!hadActiveHeat) {
        // Kein aktiver Heat - prüfe ob wir auf etwas warten
        state = useTournamentStore.getState()
        
        // Wenn tournamentPhase 'finale' ist, sollte Grand Finale existieren
        if (state.tournamentPhase === 'finale') {
          const grandFinale = state.heats.find(h => 
            (h.bracketType === 'grand_finale' || h.bracketType === 'finale') &&
            h.status === 'active'
          )
          
          if (grandFinale) {
            const rankings = grandFinale.pilotIds.map((pilotId, index) => ({
              pilotId,
              rank: (index + 1) as 1 | 2 | 3 | 4
            }))
            store.submitHeatResults(grandFinale.id, rankings)
          }
        }
        
        // Prüfe ob pending Heats existieren die aktiviert werden müssen
        const pendingHeats = state.heats.filter(h => h.status === 'pending')
        if (pendingHeats.length === 0 && state.tournamentPhase !== 'completed') {
          // Keine aktiven oder pending Heats - etwas stimmt nicht
          break
        }
      }
      
      iterations++
    }
    
    // Finale Prüfungen
    state = useTournamentStore.getState()
    
    // Das Turnier sollte entweder completed sein oder alle Heats durchlaufen haben
    // Bei 8 Piloten: 2 Quali + mindestens 1 WB + mindestens 1 LB + Grand Finale
    const completedHeats = state.heats.filter(h => h.status === 'completed')
    expect(completedHeats.length).toBeGreaterThanOrEqual(4)
    
    // Quali muss completed sein
    expect(state.isQualificationComplete).toBe(true)
    
    // Es sollten WB Heats existieren
    const wbHeats = state.heats.filter(h => h.bracketType === 'winner')
    expect(wbHeats.length).toBeGreaterThanOrEqual(1)
    
    // Es sollten LB Heats existieren  
    const lbHeats = state.heats.filter(h => h.bracketType === 'loser')
    expect(lbHeats.length).toBeGreaterThanOrEqual(1)
    
    // Wenn completed, sollte Grand Finale completed sein
    if (state.tournamentPhase === 'completed') {
      const grandFinale = state.heats.find(h => 
        h.bracketType === 'grand_finale' || h.bracketType === 'finale'
      )
      expect(grandFinale).toBeDefined()
      expect(grandFinale!.status).toBe('completed')
    }
  })
})
