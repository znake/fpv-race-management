import { render, screen } from '@testing-library/react';
import React from 'react';
import { LoserBracketSection } from '../src/components/bracket/sections/LoserBracketSection';
import { calculateLBColumnWidth } from '../src/lib/bracket-layout-calculator';
import type { FullBracketStructure, Heat, Pilot } from '../src/types';

// Mock types
const mockStructure: FullBracketStructure['loserBracket'] = {
  id: 'lb',
  rounds: [
    {
      id: 'lb-r1',
      roundNumber: 1,
      heats: [{ id: 'h1' }, { id: 'h2' }]
    },
    {
      id: 'lb-r2',
      roundNumber: 2,
      heats: [{ id: 'h3' }]
    }
  ]
};

const mockHeats: Heat[] = [
  { id: 'h1', heatNumber: 1, pilotIds: ['p1', 'p2', 'p3', 'p4'], bracketType: 'loser' },
  { id: 'h2', heatNumber: 2, pilotIds: ['p5', 'p6', 'p7', 'p8'], bracketType: 'loser' },
  { id: 'h3', heatNumber: 3, pilotIds: ['p1', 'p2', 'p5', 'p6'], bracketType: 'loser' },
] as Heat[];

const mockPilots: Pilot[] = [];

describe('US-14-COMBINED Task 2: Loser Bracket Section', () => {
  test('Renders correct header', () => {
    render(
      <LoserBracketSection
        structure={mockStructure}
        heats={mockHeats}
        pilots={mockPilots}
        onHeatClick={vi.fn()}
        registerHeatRef={vi.fn()}
      />
    );
    expect(screen.getByText('LOSER BRACKET')).toBeInTheDocument();
  });

  test('Renders pool indicators between rounds', () => {
    render(
      <LoserBracketSection
        structure={mockStructure}
        heats={mockHeats}
        pilots={mockPilots}
        onHeatClick={vi.fn()}
        registerHeatRef={vi.fn()}
      />
    );
    
    // Check for indicator text parts
    expect(screen.getByText(/Piloten weiter/)).toBeInTheDocument();
    expect(screen.getByText(/Neu gemischt/)).toBeInTheDocument();
  });

  test('Calculates width correctly', () => {
    const { container } = render(
      <LoserBracketSection
        structure={mockStructure}
        heats={mockHeats}
        pilots={mockPilots}
        onHeatClick={vi.fn()}
        registerHeatRef={vi.fn()}
      />
    );
    
    // Max heats = 2. Width = 2*140 + 10 = 290
    const expectedWidth = calculateLBColumnWidth(2);
    const section = container.querySelector('.bracket-column.lb');
    expect(section).toHaveStyle(`width: ${expectedWidth}px`);
  });
});
