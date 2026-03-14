# COMPONENTS

**Generated:** 2026-02-21

## OVERVIEW

React components organized by responsibility: smart container components at root, bracket visualization in `bracket/`, reusable UI primitives in `ui/`.

## STRUCTURE

```
src/components/
├── *.tsx                    # Smart container components (business logic)
├── bracket/                 # Bracket visualization system
│   ├── index.ts             # Barrel exports
│   ├── heat-boxes/          # Heat display components
│   ├── sections/            # Bracket section layouts
│   └── *.tsx                # SVG connectors, zoom, paths
└── ui/                      # Reusable UI primitives
    ├── button.tsx           # CVA-based variants
    ├── input.tsx            # Form inputs
    ├── modal.tsx            # Dialog overlay
    └── ...
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add pilot form | `add-pilot-form.tsx` | React Hook Form + Zod validation |
| CSV import | `csv-import.tsx` | PapaParse, drag & drop, duplicate handling |
| Heat assignment | `heat-assignment-view.tsx` | @dnd-kit drag & drop, shuffle |
| Placement entry | `placement-entry-modal.tsx` | Click-to-rank, lap time input |
| Victory screen | `victory-ceremony.tsx` | Podium display, CSV export |
| Bracket tree | `bracket/BracketTree.tsx` | Main bracket container, zoom/pan |
| Heat boxes | `bracket/heat-boxes/` | Empty, filled, base variants |
| Bracket sections | `bracket/sections/` | Quali, WB, LB, Grand Finale |
| UI primitives | `ui/*.tsx` | Button, Input, Modal, Label |
| Barrel exports | `bracket/index.ts` | Public API for bracket components |

## CONVENTIONS

**Smart Components (Root Level):**
- Use hooks from `@/hooks/` for data access
- Import stores from `@/stores/`
- Handle user interactions, modals, forms
- Business logic delegation to `src/lib/`

**UI Components (`ui/`):**
- Use `class-variance-authority` for variants
- Beamer-optimized: min 48px touch targets
- Forward refs, support all HTML attributes
- Synthwave theme classes: `neon-pink`, `neon-cyan`, `void`, `night`

**Bracket Components (`bracket/`):**
- Barrel export via `index.ts`
- SVG-based connectors and pilot paths
- Zoom/pan via `useZoomPan` hook
- Heat boxes: composable variants (empty, filled)

**Styling Patterns:**
- Tailwind classes for layout
- `font-ui` for UI text, `font-display` for headers
- Glow effects: `shadow-glow-pink`, `shadow-glow-cyan`
- Borders: `border-3` convention (not standard `border-4`)

## ANTI-PATTERNS

- **No direct store imports in UI primitives** - UI components receive data via props
- **No business logic in heat-boxes** - Pure presentation components
- **No `any` types** - Strict TypeScript enforced
- **No default exports** - Named exports only
- **No inline styles** - Tailwind classes only
