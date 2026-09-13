import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, cleanup, act } from '@testing-library/react'
import { useEffect } from 'react'
import { useZoomPan, type ZoomPanState } from '@/hooks/useZoomPan'

interface Snapshot {
  state: ZoomPanState
  isPanning: boolean
  isAnimating: boolean
  isTransforming: boolean
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
    animateToState,
    wrapperRef,
    containerRef,
  } = useZoomPan()

  useEffect(() => {
    capture({ state, isPanning, isAnimating, isTransforming, animateToState })
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

  it('cancels a running animation when Space pan mode starts', () => {
    renderHarness()

    act(() => {
      captured.current?.animateToState({ scale: 2, translateX: 0, translateY: 0 })
    })
    expect(captured.current?.isAnimating).toBe(true)

    fireEvent.keyDown(document.body, { code: 'Space' })

    expect(captured.current?.isAnimating).toBe(false)
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
