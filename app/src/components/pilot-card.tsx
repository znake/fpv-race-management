import type { Pilot } from '../lib/schemas'

type PilotCardProps = {
  pilot: Pilot
}

export function PilotCard({ pilot }: PilotCardProps) {
  return (
    <div className="relative flex flex-col w-full rounded-xl border border-neon-pink/30 bg-night/50 text-white shadow-lg shadow-neon-pink/20 p-3 hover:shadow-neon-pink/50 hover:shadow-xl transition-all duration-300">
      <div className="rounded-lg overflow-hidden bg-black/50">
        <img
          src={pilot.imageUrl}
          alt={pilot.name}
          className="w-full h-32 md:h-44 object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/ff00ff/000000?text=Pilot'
          }}
        />
      </div>
      <div className="mt-3 text-center">
        <p className="font-bold text-neon-pink text-lg truncate">{pilot.name}</p>
      </div>
    </div>
  )
}