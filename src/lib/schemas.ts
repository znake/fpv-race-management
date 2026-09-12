import { z } from 'zod'

export interface Pilot {
  id: string
  name: string
  imageUrl?: string
  instagramHandle?: string
  status?: 'active' | 'withdrawn'
  lastChannel?: 1 | 3 | 4 | 6 | 8 // Last used Raceband channel for smart assignment
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
 * Valid rank positions in a heat (1st to 4th place)
 */
export type RankPosition = 1 | 2 | 3 | 4

/**
 * A single pilot's ranking in a heat
 */
export interface Ranking {
  pilotId: string
  rank: RankPosition
  /** Lap time in milliseconds (optional) */
  lapTimeMs?: number
}

/**
 * Complete results for a heat
 */
export interface HeatResults {
  rankings: Ranking[]
  completedAt?: string
}