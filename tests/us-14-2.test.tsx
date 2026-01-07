import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { QualiSection } from '../src/components/bracket/sections/QualiSection'
import React from 'react'

describe('US-14.2: QualiSection Flow-Indicator', () => {
  it('should calculate pilot counts correctly', () => {
    const mockHeats: any = [
      { id: 'q1', heatNumber: 1, pilotIds: ['1', '2', '3', '4'], status: 'completed', bracketType: 'qualification' },
      { id: 'q2', heatNumber: 2, pilotIds: ['5', '6', '7', '8'], status: 'completed', bracketType: 'qualification' }
    ]
    const mockPilots: any = Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), name: `Pilot ${i + 1}`, country: 'DE', imageUrl: '' }))

    const { container } = render(
      <QualiSection 
        qualiHeats={mockHeats} 
        pilots={mockPilots} 
        onHeatClick={() => {}} 
        registerHeatRef={() => {}} 
      />
    )

    const text = container.textContent
    // 2 heats * 2 winners = 4
    expect(text).toContain('Platz 1+2 (4) → Winner Bracket')
    // 2 heats * 2 losers = 4
    expect(text).toContain('Platz 3+4 (4) → Loser Bracket')
  })

  it('should handle uneven pilot counts correctly', () => {
    const mockHeats: any = [
      { id: 'q1', heatNumber: 1, pilotIds: ['1', '2', '3', '4'], status: 'completed', bracketType: 'qualification' },
      { id: 'q2', heatNumber: 2, pilotIds: ['5', '6', '7'], status: 'completed', bracketType: 'qualification' }
    ]
    const mockPilots: any = Array.from({ length: 7 }, (_, i) => ({ id: String(i + 1), name: `Pilot ${i + 1}`, country: 'DE', imageUrl: '' }))

    const { container } = render(
      <QualiSection 
        qualiHeats={mockHeats} 
        pilots={mockPilots} 
        onHeatClick={() => {}} 
        registerHeatRef={() => {}} 
      />
    )

    const text = container.textContent
    // Heat 1: 2 winners, Heat 2: 2 winners = 4
    expect(text).toContain('Platz 1+2 (4) → Winner Bracket')
    // Total 7 - 4 winners = 3 losers
    expect(text).toContain('Platz 3+4 (3) → Loser Bracket')
  })
})
