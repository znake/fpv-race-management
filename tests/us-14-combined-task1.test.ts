import { calculateBracketDimensions, BRACKET_CONSTANTS } from '../src/lib/bracket-layout-calculator';

describe('US-14-COMBINED Task 1: Bracket Layout Calculator', () => {
  test('Constants match mockup requirements', () => {
    expect(BRACKET_CONSTANTS.HEAT_WIDTH).toBe(140);
    expect(BRACKET_CONSTANTS.HEAT_WIDTH_3).toBe(120);
    expect(BRACKET_CONSTANTS.GAP).toBe(10);
    expect(BRACKET_CONSTANTS.COLUMN_GAP).toBe(40);
  });

  test('calculateBracketDimensions for 8 pilots', () => {
    const dims = calculateBracketDimensions(8);
    // 8 pilots -> WB R1: 4 pilots / 4 = 1 heat
    // LB R1: 4 quali losers + 2 WB losers = 6 pilots / 4 = 2 heats
    
    expect(dims.heatsPerRound.wb[0]).toBe(1);
    // Formula result is 520px (140 + 40 + 290 + 50)
    expect(dims.containerWidth).toBeGreaterThan(500); 
    expect(dims.wbColumnWidth).toBe(140);
  });

  test('calculateBracketDimensions for 32 pilots (Mockup case)', () => {
    const dims = calculateBracketDimensions(32);
    
    // Check WB rounds (AC5)
    // 32 pilots / 2 = 16 Quali winners
    // R1: 16 / 4 = 4 heats
    // R2: 8 pilots -> 2 heats
    // R3 (Finale): 4 pilots -> 1 heat
    expect(dims.heatsPerRound.wb).toEqual([4, 2, 1]);
    
    // Check WB width (AC2)
    // 4 heats * 140 + 3 gaps * 10 = 560 + 30 = 590
    expect(dims.wbColumnWidth).toBe(590);
    
    // Check LB width (AC3)
    // LB should be wider than WB due to more heats
    expect(dims.lbColumnWidth).toBeGreaterThan(dims.wbColumnWidth);
    
    // Check Container width (AC1)
    const expectedWidth = dims.wbColumnWidth + 40 + dims.lbColumnWidth + 50;
    expect(dims.containerWidth).toBe(expectedWidth);
  });

  test('Layout handles 3-pilot heats correctly', () => {
    // 27 pilots -> Quali will have 3-pilot heats
    const dims = calculateBracketDimensions(27);
    
    expect(dims.containerWidth).toBeGreaterThan(0);
    expect(dims.qualiWidth).toBeGreaterThan(0);
  });
});
