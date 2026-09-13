import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, cleanup, act } from '@testing-library/react'
import { useEffect } from 'react'
import { useZoomPan, type ZoomPanState, type FitToViewOptions, type CenterOnElementOptions } from '@/hooks/useZoomPan'

interface Snapshot {
  state: ZoomPanState
  isPanning: boolean
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
    isPanning,
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
      isPanning,
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

  it('zooms in on Ctrl/Cmd + wheel', () => {
    const { wrapper } = renderHarness()

    fireEvent.wheel(wrapper, { deltaY: -100, ctrlKey: true, clientX: 100, clientY: 100 })

    expect(captured.current?.state.scale).toBeGreaterThan(1.5)
  })

  it('zooms out on Ctrl/Cmd + wheel with positive delta', () => {
    const { wrapper } = renderHarness()

    fireEvent.wheel(wrapper, { deltaY: 100, ctrlKey: true, clientX: 100, clientY: 100 })

    expect(captured.current?.state.scale).toBeLessThan(1.5)
  })

  it('pans on a plain wheel scroll', () => {
    const { wrapper } = renderHarness()

    fireEvent.wheel(wrapper, { deltaX: 0, deltaY: 100, clientX: 100, clientY: 100 })

    expect(captured.current?.state.translateY).not.toBe(0)
  })

  it('enables pan mode while Space is held and disables it on release', () => {
    renderHarness()

    expect(captured.current?.isPanning).toBe(false)

    fireEvent.keyDown(document.body, { code: 'Space' })
    expect(captured.current?.isPanning).toBe(true)

    fireEvent.keyUp(document.body, { code: 'Space' })
    expect(captured.current?.isPanning).toBe(false)
  })

  it('cancels a running animation and resets transform when Space pan mode starts', () => {
    renderHarness()

    act(() => {
      captured.current?.animateToState({ scale: 2, translateX: 0, translateY: 0 })
    })
    expect(captured.current?.isAnimating).toBe(true)
    expect(captured.current?.isTransforming).toBe(true)

    fireEvent.keyDown(document.body, { code: 'Space' })

    expect(captured.current?.isAnimating).toBe(false)
    expect(captured.current?.isTransforming).toBe(false)
  })

  it('resets isTransforming after fitToView even while pan mode is active', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] })
    renderHarness()

    const wrapper = captured.current?.wrapper
    const container = captured.current?.container
    if (!wrapper || !container) throw new Error('refs not captured')
    Object.defineProperty(container, 'scrollWidth', { value: 1000, configurable: true })
    Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true })
    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
      width: 800,
      height: 600,
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    fireEvent.keyDown(document.body, { code: 'Space' })
    act(() => {
      captured.current?.fitToView({ duration: 500 })
    })
    expect(captured.current?.isTransforming).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(captured.current?.isTransforming).toBe(false)
  })

  it('resets isTransforming after centerOnElement even while pan mode is active', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] })
    renderHarness()

    const wrapper = captured.current?.wrapper
    const container = captured.current?.container
    if (!wrapper || !container) throw new Error('refs not captured')
    Object.defineProperty(container, 'scrollWidth', { value: 1000, configurable: true })
    Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true })
    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
      width: 800,
      height: 600,
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      width: 1000,
      height: 1000,
      left: 0,
      top: 0,
      right: 1000,
      bottom: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    const target = document.createElement('div')
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 100,
      left: 10,
      top: 10,
      right: 110,
      bottom: 110,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    })

    fireEvent.keyDown(document.body, { code: 'Space' })
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

  it('removes window listeners on unmount', () => {
    const { unmount } = renderHarness()

    unmount()

    // Dispatching after unmount must not throw and must not update state
    fireEvent.keyDown(document.body, { code: 'Space' })
    expect(captured.current?.isPanning).toBe(false)
  })
})
