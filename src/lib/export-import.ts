/**
 * Export/Import Utility Functions
 * 
 * Tech-Spec: export-import-turnier-state
 * Story 1: Core utility functions for JSON/CSV export and JSON import
 */

import type { TournamentStateData, Heat, Pilot, Top4Pilots, TournamentPhase } from '@/types'
import { formatLapTime } from './ui-helpers'

// localStorage key used by Zustand persist middleware
const STORAGE_KEY = 'tournament-storage'

/**
 * Generates timestamp in YYYY-MM-DD_HH-MM format
 */
export function generateTimestamp(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}_${hours}-${minutes}`
}

/**
 * Generates filename with timestamp
 */
export function generateFilename(extension: 'json' | 'csv'): string {
  return `heats_${generateTimestamp()}.${extension}`
}

/**
 * Downloads content as a file using Blob
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export interface TournamentStateSnapshotInput {
  pilots: Pilot[]
  tournamentStarted: boolean
  tournamentPhase: TournamentPhase
  heats: Heat[]
  currentHeatIndex: number
  winnerPilots: string[]
  loserPilots: string[]
  eliminatedPilots: string[]
  loserPool: string[]
  grandFinalePool: string[]
  isQualificationComplete: boolean
  isWBFinaleComplete: boolean
  isLBFinaleComplete: boolean
  isGrandFinaleComplete: boolean
  lastCompletedBracketType: 'winner' | 'loser' | 'qualifier' | null
}

export function createTournamentStateSnapshot(
  state: TournamentStateSnapshotInput
): TournamentStateData {
  return {
    pilots: state.pilots,
    tournamentStarted: state.tournamentStarted,
    tournamentPhase: state.tournamentPhase,
    heats: state.heats,
    currentHeatIndex: state.currentHeatIndex,
    winnerPilots: state.winnerPilots,
    loserPilots: state.loserPilots,
    eliminatedPilots: state.eliminatedPilots,
    loserPool: state.loserPool,
    grandFinalePool: state.grandFinalePool,
    isQualificationComplete: state.isQualificationComplete,
    isWBFinaleComplete: state.isWBFinaleComplete,
    isLBFinaleComplete: state.isLBFinaleComplete,
    isGrandFinaleComplete: state.isGrandFinaleComplete,
    lastCompletedBracketType: state.lastCompletedBracketType
  }
}

/**
 * Exports complete tournament state as JSON file
 * Uses current in-memory state snapshot
 */
export function exportJSON(state: TournamentStateData): void {
  const payload = JSON.stringify({ state, version: 0 })
  const filename = generateFilename('json')
  downloadFile(payload, filename, 'application/json')
}

/**
 * Parsed import data with summary for confirmation dialog
 */
export interface ParsedImportData {
  rawData: string
  pilotCount: number
  heatCount: number
  phase: string
  version: number
}

function isValidTournamentPhase(value: unknown): value is TournamentPhase {
  return (
    value === 'setup' ||
    value === 'heat-assignment' ||
    value === 'running' ||
    value === 'finale' ||
    value === 'completed'
  )
}

function isValidHeatStatus(value: unknown): value is Heat['status'] {
  return value === 'pending' || value === 'active' || value === 'completed'
}

function isValidHeat(heat: unknown): heat is Heat {
  if (!heat || typeof heat !== 'object') return false
  const candidate = heat as Heat
  const hasValidBracketType =
    candidate.bracketType === undefined ||
    candidate.bracketType === 'loser' ||
    candidate.bracketType === 'grand_finale' ||
    candidate.bracketType === 'qualification' ||
    candidate.bracketType === 'winner' ||
    candidate.bracketType === 'finale'

  if (typeof candidate.id !== 'string') return false
  if (typeof candidate.heatNumber !== 'number') return false
  if (!Array.isArray(candidate.pilotIds)) return false
  if (!isValidHeatStatus(candidate.status)) return false
  if (!hasValidBracketType) return false

  if (candidate.results?.rankings) {
    const rankingsValid = candidate.results.rankings.every((ranking) => {
      return (
        typeof ranking.pilotId === 'string' &&
        (ranking.rank === 1 || ranking.rank === 2 || ranking.rank === 3 || ranking.rank === 4)
      )
    })
    if (!rankingsValid) return false
  }

  return true
}

function isValidPilot(pilot: unknown): pilot is Pilot {
  if (!pilot || typeof pilot !== 'object') return false
  const candidate = pilot as Pilot
  return typeof candidate.id === 'string' && typeof candidate.name === 'string'
}

/**
 * Parses and validates imported JSON structure
 * Returns summary data for confirmation dialog
 */
export function parseImportedJSON(jsonString: string): ParsedImportData | null {
  try {
    const parsed = JSON.parse(jsonString)
    
    // Zustand persist format: { state: {...}, version: number }
    const state = parsed.state || parsed

    const version: number = typeof parsed.version === 'number' ? parsed.version : 0
     
    // Validate required fields
    if (!state.pilots || !Array.isArray(state.pilots)) {
      throw new Error('Ungültige Struktur: pilots Array fehlt')
    }

    if (!state.heats || !Array.isArray(state.heats)) {
      throw new Error('Ungültige Struktur: heats Array fehlt')
    }

    if (typeof state.tournamentStarted !== 'boolean') {
      throw new Error('Ungültige Struktur: tournamentStarted fehlt')
    }

    if (typeof state.currentHeatIndex !== 'number') {
      throw new Error('Ungültige Struktur: currentHeatIndex fehlt')
    }

    if (!state.pilots.every(isValidPilot)) {
      throw new Error('Ungültige Struktur: pilots fehlerhaft')
    }

    if (!state.heats.every(isValidHeat)) {
      throw new Error('Ungültige Struktur: heats fehlerhaft')
    }
    
    // Extract summary
    const pilotCount = state.pilots.length
    const heatCount = state.heats.length
    const phaseValue = state.tournamentPhase ?? 'setup'
    if (!isValidTournamentPhase(phaseValue)) {
      throw new Error('Ungültige Struktur: tournamentPhase fehlerhaft')
    }

    if (version > 0) {
      throw new Error('Import-Version ' + version + ' wird nicht unterstützt. Bitte App aktualisieren.')
    }
    
    // Map phase to German label
    const phaseLabels: Record<string, string> = {
      'setup': 'Setup',
      'heat-assignment': 'Heat-Zuweisung',
      'running': 'Läuft',
      'finale': 'Finale',
      'completed': 'Beendet'
    }
    
    return {
      rawData: jsonString,
      pilotCount,
      heatCount,
      phase: phaseLabels[phaseValue] || phaseValue,
      version
    }
  } catch (error) {
    console.error('JSON Import Parse Error:', error)
    return null
  }
}

/**
 * Imports JSON data into localStorage and reloads the page
 * Returns true on success
 */
export function importJSON(jsonString: string): boolean {
  try {
    // Validate structure first
    const parsed = parseImportedJSON(jsonString)
    if (!parsed) {
      alert('Ungültige JSON-Datei. Bitte eine gültige Heats-Export-Datei auswählen.')
      return false
    }
    
    // Write to localStorage
    localStorage.setItem(STORAGE_KEY, jsonString)
    
    // Reload page to apply new state
    window.location.reload()
    
    return true
  } catch (error) {
    console.error('JSON Import Error:', error)
    alert('Fehler beim Importieren: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'))
    return false
  }
}

/**
 * Formats a heat name for display (e.g., "LB-R1", "LB-Finale")
 */
function formatHeatNameShort(heat: Heat): string {
  if (heat.bracketType === 'grand_finale' || heat.bracketType === 'finale') {
    return 'Grand Finale'
  } else if (heat.bracketType === 'winner') {
    const round = heat.roundNumber || 1
    return heat.isFinale ? 'WB-Finale' : `WB-R${round}`
  } else if (heat.bracketType === 'loser') {
    const round = heat.roundNumber || 1
    return heat.isFinale ? 'LB-Finale' : `LB-R${round}`
  } else {
    return 'Quali'
  }
}

/**
 * Gets pilot status for CSV export
 */
function getPilotStatus(
  pilot: Pilot,
  heats: Heat[],
  isCompleted: boolean
): string {
  if (pilot.status === 'withdrawn') {
    return 'Zurückgezogen'
  }
  
  // Check if tournament is completed - find placement
  if (isCompleted) {
    const grandFinale = heats.find(h => 
      h.bracketType === 'grand_finale' || h.bracketType === 'finale'
    )
    if (grandFinale?.results) {
      const ranking = grandFinale.results.rankings.find(r => r.pilotId === pilot.id)
      if (ranking) {
        return ranking.rank === 1 ? 'Champion' : 'Aktiv'
      }
    }
  }
  
  // Check if pilot has flown any heats
  const pilotHeats = heats.filter(h => 
    h.pilotIds.includes(pilot.id) && h.status === 'completed'
  )
  
  if (pilotHeats.length === 0) {
    return 'Noch nicht gestartet'
  }
  
  // Check if eliminated (lost in LB) - use findEliminationHeat for consistency
  const eliminationHeat = findEliminationHeat(pilot, heats)
  if (eliminationHeat) {
    const heatName = formatHeatNameShort(eliminationHeat)
    return `Ausgeschieden (${heatName})`
  }
  
  return 'Aktiv'
}

/**
 * Gets pilot's placement (1-4 or -)
 */
function getPilotPlacement(
  pilot: Pilot,
  heats: Heat[],
  placementMap?: Map<string, number>
): string {
  if (placementMap?.has(pilot.id)) {
    return String(placementMap.get(pilot.id))
  }

  const grandFinale = heats.find(h => 
    (h.bracketType === 'grand_finale' || h.bracketType === 'finale') &&
    h.status === 'completed'
  )
  
  if (!grandFinale?.results) return '-'
  
  const ranking = grandFinale.results.rankings.find(r => r.pilotId === pilot.id)
  if (!ranking) return '-'
  
  return String(ranking.rank)
}

/**
 * Gets number of heats flown by pilot
 */
function getHeatsFlown(pilot: Pilot, heats: Heat[]): number {
  return heats.filter(h => 
    h.pilotIds.includes(pilot.id) && h.status === 'completed'
  ).length
}

/**
 * Formats heat results for a pilot
  * Example: "WB-R1-H1: 1. | LB-R1-H2: 2."
  */
function formatHeatResults(pilot: Pilot, heats: Heat[]): string {
  const pilotHeats = heats
    .filter(h => h.pilotIds.includes(pilot.id) && h.status === 'completed' && h.results)
    .sort((a, b) => a.heatNumber - b.heatNumber)
  
  if (pilotHeats.length === 0) return '-'
  
  const results = pilotHeats.map(heat => {
    const ranking = heat.results?.rankings.find(r => r.pilotId === pilot.id)
    const place = ranking ? `${ranking.rank}.` : '?'
    const timeStr = ranking?.lapTimeMs ? ` (${formatLapTime(ranking.lapTimeMs)})` : ''
    
    // Format heat name
    let heatName: string
    if (heat.bracketType === 'grand_finale' || heat.bracketType === 'finale') {
      heatName = `GF-H${heat.heatNumber}`
    } else if (heat.bracketType === 'winner') {
      const round = heat.roundNumber || 1
      heatName = heat.isFinale ? `WB-F-H${heat.heatNumber}` : `WB-R${round}-H${heat.heatNumber}`
    } else if (heat.bracketType === 'loser') {
      const round = heat.roundNumber || 1
      heatName = heat.isFinale ? `LB-F-H${heat.heatNumber}` : `LB-R${round}-H${heat.heatNumber}`
    } else {
      heatName = `Q-H${heat.heatNumber}`
    }
    
    return `${heatName}: ${place}${timeStr}`
  })
  
  return results.join(' | ')
}

/**
 * Escapes CSV field (handles commas, quotes, newlines)
 */
function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Represents an elimination phase for ranking calculation
 */
interface EliminationPhase {
  bracketType: 'loser'
  roundNumber: number
  isFinale: boolean
}

/**
 * Finds the heat in which a pilot was eliminated (ranked 3+ in LB)
 * Returns null if pilot is still active or was never in LB
 */
function findEliminationHeat(pilot: Pilot, heats: Heat[]): Heat | null {
  // Find LB heats where the pilot ranked 3 or worse (eliminated)
  const eliminationHeats = heats.filter(h =>
    h.bracketType === 'loser' &&
    h.status === 'completed' &&
    h.pilotIds.includes(pilot.id) &&
    h.results?.rankings.some(r => r.pilotId === pilot.id && r.rank >= 3)
  )

  if (eliminationHeats.length === 0) return null

  // Return the heat with the highest round number (latest elimination)
  return eliminationHeats.sort((a, b) => (b.roundNumber ?? 0) - (a.roundNumber ?? 0))[0]
}

/**
 * Gets the elimination phase from a heat
 */
function getEliminationPhase(heat: Heat): EliminationPhase {
  return {
    bracketType: 'loser',
    roundNumber: heat.roundNumber ?? 1,
    isFinale: heat.isFinale ?? false
  }
}

/**
 * Collects all elimination phases and counts how many pilots were eliminated in each
 */
function collectEliminationCounts(heats: Heat[]): Map<string, { phase: EliminationPhase; count: number }> {
  const counts = new Map<string, { phase: EliminationPhase; count: number }>()

  const lbHeats = heats.filter(h => h.bracketType === 'loser' && h.status === 'completed')

  for (const heat of lbHeats) {
    if (!heat.results) continue

    // Count pilots eliminated in this heat (rank 3+)
    const eliminatedInHeat = heat.results.rankings.filter(r => r.rank >= 3).length

    if (eliminatedInHeat === 0) continue

    const phase = getEliminationPhase(heat)
    const key = phase.isFinale ? 'lb-finale' : `lb-r${phase.roundNumber}`

    const existing = counts.get(key)
    if (existing) {
      existing.count += eliminatedInHeat
    } else {
      counts.set(key, { phase, count: eliminatedInHeat })
    }
  }

  return counts
}

/**
 * Calculates the placement group bounds for a pilot eliminated in a specific phase
 * 
 * The algorithm works by counting eliminations from "best" to "worst":
 * - Grand Finale: Places 1-4
 * - LB Finale (rank 3+): Next places after Grand Finale
 * - Earlier LB rounds: Progressively worse places
 */
function calculateGroupBounds(
  eliminationPhase: EliminationPhase,
  heats: Heat[],
  allPilots: Pilot[]
): { start: number; end: number } {
  const activePilots = allPilots.filter(p => p.status !== 'withdrawn')
  const totalPilots = activePilots.length

  // Collect all elimination phases with counts
  const eliminationCounts = collectEliminationCounts(heats)

  // Sort phases from best (highest round/finale) to worst (lowest round)
  const sortedPhases = Array.from(eliminationCounts.values()).sort((a, b) => {
    // Finale comes first (best placement for eliminated)
    if (a.phase.isFinale && !b.phase.isFinale) return -1
    if (!a.phase.isFinale && b.phase.isFinale) return 1
    // Higher round number = better placement
    return b.phase.roundNumber - a.phase.roundNumber
  })

  // Start after Grand Finale (places 1-4)
  let currentPosition = 5

  for (const { phase, count } of sortedPhases) {
    const matchesPhase =
      phase.isFinale === eliminationPhase.isFinale &&
      phase.roundNumber === eliminationPhase.roundNumber

    if (matchesPhase) {
      return {
        start: currentPosition,
        end: currentPosition + count - 1
      }
    }

    currentPosition += count
  }

  // Fallback: should not happen, but return remaining range
  return { start: currentPosition, end: totalPilots }
}

/**
 * Calculates the placement group for a pilot
 * 
 * Returns:
 * - "1", "2", "3", "4" for Grand Finale participants (exact placement)
 * - "5-6", "7-8", etc. for eliminated pilots (group based on elimination round)
 * - "" (empty) for still active pilots
 */
function getPlacementGroup(
  pilot: Pilot,
  heats: Heat[],
  allPilots: Pilot[],
  placementMap?: Map<string, number>
): string {
  // 1. Top 4 from Grand Finale - return exact placement
  if (placementMap?.has(pilot.id)) {
    return String(placementMap.get(pilot.id))
  }

  // 2. Find the heat where this pilot was eliminated
  const eliminationHeat = findEliminationHeat(pilot, heats)
  if (!eliminationHeat) {
    // Pilot is still active or never participated in LB
    return ''
  }

  // 3. Calculate placement group based on elimination phase
  const eliminationPhase = getEliminationPhase(eliminationHeat)
  const groupBounds = calculateGroupBounds(eliminationPhase, heats, allPilots)

  // 4. Format as range (or single number if start === end)
  if (groupBounds.start === groupBounds.end) {
    return String(groupBounds.start)
  }
  return `${groupBounds.start}-${groupBounds.end}`
}

  /**
   * Generates CSV export from tournament state
   * 
   * Columns: Pilot, Status, Platzierung, Ranggruppe, Heats Geflogen, Ergebnisse
   */
export interface CSVExportOptions {
  top4?: Top4Pilots | null
}

function buildPlacementMap(top4?: Top4Pilots | null): Map<string, number> | undefined {
  if (!top4) return undefined
  const placementMap = new Map<string, number>()
  if (top4.place1?.id) placementMap.set(top4.place1.id, 1)
  if (top4.place2?.id) placementMap.set(top4.place2.id, 2)
  if (top4.place3?.id) placementMap.set(top4.place3.id, 3)
  if (top4.place4?.id) placementMap.set(top4.place4.id, 4)
  return placementMap.size > 0 ? placementMap : undefined
}

export function generateCSVExport(
  state: TournamentStateData,
  options: CSVExportOptions = {}
): string {
  const { pilots, heats, tournamentPhase } = state
  const isCompleted = tournamentPhase === 'completed'
  const placementMap = buildPlacementMap(options.top4)
  
  // Header row
  const header = 'Pilot,Status,Platzierung,Ranggruppe,Heats Geflogen,Ergebnisse'

  // Data rows
  const rows = pilots.map(pilot => {
    const status = getPilotStatus(pilot, heats, isCompleted)
    const placement = getPilotPlacement(pilot, heats, placementMap)
    const placementGroup = getPlacementGroup(pilot, heats, pilots, placementMap)
    const heatsFlown = getHeatsFlown(pilot, heats)
    const results = formatHeatResults(pilot, heats)

    return [
      escapeCSVField(pilot.name),
      escapeCSVField(status),
      placement,
      placementGroup,
      String(heatsFlown),
      escapeCSVField(results)
    ].join(',')
  })
  
  return [header, ...rows].join('\n')
}

/**
 * Exports tournament state as CSV file
 */
export function exportCSV(state: TournamentStateData, options: CSVExportOptions = {}): void {
  const csvContent = generateCSVExport(state, options)
  const filename = generateFilename('csv')
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8')
}
