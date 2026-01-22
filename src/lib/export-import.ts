/**
 * Export/Import Utility Functions
 * 
 * Tech-Spec: export-import-turnier-state
 * Story 1: Core utility functions for JSON/CSV export and JSON import
 */

import type { TournamentStateData, Heat, Pilot } from '../types'

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

/**
 * Exports complete tournament state as JSON file
 * Reads directly from localStorage (Zustand persist storage)
 */
export function exportJSON(): void {
  const storageData = localStorage.getItem(STORAGE_KEY)
  
  if (!storageData) {
    alert('Keine Turnierdaten zum Exportieren gefunden.')
    return
  }
  
  const filename = generateFilename('json')
  downloadFile(storageData, filename, 'application/json')
}

/**
 * Parsed import data with summary for confirmation dialog
 */
export interface ParsedImportData {
  rawData: string
  pilotCount: number
  heatCount: number
  phase: string
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
    
    // Validate required fields
    if (!state.pilots || !Array.isArray(state.pilots)) {
      throw new Error('Ungültige Struktur: pilots Array fehlt')
    }
    
    if (!state.heats || !Array.isArray(state.heats)) {
      throw new Error('Ungültige Struktur: heats Array fehlt')
    }
    
    // Extract summary
    const pilotCount = state.pilots.length
    const heatCount = state.heats.length
    const phase = state.tournamentPhase || 'setup'
    
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
      phase: phaseLabels[phase] || phase
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
 * Gets pilot status for CSV export
 */
function getPilotStatus(
  pilot: Pilot,
  heats: Heat[],
  isCompleted: boolean
): string {
  // Check if pilot is dropped out
  if (pilot.droppedOut || pilot.status === 'withdrawn') {
    return 'Ausgeschieden'
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
  
  // Check if eliminated (lost in LB)
  const lbHeats = pilotHeats.filter(h => h.bracketType === 'loser')
  for (const lbHeat of lbHeats) {
    if (lbHeat.results) {
      const ranking = lbHeat.results.rankings.find(r => r.pilotId === pilot.id)
      // In LB, rank 3+ means eliminated
      if (ranking && ranking.rank >= 3) {
        return 'Ausgeschieden'
      }
    }
  }
  
  return 'Aktiv'
}

/**
 * Gets pilot's current bracket (Winner/Loser/-)
 */
function getPilotBracket(pilot: Pilot, heats: Heat[]): string {
  // Find pilot's most recent completed heat
  const pilotHeats = heats
    .filter(h => h.pilotIds.includes(pilot.id) && h.status === 'completed')
    .sort((a, b) => b.heatNumber - a.heatNumber)
  
  if (pilotHeats.length === 0) return '-'
  
  const lastHeat = pilotHeats[0]
  
  if (lastHeat.bracketType === 'grand_finale' || lastHeat.bracketType === 'finale') {
    return 'Grand Finale'
  }
  if (lastHeat.bracketType === 'winner') {
    return 'Winner'
  }
  if (lastHeat.bracketType === 'loser') {
    return 'Loser'
  }
  if (lastHeat.bracketType === 'qualification' || !lastHeat.bracketType) {
    // Check where they went from quali
    const laterHeat = heats.find(h => 
      h.pilotIds.includes(pilot.id) && 
      h.bracketType && 
      h.bracketType !== 'qualification'
    )
    if (laterHeat) {
      return laterHeat.bracketType === 'winner' ? 'Winner' : 'Loser'
    }
    return '-'
  }
  
  return '-'
}

/**
 * Gets pilot's placement (1-4 or -)
 */
function getPilotPlacement(pilot: Pilot, heats: Heat[]): string {
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
    
    // Format heat name
    let heatName: string
    if (heat.bracketType === 'grand_finale' || heat.bracketType === 'finale') {
      heatName = 'GF'
    } else if (heat.bracketType === 'winner') {
      const round = heat.roundNumber || 1
      heatName = heat.isFinale ? 'WB-F' : `WB-R${round}`
    } else if (heat.bracketType === 'loser') {
      const round = heat.roundNumber || 1
      heatName = heat.isFinale ? 'LB-F' : `LB-R${round}`
    } else {
      heatName = `Q-H${heat.heatNumber}`
    }
    
    return `${heatName}: ${place}`
  })
  
  return results.join(' | ')
}

/**
 * Gets next pending heat for a pilot
 */
function getNextHeat(pilot: Pilot, heats: Heat[]): string {
  const nextHeat = heats.find(h => 
    h.pilotIds.includes(pilot.id) && 
    (h.status === 'pending' || h.status === 'active')
  )
  
  if (!nextHeat) return '-'
  
  // Format heat name
  if (nextHeat.bracketType === 'grand_finale' || nextHeat.bracketType === 'finale') {
    return 'Grand Finale'
  } else if (nextHeat.bracketType === 'winner') {
    const round = nextHeat.roundNumber || 1
    return nextHeat.isFinale ? 'WB-Finale' : `WB-R${round}-H${nextHeat.heatNumber}`
  } else if (nextHeat.bracketType === 'loser') {
    const round = nextHeat.roundNumber || 1
    return nextHeat.isFinale ? 'LB-Finale' : `LB-R${round}-H${nextHeat.heatNumber}`
  } else {
    return `Quali-H${nextHeat.heatNumber}`
  }
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
 * Generates CSV export from tournament state
 * 
 * Columns: Pilot, Status, Platzierung, Bracket, Heats Geflogen, Ergebnisse, Nächster Heat
 */
export function generateCSVExport(state: TournamentStateData): string {
  const { pilots, heats, tournamentPhase } = state
  const isCompleted = tournamentPhase === 'completed'
  
  // Header row
  const header = 'Pilot,Status,Platzierung,Bracket,Heats Geflogen,Ergebnisse,Nächster Heat'
  
  // Data rows
  const rows = pilots.map(pilot => {
    const status = getPilotStatus(pilot, heats, isCompleted)
    const placement = getPilotPlacement(pilot, heats)
    const bracket = getPilotBracket(pilot, heats)
    const heatsFlown = getHeatsFlown(pilot, heats)
    const results = formatHeatResults(pilot, heats)
    const nextHeat = getNextHeat(pilot, heats)
    
    return [
      escapeCSVField(pilot.name),
      escapeCSVField(status),
      placement,
      escapeCSVField(bracket),
      String(heatsFlown),
      escapeCSVField(results),
      escapeCSVField(nextHeat)
    ].join(',')
  })
  
  return [header, ...rows].join('\n')
}

/**
 * Exports tournament state as CSV file
 */
export function exportCSV(state: TournamentStateData): void {
  const csvContent = generateCSVExport(state)
  const filename = generateFilename('csv')
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8')
}
