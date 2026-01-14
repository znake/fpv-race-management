import { render, screen } from '@testing-library/react';
import React from 'react';
import { GrandFinaleSection } from '../src/components/bracket/sections/GrandFinaleSection';
import type { Heat, Pilot } from '../src/types';

// Mock types
const mockGrandFinale: Heat = {
  id: 'gf',
  heatNumber: 99,
  pilotIds: ['p1', 'p2', 'p3', 'p4'],
  bracketType: 'finale',
  status: 'pending',
  roundNumber: 1
} as Heat;

const mockPilots: Pilot[] = [
  { id: 'p1', name: 'P1', imageUrl: '' },
  { id: 'p2', name: 'P2', imageUrl: '' },
  { id: 'p3', name: 'P3', imageUrl: '' },
  { id: 'p4', name: 'P4', imageUrl: '' },
];

const mockHeats: Heat[] = [
  { id: 'wb-final', bracketType: 'winner', isFinale: true } as Heat,
  { id: 'lb-final', bracketType: 'loser', isFinale: true } as Heat,
];

describe('US-14-COMBINED Task 4: Grand Finale Section', () => {
  test('Renders Grand Finale Header correctly', () => {
    // Create refs directly as objects since useRef returns objects with .current
    const wbFinaleRef = { current: document.createElement('div') };
    const lbFinaleRef = { current: document.createElement('div') };
    
    render(
      <GrandFinaleSection
        grandFinaleHeat={mockGrandFinale}
        pilots={mockPilots}
        heats={mockHeats}
        wbFinaleRef={wbFinaleRef}
        lbFinaleRef={lbFinaleRef}
      />
    );
    
    // Use test id to be specific, as text appears in both section label and heat header
    expect(screen.getByTestId('gf-label')).toHaveTextContent('GRAND FINALE');
  });

  test('Renders Source Labels correctly', () => {
    const wbFinaleRef = { current: document.createElement('div') };
    const lbFinaleRef = { current: document.createElement('div') };
    
    render(
      <GrandFinaleSection
        grandFinaleHeat={mockGrandFinale}
        pilots={mockPilots}
        heats={mockHeats}
        wbFinaleRef={wbFinaleRef}
        lbFinaleRef={lbFinaleRef}
      />
    );
    
    expect(screen.getByText('WB TOP 2')).toBeInTheDocument();
    expect(screen.getByText('LB TOP 2')).toBeInTheDocument();
  });

  test('Does not render if no grand finale heat provided', () => {
    const wbFinaleRef = { current: document.createElement('div') };
    const lbFinaleRef = { current: document.createElement('div') };
    
    const { container } = render(
      <GrandFinaleSection
        grandFinaleHeat={null}
        pilots={mockPilots}
        heats={mockHeats}
        wbFinaleRef={wbFinaleRef}
        lbFinaleRef={lbFinaleRef}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });
});
