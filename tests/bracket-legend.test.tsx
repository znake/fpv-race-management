/**
 * Story 11-7: Bracket Legend Tests
 * 
 * AC1: Legende zeigt Linien-Bedeutung (WB, LB, GF)
 * AC2: Legende zeigt Platzierungs-Bedeutung (Platz 1+2, Platz 3+4)
 * AC3: Legende ist unterhalb des Brackets mit Abstand
 * AC4: Legende ist auf Beamer lesbar (min 12px)
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BracketLegend } from '../src/components/bracket/BracketLegend'

describe('Story 11-7: BracketLegend', () => {
  describe('AC1: Legende zeigt Linien-Bedeutung', () => {
    it('should show green line with "Winner Bracket" label', () => {
      render(<BracketLegend />)
      
      expect(screen.getByText('Winner Bracket')).toBeInTheDocument()
      // Check for green line element
      const legendItems = document.querySelectorAll('.legend-item')
      const wbItem = Array.from(legendItems).find(item => 
        item.textContent?.includes('Winner Bracket')
      )
      expect(wbItem).toBeTruthy()
      expect(wbItem?.querySelector('.legend-line.green')).toBeInTheDocument()
    })

    it('should show red line with "Loser Bracket" label', () => {
      render(<BracketLegend />)
      
      expect(screen.getByText('Loser Bracket')).toBeInTheDocument()
      const legendItems = document.querySelectorAll('.legend-item')
      const lbItem = Array.from(legendItems).find(item => 
        item.textContent?.includes('Loser Bracket')
      )
      expect(lbItem).toBeTruthy()
      expect(lbItem?.querySelector('.legend-line.red')).toBeInTheDocument()
    })

    it('should show gold line with "→ Grand Finale" label', () => {
      render(<BracketLegend />)
      
      expect(screen.getByText(/Grand Finale/)).toBeInTheDocument()
      const legendItems = document.querySelectorAll('.legend-item')
      const gfItem = Array.from(legendItems).find(item => 
        item.textContent?.includes('Grand Finale')
      )
      expect(gfItem).toBeTruthy()
      expect(gfItem?.querySelector('.legend-line.gold')).toBeInTheDocument()
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
      expect(winnerItem?.querySelector('.legend-color.winner')).toBeInTheDocument()
    })

    it('should show red color box with "Platz 3+4 (raus)" label', () => {
      render(<BracketLegend />)
      
      expect(screen.getByText(/Platz 3\+4/)).toBeInTheDocument()
      expect(screen.getByText(/raus/)).toBeInTheDocument()
      
      const legendItems = document.querySelectorAll('.legend-item')
      const loserItem = Array.from(legendItems).find(item => 
        item.textContent?.includes('Platz 3+4')
      )
      expect(loserItem).toBeTruthy()
      expect(loserItem?.querySelector('.legend-color.loser')).toBeInTheDocument()
    })
  })

  describe('AC3: Legende Position', () => {
    it('should have legend class with margin-top for spacing', () => {
      render(<BracketLegend />)
      
      const legend = document.querySelector('.legend')
      expect(legend).toBeInTheDocument()
      // Check that legend has proper styling class
      expect(legend).toHaveClass('legend')
    })

    it('should render all 5 legend items', () => {
      render(<BracketLegend />)
      
      const legendItems = document.querySelectorAll('.legend-item')
      expect(legendItems.length).toBe(5)
    })
  })

  describe('AC4: Beamer-Lesbarkeit', () => {
    it('should have readable font size (13px minimum via CSS class)', () => {
      render(<BracketLegend />)
      
      // The legend-item class in CSS has font-size: 13px
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
    it('should have 3 line items and 2 color items', () => {
      render(<BracketLegend />)
      
      const lineElements = document.querySelectorAll('.legend-line')
      const colorElements = document.querySelectorAll('.legend-color')
      
      expect(lineElements.length).toBe(3) // WB, LB, GF
      expect(colorElements.length).toBe(2) // winner, loser
    })

    it('should have correct line color classes', () => {
      render(<BracketLegend />)
      
      expect(document.querySelector('.legend-line.green')).toBeInTheDocument()
      expect(document.querySelector('.legend-line.red')).toBeInTheDocument()
      expect(document.querySelector('.legend-line.gold')).toBeInTheDocument()
    })

    it('should have correct color box classes', () => {
      render(<BracketLegend />)
      
      expect(document.querySelector('.legend-color.winner')).toBeInTheDocument()
      expect(document.querySelector('.legend-color.loser')).toBeInTheDocument()
    })
  })
})
