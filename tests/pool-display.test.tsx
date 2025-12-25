/**
 * Tests für Story 4.3: Pool-Visualisierung
 * 
 * Task 1: PoolDisplay Komponente (AC: 2, 3)
 * Task 2: PoolStatusIndicator (AC: 2, 3, 10)
 */

import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Import components (to be created)
import { PoolDisplay, PoolStatusIndicator } from '../src/components/pool-display'
import type { Pilot } from '../src/lib/schemas'

// Test data
const mockPilots: Pilot[] = [
  { id: 'pilot-1', name: 'Jakob', imageUrl: 'https://example.com/jakob.jpg' },
  { id: 'pilot-2', name: 'Niklas', imageUrl: 'https://example.com/niklas.jpg' },
  { id: 'pilot-3', name: 'Jürgen', imageUrl: 'https://example.com/juergen.jpg' },
  { id: 'pilot-4', name: 'Berni', imageUrl: 'https://example.com/berni.jpg' },
  { id: 'pilot-5', name: 'Max', imageUrl: 'https://example.com/max.jpg' },
]

describe('Story 4.3: Pool-Visualisierung', () => {
  describe('Task 1: PoolDisplay Komponente', () => {
    test('AC 2: zeigt WB Pool-Piloten korrekt an', () => {
      const poolPilotIds = ['pilot-1', 'pilot-2', 'pilot-3']
      
      render(
        <PoolDisplay
          pilotIds={poolPilotIds}
          poolName="WB Pool"
          maxPilots={4}
          pilots={mockPilots}
        />
      )
      
      // Pool name wird angezeigt
      expect(screen.getByText('WB Pool')).toBeInTheDocument()
      
      // Piloten werden angezeigt
      expect(screen.getByText('Jakob')).toBeInTheDocument()
      expect(screen.getByText('Niklas')).toBeInTheDocument()
      expect(screen.getByText('Jürgen')).toBeInTheDocument()
    })
    
    test('AC 2: zeigt Piloten in FIFO-Reihenfolge (älteste zuerst)', () => {
      // FIFO: pilot-1 kam zuerst, dann pilot-2, dann pilot-3
      const poolPilotIds = ['pilot-1', 'pilot-2', 'pilot-3']
      
      render(
        <PoolDisplay
          pilotIds={poolPilotIds}
          poolName="WB Pool"
          maxPilots={4}
          pilots={mockPilots}
        />
      )
      
      // Überprüfen, dass Piloten in Reihenfolge erscheinen
      const pilotElements = screen.getAllByTestId('pool-pilot')
      expect(pilotElements).toHaveLength(3)
      
      // Erste Pilot (FIFO: älteste zuerst)
      expect(pilotElements[0]).toHaveTextContent('Jakob')
      expect(pilotElements[1]).toHaveTextContent('Niklas')
      expect(pilotElements[2]).toHaveTextContent('Jürgen')
    })
    
    test('AC 3: zeigt LB Pool-Piloten korrekt an', () => {
      const poolPilotIds = ['pilot-3', 'pilot-4', 'pilot-5']
      
      render(
        <PoolDisplay
          pilotIds={poolPilotIds}
          poolName="LB Pool"
          maxPilots={4}
          pilots={mockPilots}
        />
      )
      
      expect(screen.getByText('LB Pool')).toBeInTheDocument()
      expect(screen.getByText('Jürgen')).toBeInTheDocument()
      expect(screen.getByText('Berni')).toBeInTheDocument()
      expect(screen.getByText('Max')).toBeInTheDocument()
    })
    
    test('AC 2, 3: zeigt Mini-Fotos (32px) für Piloten', () => {
      const poolPilotIds = ['pilot-1', 'pilot-2']
      
      render(
        <PoolDisplay
          pilotIds={poolPilotIds}
          poolName="WB Pool"
          maxPilots={4}
          pilots={mockPilots}
        />
      )
      
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(2)
      
      // Check that images have correct size class
      images.forEach(img => {
        expect(img).toHaveClass('w-8') // 32px = w-8 in Tailwind
        expect(img).toHaveClass('h-8')
      })
    })
    
    test('zeigt Status-Indikator für fehlende Piloten', () => {
      const poolPilotIds = ['pilot-1', 'pilot-2'] // 2 von 4
      
      render(
        <PoolDisplay
          pilotIds={poolPilotIds}
          poolName="WB Pool"
          maxPilots={4}
          pilots={mockPilots}
        />
      )
      
      // Status zeigt "2/4 Piloten"
      expect(screen.getByText(/2\/4/)).toBeInTheDocument()
    })
    
    test('zeigt "Heat bereit!" wenn Pool voll ist', () => {
      const poolPilotIds = ['pilot-1', 'pilot-2', 'pilot-3', 'pilot-4']
      
      render(
        <PoolDisplay
          pilotIds={poolPilotIds}
          poolName="WB Pool"
          maxPilots={4}
          pilots={mockPilots}
        />
      )
      
      // Status zeigt "bereit"
      expect(screen.getByText(/bereit/i)).toBeInTheDocument()
      expect(screen.getByText(/4\/4/)).toBeInTheDocument()
    })
    
    test('zeigt leeren Pool mit "Warte auf Piloten..."', () => {
      render(
        <PoolDisplay
          pilotIds={[]}
          poolName="WB Pool"
          maxPilots={4}
          pilots={mockPilots}
        />
      )
      
      expect(screen.getByText(/warte/i)).toBeInTheDocument()
      expect(screen.getByText(/0\/4/)).toBeInTheDocument()
    })
  })

  describe('Task 2: PoolStatusIndicator Komponente', () => {
    test('AC 10: zeigt "3/4 Piloten" wenn 1 Pilot fehlt', () => {
      render(
        <PoolStatusIndicator
          currentCount={3}
          maxPilots={4}
          poolName="WB"
        />
      )
      
      expect(screen.getByText(/3\/4/)).toBeInTheDocument()
      expect(screen.getByText(/pilot/i)).toBeInTheDocument()
    })
    
    test('AC 10: zeigt "4/4 Piloten" mit Checkmark wenn Heat bereit', () => {
      render(
        <PoolStatusIndicator
          currentCount={4}
          maxPilots={4}
          poolName="WB"
        />
      )
      
      expect(screen.getByText(/4\/4/)).toBeInTheDocument()
      // Checkmark oder "bereit" Indikator
      expect(screen.getByTestId('pool-status-ready')).toBeInTheDocument()
    })
    
    test('AC 10: zeigt "1 Pilot wartet..." wenn WB aktiv und nur 1 Pilot', () => {
      render(
        <PoolStatusIndicator
          currentCount={1}
          maxPilots={4}
          poolName="WB"
          isWBActive={true}
        />
      )
      
      expect(screen.getByText(/1.*pilot.*wartet/i)).toBeInTheDocument()
    })
    
    test('AC 10: grüner Indikator wenn bereit, grauer wenn warten', () => {
      const { rerender } = render(
        <PoolStatusIndicator
          currentCount={4}
          maxPilots={4}
          poolName="WB"
        />
      )
      
      // Bereit = grün/gold
      const readyIndicator = screen.getByTestId('pool-status-indicator')
      expect(readyIndicator).toHaveClass('bg-winner-green')
      
      // Rerender mit weniger Piloten
      rerender(
        <PoolStatusIndicator
          currentCount={2}
          maxPilots={4}
          poolName="WB"
        />
      )
      
      // Warten = grau
      const waitingIndicator = screen.getByTestId('pool-status-indicator')
      expect(waitingIndicator).toHaveClass('bg-steel')
    })
    
    test('LB Pool zeigt korrekten Status', () => {
      render(
        <PoolStatusIndicator
          currentCount={3}
          maxPilots={4}
          poolName="LB"
        />
      )
      
      expect(screen.getByText(/3\/4/)).toBeInTheDocument()
    })
  })
})
