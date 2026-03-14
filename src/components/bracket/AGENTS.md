# Bracket Components

**Generated:** 2026-02-21

## OVERVIEW

Double-elimination tournament bracket visualization with zoom/pan canvas, SVG connector lines, and pilot path tracking.

## STRUCTURE

```
src/components/bracket/
├── heat-boxes/          # Heat box variants
│   ├── BracketHeatBox.tsx      # Main heat display component
│   ├── EmptyBracketHeatBox.tsx # Placeholder for pending heats
│   └── FilledBracketHeatBox.tsx # Completed heat with results
├── sections/              # Bracket section layouts
│   ├── BracketSection.tsx       # Winner/Loser bracket columns
│   ├── QualiSection.tsx         # Qualification heats (horizontal)
│   ├── GrandFinaleSection.tsx   # Grand finale layout
│   └── GrandFinaleHeatBox.tsx   # Special 4-pilot finale box
├── BracketTree.tsx        # Main container with zoom/pan
├── SVGConnectorLines.tsx  # SVG lines connecting heats
├── SVGPilotPaths.tsx      # Pilot journey visualization
├── PilotPathToggle.tsx    # Toggle control for paths
├── ZoomIndicator.tsx      # Zoom level display
├── PoolDisplay.tsx        # Pool indicator between rounds
├── types.ts               # Component-specific types
└── index.ts               # Barrel exports
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Main bracket rendering | `BracketTree.tsx` | Zoom/pan container, orchestrates all sections |
| Heat box styling | `heat-boxes/BracketHeatBox.tsx` | 140px standard, 120px for 3-pilot, 180px finale |
| Winner/Loser columns | `sections/BracketSection.tsx` | Side-by-side layout with round grouping |
| Qualification row | `sections/QualiSection.tsx` | Horizontal layout at top |
| Grand Finale | `sections/GrandFinaleSection.tsx` | Centered below WB/LB |
| SVG connections | `SVGConnectorLines.tsx` | Lines between heats, uses getHeatConnections() |
| Pilot paths | `SVGPilotPaths.tsx` | Toggle with `P` key or PilotPathToggle |
| Type definitions | `types.ts` | BracketHeatBoxProps, BracketType union |

## CONVENTIONS

**Heat Box Sizing:**
- Standard: 140px width (`heat-box` class)
- 3-pilot heats: 120px (`three-pilot` class)
- Grand Finale: 180px (`gf` class)

**Bracket Type Colors:**
- Qualification: Cyan (`quali` class)
- Winner Bracket: Green (`wb` class)
- Loser Bracket: Red (`lb` class)
- Grand Finale: Gold (`gf` class)

**Status Indicators:**
- Active heats: Animated border + glow (`heat-live-border`, `shadow-glow-pink`)
- Live indicator text: "LIVE" badge
- Completed: Rank badges (1=gold, 2=silver, 3=bronze, 4=cyan)

**Pilot Row Styling:**
- Rank 1-2: Green background (`top` class)
- Rank 3-4: Red background (`bottom` class)
- Grand Finale winner: Champion styling (`champ` class)

**Channel Assignment:**
- Position 0: R1, Position 1: R3, Position 2: R6, Position 3: R8
- Displayed as badges on pilot rows

## ANTI-PATTERNS

- **No direct heat mutation** - Always use store actions via props
- **No SVG line calculations in render** - Use memoized connector data
- **No hardcoded pixel values** - Use layout calculator functions
- **No pilot data fetching in components** - Pilots passed via props from store
