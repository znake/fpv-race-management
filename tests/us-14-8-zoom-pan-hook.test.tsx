/**
 * US-14.8: Zoom & Pan Hook Tests
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useZoomPan } from '../src/hooks/useZoomPan'

describe('useZoomPan', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    // Mock container für DOM-Manipulationen
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('AC1: Initial State', () => {
    it('should initialize with default scale 1 and translate 0', () => {
      const { result } = renderHook(() => useZoomPan())

      expect(result.current.state.scale).toBe(1)
      expect(result.current.state.translateX).toBe(0)
      expect(result.current.state.translateY).toBe(0)
    })

    it('should provide containerRef and wrapperRef', () => {
      const { result } = renderHook(() => useZoomPan())

      expect(result.current.containerRef).toBeDefined()
      expect(result.current.wrapperRef).toBeDefined()
    })

    it('should initialize with isPanning and isDragging false', () => {
      const { result } = renderHook(() => useZoomPan())

      expect(result.current.isPanning).toBe(false)
      expect(result.current.isDragging).toBe(false)
    })
  })

  describe('AC5: Zoom Controls', () => {
    it('should provide zoomIn function', () => {
      const { result } = renderHook(() => useZoomPan())

      expect(typeof result.current.zoomIn).toBe('function')
    })

    it('should provide zoomOut function', () => {
      const { result } = renderHook(() => useZoomPan())

      expect(typeof result.current.zoomOut).toBe('function')
    })

    it('should provide reset function', () => {
      const { result } = renderHook(() => useZoomPan())

      expect(typeof result.current.reset).toBe('function')
    })

    it('should call onScaleChange callback when zoom is changed', () => {
      const onScaleChange = vi.fn()
      const { result } = renderHook(() => useZoomPan({ onScaleChange }))

      // Mock wrapperRef mit DOM-Element für zoomIn
      const wrapper = document.createElement('div')
      wrapper.style.width = '800px'
      wrapper.style.height = '600px'
      container.appendChild(wrapper)

      act(() => {
        result.current.wrapperRef.current = wrapper
      })

      act(() => {
        result.current.zoomIn()
      })

      expect(onScaleChange).toHaveBeenCalled()

      container.removeChild(wrapper)
    })
  })

  describe('Custom Options', () => {
    it('should accept custom minScale', () => {
      const { result } = renderHook(() => useZoomPan({ minScale: 0.5 }))

      expect(result.current).toBeDefined()
    })

    it('should accept custom maxScale', () => {
      const { result } = renderHook(() => useZoomPan({ maxScale: 2.0 }))

      expect(result.current).toBeDefined()
    })

    it('should accept custom step size', () => {
      const { result } = renderHook(() => useZoomPan({ step: 0.2 }))

      expect(result.current).toBeDefined()
    })

    it('should accept custom onScaleChange callback', () => {
      const onScaleChange = vi.fn()
      const { result } = renderHook(() => useZoomPan({ onScaleChange }))

      expect(result.current).toBeDefined()
    })
  })

  describe('Pan State', () => {
    it('should provide isPanning state', () => {
      const { result } = renderHook(() => useZoomPan())

      expect(result.current.isPanning).toBe(false)
    })

    it('should provide isDragging state', () => {
      const { result } = renderHook(() => useZoomPan())

      expect(result.current.isDragging).toBe(false)
    })
  })
})
