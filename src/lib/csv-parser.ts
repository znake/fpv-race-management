import Papa from 'papaparse'
import type { CSVImportResult, CSVImportError } from '../types/csv'

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
