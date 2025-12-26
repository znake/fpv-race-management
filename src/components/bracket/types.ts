import type { Heat, Pilot } from '../../stores/tournamentStore'
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
  winnerPool: string[]
  onHeatClick: (heatId: string) => void
}

export interface LoserBracketSectionProps {
  fullBracket: FullBracketStructure
  pilots: Pilot[]
  heats: Heat[]
  loserPool: string[]
  hasActiveWBHeats: boolean
  onHeatClick: (heatId: string) => void
}

export interface GrandFinaleSectionProps {
  fullBracket: FullBracketStructure
  pilots: Pilot[]
  heats: Heat[]
  grandFinalePool: string[]
}

export interface DynamicLBHeatsSectionProps {
  heats: Heat[]
  fullBracket: FullBracketStructure
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
}

// Pool Props
export interface PoolVisualizationProps {
  type: 'winner' | 'loser'
  pilotIds: string[]
  pilots: Pilot[]
  threshold?: number
  title: string
}

export interface GrandFinalePoolVisualizationProps {
  grandFinalePool: string[]
  pilots: Pilot[]
}

// Grand Finale Heat Box
export interface GrandFinaleHeatBoxProps {
  heat: Heat
  pilots: Pilot[]
}
