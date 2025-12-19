import { describe, it, expect, beforeEach } from 'vitest'
import { useTournamentStore } from '../src/stores/tournamentStore'

describe('Delete after CSV Import', () => {
  beforeEach(() => {
    // Reset store before each test
    useTournamentStore.setState({
      pilots: [],
      tournamentStarted: false,
      tournamentPhase: 'setup',
      heats: [],
      currentHeatIndex: 0
    })
  })

  it('can delete a pilot that was added via addPilot', () => {
    const store = useTournamentStore.getState()
    
    // Add a pilot
    store.addPilot({
      name: 'Test Pilot',
      imageUrl: 'https://example.com/image.jpg'
    })
    
    // Verify pilot was added
    let pilots = useTournamentStore.getState().pilots
    expect(pilots.length).toBe(1)
    
    // Delete the pilot
    const pilotId = pilots[0].id
    const deleteResult = store.deletePilot(pilotId)
    
    // Verify deletion
    pilots = useTournamentStore.getState().pilots
    expect(deleteResult).toBe(true)
    expect(pilots.length).toBe(0)
  })

  it('can delete pilots added one after another (simulating CSV import)', () => {
    const store = useTournamentStore.getState()
    
    // Simulate CSV import by adding multiple pilots
    store.addPilot({ name: 'Pilot 1', imageUrl: 'https://example.com/1.jpg' })
    store.addPilot({ name: 'Pilot 2', imageUrl: 'https://example.com/2.jpg' })
    store.addPilot({ name: 'Pilot 3', imageUrl: 'https://example.com/3.jpg' })
    
    // Verify pilots were added
    let pilots = useTournamentStore.getState().pilots
    expect(pilots.length).toBe(3)
    
    // Delete the second pilot
    const pilotToDelete = pilots[1]
    const deleteResult = store.deletePilot(pilotToDelete.id)
    
    // Verify deletion
    pilots = useTournamentStore.getState().pilots
    expect(deleteResult).toBe(true)
    expect(pilots.length).toBe(2)
    expect(pilots.find(p => p.id === pilotToDelete.id)).toBeUndefined()
  })
})
