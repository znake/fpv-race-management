# Draft: Pilot Avatar Path Connections

## Requirements (confirmed)
- Paths should connect pilot avatars instead of heat boxes
- Lines should start a few pixels to the side of the avatar, then curve elegantly
- Direction awareness: exit/enter from appropriate side based on layout

## Current Implementation Analysis

### PathSegment Interface (pilot-path-manager.ts:3-7)
```typescript
export interface PathSegment {
  fromHeatId: string
  toHeatId: string
  isElimination: boolean
}
```
- Currently returns heat IDs only, no pilot information in segment

### SVGPilotPaths Position Calculation (lines 99-114)
```typescript
const fromPos = getPosition(segment.fromHeatId)  // Gets HEAT element
const toPos = getPosition(segment.toHeatId)

const startX = fromPos.centerX
const startY = fromPos.bottom     // Bottom of heat box
const endX = toPos.centerX
const endY = toPos.top            // Top of heat box

// Quadratic bezier - vertical curve
const d = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`
```

### Avatar Elements (BracketHeatBox.tsx:136-143)
```tsx
<img 
  className="pilot-avatar"    // NO id attribute
  src={pilot.imageUrl || FALLBACK_PILOT_IMAGE}
  alt={pilot.name}
  ...
/>
```

### FilledBracketHeatBox Issue
- Line 103: `<div className={boxClasses} onClick={onClick}>` - NO `id` attribute!
- BracketHeatBox has `id={heat.id}` but FilledBracketHeatBox doesn't
- May need to be addressed if paths should work with this component

## Technical Decisions (to confirm)
- Avatar ID format: `${heatId}-pilot-${pilotId}` (unique per heat-pilot combo)
- PathSegment will include: `fromElementId`, `toElementId`, `pilotId`

## Open Questions
1. Direction logic: How to determine left vs right exit/entry?
2. Offset distance: How many pixels to the side? (suggest: 8-12px)
3. Cubic vs Quadratic Bezier: More elegant curves with cubic?
4. FilledBracketHeatBox: Does it need the heat.id fix?

## Scope Boundaries
- INCLUDE: BracketHeatBox, FilledBracketHeatBox, pilot-path-manager, SVGPilotPaths
- EXCLUDE: Other components, styling changes beyond what's needed
