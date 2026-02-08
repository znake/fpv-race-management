/**
 * US-14.8: Zoom Indicator Component
 *
 * Displays zoom controls and current zoom level.
 *
 * Features:
 * - AC4: Fixed position (bottom-right, night bg, cyan border)
 * - AC5: +/- buttons, zoom level display, hint text
 * - AC6: Button styling (transparent bg, cyan border, 24px)
 */

import { Maximize } from 'lucide-react'
import { ZoomIndicatorProps } from './types'

/**
 * US-14.8: ZoomIndicator Component
 *
 * Displays zoom controls and current zoom level in a fixed position.
 *
 * @param props - Component props
 * @returns Zoom indicator UI element
 */
export function ZoomIndicator({
  scale,
  onZoomIn,
  onZoomOut,
  onFitToView
}: ZoomIndicatorProps) {
  return (
    <div className="zoom-indicator">
      <button onClick={onZoomOut} aria-label="Zoom out">−</button>
      <span className="zoom-level">{Math.round(scale * 100)}%</span>
      <button onClick={onZoomIn} aria-label="Zoom in">+</button>
      {onFitToView && (
        <button onClick={onFitToView} aria-label="Fit bracket to view" className="fit-to-view-btn" title="Ganzes Bracket anzeigen (Z)">
<Maximize size={14} />
        </button>
      )}
      <span className="zoom-hint">Pinch/Scroll | Drag | Z</span>
    </div>
  )
}
