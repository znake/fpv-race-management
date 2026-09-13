# UI COMPONENTS KNOWLEDGE BASE

**Domain**: Reusable UI primitives for FPV Racing Heats

## OVERVIEW

Generic presentation components (Shadcn/ui style) using `cn()` (`tailwind-merge` + `clsx`). No business logic, no store access.

## STRUCTURE

```
src/components/ui/
├── button.tsx       # CVA variants (default, destructive, outline, ghost, link)
├── input.tsx        # Focus-ring form input
├── label.tsx        # peer-disabled form label
├── modal.tsx        # Backdrop, escape, focus trap
├── pilot-avatar.tsx # Circular avatar + fallback image
├── rank-badge.tsx   # 1st–4th badges (gold/silver/bronze/cyan)
└── heat-card.tsx    # Multi-variant card — see NOTES
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Class merging | `cn()` in `@/lib/utils` | `clsx` + `tailwind-merge` |
| Button variants | `button.tsx` | CVA, 6 variants / 4 sizes |
| Modal sizing | `modal.tsx` | sm → full |
| Avatar fallback | `pilot-avatar.tsx` | `FALLBACK_PILOT_IMAGE` from `@/lib/ui-helpers` |
| Rank colors | `rank-badge.tsx` | Gold, Silver, Bronze, Cyan |
| Heat variants | `heat-card.tsx` | empty, bracket, filled, overview, detail |

## CONVENTIONS

**Component pattern** (Shadcn/ui style):
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Component = React.forwardRef<HTMLElement, Props>(
  ({ className, ...props }, ref) => (
    <element ref={ref} className={cn("base-classes", className)} {...props} />
  )
)
Component.displayName = "Component"
```

- **CVA for variants** (`cva` + `VariantProps`, `defaultVariants`).
- **Beamer sizing**: min 48px touch target; `text-beamer-body` … `text-beamer-display`.
- **Import directly** — no barrel in this directory.

## ANTI-PATTERNS

- **No business logic** in UI components (use containers/hooks).
- **No direct store access** — pass data via props.
- **No `as any`** — strict TypeScript required.
- **No hardcoded colors / inline styles** — Tailwind theme tokens via `cn()` only.

## NOTES

- `heat-card.tsx` is 773 LOC (84% of this directory) — a multi-variant composite, not a true primitive; candidate for reclassification.
