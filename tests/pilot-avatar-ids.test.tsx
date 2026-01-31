/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FilledBracketHeatBox } from '../src/components/bracket/heat-boxes/FilledBracketHeatBox'

describe('FilledBracketHeatBox pilot avatar IDs', () => {
  it('renders pilot avatars with unique IDs in format pilot-avatar-{pilotId}-{heatId}', () => {
    const bracketHeat = {
      id: 'heat-123',
      heatNumber: 1,
      pilotIds: ['pilot-abc', 'pilot-xyz'],
      status: 'pending' as const,
      bracketType: 'winner' as const
    }
    const pilots = [
      { id: 'pilot-abc', name: 'Pilot A', imageUrl: '' },
      { id: 'pilot-xyz', name: 'Pilot X', imageUrl: '' }
    ]

    render(
      <FilledBracketHeatBox
        bracketHeat={bracketHeat}
        pilots={pilots}
        bracketType="winner"
      />
    )

    const avatarA = document.getElementById('pilot-avatar-pilot-abc-heat-123')
    const avatarX = document.getElementById('pilot-avatar-pilot-xyz-heat-123')

    expect(avatarA).toBeInTheDocument()
    expect(avatarX).toBeInTheDocument()
    expect(avatarA?.tagName).toBe('IMG')
    expect(avatarX?.tagName).toBe('IMG')
  })
})
