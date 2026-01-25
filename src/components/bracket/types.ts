import type { Heat, Pilot } from '../../types'

// Phase 4: Bracket-Structure-Generator entfernt
// BracketType wird jetzt als einfacher Union-Type definiert
export type BracketType = 'qualification' | 'winner' | 'loser' | 'finale' | 'grand_finale'

// Heat Box Props
export interface BracketHeatBoxProps {
  heat: Heat
  pilots: Pilot[]
  bracketType: BracketType
  onClick?: () => void
  onEdit?: () => void
  canEdit?: boolean
  isNew?: boolean
}

// Phase 4: EmptyBracketHeatBoxProps - vereinfacht ohne BracketHeat dependency
export interface EmptyBracketHeatBoxProps {
  bracketHeat: {
    id: string
    heatNumber: number
    pilotIds: string[]
    status: string
    roundNumber?: number
    bracketType?: BracketType
    sourceHeats?: string[]
    position?: { x: number; y: number }
  }
  bracketType: BracketType
  displayHeatNumber?: number
}

// Phase 4: FilledBracketHeatBoxProps - vereinfacht
export interface FilledBracketHeatBoxProps {
  bracketHeat: {
    id: string
    heatNumber: number
    pilotIds: string[]
    status: string
  }
  pilots: Pilot[]
  bracketType: BracketType
  onClick?: () => void
  displayHeatNumber?: number
  actualHeat?: Heat
}

// GrandFinaleSectionProps - now using CSS-based centering
export interface GrandFinaleSectionProps {
  grandFinaleHeat: Heat | null
  pilots: Pilot[]
  heats: Heat[] // For bracketOrigin lookup
  onHeatClick: (heatId: string) => void
  registerHeatRef?: (heatId: string, element: HTMLDivElement | null) => void
}

// Grand Finale Heat Box
export interface GrandFinaleHeatBoxProps {
  heat: Heat
  pilots: Pilot[]
  heats?: Heat[]  // Story 11-6: Needed for bracket origin tags
  onClick?: () => void
}

// US-14.8: Zoom Indicator Props
export interface ZoomIndicatorProps {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
}
