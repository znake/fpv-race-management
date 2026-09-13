# src/hooks KNOWLEDGE BASE

**Generated:** 2026-09-13

## OVERVIEW

Custom React hooks. `usePilots` is the intended facade over the store; `useZoomPan` drives the bracket canvas.

## WHERE TO LOOK

| Hook | File | Notes |
|------|------|-------|
| `usePilots()` | `usePilots.ts` | Pilot CRUD facade over `useTournamentStore` (Zod validation, duplicate confirm, optimistic rollback, CSV batch import) |
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

- **No business logic** in hooks — delegate to `src/lib`.
- **No whole-store subscriptions** — select narrowly.
- **Don't duplicate pilot CRUD** — go through `usePilots`.
