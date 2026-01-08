/**
 * US-14.10: Layout Calculator for dynamic bracket widths (8-60 pilots)
 * US-14.4: Added LB-specific calculations and 3-pilot heat support
 */

export const BRACKET_CONSTANTS = {
  HEAT_WIDTH: 140,
  HEAT_WIDTH_3: 120, // US-14.4 AC6: Width for 3-pilot heats
  GAP: 10,
  GAP_R2_FACTOR: 2, // Faktor für Runde 2+
  CONNECTOR_HEIGHT: 40,
  POOL_INDICATOR_HEIGHT: 30, // US-14.4 AC4: Height for pool indicators
  COLUMN_GAP: 40,  // AC1: Gap between WB and LB columns
  CONTAINER_PADDING: 50, // AC1: Padding for container
}

/**
 * US-14.10: Bracket Dimensions Interface
 * Contains all layout calculations for dynamic bracket scaling
 */
export interface BracketDimensions {
  containerWidth: number
  wbColumnWidth: number
  lbColumnWidth: number
  qualiWidth: number
  heatsPerRound: {
    wb: number[]  // z.B. [4, 2, 1] für 32 Piloten
    lb: number[]  // z.B. [6, 4, 3, 2, 1] für 32 Piloten
  }
  roundLabels: {
    wb: string[]  // z.B. ["RUNDE 1 (16 Piloten)", "RUNDE 2 (8 Piloten)", "FINALE (4 Piloten)"]
    lb: string[]  // z.B. ["RUNDE 1 (24 Piloten: 16 Quali + 8 WB R1)", ...]
  }
  roundPilotCounts: {
    wb: number[]
    lb: number[]
  }
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

/**
 * US-14.4: Calculates the width of the Loser Bracket column
 * Uses same formula as WB but with LB-specific heats count
 * AC1: (max Heats in einer Runde) × Heat-Width + (Heats-1) × Gap
 */
export function calculateLBColumnWidth(maxHeatsInRound: number): number {
  if (maxHeatsInRound <= 0) return 600 // Minimum width
  return maxHeatsInRound * BRACKET_CONSTANTS.HEAT_WIDTH + (maxHeatsInRound - 1) * BRACKET_CONSTANTS.GAP
}

/**
 * US-14.4 AC6: Calculate heat width based on pilot count
 * 3-pilot heats use 120px, 4-pilot heats use 140px
 */
export function calculateHeatWidth(pilotCount: number): number {
  return pilotCount === 3 ? BRACKET_CONSTANTS.HEAT_WIDTH_3 : BRACKET_CONSTANTS.HEAT_WIDTH
}

/**
 * US-14.10: Calculate quali width with 3-pilot heat support
 */
function calculateQualiWidth(pilotCount: number): number {
  const { HEAT_WIDTH, HEAT_WIDTH_3, GAP } = BRACKET_CONSTANTS

  // Calculate number of 4-pilot and 3-pilot heats
  const fullHeats = Math.floor(pilotCount / 4)
  const remainder = pilotCount % 4
  const threePilotHeats = remainder > 0 ? 1 : 0

  // Calculate width
  let width = 0

  // Width for 4-pilot heats
  if (fullHeats > 0) {
    width += fullHeats * HEAT_WIDTH
    if (fullHeats > 1) {
      width += (fullHeats - 1) * GAP
    }
  }

  // Width for 3-pilot heat (if any)
  if (threePilotHeats > 0) {
    if (fullHeats > 0) {
      width += GAP // Gap between last 4-pilot heat and 3-pilot heat
    }
    width += HEAT_WIDTH_3
  }

  return width
}

/**
 * US-14.10 AC2, AC4, AC5: Calculate Winner Bracket structure
 */
function calculateWBStructure(pilotCount: number) {
  const { HEAT_WIDTH, GAP } = BRACKET_CONSTANTS

  // AC5: WB R1: (Quali-Gewinner) / 4 = Piloten / 2 / 4 = Piloten / 8
  const wbR1Heats = Math.ceil(pilotCount / 8)

  // Calculate heats per round using AC5 formula
  const wbHeatsPerRound: number[] = []
  const wbPilotCounts: number[] = []

  let currentWBHeats = wbR1Heats
  let currentWBPilots = Math.floor(pilotCount / 2) // Quali winners

  while (currentWBHeats >= 1) {
    wbHeatsPerRound.push(currentWBHeats)
    wbPilotCounts.push(currentWBPilots)

    // AC5: WB RN: Heats der Vorrunde / 2
    // Progress: top 2 from each heat advance
    currentWBPilots = Math.ceil(currentWBPilots / 2)
    currentWBHeats = Math.ceil(currentWBHeats / 2)

    // Stop when we reach 1 heat (finale)
    if (currentWBHeats === 1) {
      // Add finale round
      wbHeatsPerRound.push(1)
      wbPilotCounts.push(currentWBPilots)
      break
    }
  }

  // Ensure at least 1 round (even if no pilots)
  if (wbHeatsPerRound.length === 0) {
    wbHeatsPerRound.push(1)
    wbPilotCounts.push(0)
  }

  // AC2: WB column width based on max heats in any round
  const maxWBHeats = Math.max(...wbHeatsPerRound)
  const wbColumnWidth = maxWBHeats * HEAT_WIDTH + (maxWBHeats - 1) * GAP

  // AC4: Generate round labels
  const wbLabels = wbPilotCounts.map((count, idx) => {
    if (idx === wbHeatsPerRound.length - 1) {
      return `FINALE (${count} Piloten)`
    }
    return `RUNDE ${idx + 1} (${count} Piloten)`
  })

  return {
    wbHeatsPerRound,
    wbPilotCounts,
    wbLabels,
    wbColumnWidth
  }
}

/**
 * US-14.10 AC3, AC4, AC5: Calculate Loser Bracket structure
 */
function calculateLBStructure(pilotCount: number, wbHeatsPerRound: number[]) {
  const { HEAT_WIDTH, GAP } = BRACKET_CONSTANTS

  // LB R1: Quali losers + WB R1 losers
  // Quali losers: pilotCount / 2
  // WB R1 losers: wbHeatsPerRound[0] * 2 (each WB heat sends 2 losers to LB)
  const qualiLosers = Math.ceil(pilotCount / 2)
  const wbR1Losers = wbHeatsPerRound[0] * 2
  const lbR1Pilots = qualiLosers + wbR1Losers

  const lbHeatsPerRound: number[] = []
  const lbPilotCounts: number[] = []

  let currentLBPilots = lbR1Pilots

  // LB R1
  const lbR1Heats = Math.ceil(currentLBPilots / 4)
  lbHeatsPerRound.push(lbR1Heats)
  lbPilotCounts.push(currentLBPilots)

  // LB subsequent rounds
  for (let i = 1; i < wbHeatsPerRound.length; i++) {
    // Add WB losers from this round
    const wbLosers = wbHeatsPerRound[i] * 2
    currentLBPilots += wbLosers

    // Calculate heats
    const heats = Math.ceil(currentLBPilots / 4)
    lbHeatsPerRound.push(heats)
    lbPilotCounts.push(currentLBPilots)

    // Progress: top 2 from each heat continue
    currentLBPilots = heats * 2

    // Check for edge case
    if (currentLBPilots <= 0) {
      break
    }
  }

  // Safety: Ensure we have at least 1 round
  if (lbHeatsPerRound.length === 0) {
    lbHeatsPerRound.push(1)
    lbPilotCounts.push(0)
  }

  // Add LB finale if not already present
  if (lbHeatsPerRound.length > 0 && lbHeatsPerRound[lbHeatsPerRound.length - 1] > 1) {
    lbHeatsPerRound.push(1)
    lbPilotCounts.push(2) // 2 pilots in LB finale
  }

  // AC3: LB column width based on max heats in any round
  const maxLBHeats = Math.max(...lbHeatsPerRound)
  const lbColumnWidth = maxLBHeats * HEAT_WIDTH + (maxLBHeats - 1) * GAP

  // AC4: Generate round labels
  const lbLabels = lbPilotCounts.map((count, idx) => {
    if (idx === lbHeatsPerRound.length - 1) {
      return `FINALE (${count} Piloten)`
    }
    return `RUNDE ${idx + 1} (${count} Piloten)`
  })

  return {
    lbHeatsPerRound,
    lbPilotCounts,
    lbLabels,
    lbColumnWidth
  }
}

/**
 * US-14.10 AC1-AC8: Calculate bracket dimensions for 8-60 pilots
 *
 * @param pilotCount - Number of pilots (8-60)
 * @returns BracketDimensions with all layout calculations
 */
export function calculateBracketDimensions(pilotCount: number): BracketDimensions {
  const { COLUMN_GAP, CONTAINER_PADDING } = BRACKET_CONSTANTS

  // Calculate quali width
  const qualiWidth = calculateQualiWidth(pilotCount)

  // Calculate WB structure
  const { wbHeatsPerRound, wbPilotCounts, wbLabels, wbColumnWidth } = calculateWBStructure(pilotCount)

  // Calculate LB structure
  const { lbHeatsPerRound, lbPilotCounts, lbLabels, lbColumnWidth } = calculateLBStructure(pilotCount, wbHeatsPerRound)

  // AC1: Container width = WB width + Gap + LB width + Padding
  const containerWidth = wbColumnWidth + COLUMN_GAP + lbColumnWidth + CONTAINER_PADDING

  return {
    containerWidth,
    wbColumnWidth,
    lbColumnWidth,
    qualiWidth,
    heatsPerRound: {
      wb: wbHeatsPerRound,
      lb: lbHeatsPerRound
    },
    roundLabels: {
      wb: wbLabels,
      lb: lbLabels
    },
    roundPilotCounts: {
      wb: wbPilotCounts,
      lb: lbPilotCounts
    }
  }
}
