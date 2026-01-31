import { useEffect, useState } from 'react'
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

  // Wait for DOM to be ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)
    return () => clearTimeout(timer)
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

      const getPosition = (elementId: string): Position | null => {
        const element = document.getElementById(elementId)
        if (!element) return null

        const rect = element.getBoundingClientRect()
        return {
          centerX: (rect.left - containerRect.left + rect.width / 2) / scale,
          centerY: (rect.top - containerRect.top + rect.height / 2) / scale,
          top: (rect.top - containerRect.top) / scale,
          bottom: (rect.bottom - containerRect.top) / scale
        }
      }

      pilots.forEach(pilot => {
        const segments = calculatePilotPath(pilot.id, heats)
        if (segments.length === 0) return

        const color = assignPilotColor(pilot.id, allPilotIds)

        segments.forEach((segment, index) => {
          const fromPos = getPosition(segment.fromHeatId)
          const toPos = getPosition(segment.toHeatId)

          if (!fromPos || !toPos) return

          // Bezier Curve Calculation
          const startX = fromPos.centerX
          const startY = fromPos.bottom
          const endX = toPos.centerX
          const endY = toPos.top
          
          // Control point for quadratic bezier
          const controlX = (startX + endX) / 2
          const controlY = startY + (endY - startY) * 0.5

          const d = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`

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
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
          data-pilot-id={path.pilotId}
          markerEnd={path.isElimination ? "url(#pilot-x)" : "url(#pilot-arrow)"}
          style={{ color: path.color }} // For marker currentColor
        />
      ))}
    </svg>
  )
}
