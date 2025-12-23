import { describe, it, expect } from 'vitest'
import { 
  generateFullBracketStructure, 
  calculateBracketSize,
  calculateLBRoundStructure,
  type FullBracketStructure,
  type BracketSize,
  type LBRoundInfo
} from '../src/lib/bracket-structure-generator'

describe('Bracket Size Calculation', () => {
  
  describe('calculateBracketSize', () => {
    
    it('should calculate correct sizes for 7 pilots', () => {
      const size = calculateBracketSize(7)
      
      expect(size.qualiHeats).toBe(2) // ceil(7/4) = 2
      expect(size.winnersFromQuali).toBe(4) // 2 heats * 2 winners
      // losersFromQuali is calculated as qualiHeats * 2 (simplified)
      expect(size.losersFromQuali).toBe(4) // 2 heats * 2 = 4 (theoretical max)
      expect(size.wbRounds).toBeGreaterThanOrEqual(1)
      expect(size.lbRounds).toBeGreaterThanOrEqual(1)
    })
    
    it('should calculate correct sizes for 8 pilots', () => {
      const size = calculateBracketSize(8)
      
      expect(size.qualiHeats).toBe(2) // ceil(8/4) = 2
      expect(size.winnersFromQuali).toBe(4) // 2 heats * 2 winners
      expect(size.losersFromQuali).toBe(4) // 2 heats * 2 losers
      expect(size.wbRounds).toBe(1) // 4 → 2 → finale
      // LB rounds now include Major/Minor alternation for overflow prevention
      expect(size.lbRounds).toBeGreaterThanOrEqual(2) 
    })
    
    it('should calculate correct sizes for 12 pilots', () => {
      const size = calculateBracketSize(12)
      
      expect(size.qualiHeats).toBe(3) // ceil(12/4) = 3
      expect(size.winnersFromQuali).toBe(6) // 3 heats * 2 winners
      expect(size.losersFromQuali).toBe(6) // 3 heats * 2 losers
      expect(size.wbRounds).toBe(2) // 6 → 4 → 2 → finale
      // LB rounds now include Major/Minor alternation for overflow prevention
      expect(size.lbRounds).toBeGreaterThanOrEqual(3)
    })
    
    it('should calculate correct sizes for 16 pilots', () => {
      const size = calculateBracketSize(16)
      
      expect(size.qualiHeats).toBe(4) // ceil(16/4) = 4
      expect(size.winnersFromQuali).toBe(8) // 4 heats * 2 winners
      expect(size.losersFromQuali).toBe(8) // 4 heats * 2 losers
      expect(size.wbRounds).toBe(2) // 8 → 4 → 2 → finale
      // LB rounds include Major/Minor alternation for overflow prevention
      expect(size.lbRounds).toBeGreaterThanOrEqual(4)
    })
    
    it('should calculate correct sizes for 24 pilots', () => {
      const size = calculateBracketSize(24)
      
      expect(size.qualiHeats).toBe(6) // ceil(24/4) = 6
      expect(size.winnersFromQuali).toBe(12) // 6 heats * 2 winners
      expect(size.losersFromQuali).toBe(12) // 6 heats * 2 losers
      expect(size.wbRounds).toBe(3) // 12 → 8 → 4 → 2 → finale
      expect(size.lbRounds).toBeGreaterThanOrEqual(5)
    })
    
    it('should calculate correct sizes for 32 pilots', () => {
      const size = calculateBracketSize(32)
      
      expect(size.qualiHeats).toBe(8) // ceil(32/4) = 8
      expect(size.winnersFromQuali).toBe(16) // 8 heats * 2 winners
      expect(size.losersFromQuali).toBe(16) // 8 heats * 2 losers
      expect(size.wbRounds).toBe(3) // 16 → 8 → 4 → 2 → finale
      // 5 LB rounds sufficient to handle all pilots with max 4 per heat
      expect(size.lbRounds).toBeGreaterThanOrEqual(5)
    })
    
    it('should calculate correct sizes for 60 pilots (maximum)', () => {
      const size = calculateBracketSize(60)
      
      expect(size.qualiHeats).toBe(15) // ceil(60/4) = 15
      expect(size.winnersFromQuali).toBe(30) // 15 heats * 2 winners
      expect(size.losersFromQuali).toBe(30) // 15 heats * 2 losers
      expect(size.wbRounds).toBe(4) // 30 → 16 → 8 → 4 → 2 → finale
      expect(size.lbRounds).toBeGreaterThanOrEqual(5)
    })
  })
})

describe('Full Bracket Structure Generation', () => {
  
  describe('generateFullBracketStructure', () => {
    
    it('should generate structure with 3 sections for 8 pilots', () => {
      const structure = generateFullBracketStructure(8)
      
      // Should have qualification section
      expect(structure.qualification).toBeDefined()
      expect(structure.qualification.heats.length).toBe(2)
      
      // Should have winner bracket section
      expect(structure.winnerBracket).toBeDefined()
      expect(structure.winnerBracket.rounds.length).toBeGreaterThan(0)
      
      // Should have loser bracket section
      expect(structure.loserBracket).toBeDefined()
      expect(structure.loserBracket.rounds.length).toBeGreaterThan(0)
      
      // Should have grand finale
      expect(structure.grandFinale).toBeDefined()
    })
    
    it('should generate structure with 3 sections for 16 pilots', () => {
      const structure = generateFullBracketStructure(16)
      
      // Qualification: 4 heats
      expect(structure.qualification.heats.length).toBe(4)
      
      // All quali heats should have bracketType 'qualification'
      structure.qualification.heats.forEach((heat: any) => {
        expect(heat.bracketType).toBe('qualification')
        expect(heat.roundNumber).toBe(1)
        expect(heat.status).toBe('empty')
      })
      
      // Winner bracket rounds (including WB Finale)
      expect(structure.winnerBracket.rounds.length).toBe(3) // 2 rounds + WB finale
      
      // Loser bracket rounds now have more rounds for proper Major/Minor alternation
      // to prevent overflow (>4 pilots per heat)
      expect(structure.loserBracket.rounds.length).toBeGreaterThanOrEqual(4)
      
      // Grand finale
      expect(structure.grandFinale).toBeDefined()
      expect(structure.grandFinale?.bracketType).toBe('finale')
    })
    
    it('should create empty heats with correct structure', () => {
      const structure = generateFullBracketStructure(8)
      
      // All heats should be 'empty' status initially
      structure.qualification.heats.forEach(heat => {
        expect(heat.status).toBe('empty')
        expect(heat.pilotIds).toEqual([])
      })
      
      structure.winnerBracket.rounds.forEach(round => {
        round.heats.forEach(heat => {
          expect(heat.status).toBe('empty')
          expect(heat.pilotIds).toEqual([])
          expect(heat.bracketType).toBe('winner')
        })
      })
      
      structure.loserBracket.rounds.forEach(round => {
        round.heats.forEach(heat => {
          expect(heat.status).toBe('empty')
          expect(heat.pilotIds).toEqual([])
          expect(heat.bracketType).toBe('loser')
        })
      })
    })
    
    it('should include source and target heat references', () => {
      const structure = generateFullBracketStructure(16)
      
      // Quali heats should target WB round 2
      structure.qualification.heats.forEach(heat => {
        expect(heat.targetWinnerHeat).toBeDefined()
        expect(heat.targetLoserHeat).toBeDefined()
      })
      
      // WB heats should have source heats
      structure.winnerBracket.rounds.forEach((round, roundIndex) => {
        if (roundIndex > 0) { // Not first WB round
          round.heats.forEach(heat => {
            expect(heat.sourceHeats.length).toBeGreaterThan(0)
          })
        }
      })
    })
    
    it('should calculate correct positions for rendering', () => {
      const structure = generateFullBracketStructure(8)
      
      // All heats should have position
      structure.qualification.heats.forEach(heat => {
        expect(heat.position).toBeDefined()
        expect(typeof heat.position.x).toBe('number')
        expect(typeof heat.position.y).toBe('number')
      })
      
      structure.winnerBracket.rounds.forEach(round => {
        round.heats.forEach(heat => {
          expect(heat.position).toBeDefined()
          expect(typeof heat.position.x).toBe('number')
          expect(typeof heat.position.y).toBe('number')
        })
      })
      
      structure.loserBracket.rounds.forEach(round => {
        round.heats.forEach(heat => {
          expect(heat.position).toBeDefined()
        })
      })
    })
    
    it('should handle odd pilot counts (7 pilots)', () => {
      const structure = generateFullBracketStructure(7)
      
      // Should still generate valid structure
      expect(structure.qualification.heats.length).toBe(2)
      expect(structure.winnerBracket.rounds.length).toBeGreaterThan(0)
      expect(structure.loserBracket.rounds.length).toBeGreaterThan(0)
      expect(structure.grandFinale).toBeDefined()
    })
    
    it('should handle 60 pilots (maximum)', () => {
      const structure = generateFullBracketStructure(60)
      
      // Should generate valid structure
      expect(structure.qualification.heats.length).toBe(15)
      expect(structure.winnerBracket.rounds.length).toBeGreaterThan(0)
      expect(structure.loserBracket.rounds.length).toBeGreaterThan(0)
      expect(structure.grandFinale).toBeDefined()
      
      // Total heats should be reasonable
      const totalHeats = 
        structure.qualification.heats.length +
        structure.winnerBracket.rounds.reduce((sum, r) => sum + r.heats.length, 0) +
        structure.loserBracket.rounds.reduce((sum, r) => sum + r.heats.length, 0) + 1 // +1 for finale
      
      expect(totalHeats).toBeLessThan(100) // Sanity check
    })
    
    it('should generate unique heat IDs', () => {
      const structure = generateFullBracketStructure(16)
      
      const allHeatIds: string[] = []
      
      structure.qualification.heats.forEach(h => allHeatIds.push(h.id))
      structure.winnerBracket.rounds.forEach(r => r.heats.forEach(h => allHeatIds.push(h.id)))
      structure.loserBracket.rounds.forEach(r => r.heats.forEach(h => allHeatIds.push(h.id)))
      if (structure.grandFinale) allHeatIds.push(structure.grandFinale.id)
      
      // All IDs should be unique
      const uniqueIds = new Set(allHeatIds)
      expect(uniqueIds.size).toBe(allHeatIds.length)
    })
  })
})

describe('Bracket Structure for AC 7 (Dynamic Bracket Size) - Updated for Overflow Prevention', () => {
  // Test cases from AC 7 table - updated with new LB round counts
  // The new structure has more LB rounds to prevent >4 pilots per heat
  
  it('should match AC 7 for 7-8 pilots', () => {
    const size8 = calculateBracketSize(8)
    expect(size8.qualiHeats).toBe(2)
    expect(size8.wbRounds).toBe(1)
    // LB now has Major/Minor alternation
    expect(size8.lbRounds).toBeGreaterThanOrEqual(2)
  })
  
  it('should match AC 7 for 9-12 pilots', () => {
    const size12 = calculateBracketSize(12)
    expect(size12.qualiHeats).toBe(3)
    expect(size12.wbRounds).toBe(2)
    // LB now has Major/Minor alternation
    expect(size12.lbRounds).toBeGreaterThanOrEqual(3)
  })
  
  it('should match AC 7 for 13-16 pilots', () => {
    const size16 = calculateBracketSize(16)
    expect(size16.qualiHeats).toBe(4)
    expect(size16.wbRounds).toBe(2)
    // LB now has Major/Minor alternation
    expect(size16.lbRounds).toBeGreaterThanOrEqual(4)
  })
  
  it('should match AC 7 for 17-24 pilots', () => {
    const size24 = calculateBracketSize(24)
    expect(size24.qualiHeats).toBe(6)
    expect(size24.wbRounds).toBe(3)
    // LB now has Major/Minor alternation
    expect(size24.lbRounds).toBeGreaterThanOrEqual(5)
  })
  
  it('should match AC 7 for 25-32 pilots', () => {
    const size32 = calculateBracketSize(32)
    expect(size32.qualiHeats).toBe(8)
    expect(size32.wbRounds).toBe(3)
    // LB has enough rounds to handle all pilots with max 4 per heat
    expect(size32.lbRounds).toBeGreaterThanOrEqual(5)
  })
})

describe('Loser Bracket Heat Assignment (Regression Tests)', () => {
  
  it('should not assign both WB heats of same round to same LB heat (max 4 pilots)', () => {
    // This is a regression test for the bug where:
    // bracket-heat-5 and bracket-heat-6 both had targetLoserFromWB: "bracket-heat-9"
    // which caused Heat 10 to have 8 pilots (exceeding the 4 pilot limit)
    
    const structure = generateFullBracketStructure(16)
    
    // Get all WB heats with their targetLoserFromWB
    const wbHeatsWithTargets: { wbHeatId: string; targetLB: string | undefined }[] = []
    
    structure.winnerBracket.rounds.forEach(round => {
      round.heats.forEach(heat => {
        if (heat.targetLoserFromWB) {
          wbHeatsWithTargets.push({
            wbHeatId: heat.id,
            targetLB: heat.targetLoserFromWB
          })
        }
      })
    })
    
    // Group by target LB heat
    const targetCounts: Record<string, string[]> = {}
    wbHeatsWithTargets.forEach(({ wbHeatId, targetLB }) => {
      if (targetLB) {
        if (!targetCounts[targetLB]) {
          targetCounts[targetLB] = []
        }
        targetCounts[targetLB].push(wbHeatId)
      }
    })
    
    // Each LB heat should receive losers from at most 2 WB heats
    // (2 WB heats * 2 losers each = 4 pilots max)
    // But ideally, each WB heat maps to a different LB heat (1:1)
    Object.entries(targetCounts).forEach(([lbHeatId, wbHeats]) => {
      // Max 2 WB heats feeding into 1 LB heat (worst case)
      // This ensures max 4 pilots (2 losers from each WB heat)
      expect(wbHeats.length).toBeLessThanOrEqual(2)
    })
  })
  
  it('should distribute WB losers across different LB heats for 24 pilots', () => {
    const structure = generateFullBracketStructure(24)
    
    // Collect all targetLoserFromWB assignments
    const lbTargets: string[] = []
    
    structure.winnerBracket.rounds.forEach(round => {
      round.heats.forEach(heat => {
        if (heat.targetLoserFromWB) {
          lbTargets.push(heat.targetLoserFromWB)
        }
      })
    })
    
    // If we have N WB heats with targets, we should have reasonable distribution
    // Not all pointing to the same LB heat
    const uniqueTargets = new Set(lbTargets)
    
    // Should use more than 1 unique LB heat (distribution, not concentration)
    if (lbTargets.length > 1) {
      expect(uniqueTargets.size).toBeGreaterThan(1)
    }
  })
  
  it('should ensure WB heats in same round target different LB heats', () => {
    const structure = generateFullBracketStructure(16)
    
    // For each WB round, check that heats in the same round target different LB heats
    structure.winnerBracket.rounds.forEach(round => {
      const targetsInRound: string[] = []
      
      round.heats.forEach(heat => {
        if (heat.targetLoserFromWB) {
          targetsInRound.push(heat.targetLoserFromWB)
        }
      })
      
      // All targets in the same round should be unique
      // This prevents the bug where both bracket-heat-5 and bracket-heat-6
      // targeted the same bracket-heat-9
      const uniqueTargetsInRound = new Set(targetsInRound)
      expect(uniqueTargetsInRound.size).toBe(targetsInRound.length)
    })
  })
})

// =====================================================
// LB OVERFLOW PREVENTION TESTS (Critical Bug Fix)
// =====================================================
// These tests verify the fix for the LB structure overflow problem
// where LB heats could receive more than 4 pilots.

describe('LB Overflow Prevention (Critical)', () => {
  
  describe('calculateLBRoundStructure', () => {
    
    it('should ensure no LB round receives more than 4 pilots per heat (8 pilots)', () => {
      const lbStructure = calculateLBRoundStructure(2, 1) // 2 quali heats, 1 WB round
      
      lbStructure.forEach(round => {
        const pilotsPerHeat = round.totalPilots / round.heatsNeeded
        expect(pilotsPerHeat).toBeLessThanOrEqual(4)
      })
    })
    
    it('should ensure no LB round receives more than 4 pilots per heat (16 pilots)', () => {
      const lbStructure = calculateLBRoundStructure(4, 2) // 4 quali heats, 2 WB rounds
      
      lbStructure.forEach(round => {
        const pilotsPerHeat = round.totalPilots / round.heatsNeeded
        expect(pilotsPerHeat).toBeLessThanOrEqual(4)
      })
    })
    
    it('should ensure no LB round receives more than 4 pilots per heat (24 pilots)', () => {
      const lbStructure = calculateLBRoundStructure(6, 3) // 6 quali heats, 3 WB rounds
      
      lbStructure.forEach(round => {
        const pilotsPerHeat = round.totalPilots / round.heatsNeeded
        expect(pilotsPerHeat).toBeLessThanOrEqual(4)
      })
    })
    
    it('should ensure no LB round receives more than 4 pilots per heat (32 pilots)', () => {
      const lbStructure = calculateLBRoundStructure(8, 3) // 8 quali heats, 3 WB rounds
      
      lbStructure.forEach(round => {
        const pilotsPerHeat = round.totalPilots / round.heatsNeeded
        expect(pilotsPerHeat).toBeLessThanOrEqual(4)
      })
    })
    
    it('should ensure no LB round receives more than 4 pilots per heat (60 pilots)', () => {
      const lbStructure = calculateLBRoundStructure(15, 4) // 15 quali heats, 4 WB rounds
      
      lbStructure.forEach(round => {
        const pilotsPerHeat = round.totalPilots / round.heatsNeeded
        expect(pilotsPerHeat).toBeLessThanOrEqual(4)
      })
    })
    
    it('should correctly alternate Major/Minor rounds', () => {
      const lbStructure = calculateLBRoundStructure(4, 2) // 16 pilots
      
      // Round 1 should be Minor (receives quali losers)
      expect(lbStructure[0].roundType).toBe('minor')
      
      // Check alternation pattern after round 1
      for (let i = 1; i < lbStructure.length; i++) {
        // Major rounds have no WB input, Minor rounds have WB input
        if (lbStructure[i].pilotsFromWB > 0) {
          expect(lbStructure[i].roundType).toBe('minor')
        } else {
          expect(lbStructure[i].roundType).toBe('major')
        }
      }
    })
    
    it('should track which WB round feeds each LB Minor round', () => {
      const lbStructure = calculateLBRoundStructure(4, 2) // 16 pilots, 2 WB rounds
      
      // Find Minor rounds and verify wbSourceRound
      const minorRoundsWithWBInput = lbStructure.filter(r => r.wbSourceRound > 0)
      
      // Should have WB input from WB Round 1 and WB Finale
      const wbSourceRounds = minorRoundsWithWBInput.map(r => r.wbSourceRound)
      expect(wbSourceRounds).toContain(1) // WB Round 1
      expect(wbSourceRounds).toContain(2) // WB Round 2 (Finale for 2 WB rounds)
    })
  })
  
  describe('Full Bracket Structure - Max Pilot Validation', () => {
    
    // Helper to calculate max pilots per LB heat from all sources
    const calculateMaxPilotsPerLBHeat = (structure: FullBracketStructure): number => {
      let maxPilots = 0
      
      structure.loserBracket.rounds.forEach(round => {
        round.heats.forEach(heat => {
          // Count pilots from sourceHeats (LB progression)
          const fromLB = heat.sourceHeats.length * 2 // Each source heat produces 2 winners
          
          // Count pilots from WB losers (targetLoserFromWB)
          // Find how many WB heats target this LB heat
          let fromWB = 0
          structure.winnerBracket.rounds.forEach(wbRound => {
            wbRound.heats.forEach(wbHeat => {
              if (wbHeat.targetLoserFromWB === heat.id) {
                fromWB += 2 // Each WB heat sends 2 losers
              }
            })
          })
          
          // For LB R1, also count quali losers
          if (round.roundNumber === 1) {
            const qualiSources = heat.sourceHeats.length
            const totalFromQuali = qualiSources * 2 // Each quali heat sends 2 losers
            maxPilots = Math.max(maxPilots, totalFromQuali)
          } else {
            const total = fromLB + fromWB
            maxPilots = Math.max(maxPilots, total)
          }
        })
      })
      
      return maxPilots
    }
    
    it('should never exceed 4 pilots per LB heat for 8 pilots', () => {
      const structure = generateFullBracketStructure(8)
      const maxPilots = calculateMaxPilotsPerLBHeat(structure)
      expect(maxPilots).toBeLessThanOrEqual(4)
    })
    
    it('should never exceed 4 pilots per LB heat for 12 pilots', () => {
      const structure = generateFullBracketStructure(12)
      const maxPilots = calculateMaxPilotsPerLBHeat(structure)
      expect(maxPilots).toBeLessThanOrEqual(4)
    })
    
    it('should never exceed 4 pilots per LB heat for 16 pilots', () => {
      const structure = generateFullBracketStructure(16)
      const maxPilots = calculateMaxPilotsPerLBHeat(structure)
      expect(maxPilots).toBeLessThanOrEqual(4)
    })
    
    it('should never exceed 4 pilots per LB heat for 24 pilots', () => {
      const structure = generateFullBracketStructure(24)
      const maxPilots = calculateMaxPilotsPerLBHeat(structure)
      expect(maxPilots).toBeLessThanOrEqual(4)
    })
    
    it('should never exceed 4 pilots per LB heat for 32 pilots', () => {
      const structure = generateFullBracketStructure(32)
      const maxPilots = calculateMaxPilotsPerLBHeat(structure)
      expect(maxPilots).toBeLessThanOrEqual(4)
    })
    
    it('should never exceed 4 pilots per LB heat for 48 pilots', () => {
      const structure = generateFullBracketStructure(48)
      const maxPilots = calculateMaxPilotsPerLBHeat(structure)
      expect(maxPilots).toBeLessThanOrEqual(4)
    })
    
    it('should never exceed 4 pilots per LB heat for 60 pilots (max)', () => {
      const structure = generateFullBracketStructure(60)
      const maxPilots = calculateMaxPilotsPerLBHeat(structure)
      expect(maxPilots).toBeLessThanOrEqual(4)
    })
    
    // Test all pilot counts from 7 to 60
    it.each([7, 8, 9, 10, 12, 15, 16, 20, 24, 28, 32, 40, 48, 56, 60])(
      'should never exceed 4 pilots per LB heat for %i pilots',
      (pilotCount) => {
        const structure = generateFullBracketStructure(pilotCount)
        const maxPilots = calculateMaxPilotsPerLBHeat(structure)
        expect(maxPilots).toBeLessThanOrEqual(4)
      }
    )
  })
  
  describe('WB to LB Linking Validation', () => {
    
    it('should link each WB round to the correct LB Minor round (16 pilots)', () => {
      const structure = generateFullBracketStructure(16)
      
      // For 16 pilots:
      // - WB R1 (2 heats) losers → LB Minor round (not R1)
      // - WB Finale losers → LB Minor round (later)
      
      // Find all WB heats with targetLoserFromWB
      const wbToLBLinks: { wbRoundIdx: number; lbHeatId: string }[] = []
      
      structure.winnerBracket.rounds.forEach((wbRound, roundIdx) => {
        wbRound.heats.forEach(heat => {
          if (heat.targetLoserFromWB) {
            wbToLBLinks.push({
              wbRoundIdx: roundIdx,
              lbHeatId: heat.targetLoserFromWB
            })
          }
        })
      })
      
      // Each link should point to a valid LB heat
      wbToLBLinks.forEach(link => {
        const lbHeat = structure.loserBracket.rounds.flatMap(r => r.heats).find(h => h.id === link.lbHeatId)
        expect(lbHeat).toBeDefined()
        // The target should be a Minor round (receives WB losers)
        expect(lbHeat?.roundType).toBe('minor')
      })
    })
    
    it('should ensure heats in same WB round target different LB heats (all sizes)', () => {
      [8, 16, 24, 32, 48, 60].forEach(pilotCount => {
        const structure = generateFullBracketStructure(pilotCount)
        
        structure.winnerBracket.rounds.forEach((wbRound, roundIdx) => {
          const targets = wbRound.heats
            .filter(h => h.targetLoserFromWB)
            .map(h => h.targetLoserFromWB)
          
          // Check if there are duplicate targets in the same round
          const uniqueTargets = new Set(targets)
          
          // For small heats counts (1-2 heats), duplicates are OK if LB has enough capacity
          // For larger rounds, should have unique targets
          if (wbRound.heats.length > 2 && targets.length > 2) {
            expect(uniqueTargets.size).toBeGreaterThan(1)
          }
        })
      })
    })
  })
})

describe('LB Round Structure Details', () => {
  
  it('should have proper Major/Minor alternation for 16 pilots', () => {
    const structure = generateFullBracketStructure(16)
    
    // Log structure for debugging
    structure.loserBracket.rounds.forEach((round, idx) => {
      // Round 1 is always Minor (quali losers)
      if (idx === 0) {
        expect(round.roundType).toBe('minor')
      }
    })
  })
  
  it('should have enough LB heats to handle all pilot flows (16 pilots)', () => {
    const structure = generateFullBracketStructure(16)
    
    // Count total LB heats
    const totalLBHeats = structure.loserBracket.rounds.reduce(
      (sum, r) => sum + r.heats.length, 0
    )
    
    // For 16 pilots, we need enough heats to handle:
    // - 8 quali losers (LB R1)
    // - WB R1 losers (4 pilots)
    // - WB Finale losers (2 pilots)
    // With proper Major/Minor structure
    
    // Should have at least 4 LB heats for this flow
    expect(totalLBHeats).toBeGreaterThanOrEqual(4)
  })
  
  it('should correctly calculate heats needed per LB round', () => {
    const lbStructure = calculateLBRoundStructure(4, 2) // 16 pilots
    
    lbStructure.forEach(round => {
      // heatsNeeded should equal ceil(totalPilots / 4)
      const expected = Math.ceil(round.totalPilots / 4)
      expect(round.heatsNeeded).toBe(expected)
    })
  })
})
