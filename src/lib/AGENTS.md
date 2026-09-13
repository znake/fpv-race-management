# src/lib KNOWLEDGE BASE

**Generated:** 2026-09-13

## OVERVIEW

Pure TypeScript business logic for double-elimination bracket management, heat generation, and data processing. No React, no store imports.

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Bracket type inference | `bracket-logic.ts` | `inferBracketType()`, `getPilotBracketOrigin()` |
| Heat creation from pools | `bracket-logic.ts` | `createWBHeatFromPool()`, `createLBHeatFromPool()` |
| Heat completion / next heats | `heat-completion.ts` | `processRankingsByBracket()`, `generateNextHeats()` — 900+ LOC, order-sensitive |
| Bracket layout math | `bracket-layout-calculator.ts` | `calculateBracketDimensions()` for 8–60 pilots |
| Channel assignment | `channel-assignment.ts` | `optimizePilotOrder()` — Raceband R1/R3/R6/R8 |
| Pilot paths | `pilot-path-manager.ts` | `calculatePilotPath()`, `assignPilotColor()` |
| SVG connectors | `svg-connector-manager.ts` | `ConnectorManager` class |
| CSV parsing | `csv-parser.ts` | PapaParse wrapper + validation |
| Export/Import | `export-import.ts` | JSON backup, CSV results; hand-rolled guards |
| HTML bracket export | `export-bracket-html.ts` | Self-contained HTML export |
| Heat distribution | `heat-distribution.ts` | 3er/4er split for 7–60 pilots |
| UI helpers | `ui-helpers.ts` | Rank badges, lap-time format/parse |
| Constants | `bracket-constants.ts` | `HEAT_ID_PREFIXES`, pool/ranking thresholds |
| Schemas / domain types | `schemas.ts` | Zod + canonical `Pilot`/`Ranking`/`HeatResults` |
| Shared utils | `utils.ts` | `cn`, `debounce`, `shuffleArray` |
| Demo data | `demo-data.ts` | `DEMO_PILOTS`, `loadDemoPilots()` |

## CONVENTIONS

- **Pure functions only** — no side effects, no React hooks, no store imports; pass state as parameters.
- **Immutable data** — return new arrays/objects, never mutate inputs.
- **Type guards** — `isValidHeat()`, `isValidPilot()` (hand-rolled in `export-import.ts`).
- **Heat IDs** — always build from `HEAT_ID_PREFIXES`; never hardcode `wb-`/`lb-`.
- **German comments** with user-story markers ("Story 1.6", "US-2.1 AC1").

## ANTI-PATTERNS

- **No hardcoded bracket ID strings** — use `HEAT_ID_PREFIXES`.
- **No mutating Sets in place** — create `new Set(existing)`. *Drift:* `heat-completion.ts` mutates Sets intentionally.
- **No `crypto.randomUUID()` directly** — use a helper. *Drift:* the store calls it directly.
- **No React or store imports** — these are pure logic files.

## TESTS

Covered directly: `bracket-logic`, `heat-completion`, `channel-assignment`, `pilot-path-manager`, `ui-helpers`, `csv-parser`, `utils`, `export-import`, `export-bracket-html`.
Indirect: `heat-distribution` (via store tests). No coverage path: `bracket-constants`, `demo-data`.
