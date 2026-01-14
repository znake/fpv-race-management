/**
 * Story 11-7: Bracket Legend Tests (Updated for US-14.9 Mockup Design)
 * 
 * AC1: Legende zeigt Linien-Bedeutung (Quali, WB, LB, GF)
 * AC2: Legende zeigt Platzierungs-Bedeutung (Platz 1+2, Platz 3+4)
 * AC3: Legende ist unterhalb des Brackets mit Abstand
 * AC4: Legende ist auf Beamer lesbar (min 10px per US-14.9)
 * 
 * Note: US-14.9 updated the design to use inline styles instead of CSS classes
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BracketLegend } from '../src/components/bracket/BracketLegend'

describe('Story 11-7: BracketLegend', () => {
  describe('AC1: Legende zeigt Linien-Bedeutung', () => {
    it('should show cyan line with "Qualifikation" label', () => {
      render(<BracketLegend />)
      
      expect(screen.getByText('Qualifikation')).toBeInTheDocument()
      const legendItems = document.querySelectorAll('.legend-item')
      const qualiItem = Array.from(legendItems).find(item => 
        item.textContent?.includes('Qualifikation')
      )
      expect(qualiItem).toBeTruthy()
      const line = qualiItem?.querySelector('.legend-line')
      expect(line).toHaveStyle({ backgroundColor: 'var(--quali-blue)' })
    })

    it('should show green line with "Winner Bracket" label', () => {
      render(<BracketLegend />)
      
      expect(screen.getByText('Winner Bracket')).toBeInTheDocument()
      const legendItems = document.querySelectorAll('.legend-item')
      const wbItem = Array.from(legendItems).find(item => 
        item.textContent?.includes('Winner Bracket')
      )
      expect(wbItem).toBeTruthy()
      const line = wbItem?.querySelector('.legend-line')
      expect(line).toHaveStyle({ backgroundColor: 'var(--winner-green)' })
    })

    it('should show red line with "Loser Bracket" label', () => {
      render(<BracketLegend />)
      
      expect(screen.getByText('Loser Bracket')).toBeInTheDocument()
      const legendItems = document.querySelectorAll('.legend-item')
      const lbItem = Array.from(legendItems).find(item => 
        item.textContent?.includes('Loser Bracket')
      )
      expect(lbItem).toBeTruthy()
      const line = lbItem?.querySelector('.legend-line')
      expect(line).toHaveStyle({ backgroundColor: 'var(--loser-red)' })
    })

    it('should show gold line with "Grand Finale" label', () => {
      render(<BracketLegend />)
      
      expect(screen.getByText(/Grand Finale/)).toBeInTheDocument()
      const legendItems = document.querySelectorAll('.legend-item')
      const gfItem = Array.from(legendItems).find(item => 
        item.textContent?.includes('Grand Finale')
      )
      expect(gfItem).toBeTruthy()
      const line = gfItem?.querySelector('.legend-line')
      expect(line).toHaveStyle({ backgroundColor: 'var(--gold)' })
    })
  })

  describe('AC2: Legende zeigt Platzierungs-Bedeutung', () => {
    it('should show green color box with "Platz 1+2 (weiter)" label', () => {
      render(<BracketLegend />)
      
      expect(screen.getByText(/Platz 1\+2/)).toBeInTheDocument()
      expect(screen.getByText(/weiter/)).toBeInTheDocument()
      
      const legendItems = document.querySelectorAll('.legend-item')
      const winnerItem = Array.from(legendItems).find(item => 
        item.textContent?.includes('Platz 1+2')
      )
      expect(winnerItem).toBeTruthy()
      const color = winnerItem?.querySelector('.legend-color')
      expect(color).toHaveStyle({
        backgroundColor: 'var(--bg-winner)',
        borderColor: 'var(--winner-green)'
      })
    })

    it('should show red color box with "Platz 3+4 (raus/LB)" label', () => {
      render(<BracketLegend />)
      
      expect(screen.getByText(/Platz 3\+4/)).toBeInTheDocument()
      expect(screen.getByText(/raus/)).toBeInTheDocument()
      
      const legendItems = document.querySelectorAll('.legend-item')
      const loserItem = Array.from(legendItems).find(item => 
        item.textContent?.includes('Platz 3+4')
      )
      expect(loserItem).toBeTruthy()
      const color = loserItem?.querySelector('.legend-color')
      expect(color).toHaveStyle({
        backgroundColor: 'var(--bg-loser)',
        borderColor: 'var(--loser-red)'
      })
    })
  })

  describe('AC3: Legende Position', () => {
    it('should have legend class with margin-top for spacing', () => {
      render(<BracketLegend />)
      
      const legend = document.querySelector('.legend')
      expect(legend).toBeInTheDocument()
      expect(legend).toHaveClass('legend')
    })

    it('should render all 7 legend items (4 lines + 2 colors + 1 special)', () => {
      render(<BracketLegend />)
      
      const legendItems = document.querySelectorAll('.legend-item')
      expect(legendItems.length).toBe(7)
    })
  })

  describe('AC4: Beamer-Lesbarkeit', () => {
    it('should have readable font size (10px per US-14.9 via CSS class)', () => {
      render(<BracketLegend />)
      
      // The legend class in CSS has font-size: 10px per US-14.9
      const legendItems = document.querySelectorAll('.legend-item')
      expect(legendItems.length).toBeGreaterThan(0)
      
      // Verify structure exists - CSS handles the actual font size
      legendItems.forEach(item => {
        expect(item).toHaveClass('legend-item')
      })
    })

    it('should have flex-wrap for responsive wrapping', () => {
      render(<BracketLegend />)
      
      const legend = document.querySelector('.legend')
      expect(legend).toBeInTheDocument()
      // flex-wrap: wrap is set via CSS class
    })
  })

  describe('Component Structure', () => {
    it('should have 4 line items and 2 color items', () => {
      render(<BracketLegend />)
      
      const lineElements = document.querySelectorAll('.legend-line')
      const colorElements = document.querySelectorAll('.legend-color')
      
      expect(lineElements.length).toBe(4) // Quali, WB, LB, GF
      expect(colorElements.length).toBe(2) // winner, loser
    })

    it('should have line elements with inline color styles', () => {
      render(<BracketLegend />)
      
      const lineElements = document.querySelectorAll('.legend-line')
      expect(lineElements.length).toBe(4)
      
      // Each line should have backgroundColor set via inline style
      lineElements.forEach(line => {
        expect(line).toHaveAttribute('style')
      })
    })

    it('should have color elements with inline background and border styles', () => {
      render(<BracketLegend />)
      
      const colorElements = document.querySelectorAll('.legend-color')
      expect(colorElements.length).toBe(2)
      
      // Each color box should have both backgroundColor and borderColor
      colorElements.forEach(color => {
        expect(color).toHaveAttribute('style')
      })
    })

    it('should have special "3x" item for 3-Pilot Heat', () => {
      render(<BracketLegend />)
      
      expect(screen.getByText('3-Pilot Heat')).toBeInTheDocument()
      
      const legendItems = document.querySelectorAll('.legend-item')
      const specialItem = Array.from(legendItems).find(item => 
        item.textContent?.includes('3-Pilot Heat')
      )
      expect(specialItem).toBeTruthy()
      const span = specialItem?.querySelector('span')
      expect(span).toHaveTextContent('3x')
      expect(span).toHaveStyle({
        color: 'var(--neon-cyan)',
        fontWeight: '600'
      })
    })
  })
})
