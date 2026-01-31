import { useEffect, useState } from 'react'
import type { Heat, Pilot } from '../../types'
import { calculatePilotPath, assignPilotColor } from '../../lib/pilot-path-manager'

interface SVGPilotPathsProps {
  heats: Heat[]
  pilots: Pilot[]
  containerRef: React.RefObject<HTMLDivElement | null>
  scale?: number
  /** Translation values - trigger redraw when panning */
  translateX?: number
  translateY?: number
  visible: boolean
  hoveredPilotId?: string | null
  onPilotHover?: (pilotId: string | null) => void
}

interface Position {
  centerX: number
  centerY: number
  top: number
  bottom: number
  left: number
  right: number
}

interface RenderedPath {
  id: string
  d: string
  color: string
  pilotId: string
  isElimination: boolean
  showMarker: boolean
}

export function SVGPilotPaths({
  heats,
  pilots,
  containerRef,
  scale = 1,
  translateX: _translateX,
  translateY: _translateY,
  visible,
  hoveredPilotId,
}: SVGPilotPathsProps) {
  const [paths, setPaths] = useState<RenderedPath[]>([])
  const [isReady, setIsReady] = useState(false)

  // Wait for DOM to be ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!visible || !isReady || !containerRef.current) {
      setPaths([])
      return
    }

    const calculatePaths = () => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newPaths: RenderedPath[] = []
      const allPilotIds = pilots.map(p => p.id)

      const getPilotAvatarPosition = (pilotId: string, heatId: string): Position | null => {
        const avatarElement = document.getElementById(`pilot-avatar-${pilotId}-${heatId}`)
        if (!avatarElement) return null

        const rect = avatarElement.getBoundingClientRect()
        return {
          centerX: (rect.left - containerRect.left + rect.width / 2) / scale,
          centerY: (rect.top - containerRect.top + rect.height / 2) / scale,
          top: (rect.top - containerRect.top) / scale,
          bottom: (rect.bottom - containerRect.top) / scale,
          left: (rect.left - containerRect.left) / scale,
          right: (rect.right - containerRect.left) / scale
        }
      }

      const getRankBadgePosition = (pilotId: string, heatId: string): Position | null => {
        const badgeElement = document.getElementById(`rank-badge-${pilotId}-${heatId}`)
        if (!badgeElement) return null

        const rect = badgeElement.getBoundingClientRect()
        return {
          centerX: (rect.left - containerRect.left + rect.width / 2) / scale,
          centerY: (rect.top - containerRect.top + rect.height / 2) / scale,
          top: (rect.top - containerRect.top) / scale,
          bottom: (rect.bottom - containerRect.top) / scale,
          left: (rect.left - containerRect.left) / scale,
          right: (rect.right - containerRect.left) / scale
        }
      }

      const getPosition = (elementId: string): Position | null => {
        const element = document.getElementById(elementId)
        if (!element) return null

        const rect = element.getBoundingClientRect()
        return {
          centerX: (rect.left - containerRect.left + rect.width / 2) / scale,
          centerY: (rect.top - containerRect.top + rect.height / 2) / scale,
          top: (rect.top - containerRect.top) / scale,
          bottom: (rect.bottom - containerRect.top) / scale,
          left: (rect.left - containerRect.left) / scale,
          right: (rect.right - containerRect.left) / scale
        }
      }

      pilots.forEach(pilot => {
        const segments = calculatePilotPath(pilot.id, heats)
        if (segments.length === 0) return

        const color = assignPilotColor(pilot.id, allPilotIds)

        segments.forEach((segment, index) => {
          const fromPos = getRankBadgePosition(segment.pilotId, segment.fromHeatId) 
            ?? getPilotAvatarPosition(segment.pilotId, segment.fromHeatId) 
            ?? getPosition(segment.fromHeatId)
          const toPos = getPilotAvatarPosition(segment.pilotId, segment.toHeatId) ?? getPosition(segment.toHeatId)

          if (!fromPos || !toPos) return

          const OFFSET = 8
          const HORIZONTAL_SEGMENT = 240
          
          const startX = fromPos.right + OFFSET
          const startY = fromPos.centerY
          const endX = toPos.left - OFFSET
          const endY = toPos.centerY
          
          const cp1x = startX + HORIZONTAL_SEGMENT
          const cp1y = startY
          const cp2x = endX - HORIZONTAL_SEGMENT
          const cp2y = endY

          const d = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`

          newPaths.push({
            id: `${pilot.id}-${index}`,
            d,
            color,
            pilotId: pilot.id,
            isElimination: segment.isElimination,
            showMarker: segment.showMarker
          })
        })
      })

      setPaths(newPaths)
    }

    calculatePaths()
    
    // Re-calculate on resize
    window.addEventListener('resize', calculatePaths)
    return () => window.removeEventListener('resize', calculatePaths)
  }, [visible, isReady, heats, pilots, scale, containerRef, _translateX, _translateY])

  if (!visible) return null

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'visible'
      }}
    >
      <defs>
        <marker
          id="pilot-arrow"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L6,3 Z" fill="currentColor" />
        </marker>
        <marker
          id="pilot-x"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
          orient="auto"
        >
          <path
            d="M1,1 L7,7 M7,1 L1,7"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </marker>
      </defs>

      {paths.map(path => (
        <path
          key={path.id}
          d={path.d}
          stroke={path.color}
          strokeWidth={hoveredPilotId === path.pilotId ? 2.5 : 1.5}
          fill="none"
          opacity={
            hoveredPilotId === null ? 0.6 : hoveredPilotId === path.pilotId ? 1 : 0.15
          }
          data-pilot-id={path.pilotId}
          className={`pilot-path ${
            hoveredPilotId === path.pilotId
              ? 'pilot-path-highlighted'
              : hoveredPilotId !== null
              ? 'pilot-path-faded'
              : ''
          }`}
          markerEnd={path.showMarker 
            ? (path.isElimination ? "url(#pilot-x)" : "url(#pilot-arrow)") 
            : undefined}
          style={{
            color: path.color,
            transition: 'opacity 150ms, stroke-width 150ms'
          }}
        />
      ))}
    </svg>
  )
}
