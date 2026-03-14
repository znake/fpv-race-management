# UI COMPONENTS KNOWLEDGE BASE

**Domain**: Reusable UI primitives for FPV Racing Heats

## OVERVIEW

Generic, dumb components using Shadcn/ui patterns with `tailwind-merge` + `clsx` via the `cn()` utility. No business logic, only presentation.

## STRUCTURE

```
src/components/ui/
├── button.tsx       # CVA-based variants (default, destructive, outline, ghost, link)
├── input.tsx        # Form input with focus ring styling
├── label.tsx        # Form label with peer-disabled support
├── modal.tsx        # Dialog with backdrop, escape key, focus trap
├── pilot-avatar.tsx # Circular avatar with fallback image
├── rank-badge.tsx   # Placement badges (1st-4th) with medal colors
└── heat-card.tsx    # Multi-variant card (bracket, overview, detail, etc.)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Class merging | `cn()` in `@/lib/utils` | `clsx` + `tailwind-merge` |
| Button variants | `button.tsx` | CVA with 6 variants, 4 sizes |
| Modal sizing | `modal.tsx` | sm, md, lg, xl, 2xl, full |
| Avatar fallback | `pilot-avatar.tsx` | `FALLBACK_PILOT_IMAGE` from `@/lib/ui-helpers` |
| Rank colors | `rank-badge.tsx` | Gold, Silver, Bronze, Cyan |
| Heat variants | `heat-card.tsx` | empty, bracket, filled, overview, detail |

## CONVENTIONS

**Component Pattern** (Shadcn/ui style):
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

**CVA for Variants** (see `button.tsx`):
```tsx
import { cva, type VariantProps } from "class-variance-authority"

const variants = cva("base-classes", {
  variants: { variant: { ... }, size: { ... } },
  defaultVariants: { variant: "default", size: "default" }
})
```

**Beamer-Optimized Sizes**:
- Min touch target: 48px (AC4 compliance)
- Font sizes: `text-beamer-body`, `text-beamer-caption` (custom Tailwind)

## ANTI-PATTERNS

- **No business logic** in UI components (use containers/hooks)
- **No direct store access** - pass data via props
- **No `as any`** - strict TypeScript required
- **No hardcoded colors** - use Tailwind theme tokens (neon-cyan, winner-green, etc.)
- **No inline styles** - Tailwind classes only via `cn()`
