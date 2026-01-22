import { z } from 'zod'

export interface Pilot {
  id: string
  name: string
  imageUrl?: string
  instagramHandle?: string
  status?: 'active' | 'withdrawn'
  droppedOut?: boolean // @deprecated - use status instead
}

// Instagram handle validation: optional, starts with @, 1-30 chars, alphanumeric + _ + .
const instagramHandleSchema = z.string()
  .regex(/^@[a-zA-Z0-9_.]{1,30}$/, 'Instagram-Handle muss mit @ beginnen (z.B. @pilot_fpv)')
  .optional()
  .or(z.literal(''))
  .transform(val => val || undefined)

export const pilotSchema = z.object({
  name: z.string().min(3, 'Name muss mindestens 3 Zeichen haben'),
  imageUrl: z.string().url('Ungültige Bild-URL').optional().or(z.literal('')),
  instagramHandle: instagramHandleSchema,
})

export type PilotInput = z.infer<typeof pilotSchema>

/**
 * CSV Import Schema with Unicode normalization
 */
export const csvImportSchema = z.object({
  name: z.string()
    .min(3, 'Name muss mindestens 3 Zeichen haben')
    .max(50, 'Name darf maximal 50 Zeichen haben')
    .transform(val => val.normalize('NFC').trim()),
  imageUrl: z.string()
    .optional()
    .transform(val => {
      if (!val || val.trim() === '') return ''
      return val.trim()
    })
    .refine(val => !val || val === '' || /^https?:\/\/.+/.test(val), 'Ungültige Bild-URL'),
  instagramHandle: z.string()
    .optional()
    .transform(val => {
      if (!val || val.trim() === '') return undefined
      const trimmed = val.trim()
      // Add @ if missing
      return trimmed.startsWith('@') ? trimmed : `@${trimmed}`
    })
})

export type CSVImportInput = z.infer<typeof csvImportSchema>

/**
 * Validate CSV row with Zod schema
 */
export function validateCSVRow(row: { name: string; imageUrl: string }) {
  return csvImportSchema.safeParse(row)
}

/**
 * Valid rank positions in a heat (1st to 4th place)
 */
export type RankPosition = 1 | 2 | 3 | 4

/**
 * A single pilot's ranking in a heat
 */
export interface Ranking {
  pilotId: string
  rank: RankPosition
}

/**
 * Complete results for a heat
 */
export interface HeatResults {
  rankings: Ranking[]
  completedAt?: string
}