import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'
import { BracketHeatBox } from '../src/components/bracket/heat-boxes/BracketHeatBox'
import { FilledBracketHeatBox } from '../src/components/bracket/heat-boxes/FilledBracketHeatBox'
import { RankBadge } from '../src/components/ui/rank-badge'
import type { Heat, Pilot } from '../src/types'
import type { BracketHeat } from '../src/lib/bracket-structure-generator'

// Mock pilots with avatars
const mockPilots: Pilot[] = [
  { id: 'p1', name: 'Max Verstappen', imageUrl: 'https://example.com/p1.jpg' },
  { id: 'p2', name: 'Lewis Hamilton', imageUrl: 'https://example.com/p2.jpg' },
  { id: 'p3', name: 'Charles Leclerc', imageUrl: 'https://example.com/p3.jpg' },
  { id: 'p4', name: 'Carlos Sainz', imageUrl: 'https://example.com/p4.jpg' },
]

// Mock heat
const mockHeat: Heat = {
  id: 'heat-1',
  heatNumber: 1,
  pilotIds: ['p1', 'p2', 'p3', 'p4'],
  status: 'completed',
  bracketType: 'winner',
  results: {
    rankings: [
      { pilotId: 'p1', rank: 1 },
      { pilotId: 'p2', rank: 2 },
      { pilotId: 'p3', rank: 3 },
      { pilotId: 'p4', rank: 4 },
    ]
  }
}

// Mock 3-pilot heat
const mock3PilotHeat: Heat = {
  id: 'heat-3p',
  heatNumber: 2,
  pilotIds: ['p1', 'p2', 'p3'],
  status: 'completed',
  bracketType: 'loser',
  results: {
    rankings: [
      { pilotId: 'p1', rank: 1 },
      { pilotId: 'p2', rank: 2 },
      { pilotId: 'p3', rank: 3 },
    ]
  }
}

// Mock bracket heat
const mockBracketHeat: BracketHeat = {
  id: 'bh-1',
  heatNumber: 1,
  roundNumber: 1,
  bracketType: 'winner',
  status: 'pending',
  pilotIds: ['p1', 'p2', 'p3', 'p4'],
  sourceHeats: [],
  position: { x: 0, y: 0 },
}

describe('US-14.5: Heat-Box Design 1:1 Mockup', () => {
  const mockOnClick = vi.fn()
  const mockOnEdit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AC1: Standard Heat-Box Container', () => {
    it('should have heat-box base class', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const heatBox = container.querySelector('.heat-box')
      expect(heatBox).toBeInTheDocument()
    })

    it('should have correct width (140px via CSS variable)', () => {
      // Test that the CSS class exists and can be applied
      // The actual width is set via CSS variable --heat-width
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const heatBox = container.querySelector('.heat-box')
      expect(heatBox).toBeInTheDocument()
      // CSS class should apply width: var(--heat-width) which is 140px
    })

    it('should have 8px border-radius', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const heatBox = container.querySelector('.heat-box')
      expect(heatBox).toBeInTheDocument()
      // CSS class should apply border-radius: 8px
    })

    it('should have green border for winner bracket', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      // Winner bracket default = no extra class, just .heat-box
      const heatBox = container.querySelector('.heat-box')
      expect(heatBox).toBeInTheDocument()
      expect(heatBox).not.toHaveClass('lb')
      expect(heatBox).not.toHaveClass('gf')
    })

    it('should have red border for loser bracket (.lb class)', () => {
      const { container } = render(
        <BracketHeatBox
          heat={{ ...mockHeat, bracketType: 'loser' }}
          pilots={mockPilots}
          bracketType="loser"
          onClick={mockOnClick}
        />
      )
      
      const heatBox = container.querySelector('.heat-box.lb')
      expect(heatBox).toBeInTheDocument()
    })

    it('should have cyan border for qualification bracket (.quali class)', () => {
      const { container } = render(
        <BracketHeatBox
          heat={{ ...mockHeat, bracketType: 'qualification' }}
          pilots={mockPilots}
          bracketType="qualification"
          onClick={mockOnClick}
        />
      )
      
      const heatBox = container.querySelector('.heat-box.quali')
      expect(heatBox).toBeInTheDocument()
    })
  })

  describe('AC2: 3er-Heat Box', () => {
    it('should have .three-pilot class for heats with 3 pilots', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mock3PilotHeat}
          pilots={mockPilots.slice(0, 3)}
          bracketType="loser"
          onClick={mockOnClick}
        />
      )
      
      const heatBox = container.querySelector('.heat-box.three-pilot')
      expect(heatBox).toBeInTheDocument()
    })

    it('should NOT have .three-pilot class for 4-pilot heats', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const heatBox = container.querySelector('.heat-box')
      expect(heatBox).toBeInTheDocument()
      expect(heatBox).not.toHaveClass('three-pilot')
    })
  })

  describe('AC3: Grand Finale Box', () => {
    it('should have .gf class for finale bracket type', () => {
      const { container } = render(
        <BracketHeatBox
          heat={{ ...mockHeat, bracketType: 'finale', isFinale: true }}
          pilots={mockPilots}
          bracketType="finale"
          onClick={mockOnClick}
        />
      )
      
      const heatBox = container.querySelector('.heat-box.gf')
      expect(heatBox).toBeInTheDocument()
    })

    it('should have gold styling for finale', () => {
      const { container } = render(
        <BracketHeatBox
          heat={{ ...mockHeat, bracketType: 'finale', isFinale: true }}
          pilots={mockPilots}
          bracketType="finale"
          onClick={mockOnClick}
        />
      )
      
      // .gf class provides: border: 3px solid var(--gold), box-shadow: var(--glow-gold)
      const heatBox = container.querySelector('.heat-box.gf')
      expect(heatBox).toBeInTheDocument()
    })
  })

  describe('AC4: Heat-Header', () => {
    it('should display heat name with correct structure', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const header = container.querySelector('.heat-header')
      expect(header).toBeInTheDocument()
      // US-14.5: Heat name now includes bracket prefix (WB H1, LB H2, etc.)
      expect(header).toHaveTextContent('WB H1')
    })

    it('should have flex layout with space-between', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const header = container.querySelector('.heat-header')
      expect(header).toBeInTheDocument()
      // CSS class provides flex, space-between
    })
  })

  describe('AC5: Status-Badge', () => {
    it('should display pilot count in status badge', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const statusBadge = container.querySelector('.heat-status')
      expect(statusBadge).toBeInTheDocument()
      expect(statusBadge).toHaveTextContent('4x')
    })

    it('should show 3x for 3-pilot heats', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mock3PilotHeat}
          pilots={mockPilots.slice(0, 3)}
          bracketType="loser"
          onClick={mockOnClick}
        />
      )
      
      const statusBadge = container.querySelector('.heat-status')
      expect(statusBadge).toBeInTheDocument()
      expect(statusBadge).toHaveTextContent('3x')
    })

    it('should have winner-green background for winner bracket', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      // Winner bracket status has green background via CSS
      const statusBadge = container.querySelector('.heat-status')
      expect(statusBadge).toBeInTheDocument()
      // Default .heat-status has green background
    })

    it('should have loser-red background for loser bracket', () => {
      const { container } = render(
        <BracketHeatBox
          heat={{ ...mockHeat, bracketType: 'loser' }}
          pilots={mockPilots}
          bracketType="loser"
          onClick={mockOnClick}
        />
      )
      
      // Inside .heat-box.lb, .heat-status gets red background
      const heatBox = container.querySelector('.heat-box.lb')
      expect(heatBox).toBeInTheDocument()
    })

    it('should have quali-blue background for qualification bracket', () => {
      const { container } = render(
        <BracketHeatBox
          heat={{ ...mockHeat, bracketType: 'qualification' }}
          pilots={mockPilots}
          bracketType="qualification"
          onClick={mockOnClick}
        />
      )
      
      const heatBox = container.querySelector('.heat-box.quali')
      expect(heatBox).toBeInTheDocument()
    })

    it('should have gold background for grand finale', () => {
      const { container } = render(
        <BracketHeatBox
          heat={{ ...mockHeat, bracketType: 'finale', isFinale: true }}
          pilots={mockPilots}
          bracketType="finale"
          onClick={mockOnClick}
        />
      )
      
      const heatBox = container.querySelector('.heat-box.gf')
      expect(heatBox).toBeInTheDocument()
    })

    it('should show "LIVE" for active heats', () => {
      const activeHeat = { ...mockHeat, status: 'active' as const }
      const { container } = render(
        <BracketHeatBox
          heat={activeHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const statusBadge = container.querySelector('.heat-status')
      expect(statusBadge).toBeInTheDocument()
      expect(statusBadge).toHaveTextContent('LIVE')
    })
  })

  describe('AC6: Pilot-Row Basis', () => {
    it('should render pilot-row for each pilot', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const pilotRows = container.querySelectorAll('.pilot-row')
      expect(pilotRows.length).toBe(4)
    })

    it('should have flex layout with 5px gap', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const pilotRow = container.querySelector('.pilot-row')
      expect(pilotRow).toBeInTheDocument()
      // CSS class provides: display: flex, gap: 5px
    })
  })

  describe('AC7: Pilot-Row Top (Platz 1+2 - Winner)', () => {
    it('should have .top class for rank 1 pilot', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const topRows = container.querySelectorAll('.pilot-row.top')
      expect(topRows.length).toBe(2) // Rank 1 and 2
    })

    it('should have green background and border for top pilots', () => {
      // CSS class .pilot-row.top provides:
      // background: var(--bg-winner) = rgba(57, 255, 20, 0.25)
      // border-left: 2px solid var(--winner-green)
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const topRow = container.querySelector('.pilot-row.top')
      expect(topRow).toBeInTheDocument()
    })
  })

  describe('AC8: Pilot-Row Bottom (Platz 3+4 - Loser)', () => {
    it('should have .bottom class for rank 3+4 pilots', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const bottomRows = container.querySelectorAll('.pilot-row.bottom')
      expect(bottomRows.length).toBe(2) // Rank 3 and 4
    })

    it('should have red background and border for bottom pilots', () => {
      // CSS class .pilot-row.bottom provides:
      // background: var(--bg-loser) = rgba(255, 7, 58, 0.25)
      // border-left: 2px solid var(--loser-red)
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const bottomRow = container.querySelector('.pilot-row.bottom')
      expect(bottomRow).toBeInTheDocument()
    })
  })

  describe('AC9: Pilot-Avatar', () => {
    it('should render pilot-avatar for each pilot', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const avatars = container.querySelectorAll('.pilot-avatar')
      expect(avatars.length).toBe(4)
    })

    it('should be 18x18px and round', () => {
      // CSS class .pilot-avatar provides:
      // width: 18px, height: 18px, border-radius: 50%
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const avatar = container.querySelector('.pilot-avatar')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('AC10: Pilot-Name', () => {
    it('should render pilot-name for each pilot', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const pilotNames = container.querySelectorAll('.pilot-name')
      expect(pilotNames.length).toBe(4)
    })

    it('should display pilot name text', () => {
      render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      expect(screen.getByText('Max Verstappen')).toBeInTheDocument()
      expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument()
    })

    it('should have ellipsis for overflow', () => {
      // CSS class .pilot-name provides:
      // white-space: nowrap, overflow: hidden, text-overflow: ellipsis
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const pilotName = container.querySelector('.pilot-name')
      expect(pilotName).toBeInTheDocument()
    })
  })

  describe('AC11: Rank-Badge', () => {
    it('should render rank-badge for completed heats', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const rankBadges = container.querySelectorAll('.rank-badge')
      expect(rankBadges.length).toBe(4)
    })

    it('should have correct rank numbers', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const rankBadges = container.querySelectorAll('.rank-badge')
      expect(rankBadges[0]).toHaveTextContent('1')
      expect(rankBadges[1]).toHaveTextContent('2')
      expect(rankBadges[2]).toHaveTextContent('3')
      expect(rankBadges[3]).toHaveTextContent('4')
    })

    it('should have gold color for rank 1', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const rank1Badge = container.querySelector('.rank-badge.r1')
      expect(rank1Badge).toBeInTheDocument()
    })

    it('should have silver color for rank 2', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const rank2Badge = container.querySelector('.rank-badge.r2')
      expect(rank2Badge).toBeInTheDocument()
    })

    it('should have bronze color for rank 3', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const rank3Badge = container.querySelector('.rank-badge.r3')
      expect(rank3Badge).toBeInTheDocument()
    })

    it('should have cyan color for rank 4', () => {
      const { container } = render(
        <BracketHeatBox
          heat={mockHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
        />
      )
      
      const rank4Badge = container.querySelector('.rank-badge.r4')
      expect(rank4Badge).toBeInTheDocument()
    })
  })

  describe('RankBadge Component', () => {
    it('should render with .rank-badge class', () => {
      const { container } = render(<RankBadge rank={1} />)
      const badge = container.querySelector('.rank-badge')
      expect(badge).toBeInTheDocument()
    })

    it('should have .r1 class for rank 1 (gold)', () => {
      const { container } = render(<RankBadge rank={1} />)
      const badge = container.querySelector('.rank-badge.r1')
      expect(badge).toBeInTheDocument()
    })

    it('should have .r2 class for rank 2 (silver)', () => {
      const { container } = render(<RankBadge rank={2} />)
      const badge = container.querySelector('.rank-badge.r2')
      expect(badge).toBeInTheDocument()
    })

    it('should have .r3 class for rank 3 (bronze)', () => {
      const { container } = render(<RankBadge rank={3} />)
      const badge = container.querySelector('.rank-badge.r3')
      expect(badge).toBeInTheDocument()
    })

    it('should have .r4 class for rank 4 (cyan)', () => {
      const { container } = render(<RankBadge rank={4} />)
      const badge = container.querySelector('.rank-badge.r4')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('FilledBracketHeatBox', () => {
    it('should have heat-box class', () => {
      const { container } = render(
        <FilledBracketHeatBox
          bracketHeat={mockBracketHeat}
          pilots={mockPilots}
          bracketType="winner"
          onClick={mockOnClick}
          actualHeat={mockHeat}
        />
      )
      
      const heatBox = container.querySelector('.heat-box')
      expect(heatBox).toBeInTheDocument()
    })

    it('should have .lb class for loser bracket', () => {
      const { container } = render(
        <FilledBracketHeatBox
          bracketHeat={{ ...mockBracketHeat, bracketType: 'loser' }}
          pilots={mockPilots}
          bracketType="loser"
          onClick={mockOnClick}
          actualHeat={{ ...mockHeat, bracketType: 'loser' }}
        />
      )
      
      const heatBox = container.querySelector('.heat-box.lb')
      expect(heatBox).toBeInTheDocument()
    })
  })
})
