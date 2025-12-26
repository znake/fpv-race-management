import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Papa from 'papaparse'
import type { CSVImportResult, CSVImportError } from '../types/csv'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Inline SVG data URL for offline-first fallback pilot image
 * No external dependencies - works completely offline
 */
export const FALLBACK_PILOT_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150">
  <rect width="150" height="150" fill="#0d0221"/>
  <circle cx="75" cy="55" r="30" fill="#ff2a6d"/>
  <ellipse cx="75" cy="130" rx="45" ry="35" fill="#ff2a6d"/>
  <text x="75" y="60" font-family="sans-serif" font-size="24" fill="#0d0221" text-anchor="middle">?</text>
</svg>
`)}`

/**
 * Parse CSV text using PapaParse with robust error handling
 */
export function parseCSV(csvText: string): Promise<CSVImportResult> {
  return new Promise((resolve) => {
    // Remove UTF-8 BOM if present
    const cleanedText = csvText.replace(/^\uFEFF/, '')
    
    Papa.parse(cleanedText, {
      delimiter: '', // Auto-detect delimiter
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: (results) => {
        const pilots: Array<{ name: string; imageUrl: string; instagramHandle?: string }> = []
        const errors: CSVImportError[] = []
        
        if (results.errors.length > 0) {
          results.errors.forEach((error, index) => {
            errors.push({
              row: error.row ?? index + 2, // +2 because of header and 0-based indexing
              field: 'general',
              message: error.message || 'CSV parsing error',
              value: undefined
            })
          })
        }
        
        if (results.data && Array.isArray(results.data)) {
          results.data.forEach((row: any, index) => {
            const rowNum = index + 2 // +2 because of header and 0-based indexing
            
             // Check required columns
             if (!row.Name && !row.name) {
               errors.push({
                 row: rowNum,
                 field: 'Name',
                 message: 'Name ist erforderlich'
               })
               return
             }
             
             if (!row['Bild-URL'] && !row.imageUrl && !row['image_url']) {
               errors.push({
                 row: rowNum,
                 field: 'Bild-URL',
                 message: 'Bild-URL ist erforderlich'
               })
               return
             }
            
            const name = row.Name || row.name
            const imageUrl = row['Bild-URL'] || row.imageUrl || row['image_url']
            const instagramRaw = row.Instagram || row.instagram || row['Instagram-Handle'] || ''
            
            // Process Instagram handle: add @ if missing, or leave empty
            let instagramHandle: string | undefined
            if (instagramRaw && instagramRaw.trim()) {
              const trimmed = instagramRaw.trim()
              instagramHandle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`
            }
            
             // Basic validation
             if (name && typeof name === 'string' && name.length < 3) {
               errors.push({
                 row: rowNum,
                 field: 'Name',
                 message: 'Name muss mindestens 3 Zeichen haben',
                 value: name
               })
             }
            
            if (name && imageUrl) {
              pilots.push({
                name: name.toString(),
                imageUrl: imageUrl.toString(),
                instagramHandle
              })
            }
          })
        }
        
        resolve({
          totalRows: results.data?.length || 0,
          validRows: pilots.length,
          pilots,
          errors,
          duplicates: [] // Will be filled during validation
        })
      },
      error: (error: Error) => {
        resolve({
          totalRows: 0,
          validRows: 0,
          pilots: [],
          errors: [{
            row: 1,
            field: 'general',
            message: `CSV parsing failed: ${error.message}`
          }],
          duplicates: []
        })
      }
    })
  })
}

/**
 * Validate image URL with async fetch
 */
export async function validateImageUrl(url: string, timeout = 5000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors' // Avoid CORS issues for validation
    })
    
    clearTimeout(timeoutId)
    return true // If we get here, the URL is reachable
  } catch (error) {
    // For CORS issues, we'll assume the URL is valid if it looks like an image URL
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    )
    const hasImagePattern = url.includes('pravatar') || url.includes('avatar') || url.includes('image')
    
    return hasImageExtension || hasImagePattern
  }
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Fisher-Yates Shuffle - unbiased random permutation
 *
 * @param array - Array to shuffle
 * @param seed - Optional seed for deterministic shuffling (für Tests)
 */
export function shuffleArray<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array]

  // Seeded random für deterministische Tests
  let random: () => number
  if (seed !== undefined) {
    // Simple seeded PRNG (Mulberry32)
    let s = seed
    random = () => {
      s |= 0
      s = (s + 0x6D2B79F5) | 0
      let t = Math.imul(s ^ (s >>> 15), 1 | s)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  } else {
    random = Math.random
  }

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

/**
 * Get consistent rank badge styling for placements
 * 
 * Color scheme:
 * - 1st place: Gold
 * - 2nd place: Silver
 * - 3rd place: Bronze
 * - 4th place: Neon Cyan
 */
export function getRankBadgeClasses(rank: number): string {
  if (rank === 1) return 'bg-gold text-void shadow-glow-gold'
  if (rank === 2) return 'bg-silver text-void shadow-glow-silver'
  if (rank === 3) return 'bg-bronze text-void shadow-glow-bronze'
  return 'bg-neon-cyan text-void shadow-glow-cyan' // rank 4+
}

/**
 * Get consistent border styling for ranked cards
 */
export function getRankBorderClasses(rank: number): string {
  if (rank === 1) return 'border-gold shadow-glow-gold'
  if (rank === 2) return 'border-silver shadow-glow-silver'
  if (rank === 3) return 'border-bronze shadow-glow-bronze'
  return 'border-neon-cyan shadow-glow-cyan' // rank 4+
}

/**
 * Sortiert Piloten nach Platzierung (Story 4.4 - Task 1)
 * 
 * @param pilotIds - Array of pilot IDs to sort
 * @param results - Heat results with rankings
 * @returns Sorted pilot IDs (rank 1 first, then 2, 3, 4)
 */
export function sortPilotsByRank(
  pilotIds: string[],
  results?: { rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[] }
): string[] {
  if (!results || !results.rankings) {
    return pilotIds // Ursprüngliche Reihenfolge für pending/active Heats
  }

  const rankingMap = new Map<string, number>()
  results.rankings.forEach(r => rankingMap.set(r.pilotId, r.rank))

  // Sortieren: Piloten mit Rang zuerst (1, 2, 3, 4), dann Piloten ohne Rang (rank=99)
  return [...pilotIds].sort((a, b) => {
    const rankA = rankingMap.get(a) ?? 99
    const rankB = rankingMap.get(b) ?? 99
    return rankA - rankB
  })
}

/**
 * Get pilot rank from heat results (Story 4.4 - Task 1)
 * 
 * @param pilotId - Pilot ID to get rank for
 * @param heat - Heat object with results
 * @returns Pilot rank (1-4) or undefined if not ranked
 */
export function getPilotRank(
  pilotId: string,
  heat: { results?: { rankings: { pilotId: string; rank: 1 | 2 | 3 | 4 }[] } }
): number | undefined {
  if (!heat.results || !heat.results.rankings) {
    return undefined
  }
  const ranking = heat.results.rankings.find(r => r.pilotId === pilotId)
  return ranking?.rank
}

/**
 * Get consistent border styling for heat cards based on status
 * 
 * @param status - Heat status ('pending' | 'active' | 'completed')
 * @param isRecommended - Optional flag for recommended heat highlight (Story 9-2)
 * @returns Tailwind classes for border and shadow
 */
export function getHeatBorderClasses(status: string, isRecommended?: boolean): string {
  if (isRecommended && status === 'pending') {
    return 'border-neon-cyan shadow-glow-cyan animate-pulse'
  }
  if (status === 'active') {
    return 'border-neon-cyan shadow-glow-cyan'
  }
  if (status === 'completed') {
    return 'border-winner-green shadow-glow-green'
  }
  return 'border-steel'
}
