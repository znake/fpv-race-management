import type { Pilot } from '../lib/schemas'

type BracketTreeProps = {
  pilots: Pilot[]
  rounds?: string[][]
}

export function BracketTree({ pilots, rounds = [] }: BracketTreeProps) {
  const getWithdrawnPilotStyling = (pilot: Pilot) => {
    if (pilot.droppedOut || pilot.status === 'withdrawn') {
      return 'opacity-60 border-steel'
    }
    return ''
  }

  const getWithdrawnPilotBadge = (pilot: Pilot) => {
    if (pilot.droppedOut || pilot.status === 'withdrawn') {
      return (
        <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
          AUSGEFALLEN
        </span>
      )
    }
    return null
  }

  if (pilots.length === 0) {
    return (
      <div className="bg-night border-3 border-steel rounded-2xl p-8 text-center">
        <p className="font-ui text-steel">Keine Piloten für Bracket verfügbar</p>
      </div>
    )
  }

  return (
    <div className="bg-night border-3 border-neon-cyan rounded-2xl p-6">
      <h2 className="font-display text-2xl font-bold text-chrome mb-6 text-center">
        Tournament Bracket
      </h2>
      
      {/* Simple bracket visualization */}
      <div className="space-y-4">
        {pilots.map((pilot, index) => (
          <div
            key={pilot.id}
            className={`
              bg-void border-2 rounded-xl p-4 flex items-center justify-between
              transition-all duration-200 hover:border-neon-cyan
              ${getWithdrawnPilotStyling(pilot)}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-steel">
                <img
                  src={pilot.imageUrl}
                  alt={pilot.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/ff2a6d/0d0221?text=Pilot'
                  }}
                />
              </div>
              <div>
                <div className="font-display text-lg font-bold text-chrome flex items-center">
                  {pilot.name}
                  {getWithdrawnPilotBadge(pilot)}
                </div>
                <div className="font-ui text-sm text-steel">
                  Seed #{index + 1}
                </div>
              </div>
            </div>
            
            {/* Match status placeholder */}
            <div className="font-ui text-sm text-steel">
              {pilot.droppedOut || pilot.status === 'withdrawn' ? 'Freilos' : 'Bereit'}
            </div>
          </div>
        ))}
      </div>
      
      {/* Rounds placeholder */}
      {rounds.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-xl font-bold text-chrome mb-4">
            Runden
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rounds.map((round, roundIndex) => (
              <div key={roundIndex} className="bg-void border-2 border-steel rounded-xl p-4">
                <h4 className="font-display text-lg font-bold text-neon-cyan mb-2">
                  Runde {roundIndex + 1}
                </h4>
                <div className="space-y-2">
                  {round.map((pilotId: string, matchIndex: number) => {
                    const pilot = pilots.find(p => p.id === pilotId)
                    return pilot ? (
                      <div key={matchIndex} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-steel">
                          <img
                            src={pilot.imageUrl}
                            alt={pilot.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`font-ui text-sm ${
                          pilot.droppedOut || pilot.status === 'withdrawn' 
                            ? 'text-red-500 line-through' 
                            : 'text-chrome'
                        }`}>
                          {pilot.name}
                        </span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}