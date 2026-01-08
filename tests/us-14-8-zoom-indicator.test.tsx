/**
 * US-14.8: Zoom Indicator Component Tests
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ZoomIndicator } from '../src/components/bracket/ZoomIndicator'

describe('ZoomIndicator', () => {
  it('should render zoom out button', () => {
    render(<ZoomIndicator scale={1} onZoomIn={() => {}} onZoomOut={() => {}} />)
    expect(screen.getByText('−')).toBeInTheDocument()
  })

  it('should render zoom level', () => {
    render(<ZoomIndicator scale={1.5} onZoomIn={() => {}} onZoomOut={() => {}} />)
    expect(screen.getByText('150%')).toBeInTheDocument()
  })

  it('should render zoom in button', () => {
    render(<ZoomIndicator scale={1} onZoomIn={() => {}} onZoomOut={() => {}} />)
    expect(screen.getByText('+')).toBeInTheDocument()
  })

  it('should render hint text', () => {
    render(<ZoomIndicator scale={1} onZoomIn={() => {}} onZoomOut={() => {}} />)
    expect(screen.getByText('Strg/⌘+Scroll | Space+Drag')).toBeInTheDocument()
  })

  it('should call onZoomIn when + button is clicked', () => {
    const onZoomIn = vi.fn()
    render(<ZoomIndicator scale={1} onZoomIn={onZoomIn} onZoomOut={() => {}} />)

    const zoomInButton = screen.getByText('+')
    zoomInButton.click()

    expect(onZoomIn).toHaveBeenCalled()
  })

  it('should call onZoomOut when - button is clicked', () => {
    const onZoomOut = vi.fn()
    render(<ZoomIndicator scale={1} onZoomIn={() => {}} onZoomOut={onZoomOut} />)

    const zoomOutButton = screen.getByText('−')
    zoomOutButton.click()

    expect(onZoomOut).toHaveBeenCalled()
  })

  it('should display correct zoom level for scale < 1', () => {
    render(<ZoomIndicator scale={0.5} onZoomIn={() => {}} onZoomOut={() => {}} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('should display correct zoom level for scale > 1', () => {
    render(<ZoomIndicator scale={2.5} onZoomIn={() => {}} onZoomOut={() => {}} />)
    expect(screen.getByText('250%')).toBeInTheDocument()
  })

  it('should display correct zoom level for scale = 1', () => {
    render(<ZoomIndicator scale={1} onZoomIn={() => {}} onZoomOut={() => {}} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})
