import type React from 'react'
import type { Heat, Pilot } from '../../types'
import type { FullBracketStructure, BracketHeat, BracketType } from '../../lib/bracket-structure-generator'

// Heat Box Props
export interface BracketHeatBoxProps {
  heat: Heat
  pilots: Pilot[]
  bracketType: BracketType
  onClick?: () => void
  onEdit?: () => void
  isNew?: boolean
}

export interface EmptyBracketHeatBoxProps {
  bracketHeat: BracketHeat
  bracketType: BracketType
  displayHeatNumber?: number
}

export interface FilledBracketHeatBoxProps {
  bracketHeat: BracketHeat
  pilots: Pilot[]
  bracketType: BracketType
  onClick?: () => void
  displayHeatNumber?: number
  actualHeat?: Heat
}

// Layout Props
export interface HeatsSectionProps {
  fullBracket: FullBracketStructure
  heats: Heat[]
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
}

export interface BracketRoundColumnProps {
  round: {
    id: string
    roundName: string
    heats: BracketHeat[]
  }
  bracketType: 'winner' | 'loser'
  pilots: Pilot[]
  heats: Heat[]
}

// Section Props
export interface WinnerBracketSectionProps {
  fullBracket: FullBracketStructure
  pilots: Pilot[]
  heats: Heat[]
  onHeatClick: (heatId: string) => void
}

// US-14.4: Old LoserBracketSectionProps kept for backwards compatibility
export interface LoserBracketSectionPropsLegacy {
  fullBracket: FullBracketStructure
  pilots: Pilot[]
  heats: Heat[]
  loserPool: string[]
  hasActiveWBHeats: boolean
  onHeatClick: (heatId: string) => void
}

// US-14.4: New LoserBracketSectionProps with structure-based approach
export interface LoserBracketSectionProps {
  structure: FullBracketStructure['loserBracket']
  heats: Heat[]
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
  registerHeatRef: (heatId: string, el: HTMLDivElement | null) => void
  columnWidth?: number // Optional, calculated from structure if not provided
}

// US-14.7: Legacy GrandFinaleSectionProps for backwards compatibility
export interface GrandFinaleSectionPropsLegacy {
  fullBracket: FullBracketStructure
  pilots: Pilot[]
  heats: Heat[]
  grandFinalePool: string[]
}

// US-14.7: New GrandFinaleSectionProps with dynamic positioning
export interface GrandFinaleSectionProps {
  grandFinaleHeat: Heat | null
  pilots: Pilot[]
  heats: Heat[] // For bracketOrigin lookup
  wbFinaleRef: React.RefObject<HTMLDivElement>
  lbFinaleRef: React.RefObject<HTMLDivElement>
}

export interface DynamicLBHeatsSectionProps {
  heats: Heat[]
  fullBracket: FullBracketStructure
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
}

// Grand Finale Heat Box
export interface GrandFinaleHeatBoxProps {
  heat: Heat
  pilots: Pilot[]
  heats?: Heat[]  // Story 11-6: Needed for bracket origin tags
}
