import type { Heat, Pilot } from '@/types'

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
  onPilotHover?: (pilotId: string | null) => void
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
  onPilotHover?: (pilotId: string | null) => void
}

// US-14.8: Zoom Indicator Props
export interface ZoomIndicatorProps {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFitToView?: () => void
}
