# src/hooks KNOWLEDGE BASE

**Generated:** 2026-09-13

## OVERVIEW

Custom React hooks. `usePilots` is the intended facade over the store; `useZoomPan` drives the bracket canvas.

## WHERE TO LOOK

| Hook | File | Notes |
|------|------|-------|
| `usePilots()` | `usePilots.ts` | Pilot gateway over `useTournamentStore` with Zod validation, centralized duplicate policy, unified `PilotActionResult`, and CSV batch import |
| `useZoomPan(options)` | `useZoomPan.ts` | Zoom/pan engine — **726 LOC hotspot** |
| `useIsMobile()` | `useIsMobile.ts` | `matchMedia('(max-width: 768px)')` with SSR guard |

## useZoomPan

- Exports `UseZoomPanReturn`: state, refs, `zoomIn`/`zoomOut`/`reset`/`centerOnElement`/`fitToView`/`animateToState`, `isPanning`/`isDragging`/`isAnimating`/`isTransforming`.
- Four separate listener effects: wheel (Ctrl/Cmd = zoom, plain = pan), touch (1-finger pan, 2-finger pinch, 2→1 handoff), Space-key pan mode, pointer events.
- **Hazard**: effects depend on `state.scale/translateX/translateY`, so listeners re-attach on every transform — watch for stale closures.
- Uses `flushSync` + `requestAnimationFrame` + timeouts for animation; cancellation (`isPanning` cancels `isAnimating`) is fragile.

## CONVENTIONS

- Return typed objects/interfaces (see `ZoomPanState`, `UseZoomPanReturn`).
- Keep store access inside hooks or smart containers, not primitives.
- `usePilots` is the only hook wrapping the store — go through it for pilot CRUD.

## ANTI-PATTERNS

- Keep general business logic in `src/lib`, but retain pilot validation and duplicate-name policy in `usePilots` as the deliberate pilot gateway.
- **No whole-store subscriptions** — select narrowly.
- **Don't duplicate pilot CRUD** — go through `usePilots`.
