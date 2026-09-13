# Bracket Components

Double-elimination bracket visualization: zoom/pan canvas (`useZoomPan`), SVG connector lines, and pilot path tracking. Only `bracket-tree.tsx` touches the store; sections, boxes, and the path toggle are prop-driven.

## Structure

```
src/components/bracket/
├── heat-boxes/bracket-heat-box.tsx
├── sections/
│   ├── bracket-section.tsx
│   ├── quali-section.tsx
│   ├── grand-finale-section.tsx
│   └── grand-finale-heat-box.tsx
├── bracket-tree.tsx
├── svg-connector-lines.tsx
├── svg-pilot-paths.tsx
├── pilot-path-toggle.tsx
├── zoom-indicator.tsx
├── types.ts
└── index.ts                    # Barrel exports only BracketTree
```

## Where To Look

| Task | Location | Notes |
|------|----------|-------|
| Main rendering / composition | `bracket-tree.tsx` | Zoom/pan container; only store-touching bracket file |
| WB / LB columns | `sections/bracket-section.tsx` | Groups by round |
| Qualification row | `sections/quali-section.tsx` | Horizontal, flow indicator to WB/LB |
| Grand Finale | `sections/grand-finale-section.tsx` + `grand-finale-heat-box.tsx` | Centered, 180px gold box |
| Heat box | `heat-boxes/bracket-heat-box.tsx` | Sorts by rank, channel + rank badges, LIVE state |
| SVG connections | `svg-connector-lines.tsx` | Uses `heatRefsMap` + `ConnectorManager` |
| Pilot paths | `svg-pilot-paths.tsx` | Toggle with `P` key / `pilot-path-toggle` |

## Conventions

- **Heat box sizing:** 140px standard, 120px 3-pilot, 180px Grand Finale.
- **Bracket colors:** Quali cyan, WB green, LB red, Grand Finale gold.
- **Status:** active = animated border + `shadow-glow-pink` + "LIVE"; completed = rank badges (1 gold, 2 silver, 3 bronze, 4 rank-4 dark red).
- **Pilot rows:** rank 1-2 `top` (green), 3-4 `bottom` (red), GF winner `champ`.
- **Channels:** position 0->R1, 1->R3, 2->R6, 3->R8.
- **Barrel** exports only `BracketTree`; `types.ts` remains available for deep imports.

## Anti-Patterns

- **No heat mutation in components** - use store actions via props.
- **No SVG line math in render** - use memoized connector data.
- **No hardcoded pixels** - use `bracket-layout-calculator` functions.
- **No pilot fetching in sections/boxes** - pilots passed via props from `BracketTree`.
- `GrandFinaleSectionProps` is defined locally in `grand-finale-section.tsx`.
