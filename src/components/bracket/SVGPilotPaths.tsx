import { useEffect, useState, useRef } from 'react'
import type { Heat, Pilot } from '../../types'
import { calculatePilotPath, assignPilotColor } from '../../lib/pilot-path-manager'

interface SVGPilotPathsProps {
  heats: Heat[]
  pilots: Pilot[]
  containerRef: React.RefObject<HTMLDivElement | null>
  scale?: number
  visible: boolean
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
}

export function SVGPilotPaths({
  heats,
  pilots,
  containerRef,
  scale = 1,
  visible
}: SVGPilotPathsProps) {
  const [paths, setPaths] = useState<RenderedPath[]>([])
  const [isReady, setIsReady] = useState(false)
  const [hoveredPilotId, setHoveredPilotId] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = (pilotId: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPilotId(pilotId)
    }, 50)
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPilotId(null)
    }, 50)
  }

  // Wait for DOM to be ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)
    return () => {
      clearTimeout(timer)
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
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
          const fromPos = getPilotAvatarPosition(segment.pilotId, segment.fromHeatId) ?? getPosition(segment.fromHeatId)
          const toPos = getPilotAvatarPosition(segment.pilotId, segment.toHeatId) ?? getPosition(segment.toHeatId)

          if (!fromPos || !toPos) return

          // Cubic Bezier S-Curve Calculation
          const AVATAR_OFFSET = 8 // pixels offset from avatar edge
          
          // Start from right edge of source avatar
          const startX = fromPos.right + AVATAR_OFFSET
          const startY = fromPos.centerY
          
          // End at left edge of target avatar
          const endX = toPos.left - AVATAR_OFFSET
          const endY = toPos.centerY
          
          // Calculate control points for elegant S-curve
          const deltaY = endY - startY
          const curveStrength = 40 // horizontal extent of curve
          
          // Control point 1: exit horizontally from source, then curve
          const cp1x = startX + curveStrength
          const cp1y = startY + deltaY * 0.3
          
          // Control point 2: approach target horizontally
          const cp2x = endX - curveStrength
          const cp2y = endY - deltaY * 0.3

          const d = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`

          newPaths.push({
            id: `${pilot.id}-${index}`,
            d,
            color,
            pilotId: pilot.id,
            isElimination: segment.isElimination
          })
        })
      })

      setPaths(newPaths)
    }

    calculatePaths()
    
    // Re-calculate on resize
    window.addEventListener('resize', calculatePaths)
    return () => window.removeEventListener('resize', calculatePaths)
  }, [visible, isReady, heats, pilots, scale, containerRef])

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
        zIndex: 2,
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
          markerEnd={path.isElimination ? "url(#pilot-x)" : "url(#pilot-arrow)"}
          style={{
            color: path.color,
            transition: 'opacity 150ms, stroke-width 150ms',
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
          onMouseEnter={() => handleMouseEnter(path.pilotId)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </svg>
  )
}
