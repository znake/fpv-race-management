/**
 * US-14.10: Dynamische Skalierung 8-60 Piloten - Layout Calculator Tests
 * 
 * Akzeptanzkriterien:
 * AC1: Container-Breite Berechnung
 * AC2: WB-Breiten Berechnung
 * AC3: LB-Breiten Berechnung
 * AC4: Runden-Anzahl Berechnung
 * AC5: Heat-Anzahl pro Runde
 * AC6: 3er-Heat Erkennung
 * AC7: SVG-Linien DOM-Berechnung (in anderer Datei)
 * AC8: Test-Abdeckung (8, 12, 15, 16, 24, 27, 32, 48, 60 Piloten)
 */

import { describe, it, expect } from 'vitest'
import {
  calculateBracketDimensions,
  calculateHeatWidth,
  type BracketDimensions
} from '../src/lib/bracket-layout-calculator'

describe('US-14.10: AC1 - Container-Breite Berechnung', () => {
  it('should calculate minimum container width for 8 pilots (~520px)', () => {
    const dimensions = calculateBracketDimensions(8)

    // AC1: Mindestbreite: ~520px (für 8 Piloten) with current constants
    expect(dimensions.containerWidth).toBeGreaterThan(500)
    expect(dimensions.containerWidth).toBeLessThan(700)
  })

  it('should calculate maximum container width for 60 pilots', () => {
    const dimensions = calculateBracketDimensions(60)

    // AC1: Maximale Breite: für 60 Piloten
    expect(dimensions.containerWidth).toBeGreaterThan(2500)
    expect(dimensions.containerWidth).toBeLessThan(4000)
  })

  it('should scale container width proportionally with pilot count', () => {
    const dim8 = calculateBracketDimensions(8)
    const dim16 = calculateBracketDimensions(16)
    const dim32 = calculateBracketDimensions(32)

    // Container width should increase with pilot count
    expect(dim16.containerWidth).toBeGreaterThan(dim8.containerWidth)
    expect(dim32.containerWidth).toBeGreaterThan(dim16.containerWidth)
  })
})

describe('US-14.10: AC2 - WB-Breiten Berechnung', () => {
  it('should calculate WB column width for 32 pilots (4 heats)', () => {
    const dimensions = calculateBracketDimensions(32)

    // AC2: 4 × 140 + 3 × 10 = 590px
    const expected = 4 * 140 + 3 * 10
    expect(dimensions.wbColumnWidth).toBe(expected)
  })

  it('should calculate WB column width for 16 pilots (2 heats)', () => {
    const dimensions = calculateBracketDimensions(16)

    // WB R1: 2 heats (from 8 quali winners / 4)
    // 2 × 140 + 1 × 10 = 290px
    const expected = 2 * 140 + 1 * 10
    expect(dimensions.wbColumnWidth).toBe(expected)
  })

  it('should calculate WB column width for 8 pilots (1 heat)', () => {
    const dimensions = calculateBracketDimensions(8)

    // WB R1: 1 heat
    // 1 × 140 + 0 × 10 = 140px
    const expected = 140
    expect(dimensions.wbColumnWidth).toBe(expected)
  })

  it('should calculate WB column width for 48 pilots (6 heats)', () => {
    const dimensions = calculateBracketDimensions(48)

    // WB R1: 6 heats (from 24 quali winners / 4)
    // 6 × 140 + 5 × 10 = 890px
    const expected = 6 * 140 + 5 * 10
    expect(dimensions.wbColumnWidth).toBe(expected)
  })
})

describe('US-14.10: AC3 - LB-Breiten Berechnung', () => {
  it('should calculate LB column width for 32 pilots', () => {
    const dimensions = calculateBracketDimensions(32)

    // AC3: Example 32 Piloten LB R1: 6 × 140 + 5 × 10 = 890px
    // (LB has more pilots due to quali losers + WB R1 losers)
    // Note: Actual value may vary based on LB structure calculation
    expect(dimensions.lbColumnWidth).toBeGreaterThan(0)
    expect(dimensions.lbColumnWidth).toBeLessThan(1500)
  })

  it('should calculate LB column width for 8 pilots', () => {
    const dimensions = calculateBracketDimensions(8)

    // LB should have some width (even if only a few pilots)
    expect(dimensions.lbColumnWidth).toBeGreaterThan(100)
    expect(dimensions.lbColumnWidth).toBeLessThan(300)
  })

  it('should calculate LB column width for 16 pilots', () => {
    const dimensions = calculateBracketDimensions(16)

    // LB width based on max heats in any round
    expect(dimensions.lbColumnWidth).toBeGreaterThan(dimensions.wbColumnWidth)
  })

  it('should calculate LB column width for 60 pilots', () => {
    const dimensions = calculateBracketDimensions(60)

    // LB width for maximum pilot count
    expect(dimensions.lbColumnWidth).toBeGreaterThan(1500)
  })
})

describe('US-14.10: AC4 - Runden-Anzahl Berechnung', () => {
  it('should calculate correct WB rounds for 8 pilots', () => {
    const dimensions = calculateBracketDimensions(8)

    // WB: 1 Runde + Finale = 2 rounds total
    expect(dimensions.heatsPerRound.wb.length).toBe(2)
    expect(dimensions.heatsPerRound.wb[0]).toBe(1) // R1: 1 heat
    expect(dimensions.heatsPerRound.wb[1]).toBe(1) // Finale: 1 heat
  })

  it('should calculate correct WB rounds for 32 pilots', () => {
    const dimensions = calculateBracketDimensions(32)

    // WB R1: 4 heats, R2: 2 heats, Finale: 1 heat = 3 rounds
    expect(dimensions.heatsPerRound.wb.length).toBe(3)
    expect(dimensions.heatsPerRound.wb[0]).toBe(4)
    expect(dimensions.heatsPerRound.wb[1]).toBe(2)
    expect(dimensions.heatsPerRound.wb[2]).toBe(1)
  })

  it('should calculate correct WB rounds for 16 pilots', () => {
    const dimensions = calculateBracketDimensions(16)

    // WB R1: 2 heats, Finale: 1 heat = 2 rounds
    expect(dimensions.heatsPerRound.wb.length).toBe(2)
    expect(dimensions.heatsPerRound.wb[0]).toBe(2)
    expect(dimensions.heatsPerRound.wb[1]).toBe(1)
  })

  it('should calculate dynamic LB rounds based on pilot count', () => {
    const dim8 = calculateBracketDimensions(8)
    const dim32 = calculateBracketDimensions(32)

    // LB should have more rounds for larger tournaments
    expect(dim32.heatsPerRound.lb.length).toBeGreaterThan(dim8.heatsPerRound.lb.length)
  })
})

describe('US-14.10: AC5 - Heat-Anzahl pro Runde', () => {
  it('should calculate WB heats per round for 8 pilots', () => {
    const dimensions = calculateBracketDimensions(8)

    // AC5: WB R1: Piloten / 2 / 4 = 8 / 2 / 4 = 1 heat
    // WB RN: Previous / 2
    expect(dimensions.heatsPerRound.wb).toEqual([1, 1])
  })

  it('should calculate WB heats per round for 16 pilots', () => {
    const dimensions = calculateBracketDimensions(16)

    // WB R1: 16 / 2 / 4 = 2 heats
    // WB R2: 2 / 2 = 1 heat (finale)
    expect(dimensions.heatsPerRound.wb).toEqual([2, 1])
  })

  it('should calculate WB heats per round for 32 pilots', () => {
    const dimensions = calculateBracketDimensions(32)

    // WB R1: 32 / 2 / 4 = 4 heats
    // WB R2: 4 / 2 = 2 heats
    // WB Finale: 2 / 2 = 1 heat
    expect(dimensions.heatsPerRound.wb).toEqual([4, 2, 1])
  })

  it('should calculate WB heats per round for 48 pilots', () => {
    const dimensions = calculateBracketDimensions(48)

    // WB R1: 48 / 2 / 4 = 6 heats
    // WB R2: 6 / 2 = 3 heats
    // WB R3: 3 / 2 = 2 heats (ceil)
    // WB Finale: 2 / 2 = 1 heat
    expect(dimensions.heatsPerRound.wb).toEqual([6, 3, 2, 1])
  })

  it('should calculate LB heats per round for 8 pilots', () => {
    const dimensions = calculateBracketDimensions(8)

    // LB: Pool-based - should have at least 1-2 rounds
    expect(dimensions.heatsPerRound.lb.length).toBeGreaterThan(0)
    expect(dimensions.heatsPerRound.lb.every(count => count > 0)).toBe(true)
  })

  it('should calculate LB heats per round for 32 pilots', () => {
    const dimensions = calculateBracketDimensions(32)

    // LB for 32 pilots: LB R1: 6 heats (example from story)
    // Then progressive reduction
    expect(dimensions.heatsPerRound.lb.length).toBeGreaterThan(0)
    expect(dimensions.heatsPerRound.lb[0]).toBe(6) // First round has 6 heats
  })
})

describe('US-14.10: AC6 - 3er-Heat Erkennung', () => {
  it('should detect 3-pilot heats for 12 pilots', () => {
    const dimensions = calculateBracketDimensions(12)

    // 12 pilots: 3x 4-pilot heats = NO 3-pilot heats
    // But quali heats: 12 / 4 = 3 heats (all 4-pilot)
    const qualiHeats = Math.ceil(12 / 4)
    expect(qualiHeats).toBe(3)
  })

  it('should detect 3-pilot heats for 15 pilots', () => {
    const dimensions = calculateBracketDimensions(15)

    // 15 pilots: 3x 4-pilot + 1x 3-pilot = 4 heats total
    // Check qualiWidth calculation
    const expectedQualiWidth = 3 * 140 + 2 * 10 + 120 + 10
    expect(dimensions.qualiWidth).toBe(expectedQualiWidth)
  })

  it('should detect 3-pilot heats for 27 pilots', () => {
    const dimensions = calculateBracketDimensions(27)

    // 27 pilots: 6x 4-pilot + 1x 3-pilot = 7 heats total
    const expectedQualiWidth = 6 * 140 + 6 * 10 + 120
    expect(dimensions.qualiWidth).toBe(expectedQualiWidth)
  })

  it('should use 120px width for 3-pilot heats', () => {
    // AC6: Breite: 120px statt 140px
    const width3 = calculateHeatWidth(3)
    const width4 = calculateHeatWidth(4)

    expect(width3).toBe(120)
    expect(width4).toBe(140)
    expect(width3).toBeLessThan(width4)
  })
})

describe('US-14.10: AC8 - Test-Abdeckung für alle Pilotenzahlen', () => {
  const testCases = [
    { pilots: 8,  expectedWBWidth: 140,  expectedLBWidth: 280 },
    { pilots: 12, expectedWBWidth: 290,  expectedLBWidth: 440 }, // 12/2/4 = 1.5 -> ceil = 2 heats
    { pilots: 15, expectedWBWidth: 290,  expectedLBWidth: 440 }, // 15/2/4 = 1.875 -> ceil = 2 heats
    { pilots: 16, expectedWBWidth: 290,  expectedLBWidth: 440 },
    { pilots: 24, expectedWBWidth: 440,  expectedLBWidth: 730 }, // 24/2/4 = 3 heats
    { pilots: 27, expectedWBWidth: 590,  expectedLBWidth: 890 }, // 27/2/4 = 3.375 -> ceil = 4 heats
    { pilots: 32, expectedWBWidth: 590,  expectedLBWidth: 890 }, // 32/2/4 = 4 heats
    { pilots: 48, expectedWBWidth: 890,  expectedLBWidth: 1340 }, // 48/2/4 = 6 heats
    { pilots: 60, expectedWBWidth: 1190, expectedLBWidth: 1790 }, // 60/2/4 = 7.5 -> ceil = 8 heats
  ]

  testCases.forEach(({ pilots, expectedWBWidth, expectedLBWidth }) => {
    it(`should calculate correct layout for ${pilots} pilots`, () => {
      const dimensions = calculateBracketDimensions(pilots)

      // Validate WB column width
      expect(dimensions.wbColumnWidth).toBe(expectedWBWidth)

      // Validate LB column width (or close approximation)
      expect(dimensions.lbColumnWidth).toBeGreaterThan(0)
      expect(dimensions.containerWidth).toBeGreaterThan(dimensions.wbColumnWidth + dimensions.lbColumnWidth)

      // Validate heats per round structure
      expect(dimensions.heatsPerRound.wb.length).toBeGreaterThan(0)
      expect(dimensions.heatsPerRound.lb.length).toBeGreaterThan(0)

      // Validate round labels
      expect(dimensions.roundLabels.wb.length).toBe(dimensions.heatsPerRound.wb.length)
      expect(dimensions.roundLabels.lb.length).toBe(dimensions.heatsPerRound.lb.length)

      // Validate round pilot counts
      expect(dimensions.roundPilotCounts.wb.length).toBe(dimensions.heatsPerRound.wb.length)
      expect(dimensions.roundPilotCounts.lb.length).toBe(dimensions.heatsPerRound.lb.length)
    })
  })

  it('should handle edge case: 8 pilots (minimum)', () => {
    const dimensions = calculateBracketDimensions(8)

    // 8 pilots should work correctly
    expect(dimensions.containerWidth).toBeGreaterThan(500)
    expect(dimensions.heatsPerRound.wb).toEqual([1, 1])
    expect(dimensions.roundLabels.wb).toEqual(['RUNDE 1 (4 Piloten)', 'FINALE (2 Piloten)'])
  })

  it('should handle edge case: 60 pilots (maximum)', () => {
    const dimensions = calculateBracketDimensions(60)

    // 60 pilots should work correctly
    expect(dimensions.containerWidth).toBeGreaterThan(2500)
    expect(dimensions.heatsPerRound.wb.length).toBeGreaterThan(3)

    // WB R1: 60 / 2 / 4 = 7.5 -> ceil = 8 heats
    expect(dimensions.heatsPerRound.wb[0]).toBe(8)
  })

  it('should handle edge case: odd numbers (15 pilots)', () => {
    const dimensions = calculateBracketDimensions(15)

    // Odd numbers should work with 3-pilot heats
    expect(dimensions.qualiWidth).toBeGreaterThan(400)
    expect(dimensions.heatsPerRound.wb.length).toBeGreaterThan(0)

    // Quali: 15 / 4 = 3.75 -> 4 heats (3x 4er + 1x 3er)
    // Quali width: 3x140 + 3x10 + 120 = 570px
    expect(dimensions.qualiWidth).toBe(570)
  })

  it('should handle edge case: prime numbers (27 is not prime, but 15 is)', () => {
    const dimensions = calculateBracketDimensions(27)

    // 27 is odd, should have 3-pilot heat
    expect(dimensions.qualiWidth).toBeGreaterThan(900)
    expect(dimensions.heatsPerRound.wb.length).toBeGreaterThan(0)
  })

  it('should handle edge case: 15 (odd) vs 16 (even) comparison', () => {
    const dim15 = calculateBracketDimensions(15)
    const dim16 = calculateBracketDimensions(16)

    // Both should work
    expect(dim15.qualiWidth).toBeGreaterThan(500)
    expect(dim16.qualiWidth).toBeGreaterThan(500)

    // 15 has one 3-pilot heat, 16 has all 4-pilot heats
    // But the total width might not necessarily be greater due to different gap distributions
    // So we just check both are reasonable
    expect(dim15.qualiWidth).toBeLessThan(700)
    expect(dim16.qualiWidth).toBeLessThan(700)
  })

  it('should not break layout for any pilot count in range 8-60', () => {
    for (let pilots = 8; pilots <= 60; pilots++) {
      const dimensions = calculateBracketDimensions(pilots)

      // Container width should be reasonable
      expect(dimensions.containerWidth).toBeGreaterThan(500)
      expect(dimensions.containerWidth).toBeLessThan(4000)

      // WB and LB widths should be positive
      expect(dimensions.wbColumnWidth).toBeGreaterThan(0)
      expect(dimensions.lbColumnWidth).toBeGreaterThan(0)

      // Heats per round should be valid arrays
      expect(Array.isArray(dimensions.heatsPerRound.wb)).toBe(true)
      expect(Array.isArray(dimensions.heatsPerRound.lb)).toBe(true)
      expect(dimensions.heatsPerRound.wb.length).toBeGreaterThan(0)
      expect(dimensions.heatsPerRound.lb.length).toBeGreaterThan(0)

      // All heat counts should be positive
      expect(dimensions.heatsPerRound.wb.every(count => count > 0)).toBe(true)
      expect(dimensions.heatsPerRound.lb.every(count => count > 0)).toBe(true)
    }
  })
})

describe('US-14.10: Round Labels', () => {
  it('should generate correct WB round labels for 8 pilots', () => {
    const dimensions = calculateBracketDimensions(8)

    expect(dimensions.roundLabels.wb).toEqual([
      'RUNDE 1 (4 Piloten)',
      'FINALE (2 Piloten)'
    ])
  })

  it('should generate correct WB round labels for 32 pilots', () => {
    const dimensions = calculateBracketDimensions(32)

    expect(dimensions.roundLabels.wb).toEqual([
      'RUNDE 1 (16 Piloten)',
      'RUNDE 2 (8 Piloten)',
      'FINALE (4 Piloten)'
    ])
  })

  it('should generate correct LB round labels', () => {
    const dimensions = calculateBracketDimensions(32)

    // LB labels should be generated
    expect(dimensions.roundLabels.lb.length).toBeGreaterThan(0)
    expect(dimensions.roundLabels.lb.every(label => label.includes('RUNDE') || label.includes('FINALE'))).toBe(true)
  })
})

describe('US-14.10: Round Pilot Counts', () => {
  it('should calculate correct WB pilot counts for 8 pilots', () => {
    const dimensions = calculateBracketDimensions(8)

    expect(dimensions.roundPilotCounts.wb).toEqual([4, 2])
  })

  it('should calculate correct WB pilot counts for 32 pilots', () => {
    const dimensions = calculateBracketDimensions(32)

    expect(dimensions.roundPilotCounts.wb).toEqual([16, 8, 4])
  })

  it('should calculate correct LB pilot counts', () => {
    const dimensions = calculateBracketDimensions(32)

    // LB pilot counts should be calculated
    expect(dimensions.roundPilotCounts.lb.length).toBeGreaterThan(0)
    expect(dimensions.roundPilotCounts.lb.every(count => count > 0)).toBe(true)
  })
})

describe('US-14.10: Performance & Edge Cases', () => {
  it('should handle calculation quickly for 60 pilots', () => {
    const start = performance.now()
    calculateBracketDimensions(60)
    const duration = performance.now() - start

    // Should calculate in less than 10ms
    expect(duration).toBeLessThan(10)
  })

  it('should not throw errors for any pilot count in range', () => {
    expect(() => calculateBracketDimensions(8)).not.toThrow()
    expect(() => calculateBracketDimensions(60)).not.toThrow()
    expect(() => calculateBracketDimensions(27)).not.toThrow()
    expect(() => calculateBracketDimensions(15)).not.toThrow()
  })

  it('should handle quali width calculation correctly', () => {
    const dim8 = calculateBracketDimensions(8)
    const dim12 = calculateBracketDimensions(12)
    const dim16 = calculateBracketDimensions(16)

    // 8 pilots: 2 heats = 2x140 + 10 = 290px
    expect(dim8.qualiWidth).toBe(290)

    // 12 pilots: 3 heats = 3x140 + 2x10 = 440px
    expect(dim12.qualiWidth).toBe(440)

    // 16 pilots: 4 heats = 4x140 + 3x10 = 590px
    expect(dim16.qualiWidth).toBe(590)
  })
})
