# TESTS KNOWLEDGE BASE

**Domain**: Test suite for FPV Racing Heats tournament management

## OVERVIEW

Centralized test directory with 23 test files covering double-elimination bracket logic, heat management, and UI components using Vitest and @testing-library.

## STRUCTURE

```
tests/
├── helpers/              # Test utilities
│   ├── mock-factories.ts # Pilot mock data generators
│   ├── store-helpers.ts  # Tournament store setup utilities
│   └── index.ts          # Barrel exports
├── *.test.ts            # Unit tests (logic, stores)
└── *.test.tsx           # Component tests (React)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Mock pilots | `tests/helpers/mock-factories.ts` | `createMockPilot()`, `createMockPilots()` |
| Store setup | `tests/helpers/store-helpers.ts` | `resetTournamentStore()`, `setupRunningTournament()` |
| Bracket logic | `tests/bracket-logic.test.ts` | Bracket type inference, pool helpers, pool-based heat generation |
| Component tests | `tests/*.test.tsx` | React component testing |
| Test config | `vite.config.ts` | Vitest + jsdom setup |
| Test setup | `src/test/setup.ts` | Mocks for localStorage, canvas, dialogs |

## CONVENTIONS

- **Framework**: Vitest with jsdom environment
- **Testing Library**: @testing-library/react for components
- **Mocking**: vi.mock() for dependencies, mock-factories for data
- **Store isolation**: Always call `resetTournamentStore()` in beforeEach
- **Counter reset**: Use `resetMockPilotCounter()` for predictable IDs
- **Naming**: `*.test.ts` for logic, `*.test.tsx` for components
- **Assertions**: Uses `@testing-library/jest-dom/vitest` matchers

## ANTI-PATTERNS

- **Never forget store reset** — Tests will leak state without `resetTournamentStore()`
- **No real network calls** — Mock all fetch/URL operations
- **No unmocked localStorage** — Use the provided mock in setup.ts
- **No magic numbers** — Use `createMockPilots(n)` for pilot counts
- **No skipped tests** — Either fix or remove, do not leave `.skip`
