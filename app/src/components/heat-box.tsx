import type { Pilot } from '../lib/schemas'

type HeatBoxProps = {
  heat: {
    id: string
    name: string
    pilots: Pilot[]
  }
  showByeHandling?: boolean
}

export function HeatBox({ heat, showByeHandling = true }: HeatBoxProps) {
  const activePilots = heat.pilots.filter(p => !p.droppedOut && p.status !== 'withdrawn')
  const withdrawnPilots = heat.pilots.filter(p => p.droppedOut || p.status === 'withdrawn')
  const hasBye = activePilots.length < 4 // Assuming 4 pilots per heat

  const getPilotStyling = (pilot: Pilot) => {
    if (pilot.droppedOut || pilot.status === 'withdrawn') {
      return 'opacity-60 line-through'
    }
    return ''
  }

  const getPilotBadge = (pilot: Pilot) => {
    if (pilot.droppedOut || pilot.status === 'withdrawn') {
      return (
        <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
          AUSGEFALLEN
        </span>
      )
    }
    return null
  }

  return (
    <div className="bg-night border-3 border-neon-cyan rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl font-bold text-chrome">
          {heat.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-ui text-sm text-steel">
            {activePilots.length}/4 Piloten
          </span>
          {hasBye && showByeHandling && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-bold">
              FREILOS
            </span>
          )}
        </div>
      </div>

      {/* Active Pilots */}
      <div className="space-y-3 mb-4">
        {activePilots.map((pilot, index) => (
          <div
            key={pilot.id}
            className={`
              bg-void border-2 border-steel rounded-xl p-3 
              flex items-center gap-3 transition-all duration-200
              hover:border-neon-cyan hover:shadow-glow-cyan
              ${getPilotStyling(pilot)}
            `}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-steel">
              <img
                src={pilot.imageUrl}
                alt={pilot.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/ff2a6d/0d0221?text=Pilot'
                }}
              />
            </div>
            <div className="flex-1">
              <div className="font-display text-base font-bold text-chrome flex items-center">
                {pilot.name}
                {getPilotBadge(pilot)}
              </div>
              <div className="font-ui text-xs text-steel">
                Position {index + 1}
              </div>
            </div>
            <div className="font-ui text-sm text-neon-cyan">
              Aktiv
            </div>
          </div>
        ))}
      </div>

      {/* Withdrawn Pilots */}
      {withdrawnPilots.length > 0 && (
        <div className="border-t-2 border-steel pt-4">
          <h4 className="font-display text-sm font-bold text-red-500 mb-3">
            Ausgefallene Piloten
          </h4>
          <div className="space-y-2">
            {withdrawnPilots.map((pilot) => (
              <div
                key={pilot.id}
                className={`
                  bg-void/50 border-2 border-red-500/30 rounded-xl p-3 
                  flex items-center gap-3 opacity-60
                `}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500/50">
                  <img
                    src={pilot.imageUrl}
                    alt={pilot.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/ff2a6d/0d0221?text=Pilot'
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-display text-base font-bold text-chrome flex items-center">
                    {pilot.name}
                    {getPilotBadge(pilot)}
                  </div>
                  <div className="font-ui text-xs text-red-500">
                    Erhält Freilos im nächsten Heat
                  </div>
                </div>
                <div className="font-ui text-sm text-red-500">
                    Ausgefallen
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bye System Info */}
      {hasBye && showByeHandling && (
        <div className="mt-4 p-3 bg-orange-500/10 border-2 border-orange-500/30 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg">⚠️</span>
            <div>
              <div className="font-display text-sm font-bold text-orange-500">
                Freilos-System aktiv
              </div>
              <div className="font-ui text-xs text-orange-400">
                {4 - activePilots.length} Pilot(en) erhalten ein Freilos
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {heat.pilots.length === 0 && (
        <div className="text-center py-8">
          <div className="font-ui text-steel">
            Keine Piloten in diesem Heat
          </div>
        </div>
      )}
    </div>
  )
}