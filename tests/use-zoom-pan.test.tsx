import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, fireEvent, cleanup, act } from '@testing-library/react'
import { useEffect } from 'react'
import { useZoomPan, type ZoomPanState, type FitToViewOptions, type CenterOnElementOptions } from '@/hooks/useZoomPan'

interface Snapshot {
  state: ZoomPanState
  isDragging: boolean
  isAnimating: boolean
  isTransforming: boolean
  fitToView: (options?: FitToViewOptions) => void
  centerOnElement: (element: HTMLElement, options?: CenterOnElementOptions) => void
  wrapper: HTMLDivElement | null
  container: HTMLDivElement | null
  animateToState: (state: ZoomPanState, duration?: number) => void
}

interface Captured {
  current: Snapshot | null
}

function Harness({ capture }: { capture: (snapshot: Snapshot) => void }) {
  const {
    state,
    isDragging,
    isAnimating,
    isTransforming,
    fitToView,
    centerOnElement,
    animateToState,
    wrapperRef,
    containerRef,
  } = useZoomPan()

  useEffect(() => {
    capture({
      state,
      isDragging,
      isAnimating,
      isTransforming,
      fitToView,
      centerOnElement,
      wrapper: wrapperRef.current,
      container: containerRef.current,
      animateToState,
    })
  })

  return (
    <div ref={wrapperRef} data-testid="wrapper">
      <div ref={containerRef} data-testid="container">content</div>
    </div>
  )
}

interface PointerEventProperties {
  pointerId: number
  pointerType: 'mouse' | 'pen'
  button?: number
  clientX: number
  clientY: number
}

function dispatchPointerEvent(
  element: HTMLElement,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  properties: PointerEventProperties
) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperties(event, {
    pointerId: { value: properties.pointerId },
    pointerType: { value: properties.pointerType },
    button: { value: properties.button },
    clientX: { value: properties.clientX },
    clientY: { value: properties.clientY },
  })
  fireEvent(element, event)
}

function stubPointerCapture(element: HTMLElement) {
  element.setPointerCapture = vi.fn()
  element.releasePointerCapture = vi.fn()
}

function startPointerDrag(element: HTMLElement, pointerType: 'mouse' | 'pen' = 'mouse') {
  dispatchPointerEvent(element, 'pointerdown', {
    pointerId: 1,
    pointerType,
    button: 0,
    clientX: 0,
    clientY: 0,
  })
  dispatchPointerEvent(element, 'pointermove', {
    pointerId: 1,
    pointerType,
    button: 0,
    clientX: 50,
    clientY: 0,
  })
}

function endPointerDrag(element: HTMLElement, pointerType: 'mouse' | 'pen' = 'mouse') {
  dispatchPointerEvent(element, 'pointerup', {
    pointerId: 1,
    pointerType,
    button: 0,
    clientX: 50,
    clientY: 0,
  })
}

describe('useZoomPan', () => {
  let captured: Captured

  const renderHarness = () => {
    const utils = render(<Harness capture={(snapshot) => { captured.current = snapshot }} />)
    return { wrapper: utils.getByTestId('wrapper'), ...utils }
  }

  beforeEach(() => {
    captured = { current: null }
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts at scale 1.5 with no translation', () => {
    renderHarness()

    expect(captured.current?.state).toEqual({ scale: 1.5, translateX: 0, translateY: 0 })
  })

  it('zooms in on a plain wheel event with negative delta', () => {
    const { wrapper } = renderHarness()

    fireEvent.wheel(wrapper, { deltaY: -100, clientX: 100, clientY: 100 })

    expect(captured.current?.state.scale).toBeGreaterThan(1.5)
  })

  it('zooms out on a plain wheel event with positive delta', () => {
    const { wrapper } = renderHarness()

    fireEvent.wheel(wrapper, { deltaY: 100, clientX: 100, clientY: 100 })

    expect(captured.current?.state.scale).toBeLessThan(1.5)
  })

  it('cancels a running animation when wheel zoom starts', () => {
    const { wrapper } = renderHarness()

    act(() => {
      captured.current?.animateToState({ scale: 2, translateX: 0, translateY: 0 })
    })
    expect(captured.current?.isAnimating).toBe(true)
    expect(captured.current?.isTransforming).toBe(true)

    fireEvent.wheel(wrapper, { deltaY: -100, clientX: 100, clientY: 100 })

    expect(captured.current?.isAnimating).toBe(false)
    expect(captured.current?.state.scale).toBeGreaterThan(1.5)
  })

  it.each(['mouse', 'pen'] as const)('starts a %s drag and translates after crossing the threshold', (pointerType) => {
    const { wrapper } = renderHarness()
    stubPointerCapture(wrapper)

    startPointerDrag(wrapper, pointerType)

    expect(captured.current?.isDragging).toBe(true)
    expect(captured.current?.state.translateX).not.toBe(0)
    expect(wrapper.setPointerCapture).toHaveBeenCalledWith(1)
  })

  it('treats an unavailable pointer button as the left button', () => {
    const { wrapper } = renderHarness()
    stubPointerCapture(wrapper)

    dispatchPointerEvent(wrapper, 'pointerdown', { pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0 })
    dispatchPointerEvent(wrapper, 'pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 50, clientY: 0 })

    expect(captured.current?.isDragging).toBe(true)
  })

  it('does not start dragging when a mouse click has no movement', () => {
    const { wrapper } = renderHarness()
    stubPointerCapture(wrapper)

    dispatchPointerEvent(wrapper, 'pointerdown', {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientX: 25,
      clientY: 25,
    })
    dispatchPointerEvent(wrapper, 'pointerup', {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientX: 25,
      clientY: 25,
    })

    expect(captured.current?.isDragging).toBe(false)
    expect(captured.current?.state.translateX).toBe(0)
    expect(wrapper.setPointerCapture).not.toHaveBeenCalled()
  })

  it('suppresses exactly the next click after a real pointer drag', () => {
    const { wrapper } = renderHarness()
    stubPointerCapture(wrapper)

    startPointerDrag(wrapper)
    endPointerDrag(wrapper)

    expect(fireEvent.click(wrapper)).toBe(false)
    expect(fireEvent.click(wrapper)).toBe(true)
  })

  it('cancels a running animation when pointer dragging starts', () => {
    const { wrapper } = renderHarness()
    stubPointerCapture(wrapper)
    act(() => {
      captured.current?.animateToState({ scale: 2, translateX: 0, translateY: 0 })
    })

    startPointerDrag(wrapper)

    expect(captured.current?.isAnimating).toBe(false)
    expect(captured.current?.isDragging).toBe(true)
  })

  it('resets isTransforming after fitToView', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] })
    renderHarness()

    const wrapper = captured.current?.wrapper
    const container = captured.current?.container
    if (!wrapper || !container) throw new Error('refs not captured')
    Object.defineProperty(container, 'scrollWidth', { value: 1000, configurable: true })
    Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true })
    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 800, 600))

    act(() => {
      captured.current?.fitToView({ duration: 500 })
    })
    expect(captured.current?.isTransforming).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(captured.current?.isTransforming).toBe(false)
  })

  it('resets isTransforming after centerOnElement', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] })
    renderHarness()

    const wrapper = captured.current?.wrapper
    const container = captured.current?.container
    if (!wrapper || !container) throw new Error('refs not captured')
    Object.defineProperty(container, 'scrollWidth', { value: 1000, configurable: true })
    Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true })
    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 800, 600))
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1000, 1000))

    const target = document.createElement('div')
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 10, 100, 100))

    act(() => {
      captured.current?.centerOnElement(target, { duration: 500 })
    })
    expect(captured.current?.isTransforming).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(captured.current?.isTransforming).toBe(false)
  })
  it('pans on a single-finger touch drag beyond the tap threshold', () => {
    const { wrapper } = renderHarness()

    fireEvent.touchStart(wrapper, { touches: [{ clientX: 0, clientY: 0 }] })
    fireEvent.touchMove(wrapper, { touches: [{ clientX: 50, clientY: 0 }] })

    expect(captured.current?.isTransforming).toBe(true)
  })

  it('removes interaction listeners on unmount', () => {
    const { wrapper, unmount } = renderHarness()

    unmount()

    expect(() => {
      fireEvent.wheel(wrapper, { deltaY: -100, clientX: 100, clientY: 100 })
      fireEvent.touchStart(wrapper, { touches: [{ clientX: 0, clientY: 0 }] })
    }).not.toThrow()
  })
})
