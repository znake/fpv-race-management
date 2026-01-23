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
 * - AC8: Touch/Touchpad Support (Pinch-to-Zoom, Two-Finger Pan)
 * - AC9: Pointer Events for stylus support
 */

import { useState, useRef, useEffect, useCallback, RefObject } from 'react'

/**
 * Helper: Calculate distance between two touch points
 */
function getTouchDistance(touch1: Touch, touch2: Touch): number {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Helper: Calculate midpoint between two touch points
 */
function getTouchMidpoint(touch1: Touch, touch2: Touch): { x: number; y: number } {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  }
}

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
  maxScale?: number  // Default: 5.0
  step?: number      // Default: 0.15
  onScaleChange?: (scale: number) => void
}

/**
 * Options for centerOnElement function
 */
export interface CenterOnElementOptions {
  targetScale?: number  // Default: 3.0
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
    maxScale = 5.0,
    step = 0.15,
    onScaleChange
  } = options

  const [state, setState] = useState<ZoomPanState>({
    scale: 1.5,
    translateX: 0,
    translateY: 0
  })
  
  /**
   * Clamp translation to ensure canvas stays partially visible
   * Allows some overscroll but prevents complete disappearance
   */
  const clampTranslation = useCallback((
    translateX: number,
    translateY: number,
    scale: number,
    wrapper: HTMLElement | null,
    container: HTMLElement | null
  ): { translateX: number; translateY: number } => {
    if (!wrapper || !container) return { translateX, translateY }
    
    const wrapperRect = wrapper.getBoundingClientRect()
    const containerWidth = container.scrollWidth * scale
    const containerHeight = container.scrollHeight * scale
    
    // Allow canvas to move, but keep at least 100px visible on each edge
    const minVisible = 100
    
    // Max translation: canvas right/bottom edge at minVisible from wrapper left/top
    const maxTranslateX = wrapperRect.width - minVisible
    const maxTranslateY = wrapperRect.height - minVisible
    
    // Min translation: canvas left/top edge at wrapper right/bottom - minVisible
    const minTranslateX = -(containerWidth - minVisible)
    const minTranslateY = -(containerHeight - minVisible)
    
    return {
      translateX: Math.max(minTranslateX, Math.min(maxTranslateX, translateX)),
      translateY: Math.max(minTranslateY, Math.min(maxTranslateY, translateY))
    }
  }, [])

  const [isPanning, setIsPanning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isTouchPanning, setIsTouchPanning] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Touch/Pinch state refs
  const touchStartRef = useRef<{
    touches: { x: number; y: number }[]
    distance: number
    midpoint: { x: number; y: number }
    translateX: number
    translateY: number
    scale: number
    timestamp: number  // For tap detection
    hasMoved: boolean  // Track if touch has moved significantly
  } | null>(null)

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
    
    const clamped = clampTranslation(newTranslateX, newTranslateY, newScale, wrapper, containerRef.current)

    setState({
      scale: newScale,
      translateX: clamped.translateX,
      translateY: clamped.translateY
    })

    onScaleChange?.(newScale)
  }, [state, minScale, maxScale, onScaleChange, clampTranslation])

  /**
   * AC2: Wheel Handler (Ctrl/Cmd + Scroll for Zoom, normal scroll for Pan)
   * 
   * Behavior:
   * - Ctrl/Cmd + Scroll: Zoom (also triggered by trackpad pinch in most browsers)
   * - Normal Scroll (no modifier): Pan the canvas
   */
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const handleWheel = (e: WheelEvent) => {
      // Pinch-to-zoom on trackpad sends ctrlKey=true in Chrome/Safari
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        // For trackpad pinch, deltaY is more granular
        const delta = e.deltaY > 0 ? -step : step
        zoomAtPoint(state.scale + delta, e.clientX, e.clientY)
      } else {
        // Normal two-finger scroll on trackpad → Pan
        e.preventDefault()
        const newTranslateX = state.translateX - e.deltaX
        const newTranslateY = state.translateY - e.deltaY
        const clamped = clampTranslation(newTranslateX, newTranslateY, state.scale, wrapper, containerRef.current)
        setState(prev => ({
          ...prev,
          translateX: clamped.translateX,
          translateY: clamped.translateY
        }))
      }
    }

    wrapper.addEventListener('wheel', handleWheel, { passive: false })
    return () => wrapper.removeEventListener('wheel', handleWheel)
  }, [state.scale, state.translateX, state.translateY, step, zoomAtPoint, clampTranslation])
  
  /**
   * AC8: Touch Event Handlers (Pinch-to-Zoom, One/Two-Finger Pan)
   * 
   * Behavior:
   * - One finger: Pan
   * - Two fingers: Pinch to zoom + pan simultaneously
   */
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    // Threshold for distinguishing tap from pan (in pixels)
    const TAP_THRESHOLD = 10

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single finger: prepare for potential pan OR tap
        // Don't preventDefault here - allow tap events to propagate if no movement
        touchStartRef.current = {
          touches: [{ x: e.touches[0].clientX, y: e.touches[0].clientY }],
          distance: 0,
          midpoint: { x: e.touches[0].clientX, y: e.touches[0].clientY },
          translateX: state.translateX,
          translateY: state.translateY,
          scale: state.scale,
          timestamp: Date.now(),
          hasMoved: false
        }
      } else if (e.touches.length === 2) {
        // Two fingers: start pinch-zoom - this is definitely not a tap
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = getTouchDistance(touch1, touch2)
        const midpoint = getTouchMidpoint(touch1, touch2)
        
        touchStartRef.current = {
          touches: [
            { x: touch1.clientX, y: touch1.clientY },
            { x: touch2.clientX, y: touch2.clientY }
          ],
          distance,
          midpoint,
          translateX: state.translateX,
          translateY: state.translateY,
          scale: state.scale,
          timestamp: Date.now(),
          hasMoved: true  // Pinch is always considered "moved"
        }
        setIsTouchPanning(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return
      
      if (e.touches.length === 1) {
        // Single finger - check if we've moved enough to count as pan
        const dx = e.touches[0].clientX - touchStartRef.current.touches[0].x
        const dy = e.touches[0].clientY - touchStartRef.current.touches[0].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // Only start panning if moved beyond threshold
        if (distance > TAP_THRESHOLD) {
          // This is a pan, not a tap - prevent default to stop scrolling
          e.preventDefault()
          touchStartRef.current.hasMoved = true
          setIsTouchPanning(true)
          
          const newTranslateX = touchStartRef.current!.translateX + dx
          const newTranslateY = touchStartRef.current!.translateY + dy
          const clamped = clampTranslation(newTranslateX, newTranslateY, state.scale, wrapper, containerRef.current)
          
          setState(prev => ({
            ...prev,
            translateX: clamped.translateX,
            translateY: clamped.translateY
          }))
        }
        // If distance <= TAP_THRESHOLD, don't preventDefault - allow tap
      } else if (e.touches.length === 2) {
        // Two-finger pinch zoom + pan
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const newDistance = getTouchDistance(touch1, touch2)
        const newMidpoint = getTouchMidpoint(touch1, touch2)
        
        // Calculate scale change
        const scaleRatio = newDistance / touchStartRef.current.distance
        let newScale = touchStartRef.current.scale * scaleRatio
        newScale = Math.max(minScale, Math.min(maxScale, newScale))
        
        // Calculate pan (midpoint movement)
        const dx = newMidpoint.x - touchStartRef.current.midpoint.x
        const dy = newMidpoint.y - touchStartRef.current.midpoint.y
        
        // Zoom towards the pinch center
        const wrapperRect = wrapper.getBoundingClientRect()
        const pinchX = touchStartRef.current.midpoint.x - wrapperRect.left
        const pinchY = touchStartRef.current.midpoint.y - wrapperRect.top
        
        // Content position under pinch point (in unscaled coords)
        const contentX = (pinchX - touchStartRef.current.translateX) / touchStartRef.current.scale
        const contentY = (pinchY - touchStartRef.current.translateY) / touchStartRef.current.scale
        
        // New translation to keep content under pinch point
        const newTranslateX = pinchX - contentX * newScale + dx
        const newTranslateY = pinchY - contentY * newScale + dy
        
        const clamped = clampTranslation(newTranslateX, newTranslateY, newScale, wrapper, containerRef.current)
        
        setState({
          scale: newScale,
          translateX: clamped.translateX,
          translateY: clamped.translateY
        })
        
        onScaleChange?.(newScale)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        // All fingers lifted
        setIsTouchPanning(false)
        touchStartRef.current = null
      } else if (e.touches.length === 1 && touchStartRef.current?.touches.length === 2) {
        // Went from 2 fingers to 1 - transition to single-finger pan
        setIsTouchPanning(true)
        touchStartRef.current = {
          touches: [{ x: e.touches[0].clientX, y: e.touches[0].clientY }],
          distance: 0,
          midpoint: { x: e.touches[0].clientX, y: e.touches[0].clientY },
          translateX: state.translateX,
          translateY: state.translateY,
          scale: state.scale,
          timestamp: Date.now(),
          hasMoved: true  // Coming from pinch, continue as pan
        }
      }
    }

    wrapper.addEventListener('touchstart', handleTouchStart, { passive: false })
    wrapper.addEventListener('touchmove', handleTouchMove, { passive: false })
    wrapper.addEventListener('touchend', handleTouchEnd)
    wrapper.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      wrapper.removeEventListener('touchstart', handleTouchStart)
      wrapper.removeEventListener('touchmove', handleTouchMove)
      wrapper.removeEventListener('touchend', handleTouchEnd)
      wrapper.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [state.scale, state.translateX, state.translateY, minScale, maxScale, onScaleChange, isTouchPanning, clampTranslation])

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
   * AC3 + AC9: Pointer Event Handler for Panning (Mouse + Stylus)
   * 
   * Uses Pointer Events instead of Mouse Events for unified handling of:
   * - Mouse
   * - Stylus/Pen
   * - Touch (as fallback, but touch events above have priority)
   */
  const dragStartRef = useRef({ x: 0, y: 0, translateX: 0, translateY: 0, pointerId: -1 })

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const handlePointerDown = (e: PointerEvent) => {
      // Only handle mouse or pen, not touch (touch is handled by touch events)
      if (e.pointerType === 'touch') return
      
      // For pen: always allow panning (no Space key needed)
      // For mouse: require Space key (pan mode)
      const shouldPan = e.pointerType === 'pen' || isPanning
      
      if (shouldPan) {
        e.preventDefault()
        setIsDragging(true)
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          translateX: state.translateX,
          translateY: state.translateY,
          pointerId: e.pointerId
        }
        // Capture pointer for smooth dragging even outside wrapper
        wrapper.setPointerCapture(e.pointerId)
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging && e.pointerId === dragStartRef.current.pointerId) {
        const dx = e.clientX - dragStartRef.current.x
        const dy = e.clientY - dragStartRef.current.y
        const newTranslateX = dragStartRef.current.translateX + dx
        const newTranslateY = dragStartRef.current.translateY + dy
        const clamped = clampTranslation(newTranslateX, newTranslateY, state.scale, wrapper, containerRef.current)
        setState(prev => ({
          ...prev,
          translateX: clamped.translateX,
          translateY: clamped.translateY
        }))
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId === dragStartRef.current.pointerId) {
        setIsDragging(false)
        dragStartRef.current.pointerId = -1
        try {
          wrapper.releasePointerCapture(e.pointerId)
        } catch {
          // Pointer may already be released
        }
      }
    }

    wrapper.addEventListener('pointerdown', handlePointerDown)
    wrapper.addEventListener('pointermove', handlePointerMove)
    wrapper.addEventListener('pointerup', handlePointerUp)
    wrapper.addEventListener('pointercancel', handlePointerUp)

    return () => {
      wrapper.removeEventListener('pointerdown', handlePointerDown)
      wrapper.removeEventListener('pointermove', handlePointerMove)
      wrapper.removeEventListener('pointerup', handlePointerUp)
      wrapper.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isPanning, isDragging, state.translateX, state.translateY, state.scale, clampTranslation])

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
    const { targetScale = 3.0, duration = 500 } = options
    
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
    
    const clamped = clampTranslation(newTranslateX, newTranslateY, clampedScale, wrapper, container)

    // Start animation
    setIsAnimating(true)

    // Update state (CSS transition will handle the animation)
    setState({
      scale: clampedScale,
      translateX: clamped.translateX,
      translateY: clamped.translateY
    })

    onScaleChange?.(clampedScale)
    
    // End animation after duration
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false)
    }, duration)
  }, [state.scale, minScale, maxScale, onScaleChange, clampTranslation])

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
