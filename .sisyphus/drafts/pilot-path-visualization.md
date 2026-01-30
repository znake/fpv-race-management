# Draft: Pilot Path Visualization Toggle

## Requirements (confirmed)

### Core Feature
- Toggle to show/hide pilot progression paths through the tournament
- Visualize complete journey: Quali → WB/LB → Grand Finale (incl. Rematch)
- All pilots get paths when toggle is enabled

### Visual Design
- **Line style**: Bezier curves (sanft gebogen, filigran)
- **Arrow tips**: Small arrow tips at end of each segment
- **Eliminated pilots**: X marker instead of arrow tip (path ends there)
- **Colors**: Synthwave palette based on existing design colors
- **Color assignment**: Each pilot gets ONE fixed color for their entire path
- **Line thickness**: Thin, filigree lines

### Hover Interaction
- When hovering over a pilot OR their path line:
  - That pilot's path is highlighted
  - All other paths fade/dim

### Technical Decisions
- **SVG Layer**: Separate SVG layer (not same as heat connectors)
  - Reason: Easy toggle on/off, no z-index conflicts, cleaner separation
- **Toggle component**: Radix UI Switch (existing pattern)
- **Toggle position**: Floating UI element near zoom buttons (bottom right)
- **State storage**: Zustand store with localStorage persist

## Research Findings

### Existing Infrastructure (from explore agents)
- `SVGConnectorLines.tsx` - existing SVG connector implementation
- `ConnectorManager` class for managing SVG connections
- `bracket-layout-calculator.ts` - layout calculations available
- `getPilotBracketOrigin()` in `bracket-logic.ts` - can trace pilot history
- Radix UI Switch available (`@radix-ui/react-switch`)
- Zustand store with persist middleware

### Tournament Structure (from tournament-rules.md)
- Quali: Top 2 → WB, Bottom 2 → LB
- WB: Win → next WB round, Lose → LB
- LB: Win → next LB round, Lose → Eliminated
- Grand Finale: 2 from WB Finale + 2 from LB Finale
- Rematch rule: LB pilot on 1st/2nd vs WB pilot on 3rd/4th → 1v1

## Open Questions
- Test strategy: TDD or manual verification?

## Scope Boundaries
- INCLUDE: All bracket types (Quali, WB, LB, GF, Rematch)
- INCLUDE: Hover highlighting
- INCLUDE: Persistent toggle state
- EXCLUDE: Path filtering by individual pilot (all or nothing)
- EXCLUDE: Animation of paths appearing
