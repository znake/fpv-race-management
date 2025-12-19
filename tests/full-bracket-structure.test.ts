import { describe, it, expect } from 'vitest'
import { 
  generateFullBracketStructure, 
  calculateBracketSize,
  type FullBracketStructure,
  type BracketSize
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
      expect(size.lbRounds).toBe(1) // 4 → 2 → LB finale
    })
    
    it('should calculate correct sizes for 12 pilots', () => {
      const size = calculateBracketSize(12)
      
      expect(size.qualiHeats).toBe(3) // ceil(12/4) = 3
      expect(size.winnersFromQuali).toBe(6) // 3 heats * 2 winners
      expect(size.losersFromQuali).toBe(6) // 3 heats * 2 losers
      expect(size.wbRounds).toBe(2) // 6 → 4 → 2 → finale
      expect(size.lbRounds).toBe(2) // 6 → 4 → 2 → LB finale
    })
    
    it('should calculate correct sizes for 16 pilots', () => {
      const size = calculateBracketSize(16)
      
      expect(size.qualiHeats).toBe(4) // ceil(16/4) = 4
      expect(size.winnersFromQuali).toBe(8) // 4 heats * 2 winners
      expect(size.losersFromQuali).toBe(8) // 4 heats * 2 losers
      expect(size.wbRounds).toBe(2) // 8 → 4 → 2 → finale
      expect(size.lbRounds).toBe(3) // More rounds in LB for double elim
    })
    
    it('should calculate correct sizes for 24 pilots', () => {
      const size = calculateBracketSize(24)
      
      expect(size.qualiHeats).toBe(6) // ceil(24/4) = 6
      expect(size.winnersFromQuali).toBe(12) // 6 heats * 2 winners
      expect(size.losersFromQuali).toBe(12) // 6 heats * 2 losers
      expect(size.wbRounds).toBe(3) // 12 → 8 → 4 → 2 → finale
      expect(size.lbRounds).toBe(4)
    })
    
    it('should calculate correct sizes for 32 pilots', () => {
      const size = calculateBracketSize(32)
      
      expect(size.qualiHeats).toBe(8) // ceil(32/4) = 8
      expect(size.winnersFromQuali).toBe(16) // 8 heats * 2 winners
      expect(size.losersFromQuali).toBe(16) // 8 heats * 2 losers
      expect(size.wbRounds).toBe(3) // 16 → 8 → 4 → 2 → finale
      expect(size.lbRounds).toBe(5)
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
      
      // Loser bracket rounds (including LB Finale)
      expect(structure.loserBracket.rounds.length).toBe(4) // 3 rounds + LB finale
      
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

describe('Bracket Structure for AC 7 (Dynamic Bracket Size)', () => {
  // Test cases from AC 7 table
  
  it('should match AC 7 for 7-8 pilots', () => {
    const size8 = calculateBracketSize(8)
    expect(size8.qualiHeats).toBe(2)
    expect(size8.wbRounds).toBe(1)
    expect(size8.lbRounds).toBe(1)
  })
  
  it('should match AC 7 for 9-12 pilots', () => {
    const size12 = calculateBracketSize(12)
    expect(size12.qualiHeats).toBe(3)
    expect(size12.wbRounds).toBe(2)
    expect(size12.lbRounds).toBe(2)
  })
  
  it('should match AC 7 for 13-16 pilots', () => {
    const size16 = calculateBracketSize(16)
    expect(size16.qualiHeats).toBe(4)
    expect(size16.wbRounds).toBe(2)
    expect(size16.lbRounds).toBe(3)
  })
  
  it('should match AC 7 for 17-24 pilots', () => {
    const size24 = calculateBracketSize(24)
    expect(size24.qualiHeats).toBe(6)
    expect(size24.wbRounds).toBe(3)
    expect(size24.lbRounds).toBe(4)
  })
  
  it('should match AC 7 for 25-32 pilots', () => {
    const size32 = calculateBracketSize(32)
    expect(size32.qualiHeats).toBe(8)
    expect(size32.wbRounds).toBe(3)
    expect(size32.lbRounds).toBe(5)
  })
})
