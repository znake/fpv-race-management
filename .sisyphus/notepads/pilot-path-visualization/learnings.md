# Learnings - Pilot Path Visualization

## Conventions & Patterns

### Pilot Path Calculation
- Pure functions for path calculation and color assignment implemented in `src/lib/pilot-path-manager.ts`.
- Deterministic color assignment uses `SYNTHWAVE_COLORS` palette.
- Elimination logic specifically checks for rank 3/4 in Loser Bracket heats.
- Path segments connect consecutive completed heats for a pilot.

## Store Extension for Pilot Paths
- Added `showPilotPaths` state and `togglePilotPaths` action to `tournamentStore.ts`.
- State is preserved during `performReset()` to maintain user preference.
- Persist middleware automatically handles localStorage synchronization.
- TDD approach: Tests in `tests/pilot-path-toggle.test.ts` verify default state, toggle logic, and persistence across resets.

## SVGPilotPaths Implementation
- **Bezier Curves**: Used quadratic bezier curves (`Q` command) for smooth path rendering.
  - Control point calculation: `midX` between start/end, `midY` biased towards start (0.5 factor) for a nice arc.
- **Markers**: Defined SVG markers for arrows and elimination 'X' in `<defs>`.
  - `pilot-arrow`: Standard triangle arrow.
  - `pilot-x`: Cross marker for elimination points.
- **Layering**: Component uses `zIndex: 2` to sit above standard connector lines (`zIndex: 1`).
- **DOM Sync**: Uses a 100ms delay (similar to `SVGConnectorLines`) to ensure DOM elements are ready before calculating positions.
- **Testing**: Mocked `getBoundingClientRect` in tests to verify path generation logic without a real browser layout engine.

## UI Components
- `PilotPathToggle`: Simple functional component using Tailwind for styling.
- Positioned at `bottom-20 right-4` to sit above the ZoomIndicator.
- Uses `fixed` positioning and `z-50` to ensure visibility over other elements.
- Connects directly to `useTournamentStore` for state and actions.
- Tested with Vitest and React Testing Library for rendering, interaction, and state reflection.

## Hover Interaction in SVGPilotPaths
- Implemented CSS-based highlighting for pilot paths using `hoveredPilotId` state.
- Added 50ms debounce to `onMouseEnter` and `onMouseLeave` to prevent flickering during rapid mouse movements.
- Paths now have `pointerEvents: 'auto'` and `cursor: 'pointer'` to receive hover events, while the parent SVG remains `pointerEvents: 'none'` to not block underlying elements.
- Used `opacity` and `strokeWidth` transitions (150ms) for smooth visual feedback.
- TDD approach: Created `tests/pilot-path-hover.test.tsx` to verify highlighting, fading, and debounce logic.

## Integration in BracketTree
- SVGPilotPaths is rendered as an absolute overlay within the zoom container, ensuring it scales and pans with the bracket.
- Visibility is controlled by both the store state (`showPilotPaths`) and the `disableConnectors` flag (used during Victory Ceremony).
- PilotPathToggle is placed next to the ZoomIndicator for consistent UI controls.
