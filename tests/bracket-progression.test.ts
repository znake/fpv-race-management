import { describe, it, expect, beforeEach } from 'vitest'
import { useTournamentStore } from '../src/stores/tournamentStore'

/**
 * Bracket Progression Tests
 * 
 * Tests für Story 4-2 Tasks 7-12:
 * - useBracketLogic Hook Funktionalität
 * - Quali-Heats → Bracket-Struktur Synchronisation
 * - Winner-Bracket Progression (Rang 1+2)
 * - Loser-Bracket Progression (Rang 3+4)
 * - Nächste Runde Generierung
 */

// Test helper: Create mock pilots
function createMockPilots(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `pilot-${i + 1}`,
    name: `Pilot ${i + 1}`,
    imageUrl: `https://example.com/pilot${i + 1}.jpg`,
  }))
}

// Test helper: Setup tournament with heats
function setupTournamentWithHeats(pilotCount: number) {
  const store = useTournamentStore.getState()
  
  // Clear and add pilots
  store.resetAll()
  const pilots = createMockPilots(pilotCount)
  pilots.forEach(p => store.addPilot(p))
  
  // Start tournament (generates heats + bracket structure)
  store.confirmTournamentStart()
  store.confirmHeatAssignment()
  
  return useTournamentStore.getState()
}

describe('Task 7: useBracketLogic Hook', () => {
  beforeEach(() => {
    useTournamentStore.getState().resetAll()
  })

  describe('syncQualiHeatsToStructure', () => {
    it('should sync quali heats to fullBracketStructure on tournament start', () => {
      const state = setupTournamentWithHeats(8) // 2 Quali-Heats
      
      // Check that quali heats are synced to bracket structure
      expect(state.fullBracketStructure).not.toBeNull()
      expect(state.fullBracketStructure!.qualification.heats.length).toBe(2)
      
      // Each quali heat should have pilotIds from actual heats
      const qualiHeat1 = state.fullBracketStructure!.qualification.heats[0]
      const qualiHeat2 = state.fullBracketStructure!.qualification.heats[1]
      
      expect(qualiHeat1.pilotIds.length).toBe(4)
      expect(qualiHeat2.pilotIds.length).toBe(4)
      // First heat is active (ready to play), others are pending
      expect(qualiHeat1.status).toBe('active')
    })

    it('should match heats[] IDs with fullBracketStructure.qualification', () => {
      const state = setupTournamentWithHeats(8)
      
      // Each heat in heats[] should have a matching bracket heat
      state.heats.forEach((heat, idx) => {
        const bracketHeat = state.fullBracketStructure!.qualification.heats[idx]
        expect(bracketHeat).toBeDefined()
        expect(bracketHeat.pilotIds).toEqual(heat.pilotIds)
      })
    })
  })
})

describe('Task 8: Bracket-Struktur Synchronisation', () => {
  beforeEach(() => {
    useTournamentStore.getState().resetAll()
  })

  it('should update bracket heat status when real heat is completed', () => {
    const state = setupTournamentWithHeats(8)
    const store = useTournamentStore.getState()
    
    // Get first heat
    const firstHeat = state.heats[0]
    
    // Submit results for first heat
    store.submitHeatResults(firstHeat.id, [
      { pilotId: firstHeat.pilotIds[0], rank: 1 },
      { pilotId: firstHeat.pilotIds[1], rank: 2 },
      { pilotId: firstHeat.pilotIds[2], rank: 3 },
      { pilotId: firstHeat.pilotIds[3], rank: 4 },
    ])
    
    // Check bracket structure is updated
    const updatedState = useTournamentStore.getState()
    const bracketQualiHeat = updatedState.fullBracketStructure!.qualification.heats[0]
    
    expect(bracketQualiHeat.status).toBe('completed')
  })
})

describe('Task 9: Winner-Bracket Piloten befüllen', () => {
  beforeEach(() => {
    useTournamentStore.getState().resetAll()
  })

  it('should assign rank 1+2 pilots to winner bracket heat after quali completion', () => {
    const state = setupTournamentWithHeats(8)
    const store = useTournamentStore.getState()
    
    // Get both heats
    const heat1 = state.heats[0]
    const heat2 = state.heats[1]
    
    // Complete both quali heats
    store.submitHeatResults(heat1.id, [
      { pilotId: heat1.pilotIds[0], rank: 1 },
      { pilotId: heat1.pilotIds[1], rank: 2 },
      { pilotId: heat1.pilotIds[2], rank: 3 },
      { pilotId: heat1.pilotIds[3], rank: 4 },
    ])
    
    store.submitHeatResults(heat2.id, [
      { pilotId: heat2.pilotIds[0], rank: 1 },
      { pilotId: heat2.pilotIds[1], rank: 2 },
      { pilotId: heat2.pilotIds[2], rank: 3 },
      { pilotId: heat2.pilotIds[3], rank: 4 },
    ])
    
    const updatedState = useTournamentStore.getState()
    
    // Check winner bracket has pilots
    const wbRound1 = updatedState.fullBracketStructure!.winnerBracket.rounds[0]
    expect(wbRound1).toBeDefined()
    expect(wbRound1.heats.length).toBeGreaterThan(0)
    
    // First WB heat should have 4 winners (2 from each quali heat)
    const wbHeat1 = wbRound1.heats[0]
    expect(wbHeat1.pilotIds.length).toBe(4)
    
    // Verify it contains rank 1+2 pilots from quali heats
    expect(wbHeat1.pilotIds).toContain(heat1.pilotIds[0]) // Rank 1 from heat 1
    expect(wbHeat1.pilotIds).toContain(heat1.pilotIds[1]) // Rank 2 from heat 1
    expect(wbHeat1.pilotIds).toContain(heat2.pilotIds[0]) // Rank 1 from heat 2
    expect(wbHeat1.pilotIds).toContain(heat2.pilotIds[1]) // Rank 2 from heat 2
  })

  it('should set winner bracket heat status to pending when full', () => {
    const state = setupTournamentWithHeats(8)
    const store = useTournamentStore.getState()
    
    // Complete both quali heats
    const heat1 = state.heats[0]
    const heat2 = state.heats[1]
    
    store.submitHeatResults(heat1.id, [
      { pilotId: heat1.pilotIds[0], rank: 1 },
      { pilotId: heat1.pilotIds[1], rank: 2 },
      { pilotId: heat1.pilotIds[2], rank: 3 },
      { pilotId: heat1.pilotIds[3], rank: 4 },
    ])
    
    store.submitHeatResults(heat2.id, [
      { pilotId: heat2.pilotIds[0], rank: 1 },
      { pilotId: heat2.pilotIds[1], rank: 2 },
      { pilotId: heat2.pilotIds[2], rank: 3 },
      { pilotId: heat2.pilotIds[3], rank: 4 },
    ])
    
    const updatedState = useTournamentStore.getState()
    const wbHeat1 = updatedState.fullBracketStructure!.winnerBracket.rounds[0].heats[0]
    
    expect(wbHeat1.status).toBe('pending')
  })
})

describe('Task 10: Loser-Bracket Piloten befüllen', () => {
  beforeEach(() => {
    useTournamentStore.getState().resetAll()
  })

  it('should assign rank 3+4 pilots to loser bracket heat after quali completion', () => {
    const state = setupTournamentWithHeats(8)
    const store = useTournamentStore.getState()
    
    const heat1 = state.heats[0]
    const heat2 = state.heats[1]
    
    // Complete both quali heats
    store.submitHeatResults(heat1.id, [
      { pilotId: heat1.pilotIds[0], rank: 1 },
      { pilotId: heat1.pilotIds[1], rank: 2 },
      { pilotId: heat1.pilotIds[2], rank: 3 },
      { pilotId: heat1.pilotIds[3], rank: 4 },
    ])
    
    store.submitHeatResults(heat2.id, [
      { pilotId: heat2.pilotIds[0], rank: 1 },
      { pilotId: heat2.pilotIds[1], rank: 2 },
      { pilotId: heat2.pilotIds[2], rank: 3 },
      { pilotId: heat2.pilotIds[3], rank: 4 },
    ])
    
    const updatedState = useTournamentStore.getState()
    
    // Check loser bracket has pilots
    const lbRound1 = updatedState.fullBracketStructure!.loserBracket.rounds[0]
    expect(lbRound1).toBeDefined()
    expect(lbRound1.heats.length).toBeGreaterThan(0)
    
    // First LB heat should have 4 losers (2 from each quali heat)
    const lbHeat1 = lbRound1.heats[0]
    expect(lbHeat1.pilotIds.length).toBe(4)
    
    // Verify it contains rank 3+4 pilots from quali heats
    expect(lbHeat1.pilotIds).toContain(heat1.pilotIds[2]) // Rank 3 from heat 1
    expect(lbHeat1.pilotIds).toContain(heat1.pilotIds[3]) // Rank 4 from heat 1
    expect(lbHeat1.pilotIds).toContain(heat2.pilotIds[2]) // Rank 3 from heat 2
    expect(lbHeat1.pilotIds).toContain(heat2.pilotIds[3]) // Rank 4 from heat 2
  })

  it('should handle 3-pilot heat correctly (only rank 1-3)', () => {
    const state = setupTournamentWithHeats(7) // 1x 4er + 1x 3er Heat
    const store = useTournamentStore.getState()
    
    // Find 3-pilot heat
    const threePlayerHeat = state.heats.find(h => h.pilotIds.length === 3)
    expect(threePlayerHeat).toBeDefined()
    
    // Complete 3-pilot heat with ranks 1-3 only
    store.submitHeatResults(threePlayerHeat!.id, [
      { pilotId: threePlayerHeat!.pilotIds[0], rank: 1 },
      { pilotId: threePlayerHeat!.pilotIds[1], rank: 2 },
      { pilotId: threePlayerHeat!.pilotIds[2], rank: 3 },
    ])
    
    const updatedState = useTournamentStore.getState()
    
    // Rank 1+2 should be in winner bracket
    expect(updatedState.winnerPilots).toContain(threePlayerHeat!.pilotIds[0])
    expect(updatedState.winnerPilots).toContain(threePlayerHeat!.pilotIds[1])
    
    // Rank 3 should be in loser bracket (not eliminated)
    expect(updatedState.loserPilots).toContain(threePlayerHeat!.pilotIds[2])
  })
})

describe('Task 11: Spielbare Heats generieren', () => {
  beforeEach(() => {
    useTournamentStore.getState().resetAll()
  })

  it('should generate WB round 1 heats in heats[] after all quali completed', () => {
    const state = setupTournamentWithHeats(8)
    const store = useTournamentStore.getState()
    
    const heat1 = state.heats[0]
    const heat2 = state.heats[1]
    
    // Complete all quali heats
    store.submitHeatResults(heat1.id, [
      { pilotId: heat1.pilotIds[0], rank: 1 },
      { pilotId: heat1.pilotIds[1], rank: 2 },
      { pilotId: heat1.pilotIds[2], rank: 3 },
      { pilotId: heat1.pilotIds[3], rank: 4 },
    ])
    
    store.submitHeatResults(heat2.id, [
      { pilotId: heat2.pilotIds[0], rank: 1 },
      { pilotId: heat2.pilotIds[1], rank: 2 },
      { pilotId: heat2.pilotIds[2], rank: 3 },
      { pilotId: heat2.pilotIds[3], rank: 4 },
    ])
    
    const updatedState = useTournamentStore.getState()
    
    // heats[] should now contain more than just quali heats
    // Original 2 quali heats + new WB/LB heats
    expect(updatedState.heats.length).toBeGreaterThan(2)
    
    // Check that new heats are WB heats (with winner pilots)
    const newHeats = updatedState.heats.slice(2)
    expect(newHeats.length).toBeGreaterThan(0)
    
    // At least one heat should contain winner pilots
    const wbHeat = newHeats.find(h => 
      h.pilotIds.some(id => updatedState.winnerPilots.includes(id))
    )
    expect(wbHeat).toBeDefined()
  })

  it('should set first new WB heat to active status', () => {
    const state = setupTournamentWithHeats(8)
    const store = useTournamentStore.getState()
    
    const heat1 = state.heats[0]
    const heat2 = state.heats[1]
    
    // Complete all quali heats
    store.submitHeatResults(heat1.id, [
      { pilotId: heat1.pilotIds[0], rank: 1 },
      { pilotId: heat1.pilotIds[1], rank: 2 },
      { pilotId: heat1.pilotIds[2], rank: 3 },
      { pilotId: heat1.pilotIds[3], rank: 4 },
    ])
    
    store.submitHeatResults(heat2.id, [
      { pilotId: heat2.pilotIds[0], rank: 1 },
      { pilotId: heat2.pilotIds[1], rank: 2 },
      { pilotId: heat2.pilotIds[2], rank: 3 },
      { pilotId: heat2.pilotIds[3], rank: 4 },
    ])
    
    const updatedState = useTournamentStore.getState()
    
    // After completing all quali, there should be an active heat for next round
    const activeHeat = updatedState.heats.find(h => h.status === 'active')
    expect(activeHeat).toBeDefined()
    
    // Active heat should not be a quali heat (those are completed)
    const qualiHeatIds = [heat1.id, heat2.id]
    expect(qualiHeatIds).not.toContain(activeHeat!.id)
  })
})

describe('Task 12: Edge Cases', () => {
  beforeEach(() => {
    useTournamentStore.getState().resetAll()
  })

  it('should handle 12 pilots correctly (3 quali heats)', () => {
    const state = setupTournamentWithHeats(12) // 3 Quali-Heats
    
    expect(state.heats.length).toBe(3)
    expect(state.fullBracketStructure!.qualification.heats.length).toBe(3)
  })

  it('should not generate next round until ALL quali heats are completed', () => {
    const state = setupTournamentWithHeats(12)
    const store = useTournamentStore.getState()
    
    // Complete only 2 of 3 quali heats
    store.submitHeatResults(state.heats[0].id, [
      { pilotId: state.heats[0].pilotIds[0], rank: 1 },
      { pilotId: state.heats[0].pilotIds[1], rank: 2 },
      { pilotId: state.heats[0].pilotIds[2], rank: 3 },
      { pilotId: state.heats[0].pilotIds[3], rank: 4 },
    ])
    
    store.submitHeatResults(state.heats[1].id, [
      { pilotId: state.heats[1].pilotIds[0], rank: 1 },
      { pilotId: state.heats[1].pilotIds[1], rank: 2 },
      { pilotId: state.heats[1].pilotIds[2], rank: 3 },
      { pilotId: state.heats[1].pilotIds[3], rank: 4 },
    ])
    
    const partialState = useTournamentStore.getState()
    
    // Should still only have 3 heats (no new WB heats yet)
    expect(partialState.heats.length).toBe(3)
    
    // Third heat should be active (next to play)
    expect(partialState.heats[2].status).toBe('active')
  })
})

describe('Review Follow-up: Bracket Rollback on Resubmit (AC5)', () => {
  beforeEach(() => {
    useTournamentStore.getState().resetAll()
  })

  it('should NOT create duplicate pilotIds in WB/LB when resubmitting heat results', () => {
    const state = setupTournamentWithHeats(8)
    const store = useTournamentStore.getState()
    
    const heat1 = state.heats[0]
    
    // Submit results for first heat
    store.submitHeatResults(heat1.id, [
      { pilotId: heat1.pilotIds[0], rank: 1 },
      { pilotId: heat1.pilotIds[1], rank: 2 },
      { pilotId: heat1.pilotIds[2], rank: 3 },
      { pilotId: heat1.pilotIds[3], rank: 4 },
    ])
    
    // Reopen heat (edit mode)
    store.reopenHeat(heat1.id)
    
    // Resubmit with DIFFERENT rankings (swap rank 1 and 2)
    store.submitHeatResults(heat1.id, [
      { pilotId: heat1.pilotIds[1], rank: 1 }, // Was rank 2, now rank 1
      { pilotId: heat1.pilotIds[0], rank: 2 }, // Was rank 1, now rank 2
      { pilotId: heat1.pilotIds[2], rank: 3 },
      { pilotId: heat1.pilotIds[3], rank: 4 },
    ])
    
    const updatedState = useTournamentStore.getState()
    
    // Check WB heat has NO duplicates
    const wbRound1 = updatedState.fullBracketStructure!.winnerBracket.rounds[0]
    const wbHeat1 = wbRound1.heats[0]
    
    // Should have unique pilots only (no duplicates from old + new submission)
    const uniquePilotIds = [...new Set(wbHeat1.pilotIds)]
    expect(wbHeat1.pilotIds.length).toBe(uniquePilotIds.length)
    
    // Should still have correct pilots (the ones with rank 1+2 from LATEST submission)
    expect(wbHeat1.pilotIds).toContain(heat1.pilotIds[1]) // New rank 1
    expect(wbHeat1.pilotIds).toContain(heat1.pilotIds[0]) // New rank 2
  })

  it('should rollback bracket structure when reopenHeat is called', () => {
    const state = setupTournamentWithHeats(8)
    const store = useTournamentStore.getState()
    
    const heat1 = state.heats[0]
    
    // Submit results for first heat
    store.submitHeatResults(heat1.id, [
      { pilotId: heat1.pilotIds[0], rank: 1 },
      { pilotId: heat1.pilotIds[1], rank: 2 },
      { pilotId: heat1.pilotIds[2], rank: 3 },
      { pilotId: heat1.pilotIds[3], rank: 4 },
    ])
    
    // Verify pilots were assigned to WB/LB
    const stateAfterSubmit = useTournamentStore.getState()
    const wbHeat = stateAfterSubmit.fullBracketStructure!.winnerBracket.rounds[0].heats[0]
    const lbHeat = stateAfterSubmit.fullBracketStructure!.loserBracket.rounds[0].heats[0]
    
    expect(wbHeat.pilotIds).toContain(heat1.pilotIds[0])
    expect(wbHeat.pilotIds).toContain(heat1.pilotIds[1])
    expect(lbHeat.pilotIds).toContain(heat1.pilotIds[2])
    expect(lbHeat.pilotIds).toContain(heat1.pilotIds[3])
    
    // Reopen heat - should rollback bracket assignments
    store.reopenHeat(heat1.id)
    
    const stateAfterReopen = useTournamentStore.getState()
    const wbHeatAfter = stateAfterReopen.fullBracketStructure!.winnerBracket.rounds[0].heats[0]
    const lbHeatAfter = stateAfterReopen.fullBracketStructure!.loserBracket.rounds[0].heats[0]
    
    // Pilots from this heat should be REMOVED from WB/LB
    expect(wbHeatAfter.pilotIds).not.toContain(heat1.pilotIds[0])
    expect(wbHeatAfter.pilotIds).not.toContain(heat1.pilotIds[1])
    expect(lbHeatAfter.pilotIds).not.toContain(heat1.pilotIds[2])
    expect(lbHeatAfter.pilotIds).not.toContain(heat1.pilotIds[3])
    
    // Quali heat status should be reset to active (not completed)
    const qualiHeat = stateAfterReopen.fullBracketStructure!.qualification.heats[0]
    expect(qualiHeat.status).toBe('active')
  })

  it('should correctly update bracket after resubmit with different winners', () => {
    const state = setupTournamentWithHeats(8)
    const store = useTournamentStore.getState()
    
    const heat1 = state.heats[0]
    const heat2 = state.heats[1]
    
    // Complete both heats
    store.submitHeatResults(heat1.id, [
      { pilotId: heat1.pilotIds[0], rank: 1 },
      { pilotId: heat1.pilotIds[1], rank: 2 },
      { pilotId: heat1.pilotIds[2], rank: 3 },
      { pilotId: heat1.pilotIds[3], rank: 4 },
    ])
    
    store.submitHeatResults(heat2.id, [
      { pilotId: heat2.pilotIds[0], rank: 1 },
      { pilotId: heat2.pilotIds[1], rank: 2 },
      { pilotId: heat2.pilotIds[2], rank: 3 },
      { pilotId: heat2.pilotIds[3], rank: 4 },
    ])
    
    // Now reopen heat1 and resubmit with completely different rankings
    store.reopenHeat(heat1.id)
    
    store.submitHeatResults(heat1.id, [
      { pilotId: heat1.pilotIds[2], rank: 1 }, // Was rank 3, now rank 1
      { pilotId: heat1.pilotIds[3], rank: 2 }, // Was rank 4, now rank 2
      { pilotId: heat1.pilotIds[0], rank: 3 }, // Was rank 1, now rank 3
      { pilotId: heat1.pilotIds[1], rank: 4 }, // Was rank 2, now rank 4
    ])
    
    const finalState = useTournamentStore.getState()
    
    // Check winner bracket - should have NEW winners only
    expect(finalState.winnerPilots).toContain(heat1.pilotIds[2]) // New rank 1
    expect(finalState.winnerPilots).toContain(heat1.pilotIds[3]) // New rank 2
    expect(finalState.winnerPilots).not.toContain(heat1.pilotIds[0]) // Old rank 1, now loser
    expect(finalState.winnerPilots).not.toContain(heat1.pilotIds[1]) // Old rank 2, now loser
    
    // Check loser bracket - should have NEW losers
    expect(finalState.loserPilots).toContain(heat1.pilotIds[0]) // Now rank 3
    expect(finalState.loserPilots).toContain(heat1.pilotIds[1]) // Now rank 4
  })
})
