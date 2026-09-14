# TESTS KNOWLEDGE BASE

**Domain**: Centralized Vitest suite for FPV Racing Heats

## OVERVIEW

All tests live here (never colocated). 32 test files: `*.test.ts` for logic/store, `*.test.tsx` for components. Shared fixtures in `helpers/`.

## STRUCTURE

```
tests/
├── helpers/
│   ├── mock-factories.ts # createMockPilot(), createMockPilots()
│   ├── store-helpers.ts  # resetTournamentStore(), setupRunningTournament()
│   └── index.ts          # Barrel
├── *.test.ts             # Logic / store tests
└── *.test.tsx            # Component tests (jsdom + @testing-library/react)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Mock pilots | `helpers/mock-factories.ts` | `createMockPilot()`, `createMockPilots(n)` |
| Store setup | `helpers/store-helpers.ts` | `resetTournamentStore()`, `setupRunningTournament()` |
| Bracket logic | `bracket-logic.test.ts` | Type inference, pools, heat generation |
| Bracket progression | `round-progression.test.ts`, `lb-*.test.ts`, `grand-finale-4-piloten.test.ts` | Via store |
| End-to-end flow | `eight-pilots-flow.test.ts` | 8-pilot tournament through store |
| Export/import | `export-import.test.ts`, `export-bracket-html.test.ts` | |
| Component tests | `*.test.tsx` | PlacementEntryModal, PilotCard, VictoryCeremony, AppFooter, BracketTree |
| Test config | `vite.config.ts` | Vitest + jsdom (no separate vitest.config) |
| Test setup | `src/test/setup.ts` | localStorage/alert/confirm/canvas mocks |

## CONVENTIONS

- **Reset store in `beforeEach`** — always `resetTournamentStore()`; state leaks otherwise.
- `resetMockPilotCounter()` keeps IDs predictable.
- `vi.mock()` for dependencies; helpers for data (no magic numbers).
- Matchers from `@testing-library/jest-dom/vitest`.
- Setup's global `beforeEach` clears localStorage and all mocks.

## ANTI-PATTERNS

- **Never skip store reset** — tests leak state without it.
- **No real network calls** — mock fetch/URL.
- **No unmocked localStorage** — use the setup mock.
- **No magic numbers** — use `createMockPilots(n)`.
- **No skipped tests** — fix or remove; never leave `.skip`.

## COVERAGE NOTES

Directly covered lib: `bracket-logic`, `heat-completion`, `channel-assignment`, `pilot-path-manager`, `utils`, `export-import`, `export-bracket-html`. `csv-parser` is exercised indirectly through component tests. `ui-helpers` has no direct test file. No coverage path: `bracket-constants`, `demo-data`.
