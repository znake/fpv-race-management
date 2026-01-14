import { render, screen } from '@testing-library/react';
import React from 'react';
import { BracketHeatBox } from '../src/components/bracket/heat-boxes/BracketHeatBox';
import type { Heat, Pilot } from '../src/types';

const mockHeat: Heat = {
  id: 'h1',
  heatNumber: 1,
  pilotIds: ['p1', 'p2', 'p3', 'p4'],
  bracketType: 'winner',
  status: 'pending',
  roundNumber: 1
};

const mockThreePilotHeat: Heat = {
  id: 'h2',
  heatNumber: 2,
  pilotIds: ['p1', 'p2', 'p3'],
  bracketType: 'winner',
  status: 'pending',
  roundNumber: 1
};

const mockPilots: Pilot[] = [
  { id: 'p1', name: 'Pilot 1', imageUrl: 'url1' },
  { id: 'p2', name: 'Pilot 2', imageUrl: 'url2' },
  { id: 'p3', name: 'Pilot 3', imageUrl: 'url3' },
  { id: 'p4', name: 'Pilot 4', imageUrl: 'url4' },
];

describe('US-14-COMBINED Task 3: Bracket Heat Box Design', () => {
  test('Renders standard 4-pilot heat correctly', () => {
    const { container } = render(
      <BracketHeatBox
        heat={mockHeat}
        pilots={mockPilots}
        bracketType="winner"
      />
    );
    
    // Check pilot count badge
    expect(screen.getByText('4x')).toBeInTheDocument();
    
    // Check standard width class NOT being three-pilot
    const heatBox = container.firstChild as HTMLElement;
    expect(heatBox.classList.contains('three-pilot')).toBe(false);
  });

  test('Renders 3-pilot heat with correct styling', () => {
    const { container } = render(
      <BracketHeatBox
        heat={mockThreePilotHeat}
        pilots={mockPilots}
        bracketType="winner"
      />
    );
    
    // Check pilot count badge
    expect(screen.getByText('3x')).toBeInTheDocument();
    
    // Check three-pilot class
    const heatBox = container.firstChild as HTMLElement;
    expect(heatBox.classList.contains('three-pilot')).toBe(true);
  });

  test('Renders active heat with LIVE badge', () => {
    const activeHeat = { ...mockHeat, status: 'active' as const };
    render(
      <BracketHeatBox
        heat={activeHeat}
        pilots={mockPilots}
        bracketType="winner"
      />
    );
    
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  test('Applies correct bracket type classes', () => {
    const { container, rerender } = render(
      <BracketHeatBox
        heat={mockHeat}
        pilots={mockPilots}
        bracketType="loser"
      />
    );
    
    expect(container.firstChild).toHaveClass('lb');
    
    rerender(
      <BracketHeatBox
        heat={mockHeat}
        pilots={mockPilots}
        bracketType="qualification"
      />
    );
    expect(container.firstChild).toHaveClass('quali');
  });
});
