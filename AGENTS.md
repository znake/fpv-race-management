# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-21
**Commit:** 8b96754
**Branch:** main

## OVERVIEW

FPV Racing Heats — Turnierverwaltung für FPV-Drohnenrennen mit Double-Elimination-Bracket. React 18 + TypeScript + Vite + Tailwind CSS (Synthwave Theme).

## COMMANDS

```bash
# Development
npm run dev           # Dev server (port 5173)

# Building
npm run build         # Production build (tsc + vite build)
npm run preview       # Preview production build

# Testing
npm test              # Vitest watch mode
npm run test:ui       # Vitest with UI browser
npm test -- run       # Run tests once (CI mode)
npm test -- src/lib/bracket-logic.test.ts        # Single file
npm test -- src/lib/bracket-logic.test.ts -t     # Single test pattern
npm test -- src/lib/bracket-logic.test.ts -t "inferBracketType"

# Linting
npm run lint          # ESLint check (--max-warnings 0)
```

## STRUCTURE

```
./
├── src/
│   ├── components/     # React components
│   │   ├── bracket/    # Bracket visualization
│   │   └── ui/         # Reusable UI components
│   ├── lib/            # Business logic & utilities
│   ├── stores/         # Zustand state management
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript definitions
│   └── App.tsx         # Main component
├── tests/              # Test files & fixtures
├── docs/               # Documentation
└── public/             # Static assets
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Bracket logic | `src/lib/bracket-*.ts` | Double-elimination algorithm |
| State management | `src/stores/` | Zustand stores |
| UI components | `src/components/ui/` | Reusable primitives |
| Tests | `tests/` | Centralized test directory |
| CSV import | `src/components/csv-import.tsx` | PapaParse integration |

## CODE STYLE GUIDELINES

### Imports

```typescript
// Path alias for src/ imports
import { something } from '@/lib/utils'
import type { Heat } from '@/types'

// Relative imports for local files
import { MyType } from './schemas'
import { helperFn } from '../lib/utils'

// Group imports: external → alias → relative
import React from 'react'
import { z } from 'zod'
import type { Pilot } from '@/types'
import type { MyLocalType } from './types'
import { localHelper } from './helpers'
```

### TypeScript

- **Strict mode enforced**: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- **Use `import type`** for type-only imports (saves bundle size)
- **Avoid `any`**: Never use `as any` or `@ts-ignore`
- **Type guards**: Create runtime validators like `isValidHeat(heat): heat is Heat`

### Naming Conventions

- **Files**: `kebab-case.ts` for logic, `PascalCase.tsx` for React components
- **Functions**: `camelCase`, verb prefix for actions (`getX`, `createY`, `processZ`)
- **Constants**: `UPPER_SNAKE_CASE` for config, `PascalCase` for classes/enums
- **Types/Interfaces**: `PascalCase`, suffix with `Type` only when ambiguous

### React Patterns

```typescript
// Functional components with explicit return types
export function MyComponent({ title }: MyComponentProps): React.JSX.Element {
  return <div>{title}</div>
}

// Event handlers typed
const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {}

// Use forwardRef for reusable UI components
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, children, ...props }, ref) => {
    return <button ref={ref} {...props}>{children}</button>
  }
)
```

### Error Handling

- **No empty catch blocks**: Always handle or log errors
- **Use Result types**: Prefer returning `{ data, error }` over throwing
- **Zod validation**: Validate external input with Zod schemas

```typescript
// Good: Explicit error handling
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  return null
}
```

### CSS / Tailwind

- Use `clsx` + `tailwind-merge` (`twMerge`) for conditional classes
- Custom colors from theme: `text-neon-pink`, `bg-void`, `border-neon-cyan`
- Beamer-optimized sizes: `text-beamer-display` (48px), `text-beamer-heat` (36px)

## ANTI-PATTERNS (THIS PROJECT)

- **No `as any`** — Type safety required, no suppression
- **No `@ts-ignore`** — Strict mode enforced
- **No empty catch blocks** — All errors must be handled
- **No unused variables** — `noUnusedLocals` + `noUnusedParameters`
- **No store imports in UI components** — Pass via props/context

## CONVENTIONS

- **Path alias**: `@/*` → `src/*`
- **Test setup**: Vitest + jsdom, setup in `src/test/setup.ts`
- **Barrel exports**: `src/components/bracket/index.ts`
- **Tests location**: `/tests/` (not alongside source)

## UNIQUE STYLES

- **Synthwave Theme**: Custom Tailwind colors (void, night, neon-pink, neon-cyan)
- **Beamer-optimized**: Large fonts for projector display (16px-48px)
- **PWA-ready**: Installable as native app

## NOTES

- No CI/CD pipelines configured (manual build/deploy)
- Dockerfile present for containerization
- Dual licensing: PolyForm Noncommercial 1.0.0 (free) / Commercial (paid)