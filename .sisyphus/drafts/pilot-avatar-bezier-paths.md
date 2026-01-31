# Draft: Pilot Avatar Bezier Path Connections

## User Request Summary
Connect Bezier curves between individual pilot avatars instead of heat centers in the tournament bracket visualization.

## Requirements (confirmed)
- Bezier arrows start FROM pilot's avatar image in source heat
- Bezier arrows end AT pilot's avatar image in target heat
- Elegant curved paths (not straight lines)
- Small offset from avatar edges (left/right) before curving
- Must work with zoom/pan (scale compensation)
- Must handle pilots in different visual positions within heats
- Performance: Batch DOM reads to avoid layout thrashing

## Current State
- SVGPilotPaths.tsx draws curves from HEAT-CENTER to HEAT-CENTER
- FilledBracketHeatBox.tsx renders pilots with avatars inside heat boxes
- pilot-path-manager.ts calculates PathSegment (fromHeatId, toHeatId, isElimination)

## Technical Approach (pending research)
- Add unique IDs to pilot avatar elements: `pilot-avatar-{pilotId}-{heatId}`
- Enhance PathSegment to include pilotId
- Update SVGPilotPaths to find pilot avatar DOM elements
- Improve Bezier calculation for avatar-to-avatar curves

## Open Questions
1. What is the exact DOM structure of pilot avatars currently?
2. Does PathSegment already have access to pilotId?
3. How is bracket flow direction determined (left-to-right, right-to-left)?
4. Are there multiple bracket layouts to consider?

## Research Findings

### SVGPilotPaths.tsx (Current Implementation)
- Uses **Quadratic Bezier curves** (`Q` command in SVG path)
- Gets positions via `document.getElementById(heat.id)` + `getBoundingClientRect()`
- Divides by `scale` to normalize for zoom
- Draws from **bottom-center of "from" heat** to **top-center of "to" heat**
- Has SVG markers: `#pilot-arrow` (progression) and `#pilot-x` (elimination)
- Hover state highlights single pilot's path, dims others to 15% opacity

### FilledBracketHeatBox.tsx (Pilot Rendering)
- Pilots rendered in `.pilot-row-wrapper` > `.pilot-row` > `.pilot-avatar`
- **NO unique IDs on pilot elements** - only `key={pilot.id}` for React reconciliation
- Heat box has `data-testid={bracket-heat-${heatNumber}}` but nothing on avatars
- Channels determined by index in `bracketHeat.pilotIds` array

### PathSegment Interface (pilot-path-manager.ts)
```typescript
interface PathSegment {
  fromHeatId: string
  toHeatId: string
  isElimination: boolean
}
```
- **Does NOT include pilotId** - this must be added

### Zoom/Pan System
- `useZoomPan.ts` hook manages scale, translateX, translateY
- Applied via CSS `transform` on `#bracket-container`
- SVG layers compensate by dividing coordinates by scale

### Key Files Identified
- `/src/components/bracket/SVGPilotPaths.tsx` - Main path rendering
- `/src/lib/pilot-path-manager.ts` - Path segment calculation
- `/src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx` - Pilot avatar rendering
- `/src/components/bracket/BracketTree.tsx` - Parent orchestrator
- `/src/types/tournament.ts` - Heat interface
