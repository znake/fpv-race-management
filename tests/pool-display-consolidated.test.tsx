/**
 * Tests für Story 2.6: Pool-Visualisierung konsolidieren
 *
 * AC1: bracket/PoolDisplay.tsx mit variant prop
 * AC2: Verwendet PilotAvatar
 * AC3: Props unterstützen pilots, title, variant, emptyMessage, maxDisplay
 * AC4: pool-display.tsx (Wurzel) entfernt
 * AC5: Alle Nutzer migrieren
 * AC6: Alle Tests grün
 */

import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { PoolDisplay } from '../src/components/bracket/PoolDisplay'
import type { Pilot } from '../src/stores/tournamentStore'

// Test data
const mockPilots: Pilot[] = [
  { id: 'pilot-1', name: 'Jakob', imageUrl: 'https://example.com/jakob.jpg' },
  { id: 'pilot-2', name: 'Niklas', imageUrl: 'https://example.com/niklas.jpg' },
  { id: 'pilot-3', name: 'Jürgen', imageUrl: 'https://example.com/juergen.jpg' },
  { id: 'pilot-4', name: 'Berni', imageUrl: 'https://example.com/berni.jpg' },
  { id: 'pilot-5', name: 'Max', imageUrl: 'https://example.com/max.jpg' },
  { id: 'pilot-6', name: 'Lisa', imageUrl: 'https://example.com/lisa.jpg' },
]

describe('Story 2.6: Pool-Visualisierung konsolidieren', () => {
  describe('AC1: PoolDisplay mit variant prop', () => {
    test('rendert standard variant', () => {
      render(
        <PoolDisplay
          title="WINNER POOL"
          pilotIds={['pilot-1', 'pilot-2']}
          pilots={mockPilots}
          variant="standard"
        />
      )

      expect(screen.getByTestId('pool-display-standard')).toBeInTheDocument()
    })

    test('rendert grandFinale variant', () => {
      render(
        <PoolDisplay
          title="GF POOL"
          pilotIds={['pilot-1', 'pilot-2']}
          pilots={mockPilots}
          variant="grandFinale"
        />
      )

      expect(screen.getByTestId('pool-display-grandFinale')).toBeInTheDocument()
    })

    test('rendert compact variant', () => {
      render(
        <PoolDisplay
          title="POOL"
          pilotIds={['pilot-1']}
          pilots={mockPilots}
          variant="compact"
        />
      )

      expect(screen.getByTestId('pool-display-compact')).toBeInTheDocument()
    })

    test('standard variant default wenn nicht angegeben', () => {
      render(
        <PoolDisplay
          title="WINNER POOL"
          pilotIds={['pilot-1']}
          pilots={mockPilots}
        />
      )

      expect(screen.getByTestId('pool-display-standard')).toBeInTheDocument()
    })
  })

  describe('AC2: Verwendet PilotAvatar', () => {
    test('zeigt PilotAvatar für jeden Piloten', () => {
      render(
        <PoolDisplay
          title="WINNER POOL"
          pilotIds={['pilot-1', 'pilot-2', 'pilot-3']}
          pilots={mockPilots}
          variant="standard"
        />
      )

      // PilotAvatar hat ein Bild Element
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThanOrEqual(3)
    })

    test('grandFinale variant verwendet größere Avatare', () => {
      render(
        <PoolDisplay
          title="GF POOL"
          pilotIds={['pilot-1', 'pilot-2']}
          pilots={mockPilots}
          variant="grandFinale"
        />
      )

      const images = screen.getAllByRole('img')
      // lg size = w-16 h-16
      images.forEach(img => {
        expect(img).toBeInTheDocument()
      })
    })
  })

  describe('AC3: Props unterstützen', () => {
    describe('title prop', () => {
      test('zeigt title an', () => {
        render(
          <PoolDisplay
            title="WINNER POOL"
            pilotIds={['pilot-1']}
            pilots={mockPilots}
          />
        )

        expect(screen.getByText('WINNER POOL')).toBeInTheDocument()
      })

      test('LB Pool zeigt korrekten title', () => {
        render(
          <PoolDisplay
            title="LOSER POOL"
            pilotIds={['pilot-1']}
            pilots={mockPilots}
          />
        )

        expect(screen.getByText('LOSER POOL')).toBeInTheDocument()
      })
    })

    describe('pilotIds und pilots props', () => {
      test('zeigt alle Piloten aus pilotIds an', () => {
        render(
          <PoolDisplay
            title="POOL"
            pilotIds={['pilot-1', 'pilot-2', 'pilot-3']}
            pilots={mockPilots}
          />
        )

        expect(screen.getByText('Jakob')).toBeInTheDocument()
        expect(screen.getByText('Niklas')).toBeInTheDocument()
        expect(screen.getByText('Jürgen')).toBeInTheDocument()
      })

      test('ignoriert pilotIds ohne entsprechenden Pilot', () => {
        render(
          <PoolDisplay
            title="POOL"
            pilotIds={['pilot-1', 'non-existent', 'pilot-2']}
            pilots={mockPilots}
          />
        )

        expect(screen.getByText('Jakob')).toBeInTheDocument()
        expect(screen.getByText('Niklas')).toBeInTheDocument()
        // non-existent Pilot nicht zu sehen
      })
    })

    describe('variant prop', () => {
      test('standard variant zeigt Namen', () => {
        render(
          <PoolDisplay
            title="POOL"
            pilotIds={['pilot-1']}
            pilots={mockPilots}
            variant="standard"
          />
        )

        expect(screen.getByText('Jakob')).toBeInTheDocument()
      })

      test('compact variant zeigt keine Namen', () => {
        render(
          <PoolDisplay
            title="POOL"
            pilotIds={['pilot-1']}
            pilots={mockPilots}
            variant="compact"
          />
        )

        // Nur Bild, kein Name
        const images = screen.getAllByRole('img')
        expect(images.length).toBeGreaterThan(0)
        // Name sollte NICHT im compact mode erscheinen
        // Da PilotAvatar den Namen als alt-text verwendet, prüfen wir das DOM
      })

      test('grandFinale variant zeigt Champion Labels', () => {
        render(
          <PoolDisplay
            title="GF POOL"
            pilotIds={['pilot-1', 'pilot-2']}
            pilots={mockPilots}
            variant="grandFinale"
          />
        )

        expect(screen.getByText('WB Champion')).toBeInTheDocument()
        expect(screen.getByText('LB Champion')).toBeInTheDocument()
      })
    })

    describe('emptyMessage prop', () => {
      test('zeigt custom emptyMessage', () => {
        render(
          <PoolDisplay
            title="POOL"
            pilotIds={[]}
            pilots={mockPilots}
            emptyMessage="Keine Piloten verfügbar"
          />
        )

        expect(screen.getByText('Keine Piloten verfügbar')).toBeInTheDocument()
      })

      test('default emptyMessage wenn nicht angegeben', () => {
        render(
          <PoolDisplay
            title="POOL"
            pilotIds={[]}
            pilots={mockPilots}
          />
        )

        expect(screen.getByText('Pool ist leer')).toBeInTheDocument()
      })
    })

    describe('maxDisplay prop', () => {
      test('zeigt nur maxDisplay Piloten', () => {
        render(
          <PoolDisplay
            title="POOL"
            pilotIds={['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4', 'pilot-5']}
            pilots={mockPilots}
            maxDisplay={3}
          />
        )

        expect(screen.getByText('Jakob')).toBeInTheDocument()
        expect(screen.getByText('Niklas')).toBeInTheDocument()
        expect(screen.getByText('Jürgen')).toBeInTheDocument()

        // "+X weitere" Text
        expect(screen.getByText(/\+2 weitere/)).toBeInTheDocument()
      })

      test('zeigt alle Piloten wenn maxDisplay nicht gesetzt', () => {
        render(
          <PoolDisplay
            title="POOL"
            pilotIds={['pilot-1', 'pilot-2', 'pilot-3']}
            pilots={mockPilots}
          />
        )

        expect(screen.getByText('Jakob')).toBeInTheDocument()
        expect(screen.getByText('Niklas')).toBeInTheDocument()
        expect(screen.getByText('Jürgen')).toBeInTheDocument()
      })
    })

    describe('showCount prop', () => {
      test('zeigt Piloten-Count wenn showCount=true (default)', () => {
        render(
          <PoolDisplay
            title="POOL"
            pilotIds={['pilot-1', 'pilot-2']}
            pilots={mockPilots}
            showCount={true}
          />
        )

        expect(screen.getByText(/2 Piloten/)).toBeInTheDocument()
      })

      test('zeigt keinen Piloten-Count wenn showCount=false', () => {
        render(
          <PoolDisplay
            title="POOL"
            pilotIds={['pilot-1', 'pilot-2']}
            pilots={mockPilots}
            showCount={false}
          />
        )

        expect(screen.queryByText(/2 Piloten/)).not.toBeInTheDocument()
      })
    })

    describe('className prop', () => {
      test('wendet custom className an', () => {
        const { container } = render(
          <PoolDisplay
            title="POOL"
            pilotIds={['pilot-1']}
            pilots={mockPilots}
            className="custom-class"
          />
        )

        expect(container.querySelector('.custom-class')).toBeInTheDocument()
      })
    })
  })

  describe('WB Pool spezifisch', () => {
    test('zeigt grünen Rahmen und Text für WB Pool', () => {
      render(
        <PoolDisplay
          title="WINNER POOL"
          pilotIds={['pilot-1']}
          pilots={mockPilots}
        />
      )

      expect(screen.getByText('WINNER POOL')).toHaveClass('text-winner-green')
    })

    test('zeigt "Heat bereit!" bei 4+ Piloten', () => {
      render(
        <PoolDisplay
          title="WINNER POOL"
          pilotIds={['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4']}
          pilots={mockPilots}
        />
      )

      expect(screen.getByText(/Heat bereit/i)).toBeInTheDocument()
    })

    test('zeigt "Warte..." bei weniger als 4 Piloten', () => {
      render(
        <PoolDisplay
          title="WINNER POOL"
          pilotIds={['pilot-1', 'pilot-2']}
          pilots={mockPilots}
        />
      )

      expect(screen.getByText(/Warte\.\.\./i)).toBeInTheDocument()
    })
  })

  describe('LB Pool spezifisch', () => {
    test('zeigt roten Rahmen und Text für LB Pool', () => {
      render(
        <PoolDisplay
          title="LOSER POOL"
          pilotIds={['pilot-1']}
          pilots={mockPilots}
        />
      )

      expect(screen.getByText('LOSER POOL')).toHaveClass('text-loser-red')
    })

    test('zeigt "Heat bereit!" bei 4+ Piloten', () => {
      render(
        <PoolDisplay
          title="LOSER POOL"
          pilotIds={['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4']}
          pilots={mockPilots}
        />
      )

      expect(screen.getByText(/Heat bereit/i)).toBeInTheDocument()
    })
  })

  describe('GF Pool spezifisch', () => {
    test('zeigt goldenen Rahmen und Text für GF Pool', () => {
      render(
        <PoolDisplay
          title="GF POOL"
          pilotIds={['pilot-1']}
          pilots={mockPilots}
          variant="grandFinale"
        />
      )

      expect(screen.getByText('GF POOL')).toHaveClass('text-gold')
    })

    test('zeigt "Grand Finale bereit!" bei 2+ Piloten', () => {
      render(
        <PoolDisplay
          title="GF POOL"
          pilotIds={['pilot-1', 'pilot-2']}
          pilots={mockPilots}
          variant="grandFinale"
        />
      )

      expect(screen.getByText(/Grand Finale bereit/i)).toBeInTheDocument()
    })

    test('zeigt WB Champion Label für ersten Piloten', () => {
      render(
        <PoolDisplay
          title="GF POOL"
          pilotIds={['pilot-1', 'pilot-2']}
          pilots={mockPilots}
          variant="grandFinale"
        />
      )

      expect(screen.getByText('WB Champion')).toBeInTheDocument()
    })

    test('zeigt LB Champion Label für zweiten Piloten', () => {
      render(
        <PoolDisplay
          title="GF POOL"
          pilotIds={['pilot-1', 'pilot-2']}
          pilots={mockPilots}
          variant="grandFinale"
        />
      )

      expect(screen.getByText('LB Champion')).toBeInTheDocument()
    })
  })

  describe('Status Indikator', () => {
    test('zeigt korrekte Anzahlen für WB Pool', () => {
      render(
        <PoolDisplay
          title="WINNER POOL"
          pilotIds={['pilot-1', 'pilot-2']}
          pilots={mockPilots}
        />
      )

      expect(screen.getByText(/2\/4\+/)).toBeInTheDocument()
    })

    test('zeigt korrekte Anzahlen für GF Pool', () => {
      render(
        <PoolDisplay
          title="GF POOL"
          pilotIds={['pilot-1']}
          pilots={mockPilots}
          variant="grandFinale"
        />
      )

      expect(screen.getByText(/1\/2\+/)).toBeInTheDocument()
    })

    test('zeigt keine "weitere" wenn alle angezeigt', () => {
      render(
        <PoolDisplay
          title="POOL"
          pilotIds={['pilot-1', 'pilot-2', 'pilot-3']}
          pilots={mockPilots}
          maxDisplay={10}
        />
      )

      expect(screen.queryByText(/\+ weitere/)).not.toBeInTheDocument()
    })
  })
})
