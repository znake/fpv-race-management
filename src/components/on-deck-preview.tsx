import type { Heat } from '../types'
import type { Pilot } from '../lib/schemas'
import { FALLBACK_PILOT_IMAGE } from '../lib/ui-helpers'

type OnDeckPreviewProps = {
  heat: Heat
  pilots: Pilot[]
}

export function OnDeckPreview({ heat, pilots }: OnDeckPreviewProps) {
  // Get pilots in the next heat
  const heatPilots = heat.pilotIds
    .map((id) => pilots.find((p) => p.id === id))
    .filter(Boolean) as Pilot[]

  // Early return if no pilots found (edge case protection)
  if (heatPilots.length === 0) {
    return null
  }

  return (
    <div className="on-deck" role="region" aria-label="Nächster Heat Vorschau">
      <div className="on-deck-title flex items-center gap-2">
        <span className="text-neon-cyan" aria-hidden="true">→</span>
        <span>NÄCHSTER HEAT – Bitte Drohnen vorbereiten</span>
      </div>
      
      <div className="flex flex-wrap gap-4" role="list" aria-label="Piloten im nächsten Heat">
        {heatPilots.map((pilot) => (
          <div 
            key={pilot.id} 
            role="listitem"
            className="flex items-center gap-3 bg-void border border-steel rounded-lg px-4 py-3"
          >
            {/* Small Photo - min 48px (AC3) */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-neon-pink to-neon-magenta flex-shrink-0">
              <img
                src={pilot.imageUrl || FALLBACK_PILOT_IMAGE}
                alt={`Foto von ${pilot.name}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
                }}
              />
            </div>
            
            {/* Pilot Name - Beamer-optimiert (min 18px body) */}
            <div className="font-ui text-beamer-body text-chrome font-medium">
              {pilot.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
