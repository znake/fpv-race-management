/**
 * US-14.10: Layout Calculator for dynamic bracket widths
 */

export const BRACKET_CONSTANTS = {
  HEAT_WIDTH: 140,
  GAP: 10,
  GAP_R2_FACTOR: 2, // Faktor für Runde 2+
  CONNECTOR_HEIGHT: 40,
}

/**
 * Calculates the width of a bracket column (WB or LB)
 * AC1: (Heats in R1) × Heat-Width + (Heats-1) × Gap
 */
export function calculateColumnWidth(heatsInR1: number): number {
  if (heatsInR1 <= 0) return 600 // Minimum width
  return heatsInR1 * BRACKET_CONSTANTS.HEAT_WIDTH + (heatsInR1 - 1) * BRACKET_CONSTANTS.GAP
}

/**
 * Calculates the gap for rounds 2+ to center heats under parents
 * AC5: Gap = 2 × Heat-Width + Standard-Gap - Heat-Width
 */
export function calculateRoundGap(roundIndex: number): number {
  if (roundIndex === 0) return BRACKET_CONSTANTS.GAP
  
  // Exponential growth for gaps in deeper rounds
  // R2 (idx 1): 2 * 140 + 10 - 140 = 150 (Note: Mockup says 160, but logic should be consistent)
  // The mockup says 160 which is (2 * 140 + 10) - 140 + 10? 
  // Let's use the formula: parent_width = 2 * Heat + Gap. 
  // To center child: child_offset = (parent_width - child_width) / 2
  // But since we use flex gap, we need the space BETWEEN two children.
  
  return (Math.pow(2, roundIndex) * BRACKET_CONSTANTS.HEAT_WIDTH) + 
         ((Math.pow(2, roundIndex) - 1) * BRACKET_CONSTANTS.GAP) - 
         BRACKET_CONSTANTS.HEAT_WIDTH
}
