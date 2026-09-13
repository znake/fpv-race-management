import { useTournamentStore } from '@/stores/tournamentStore'
import { pilotSchema, type PilotInput } from '@/lib/schemas'

export interface PilotActionError {
  field: string
  message: string
}

export interface PilotActionResult {
  success: boolean
  errors: PilotActionError[]
}

export interface PilotImportResult extends PilotActionResult {
  successCount: number
  errorCount: number
  duration: number
}

type PilotUpdateInput = { name?: string; imageUrl?: string; instagramHandle?: string }

type CsvPilotInput = { name: string; imageUrl?: string; instagramHandle?: string }

const DUPLICATE_NAME_MESSAGE = 'Pilot mit diesem Namen existiert bereits'

function normalizePilotName(name: string): string {
  return name.normalize('NFC').trim().toLowerCase()
}

function toActionErrors(issues: Array<{ path: (string | number)[]; message: string }>): PilotActionError[] {
  return issues.map((issue) => ({
    field: String(issue.path[0] ?? 'general'),
    message: issue.message,
  }))
}

function actionSuccess(): PilotActionResult {
  return { success: true, errors: [] }
}

function actionFailure(errors: PilotActionError[]): PilotActionResult {
  return { success: false, errors }
}

export function usePilots() {
  const pilots = useTournamentStore((state) => state.pilots)
  const tournamentStarted = useTournamentStore((state) => state.tournamentStarted)
  const addPilotToStore = useTournamentStore((state) => state.addPilot)
  const updatePilotInStore = useTournamentStore((state) => state.updatePilot)
  const deletePilotFromStore = useTournamentStore((state) => state.deletePilot)
  const markPilotAsDroppedOutInStore = useTournamentStore((state) => state.markPilotAsDroppedOut)

  // Single duplicate-name policy: Unicode NFC + trim + case-insensitive.
  const findDuplicatePilot = (name: string, excludeId?: string) => {
    const normalized = normalizePilotName(name)
    return pilots.find(
      (pilot) => pilot.id !== excludeId && normalizePilotName(pilot.name) === normalized,
    )
  }

  const addPilot = (input: PilotInput): PilotActionResult => {
    const validation = pilotSchema.safeParse(input)
    if (!validation.success) {
      console.error('Validierungsfehler:', validation.error.errors)
      return actionFailure(toActionErrors(validation.error.errors))
    }

    const duplicate = findDuplicatePilot(validation.data.name)
    if (duplicate) {
      const allowDuplicate = confirm(
        `Bestehender Pilot gefunden: "${duplicate.name}". Trotzdem hinzufügen?`,
      )
      if (!allowDuplicate) {
        return actionFailure([{ field: 'name', message: DUPLICATE_NAME_MESSAGE }])
      }
    }

    // Performance NFR: < 3s pro Pilot (localStorage persist ist automatisch)
    const startTime = performance.now()
    const added = addPilotToStore(validation.data)
    const duration = performance.now() - startTime

    if (duration > 3000) {
      console.warn(`Pilot hinzufügen dauerte ${duration.toFixed(2)}ms (> 3s NFR)`)
    }

    if (!added) {
      return actionFailure([{ field: 'general', message: 'Pilot konnte nicht hinzugefügt werden' }])
    }
    return actionSuccess()
  }

  const importPilots = async (csvPilots: CsvPilotInput[]): Promise<PilotImportResult> => {
    // Performance NFR: <5s für 60 Piloten
    const startTime = performance.now()
    let successCount = 0
    const errors: PilotActionError[] = []
    const seenNames = new Set(pilots.map((pilot) => normalizePilotName(pilot.name)))

    for (const csvPilot of csvPilots) {
      // Validate with Zod schema
      const validation = pilotSchema.safeParse(csvPilot)
      if (!validation.success) {
        console.error(`Validierungsfehler für ${csvPilot.name}:`, validation.error.errors)
        errors.push(...toActionErrors(validation.error.errors))
        continue // Skip invalid pilots but continue processing
      }

      // Duplicate handling shares the single normalized policy (skip duplicates).
      const normalizedName = normalizePilotName(validation.data.name)
      if (seenNames.has(normalizedName)) {
        errors.push({
          field: 'name',
          message: `Pilot "${csvPilot.name}" existiert bereits`,
        })
        continue
      }

      const added = addPilotToStore(validation.data)
      if (added) {
        successCount++
        seenNames.add(normalizedName)
      } else {
        errors.push({
          field: 'general',
          message: `Pilot "${csvPilot.name}" konnte nicht importiert werden`,
        })
      }
    }

    const duration = performance.now() - startTime

    // Performance logging
    if (duration > 5000) {
      console.warn(`CSV Import dauerte ${duration.toFixed(2)}ms (> 5s NFR für ${csvPilots.length} Piloten)`)
    }

    return {
      success: successCount > 0,
      errors,
      successCount,
      errorCount: errors.length,
      duration,
    }
  }

  const updatePilot = (id: string, updates: PilotUpdateInput): PilotActionResult => {
    const startTime = performance.now()
    const pilot = pilots.find((p) => p.id === id)
    if (!pilot) {
      return actionFailure([{ field: 'general', message: 'Pilot nicht gefunden' }])
    }

    // Validate updates with Zod schema
    const validation = pilotSchema.safeParse({
      name: updates.name || pilot.name,
      imageUrl: updates.imageUrl || pilot.imageUrl,
    })

    if (!validation.success) {
      return actionFailure(toActionErrors(validation.error.errors))
    }

    if (updates.name && findDuplicatePilot(updates.name, id)) {
      return actionFailure([{ field: 'name', message: DUPLICATE_NAME_MESSAGE }])
    }

    const updated = updatePilotInStore(id, updates)
    const duration = performance.now() - startTime

    if (duration > 50) {
      console.warn(`Pilot update dauerte ${duration.toFixed(2)}ms (> 50ms NFR)`)
    }

    if (!updated) {
      return actionFailure([{ field: 'general', message: 'Pilot konnte nicht aktualisiert werden' }])
    }
    return actionSuccess()
  }

  const deletePilot = (id: string): PilotActionResult => {
    const startTime = performance.now()
    const deleted = deletePilotFromStore(id)
    const duration = performance.now() - startTime

    if (duration > 50) {
      console.warn(`Pilot deletion dauerte ${duration.toFixed(2)}ms (> 50ms NFR)`)
    }

    if (!deleted) {
      return actionFailure([{ field: 'general', message: 'Pilot konnte nicht gelöscht werden' }])
    }
    return actionSuccess()
  }

  const markPilotAsDroppedOut = (id: string): PilotActionResult => {
    const startTime = performance.now()
    const marked = markPilotAsDroppedOutInStore(id)
    const duration = performance.now() - startTime

    if (duration > 50) {
      console.warn(`Mark pilot as dropped out dauerte ${duration.toFixed(2)}ms (> 50ms NFR)`)
    }

    if (!marked) {
      return actionFailure([
        { field: 'general', message: 'Pilot konnte nicht als ausgefallen markiert werden' },
      ])
    }
    return actionSuccess()
  }

  return {
    pilots,
    tournamentStarted,
    addPilot,
    importPilots,
    updatePilot,
    deletePilot,
    markPilotAsDroppedOut,
  }
}
