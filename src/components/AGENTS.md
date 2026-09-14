# COMPONENTS

**Generated:** 2026-09-13

## OVERVIEW

Root = smart container components (store access, forms, modals). `bracket/` = bracket visualization. `ui/` = reusable primitives. No barrel at root — import files directly.

## STRUCTURE

```
src/components/
├── *.tsx                    # Smart containers (business logic)
├── bracket/                 # Bracket visualization (has barrel)
│   ├── index.ts
│   ├── heat-boxes/          # bracket-heat-box.tsx (sole variant)
│   ├── sections/            # Quali / WB-LB / Grand Finale layouts
│   └── *.tsx                # BracketTree, SVG connectors, pilot paths
└── ui/                      # Reusable UI primitives (no barrel)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add pilot form | `add-pilot-form.tsx` | React Hook Form + Zod |
| CSV import | `csv-import.tsx` | PapaParse, drag & drop, duplicates |
| Heat assignment | `heat-assignment-view.tsx` | @dnd-kit drag & drop, shuffle |
| Placement entry | `placement-entry-modal.tsx` | Click-to-rank + lap-time state machine (540 LOC) |
| Heat detail | `heat-detail-modal.tsx` | Completed-heat view, reopen |
| Heat card | `heat-card.tsx` | Single-variant (`overview`) pure-props card used only by the heat-assignment view (177 LOC) |
| Victory screen | `victory-ceremony.tsx` | Podium, CSV export |
| Bracket tree | `bracket/bracket-tree.tsx` | Main container, zoom/pan |
| Heat box | `bracket/heat-boxes/bracket-heat-box.tsx` | Sole variant (140/120/180px) |
| Bracket sections | `bracket/sections/` | See `bracket/AGENTS.md` |
| UI primitives | `ui/*.tsx` | Import directly (no barrel) |

## CONVENTIONS

**Smart containers (root + a few bracket files):**
- May call `useTournamentStore(selector)`. Store-touching components: `App.tsx`, `bracket/bracket-tree.tsx`, `heat-detail-modal.tsx`, `heat-assignment-view.tsx`.
- Prefer `src/hooks/usePilots.ts` for pilot CRUD.
- Business logic belongs in `src/lib/`, not components.

**UI primitives (`ui/`):**
- CVA for variants; `forwardRef` + `displayName`; `cn()` for classes.
- Beamer min 48px touch targets. Synthwave tokens only.

**Styling:** `font-ui` for UI text, `font-display` for headers; `shadow-glow-*`; `border-3` (not `border-4`).

## ANTI-PATTERNS

- **No store imports in `ui/` or heat-boxes** — presentation only, data via props.
- **No business logic in components** — delegate to `src/lib/`.
- **No `any` / default exports / inline styles**.
- **Don't add a root barrel** — only `bracket/index.ts` exists by design.

## NOTES

- `heat-card.tsx` is a single-variant (`overview`) pure-props card used only by the heat-assignment view (177 LOC).
