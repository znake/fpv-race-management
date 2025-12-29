/**
 * Test: 8 Piloten Turnier-Ablauf
 * 
 * Validiert den vollständigen Flow mit 8 Piloten:
 * 1. Heat 1-2: Qualification (je 4 Piloten)
 * 2. Heat 3: WB (4 aus Quali) → 2 WB Pool, 2 → LB Pool
 * 3. Heat 4: LB (4 aus LB Pool) → 2 LB Pool, 2 eliminiert
 * 4. Heat 5: WB Finale (2) → 1 WB Champion, 1 → LB Pool
 * 5. Heat 6: LB (4) → 2 LB Pool, 2 eliminiert
 * 6. Heat 7: LB Finale → 1 LB Champion
 * 7. Heat 8: Grand Finale
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
    
    // ===== HEAT 1 (Quali) =====
    const heat1 = state.heats[0]
    expect(heat1.status).toBe('active')
    
    store.submitHeatResults(heat1.id, [
      { pilotId: heat1.pilotIds[0], rank: 1 },
      { pilotId: heat1.pilotIds[1], rank: 2 },
      { pilotId: heat1.pilotIds[2], rank: 3 },
      { pilotId: heat1.pilotIds[3], rank: 4 },
    ])
    
    state = useTournamentStore.getState()
    expect(state.tournamentPhase).toBe('running')
    expect(state.heats[0].status).toBe('completed')
    
    // ===== HEAT 2 (Quali) =====
    const heat2 = state.heats[1]
    expect(heat2.status).toBe('active')
    
    store.submitHeatResults(heat2.id, [
      { pilotId: heat2.pilotIds[0], rank: 1 },
      { pilotId: heat2.pilotIds[1], rank: 2 },
      { pilotId: heat2.pilotIds[2], rank: 3 },
      { pilotId: heat2.pilotIds[3], rank: 4 },
    ])
    
    state = useTournamentStore.getState()
    expect(state.tournamentPhase).toBe('running')
    expect(state.isQualificationComplete).toBe(true)
    
    // Nach Quali sollten WB und LB Heats generiert werden
    expect(state.heats.length).toBeGreaterThan(2)
    
    // ===== HEAT 3 (WB) =====
    const heat3 = state.heats.find(h => h.bracketType === 'winner' && h.status === 'active')
    expect(heat3).toBeDefined()
    expect(heat3!.pilotIds.length).toBe(4)
    
    store.submitHeatResults(heat3!.id, [
      { pilotId: heat3!.pilotIds[0], rank: 1 },
      { pilotId: heat3!.pilotIds[1], rank: 2 },
      { pilotId: heat3!.pilotIds[2], rank: 3 },
      { pilotId: heat3!.pilotIds[3], rank: 4 },
    ])
    
    state = useTournamentStore.getState()
    expect(state.tournamentPhase).toBe('running')
    
    // ===== HEAT 4 (LB) =====
    const heat4 = state.heats.find(h => h.bracketType === 'loser' && h.status === 'active')
    expect(heat4).toBeDefined()
    
    store.submitHeatResults(heat4!.id, [
      { pilotId: heat4!.pilotIds[0], rank: 1 },
      { pilotId: heat4!.pilotIds[1], rank: 2 },
      { pilotId: heat4!.pilotIds[2], rank: 3 },
      { pilotId: heat4!.pilotIds[3], rank: 4 },
    ])
    
    state = useTournamentStore.getState()
    expect(state.tournamentPhase).toBe('running')
    
    // ===== HEAT 5 (WB Finale) =====
    const wbFinale = state.heats.find(h => h.bracketType === 'winner' && h.isFinale && h.status === 'active')
    expect(wbFinale).toBeDefined()
    expect(wbFinale!.pilotIds.length).toBe(2)
    
    store.submitHeatResults(wbFinale!.id, [
      { pilotId: wbFinale!.pilotIds[0], rank: 1 },
      { pilotId: wbFinale!.pilotIds[1], rank: 2 },
    ])
    
    state = useTournamentStore.getState()
    // KRITISCH: Nach WB Finale darf Turnier NICHT completed sein!
    expect(state.tournamentPhase).not.toBe('completed')
    expect(state.tournamentPhase).toBe('running')
    
    // ===== HEAT 6 (LB mit 4 Piloten) =====
    const heat6 = state.heats.find(h => h.bracketType === 'loser' && !h.isFinale && h.status === 'active')
    expect(heat6).toBeDefined()
    expect(heat6!.pilotIds.length).toBe(4)
    
    store.submitHeatResults(heat6!.id, [
      { pilotId: heat6!.pilotIds[0], rank: 1 },
      { pilotId: heat6!.pilotIds[1], rank: 2 },
      { pilotId: heat6!.pilotIds[2], rank: 3 },
      { pilotId: heat6!.pilotIds[3], rank: 4 },
    ])
    
    state = useTournamentStore.getState()
    expect(state.tournamentPhase).not.toBe('completed')
    
    // ===== HEAT 7 (LB Finale) =====
    const lbFinale = state.heats.find(h => h.bracketType === 'loser' && h.isFinale && h.status === 'active')
    expect(lbFinale).toBeDefined()
    expect(lbFinale!.pilotIds.length).toBeGreaterThanOrEqual(2)
    expect(lbFinale!.pilotIds.length).toBeLessThanOrEqual(3)
    
    store.submitHeatResults(lbFinale!.id, [
      { pilotId: lbFinale!.pilotIds[0], rank: 1 },
      { pilotId: lbFinale!.pilotIds[1], rank: 2 },
      ...(lbFinale!.pilotIds[2] ? [{ pilotId: lbFinale!.pilotIds[2], rank: 3 }] : [])
    ])
    
    state = useTournamentStore.getState()
    // Nach LB Finale sollte Grand Finale generiert werden
    expect(state.tournamentPhase).toBe('finale')
    
    // ===== HEAT 8 (Grand Finale) =====
    const grandFinale = state.heats.find(h => h.bracketType === 'grand_finale' && h.status === 'active')
    expect(grandFinale).toBeDefined()
    expect(grandFinale!.pilotIds.length).toBe(2)
    
    store.submitHeatResults(grandFinale!.id, [
      { pilotId: grandFinale!.pilotIds[0], rank: 1 },
      { pilotId: grandFinale!.pilotIds[1], rank: 2 },
    ])
    
    state = useTournamentStore.getState()
    // JETZT sollte das Turnier completed sein!
    expect(state.tournamentPhase).toBe('completed')
  })
})
