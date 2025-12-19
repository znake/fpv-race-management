/**
 * Bracket Structure Generator
 * 
 * Generates the complete bracket structure for a Double Elimination tournament
 * with three sections: Qualification, Winner Bracket, Loser Bracket, and Grand Finale.
 * 
 * Structure is generated BEFORE any heats are played, showing empty placeholders.
 */

// Heat status in bracket
export type BracketHeatStatus = 'empty' | 'pending' | 'active' | 'completed'

// Bracket section types
export type BracketType = 'qualification' | 'winner' | 'loser' | 'finale'

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
}

// A round in a bracket section
export interface BracketRound {
  id: string
  roundNumber: number
  roundName: string
  heats: BracketHeat[]
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

/**
 * Calculate bracket dimensions based on pilot count
 */
export function calculateBracketSize(pilotCount: number): BracketSize {
  // Qualifikation: 4 Piloten pro Heat, aufgerundet
  const qualiHeats = Math.ceil(pilotCount / 4)
  
  // Nach Quali: Platz 1+2 → Winner, Platz 3+4 → Loser
  const winnersFromQuali = qualiHeats * 2
  
  // Losers: Bei 3-Piloten-Heats gibt es nur 1 Verlierer, sonst 2
  // Vereinfacht: assume 2 losers per heat (worst case)
  const losersFromQuali = qualiHeats * 2
  
  // Winner Bracket Runden: log2(winnersFromQuali), aufgerundet für Bracket-Struktur
  // Aber wir brauchen die Anzahl der Runden BIS zum WB-Finale, nicht inklusive
  // Bei 4 Winners: 4 → 2 (1 Runde) → finale
  // Bei 8 Winners: 8 → 4 → 2 (2 Runden) → finale
  // Bei 16 Winners: 16 → 8 → 4 → 2 (3 Runden) → finale
  const wbRounds = Math.max(1, Math.ceil(Math.log2(winnersFromQuali)) - 1)
  
  // Loser Bracket hat mehr Runden wegen Double Elimination
  // LB Runden = WB Runden + (1 oder 2) je nach Größe
  // Bei 4 Losers: 1 Runde
  // Bei 8 Losers: 3 Runden (4→2, Einspeisungen, 2→1)
  // Bei 16 Losers: 5 Runden
  let lbRounds: number
  if (winnersFromQuali <= 4) {
    lbRounds = 1
  } else if (winnersFromQuali <= 6) {
    lbRounds = 2
  } else if (winnersFromQuali <= 8) {
    lbRounds = 3
  } else if (winnersFromQuali <= 12) {
    lbRounds = 4
  } else if (winnersFromQuali <= 16) {
    lbRounds = 5
  } else if (winnersFromQuali <= 24) {
    lbRounds = 6
  } else {
    lbRounds = 7
  }
  
  // Korrektur basierend auf AC7 Tabelle
  if (pilotCount >= 7 && pilotCount <= 8) {
    return { qualiHeats, winnersFromQuali, losersFromQuali, wbRounds: 1, lbRounds: 1, totalHeats: 5 }
  }
  if (pilotCount >= 9 && pilotCount <= 12) {
    return { qualiHeats, winnersFromQuali, losersFromQuali, wbRounds: 2, lbRounds: 2, totalHeats: 8 }
  }
  if (pilotCount >= 13 && pilotCount <= 16) {
    return { qualiHeats, winnersFromQuali, losersFromQuali, wbRounds: 2, lbRounds: 3, totalHeats: 12 }
  }
  if (pilotCount >= 17 && pilotCount <= 24) {
    return { qualiHeats, winnersFromQuali, losersFromQuali, wbRounds: 3, lbRounds: 4, totalHeats: 18 }
  }
  if (pilotCount >= 25 && pilotCount <= 32) {
    return { qualiHeats, winnersFromQuali, losersFromQuali, wbRounds: 3, lbRounds: 5, totalHeats: 25 }
  }
  
  // Calculate total heats
  const wbHeats = Math.ceil(winnersFromQuali / 2) // Simplified
  const lbHeats = Math.ceil(losersFromQuali / 2) // Simplified
  const totalHeats = qualiHeats + wbHeats + lbHeats + 1 // +1 for finale
  
  return {
    qualiHeats,
    winnersFromQuali,
    losersFromQuali,
    wbRounds,
    lbRounds,
    totalHeats
  }
}

/**
 * Generate complete bracket structure with empty placeholder heats
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
  let wbHeatsInRound = Math.ceil(size.winnersFromQuali / 4) // First WB round: groups of 4 → 1 heat produces 2
  // Actually: winnersFromQuali pilots compete, 4 per heat, winners advance
  // Round 2: winnersFromQuali/2 advance from round 1
  wbHeatsInRound = Math.ceil(size.winnersFromQuali / 4)
  
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
        sourceHeats: [], // Will be linked later
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
  // LOSER BRACKET
  // =====================================
  const loserRounds: BracketRound[] = []
  
  let lbHeatsInRound = Math.ceil(size.losersFromQuali / 4)
  
  for (let roundNum = 0; roundNum < size.lbRounds; roundNum++) {
    const roundId = `lb-round-${roundNum + 1}`
    const heatsInThisRound = Math.max(1, Math.ceil(lbHeatsInRound / Math.pow(2, roundNum)))
    
    const roundHeats: BracketHeat[] = []
    for (let heatIdx = 0; heatIdx < heatsInThisRound; heatIdx++) {
      roundHeats.push({
        id: generateHeatId(),
        heatNumber: heatCounter,
        roundNumber: roundNum + 1,
        bracketType: 'loser',
        status: 'empty',
        pilotIds: [],
        sourceHeats: [],
        position: {
          x: roundNum * (HEAT_WIDTH + HORIZONTAL_GAP),
          y: heatIdx * (HEAT_HEIGHT + VERTICAL_GAP) * Math.pow(2, roundNum)
        }
      })
    }
    
    loserRounds.push({
      id: roundId,
      roundNumber: roundNum + 1,
      roundName: getRoundName('loser', roundNum, size.lbRounds),
      heats: roundHeats
    })
    
    lbHeatsInRound = heatsInThisRound
  }
  
  // Add LB Finale
  if (loserRounds.length > 0) {
    const lbFinaleRound: BracketRound = {
      id: 'lb-finale',
      roundNumber: size.lbRounds + 1,
      roundName: 'LB Finale',
      heats: [{
        id: generateHeatId(),
        heatNumber: heatCounter,
        roundNumber: size.lbRounds + 1,
        bracketType: 'loser',
        status: 'empty',
        pilotIds: [],
        sourceHeats: [],
        position: {
          x: size.lbRounds * (HEAT_WIDTH + HORIZONTAL_GAP),
          y: 0
        }
      }]
    }
    loserRounds.push(lbFinaleRound)
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
  linkBracketHeats(qualiHeats, winnerRounds, loserRounds, grandFinale)
  
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
 * - WB Round N → LB (losers via targetLoserFromWB) - Task 16
 * - LB Round N → LB Round N+1 (winners)
 * - WB Finale → Grand Finale
 * - LB Finale → Grand Finale
 */
function linkBracketHeats(
  qualiHeats: BracketHeat[],
  winnerRounds: BracketRound[],
  loserRounds: BracketRound[],
  grandFinale: BracketHeat
): void {
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
  
  // Task 16: Link WB heats to LB for losers (targetLoserFromWB)
  // WB Round N losers feed into LB Round N (or N+1 depending on bracket structure)
  // This is the cross-bracket progression
  for (let wbRoundIdx = 0; wbRoundIdx < winnerRounds.length; wbRoundIdx++) {
    const wbRound = winnerRounds[wbRoundIdx]
    
    // Determine which LB round receives WB losers
    // Generally: WB Round 1 losers → LB Round 1 or 2
    // This depends on tournament size, but a simple mapping:
    // WB losers from round N go to LB round N (or later rounds if LB has more rounds)
    const lbTargetRoundIdx = Math.min(wbRoundIdx, loserRounds.length - 1)
    
    if (lbTargetRoundIdx >= 0 && loserRounds[lbTargetRoundIdx]) {
      const lbRound = loserRounds[lbTargetRoundIdx]
      
      wbRound.heats.forEach((wbHeat, heatIdx) => {
        // Each WB heat's losers go to a corresponding LB heat
        // Map: 2 WB heats feed into 1 LB heat (losers combine)
        const lbTargetIdx = Math.floor(heatIdx / 2)
        
        if (lbRound.heats[lbTargetIdx]) {
          wbHeat.targetLoserFromWB = lbRound.heats[lbTargetIdx].id
          // Note: Don't add to sourceHeats here since losers come separately
        }
      })
    }
  }
  
  // Link LB rounds (winners to next LB round)
  for (let i = 0; i < loserRounds.length - 1; i++) {
    const currentRound = loserRounds[i]
    const nextRound = loserRounds[i + 1]
    
    currentRound.heats.forEach((heat, heatIdx) => {
      const targetIdx = Math.floor(heatIdx / 2)
      if (nextRound.heats[targetIdx]) {
        heat.targetHeat = nextRound.heats[targetIdx].id
        nextRound.heats[targetIdx].sourceHeats.push(heat.id)
      }
    })
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
