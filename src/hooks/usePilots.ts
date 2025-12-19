import { useTournamentStore } from '../stores/tournamentStore'
import { pilotSchema, type PilotInput } from '../lib/schemas'
import { useRef } from 'react'

export function usePilots() {
  const pilots = useTournamentStore((state) => state.pilots)
  const tournamentStarted = useTournamentStore((state) => state.tournamentStarted)
  const tournamentPhase = useTournamentStore((state) => state.tournamentPhase)
  const heats = useTournamentStore((state) => state.heats)
  const addPilotToStore = useTournamentStore((state) => state.addPilot)
  const updatePilotInStore = useTournamentStore((state) => state.updatePilot)
  const deletePilotFromStore = useTournamentStore((state) => state.deletePilot)
  const markPilotAsDroppedOutInStore = useTournamentStore((state) => state.markPilotAsDroppedOut)
  const startTournamentInStore = useTournamentStore((state) => state.startTournament)
  const confirmTournamentStartInStore = useTournamentStore((state) => state.confirmTournamentStart)
  const resetTournamentInStore = useTournamentStore((state) => state.resetTournament)
  const clearAllPilotsInStore = useTournamentStore((state) => state.clearAllPilots)
  
  // Refs for optimistic updates and rollback
  const optimisticUpdatesRef = useRef<Map<string, any>>(new Map())
  


  const addPilot = (input: PilotInput) => {
    // Zod pre-add validation
    const result = pilotSchema.safeParse(input)
    if (!result.success) {
      console.error('Validierungsfehler:', result.error.errors)
      return false
    }

    // Duplikat-Check: case-insensitive Name-Match
    const lowerNames = pilots.map((p) => p.name.toLowerCase())
    if (lowerNames.includes(input.name.toLowerCase())) {
      const existingPilot = pilots.find(p => p.name.toLowerCase() === input.name.toLowerCase())
      const allowDuplicate = confirm(`Bestehender Pilot gefunden: "${existingPilot?.name}". Trotzdem hinzufügen?`)
      if (!allowDuplicate) {
        return false
      }
    }

    // Performance NFR: < 3s pro Pilot (localStorage persist ist automatisch)
    const startTime = performance.now()
    const success = addPilotToStore(result.data)
    const duration = performance.now() - startTime
    
    if (duration > 3000) {
      console.warn(`Pilot hinzufügen dauerte ${duration.toFixed(2)}ms (> 3s NFR)`)
    }

    return success
  }

  const importPilots = async (csvPilots: Array<{ name: string; imageUrl: string; instagramHandle?: string }>) => {
    // Performance NFR: <5s für 60 Piloten
    const startTime = performance.now()
    let successCount = 0
    let errorCount = 0

    // Create backup for rollback capability
    const backupPilots = [...pilots]

    try {
      for (const csvPilot of csvPilots) {
        // Validate with Zod schema
        const validation = pilotSchema.safeParse(csvPilot)
        if (!validation.success) {
          console.error(`Validierungsfehler für ${csvPilot.name}:`, validation.error.errors)
          errorCount++
          continue // Skip invalid pilots but continue processing
        }

        // Check for duplicates with Unicode normalization
        const normalizedCsvName = csvPilot.name.toLowerCase().normalize('NFC').trim()
        const existingPilot = pilots.find(p => 
          p.name.toLowerCase().normalize('NFC').trim() === normalizedCsvName
        )

        if (existingPilot) {
          // For CSV import, we'll overwrite existing pilots by default
          // This could be enhanced with user choice in the future
          console.log(`Überschreibe existierenden Piloten: ${existingPilot.name}`)
        }

        // Add pilot to store
        const success = addPilotToStore(validation.data)
        if (success) {
          successCount++
        } else {
          errorCount++
        }
      }

      const duration = performance.now() - startTime
      
      // Performance logging
      if (duration > 5000) {
        console.warn(`CSV Import dauerte ${duration.toFixed(2)}ms (> 5s NFR für ${csvPilots.length} Piloten)`)
      } else {
        console.log(`CSV Import abgeschlossen: ${successCount} Piloten in ${duration.toFixed(2)}ms`)
      }

      return {
        success: successCount > 0,
        successCount,
        errorCount,
        duration,
        backupPilots // Return backup for potential rollback
      }

    } catch (error) {
      console.error('CSV Import fehlgeschlagen:', error)
      
      // Rollback on critical error
      // This would require implementing a restorePilots function in the store
      // For now, we'll just log the error
      
      return {
        success: false,
        successCount,
        errorCount: csvPilots.length, // All failed
        duration: performance.now() - startTime,
        backupPilots
      }
    }
  }

  const updatePilot = (id: string, updates: { name?: string; imageUrl?: string }) => {
    const startTime = performance.now()
    const pilot = pilots.find(p => p.id === id)
    if (!pilot) return false

    // Store original state for rollback
    const originalState = { name: pilot.name, imageUrl: pilot.imageUrl }
    optimisticUpdatesRef.current.set(id, originalState)

    // Validate updates with Zod schema
    if (updates.name || updates.imageUrl) {
      const validation = pilotSchema.safeParse({
        name: updates.name || pilot.name,
        imageUrl: updates.imageUrl || pilot.imageUrl
      } as { name: string; imageUrl: string })
      
      if (!validation.success) {
        optimisticUpdatesRef.current.delete(id)
        return {
          success: false,
          errors: validation.error.errors.map(err => ({
            field: err.path[0] as string,
            message: err.message
          }))
        }
      }
    }

    // Optimistic update - update UI immediately
    const success = updatePilotInStore(id, updates)
    const duration = performance.now() - startTime
    
    if (duration > 50) {
      console.warn(`Pilot update dauerte ${duration.toFixed(2)}ms (> 50ms NFR)`)
    }

    return { success, errors: null }
  }

  const validatePilotUpdate = (id: string, updates: { name?: string; imageUrl?: string }) => {
    const pilot = pilots.find(p => p.id === id)
    if (!pilot) return { valid: false, errors: [{ field: 'general', message: 'Pilot nicht gefunden' }] }

    const validation = pilotSchema.safeParse({
      name: updates.name || pilot.name,
      imageUrl: updates.imageUrl || pilot.imageUrl
    } as { name: string; imageUrl: string })

    if (!validation.success) {
      return {
        valid: false,
        errors: validation.error.errors.map(err => ({
          field: err.path[0] as string,
          message: err.message
        }))
      }
    }

    // Check for duplicate names
    if (updates.name && updates.name.toLowerCase() !== pilot.name.toLowerCase()) {
      const duplicate = pilots.find(p => 
        p.id !== id && p.name.toLowerCase() === updates.name!.toLowerCase()
      )
      if (duplicate) {
        return {
          valid: false,
          errors: [{ field: 'name', message: 'Pilot mit diesem Namen existiert bereits' }]
        }
      }
    }

    return { valid: true, errors: null }
  }

  const rollbackPilotUpdate = (id: string) => {
    const originalState = optimisticUpdatesRef.current.get(id)
    if (originalState) {
      updatePilotInStore(id, originalState)
      optimisticUpdatesRef.current.delete(id)
    }
  }

  const deletePilot = (id: string) => {
    const startTime = performance.now()
    const success = deletePilotFromStore(id)
    const duration = performance.now() - startTime
    
    if (duration > 50) {
      console.warn(`Pilot deletion dauerte ${duration.toFixed(2)}ms (> 50ms NFR)`)
    }

    return success
  }

  const markPilotAsDroppedOut = (id: string) => {
    const startTime = performance.now()
    const success = markPilotAsDroppedOutInStore(id)
    const duration = performance.now() - startTime
    
    if (duration > 50) {
      console.warn(`Mark pilot as dropped out dauerte ${duration.toFixed(2)}ms (> 50ms NFR)`)
    }

    return success
  }

  const isTournamentStarted = () => {
    return tournamentStarted
  }

  const canDeletePilot = (_id: string) => {
    return !tournamentStarted
  }

  const canEditPilot = (_id: string) => {
    // For now, allow editing before tournament starts
    // This could be enhanced based on specific business rules
    return !tournamentStarted
  }

  const startTournament = () => {
    startTournamentInStore()
  }

  const confirmTournamentStart = () => {
    return confirmTournamentStartInStore()
  }

  const resetTournament = () => {
    resetTournamentInStore()
  }

  const clearAllPilots = () => {
    return clearAllPilotsInStore()
  }

  // Helper to check if we can start tournament (7-60 pilots)
  const canStartTournament = () => {
    return pilots.length >= 7 && pilots.length <= 60
  }

  return {
    pilots,
    tournamentStarted,
    tournamentPhase,
    heats,
    addPilot,
    importPilots,
    updatePilot,
    deletePilot,
    markPilotAsDroppedOut,
    startTournament,
    confirmTournamentStart,
    resetTournament,
    clearAllPilots,
    validatePilotUpdate,
    rollbackPilotUpdate,
    isTournamentStarted,
    canDeletePilot,
    canEditPilot,
    canStartTournament,
  }
}