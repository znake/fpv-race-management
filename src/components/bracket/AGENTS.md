# Bracket Components

**Generated:** 2026-09-13

## OVERVIEW

Double-elimination bracket visualization: zoom/pan canvas (`useZoomPan`), SVG connector lines, and pilot path tracking. Only `BracketTree.tsx` and `PilotPathToggle.tsx` touch the store; sections/boxes are prop-driven.

## STRUCTURE

```
src/components/bracket/
├── heat-boxes/
│   └── BracketHeatBox.tsx      # Sole heat-box variant (140/120/180px)
├── sections/
│   ├── BracketSection.tsx      # Generic WB/LB columns by round
│   ├── QualiSection.tsx        # Qualification row (horizontal)
│   ├── GrandFinaleSection.tsx  # Centered finale layout
│   └── GrandFinaleHeatBox.tsx  # Special 4-pilot finale box
├── BracketTree.tsx             # Main container (535 LOC), zoom/pan orchestrator
├── SVGConnectorLines.tsx       # Lines between heats
├── SVGPilotPaths.tsx           # Pilot journey visualization
├── PilotPathToggle.tsx         # Toggle for paths (store-touching)
├── ZoomIndicator.tsx           # Zoom level display
├── types.ts                    # BracketHeatBoxProps, BracketType, …
└── index.ts                    # Barrel exports
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Main rendering / composition | `BracketTree.tsx` | Zoom/pan container; only store-touching bracket file |
| WB / LB columns | `sections/BracketSection.tsx` | `type` prop: `'winner' \| 'loser'`, groups by round |
| Qualification row | `sections/QualiSection.tsx` | Horizontal, flow indicator to WB/LB |
| Grand Finale | `sections/GrandFinaleSection.tsx` + `GrandFinaleHeatBox.tsx` | Centered, 180px gold box |
| Heat box | `heat-boxes/BracketHeatBox.tsx` | Sorts by rank, channel + rank badges, LIVE state |
| SVG connections | `SVGConnectorLines.tsx` | Uses `heatRefsMap` + `ConnectorManager` |
| Pilot paths | `SVGPilotPaths.tsx` | Toggle with `P` key / `PilotPathToggle` |
| Prop contracts | `types.ts` | `BracketType`, `BracketHeatBoxProps`, … |

## CONVENTIONS

- **Heat box sizing:** 140px standard, 120px 3-pilot, 180px Grand Finale.
- **Bracket colors:** Quali cyan, WB green, LB red, Grand Finale gold.
- **Status:** active = animated border + `shadow-glow-pink` + "LIVE"; completed = rank badges (1 gold, 2 silver, 3 bronze, 4 cyan).
- **Pilot rows:** rank 1–2 `top` (green), 3–4 `bottom` (red), GF winner `champ`.
- **Channels:** position 0→R1, 1→R3, 2→R6, 3→R8.
- **Barrel** exports `BracketTree`, `* from './types'`, `BracketHeatBox`, `BracketSection`, `GrandFinaleSection`, `GrandFinaleHeatBox`, `SVGConnectorLines`. `QualiSection`, `SVGPilotPaths`, `PilotPathToggle`, `ZoomIndicator` are internal-only.

## ANTI-PATTERNS

- **No heat mutation in components** — use store actions via props.
- **No SVG line math in render** — use memoized connector data.
- **No hardcoded pixels** — use `bracket-layout-calculator` functions.
- **No pilot fetching in sections/boxes** — pilots passed via props from `BracketTree`.
- **`GrandFinaleSectionProps` is duplicated** in `types.ts` and `GrandFinaleSection.tsx` (local one is authoritative) — keep in sync or delete the stale copy.
