/**
 * US-14.8: Zoom & Pan Hook
 *
 * Provides zoom and pan functionality for bracket containers.
 *
 * Features:
 * - AC1: Zoom-Wrapper Container management
 * - AC2: Zoom to mouse position (Ctrl/Cmd + Scroll)
 * - AC3: Pan with Space + Drag
 * - AC5: Zoom Controls (+/- buttons)
 * - AC7: Reset on Double Click + Ctrl/Cmd
 */

import { useState, useRef, useEffect, useCallback, RefObject } from 'react'

/**
 * AC1: Zoom & Pan State Interface
 */
export interface ZoomPanState {
  scale: number
  translateX: number
  translateY: number
}

/**
 * UseZoomPan Options Interface
 */
export interface UseZoomPanOptions {
  minScale?: number  // Default: 0.25
  maxScale?: number  // Default: 3.0
  step?: number      // Default: 0.15
  onScaleChange?: (scale: number) => void
}

/**
 * Options for centerOnElement function
 */
export interface CenterOnElementOptions {
  targetScale?: number  // Default: 2.0
  duration?: number     // Default: 500ms
}

/**
 * UseZoomPan Return Interface
 */
export interface UseZoomPanReturn {
  state: ZoomPanState
  containerRef: RefObject<HTMLDivElement>
  wrapperRef: RefObject<HTMLDivElement>
  isPanning: boolean
  isDragging: boolean
  isAnimating: boolean
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
  centerOnElement: (element: HTMLElement, options?: CenterOnElementOptions) => void
}

/**
 * US-14.8: useZoomPan Hook
 *
 * Manages zoom and pan state and event handlers for bracket containers.
 *
 * @param options - Configuration options for zoom/pan behavior
 * @returns Zoom/pan state and control functions
 */
export function useZoomPan(options: UseZoomPanOptions = {}): UseZoomPanReturn {
  const {
    minScale = 0.25,
    maxScale = 3.0,
    step = 0.15,
    onScaleChange
  } = options

  const [state, setState] = useState<ZoomPanState>({
    scale: 1.5,
    translateX: 0,
    translateY: 0
  })

  const [isPanning, setIsPanning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * AC2: Zoom to specific point (e.g., mouse position)
   */
  const zoomAtPoint = useCallback((newScale: number, clientX: number, clientY: number) => {
    newScale = Math.max(minScale, Math.min(maxScale, newScale))
    if (newScale === state.scale) return

    const wrapper = wrapperRef.current
    if (!wrapper) return

    const wrapperRect = wrapper.getBoundingClientRect()
    const mouseX = clientX - wrapperRect.left + wrapper.scrollLeft
    const mouseY = clientY - wrapperRect.top + wrapper.scrollTop

    const contentX = (mouseX - state.translateX) / state.scale
    const contentY = (mouseY - state.translateY) / state.scale

    const newTranslateX = mouseX - contentX * newScale
    const newTranslateY = mouseY - contentY * newScale

    setState({
      scale: newScale,
      translateX: newTranslateX,
      translateY: newTranslateY
    })

    onScaleChange?.(newScale)
  }, [state, minScale, maxScale, onScaleChange])

  /**
   * AC2: Wheel Handler (Ctrl/Cmd + Scroll)
   */
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const handleWheel = (e: WheelEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -step : step
        zoomAtPoint(state.scale + delta, e.clientX, e.clientY)
      }
    }

    wrapper.addEventListener('wheel', handleWheel, { passive: false })
    return () => wrapper.removeEventListener('wheel', handleWheel)
  }, [state.scale, step, zoomAtPoint])

  /**
   * AC3: Space Key Handler for Pan-Mode
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        setIsPanning(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPanning(false)
        setIsDragging(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  /**
   * AC3: Mouse Drag Handler for Panning
   */
  const dragStartRef = useRef({ x: 0, y: 0, translateX: 0, translateY: 0 })

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const handleMouseDown = (e: MouseEvent) => {
      if (isPanning) {
        e.preventDefault()
        setIsDragging(true)
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          translateX: state.translateX,
          translateY: state.translateY
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x
        const dy = e.clientY - dragStartRef.current.y
        setState(prev => ({
          ...prev,
          translateX: dragStartRef.current.translateX + dx,
          translateY: dragStartRef.current.translateY + dy
        }))
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    wrapper.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      wrapper.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isPanning, isDragging, state.translateX, state.translateY])

  /**
   * AC5: Zoom to center (for buttons)
   */
  const zoomToCenter = useCallback((delta: number) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const rect = wrapper.getBoundingClientRect()
    zoomAtPoint(
      state.scale + delta,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    )
  }, [state.scale, zoomAtPoint])

  const zoomIn = useCallback(() => zoomToCenter(step), [zoomToCenter, step])
  const zoomOut = useCallback(() => zoomToCenter(-step), [zoomToCenter, step])

  /**
   * AC7: Reset function
   */
  const reset = useCallback(() => {
    setState({ scale: 1.5, translateX: 0, translateY: 0 })
    onScaleChange?.(1.5)
  }, [onScaleChange])

  /**
   * Center on a specific element with smooth animation
   * Used to auto-focus on the next active heat after submitting results
   */
  const centerOnElement = useCallback((element: HTMLElement, options: CenterOnElementOptions = {}) => {
    const { targetScale = 2.0, duration = 500 } = options
    
    const wrapper = wrapperRef.current
    const container = containerRef.current
    if (!wrapper || !container) return

    // Clear any existing animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    // Get wrapper dimensions (viewport)
    const wrapperRect = wrapper.getBoundingClientRect()
    const viewportCenterX = wrapperRect.width / 2
    const viewportCenterY = wrapperRect.height / 2

    // Get element position relative to container (in unscaled coordinates)
    const elementRect = element.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    // Calculate element center in current scaled space
    const elementCenterXScaled = elementRect.left - containerRect.left + elementRect.width / 2
    const elementCenterYScaled = elementRect.top - containerRect.top + elementRect.height / 2

    // Convert to unscaled coordinates
    const elementCenterX = elementCenterXScaled / state.scale
    const elementCenterY = elementCenterYScaled / state.scale

    // Calculate new translation to center the element
    // The element center in scaled space should be at viewport center
    const clampedScale = Math.max(minScale, Math.min(maxScale, targetScale))
    const newTranslateX = viewportCenterX - elementCenterX * clampedScale
    const newTranslateY = viewportCenterY - elementCenterY * clampedScale

    // Start animation
    setIsAnimating(true)

    // Update state (CSS transition will handle the animation)
    setState({
      scale: clampedScale,
      translateX: newTranslateX,
      translateY: newTranslateY
    })

    onScaleChange?.(clampedScale)

    // End animation after duration
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false)
    }, duration)
  }, [state.scale, minScale, maxScale, onScaleChange])

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Cancel animation if user starts panning
  useEffect(() => {
    if (isPanning && isAnimating) {
      setIsAnimating(false)
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [isPanning, isAnimating])

  return {
    state,
    containerRef,
    wrapperRef,
    isPanning,
    isDragging,
    isAnimating,
    zoomIn,
    zoomOut,
    reset,
    centerOnElement
  }
}
