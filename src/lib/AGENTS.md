# src/lib KNOWLEDGE BASE

**Generated:** 2026-02-21

## OVERVIEW

Pure TypeScript business logic for double-elimination tournament bracket management, heat generation, and data processing. No React dependencies.

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Bracket type inference | `bracket-logic.ts` | `inferBracketType()`, `getPilotBracketOrigin()` |
| Heat generation from pools | `bracket-logic.ts` | `createWBHeatFromPool()`, `createLBHeatFromPool()` |
| Heat completion processing | `heat-completion.ts` | `processRankingsByBracket()`, `generateNextHeats()` |
| Bracket layout calculations | `bracket-layout-calculator.ts` | `calculateBracketDimensions()` for 8-60 pilots |
| Channel assignment | `channel-assignment.ts` | `optimizePilotOrder()` for Raceband R1/R3/R6/R8 |
| CSV parsing | `csv-parser.ts` | PapaParse wrapper with validation |
| Export/Import | `export-import.ts` | JSON backup, CSV results export |
| Heat distribution | `heat-distribution.ts` | Calculate 3er/4er-Heat split for 7-60 pilots |
| UI helpers | `ui-helpers.ts` | Rank badges, lap time formatting, heat borders |
| Constants | `bracket-constants.ts` | Heat ID prefixes, pool thresholds |
| Schemas | `schemas.ts` | Zod validation, TypeScript interfaces |

## CONVENTIONS

- **Pure functions only** - No side effects, no React hooks
- **Immutable data** - Return new arrays/objects, never mutate inputs
- **FIFO pools** - `Set<string>` for winnerPool/loserPool, convert to Array for ordering
- **Heat ID prefixes** - Use `HEAT_ID_PREFIXES` constants, never hardcode strings
- **Type guards** - `isValidHeat()`, `isValidPilot()` for runtime validation

## ANTI-PATTERNS

- **No direct crypto.randomUUID()** - Use `generateId(prefix)` from `utils.ts`
- **No hardcoded bracket strings** - Always use `HEAT_ID_PREFIXES` constants
- **No mutating Sets in place** - Create new Sets: `new Set(existing)`
- **No React imports** - These are pure logic files
- **No store imports** - Pass state as parameters, do not import from stores
