import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { RankBadge } from '@/components/ui/rank-badge'
import { BracketHeatBox } from '@/components/bracket/heat-boxes/bracket-heat-box'
import { GrandFinaleHeatBox } from '@/components/bracket/sections/grand-finale-heat-box'
import { HeatDetailModal } from '@/components/heat-detail-modal'
import { PlacementEntryModal } from '@/components/placement-entry-modal'
import { PilotCard } from '@/components/pilot-card'
import { VictoryCeremony } from '@/components/victory-ceremony'
import { createMockPilots, resetMockPilotCounter } from './helpers/mock-factories'
import type { Heat } from '@/types'
import type { Pilot } from '@/lib/schemas'

const CANONICAL_BADGE_CLASSES: Record<1 | 2 | 3 | 4, string> = {
  1: 'bg-gold',
  2: 'bg-silver',
  3: 'bg-bronze',
  4: 'bg-rank-4',
}

function makeCompletedHeat(
  pilots: ReturnType<typeof createMockPilots>,
  overrides: Partial<Heat> = {}
): Heat {
  return {
    id: 'wb-heat-7',
    heatNumber: 7,
    pilotIds: pilots.map(p => p.id),
    status: 'completed',
    bracketType: 'winner',
    results: {
      rankings: pilots.map((p, index) => ({ pilotId: p.id, rank: (index + 1) as 1 | 2 | 3 | 4 })),
      completedAt: new Date().toISOString(),
    },
    ...overrides,
  }
}

describe('RankBadge', () => {
  beforeEach(() => {
    cleanup()
    resetMockPilotCounter()
  })

  it.each([1, 2, 3, 4] as const)('renders canonical token classes for rank %i', (rank) => {
    const { container } = render(<RankBadge rank={rank} />)
    const badge = container.firstElementChild as HTMLElement

    expect(badge).toHaveTextContent(String(rank))
    expect(badge).toHaveClass(CANONICAL_BADGE_CLASSES[rank], 'text-void')
  })

  it('forwards the id prop to the rendered DOM node', () => {
    render(<RankBadge rank={2} id="rank-badge-p1-h1" />)
    const badge = document.getElementById('rank-badge-p1-h1')
    expect(badge).not.toBeNull()
    expect(badge).toHaveClass('bg-silver')
  })

  it('applies the animation class only when animated is true', () => {
    const { rerender } = render(<RankBadge rank={1} id="badge" />)
    expect(document.getElementById('badge')).not.toHaveClass('rank-badge-animate')

    rerender(<RankBadge rank={1} id="badge" animated />)
    expect(document.getElementById('badge')).toHaveClass('rank-badge-animate')
  })
})

describe('Standard heat box rank badge DOM contract', () => {
  beforeEach(() => {
    cleanup()
    resetMockPilotCounter()
  })

  it('renders an element with id rank-badge-<pilotId>-<heatId> using canonical tokens', () => {
    const pilots = createMockPilots(4)
    const heat = makeCompletedHeat(pilots)

    render(<BracketHeatBox heat={heat} pilots={pilots} bracketType="winner" />)

    const badge = document.getElementById(`rank-badge-${pilots[0].id}-${heat.id}`)
    expect(badge).not.toBeNull()
    expect(badge).toHaveClass('bg-gold', 'text-void')
  })
})

describe('Grand finale heat box rank badge DOM contract', () => {
  beforeEach(() => {
    cleanup()
    resetMockPilotCounter()
  })

  it('renders an element with id rank-badge-<pilotId>-<heatId> using canonical tokens', () => {
    const pilots = createMockPilots(4)
    const heat = makeCompletedHeat(pilots, { id: 'grand-finale-1', bracketType: 'grand_finale' })

    render(<GrandFinaleHeatBox heat={heat} pilots={pilots} heats={[]} />)

    const badge = document.getElementById(`rank-badge-${pilots[0].id}-${heat.id}`)
    expect(badge).not.toBeNull()
    expect(badge).toHaveClass('bg-gold', 'text-void')
  })
})

describe('Rank styling consolidation', () => {
  beforeEach(() => {
    cleanup()
    resetMockPilotCounter()
  })

  it('heat-detail-modal renders canonical rank classes', () => {
    const pilots = createMockPilots(4)
    const heat = makeCompletedHeat(pilots)

    render(
      <HeatDetailModal
        heat={heat}
        pilots={pilots}
        isOpen={true}
        onClose={() => {}}
        onEdit={() => {}}
      />
    )

    expect(document.querySelector('.bg-gold')).not.toBeNull()
    expect(document.querySelector('.bg-silver')).not.toBeNull()
    expect(document.querySelector('.bg-bronze')).not.toBeNull()
    expect(document.querySelector('.bg-rank-4')).not.toBeNull()
  })

  it('placement-entry-modal renders canonical rank classes', () => {
    const pilots = createMockPilots(4)
    const heat = makeCompletedHeat(pilots, { id: 'wb-heat-1', status: 'active', bracketType: 'winner' })

    render(
      <PlacementEntryModal
        heat={heat}
        pilots={pilots}
        isOpen={true}
        onClose={() => {}}
        onSubmitResults={() => {}}
      />
    )

    expect(document.querySelector('.bg-gold')).not.toBeNull()
    expect(document.querySelector('.bg-silver')).not.toBeNull()
    expect(document.querySelector('.bg-bronze')).not.toBeNull()
    expect(document.querySelector('.bg-rank-4')).not.toBeNull()
  })

  it('placement-entry-modal source no longer contains the text-void string hack', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/placement-entry-modal.tsx'),
      'utf8'
    )
    expect(source).not.toContain(".replace(' text-void'")
  })

  it('ui-helpers no longer exports the divergent getRankBadgeClasses helper', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/lib/ui-helpers.ts'), 'utf8')
    expect(source).not.toContain('getRankBadgeClasses')
  })
})

describe('pilot-card uses canonical rank tokens', () => {
  beforeEach(() => {
    cleanup()
    resetMockPilotCounter()
  })

  it.each([
    [2, 'border-silver', 'shadow-glow-silver'],
    [3, 'border-bronze', 'shadow-glow-bronze'],
    [4, 'border-rank-4', 'shadow-glow-rank-4'],
  ] as const)('rank %i uses %s / %s', (rank, borderClass, glowClass) => {
    const pilot = createMockPilots(1)[0]

    const { container } = render(<PilotCard pilot={pilot} rank={rank} />)

    const card = container.querySelector('.pilot-card')
    expect(card).toHaveClass(borderClass, glowClass)
  })
})

describe('victory-ceremony uses canonical rank tokens', () => {
  beforeEach(() => {
    cleanup()
    resetMockPilotCounter()
  })

  const top4 = {
    place1: { id: 'p1', name: 'Champion', imageUrl: '/p1.jpg' } as Pilot,
    place2: { id: 'p2', name: 'Second', imageUrl: '/p2.jpg' } as Pilot,
    place3: { id: 'p3', name: 'Third', imageUrl: '/p3.jpg' } as Pilot,
    place4: { id: 'p4', name: 'Fourth', imageUrl: '/p4.jpg' } as Pilot,
  }

  it('uses silver tokens for second place instead of gray-300', () => {
    const { container } = render(<VictoryCeremony top4={top4} onNewTournament={() => {}} />)

    const second = container.querySelector('[data-testid="podium-place-2"]')
    expect(second).toHaveClass('border-silver')
    expect(second?.querySelector('.bg-silver')).not.toBeNull()
    expect(container.querySelector('.bg-gray-300')).toBeNull()
  })

  it('uses bronze tokens for third place instead of amber-600', () => {
    const { container } = render(<VictoryCeremony top4={top4} onNewTournament={() => {}} />)

    const third = container.querySelector('[data-testid="podium-place-3"]')
    expect(third).toHaveClass('border-bronze')
    expect(third?.querySelector('.bg-bronze')).not.toBeNull()
    expect(container.querySelector('.bg-amber-600')).toBeNull()
  })
})
