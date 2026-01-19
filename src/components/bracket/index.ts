// Main component
export { BracketTree } from './BracketTree'

// Types
export * from './types'

// Heat Boxes
export { EmptyBracketHeatBox } from './heat-boxes/EmptyBracketHeatBox'
export { BracketHeatBox } from './heat-boxes/BracketHeatBox'
export { FilledBracketHeatBox } from './heat-boxes/FilledBracketHeatBox'

// Phase 4: Legacy Layout-Komponenten entfernt (HeatsSection, BracketRoundColumn, DynamicLBHeatsSection)

// Sections
export { WinnerBracketSection } from './sections/WinnerBracketSection'
export { LoserBracketSection } from './sections/LoserBracketSection'
export { GrandFinaleSection } from './sections/GrandFinaleSection'
export { GrandFinaleHeatBox } from './sections/GrandFinaleHeatBox'

// Pools
export { PoolDisplay } from './PoolDisplay'

// SVG Lines (Story 11-2)
export { SVGConnectorLines, getHeatConnections } from './SVGConnectorLines'
export type { ConnectorLine } from './SVGConnectorLines'

// Legend (Story 11-7)
export { BracketLegend } from './BracketLegend'
