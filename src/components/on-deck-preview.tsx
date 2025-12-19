import type { Heat } from '../stores/tournamentStore'
import type { Pilot } from '../lib/schemas'

// Fallback image as inline SVG data URL (no external dependency)
const FALLBACK_PILOT_IMAGE_SMALL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"%3E%3Crect fill="%23ff2a6d" width="48" height="48"/%3E%3Ctext x="24" y="30" text-anchor="middle" fill="%230d0221" font-size="20" font-family="sans-serif"%3EP%3C/text%3E%3C/svg%3E'

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
            className="flex items-center gap-3 bg-void border border-steel rounded-lg px-4 py-2"
          >
            {/* Small Photo - 48px */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-neon-pink to-neon-magenta flex-shrink-0">
              <img
                src={pilot.imageUrl}
                alt={`Foto von ${pilot.name}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE_SMALL
                }}
              />
            </div>
            
            {/* Pilot Name */}
            <div className="font-ui text-base text-chrome font-medium">
              {pilot.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
