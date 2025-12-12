import { z } from 'zod'

export interface Pilot {
  id: string
  name: string
  imageUrl: string
}

export const pilotSchema = z.object({
  name: z.string().min(3, 'Name muss mindestens 3 Zeichen haben'),
  imageUrl: z.string().url('Ungültige Bild-URL'),
})

export type PilotInput = z.infer<typeof pilotSchema>