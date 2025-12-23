/**
 * Bracket Structure Generator
 * 
 * Generates the complete bracket structure for a Double Elimination tournament
 * with three sections: Qualification, Winner Bracket, Loser Bracket, and Grand Finale.
 * 
 * Structure is generated BEFORE any heats are played, showing empty placeholders.
 * 
 * CRITICAL CONSTRAINT: No heat can have more than 4 pilots.
 * 
 * Double Elimination with 4-pilot heats requires careful LB structure:
 * - Minor Rounds: Receive WB losers + LB winners (must be split into enough heats)
 * - Major Rounds: Only LB winners (no WB input)
 * 
 * This ensures no LB heat receives more than 4 pilots from all sources combined.
 */

// Heat status in bracket
export type BracketHeatStatus = 'empty' | 'pending' | 'active' | 'completed'

// Bracket section types
export type BracketType = 'qualification' | 'winner' | 'loser' | 'finale'

// LB Round types for proper Double Elimination structure
// - 'minor': Receives WB losers + LB winners (WB dropdowns enter here)
// - 'major': Only LB winners play (no WB input, pure LB progression)
export type LBRoundType = 'major' | 'minor'

// A single heat in the bracket
export interface BracketHeat {
  id: string
  heatNumber: number
  roundNumber: number
  bracketType: BracketType
  status: BracketHeatStatus
  pilotIds: string[]  // Empty when status is 'empty'
  sourceHeats: string[]  // IDs of heats that feed into this heat
  targetWinnerHeat?: string  // Where winners go (for quali heats)
  targetLoserHeat?: string   // Where losers go (for quali heats)
  targetHeat?: string  // Next heat in bracket progression (same bracket)
  targetLoserFromWB?: string  // WB losers feed into this LB heat (Task 16)
  position: { x: number; y: number }  // For rendering
  roundType?: LBRoundType  // Only for LB heats: major or minor
  // Tracking for overflow prevention
  expectedPilotsFromLB?: number  // Expected pilots from LB progression (sourceHeats)
  expectedPilotsFromWB?: number  // Expected pilots from WB losers (targetLoserFromWB)
}

// A round in a bracket section
export interface BracketRound {
  id: string
  roundNumber: number
  roundName: string
  heats: BracketHeat[]
  roundType?: LBRoundType  // Only for LB rounds: major or minor
}

// Complete bracket structure with 3 sections
export interface FullBracketStructure {
  qualification: {
    heats: BracketHeat[]
  }
  winnerBracket: {
    rounds: BracketRound[]
  }
  loserBracket: {
    rounds: BracketRound[]
  }
  grandFinale: BracketHeat | null
}

// Bracket size calculations
export interface BracketSize {
  qualiHeats: number
  winnersFromQuali: number
  losersFromQuali: number
  wbRounds: number
  lbRounds: number
  totalHeats: number
}

// Detailed LB round info for proper heat calculation
export interface LBRoundInfo {
  roundNumber: number
  roundType: LBRoundType
  pilotsFromLB: number      // Winners from previous LB round
  pilotsFromWB: number      // Losers from which WB round (0 if none)
  wbSourceRound: number     // Which WB round feeds losers here (-1 if none)
  totalPilots: number       // pilotsFromLB + pilotsFromWB
  heatsNeeded: number       // ceil(totalPilots / 4)
  winnersProduced: number   // heatsNeeded * 2
}

/**
 * Calculate WB rounds needed based on winners from quali
 * 
 * WB must reduce winners to 2 pilots for the finale.
 * Each heat takes 4 pilots and produces 2 winners.
 */
function calculateWBRounds(winnersFromQuali: number): number {
  // WB needs to get from winnersFromQuali down to 2 pilots
  // Each round halves the number of pilots (4→2 per heat)
  // Formula: ceil(log2(winnersFromQuali / 2))
  
  if (winnersFromQuali <= 4) return 1  // 4→2 in one round
  if (winnersFromQuali <= 8) return 2  // 8→4→2
  if (winnersFromQuali <= 16) return 3 // 16→8→4→2
  return 4 // 32→16→8→4→2
}

/**
 * Calculate detailed LB round structure
 * 
 * This is the KEY function for solving the overflow problem.
 * It calculates how many heats are needed in each LB round based on:
 * 1. Pilots coming from previous LB round (winners)
 * 2. Pilots coming from WB (losers dropping down)
 * 
 * The structure ensures no heat exceeds 4 pilots.
 * 
 * CRITICAL FIX (2025-12-22): The number of LB heats must match the actual
 * pilot flow, not an idealized structure. Each LB heat needs exactly 4 pilots
 * (or 3-4 for smaller brackets) to be playable.
 * 
 * Key insight: LB heats receive pilots from TWO sources:
 * - Previous LB round winners (2 per source heat)
 * - WB losers from corresponding WB round (2 per WB heat)
 * 
 * The number of LB heats in each round must be calculated so that
 * EVERY heat gets at least 3-4 pilots. Empty or 2-pilot heats are NOT allowed.
 */
export function calculateLBRoundStructure(
  qualiHeats: number,
  wbRoundsBeforeFinale: number
): LBRoundInfo[] {
  const rounds: LBRoundInfo[] = []
  const losersFromQuali = qualiHeats * 2  // Each quali heat produces 2 losers
  
  // Calculate WB heats per round (to know how many losers drop)
  // WB Round 1: ceil(winnersFromQuali / 4) heats
  // Each subsequent round: ceil(previous / 2) heats
  const winnersFromQuali = qualiHeats * 2
  const wbHeatsPerRound: number[] = []
  let wbHeatsInRound = Math.ceil(winnersFromQuali / 4)
  
  for (let i = 0; i < wbRoundsBeforeFinale; i++) {
    wbHeatsPerRound.push(wbHeatsInRound)
    wbHeatsInRound = Math.max(1, Math.ceil(wbHeatsInRound / 2))
  }
  // WB Finale is always 1 heat
  wbHeatsPerRound.push(1)
  
  // LB Round 1: Receives ALL quali losers (Minor round)
  const lbR1Pilots = losersFromQuali
  const lbR1Heats = Math.ceil(lbR1Pilots / 4)
  rounds.push({
    roundNumber: 1,
    roundType: 'minor',
    pilotsFromLB: 0,
    pilotsFromWB: 0, // Quali losers, not WB losers
    wbSourceRound: -1,
    totalPilots: lbR1Pilots,
    heatsNeeded: lbR1Heats,
    winnersProduced: lbR1Heats * 2
  })
  
  let currentLBWinners = lbR1Heats * 2  // Winners from LB R1
  let currentWBRound = 0  // Index into wbHeatsPerRound
  let roundNumber = 2
  
  // Process each WB round's losers
  while (currentWBRound <= wbRoundsBeforeFinale) {
    const wbLosers = wbHeatsPerRound[currentWBRound] * 2  // 2 losers per WB heat
    const combinedPilots = currentLBWinners + wbLosers
    
    // CRITICAL FIX: Calculate heats needed based on actual source distribution
    // 
    // The key insight: pilots come from TWO separate sources (LB and WB),
    // and each source sends pilots in pairs (2 per source heat).
    // We need enough heats so that each heat gets a reasonable distribution.
    // 
    // Problem case: 4 LB winners (from 2 heats) + 2 WB losers (from 1 heat) = 6 pilots
    // If we use 2 heats: one gets 4 (from 2 LB sources), one gets 2 (from 1 WB source)
    // This creates an unplayable 2-pilot heat!
    // 
    // Solution: Use the number of SOURCE heats as the basis, not the pilot count.
    // Each LB source sends 2 winners, each WB source sends 2 losers.
    // We need at least as many target heats as MAX(LB sources, WB sources)
    // to ensure even distribution.
    
    const numLBSourceHeats = Math.ceil(currentLBWinners / 2)  // Each source contributes 2 winners
    // Note: numWBSourceHeats = wbHeatsPerRound[currentWBRound], but not directly used
    // WB sources are distributed across heats during linking phase
    
    // Calculate heats needed based on pilot count (ceiling of pilots/4)
    let heatsFromPilots = Math.ceil(combinedPilots / 4)
    
    // But also consider: we need at least 1 heat per pair of source heats
    // to avoid some heats getting 0 pilots from one source
    // The linking algorithm distributes round-robin, so we need:
    // - Enough heats that LB sources can be distributed (each gives 2 pilots)
    // - Enough heats that WB sources can be distributed (each gives 2 pilots)
    // - But not so many that heats end up with <3 pilots
    
    // Key rule: Calculate heats needed so that EVERY heat gets at least 3 pilots
    // from the combined LB + WB sources.
    //
    // The critical insight: LB sources and WB sources are distributed separately.
    // If we have 2 LB sources (4 pilots) + 1 WB source (2 pilots) = 6 pilots total,
    // and we use 2 heats, the linking algorithm will put:
    // - Heat 1: 1 LB source (2 pilots) + 1 WB source (2 pilots) = 4 pilots
    // - Heat 2: 1 LB source (2 pilots) + nothing = 2 pilots ← THIS IS THE BUG!
    //
    // Solution: The number of heats should be LIMITED by the number of WB sources
    // when WB sources < LB sources. This ensures every heat gets WB input.
    //
    // New rule: heatsNeeded = min(ceil(totalPilots/4), max(numLBSources, numWBSources))
    // But if numWBSources < numLBSources, we must use numWBSources as upper bound
    // to ensure every heat gets pilots from both sources.
    
    const numWBSources = wbHeatsPerRound[currentWBRound]
    let heatsNeeded = heatsFromPilots
    
    // If there are fewer WB sources than LB sources, limit heats to WB source count
    // This ensures every LB heat receives WB losers
    if (numWBSources < numLBSourceHeats && numWBSources > 0) {
      // Each WB source provides 2 losers, so max pilots per heat from WB = 2
      // Each LB source provides 2 winners
      // To avoid 2-pilot heats, limit heats to numWBSources
      // But ensure we can still fit all pilots (max 4 per heat)
      const maxHeatsFromWB = numWBSources
      heatsNeeded = Math.min(heatsNeeded, Math.max(1, maxHeatsFromWB))
    }
    
    // Ensure we don't exceed 4 pilots per heat
    while (combinedPilots > heatsNeeded * 4) {
      heatsNeeded++
    }
    
    // Final check: ensure at least 3 pilots per heat on average
    // If not possible, accept the minimum viable structure
    if (heatsNeeded > 1 && combinedPilots / heatsNeeded < 3) {
      heatsNeeded = Math.max(1, Math.ceil(combinedPilots / 4))
    }
    
    // Ensure we don't exceed 4 pilots per heat
    while (combinedPilots > heatsNeeded * 4) {
      heatsNeeded++
    }
    
    // Check if we need a Major round to reduce LB winners first
    // Only needed if LB alone has more pilots than can fit in the combined heats
    const needsMajorRound = currentLBWinners > 4 && 
                           Math.ceil(currentLBWinners / 4) > heatsNeeded
    
    if (needsMajorRound) {
      // Major round: reduce LB winners first
      const majorHeats = Math.ceil(currentLBWinners / 4)
      rounds.push({
        roundNumber,
        roundType: 'major',
        pilotsFromLB: currentLBWinners,
        pilotsFromWB: 0,
        wbSourceRound: -1,
        totalPilots: currentLBWinners,
        heatsNeeded: majorHeats,
        winnersProduced: majorHeats * 2
      })
      currentLBWinners = majorHeats * 2
      roundNumber++
      
      // Recalculate combined pilots after Major round
      const newCombinedPilots = currentLBWinners + wbLosers
      let minorHeats = Math.ceil(newCombinedPilots / 4)
      
      // Ensure at least 3 pilots per heat
      while (minorHeats > 1 && newCombinedPilots / minorHeats < 3) {
        minorHeats--
      }
      
      rounds.push({
        roundNumber,
        roundType: 'minor',
        pilotsFromLB: currentLBWinners,
        pilotsFromWB: wbLosers,
        wbSourceRound: currentWBRound + 1,
        totalPilots: newCombinedPilots,
        heatsNeeded: minorHeats,
        winnersProduced: minorHeats * 2
      })
      currentLBWinners = minorHeats * 2
    } else {
      // Direct combination: no Major round needed
      rounds.push({
        roundNumber,
        roundType: 'minor',
        pilotsFromLB: currentLBWinners,
        pilotsFromWB: wbLosers,
        wbSourceRound: currentWBRound + 1,
        totalPilots: combinedPilots,
        heatsNeeded: heatsNeeded,
        winnersProduced: heatsNeeded * 2
      })
      currentLBWinners = heatsNeeded * 2
    }
    
    currentWBRound++
    roundNumber++
  }
  
  return rounds
}

/**
 * Calculate bracket dimensions based on pilot count
 * 
 * For proper Double Elimination with 4-pilot heats:
 * - WB rounds: Based on log2(winners) to get down to 2 pilots for WB Finale
 * - LB rounds: Dynamically calculated to handle WB dropout insertion
 * 
 * This ensures no LB heat receives more than 4 pilots from all sources combined.
 */
export function calculateBracketSize(pilotCount: number): BracketSize {
  // Qualifikation: 4 Piloten pro Heat, aufgerundet
  const qualiHeats = Math.ceil(pilotCount / 4)
  
  // Nach Quali: Platz 1+2 → Winner, Platz 3+4 → Loser
  const winnersFromQuali = qualiHeats * 2
  const losersFromQuali = qualiHeats * 2
  
  // Calculate WB rounds (not counting finale as a "round")
  const wbRoundsBeforeFinale = calculateWBRounds(winnersFromQuali)
  
  // Calculate LB structure dynamically
  const lbRoundStructure = calculateLBRoundStructure(qualiHeats, wbRoundsBeforeFinale)
  const lbRounds = lbRoundStructure.length
  
  // Calculate total heats
  let wbHeats = 0
  let heatsInRound = Math.ceil(winnersFromQuali / 4)
  for (let i = 0; i < wbRoundsBeforeFinale; i++) {
    wbHeats += heatsInRound
    heatsInRound = Math.max(1, Math.ceil(heatsInRound / 2))
  }
  wbHeats += 1 // WB Finale
  
  const lbHeats = lbRoundStructure.reduce((sum, r) => sum + r.heatsNeeded, 0)
  const totalHeats = qualiHeats + wbHeats + lbHeats + 1 // +1 for Grand Finale
  
  return {
    qualiHeats,
    winnersFromQuali,
    losersFromQuali,
    wbRounds: wbRoundsBeforeFinale,
    lbRounds,
    totalHeats
  }
}

/**
 * Generate complete bracket structure with empty placeholder heats
 * 
 * Uses the new calculateLBRoundStructure() to ensure no LB heat gets > 4 pilots.
 */
export function generateFullBracketStructure(pilotCount: number): FullBracketStructure {
  const size = calculateBracketSize(pilotCount)
  
  let heatCounter = 1
  const generateHeatId = () => `bracket-heat-${heatCounter++}`
  
  // Layout constants
  const HEAT_WIDTH = 200
  const HEAT_HEIGHT = 140
  const HORIZONTAL_GAP = 80
  const VERTICAL_GAP = 20
  
  // =====================================
  // QUALIFICATION HEATS (Runde 1)
  // =====================================
  const qualiHeats: BracketHeat[] = []
  for (let i = 0; i < size.qualiHeats; i++) {
    qualiHeats.push({
      id: generateHeatId(),
      heatNumber: i + 1,
      roundNumber: 1,
      bracketType: 'qualification',
      status: 'empty',
      pilotIds: [],
      sourceHeats: [],
      position: {
        x: i * (HEAT_WIDTH + HORIZONTAL_GAP / 2),
        y: 0
      }
    })
  }
  
  // =====================================
  // WINNER BRACKET
  // =====================================
  const winnerRounds: BracketRound[] = []
  
  // Calculate heats per round in WB
  let wbHeatsInRound = Math.ceil(size.winnersFromQuali / 4)
  
  for (let roundNum = 0; roundNum < size.wbRounds; roundNum++) {
    const roundId = `wb-round-${roundNum + 2}` // +2 because Quali is Round 1
    const heatsInThisRound = Math.max(1, Math.ceil(wbHeatsInRound / Math.pow(2, roundNum)))
    
    const roundHeats: BracketHeat[] = []
    for (let heatIdx = 0; heatIdx < heatsInThisRound; heatIdx++) {
      roundHeats.push({
        id: generateHeatId(),
        heatNumber: heatCounter,
        roundNumber: roundNum + 2,
        bracketType: 'winner',
        status: 'empty',
        pilotIds: [],
        sourceHeats: [],
        position: {
          x: (roundNum + 1) * (HEAT_WIDTH + HORIZONTAL_GAP),
          y: heatIdx * (HEAT_HEIGHT + VERTICAL_GAP) * Math.pow(2, roundNum)
        }
      })
    }
    
    winnerRounds.push({
      id: roundId,
      roundNumber: roundNum + 2,
      roundName: getRoundName('winner', roundNum, size.wbRounds),
      heats: roundHeats
    })
    
    wbHeatsInRound = heatsInThisRound
  }
  
  // Add WB Finale
  if (winnerRounds.length > 0) {
    const wbFinaleRound: BracketRound = {
      id: 'wb-finale',
      roundNumber: size.wbRounds + 2,
      roundName: 'WB Finale',
      heats: [{
        id: generateHeatId(),
        heatNumber: heatCounter,
        roundNumber: size.wbRounds + 2,
        bracketType: 'winner',
        status: 'empty',
        pilotIds: [],
        sourceHeats: [],
        position: {
          x: (size.wbRounds + 1) * (HEAT_WIDTH + HORIZONTAL_GAP),
          y: 0
        }
      }]
    }
    winnerRounds.push(wbFinaleRound)
  }
  
  // =====================================
  // LOSER BRACKET (NEW: Using calculated structure)
  // =====================================
  // Use the new calculateLBRoundStructure to get the correct number of heats
  // per round, ensuring no heat exceeds 4 pilots.
  
  const lbRoundStructure = calculateLBRoundStructure(size.qualiHeats, size.wbRounds)
  const loserRounds: BracketRound[] = []
  
  for (let i = 0; i < lbRoundStructure.length; i++) {
    const roundInfo = lbRoundStructure[i]
    const roundId = `lb-round-${roundInfo.roundNumber}`
    
    const roundHeats: BracketHeat[] = []
    for (let heatIdx = 0; heatIdx < roundInfo.heatsNeeded; heatIdx++) {
      // Calculate expected pilots for this heat (for validation/debugging)
      const lbPilotsPerHeat = roundInfo.pilotsFromLB > 0 
        ? Math.ceil(roundInfo.pilotsFromLB / roundInfo.heatsNeeded) 
        : 0
      const wbPilotsPerHeat = roundInfo.pilotsFromWB > 0 
        ? Math.ceil(roundInfo.pilotsFromWB / roundInfo.heatsNeeded) 
        : 0
      
      roundHeats.push({
        id: generateHeatId(),
        heatNumber: heatCounter,
        roundNumber: roundInfo.roundNumber,
        bracketType: 'loser',
        status: 'empty',
        pilotIds: [],
        sourceHeats: [],
        roundType: roundInfo.roundType,
        expectedPilotsFromLB: lbPilotsPerHeat,
        expectedPilotsFromWB: wbPilotsPerHeat,
        position: {
          x: i * (HEAT_WIDTH + HORIZONTAL_GAP),
          y: heatIdx * (HEAT_HEIGHT + VERTICAL_GAP) * Math.pow(2, Math.floor(i / 2))
        }
      })
    }
    
    loserRounds.push({
      id: roundId,
      roundNumber: roundInfo.roundNumber,
      roundName: getRoundName('loser', i, lbRoundStructure.length),
      roundType: roundInfo.roundType,
      heats: roundHeats
    })
  }
  
  // =====================================
  // GRAND FINALE
  // =====================================
  const grandFinale: BracketHeat = {
    id: generateHeatId(),
    heatNumber: heatCounter,
    roundNumber: 99, // Special round for finale
    bracketType: 'finale',
    status: 'empty',
    pilotIds: [],
    sourceHeats: [],
    position: {
      x: Math.max(size.wbRounds, size.lbRounds) * (HEAT_WIDTH + HORIZONTAL_GAP) + HEAT_WIDTH,
      y: 200
    }
  }
  
  // =====================================
  // LINK SOURCE/TARGET HEATS
  // =====================================
  linkBracketHeats(qualiHeats, winnerRounds, loserRounds, grandFinale, size.qualiHeats)
  
  return {
    qualification: { heats: qualiHeats },
    winnerBracket: { rounds: winnerRounds },
    loserBracket: { rounds: loserRounds },
    grandFinale
  }
}

/**
 * Link heats with source/target references
 * 
 * Links include:
 * - Quali → WB Round 1 (winners)
 * - Quali → LB Round 1 (losers)
 * - WB Round N → WB Round N+1 (winners)
 * - WB Round N → LB Minor Round (losers via targetLoserFromWB)
 * - LB Round N → LB Round N+1 (winners)
 * - WB Finale → Grand Finale
 * - LB Finale → Grand Finale
 * 
 * CRITICAL: WB losers are distributed to LB Minor rounds such that
 * no LB heat receives more than 4 pilots total.
 */
function linkBracketHeats(
  qualiHeats: BracketHeat[],
  winnerRounds: BracketRound[],
  loserRounds: BracketRound[],
  grandFinale: BracketHeat,
  qualiHeatCount: number
): void {
  // Get LB round structure for proper WB→LB mapping
  const wbRoundsBeforeFinale = winnerRounds.length > 0 ? winnerRounds.length - 1 : 0
  const lbRoundStructure = calculateLBRoundStructure(qualiHeatCount, wbRoundsBeforeFinale)
  
  // Link quali heats to WB/LB first rounds
  if (winnerRounds.length > 0 && winnerRounds[0].heats.length > 0) {
    qualiHeats.forEach((qHeat, idx) => {
      const wbTargetIdx = Math.floor(idx / 2)
      const lbTargetIdx = Math.floor(idx / 2)
      
      if (winnerRounds[0].heats[wbTargetIdx]) {
        qHeat.targetWinnerHeat = winnerRounds[0].heats[wbTargetIdx].id
        winnerRounds[0].heats[wbTargetIdx].sourceHeats.push(qHeat.id)
      }
      
      if (loserRounds.length > 0 && loserRounds[0].heats[lbTargetIdx]) {
        qHeat.targetLoserHeat = loserRounds[0].heats[lbTargetIdx].id
        loserRounds[0].heats[lbTargetIdx].sourceHeats.push(qHeat.id)
      }
    })
  }
  
  // Link WB rounds (winners to next WB round)
  for (let i = 0; i < winnerRounds.length - 1; i++) {
    const currentRound = winnerRounds[i]
    const nextRound = winnerRounds[i + 1]
    
    currentRound.heats.forEach((heat, heatIdx) => {
      const targetIdx = Math.floor(heatIdx / 2)
      if (nextRound.heats[targetIdx]) {
        heat.targetHeat = nextRound.heats[targetIdx].id
        nextRound.heats[targetIdx].sourceHeats.push(heat.id)
      }
    })
  }
  
  // COORDINATED LINKING: LB→LB and WB→LB must be done together
  // to ensure no heat exceeds 4 pilots AND WB heats from the same round
  // target DIFFERENT LB heats.
  //
  // For each LB round (except R1 which gets quali losers):
  // 1. Calculate total incoming pilots (LB winners + WB losers)
  // 2. Distribute pilots across heats, max 4 per heat
  // 3. Ensure WB heats from same WB round go to different LB heats
  
  for (let i = 0; i < loserRounds.length - 1; i++) {
    const currentLBRound = loserRounds[i]
    const nextLBRound = loserRounds[i + 1]
    const nextRoundInfo = lbRoundStructure[i + 1]
    
    if (!nextRoundInfo) continue
    
    // Get WB heats that feed into this LB round (if any)
    const wbRoundIndex = nextRoundInfo.wbSourceRound - 1
    const wbHeats = (wbRoundIndex >= 0 && wbRoundIndex < winnerRounds.length)
      ? winnerRounds[wbRoundIndex].heats
      : []
    
    const lbHeats = nextLBRound.heats
    const numLBSources = currentLBRound.heats.length
    const numWBSources = wbHeats.length
    
    // Track remaining capacity per heat (starts at 4)
    const heatCapacity = lbHeats.map(() => 4)
    
    // STRATEGY: Interleave LB and WB sources to ensure even distribution
    // and prevent multiple WB heats targeting the same LB heat
    
    // First, calculate how to distribute
    // Total pilots = numLBSources * 2 + numWBSources * 2
    // We want to spread WB heats across different LB heats
    
    // Distribute LB sources first (round-robin style)
    let lbSourceIdx = 0
    let heatIdx = 0
    while (lbSourceIdx < numLBSources) {
      if (heatCapacity[heatIdx] >= 2) {
        currentLBRound.heats[lbSourceIdx].targetHeat = lbHeats[heatIdx].id
        lbHeats[heatIdx].sourceHeats.push(currentLBRound.heats[lbSourceIdx].id)
        heatCapacity[heatIdx] -= 2
        lbSourceIdx++
      }
      heatIdx = (heatIdx + 1) % lbHeats.length
      
      // Safety check to prevent infinite loop
      if (heatCapacity.every(c => c < 2)) break
    }
    
    // Distribute WB sources - each WB heat should go to a DIFFERENT LB heat
    // Use round-robin distribution to spread them out
    let wbSourceIdx = 0
    heatIdx = 0
    while (wbSourceIdx < numWBSources) {
      // Find next LB heat with capacity
      let attempts = 0
      while (heatCapacity[heatIdx] < 2 && attempts < lbHeats.length) {
        heatIdx = (heatIdx + 1) % lbHeats.length
        attempts++
      }
      
      if (heatCapacity[heatIdx] >= 2) {
        wbHeats[wbSourceIdx].targetLoserFromWB = lbHeats[heatIdx].id
        heatCapacity[heatIdx] -= 2
        wbSourceIdx++
        // Move to next LB heat for next WB heat (ensures different targets)
        heatIdx = (heatIdx + 1) % lbHeats.length
      } else {
        // No more capacity - shouldn't happen if structure is correct
        console.warn(`Warning: Cannot assign WB heat ${wbSourceIdx} to LB round ${nextRoundInfo.roundNumber}`)
        break
      }
    }
  }
  
  // Link finals to grand finale
  if (winnerRounds.length > 0) {
    const wbFinalRound = winnerRounds[winnerRounds.length - 1]
    if (wbFinalRound.heats.length > 0) {
      wbFinalRound.heats[0].targetHeat = grandFinale.id
      grandFinale.sourceHeats.push(wbFinalRound.heats[0].id)
    }
  }
  
  if (loserRounds.length > 0) {
    const lbFinalRound = loserRounds[loserRounds.length - 1]
    if (lbFinalRound.heats.length > 0) {
      lbFinalRound.heats[0].targetHeat = grandFinale.id
      grandFinale.sourceHeats.push(lbFinalRound.heats[0].id)
    }
  }
}

/**
 * Get human-readable round name
 */
function getRoundName(bracketType: 'winner' | 'loser', roundIndex: number, totalRounds: number): string {
  const prefix = bracketType === 'winner' ? 'WB' : 'LB'
  
  if (roundIndex === totalRounds - 1) {
    return `${prefix} Semifinale`
  }
  if (roundIndex === totalRounds) {
    return `${prefix} Finale`
  }
  
  return `${prefix} Runde ${roundIndex + 1}`
}
