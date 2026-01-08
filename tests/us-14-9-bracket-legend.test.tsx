/**
 * US-14.9: Legende im Mockup-Design Tests
 *
 * AC1: Legende Container (night bg, 8px radius, 25px margin-top)
 * AC2: Flex-Layout (20px gap, flex-wrap: wrap)
 * AC3: Line-Items (20px × 2px Linie, 6px gap zum Text)
 * AC4: Line-Farben (Cyan, Grün, Rot, Gold)
 * AC5: Color-Items (14px × 14px Quadrat, 3px radius)
 * AC6: Color-Varianten (bg-winner/grüner border, bg-loser/roter border)
 * AC7: Spezial-Item "3x" (font-weight 600, neon-cyan)
 * AC8: Item-Styling (flex, center, 6px gap, steel Text)
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BracketLegend } from '../src/components/bracket/BracketLegend'

describe('US-14.9: BracketLegend Mockup-Design', () => {
  describe('AC1: Legende Container', () => {
    it('should render legend container with legend class', () => {
      const { container } = render(<BracketLegend />)

      const legend = container.querySelector('.legend')
      expect(legend).toBeInTheDocument()
      expect(legend).toHaveClass('legend')
    })
  })

  describe('AC3: Line-Items', () => {
    it('should render 4 line items (Quali, WB, LB, GF)', () => {
      render(<BracketLegend />)

      const lineElements = document.querySelectorAll('.legend-line')
      expect(lineElements.length).toBe(4)
    })

    it('should have legend-line class for all line elements', () => {
      render(<BracketLegend />)

      const lineElements = document.querySelectorAll('.legend-line')
      lineElements.forEach(line => {
        expect(line).toHaveClass('legend-line')
      })
    })
  })

  describe('AC4: Line-Farben', () => {
    it('should show Qualifikation line with cyan color via inline style', () => {
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

    it('should show Winner Bracket line with green color via inline style', () => {
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

    it('should show Loser Bracket line with red color via inline style', () => {
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

    it('should show Grand Finale line with gold color via inline style', () => {
      render(<BracketLegend />)

      expect(screen.getByText('Grand Finale')).toBeInTheDocument()
      const legendItems = document.querySelectorAll('.legend-item')
      const gfItem = Array.from(legendItems).find(item =>
        item.textContent?.includes('Grand Finale')
      )
      expect(gfItem).toBeTruthy()
      const line = gfItem?.querySelector('.legend-line')
      expect(line).toHaveStyle({ backgroundColor: 'var(--gold)' })
    })
  })

  describe('AC5: Color-Items', () => {
    it('should render 2 color items (Platz 1+2, Platz 3+4)', () => {
      render(<BracketLegend />)

      const colorElements = document.querySelectorAll('.legend-color')
      expect(colorElements.length).toBe(2)
    })

    it('should have legend-color class for all color elements', () => {
      render(<BracketLegend />)

      const colorElements = document.querySelectorAll('.legend-color')
      colorElements.forEach(color => {
        expect(color).toHaveClass('legend-color')
      })
    })
  })

  describe('AC6: Color-Varianten', () => {
    it('should show Platz 1+2 color item with winner bg and green border via inline style', () => {
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

    it('should show Platz 3+4 color item with loser bg and red border via inline style', () => {
      render(<BracketLegend />)

      expect(screen.getByText(/Platz 3\+4/)).toBeInTheDocument()

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

  describe('AC7: Spezial-Items', () => {
    it('should show 3-Pilot Heat special item', () => {
      render(<BracketLegend />)

      expect(screen.getByText('3-Pilot Heat')).toBeInTheDocument()
    })

    it('should style "3x" with font-weight 600 and neon-cyan color via inline style', () => {
      render(<BracketLegend />)

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

  describe('AC8: Item-Styling', () => {
    it('should render all legend items with legend-item class', () => {
      render(<BracketLegend />)

      const legendItems = document.querySelectorAll('.legend-item')
      legendItems.forEach(item => {
        expect(item).toHaveClass('legend-item')
      })
    })
  })

  describe('Complete Structure', () => {
    it('should render all 7 legend items total', () => {
      render(<BracketLegend />)

      const legendItems = document.querySelectorAll('.legend-item')
      expect(legendItems.length).toBe(7)
    })

    it('should render items in correct order: Quali, WB, LB, GF, Platz 1+2, Platz 3+4, 3x', () => {
      render(<BracketLegend />)

      const legendItems = document.querySelectorAll('.legend-item')
      const texts = Array.from(legendItems).map(item => item.textContent)

      expect(texts[0]).toContain('Qualifikation')
      expect(texts[1]).toContain('Winner Bracket')
      expect(texts[2]).toContain('Loser Bracket')
      expect(texts[3]).toContain('Grand Finale')
      expect(texts[4]).toContain('Platz 1+2')
      expect(texts[5]).toContain('Platz 3+4')
      expect(texts[6]).toContain('3-Pilot Heat')
    })
  })
})
