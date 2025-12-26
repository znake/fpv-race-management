/**
 * Pool-Visualisierung Komponenten für Story 4.3
 * 
 * Task 1: PoolDisplay - Zeigt Piloten im Pool mit FIFO-Reihenfolge
 * Task 2: PoolStatusIndicator - Zeigt Status des Pools (bereit/warten)
 */

import { FALLBACK_PILOT_IMAGE } from '../lib/ui-helpers'
import type { Pilot } from '../lib/schemas'

/**
 * Props für PoolDisplay Komponente
 */
interface PoolDisplayProps {
  pilotIds: string[]
  poolName: string  // "WB Pool" oder "LB Pool"
  maxPilots: number // Normalerweise 4
  pilots: Pilot[]   // Alle Piloten für Foto/Namen Lookup
}

/**
 * PoolDisplay Komponente (Task 1)
 * 
 * Zeigt Piloten im Pool mit:
 * - Mini-Fotos (32px / w-8)
 * - FIFO-Reihenfolge (älteste Piloten zuerst)
 * - Status-Indikator (bereit/warten)
 * 
 * AC 2: WB Pool-Visualisierung
 * AC 3: LB Pool-Visualisierung
 */
export function PoolDisplay({ pilotIds, poolName, maxPilots, pilots }: PoolDisplayProps) {
  // Lookup Piloten aus IDs
  const poolPilots = pilotIds
    .map(id => pilots.find(p => p.id === id))
    .filter((p): p is Pilot => p !== undefined)
  
  const isReady = pilotIds.length >= maxPilots
  const isEmpty = pilotIds.length === 0
  
  // Determine border/bg color based on pool type
  const isWB = poolName.toLowerCase().includes('wb') || poolName.toLowerCase().includes('winner')
  const colorClass = isWB 
    ? 'border-winner-green/30' 
    : 'border-loser-red/30'
  const headerColorClass = isWB
    ? 'text-winner-green'
    : 'text-loser-red'
  
  return (
    <div 
      className={`
        bg-night border-2 ${colorClass} rounded-xl p-4 min-w-[180px]
        ${isReady ? 'shadow-glow-green' : ''}
      `}
      data-testid="pool-display"
    >
      {/* Pool Header */}
      <h3 className={`font-display text-beamer-body ${headerColorClass} mb-3 text-center`}>
        {poolName}
      </h3>
      
      {/* Piloten Liste (FIFO: älteste zuerst) */}
      <div className="space-y-2 mb-3">
        {poolPilots.map((pilot) => (
          <div 
            key={pilot.id} 
            className="flex items-center gap-2"
            data-testid="pool-pilot"
          >
            <img
              src={pilot.imageUrl || FALLBACK_PILOT_IMAGE}
              alt={pilot.name}
              className="w-8 h-8 rounded-full object-cover border border-steel"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_PILOT_IMAGE
              }}
            />
            <span className="font-ui text-beamer-caption text-chrome truncate">
              {pilot.name}
            </span>
          </div>
        ))}
        
        {/* Leerer Pool Hinweis */}
        {isEmpty && (
          <div className="text-center text-steel text-beamer-caption py-2">
            Keine Piloten
          </div>
        )}
      </div>
      
      {/* Status Indikator */}
      <PoolStatusIndicator
        currentCount={pilotIds.length}
        maxPilots={maxPilots}
        poolName={poolName.includes('WB') ? 'WB' : 'LB'}
      />
    </div>
  )
}

/**
 * Props für PoolStatusIndicator
 */
interface PoolStatusIndicatorProps {
  currentCount: number
  maxPilots: number
  poolName: 'WB' | 'LB' | string
  isWBActive?: boolean // Für spezielle Nachricht wenn WB noch aktiv
}

/**
 * PoolStatusIndicator Komponente (Task 2)
 * 
 * Zeigt Pool-Status:
 * - "3/4 Piloten" - Wenn noch 1 Pilot fehlt
 * - "4/4 Piloten" mit Checkmark - Wenn Heat bereit ist
 * - "1 Pilot wartet..." - Wenn WB noch aktiv und nur 1 Pilot im Pool
 * 
 * AC 10: Pool-Status Indikator
 */
export function PoolStatusIndicator({ 
  currentCount, 
  maxPilots, 
  poolName: _poolName, // Unused but kept for API consistency
  isWBActive = false 
}: PoolStatusIndicatorProps) {
  const isReady = currentCount >= maxPilots
  const isSinglePilotWaiting = currentCount === 1 && isWBActive
  
  // Status Text
  let statusText: string
  if (isReady) {
    statusText = `${currentCount}/${maxPilots} Piloten - Heat bereit!`
  } else if (isSinglePilotWaiting) {
    statusText = `1 Pilot wartet...`
  } else if (currentCount === 0) {
    statusText = `0/${maxPilots} - Warte auf Piloten...`
  } else {
    statusText = `${currentCount}/${maxPilots} Piloten`
  }
  
  // Background color: green when ready, gray when waiting
  const bgColorClass = isReady ? 'bg-winner-green' : 'bg-steel'
  const textColorClass = isReady ? 'text-void' : 'text-chrome'
  
  return (
    <div 
      className={`
        ${bgColorClass} ${textColorClass} 
        rounded-lg px-3 py-2 text-center font-ui text-beamer-caption
        transition-colors duration-200
      `}
      data-testid="pool-status-indicator"
    >
      <span>{statusText}</span>
      {isReady && (
        <span 
          className="ml-1" 
          data-testid="pool-status-ready"
          aria-label="Heat bereit"
        >
          ✓
        </span>
      )}
    </div>
  )
}
